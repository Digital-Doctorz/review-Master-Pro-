from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
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

# Import review services
from services import google_reviews, facebook_reviews

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
    # Google Business Integration
    google_place_id: Optional[str] = None
    google_business_name: Optional[str] = None
    google_review_link: Optional[str] = None
    # Facebook Integration
    facebook_page_id: Optional[str] = None
    facebook_page_name: Optional[str] = None
    facebook_page_url: Optional[str] = None
    setup_completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BusinessCreate(BaseModel):
    name: str
    category: str = "Restaurant"
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None

class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    google_place_id: Optional[str] = None
    google_business_name: Optional[str] = None
    google_review_link: Optional[str] = None
    facebook_page_id: Optional[str] = None
    facebook_page_name: Optional[str] = None
    facebook_page_url: Optional[str] = None

class PlatformConnection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    connection_id: str = Field(default_factory=lambda: f"conn_{uuid.uuid4().hex[:12]}")
    business_id: str
    platform: str  # "google" or "facebook"
    status: str = "disconnected"  # connected, disconnected, error
    place_id: Optional[str] = None  # For Google
    page_id: Optional[str] = None  # For Facebook
    page_url: Optional[str] = None  # For Facebook
    review_link: Optional[str] = None
    connected_at: Optional[datetime] = None
    last_sync: Optional[datetime] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str = Field(default_factory=lambda: f"rev_{uuid.uuid4().hex[:12]}")
    business_id: str
    platform: str  # google, facebook, direct
    author_name: str
    author_email: Optional[str] = None
    author_phone: Optional[str] = None
    author_avatar: Optional[str] = None
    rating: int  # 1-5
    text: str
    sentiment: str = "neutral"  # positive, negative, neutral
    sentiment_score: float = 0.0
    is_private: bool = False  # True for ratings < 4
    response: Optional[str] = None
    responded_at: Optional[datetime] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PublicReviewCreate(BaseModel):
    business_id: str
    author_name: str
    author_email: Optional[str] = None
    author_phone: Optional[str] = None
    rating: int
    text: str
    platform_choice: str = "direct"  # google, facebook, direct

class AIResponseRequest(BaseModel):
    review_text: str
    rating: int
    business_name: str
    tone: str = "professional"  # professional, friendly, apologetic

class AIWriteAssistRequest(BaseModel):
    rating: int
    business_name: str
    keywords: Optional[str] = None

class ReviewResponse(BaseModel):
    review_id: str
    response_text: str

class GooglePlaceSearch(BaseModel):
    query: str

