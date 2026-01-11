"""
Test suite for ReviewFlow Notification Settings and Public Review Flow
Tests:
- GET /api/notifications/settings - Get notification settings
- PUT /api/notifications/settings - Update notification settings
- POST /api/notifications/test - Send test email notification
- GET /api/email/status - Get email service status
- GET /api/integration-status - Integration status with email
- GET /api/public/business/{qr_code_id} - Public business info
- POST /api/public/review - Submit public review
- POST /api/ai/write-assist - AI review writing assistance
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from previous iteration
TEST_SESSION_TOKEN = "test_session_1768051374411"
TEST_USER_ID = "test-user-1768051374411"
TEST_BUSINESS_ID = "biz_75251e389e5d"
TEST_QR_CODE_ID = "2616feca"


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def authenticated_client(api_client):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {TEST_SESSION_TOKEN}"})
    return api_client


class TestEmailStatus:
    """Email service status endpoint tests (public endpoint)"""
    
    def test_get_email_status_returns_status(self, api_client):
        """GET /api/email/status returns email service status"""
        response = api_client.get(f"{BASE_URL}/api/email/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "enabled" in data
        assert "message" in data
        # Email is disabled without RESEND_API_KEY
        assert data["enabled"] == False
        assert "RESEND_API_KEY" in data["message"]
        print(f"✓ Email status: enabled={data['enabled']}, message={data['message']}")


class TestIntegrationStatus:
    """Integration status endpoint tests"""
    
    def test_integration_status_requires_auth(self, api_client):
        """GET /api/integration-status requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 401
        print("✓ Integration status requires authentication")
    
    def test_integration_status_includes_email(self, authenticated_client):
        """GET /api/integration-status includes email status"""
        response = authenticated_client.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 200
        
        data = response.json()
        assert "google" in data
        assert "facebook" in data
        assert "email" in data
        assert "overall_mode" in data
        assert "setup_instructions" in data
        
        # Verify email status structure
        email_status = data["email"]
        assert "enabled" in email_status
        assert "message" in email_status
        
        # Verify setup instructions include email
        assert "email" in data["setup_instructions"]
        print(f"✓ Integration status includes email: {email_status}")


class TestNotificationSettings:
    """Notification settings endpoint tests"""
    
    def test_get_notification_settings_requires_auth(self, api_client):
        """GET /api/notifications/settings requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/notifications/settings")
        assert response.status_code == 401
        print("✓ Get notification settings requires authentication")
    
    def test_get_notification_settings_returns_defaults(self, authenticated_client):
        """GET /api/notifications/settings returns default settings"""
        response = authenticated_client.get(f"{BASE_URL}/api/notifications/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "email_new_reviews" in data
        assert "email_private_feedback" in data
        assert "email_weekly_summary" in data
        assert "notification_email" in data
        assert "email_service_enabled" in data
        
        # Verify defaults
        assert isinstance(data["email_new_reviews"], bool)
        assert isinstance(data["email_private_feedback"], bool)
        assert isinstance(data["email_weekly_summary"], bool)
        print(f"✓ Notification settings: new_reviews={data['email_new_reviews']}, private_feedback={data['email_private_feedback']}")
    
    def test_update_notification_settings_requires_auth(self, api_client):
        """PUT /api/notifications/settings requires authentication"""
        response = api_client.put(f"{BASE_URL}/api/notifications/settings", json={
            "email_new_reviews": False
        })
        assert response.status_code == 401
        print("✓ Update notification settings requires authentication")
    
    def test_update_notification_settings(self, authenticated_client):
        """PUT /api/notifications/settings updates settings"""
        # Update settings
        update_data = {
            "email_new_reviews": True,
            "email_private_feedback": True,
            "email_weekly_summary": False,
            "notification_email": "test@example.com"
        }
        response = authenticated_client.put(f"{BASE_URL}/api/notifications/settings", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        
        # Verify update by getting settings
        get_response = authenticated_client.get(f"{BASE_URL}/api/notifications/settings")
        assert get_response.status_code == 200
        
        settings = get_response.json()
        assert settings["email_new_reviews"] == True
        assert settings["email_private_feedback"] == True
        assert settings["notification_email"] == "test@example.com"
        print(f"✓ Notification settings updated and verified")
    
    def test_send_test_notification_requires_auth(self, api_client):
        """POST /api/notifications/test requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/notifications/test")
        assert response.status_code == 401
        print("✓ Send test notification requires authentication")
    
    def test_send_test_notification(self, authenticated_client):
        """POST /api/notifications/test sends test email (disabled without API key)"""
        response = authenticated_client.post(f"{BASE_URL}/api/notifications/test")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        # Without RESEND_API_KEY, status should be "disabled"
        assert data["status"] == "disabled"
        print(f"✓ Test notification response: status={data['status']}")


