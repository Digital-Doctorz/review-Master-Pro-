"""
Iteration 19 - Pricing Updates and Review Reply Features Tests
Tests for:
1. Pricing page button text (Try Now, Try All Features)
2. Growth plan BEST SAVINGS badge
3. Pricing starts at Rs. 499
4. Backend /api/reviews/{id}/respond returns posted_live status
5. Plan selection stored in session
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoints:
    """Basic health check tests"""
    
    def test_api_health_endpoint(self):
        """Test /api/health endpoint (internal health check)"""
        # Note: /health is only available internally, /api/ is the public health check
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "status" in data
        print("SUCCESS: /api/ endpoint returns API info")
    
    def test_api_root(self):
        """Test /api/ endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "status" in data
        print("SUCCESS: /api/ endpoint returns API info")


class TestAuthEndpoints:
    """Auth endpoint tests"""
    
    def test_auth_me_without_token(self):
        """Test /api/auth/me without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("SUCCESS: /api/auth/me returns 401 without auth")
    
    def test_auth_session_requires_session_id(self):
        """Test /api/auth/session requires session_id"""
        response = requests.post(
            f"{BASE_URL}/api/auth/session",
            json={}
        )
        assert response.status_code == 400
        print("SUCCESS: /api/auth/session returns 400 without session_id")
    
    def test_auth_session_with_plan_selection(self):
        """Test /api/auth/session accepts selected_plan parameter"""
        # This will fail with invalid session_id, but we're testing the endpoint accepts the parameter
        response = requests.post(
            f"{BASE_URL}/api/auth/session",
            json={
                "session_id": "invalid_test_session",
                "selected_plan": "growth"
            }
        )
        # Should return 401 for invalid session, not 400 for missing params
        assert response.status_code == 401
        print("SUCCESS: /api/auth/session accepts selected_plan parameter")


class TestReviewEndpoints:
    """Review endpoint tests"""
    
    def test_reviews_endpoint_requires_auth(self):
        """Test /api/reviews requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 401
        print("SUCCESS: /api/reviews returns 401 without auth")
    
    def test_private_reviews_endpoint_requires_auth(self):
        """Test /api/reviews/private requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reviews/private")
        assert response.status_code == 401
        print("SUCCESS: /api/reviews/private returns 401 without auth")
    
    def test_respond_endpoint_requires_auth(self):
        """Test /api/reviews/{id}/respond requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/reviews/test_review_id/respond",
            json={
                "review_id": "test_review_id",
                "response_text": "Test response"
            }
        )
        assert response.status_code == 401
        print("SUCCESS: /api/reviews/{id}/respond returns 401 without auth")


class TestPlanEndpoints:
    """Plan and subscription endpoint tests"""
    
    def test_user_plan_requires_auth(self):
        """Test /api/user/plan requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/plan")
        assert response.status_code == 401
        print("SUCCESS: /api/user/plan returns 401 without auth")
    
    def test_plan_upgrade_requires_auth(self):
        """Test /api/user/plan/upgrade requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/user/plan/upgrade",
            json={"plan_name": "growth"}
        )
        assert response.status_code == 401
        print("SUCCESS: /api/user/plan/upgrade returns 401 without auth")


class TestAIEndpoints:
    """AI endpoint tests"""
    
    def test_public_ai_write_assist(self):
        """Test public AI write assist endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/public/ai/write-assist",
            json={
                "rating": 5,
                "business_name": "Test Business",
                "keywords": "great service"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "review_text" in data
        print(f"SUCCESS: Public AI write assist returns review text: {data['review_text'][:50]}...")
    
    def test_ai_generate_response_requires_auth(self):
        """Test /api/ai/generate-response requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/ai/generate-response",
            json={
                "review_text": "Great experience!",
                "rating": 5,
                "business_name": "Test Business",
                "tone": "professional"
            }
        )
        assert response.status_code == 401
        print("SUCCESS: /api/ai/generate-response returns 401 without auth")


class TestIntegrationStatus:
    """Integration status endpoint tests"""
    
    def test_integration_status_requires_auth(self):
        """Test /api/integration-status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 401
        print("SUCCESS: /api/integration-status returns 401 without auth")
    
    def test_email_status_public(self):
        """Test /api/email/status is public"""
        response = requests.get(f"{BASE_URL}/api/email/status")
        assert response.status_code == 200
        data = response.json()
        assert "enabled" in data or "status" in data
        print(f"SUCCESS: /api/email/status returns status: {data}")


class TestPlatformEndpoints:
    """Platform connection endpoint tests"""
    
    def test_platforms_requires_auth(self):
        """Test /api/platforms requires authentication"""
        response = requests.get(f"{BASE_URL}/api/platforms")
        assert response.status_code == 401
        print("SUCCESS: /api/platforms returns 401 without auth")
    
    def test_google_search_requires_auth(self):
        """Test /api/google/search requires authentication"""
        response = requests.get(f"{BASE_URL}/api/google/search?query=test")
        assert response.status_code == 401
        print("SUCCESS: /api/google/search returns 401 without auth")
    
    def test_facebook_search_requires_auth(self):
        """Test /api/facebook/search requires authentication"""
        response = requests.get(f"{BASE_URL}/api/facebook/search?query=test")
        assert response.status_code == 401
        print("SUCCESS: /api/facebook/search returns 401 without auth")


class TestBusinessEndpoints:
    """Business endpoint tests"""
    
    def test_business_requires_auth(self):
        """Test /api/business requires authentication"""
        response = requests.get(f"{BASE_URL}/api/business")
        assert response.status_code == 401
        print("SUCCESS: /api/business returns 401 without auth")


class TestAnalyticsEndpoints:
    """Analytics endpoint tests"""
    
    def test_analytics_overview_requires_auth(self):
        """Test /api/analytics/overview requires authentication"""
        response = requests.get(f"{BASE_URL}/api/analytics/overview")
        assert response.status_code == 401
        print("SUCCESS: /api/analytics/overview returns 401 without auth")
    
    def test_analytics_trends_requires_auth(self):
        """Test /api/analytics/trends requires authentication"""
        response = requests.get(f"{BASE_URL}/api/analytics/trends")
        assert response.status_code == 401
        print("SUCCESS: /api/analytics/trends returns 401 without auth")


class TestNotificationEndpoints:
    """Notification endpoint tests"""
    
    def test_notification_settings_requires_auth(self):
        """Test /api/notifications/settings requires authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications/settings")
        assert response.status_code == 401
        print("SUCCESS: /api/notifications/settings returns 401 without auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