class GooglePlaceResult(BaseModel):
    place_id: str
    name: str
    address: str
    rating: Optional[float] = None
    review_link: str

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
async def update_business(business_data: BusinessUpdate, user: User = Depends(get_current_user)):
    """Update the current user's business"""
    update_dict = {k: v for k, v in business_data.model_dump().items() if v is not None}
    
    if not update_dict:
        return {"message": "No updates provided"}
    
    result = await db.businesses.update_one(
        {"user_id": user.user_id},
        {"$set": update_dict}
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

# ============ GOOGLE PLACES SEARCH (MOCK) ============

# Mock Google Places data for demo
MOCK_GOOGLE_BUSINESSES = [
    {"place_id": "ChIJ_mock_001", "name": "The Coffee House", "address": "123 Main St, New York, NY 10001", "rating": 4.5},
    {"place_id": "ChIJ_mock_002", "name": "Coffee & Co.", "address": "456 Broadway, New York, NY 10012", "rating": 4.2},
    {"place_id": "ChIJ_mock_003", "name": "Sunrise Cafe", "address": "789 Park Ave, New York, NY 10021", "rating": 4.8},
    {"place_id": "ChIJ_mock_004", "name": "Downtown Diner", "address": "321 5th Ave, New York, NY 10016", "rating": 4.0},
    {"place_id": "ChIJ_mock_005", "name": "The Pizza Place", "address": "555 Houston St, New York, NY 10002", "rating": 4.6},
    {"place_id": "ChIJ_mock_006", "name": "Pizza Paradise", "address": "777 Lexington Ave, New York, NY 10065", "rating": 4.3},
    {"place_id": "ChIJ_mock_007", "name": "Bella Restaurant", "address": "888 Madison Ave, New York, NY 10021", "rating": 4.7},
    {"place_id": "ChIJ_mock_008", "name": "Bella Italian Kitchen", "address": "999 Columbus Ave, New York, NY 10025", "rating": 4.4},
    {"place_id": "ChIJ_mock_009", "name": "Fresh Sushi Bar", "address": "111 2nd Ave, New York, NY 10003", "rating": 4.9},
    {"place_id": "ChIJ_mock_010", "name": "Golden Dragon Chinese", "address": "222 Canal St, New York, NY 10013", "rating": 4.1},
]

@api_router.get("/google/search")
async def search_google_places(
    query: str = Query(..., min_length=2),
    user: User = Depends(get_current_user)
):
    """Search for Google Business profiles (MOCK implementation)"""
    # Simulate API delay
    import asyncio
    await asyncio.sleep(0.3)
    
    # Filter mock data based on query
    query_lower = query.lower()
    results = []
    
    for business in MOCK_GOOGLE_BUSINESSES:
        if query_lower in business["name"].lower() or query_lower in business["address"].lower():
            results.append({
                "place_id": business["place_id"],
                "name": business["name"],
                "address": business["address"],
                "rating": business["rating"],
                "review_link": f"https://search.google.com/local/writereview?placeid={business['place_id']}"
            })
    
    # Also add a "custom" result that matches the query
    if len(results) < 3:
        custom_id = f"ChIJ_custom_{uuid.uuid4().hex[:6]}"
        results.append({
            "place_id": custom_id,
            "name": query.title(),
            "address": "Enter your business address",
            "rating": None,
            "review_link": f"https://search.google.com/local/writereview?placeid={custom_id}"
        })
    
    return {"results": results[:5]}

@api_router.post("/google/connect")
async def connect_google_business(
    data: dict,
    user: User = Depends(get_current_user)
):
    """Connect a Google Business to the user's account"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    place_id = data.get("place_id")
    name = data.get("name")
    review_link = data.get("review_link") or f"https://search.google.com/local/writereview?placeid={place_id}"
    
    # Update business with Google info
    await db.businesses.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "google_place_id": place_id,
            "google_business_name": name,
            "google_review_link": review_link
        }}
    )
    
    # Update platform connection
    await db.platform_connections.update_one(
        {"business_id": business["business_id"], "platform": "google"},
        {"$set": {
            "status": "connected",
            "place_id": place_id,
            "review_link": review_link,
            "connected_at": datetime.now(timezone.utc).isoformat(),
            "last_sync": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Sync reviews using the service (real or mock)
    await sync_platform_reviews(business["business_id"], "google", place_id, name)
    
    # Get integration status
    integration_status = google_reviews.get_integration_status()
    
    return {
        "message": "Google Business connected successfully", 
        "review_link": review_link,
        "integration_mode": integration_status["status"],
        "is_real_data": integration_status["real_api_enabled"]
    }

# ============ FACEBOOK MOCK INTEGRATION ============

# Mock Facebook Pages data for demo
MOCK_FACEBOOK_PAGES = [
    {"page_id": "fb_mock_001", "name": "The Coffee House", "category": "Coffee Shop", "likes": 2500, "url": "https://facebook.com/thecoffeehouse"},
    {"page_id": "fb_mock_002", "name": "Coffee & Co.", "category": "Cafe", "likes": 1800, "url": "https://facebook.com/coffeeandco"},
    {"page_id": "fb_mock_003", "name": "Sunrise Cafe", "category": "Breakfast & Brunch", "likes": 3200, "url": "https://facebook.com/sunrisecafe"},
    {"page_id": "fb_mock_004", "name": "Downtown Diner", "category": "American Restaurant", "likes": 4100, "url": "https://facebook.com/downtowndiner"},
    {"page_id": "fb_mock_005", "name": "The Pizza Place", "category": "Pizza Place", "likes": 5600, "url": "https://facebook.com/thepizzaplace"},
    {"page_id": "fb_mock_006", "name": "Pizza Paradise", "category": "Italian Restaurant", "likes": 2900, "url": "https://facebook.com/pizzaparadise"},
    {"page_id": "fb_mock_007", "name": "Bella Restaurant", "category": "Italian Restaurant", "likes": 7200, "url": "https://facebook.com/bellarestaurant"},
    {"page_id": "fb_mock_008", "name": "Bella Italian Kitchen", "category": "Italian Restaurant", "likes": 3400, "url": "https://facebook.com/bellaitaliankitchen"},
    {"page_id": "fb_mock_009", "name": "Fresh Sushi Bar", "category": "Sushi Restaurant", "likes": 4800, "url": "https://facebook.com/freshsushibar"},
    {"page_id": "fb_mock_010", "name": "Golden Dragon Chinese", "category": "Chinese Restaurant", "likes": 2100, "url": "https://facebook.com/goldendragonchi"},
    {"page_id": "fb_mock_011", "name": "Optm Health Care", "category": "Health & Wellness", "likes": 1500, "url": "https://facebook.com/optmhealthcare"},
    {"page_id": "fb_mock_012", "name": "Health First Clinic", "category": "Medical Center", "likes": 2800, "url": "https://facebook.com/healthfirstclinic"},
]

@api_router.get("/facebook/search")
async def search_facebook_pages(
    query: str = Query(..., min_length=2),
    user: User = Depends(get_current_user)
):
    """Search for Facebook Pages (MOCK implementation)"""
    import asyncio
    await asyncio.sleep(0.3)
    
    query_lower = query.lower()
    results = []
    
    for page in MOCK_FACEBOOK_PAGES:
        if query_lower in page["name"].lower() or query_lower in page["category"].lower():
            results.append({
                "page_id": page["page_id"],
                "name": page["name"],
                "category": page["category"],
                "likes": page["likes"],
                "url": page["url"],
                "review_link": f"{page['url']}/reviews"
            })
    
    # Add a custom result matching the query
    if len(results) < 3:
        custom_id = f"fb_custom_{uuid.uuid4().hex[:6]}"
        results.append({
            "page_id": custom_id,
            "name": query.title(),
            "category": "Local Business",
            "likes": None,
            "url": f"https://facebook.com/{query.lower().replace(' ', '')}",
            "review_link": f"https://facebook.com/{query.lower().replace(' ', '')}/reviews"
        })
    
    return {"results": results[:5]}

@api_router.post("/facebook/connect")
async def connect_facebook_page(
    data: dict,
    user: User = Depends(get_current_user)
):
    """Connect a Facebook Page"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    page_id = data.get("page_id", f"fb_page_{uuid.uuid4().hex[:8]}")
    page_url = data.get("page_url") or data.get("url", "")
    page_name = data.get("page_name") or data.get("name", business["name"])
    review_link = data.get("review_link", f"{page_url}/reviews" if page_url else f"https://facebook.com/{page_id}/reviews")
    
    # Update business with Facebook info
    await db.businesses.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "facebook_page_id": page_id,
            "facebook_page_name": page_name,
            "facebook_page_url": page_url or f"https://facebook.com/{page_id}"
        }}
    )
    
    # Update platform connection
    await db.platform_connections.update_one(
        {"business_id": business["business_id"], "platform": "facebook"},
        {"$set": {
            "status": "connected",
            "page_id": page_id,
            "page_url": page_url or f"https://facebook.com/{page_id}",
            "review_link": review_link,
            "connected_at": datetime.now(timezone.utc).isoformat(),
            "last_sync": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Sync reviews using the service (real or mock)
    await sync_platform_reviews(business["business_id"], "facebook", page_id, page_name)
    
    # Get integration status
    integration_status = facebook_reviews.get_integration_status()
    
    return {
        "message": "Facebook Page connected successfully", 
        "review_link": review_link,
        "integration_mode": integration_status["status"],
        "is_real_data": integration_status["real_api_enabled"]
    }

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
            "last_sync": None,
            "place_id": None,
            "page_id": None,
            "page_url": None,
            "review_link": None
        }}
    )
    
    # Clear business platform info
    if platform == "google":
        await db.businesses.update_one(
            {"user_id": user.user_id},
            {"$set": {
                "google_place_id": None,
                "google_business_name": None,
                "google_review_link": None
            }}
        )
    else:
        await db.businesses.update_one(
            {"user_id": user.user_id},
            {"$set": {
                "facebook_page_id": None,
                "facebook_page_name": None,
                "facebook_page_url": None
            }}
        )
    
    return {"message": f"{platform.capitalize()} disconnected"}