class TestPublicBusinessEndpoint:
    """Public business info endpoint tests (no auth required)"""
    
    def test_get_public_business_valid_qr_code(self, api_client):
        """GET /api/public/business/{qr_code_id} returns business info"""
        response = api_client.get(f"{BASE_URL}/api/public/business/{TEST_QR_CODE_ID}")
        assert response.status_code == 200
        
        data = response.json()
        assert "business_id" in data
        assert "name" in data
        assert "category" in data
        assert "platforms" in data
        
        # Verify business data
        assert data["business_id"] == TEST_BUSINESS_ID
        assert data["name"] == "TEST_ReviewFlow Business"
        
        # Check platform connections
        if "google" in data.get("platforms", {}):
            assert "connected" in data["platforms"]["google"]
            assert "review_link" in data["platforms"]["google"]
        
        print(f"✓ Public business info: name={data['name']}, platforms={list(data.get('platforms', {}).keys())}")
    
    def test_get_public_business_invalid_qr_code(self, api_client):
        """GET /api/public/business/{qr_code_id} returns 404 for invalid QR code"""
        response = api_client.get(f"{BASE_URL}/api/public/business/invalid_qr_code_123")
        assert response.status_code == 404
        print("✓ Invalid QR code returns 404")


class TestPublicReviewSubmission:
    """Public review submission endpoint tests"""
    
    def test_submit_public_review_high_rating(self, api_client):
        """POST /api/public/review submits high rating review (public)"""
        review_data = {
            "business_id": TEST_BUSINESS_ID,
            "author_name": "TEST_Happy Customer",
            "author_email": "happy@test.com",
            "rating": 5,
            "text": "Amazing experience! The service was outstanding and I will definitely come back.",
            "platform_choice": "google"
        }
        
        response = api_client.post(f"{BASE_URL}/api/public/review", json=review_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "review_id" in data
        assert "is_private" in data
        assert data["is_private"] == False  # High rating = public
        assert "platform_choice" in data
        print(f"✓ High rating review submitted: review_id={data['review_id']}, is_private={data['is_private']}")
    
    def test_submit_public_review_low_rating(self, api_client):
        """POST /api/public/review submits low rating review (private)"""
        review_data = {
            "business_id": TEST_BUSINESS_ID,
            "author_name": "TEST_Unhappy Customer",
            "author_email": "unhappy@test.com",
            "author_phone": "+1234567890",
            "rating": 2,
            "text": "The experience was disappointing. Expected much better service.",
            "platform_choice": "direct"
        }
        
        response = api_client.post(f"{BASE_URL}/api/public/review", json=review_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "review_id" in data
        assert "is_private" in data
        assert data["is_private"] == True  # Low rating = private
        print(f"✓ Low rating review submitted: review_id={data['review_id']}, is_private={data['is_private']}")
    
    def test_submit_public_review_medium_rating(self, api_client):
        """POST /api/public/review submits medium rating review (private)"""
        review_data = {
            "business_id": TEST_BUSINESS_ID,
            "author_name": "TEST_Neutral Customer",
            "rating": 3,
            "text": "It was okay. Nothing special but not bad either.",
            "platform_choice": "direct"
        }
        
        response = api_client.post(f"{BASE_URL}/api/public/review", json=review_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "review_id" in data
        assert "is_private" in data
        assert data["is_private"] == True  # Rating < 4 = private
        print(f"✓ Medium rating review submitted: review_id={data['review_id']}, is_private={data['is_private']}")
    
    def test_submit_public_review_4_star(self, api_client):
        """POST /api/public/review submits 4-star review (public)"""
        review_data = {
            "business_id": TEST_BUSINESS_ID,
            "author_name": "TEST_Good Customer",
            "rating": 4,
            "text": "Really enjoyed my visit. Great quality and friendly staff.",
            "platform_choice": "facebook"
        }
        
        response = api_client.post(f"{BASE_URL}/api/public/review", json=review_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "review_id" in data
        assert "is_private" in data
        assert data["is_private"] == False  # Rating >= 4 = public
        print(f"✓ 4-star review submitted: review_id={data['review_id']}, is_private={data['is_private']}")
    
    def test_submit_public_review_invalid_business(self, api_client):
        """POST /api/public/review returns 404 for invalid business"""
        review_data = {
            "business_id": "invalid_business_id",
            "author_name": "Test User",
            "rating": 5,
            "text": "Great!",
            "platform_choice": "direct"
        }
        
        response = api_client.post(f"{BASE_URL}/api/public/review", json=review_data)
        assert response.status_code == 404
        print("✓ Invalid business ID returns 404")


class TestAIWriteAssist:
    """AI write assist endpoint tests"""
    
    def test_ai_write_assist_requires_auth(self, api_client):
        """POST /api/ai/write-assist requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/ai/write-assist", json={
            "rating": 5,
            "business_name": "Test Business"
        })
        assert response.status_code == 401
        print("✓ AI write assist requires authentication")
    
    def test_ai_write_assist_5_star(self, authenticated_client):
        """POST /api/ai/write-assist generates 5-star review"""
        response = authenticated_client.post(f"{BASE_URL}/api/ai/write-assist", json={
            "rating": 5,
            "business_name": "Test Coffee Shop",
            "keywords": None
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "review_text" in data
        assert len(data["review_text"]) > 10
        print(f"✓ AI generated 5-star review: {data['review_text'][:50]}...")
    
    def test_ai_write_assist_with_keywords(self, authenticated_client):
        """POST /api/ai/write-assist generates review with keywords"""
        response = authenticated_client.post(f"{BASE_URL}/api/ai/write-assist", json={
            "rating": 4,
            "business_name": "Test Restaurant",
            "keywords": "great food, friendly staff"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "review_text" in data
        assert len(data["review_text"]) > 10
        print(f"✓ AI generated review with keywords: {data['review_text'][:50]}...")
    
    def test_ai_write_assist_low_rating(self, authenticated_client):
        """POST /api/ai/write-assist generates low rating review"""
        response = authenticated_client.post(f"{BASE_URL}/api/ai/write-assist", json={
            "rating": 2,
            "business_name": "Test Place",
            "keywords": None
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "review_text" in data
        assert len(data["review_text"]) > 10
        print(f"✓ AI generated 2-star review: {data['review_text'][:50]}...")


class TestReviewRouting:
    """Test smart review routing based on rating"""
    
    def test_review_routing_logic(self, api_client):
        """Verify review routing: <4 stars = private, >=4 stars = public"""
        test_cases = [
            (1, True, "1-star should be private"),
            (2, True, "2-star should be private"),
            (3, True, "3-star should be private"),
            (4, False, "4-star should be public"),
            (5, False, "5-star should be public"),
        ]
        
        for rating, expected_private, description in test_cases:
            review_data = {
                "business_id": TEST_BUSINESS_ID,
                "author_name": f"TEST_Routing_{rating}star",
                "rating": rating,
                "text": f"Test review for {rating}-star routing",
                "platform_choice": "direct"
            }
            
            response = api_client.post(f"{BASE_URL}/api/public/review", json=review_data)
            assert response.status_code == 200
            
            data = response.json()
            assert data["is_private"] == expected_private, f"Failed: {description}"
            print(f"✓ {description}: is_private={data['is_private']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
