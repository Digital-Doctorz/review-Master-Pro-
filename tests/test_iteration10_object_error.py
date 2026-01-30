"""
Test file for iteration 10 - [object Object] error fix verification
Tests all API endpoints to ensure no [object Object] errors appear
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://reviewhub-38.preview.emergentagent.com')
SESSION_TOKEN = "test_session_1768237933810"
BUSINESS_ID = "biz_test_1768237947117"
QR_CODE_ID = "qr_mkbf7w1a"


class TestHealthEndpoint:
    """Test health endpoint"""
    
    def test_health_returns_healthy(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_auth_me_with_valid_session(self):
        """Test /api/auth/me returns user data"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert "name" in data
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)
    
    def test_auth_me_without_session(self):
        """Test /api/auth/me returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401


class TestBusinessEndpoints:
    """Test business endpoints"""
    
    def test_get_business(self):
        """Test /api/business returns business data"""
        response = requests.get(
            f"{BASE_URL}/api/business",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "business_id" in data
        assert "name" in data
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)


class TestAnalyticsEndpoints:
    """Test analytics endpoints - key area for [object Object] bug"""
    
    def test_analytics_overview_structure(self):
        """Test /api/analytics/overview returns proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/overview",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields exist
        assert "total_reviews" in data
        assert "average_rating" in data
        assert "sentiment_breakdown" in data
        assert "rating_distribution" in data
        assert "response_rate" in data
        assert "platform_breakdown" in data
        
        # Verify sentiment_breakdown is a dict with proper keys
        assert isinstance(data["sentiment_breakdown"], dict)
        assert "positive" in data["sentiment_breakdown"]
        assert "neutral" in data["sentiment_breakdown"]
        assert "negative" in data["sentiment_breakdown"]
        
        # Verify rating_distribution is a dict
        assert isinstance(data["rating_distribution"], dict)
        
        # Verify platform_breakdown is a dict
        assert isinstance(data["platform_breakdown"], dict)
        
        # CRITICAL: Verify no [object Object] in response
        response_str = str(data)
        assert "[object Object]" not in response_str
        assert "object Object" not in response_str
    
    def test_analytics_trends(self):
        """Test /api/analytics/trends returns array"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/trends?days=30",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should be a list
        assert isinstance(data, list)
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)


class TestReviewsEndpoints:
    """Test reviews endpoints"""
    
    def test_get_reviews_returns_array(self):
        """Test /api/reviews returns proper array"""
        response = requests.get(
            f"{BASE_URL}/api/reviews",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should be a list
        assert isinstance(data, list)
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)
    
    def test_get_private_reviews_returns_array(self):
        """Test /api/reviews/private returns proper array"""
        response = requests.get(
            f"{BASE_URL}/api/reviews/private",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should be a list
        assert isinstance(data, list)
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)
    
    def test_reviews_filter_by_platform(self):
        """Test /api/reviews with platform filter"""
        response = requests.get(
            f"{BASE_URL}/api/reviews?platform=google",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert "[object Object]" not in str(data)


class TestPlatformsEndpoints:
    """Test platforms endpoints"""
    
    def test_get_platforms_returns_array(self):
        """Test /api/platforms returns proper array"""
        response = requests.get(
            f"{BASE_URL}/api/platforms",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should be a list
        assert isinstance(data, list)
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)


class TestIntegrationStatusEndpoint:
    """Test integration status endpoint"""
    
    def test_integration_status_structure(self):
        """Test /api/integration-status returns proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/integration-status",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "google" in data
        assert "facebook" in data
        assert "overall_mode" in data
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)


class TestPublicEndpoints:
    """Test public endpoints (no auth required)"""
    
    def test_public_business_info(self):
        """Test /api/public/business/{qr_code_id} returns business info"""
        response = requests.get(f"{BASE_URL}/api/public/business/{QR_CODE_ID}")
        assert response.status_code == 200
        data = response.json()
        
        assert "business_id" in data
        assert "name" in data
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)


class TestSearchEndpoints:
    """Test Google/Facebook search endpoints"""
    
    def test_google_search(self):
        """Test /api/google/search returns results"""
        response = requests.get(
            f"{BASE_URL}/api/google/search?query=coffee",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "results" in data
        assert isinstance(data["results"], list)
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)
    
    def test_facebook_search(self):
        """Test /api/facebook/search returns results"""
        response = requests.get(
            f"{BASE_URL}/api/facebook/search?query=coffee",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "results" in data
        assert isinstance(data["results"], list)
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)


class TestAPICredentialsEndpoints:
    """Test API credentials endpoints"""
    
    def test_get_api_credentials(self):
        """Test /api/settings/api-credentials returns credentials"""
        response = requests.get(
            f"{BASE_URL}/api/settings/api-credentials",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)


class TestAIEndpoints:
    """Test AI generation endpoints"""
    
    def test_ai_write_assist(self):
        """Test /api/public/ai/write-assist generates review text"""
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
        assert isinstance(data["review_text"], str)
        
        # Verify no [object Object] in response
        assert "[object Object]" not in str(data)


class TestErrorHandling:
    """Test error handling doesn't produce [object Object]"""
    
    def test_404_error_message(self):
        """Test 404 errors return proper message"""
        response = requests.get(f"{BASE_URL}/api/nonexistent-endpoint")
        assert response.status_code == 404
        data = response.json()
        
        # Verify error message is a string, not [object Object]
        if "detail" in data:
            assert isinstance(data["detail"], str)
            assert "[object Object]" not in data["detail"]
    
    def test_401_error_message(self):
        """Test 401 errors return proper message"""
        response = requests.get(f"{BASE_URL}/api/business")
        assert response.status_code == 401
        data = response.json()
        
        # Verify error message is a string, not [object Object]
        if "detail" in data:
            assert isinstance(data["detail"], str)
            assert "[object Object]" not in data["detail"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
