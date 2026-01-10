"""
Facebook Reviews Service - Hybrid Mock/Real Implementation

This service fetches reviews/recommendations from Facebook Pages.
- Uses MOCK data when FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are not set
- Uses REAL Facebook Graph API when credentials are provided

To enable real integration:
1. Create a Facebook App at https://developers.facebook.com
2. Get your App ID and App Secret
3. Add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to backend/.env
4. For production, complete Facebook Business Verification
"""

import os
import logging
import httpx
import random
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Check if real credentials are available
FACEBOOK_APP_ID = os.environ.get('FACEBOOK_APP_ID')
FACEBOOK_APP_SECRET = os.environ.get('FACEBOOK_APP_SECRET')
USE_REAL_FACEBOOK_API = bool(FACEBOOK_APP_ID and FACEBOOK_APP_SECRET)

# Mock review templates for demo
MOCK_REVIEWERS = [
    "Alex Thompson", "Maria Santos", "John Smith", "Lisa Chen",
    "Robert Wilson", "Jennifer Lopez", "Michael Brown", "Emma Davis",
    "William Johnson", "Olivia Martinez", "James Anderson", "Ava Garcia"
]

MOCK_POSITIVE_RECOMMENDATIONS = [
    "Highly recommend! Had an amazing experience here. The team went above and beyond to help me.",
    "Absolutely love this place! Best service I've ever received. Will definitely be back!",
    "Five stars all the way! Professional, friendly, and the quality is unmatched.",
    "Can't say enough good things about this business. They truly care about their customers.",
    "Outstanding experience from beginning to end. This is now my go-to place!",
]

MOCK_GOOD_RECOMMENDATIONS = [
    "Great experience overall! Would recommend to friends and family.",
    "Very happy with the service. Staff was friendly and helpful.",
    "Good quality and fair prices. Definitely worth checking out.",
    "Satisfied customer here! Will be returning for sure.",
]

MOCK_NEUTRAL_RECOMMENDATIONS = [
    "It was okay. Nothing special but got the job done.",
    "Average experience. Some things were good, others could improve.",
    "Decent service. Met my basic expectations.",
]

MOCK_NEGATIVE_RECOMMENDATIONS = [
    "Not the best experience. Had some issues that weren't resolved well.",
    "Disappointed with my visit. Expected better based on other reviews.",
    "Would not recommend. Several problems during my visit.",
]


