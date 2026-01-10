"""
Google Reviews Service - Hybrid Mock/Real Implementation

This service fetches reviews from Google Business Profile.
- Uses MOCK data when GOOGLE_PLACES_API_KEY is not set
- Uses REAL Google Places API when credentials are provided

To enable real integration:
1. Get a Google Places API key from https://console.cloud.google.com
2. Enable "Places API" and "Places API (New)" in your project
3. Add GOOGLE_PLACES_API_KEY to backend/.env
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
GOOGLE_PLACES_API_KEY = os.environ.get('GOOGLE_PLACES_API_KEY')
USE_REAL_GOOGLE_API = bool(GOOGLE_PLACES_API_KEY)

# Mock review templates for demo
MOCK_REVIEWERS = [
    "Sarah Johnson", "Mike Chen", "Emily Rodriguez", "James Wilson",
    "Amanda Lee", "David Thompson", "Jessica Martinez", "Ryan Kim",
    "Laura Garcia", "Chris Brown", "Nicole Taylor", "Kevin Park",
    "Rachel Green", "Daniel Lee", "Sophia Anderson"
]

MOCK_POSITIVE_REVIEWS = [
    "Absolutely fantastic experience! The service was exceptional and exceeded all my expectations. Will definitely be coming back!",
    "Best in town! Highly recommend to everyone. The quality is outstanding and the staff is incredibly friendly.",
    "Amazing experience from start to finish. The attention to detail was remarkable. Five stars well deserved!",
    "Exceeded my expectations in every way. Professional, efficient, and the results were perfect.",
    "Outstanding service! I've been to many places but this one tops them all. Truly exceptional.",
]

MOCK_GOOD_REVIEWS = [
    "Really good experience overall. A few minor things could be improved but nothing major.",
    "Great service and friendly staff. Would definitely come back and recommend to friends!",
    "Very satisfied with my visit. Good quality and reasonable prices. Will return.",
    "Impressed with the professionalism. Everything was handled smoothly and efficiently.",
]

MOCK_NEUTRAL_REVIEWS = [
    "Average experience. Nothing special but nothing bad either. It was okay.",
    "It was decent. Service was a bit slow but the quality was acceptable.",
    "Met my basic expectations. Room for improvement but not bad overall.",
]

MOCK_NEGATIVE_REVIEWS = [
    "Disappointed with my visit. Expected much better based on reviews I'd read.",
    "Not satisfied with the experience. Several issues that need to be addressed.",
    "Very poor experience. Long wait times and the staff seemed disinterested. Not coming back.",
    "Unfortunately did not meet expectations at all. Would not recommend to others.",
]


def get_mock_reviews(place_id: str, business_name: str, count: int = 8) -> List[Dict[str, Any]]:
    """Generate mock reviews for demo purposes"""
    reviews = []
    
    # Distribution: 50% positive (5), 25% good (4), 15% neutral (3), 10% negative (1-2)
    distributions = [
        (5, MOCK_POSITIVE_REVIEWS, int(count * 0.5)),
        (4, MOCK_GOOD_REVIEWS, int(count * 0.25)),
        (3, MOCK_NEUTRAL_REVIEWS, int(count * 0.15)),
        (2, MOCK_NEGATIVE_REVIEWS[:2], int(count * 0.05)),
        (1, MOCK_NEGATIVE_REVIEWS[2:], int(count * 0.05)),
    ]
    
    for rating, review_pool, num in distributions:
        for _ in range(max(1, num)):
            review_text = random.choice(review_pool)
            reviewer = random.choice(MOCK_REVIEWERS)
            days_ago = random.randint(1, 60)
            
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
                "review_id": f"mock_rev_{uuid.uuid4().hex[:12]}",
                "platform": "google",
                "place_id": place_id,
                "author_name": reviewer,
                "author_avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={uuid.uuid4().hex[:6]}",
                "rating": rating,
                "text": review_text,
                "sentiment": sentiment,
                "sentiment_score": sentiment_score,
                "is_private": rating < 4,
                "publish_time": (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat(),
                "language": "en",
                "is_mock": True
            })
    
    random.shuffle(reviews)
    return reviews[:count]


async def fetch_real_google_reviews(place_id: str) -> List[Dict[str, Any]]:
    """
    Fetch real reviews from Google Places API (New)
    
    Note: The Places API (New) provides limited review data.
    For full review management, Google Business Profile API with OAuth is required.
    """
    if not GOOGLE_PLACES_API_KEY:
        logger.warning("GOOGLE_PLACES_API_KEY not set, cannot fetch real reviews")
        return []
    
    try:
        # Google Places API (New) endpoint
        url = f"https://places.googleapis.com/v1/places/{place_id}"
        
        headers = {
            "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                reviews = []
                
                for review in data.get("reviews", []):
                    # Map Google's response to our format
                    rating = review.get("rating", 3)
                    
                    # Determine sentiment based on rating
                    if rating >= 4:
                        sentiment = "positive"
                        sentiment_score = (rating - 3) / 2  # 0.5 to 1.0
                    elif rating == 3:
                        sentiment = "neutral"
                        sentiment_score = 0.0
                    else:
                        sentiment = "negative"
                        sentiment_score = (rating - 3) / 2  # -0.5 to -1.0
                    
                    reviews.append({
                        "review_id": f"google_{review.get('name', uuid.uuid4().hex[:12])}",
                        "platform": "google",
                        "place_id": place_id,
                        "author_name": review.get("authorAttribution", {}).get("displayName", "Anonymous"),
                        "author_avatar": review.get("authorAttribution", {}).get("photoUri"),
                        "author_url": review.get("authorAttribution", {}).get("uri"),
                        "rating": rating,
                        "text": review.get("text", {}).get("text", ""),
                        "sentiment": sentiment,
                        "sentiment_score": sentiment_score,
                        "is_private": rating < 4,
                        "publish_time": review.get("publishTime"),
                        "language": review.get("text", {}).get("languageCode", "en"),
                        "is_mock": False
                    })
                
                logger.info(f"Fetched {len(reviews)} real reviews from Google for place {place_id}")
                return reviews
            else:
                logger.error(f"Google API error: {response.status_code} - {response.text}")
                return []
                
    except httpx.TimeoutException:
        logger.error("Google API request timed out")
        return []
    except Exception as e:
        logger.error(f"Error fetching Google reviews: {str(e)}")
        return []


async def get_google_reviews(place_id: str, business_name: str = "") -> Dict[str, Any]:
    """
    Get Google reviews - uses real API if credentials available, otherwise mock data
    
    Returns:
        Dict with reviews list and metadata about data source
    """
    if USE_REAL_GOOGLE_API:
        logger.info(f"Fetching REAL Google reviews for place: {place_id}")
        reviews = await fetch_real_google_reviews(place_id)
        
        if reviews:
            return {
                "reviews": reviews,
                "source": "google_api",
                "is_mock": False,
                "message": "Real reviews from Google Places API"
            }
        else:
            # Fallback to mock if real API fails
            logger.warning("Real API failed, falling back to mock data")
            return {
                "reviews": get_mock_reviews(place_id, business_name),
                "source": "mock_fallback",
                "is_mock": True,
                "message": "Mock data (Google API temporarily unavailable)"
            }
    else:
        logger.info(f"Using MOCK Google reviews for place: {place_id}")
        return {
            "reviews": get_mock_reviews(place_id, business_name),
            "source": "mock",
            "is_mock": True,
            "message": "Demo data - Add GOOGLE_PLACES_API_KEY for real reviews"
        }


def get_integration_status() -> Dict[str, Any]:
    """Get current Google integration status"""
    return {
        "platform": "google",
        "real_api_enabled": USE_REAL_GOOGLE_API,
        "api_key_set": bool(GOOGLE_PLACES_API_KEY),
        "status": "active" if USE_REAL_GOOGLE_API else "demo_mode",
        "message": "Real Google API connected" if USE_REAL_GOOGLE_API else "Using demo data - add GOOGLE_PLACES_API_KEY to enable"
    }