# ============ REVIEW ENDPOINTS ============

async def sync_platform_reviews(business_id: str, platform: str, platform_id: str, business_name: str = ""):
    """
    Sync reviews from platform (Google or Facebook)
    Uses real API if credentials are available, otherwise uses mock data
    """
    logger.info(f"Syncing {platform} reviews for business {business_id}")
    
    try:
        if platform == "google":
            result = await google_reviews.get_google_reviews(platform_id, business_name)
        elif platform == "facebook":
            result = await facebook_reviews.get_facebook_reviews(platform_id, business_name)
        else:
            logger.error(f"Unknown platform: {platform}")
            return {"synced": 0, "error": "Unknown platform"}
        
        reviews_data = result.get("reviews", [])
        is_mock = result.get("is_mock", True)
        
        synced_count = 0
        for review_data in reviews_data:
            # Create review document
            review = Review(
                review_id=review_data.get("review_id", f"rev_{uuid.uuid4().hex[:12]}"),
                business_id=business_id,
                platform=platform,
                author_name=review_data.get("author_name", "Anonymous"),
                author_avatar=review_data.get("author_avatar"),
                rating=review_data.get("rating", 3),
                text=review_data.get("text", ""),
                sentiment=review_data.get("sentiment", "neutral"),
                sentiment_score=review_data.get("sentiment_score", 0.0),
                is_private=review_data.get("is_private", False),
                created_at=datetime.fromisoformat(review_data.get("publish_time", datetime.now(timezone.utc).isoformat()).replace("Z", "+00:00")) if review_data.get("publish_time") else datetime.now(timezone.utc)
            )
            
            doc = review.model_dump()
            doc["created_at"] = doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"]
            doc["is_mock"] = is_mock
            doc["synced_at"] = datetime.now(timezone.utc).isoformat()
            
            # Upsert review (update if exists, insert if not)
            await db.reviews.update_one(
                {"review_id": review.review_id},
                {"$set": doc},
                upsert=True
            )
            synced_count += 1
        
        logger.info(f"Synced {synced_count} reviews for business {business_id} from {platform}")
        return {
            "synced": synced_count,
            "source": result.get("source"),
            "is_mock": is_mock,
            "message": result.get("message")
        }
        
    except Exception as e:
        logger.error(f"Error syncing reviews: {str(e)}")
        return {"synced": 0, "error": str(e)}


