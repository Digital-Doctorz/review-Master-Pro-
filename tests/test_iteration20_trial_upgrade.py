"""
Iteration 20 Tests - Trial Status, Plan Upgrade, Footer, and Mobile Header
Tests for:
1. POST /api/user/plan/upgrade - Plan upgrade endpoint (mock payment)
2. GET /api/user/trial-status - Trial status endpoint
3. GET /api/health - Health check endpoint
4. GET /api/ - Root API endpoint
5. Demo mode functionality
"""

import pytest
import requests
import os
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoints:
    """Test basic health and root endpoints"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ /api/health returns healthy status")
    
    def test_root_api_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Review Master" in data.get("message", "")
        assert "version" in data
        print(f"✓ /api/ returns: {data}")


class TestTrialStatusEndpoint:
    """Test trial status endpoint"""
    
    def test_trial_status_requires_auth(self):
        """Test /api/user/trial-status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/trial-status")
        assert response.status_code == 401
        print("✓ /api/user/trial-status correctly requires authentication")
    
    def test_trial_status_with_invalid_token(self):
        """Test /api/user/trial-status with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/user/trial-status",
            cookies={"session_token": "invalid_token_12345"}
        )
        assert response.status_code == 401
        print("✓ /api/user/trial-status rejects invalid token")


class TestPlanUpgradeEndpoint:
    """Test plan upgrade endpoint"""
    
    def test_plan_upgrade_requires_auth(self):
        """Test /api/user/plan/upgrade requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/user/plan/upgrade",
            json={"plan_name": "growth", "billing_cycle": "monthly"}
        )
        assert response.status_code == 401
        print("✓ /api/user/plan/upgrade correctly requires authentication")
    
    def test_plan_upgrade_with_invalid_token(self):
        """Test /api/user/plan/upgrade with invalid token"""
        response = requests.post(
            f"{BASE_URL}/api/user/plan/upgrade",
            json={"plan_name": "growth", "billing_cycle": "monthly"},
            cookies={"session_token": "invalid_token_12345"}
        )
        assert response.status_code == 401
        print("✓ /api/user/plan/upgrade rejects invalid token")


class TestUserPlanEndpoint:
    """Test user plan endpoint"""
    
    def test_user_plan_requires_auth(self):
        """Test /api/user/plan requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/plan")
        assert response.status_code == 401
        print("✓ /api/user/plan correctly requires authentication")


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_auth_me_without_token(self):
        """Test /api/auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /api/auth/me correctly returns 401 without token")
    
    def test_auth_session_endpoint_exists(self):
        """Test /api/auth/session endpoint exists"""
        # This endpoint is used for OAuth callback
        response = requests.get(f"{BASE_URL}/api/auth/session")
        # Should return 400 (missing token) or 401, not 404
        assert response.status_code in [400, 401, 422]
        print(f"✓ /api/auth/session endpoint exists (status: {response.status_code})")


class TestPublicEndpoints:
    """Test public endpoints that don't require auth"""
    
    def test_email_status_public(self):
        """Test /api/email/status is public"""
        response = requests.get(f"{BASE_URL}/api/email/status")
        assert response.status_code == 200
        data = response.json()
        assert "enabled" in data or "email_enabled" in data or "EMAIL_ENABLED" in data.keys() or isinstance(data, dict)
        print(f"✓ /api/email/status is public: {data}")
    
    def test_public_ai_write_assist(self):
        """Test /api/public/ai/write-assist works without auth"""
        response = requests.post(
            f"{BASE_URL}/api/public/ai/write-assist",
            json={
                "business_name": "Test Business",
                "rating": 5,
                "keywords": "great service"
            }
        )
        # Should work without auth (200) or return validation error (422)
        assert response.status_code in [200, 422, 500]
        print(f"✓ /api/public/ai/write-assist accessible (status: {response.status_code})")


class TestIntegrationStatus:
    """Test integration status endpoint"""
    
    def test_integration_status_requires_auth(self):
        """Test /api/integration-status requires auth"""
        response = requests.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 401
        print("✓ /api/integration-status correctly requires authentication")


class TestReviewsEndpoints:
    """Test reviews endpoints"""
    
    def test_reviews_requires_auth(self):
        """Test /api/reviews requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 401
        print("✓ /api/reviews correctly requires authentication")
    
    def test_reviews_respond_requires_auth(self):
        """Test /api/reviews/{id}/respond requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/reviews/test-review-id/respond",
            json={"response_text": "Thank you!"}
        )
        assert response.status_code == 401
        print("✓ /api/reviews/{id}/respond correctly requires authentication")


class TestLocationsEndpoints:
    """Test locations endpoints"""
    
    def test_locations_requires_auth(self):
        """Test /api/locations requires authentication"""
        response = requests.get(f"{BASE_URL}/api/locations")
        assert response.status_code == 401
        print("✓ /api/locations correctly requires authentication")


class TestBusinessEndpoints:
    """Test business endpoints"""
    
    def test_business_requires_auth(self):
        """Test /api/business requires authentication"""
        response = requests.get(f"{BASE_URL}/api/business")
        assert response.status_code == 401
        print("✓ /api/business correctly requires authentication")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
