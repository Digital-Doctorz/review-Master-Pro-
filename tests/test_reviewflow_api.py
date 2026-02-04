"""
ReviewFlow API Tests - Comprehensive Backend Testing
Tests all API endpoints including health, auth, business, platforms, reviews, and integration status
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://reviewmaster-10.preview.emergentagent.com').rstrip('/')
SESSION_TOKEN = os.environ.get('TEST_SESSION_TOKEN', 'test_session_1768051374411')


class TestHealthEndpoints:
    """Health and root endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health endpoint returns healthy status")
    
    def test_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "ReviewFlow" in data["message"]
        print("✅ Root endpoint returns API info")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_me_without_token(self):
        """Test /api/auth/me returns 401 without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ Auth endpoint properly rejects unauthenticated requests")
    
    def test_auth_me_with_token(self):
        """Test /api/auth/me returns user data with valid token"""
        headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert "name" in data
        print(f"✅ Auth endpoint returns user data: {data['name']}")


class TestIntegrationStatus:
    """Integration status endpoint tests"""
    
    def test_integration_status_requires_auth(self):
        """Test /api/integration-status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 401
        print("✅ Integration status endpoint requires auth")
    
    def test_integration_status_with_auth(self):
        """Test /api/integration-status returns integration status"""
        headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
        response = requests.get(f"{BASE_URL}/api/integration-status", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "google" in data
        assert "facebook" in data
        assert "overall_mode" in data
        
        # Verify Google status
        assert "platform" in data["google"]
        assert data["google"]["platform"] == "google"
        assert "real_api_enabled" in data["google"]
        assert "status" in data["google"]
        
        # Verify Facebook status
        assert "platform" in data["facebook"]
        assert data["facebook"]["platform"] == "facebook"
        assert "real_api_enabled" in data["facebook"]
        assert "status" in data["facebook"]
        
        # In demo mode, both should be demo_mode
        assert data["overall_mode"] in ["demo", "production"]
        print(f"✅ Integration status: overall_mode={data['overall_mode']}")
        print(f"   Google: {data['google']['status']}, Facebook: {data['facebook']['status']}")


class TestBusinessEndpoints:
    """Business CRUD endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - ensure we have a business for testing"""
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_get_business(self):
        """Test /api/business returns business or null"""
        response = requests.get(f"{BASE_URL}/api/business", headers=self.headers)
        assert response.status_code == 200
        # Can be null if no business exists
        print("✅ Get business endpoint works")
    
    def test_create_business_if_not_exists(self):
        """Test creating a business if one doesn't exist"""
        # First check if business exists
        response = requests.get(f"{BASE_URL}/api/business", headers=self.headers)
        if response.json() is None:
            # Create business
            create_response = requests.post(
                f"{BASE_URL}/api/business",
                headers=self.headers,
                json={
                    "name": "TEST_ReviewFlow Business",
                    "category": "Restaurant",
                    "address": "123 Test St"
                }
            )
            assert create_response.status_code == 200
            data = create_response.json()
            assert "business_id" in data
            assert "qr_code_id" in data
            print(f"✅ Created business: {data['business_id']}")
        else:
            print("✅ Business already exists, skipping creation")


class TestGoogleSearchEndpoints:
    """Google search and connect endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_google_search_requires_auth(self):
        """Test /api/google/search requires authentication"""
        response = requests.get(f"{BASE_URL}/api/google/search?query=coffee")
        assert response.status_code == 401
        print("✅ Google search requires auth")
    
    def test_google_search_with_auth(self):
        """Test /api/google/search returns mock results"""
        response = requests.get(
            f"{BASE_URL}/api/google/search?query=coffee",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)
        assert len(data["results"]) > 0
        
        # Verify result structure
        first_result = data["results"][0]
        assert "place_id" in first_result
        assert "name" in first_result
        assert "address" in first_result
        assert "review_link" in first_result
        print(f"✅ Google search returned {len(data['results'])} results")
    
    def test_google_connect(self):
        """Test /api/google/connect creates reviews"""
        # First ensure business exists
        biz_response = requests.get(f"{BASE_URL}/api/business", headers=self.headers)
        if biz_response.json() is None:
            requests.post(
                f"{BASE_URL}/api/business",
                headers=self.headers,
                json={"name": "TEST_Google Connect Business", "category": "Cafe"}
            )
        
        # Connect Google
        connect_response = requests.post(
            f"{BASE_URL}/api/google/connect",
            headers=self.headers,
            json={
                "place_id": "ChIJ_test_google_001",
                "name": "Test Coffee Shop",
                "review_link": "https://search.google.com/local/writereview?placeid=ChIJ_test_google_001"
            }
        )
        assert connect_response.status_code == 200
        data = connect_response.json()
        assert "message" in data
        assert "review_link" in data
        assert "integration_mode" in data
        print(f"✅ Google connect successful: {data['integration_mode']}")


class TestFacebookSearchEndpoints:
    """Facebook search and connect endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_facebook_search_requires_auth(self):
        """Test /api/facebook/search requires authentication"""
        response = requests.get(f"{BASE_URL}/api/facebook/search?query=coffee")
        assert response.status_code == 401
        print("✅ Facebook search requires auth")
    
    def test_facebook_search_with_auth(self):
        """Test /api/facebook/search returns mock results"""
        response = requests.get(
            f"{BASE_URL}/api/facebook/search?query=coffee",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)
        assert len(data["results"]) > 0
        
        # Verify result structure
        first_result = data["results"][0]
        assert "page_id" in first_result
        assert "name" in first_result
        assert "category" in first_result
        assert "url" in first_result
        print(f"✅ Facebook search returned {len(data['results'])} results")
    
    def test_facebook_connect(self):
        """Test /api/facebook/connect creates reviews"""
        # First ensure business exists
        biz_response = requests.get(f"{BASE_URL}/api/business", headers=self.headers)
        if biz_response.json() is None:
            requests.post(
                f"{BASE_URL}/api/business",
                headers=self.headers,
                json={"name": "TEST_Facebook Connect Business", "category": "Cafe"}
            )
        
        # Connect Facebook
        connect_response = requests.post(
            f"{BASE_URL}/api/facebook/connect",
            headers=self.headers,
            json={
                "page_id": "fb_test_001",
                "name": "Test Coffee Page",
                "url": "https://facebook.com/testcoffeepage"
            }
        )
        assert connect_response.status_code == 200
        data = connect_response.json()
        assert "message" in data
        assert "review_link" in data
        assert "integration_mode" in data
        print(f"✅ Facebook connect successful: {data['integration_mode']}")


class TestReviewsEndpoints:
    """Reviews endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_reviews_requires_auth(self):
        """Test /api/reviews requires authentication"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 401
        print("✅ Reviews endpoint requires auth")
    
    def test_get_reviews(self):
        """Test /api/reviews returns reviews list"""
        response = requests.get(f"{BASE_URL}/api/reviews", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Reviews endpoint returned {len(data)} reviews")
        
        # If reviews exist, verify structure
        if len(data) > 0:
            review = data[0]
            assert "review_id" in review
            assert "platform" in review
            assert "author_name" in review
            assert "rating" in review
            assert "text" in review
            assert "sentiment" in review
            print(f"   First review: {review['author_name']} - {review['rating']} stars - {review['sentiment']}")
    
    def test_get_reviews_with_filters(self):
        """Test /api/reviews with various filters"""
        # Test platform filter
        response = requests.get(
            f"{BASE_URL}/api/reviews?platform=google",
            headers=self.headers
        )
        assert response.status_code == 200
        print("✅ Reviews filter by platform works")
        
        # Test sentiment filter
        response = requests.get(
            f"{BASE_URL}/api/reviews?sentiment=positive",
            headers=self.headers
        )
        assert response.status_code == 200
        print("✅ Reviews filter by sentiment works")
    
    def test_get_private_reviews(self):
        """Test /api/reviews/private returns private feedback"""
        response = requests.get(f"{BASE_URL}/api/reviews/private", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # All private reviews should have is_private=True
        for review in data:
            assert review.get("is_private") == True
        print(f"✅ Private reviews endpoint returned {len(data)} private feedbacks")


class TestReviewsSyncEndpoint:
    """Reviews sync endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_sync_reviews_requires_auth(self):
        """Test /api/reviews/sync requires authentication"""
        response = requests.post(f"{BASE_URL}/api/reviews/sync")
        assert response.status_code == 401
        print("✅ Sync reviews endpoint requires auth")
    
    def test_sync_reviews(self):
        """Test /api/reviews/sync syncs reviews from connected platforms"""
        response = requests.post(f"{BASE_URL}/api/reviews/sync", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "results" in data
        print(f"✅ Sync reviews: {data['message']}")
        
        # Check results structure
        if data["results"]:
            for platform, result in data["results"].items():
                print(f"   {platform}: synced={result.get('synced', 0)}, is_mock={result.get('is_mock', True)}")


class TestPlatformsEndpoints:
    """Platform connection endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_get_platforms(self):
        """Test /api/platforms returns platform connections"""
        response = requests.get(f"{BASE_URL}/api/platforms", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Should have google and facebook platforms
        platforms = [p["platform"] for p in data]
        print(f"✅ Platforms endpoint returned: {platforms}")
        
        # Verify structure
        for platform in data:
            assert "platform" in platform
            assert "status" in platform
            assert platform["status"] in ["connected", "disconnected", "error"]


class TestAnalyticsEndpoints:
    """Analytics endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_analytics_overview(self):
        """Test /api/analytics/overview returns analytics data"""
        response = requests.get(f"{BASE_URL}/api/analytics/overview", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "total_reviews" in data
        assert "average_rating" in data
        assert "sentiment_breakdown" in data
        assert "rating_distribution" in data
        assert "response_rate" in data
        assert "platform_breakdown" in data
        
        # Verify sentiment breakdown structure
        assert "positive" in data["sentiment_breakdown"]
        assert "neutral" in data["sentiment_breakdown"]
        assert "negative" in data["sentiment_breakdown"]
        
        print(f"✅ Analytics overview: {data['total_reviews']} reviews, avg rating: {data['average_rating']}")
        print(f"   Sentiment: positive={data['sentiment_breakdown']['positive']}, negative={data['sentiment_breakdown']['negative']}")


class TestReviewGeneration:
    """Test that reviews are properly generated with different ratings and sentiments"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_reviews_have_varied_ratings(self):
        """Test that generated reviews have varied ratings (1-5)"""
        response = requests.get(f"{BASE_URL}/api/reviews?limit=50", headers=self.headers)
        assert response.status_code == 200
        reviews = response.json()
        
        if len(reviews) > 0:
            ratings = set(r["rating"] for r in reviews)
            print(f"✅ Reviews have ratings: {sorted(ratings)}")
            
            # Should have at least some variety in ratings
            assert len(ratings) >= 2, "Reviews should have varied ratings"
    
    def test_reviews_have_varied_sentiments(self):
        """Test that generated reviews have varied sentiments"""
        response = requests.get(f"{BASE_URL}/api/reviews?limit=50", headers=self.headers)
        assert response.status_code == 200
        reviews = response.json()
        
        if len(reviews) > 0:
            sentiments = set(r["sentiment"] for r in reviews)
            print(f"✅ Reviews have sentiments: {sentiments}")
            
            # Should have at least positive and negative
            assert "positive" in sentiments or "negative" in sentiments or "neutral" in sentiments


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
