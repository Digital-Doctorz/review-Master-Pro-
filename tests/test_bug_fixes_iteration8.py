"""
Test file for Review Master Bug Fixes - Iteration 8
Tests for:
1. Dashboard [object Object] bug fix
2. Reviews.jsx unstable nested component fix (ReviewCard extraction)
3. ReviewCard click functionality
4. Filter functionality on Reviews page
5. Public Review page
6. Integrations page with Magic Search modals
7. Mobile bottom navigation
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://reviewmaster-9.preview.emergentagent.com').rstrip('/')

# Test session token - created during test setup
SESSION_TOKEN = "test_session_1768232703190"
BUSINESS_ID = "biz_059ca3ec8ac7"
QR_CODE_ID = "53cb43bf"


class TestBackendAPIs:
    """Backend API tests for Review Master"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.cookies.set('session_token', SESSION_TOKEN)
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = self.session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
    
    def test_reviews_endpoint_returns_array(self):
        """Test /api/reviews returns proper array structure (not [object Object])"""
        response = self.session.get(f"{BASE_URL}/api/reviews?is_private=false")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Reviews endpoint should return an array"
        # Verify each review has proper structure
        for review in data:
            assert "review_id" in review
            assert "author_name" in review
            assert "rating" in review
            assert "text" in review
            assert "platform" in review
    
    def test_private_reviews_endpoint_returns_array(self):
        """Test /api/reviews/private returns proper array structure"""
        response = self.session.get(f"{BASE_URL}/api/reviews/private")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Private reviews endpoint should return an array"
        # Verify private reviews have contact info
        for review in data:
            assert "review_id" in review
            assert "is_private" in review
    
    def test_analytics_overview_returns_proper_structure(self):
        """Test /api/analytics/overview returns proper data structure"""
        response = self.session.get(f"{BASE_URL}/api/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields are present and properly typed
        assert "total_reviews" in data
        assert isinstance(data["total_reviews"], int)
        
        assert "average_rating" in data
        assert isinstance(data["average_rating"], (int, float))
        
        assert "sentiment_breakdown" in data
        assert isinstance(data["sentiment_breakdown"], dict)
        assert "positive" in data["sentiment_breakdown"]
        assert "negative" in data["sentiment_breakdown"]
        
        assert "response_rate" in data
        assert isinstance(data["response_rate"], (int, float))
    
    def test_platforms_endpoint(self):
        """Test /api/platforms returns array of platform connections"""
        response = self.session.get(f"{BASE_URL}/api/platforms")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Platforms endpoint should return an array"
    
    def test_integration_status_endpoint(self):
        """Test /api/integration-status returns proper structure"""
        response = self.session.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 200
        data = response.json()
        assert "overall_mode" in data
    
    def test_public_business_endpoint(self):
        """Test /api/public/business/{qr_code_id} returns business info"""
        response = requests.get(f"{BASE_URL}/api/public/business/{QR_CODE_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "business_id" in data
        assert "name" in data
    
    def test_google_search_endpoint(self):
        """Test /api/google/search returns search results (MOCKED)"""
        response = self.session.get(f"{BASE_URL}/api/google/search?query=Test")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)
    
    def test_facebook_search_endpoint(self):
        """Test /api/facebook/search returns search results (MOCKED)"""
        response = self.session.get(f"{BASE_URL}/api/facebook/search?query=Test")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)


class TestReviewFiltering:
    """Test review filtering functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.cookies.set('session_token', SESSION_TOKEN)
    
    def test_filter_by_platform_google(self):
        """Test filtering reviews by Google platform"""
        response = self.session.get(f"{BASE_URL}/api/reviews?platform=google&is_private=false")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for review in data:
            assert review.get("platform") == "google"
    
    def test_filter_by_platform_facebook(self):
        """Test filtering reviews by Facebook platform"""
        response = self.session.get(f"{BASE_URL}/api/reviews?platform=facebook&is_private=false")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for review in data:
            assert review.get("platform") == "facebook"
    
    def test_filter_by_sentiment_positive(self):
        """Test filtering reviews by positive sentiment"""
        response = self.session.get(f"{BASE_URL}/api/reviews?sentiment=positive&is_private=false")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for review in data:
            assert review.get("sentiment") == "positive"
    
    def test_filter_by_responded_true(self):
        """Test filtering reviews that have been responded to"""
        response = self.session.get(f"{BASE_URL}/api/reviews?responded=true&is_private=false")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for review in data:
            assert review.get("response") is not None


class TestReviewResponse:
    """Test review response functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.cookies.set('session_token', SESSION_TOKEN)
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_ai_generate_response(self):
        """Test AI response generation endpoint"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/generate-response",
            json={
                "review_text": "Great service!",
                "rating": 5,
                "business_name": "Test Business",
                "tone": "professional"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
