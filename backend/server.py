from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI(title="ReviewFlow API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Business(BaseModel):
    model_config = ConfigDict(extra="ignore")
    business_id: str = Field(default_factory=lambda: f"biz_{uuid.uuid4().hex[:12]}")
    user_id: str
    name: str
    category: str = "Restaurant"
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    qr_code_id: str = Field(default_factory=lambda: uuid.uuid4().hex[:8])
    setup_completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BusinessCreate(BaseModel):
    name: str
    category: str = "Restaurant"
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None

class PlatformConnection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    connection_id: str = Field(default_factory=lambda: f"conn_{uuid.uuid4().hex[:12]}")
    business_id: str
    platform: str  # "google" or "facebook"
    status: str = "disconnected"  # connected, disconnected, error
    connected_at: Optional[datetime] = None
    last_sync: Optional[datetime] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str = Field(default_factory=lambda: f"rev_{uuid.uuid4().hex[:12]}")
    business_id: str
    platform: str  # google, facebook, direct
    author_name: str
    author_avatar: Optional[str] = None
    rating: int  # 1-5
    text: str
    sentiment: str = "neutral"  # positive, negative, neutral
    sentiment_score: float = 0.0
    response: Optional[str] = None
    responded_at: Optional[datetime] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    business_id: str
    platform: str = "direct"
    author_name: str
    rating: int
    text: str

class AIResponseRequest(BaseModel):
    review_text: str
    rating: int
    business_name: str
    tone: str = "professional"  # professional, friendly, apologetic

class ReviewResponse(BaseModel):
    review_id: str
    response_text: str

# ============ AUTH HELPERS ============

async def get_current_user(request: Request) -> User:
    """Get current user from session token in cookie or Authorization header"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange Emergent session_id for local session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent auth API
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        auth_data = resp.json()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
    else:
        # Create new user
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Remove old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    user_data = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture
    }
    
    return {"user": user_data, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}

# ============ BUSINESS ENDPOINTS ============

@api_router.post("/business", response_model=dict)
async def create_business(business_data: BusinessCreate, user: User = Depends(get_current_user)):
    """Create a new business for the current user"""
    # Check if user already has a business
    existing = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="User already has a business")
    
    business = Business(
        user_id=user.user_id,
        name=business_data.name,
        category=business_data.category,
        address=business_data.address,
        phone=business_data.phone,
        website=business_data.website
    )
    
    doc = business.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.businesses.insert_one(doc)
    
    # Create platform connections
    for platform in ["google", "facebook"]:
        conn = PlatformConnection(
            business_id=business.business_id,
            platform=platform
        )
        conn_doc = conn.model_dump()
        await db.platform_connections.insert_one(conn_doc)
    
    return {"business_id": business.business_id, "qr_code_id": business.qr_code_id}

@api_router.get("/business")
async def get_business(user: User = Depends(get_current_user)):
    """Get the current user's business"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        return None
    return business

@api_router.put("/business")
async def update_business(business_data: BusinessCreate, user: User = Depends(get_current_user)):
    """Update the current user's business"""
    result = await db.businesses.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "name": business_data.name,
            "category": business_data.category,
            "address": business_data.address,
            "phone": business_data.phone,
            "website": business_data.website
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    
    return {"message": "Business updated"}

@api_router.post("/business/complete-setup")
async def complete_setup(user: User = Depends(get_current_user)):
    """Mark business setup as complete"""
    result = await db.businesses.update_one(
        {"user_id": user.user_id},
        {"$set": {"setup_completed": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business not found")
    
    return {"message": "Setup completed"}

# ============ PLATFORM CONNECTION ENDPOINTS ============

@api_router.get("/platforms")
async def get_platforms(user: User = Depends(get_current_user)):
    """Get platform connections for user's business"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    connections = await db.platform_connections.find(
        {"business_id": business["business_id"]},
        {"_id": 0}
    ).to_list(10)
    
    return connections

@api_router.post("/platforms/{platform}/connect")
async def connect_platform(platform: str, user: User = Depends(get_current_user)):
    """Mock connect a platform (simulates OAuth flow)"""
    if platform not in ["google", "facebook"]:
        raise HTTPException(status_code=400, detail="Invalid platform")
    
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Simulate connection (in real app, this would handle OAuth)
    await db.platform_connections.update_one(
        {"business_id": business["business_id"], "platform": platform},
        {"$set": {
            "status": "connected",
            "connected_at": datetime.now(timezone.utc).isoformat(),
            "last_sync": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Generate mock reviews for this platform
    await generate_mock_reviews(business["business_id"], platform)
    
    return {"message": f"{platform.capitalize()} connected successfully"}

@api_router.post("/platforms/{platform}/disconnect")
async def disconnect_platform(platform: str, user: User = Depends(get_current_user)):
    """Disconnect a platform"""
    if platform not in ["google", "facebook"]:
        raise HTTPException(status_code=400, detail="Invalid platform")
    
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.platform_connections.update_one(
        {"business_id": business["business_id"], "platform": platform},
        {"$set": {
            "status": "disconnected",
            "connected_at": None,
            "last_sync": None
        }}
    )
    
    return {"message": f"{platform.capitalize()} disconnected"}

# ============ REVIEW ENDPOINTS ============

async def generate_mock_reviews(business_id: str, platform: str):
    """Generate mock reviews for demo purposes"""
    mock_names = [
        "Sarah Johnson", "Mike Chen", "Emily Rodriguez", "James Wilson",
        "Amanda Lee", "David Thompson", "Jessica Martinez", "Ryan Kim",
        "Laura Garcia", "Chris Brown"
    ]
    
    mock_reviews = [
        {"rating": 5, "text": "Absolutely fantastic experience! The service was exceptional and exceeded all my expectations. Will definitely be coming back!", "sentiment": "positive"},
        {"rating": 5, "text": "Best in town! Highly recommend to everyone. The quality is outstanding.", "sentiment": "positive"},
        {"rating": 4, "text": "Really good experience overall. A few minor things could be improved but nothing major.", "sentiment": "positive"},
        {"rating": 4, "text": "Great service and friendly staff. Would recommend!", "sentiment": "positive"},
        {"rating": 3, "text": "Average experience. Nothing special but nothing bad either.", "sentiment": "neutral"},
        {"rating": 3, "text": "It was okay. Service was a bit slow but the quality was decent.", "sentiment": "neutral"},
        {"rating": 2, "text": "Disappointed with my visit. Expected much better based on reviews.", "sentiment": "negative"},
        {"rating": 1, "text": "Very poor experience. Long wait times and unhelpful staff. Not coming back.", "sentiment": "negative"},
    ]
    
    # Generate 5-8 random reviews
    num_reviews = random.randint(5, 8)
    selected_reviews = random.sample(mock_reviews, min(num_reviews, len(mock_reviews)))
    
    for i, review_data in enumerate(selected_reviews):
        review = Review(
            business_id=business_id,
            platform=platform,
            author_name=random.choice(mock_names),
            author_avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={uuid.uuid4().hex[:6]}",
            rating=review_data["rating"],
            text=review_data["text"],
            sentiment=review_data["sentiment"],
            sentiment_score=random.uniform(0.3, 0.9) if review_data["sentiment"] == "positive" else (random.uniform(-0.9, -0.3) if review_data["sentiment"] == "negative" else random.uniform(-0.2, 0.2)),
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        )
        
        doc = review.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.reviews.insert_one(doc)

@api_router.get("/reviews")
async def get_reviews(
    platform: Optional[str] = None,
    sentiment: Optional[str] = None,
    rating: Optional[int] = None,
    responded: Optional[bool] = None,
    limit: int = 50,
    user: User = Depends(get_current_user)
):
    """Get reviews for user's business with optional filters"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    query = {"business_id": business["business_id"]}
    
    if platform:
        query["platform"] = platform
    if sentiment:
        query["sentiment"] = sentiment
    if rating:
        query["rating"] = rating
    if responded is not None:
        if responded:
            query["response"] = {"$ne": None}
        else:
            query["response"] = None
    
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    
    return reviews

@api_router.get("/reviews/{review_id}")
async def get_review(review_id: str, user: User = Depends(get_current_user)):
    """Get a single review"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    review = await db.reviews.find_one(
        {"review_id": review_id, "business_id": business["business_id"]},
        {"_id": 0}
    )
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return review

@api_router.post("/reviews/{review_id}/respond")
async def respond_to_review(review_id: str, data: ReviewResponse, user: User = Depends(get_current_user)):
    """Respond to a review"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    result = await db.reviews.update_one(
        {"review_id": review_id, "business_id": business["business_id"]},
        {"$set": {
            "response": data.response_text,
            "responded_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"message": "Response saved"}

@api_router.post("/reviews/{review_id}/mark-read")
async def mark_review_read(review_id: str, user: User = Depends(get_current_user)):
    """Mark a review as read"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    await db.reviews.update_one(
        {"review_id": review_id, "business_id": business["business_id"]},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Marked as read"}

# ============ AI RESPONSE GENERATION ============

@api_router.post("/ai/generate-response")
async def generate_ai_response(data: AIResponseRequest, user: User = Depends(get_current_user)):
    """Generate AI response using Gemini 3 Flash"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    tone_instructions = {
        "professional": "Use a professional and courteous tone.",
        "friendly": "Use a warm, friendly, and personable tone.",
        "apologetic": "Start with a sincere apology and show genuine concern for their experience."
    }
    
    system_message = f"""You are a customer service expert for {data.business_name}. 
Generate a thoughtful, authentic response to customer reviews.
{tone_instructions.get(data.tone, tone_instructions['professional'])}
Keep responses concise (2-3 sentences max) and personalized.
Never use generic phrases like "Dear valued customer".
Address specific points from the review when possible."""

    prompt = f"""Review Rating: {data.rating}/5 stars
Review Text: "{data.review_text}"

Generate an appropriate response:"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"review_response_{uuid.uuid4().hex[:8]}",
            system_message=system_message
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {"response": response, "tone": data.tone}
    except Exception as e:
        logger.error(f"AI generation error: {str(e)}")
        # Fallback response if AI fails
        if data.rating >= 4:
            fallback = f"Thank you so much for your wonderful feedback! We're thrilled you had a great experience at {data.business_name}. We look forward to seeing you again soon!"
        elif data.rating == 3:
            fallback = f"Thank you for your feedback. We appreciate you sharing your experience with us at {data.business_name}. We're always looking to improve!"
        else:
            fallback = f"We sincerely apologize for your experience at {data.business_name}. Your feedback is important to us, and we'd love the opportunity to make things right. Please reach out to us directly."
        
        return {"response": fallback, "tone": data.tone, "fallback": True}

# ============ ANALYTICS ENDPOINTS ============

@api_router.get("/analytics/overview")
async def get_analytics_overview(user: User = Depends(get_current_user)):
    """Get analytics overview for user's business"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    reviews = await db.reviews.find(
        {"business_id": business["business_id"]},
        {"_id": 0}
    ).to_list(1000)
    
    if not reviews:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "sentiment_breakdown": {"positive": 0, "neutral": 0, "negative": 0},
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            "response_rate": 0,
            "platform_breakdown": {"google": 0, "facebook": 0, "direct": 0}
        }
    
    total = len(reviews)
    avg_rating = sum(r["rating"] for r in reviews) / total
    
    sentiment_breakdown = {"positive": 0, "neutral": 0, "negative": 0}
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    platform_breakdown = {"google": 0, "facebook": 0, "direct": 0}
    responded_count = 0
    
    for review in reviews:
        sentiment_breakdown[review.get("sentiment", "neutral")] += 1
        rating_distribution[review["rating"]] += 1
        platform_breakdown[review.get("platform", "direct")] += 1
        if review.get("response"):
            responded_count += 1
    
    return {
        "total_reviews": total,
        "average_rating": round(avg_rating, 1),
        "sentiment_breakdown": sentiment_breakdown,
        "rating_distribution": rating_distribution,
        "response_rate": round((responded_count / total) * 100, 1) if total > 0 else 0,
        "platform_breakdown": platform_breakdown
    }

@api_router.get("/analytics/trends")
async def get_analytics_trends(days: int = 30, user: User = Depends(get_current_user)):
    """Get review trends over time"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    reviews = await db.reviews.find(
        {"business_id": business["business_id"]},
        {"_id": 0}
    ).to_list(1000)
    
    # Group by day
    daily_data = {}
    for review in reviews:
        created_at = review.get("created_at")
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        
        day_key = created_at.strftime("%Y-%m-%d")
        if day_key not in daily_data:
            daily_data[day_key] = {"count": 0, "total_rating": 0}
        daily_data[day_key]["count"] += 1
        daily_data[day_key]["total_rating"] += review["rating"]
    
    # Convert to list sorted by date
    trends = []
    for day, data in sorted(daily_data.items()):
        trends.append({
            "date": day,
            "reviews": data["count"],
            "avg_rating": round(data["total_rating"] / data["count"], 1) if data["count"] > 0 else 0
        })
    
    return trends[-days:]  # Last N days

# ============ QR CODE / DIRECT REVIEW ENDPOINTS ============

@api_router.get("/public/business/{qr_code_id}")
async def get_public_business(qr_code_id: str):
    """Get public business info for QR code landing page"""
    business = await db.businesses.find_one(
        {"qr_code_id": qr_code_id},
        {"_id": 0, "business_id": 1, "name": 1, "category": 1, "logo_url": 1}
    )
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    return business

@api_router.post("/public/review")
async def submit_public_review(review_data: ReviewCreate):
    """Submit a review from QR code landing page"""
    business = await db.businesses.find_one(
        {"business_id": review_data.business_id},
        {"_id": 0}
    )
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Determine sentiment based on rating
    if review_data.rating >= 4:
        sentiment = "positive"
        sentiment_score = random.uniform(0.5, 0.9)
    elif review_data.rating == 3:
        sentiment = "neutral"
        sentiment_score = random.uniform(-0.2, 0.2)
    else:
        sentiment = "negative"
        sentiment_score = random.uniform(-0.9, -0.5)
    
    review = Review(
        business_id=review_data.business_id,
        platform="direct",
        author_name=review_data.author_name,
        rating=review_data.rating,
        text=review_data.text,
        sentiment=sentiment,
        sentiment_score=sentiment_score
    )
    
    doc = review.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.reviews.insert_one(doc)
    
    return {"message": "Review submitted successfully", "review_id": review.review_id}

# ============ ROOT & HEALTH ============

@api_router.get("/")
async def root():
    return {"message": "ReviewFlow API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