async def generate_mock_reviews(business_id: str, platform: str):
    """Legacy function - now uses sync_platform_reviews"""
    # This is kept for backward compatibility but now delegates to the service
    await sync_platform_reviews(business_id, platform, f"mock_{platform}_{business_id}", "")


@api_router.post("/reviews/sync")
async def sync_reviews(
    platform: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """
    Manually sync reviews from connected platforms
    If platform is specified, only sync that platform. Otherwise sync all connected platforms.
    """
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    results = {}
    
    # Sync Google if connected and (no platform specified or google specified)
    if (not platform or platform == "google") and business.get("google_place_id"):
        result = await sync_platform_reviews(
            business["business_id"], 
            "google", 
            business["google_place_id"],
            business.get("google_business_name", "")
        )
        results["google"] = result
        
        # Update last_sync timestamp
        await db.platform_connections.update_one(
            {"business_id": business["business_id"], "platform": "google"},
            {"$set": {"last_sync": datetime.now(timezone.utc).isoformat()}}
        )
    
    # Sync Facebook if connected and (no platform specified or facebook specified)
    if (not platform or platform == "facebook") and business.get("facebook_page_id"):
        result = await sync_platform_reviews(
            business["business_id"], 
            "facebook", 
            business["facebook_page_id"],
            business.get("facebook_page_name", "")
        )
        results["facebook"] = result
        
        # Update last_sync timestamp
        await db.platform_connections.update_one(
            {"business_id": business["business_id"], "platform": "facebook"},
            {"$set": {"last_sync": datetime.now(timezone.utc).isoformat()}}
        )
    
    if not results:
        return {
            "message": "No platforms connected to sync",
            "results": {}
        }
    
    return {
        "message": "Sync completed",
        "results": results
    }


@api_router.get("/integration-status")
async def get_integration_status(user: User = Depends(get_current_user)):
    """Get the status of platform integrations (real vs mock)"""
    google_status = google_reviews.get_integration_status()
    facebook_status = facebook_reviews.get_integration_status()
    
    return {
        "google": google_status,
        "facebook": facebook_status,
        "overall_mode": "production" if (google_status["real_api_enabled"] or facebook_status["real_api_enabled"]) else "demo",
        "setup_instructions": {
            "google": "Add GOOGLE_PLACES_API_KEY to backend/.env to enable real Google reviews",
            "facebook": "Add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to backend/.env to enable real Facebook reviews"
        }
    }


@api_router.get("/reviews")
async def get_reviews(
    platform: Optional[str] = None,
    sentiment: Optional[str] = None,
    rating: Optional[int] = None,
    responded: Optional[bool] = None,
    is_private: Optional[bool] = None,
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
    if is_private is not None:
        query["is_private"] = is_private
    
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    
    return reviews

@api_router.get("/reviews/private")
async def get_private_feedback(user: User = Depends(get_current_user)):
    """Get private feedback (ratings < 4)"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    reviews = await db.reviews.find(
        {"business_id": business["business_id"], "is_private": True},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
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

@api_router.post("/ai/write-assist")
async def ai_write_assist(data: AIWriteAssistRequest, user: User = Depends(get_current_user)):
    """AI assistant to help customers write reviews"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    rating_context = {
        5: "exceptional, outstanding, best ever",
        4: "great, very good, impressed",
        3: "decent, okay, average",
        2: "disappointing, below expectations",
        1: "terrible, worst experience"
    }
    
    system_message = f"""You are helping a customer write a review for {data.business_name}.
The customer gave a {data.rating}-star rating, which means the experience was {rating_context.get(data.rating, 'neutral')}.
Generate a natural, authentic-sounding review that reflects this rating.
Keep it concise (2-4 sentences) and genuine.
Do not use overly formal language or clichés."""

    keywords_text = f"\nIncorporate these aspects the customer mentioned: {data.keywords}" if data.keywords else ""
    
    prompt = f"""Generate a {data.rating}-star review for {data.business_name}.{keywords_text}

Write a natural review:"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"write_assist_{uuid.uuid4().hex[:8]}",
            system_message=system_message
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {"review_text": response}
    except Exception as e:
        logger.error(f"AI write assist error: {str(e)}")
        # Fallback templates
        templates = {
            5: f"Had an amazing experience at {data.business_name}! Everything was perfect and the service was outstanding. Highly recommend!",
            4: f"Really enjoyed my visit to {data.business_name}. Great quality and friendly staff. Would definitely come back!",
            3: f"Visited {data.business_name} recently. It was okay - nothing too special but decent overall.",
            2: f"My experience at {data.business_name} was disappointing. Expected better based on what I'd heard.",
            1: f"Unfortunately, {data.business_name} did not meet my expectations at all. Would not recommend."
        }
        
        return {"review_text": templates.get(data.rating, templates[3]), "fallback": True}

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
            "platform_breakdown": {"google": 0, "facebook": 0, "direct": 0},
            "private_feedback_count": 0,
            "public_reviews_count": 0
        }
    
    total = len(reviews)
    avg_rating = sum(r["rating"] for r in reviews) / total
    
    sentiment_breakdown = {"positive": 0, "neutral": 0, "negative": 0}
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    platform_breakdown = {"google": 0, "facebook": 0, "direct": 0}
    responded_count = 0
    private_count = 0
    
    for review in reviews:
        sentiment_breakdown[review.get("sentiment", "neutral")] += 1
        rating_distribution[review["rating"]] += 1
        platform_breakdown[review.get("platform", "direct")] += 1
        if review.get("response"):
            responded_count += 1
        if review.get("is_private"):
            private_count += 1
    
    return {
        "total_reviews": total,
        "average_rating": round(avg_rating, 1),
        "sentiment_breakdown": sentiment_breakdown,
        "rating_distribution": rating_distribution,
        "response_rate": round((responded_count / total) * 100, 1) if total > 0 else 0,
        "platform_breakdown": platform_breakdown,
        "private_feedback_count": private_count,
        "public_reviews_count": total - private_count
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
        {"_id": 0, "business_id": 1, "name": 1, "category": 1, "logo_url": 1,
         "google_place_id": 1, "google_review_link": 1,
         "facebook_page_id": 1, "facebook_page_url": 1}
    )
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Get platform connections
    connections = await db.platform_connections.find(
        {"business_id": business["business_id"], "status": "connected"},
        {"_id": 0, "platform": 1, "review_link": 1, "page_url": 1}
    ).to_list(10)
    
    platforms = {}
    for conn in connections:
        platforms[conn["platform"]] = {
            "connected": True,
            "review_link": conn.get("review_link") or conn.get("page_url")
        }
    
    return {
        **business,
        "platforms": platforms
    }

@api_router.post("/public/review")
async def submit_public_review(review_data: PublicReviewCreate):
    """Submit a review from QR code landing page"""
    business = await db.businesses.find_one(
        {"business_id": review_data.business_id},
        {"_id": 0}
    )
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Determine sentiment and privacy based on rating
    is_private = review_data.rating < 4
    
    if review_data.rating >= 4:
        sentiment = "positive"
        sentiment_score = random.uniform(0.5, 0.9)
    elif review_data.rating == 3:
        sentiment = "neutral"
        sentiment_score = random.uniform(-0.2, 0.2)
    else:
        sentiment = "negative"
        sentiment_score = random.uniform(-0.9, -0.5)
    
    # For low ratings, always mark as private/direct
    platform = "direct" if is_private else review_data.platform_choice
    
    review = Review(
        business_id=review_data.business_id,
        platform=platform,
        author_name=review_data.author_name,
        author_email=review_data.author_email,
        author_phone=review_data.author_phone,
        rating=review_data.rating,
        text=review_data.text,
        sentiment=sentiment,
        sentiment_score=sentiment_score,
        is_private=is_private
    )
    
    doc = review.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.reviews.insert_one(doc)
    
    # Return different response based on rating
    if is_private:
        return {
            "message": "Thank you for your feedback. We take all feedback seriously and will work to improve.",
            "review_id": review.review_id,
            "is_private": True
        }
    else:
        return {
            "message": "Review submitted successfully",
            "review_id": review.review_id,
            "is_private": False,
            "platform_choice": platform
        }

# ============ WEBHOOK ENDPOINTS ============

from services import webhook_service

class WebhookSettings(BaseModel):
    google_enabled: bool = False
    facebook_enabled: bool = False

@api_router.get("/webhooks/config")
async def get_webhook_config(user: User = Depends(get_current_user)):
    """Get webhook configuration for user's business"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    # Check if webhook config exists
    config = await db.webhook_configs.find_one(
        {"business_id": business["business_id"]},
        {"_id": 0}
    )
    
    if not config:
        # Create new webhook config
        webhook_id = webhook_service.generate_webhook_id()
        webhook_secret = webhook_service.generate_webhook_secret()
        
        # Get base URL from environment or request
        base_url = os.environ.get('WEBHOOK_BASE_URL', os.environ.get('REACT_APP_BACKEND_URL', ''))
        
        config = {
            "webhook_id": webhook_id,
            "business_id": business["business_id"],
            "webhook_secret": webhook_secret,
            "google_enabled": False,
            "facebook_enabled": False,
            "webhook_url_google": f"{base_url}/api/webhooks/google/{webhook_id}",
            "webhook_url_facebook": f"{base_url}/api/webhooks/facebook/{webhook_id}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_triggered": None,
            "trigger_count": 0
        }
        
        await db.webhook_configs.insert_one(config)
    
    # Don't expose the secret in full
    config_response = {**config}
    config_response["webhook_secret_preview"] = config["webhook_secret"][:8] + "..."
    
    return config_response


@api_router.put("/webhooks/config")
async def update_webhook_config(
    settings: WebhookSettings,
    user: User = Depends(get_current_user)
):
    """Update webhook settings for user's business"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    result = await db.webhook_configs.update_one(
        {"business_id": business["business_id"]},
        {"$set": {
            "google_enabled": settings.google_enabled,
            "facebook_enabled": settings.facebook_enabled,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Webhook config not found")
    
    return {"message": "Webhook settings updated"}


@api_router.post("/webhooks/regenerate-secret")
async def regenerate_webhook_secret(user: User = Depends(get_current_user)):
    """Regenerate webhook secret for security"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    new_secret = webhook_service.generate_webhook_secret()
    
    await db.webhook_configs.update_one(
        {"business_id": business["business_id"]},
        {"$set": {
            "webhook_secret": new_secret,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "message": "Webhook secret regenerated",
        "webhook_secret_preview": new_secret[:8] + "..."
    }


@api_router.get("/webhooks/events")
async def get_webhook_events(
    limit: int = 20,
    user: User = Depends(get_current_user)
):
    """Get recent webhook events for user's business"""
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    config = await db.webhook_configs.find_one(
        {"business_id": business["business_id"]},
        {"_id": 0}
    )
    
    if not config:
        return {"events": [], "total": 0}
    
    events = await db.webhook_events.find(
        {"webhook_id": config["webhook_id"]},
        {"_id": 0}
    ).sort("received_at", -1).to_list(limit)
    
    total = await db.webhook_events.count_documents(
        {"webhook_id": config["webhook_id"]}
    )
    
    return {"events": events, "total": total}


@api_router.post("/webhooks/google/{webhook_id}")
async def handle_google_webhook(
    webhook_id: str,
    request: Request
):
    """
    Handle incoming Google Business Profile webhooks
    This endpoint receives real-time review notifications from Google
    """
    # Get webhook config
    config = await db.webhook_configs.find_one(
        {"webhook_id": webhook_id},
        {"_id": 0}
    )
    
    if not config:
        logger.warning(f"Webhook not found: {webhook_id}")
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    if not config.get("google_enabled"):
        logger.warning(f"Google webhook disabled for: {webhook_id}")
        raise HTTPException(status_code=403, detail="Google webhook disabled")
    
    # Get raw body for signature verification
    body = await request.body()
    
    # Verify signature if present
    signature = request.headers.get("X-Goog-Signature", "")
    if signature and not webhook_service.verify_google_webhook(body, signature, config["webhook_secret"]):
        logger.warning(f"Invalid Google webhook signature for: {webhook_id}")
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse payload
    try:
        payload = await request.json()
    except:
        payload = {}
    
    # Parse review data
    review_data = webhook_service.parse_google_review_webhook(payload)
    
    if review_data:
        # Create review in database
        review = Review(
            review_id=f"google_wh_{review_data.get('review_id', uuid.uuid4().hex[:12])}",
            business_id=config["business_id"],
            platform="google",
            author_name=review_data.get("reviewer_name", "Anonymous"),
            rating=review_data.get("rating", 5),
            text=review_data.get("text", ""),
            sentiment="positive" if review_data.get("rating", 5) >= 4 else ("negative" if review_data.get("rating", 5) <= 2 else "neutral"),
            sentiment_score=0.5 if review_data.get("rating", 5) >= 4 else -0.5,
            is_private=review_data.get("rating", 5) < 4
        )
        
        doc = review.model_dump()
        doc["created_at"] = doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"]
        doc["source"] = "webhook"
        doc["webhook_event"] = True
        
        await db.reviews.update_one(
            {"review_id": review.review_id},
            {"$set": doc},
            upsert=True
        )
        
        logger.info(f"Google webhook: Created review {review.review_id}")
    
    # Log webhook event
    event_log = webhook_service.create_webhook_event_log(
        webhook_id=webhook_id,
        platform="google",
        event_type=review_data.get("event_type", "UNKNOWN") if review_data else "PARSE_FAILED",
        payload=review_data or payload,
        status="processed" if review_data else "parse_failed"
    )
    await db.webhook_events.insert_one(event_log)
    
    # Update webhook stats
    await db.webhook_configs.update_one(
        {"webhook_id": webhook_id},
        {
            "$set": {"last_triggered": datetime.now(timezone.utc).isoformat()},
            "$inc": {"trigger_count": 1}
        }
    )
    
    return {"status": "received", "processed": bool(review_data)}


@api_router.post("/webhooks/facebook/{webhook_id}")
async def handle_facebook_webhook(
    webhook_id: str,
    request: Request
):
    """
    Handle incoming Facebook webhooks for page reviews/recommendations
    """
    # Get webhook config
    config = await db.webhook_configs.find_one(
        {"webhook_id": webhook_id},
        {"_id": 0}
    )
    
    if not config:
        logger.warning(f"Webhook not found: {webhook_id}")
        raise HTTPException(status_code=404, detail="Webhook not found")
    
    if not config.get("facebook_enabled"):
        logger.warning(f"Facebook webhook disabled for: {webhook_id}")
        raise HTTPException(status_code=403, detail="Facebook webhook disabled")
    
    # Get raw body for signature verification
    body = await request.body()
    
    # Verify signature if present
    signature = request.headers.get("X-Hub-Signature-256", "")
    fb_app_secret = os.environ.get("FACEBOOK_APP_SECRET", config["webhook_secret"])
    
    if signature and not webhook_service.verify_facebook_webhook(body, signature, fb_app_secret):
        logger.warning(f"Invalid Facebook webhook signature for: {webhook_id}")
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse payload
    try:
        payload = await request.json()
    except:
        payload = {}
    
    # Parse review data
    review_data = webhook_service.parse_facebook_review_webhook(payload)
    
    if review_data:
        # Convert recommendation to rating
        rating = 5 if review_data.get("recommendation_type") == "positive" else 2
        
        # Create review in database
        review = Review(
            review_id=f"fb_wh_{review_data.get('review_id', uuid.uuid4().hex[:12])}",
            business_id=config["business_id"],
            platform="facebook",
            author_name=review_data.get("reviewer_name", "Facebook User"),
            rating=rating,
            text=review_data.get("text", ""),
            sentiment="positive" if rating >= 4 else "negative",
            sentiment_score=0.5 if rating >= 4 else -0.5,
            is_private=rating < 4
        )
        
        doc = review.model_dump()
        doc["created_at"] = doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"]
        doc["source"] = "webhook"
        doc["webhook_event"] = True
        
        await db.reviews.update_one(
            {"review_id": review.review_id},
            {"$set": doc},
            upsert=True
        )
        
        logger.info(f"Facebook webhook: Created review {review.review_id}")
    
    # Log webhook event
    event_log = webhook_service.create_webhook_event_log(
        webhook_id=webhook_id,
        platform="facebook",
        event_type=review_data.get("event_type", "UNKNOWN") if review_data else "PARSE_FAILED",
        payload=review_data or payload,
        status="processed" if review_data else "parse_failed"
    )
    await db.webhook_events.insert_one(event_log)
    
    # Update webhook stats
    await db.webhook_configs.update_one(
        {"webhook_id": webhook_id},
        {
            "$set": {"last_triggered": datetime.now(timezone.utc).isoformat()},
            "$inc": {"trigger_count": 1}
        }
    )
    
    return {"status": "received", "processed": bool(review_data)}


@api_router.get("/webhooks/facebook/{webhook_id}")
async def verify_facebook_webhook(
    webhook_id: str,
    request: Request
):
    """
    Handle Facebook webhook verification challenge
    Facebook sends a GET request with hub.challenge to verify the webhook URL
    """
    # Get query parameters
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode == "subscribe":
        # Verify token matches webhook secret
        config = await db.webhook_configs.find_one(
            {"webhook_id": webhook_id},
            {"_id": 0}
        )
        
        if config and token == config.get("webhook_secret"):
            logger.info(f"Facebook webhook verified for: {webhook_id}")
            return int(challenge) if challenge else "OK"
    
    raise HTTPException(status_code=403, detail="Verification failed")


@api_router.post("/webhooks/test/{platform}")
async def test_webhook(
    platform: str,
    user: User = Depends(get_current_user)
):
    """
    Send a test webhook event to verify the integration is working
    """
    if platform not in ["google", "facebook"]:
        raise HTTPException(status_code=400, detail="Invalid platform")
    
    business = await db.businesses.find_one({"user_id": user.user_id}, {"_id": 0})
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    config = await db.webhook_configs.find_one(
        {"business_id": business["business_id"]},
        {"_id": 0}
    )
    
    if not config:
        raise HTTPException(status_code=404, detail="Webhook not configured")
    
    # Create a test review
    test_review = Review(
        review_id=f"test_{platform}_{uuid.uuid4().hex[:8]}",
        business_id=business["business_id"],
        platform=platform,
        author_name="Test Webhook User",
        rating=5,
        text=f"This is a test review from the {platform} webhook integration. Everything is working!",
        sentiment="positive",
        sentiment_score=0.9,
        is_private=False
    )
    
    doc = test_review.model_dump()
    doc["created_at"] = doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"]
    doc["source"] = "webhook_test"
    doc["is_test"] = True
    
    await db.reviews.insert_one(doc)
    
    # Log the test event
    event_log = webhook_service.create_webhook_event_log(
        webhook_id=config["webhook_id"],
        platform=platform,
        event_type="TEST_EVENT",
        payload={"test": True, "review_id": test_review.review_id},
        status="test_processed"
    )
    await db.webhook_events.insert_one(event_log)
    
    return {
        "message": f"Test {platform} webhook event created",
        "review_id": test_review.review_id,
        "platform": platform
    }


# ============ ROOT & HEALTH ============

@api_router.get("/")
async def root():
    return {"message": "ReviewFlow API", "version": "2.2.0"}

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
