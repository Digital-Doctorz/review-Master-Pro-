"""
Webhook Service for ReviewFlow

Handles incoming webhooks from Google and Facebook for real-time review notifications.
Provides webhook URL generation and verification for each business.
"""

import os
import hmac
import hashlib
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Webhook secret for signing/verification
WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', 'reviewflow_webhook_secret_key')


class WebhookConfig(BaseModel):
    """Webhook configuration for a business"""
    webhook_id: str
    business_id: str
    webhook_secret: str
    google_enabled: bool = False
    facebook_enabled: bool = False
    webhook_url: str
    created_at: str
    last_triggered: Optional[str] = None
    trigger_count: int = 0


def generate_webhook_id() -> str:
    """Generate a unique webhook ID"""
    return f"wh_{uuid.uuid4().hex[:16]}"


def generate_webhook_secret() -> str:
    """Generate a secure webhook secret for verification"""
    return hashlib.sha256(f"{uuid.uuid4().hex}{datetime.now().isoformat()}".encode()).hexdigest()[:32]


def verify_google_webhook(payload: bytes, signature: str, secret: str) -> bool:
    """
    Verify Google webhook signature
    Google uses HMAC-SHA256 for webhook verification
    """
    try:
        expected_signature = hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        logger.error(f"Google webhook verification failed: {e}")
        return False


def verify_facebook_webhook(payload: bytes, signature: str, app_secret: str) -> bool:
    """
    Verify Facebook webhook signature
    Facebook uses sha256=HMAC format
    """
    try:
        if signature.startswith('sha256='):
            signature = signature[7:]
        
        expected_signature = hmac.new(
            app_secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        logger.error(f"Facebook webhook verification failed: {e}")
        return False


def parse_google_review_webhook(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Parse Google Business Profile webhook payload for review events
    
    Google My Business API webhook format:
    {
        "messageId": "...",
        "publishTime": "...",
        "data": {
            "locationName": "accounts/{accountId}/locations/{locationId}",
            "reviewId": "...",
            "reviewer": {...},
            "starRating": 5,
            "comment": "..."
        }
    }
    """
    try:
        data = payload.get('data', payload)
        
        # Extract review data
        review = {
            "source": "google_webhook",
            "review_id": data.get('reviewId') or data.get('review_id'),
            "location_name": data.get('locationName') or data.get('location_name'),
            "rating": data.get('starRating') or data.get('rating'),
            "text": data.get('comment') or data.get('text', ''),
            "reviewer_name": data.get('reviewer', {}).get('displayName', 'Anonymous'),
            "publish_time": payload.get('publishTime') or datetime.now(timezone.utc).isoformat(),
            "event_type": data.get('eventType', 'NEW_REVIEW')
        }
        
        return review
    except Exception as e:
        logger.error(f"Error parsing Google webhook: {e}")
        return None


def parse_facebook_review_webhook(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Parse Facebook webhook payload for review/recommendation events
    
    Facebook webhook format for page ratings:
    {
        "object": "page",
        "entry": [{
            "id": "page_id",
            "time": 1234567890,
            "changes": [{
                "field": "ratings",
                "value": {
                    "rating": 5,
                    "review_text": "...",
                    "reviewer": {...}
                }
            }]
        }]
    }
    """
    try:
        if payload.get('object') != 'page':
            return None
        
        entries = payload.get('entry', [])
        if not entries:
            return None
        
        entry = entries[0]
        changes = entry.get('changes', [])
        
        for change in changes:
            if change.get('field') in ['ratings', 'feed']:
                value = change.get('value', {})
                
                review = {
                    "source": "facebook_webhook",
                    "page_id": entry.get('id'),
                    "review_id": value.get('post_id') or f"fb_{uuid.uuid4().hex[:12]}",
                    "rating": value.get('rating', 5),  # Facebook uses recommendations now
                    "text": value.get('review_text') or value.get('message', ''),
                    "reviewer_name": value.get('reviewer', {}).get('name', 'Facebook User'),
                    "publish_time": datetime.fromtimestamp(entry.get('time', 0), tz=timezone.utc).isoformat(),
                    "recommendation_type": value.get('recommendation_type', 'positive'),
                    "event_type": 'NEW_RECOMMENDATION'
                }
                
                return review
        
        return None
    except Exception as e:
        logger.error(f"Error parsing Facebook webhook: {e}")
        return None


def create_webhook_event_log(
    webhook_id: str,
    platform: str,
    event_type: str,
    payload: Dict[str, Any],
    status: str = "received"
) -> Dict[str, Any]:
    """Create a webhook event log entry"""
    return {
        "event_id": f"evt_{uuid.uuid4().hex[:12]}",
        "webhook_id": webhook_id,
        "platform": platform,
        "event_type": event_type,
        "payload_summary": {
            "review_id": payload.get("review_id"),
            "rating": payload.get("rating"),
            "has_text": bool(payload.get("text"))
        },
        "status": status,
        "received_at": datetime.now(timezone.utc).isoformat()
    }