def get_mock_recommendations(page_id: str, page_name: str, count: int = 8) -> List[Dict[str, Any]]:
    """Generate mock Facebook recommendations for demo purposes"""
    reviews = []
    
    # Distribution: 55% positive, 25% good, 12% neutral, 8% negative
    distributions = [
        (5, MOCK_POSITIVE_RECOMMENDATIONS, int(count * 0.55)),
        (4, MOCK_GOOD_RECOMMENDATIONS, int(count * 0.25)),
        (3, MOCK_NEUTRAL_RECOMMENDATIONS, int(count * 0.12)),
        (2, MOCK_NEGATIVE_RECOMMENDATIONS[:2], int(count * 0.05)),
        (1, MOCK_NEGATIVE_RECOMMENDATIONS[2:], int(count * 0.03)),
    ]
    
    for rating, review_pool, num in distributions:
        for _ in range(max(1, num)):
            review_text = random.choice(review_pool)
            reviewer = random.choice(MOCK_REVIEWERS)
            days_ago = random.randint(1, 45)
            
            # Determine sentiment
            if rating >= 4:
                sentiment = "positive"
                sentiment_score = random.uniform(0.6, 0.95)
            elif rating == 3:
                sentiment = "neutral"
                sentiment_score = random.uniform(-0.2, 0.2)
            else:
                sentiment = "negative"
                sentiment_score = random.uniform(-0.95, -0.4)
            
            reviews.append({
                "review_id": f"mock_fb_{uuid.uuid4().hex[:12]}",
                "platform": "facebook",
                "page_id": page_id,
                "author_name": reviewer,
                "author_avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={uuid.uuid4().hex[:6]}",
                "rating": rating,
                "text": review_text,
                "sentiment": sentiment,
                "sentiment_score": sentiment_score,
                "is_private": rating < 4,
                "publish_time": (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat(),
                "recommendation_type": "positive" if rating >= 4 else "negative",
                "is_mock": True
            })
    
    random.shuffle(reviews)
    return reviews[:count]


async def fetch_real_facebook_reviews(page_id: str, access_token: str = None) -> List[Dict[str, Any]]:
    """
    Fetch real reviews from Facebook Graph API
    
    Note: Facebook deprecated the rating system in 2018.
    Now uses "Recommendations" (positive/negative).
    Full access requires Page Access Token with manage_pages permission.
    """
    if not FACEBOOK_APP_ID or not FACEBOOK_APP_SECRET:
        logger.warning("Facebook credentials not set, cannot fetch real reviews")
        return []
    
    try:
        # Get app access token if not provided
        if not access_token:
            token_url = "https://graph.facebook.com/oauth/access_token"
            params = {
                "client_id": FACEBOOK_APP_ID,
                "client_secret": FACEBOOK_APP_SECRET,
                "grant_type": "client_credentials"
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                token_response = await client.get(token_url, params=params)
                if token_response.status_code == 200:
                    access_token = token_response.json().get("access_token")
                else:
                    logger.error(f"Failed to get Facebook access token: {token_response.text}")
                    return []
        
        # Fetch page ratings/reviews
        # Note: This requires Page Public Content Access or page token for private data
        url = f"https://graph.facebook.com/v18.0/{page_id}/ratings"
        params = {
            "access_token": access_token,
            "fields": "reviewer,rating,review_text,created_time,recommendation_type"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                reviews = []
                
                for review in data.get("data", []):
                    # Map Facebook's response to our format
                    rating = review.get("rating", 0)
                    if not rating:
                        # Convert recommendation to rating
                        rating = 5 if review.get("recommendation_type") == "positive" else 2
                    
                    # Determine sentiment
                    if rating >= 4:
                        sentiment = "positive"
                        sentiment_score = (rating - 3) / 2
                    elif rating == 3:
                        sentiment = "neutral"
                        sentiment_score = 0.0
                    else:
                        sentiment = "negative"
                        sentiment_score = (rating - 3) / 2
                    
                    reviewer_info = review.get("reviewer", {})
                    
                    reviews.append({
                        "review_id": f"fb_{review.get('id', uuid.uuid4().hex[:12])}",
                        "platform": "facebook",
                        "page_id": page_id,
                        "author_name": reviewer_info.get("name", "Facebook User"),
                        "author_avatar": None,  # Would need separate API call
                        "author_id": reviewer_info.get("id"),
                        "rating": rating,
                        "text": review.get("review_text", ""),
                        "sentiment": sentiment,
                        "sentiment_score": sentiment_score,
                        "is_private": rating < 4,
                        "publish_time": review.get("created_time"),
                        "recommendation_type": review.get("recommendation_type"),
                        "is_mock": False
                    })
                
                logger.info(f"Fetched {len(reviews)} real reviews from Facebook for page {page_id}")
                return reviews
            else:
                error_data = response.json() if response.text else {}
                logger.error(f"Facebook API error: {response.status_code} - {error_data}")
                return []
                
    except httpx.TimeoutException:
        logger.error("Facebook API request timed out")
        return []
    except Exception as e:
        logger.error(f"Error fetching Facebook reviews: {str(e)}")
        return []


async def get_facebook_reviews(page_id: str, page_name: str = "", access_token: str = None) -> Dict[str, Any]:
    """
    Get Facebook reviews - uses real API if credentials available, otherwise mock data
    
    Returns:
        Dict with reviews list and metadata about data source
    """
    if USE_REAL_FACEBOOK_API:
        logger.info(f"Fetching REAL Facebook reviews for page: {page_id}")
        reviews = await fetch_real_facebook_reviews(page_id, access_token)
        
        if reviews:
            return {
                "reviews": reviews,
                "source": "facebook_api",
                "is_mock": False,
                "message": "Real reviews from Facebook Graph API"
            }
        else:
            # Fallback to mock if real API fails
            logger.warning("Real API failed, falling back to mock data")
            return {
                "reviews": get_mock_recommendations(page_id, page_name),
                "source": "mock_fallback",
                "is_mock": True,
                "message": "Mock data (Facebook API temporarily unavailable)"
            }
    else:
        logger.info(f"Using MOCK Facebook reviews for page: {page_id}")
        return {
            "reviews": get_mock_recommendations(page_id, page_name),
            "source": "mock",
            "is_mock": True,
            "message": "Demo data - Add Facebook credentials for real reviews"
        }


def get_integration_status() -> Dict[str, Any]:
    """Get current Facebook integration status"""
    return {
        "platform": "facebook",
        "real_api_enabled": USE_REAL_FACEBOOK_API,
        "app_id_set": bool(FACEBOOK_APP_ID),
        "app_secret_set": bool(FACEBOOK_APP_SECRET),
        "status": "active" if USE_REAL_FACEBOOK_API else "demo_mode",
        "message": "Real Facebook API connected" if USE_REAL_FACEBOOK_API else "Using demo data - add Facebook credentials to enable"
    }
