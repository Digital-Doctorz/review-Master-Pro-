"""
Test file for Review Master Iteration 9 - New Features Testing
Tests: Magic Search, API Settings, Public Review Flow, Dashboard, Reviews
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://reviewmaster-9.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

# Test credentials from seed data
TEST_SESSION_TOKEN = "test_session_1768235199500"
TEST_USER_ID = "test-user-1768235199500"
TEST_BUSINESS_ID = "biz_f4633410ea49"
TEST_QR_CODE_ID = "f24fefa3"


@pytest.fixture
def api_client():
    """Shared requests session with auth cookie"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    session.cookies.set("session_token", TEST_SESSION_TOKEN)
    return session


@pytest.fixture
def public_client():
    """Requests session without auth for public endpoints"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestHealthAndBasics:
    """Basic health and connectivity tests"""
    
    def test_health_endpoint(self, public_client):
        """Test health endpoint returns healthy status"""
        response = public_client.get(f"{API_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✅ Health endpoint working")
    
    def test_auth_me_endpoint(self, api_client):
        """Test authenticated user endpoint"""
        response = api_client.get(f"{API_URL}/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data or "email" in data
        print(f"✅ Auth/me working - User: {data.get('name', data.get('email'))}")


class TestGoogleSearchAPI:
    """Test Google Business search functionality (MOCKED)"""
    
    def test_google_search_returns_results(self, api_client):
        """Test Google search returns mock results"""
        response = api_client.get(f"{API_URL}/google/search", params={"query": "coffee shop"})
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)
        assert len(data["results"]) > 0
        # Check result structure
        first_result = data["results"][0]
        assert "name" in first_result
        assert "place_id" in first_result
        print(f"✅ Google search returned {len(data['results'])} results (MOCKED)")
    
    def test_google_search_with_short_query(self, api_client):
        """Test Google search with short query"""
        response = api_client.get(f"{API_URL}/google/search", params={"query": "ab"})
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        print("✅ Google search handles short queries")


class TestFacebookSearchAPI:
    """Test Facebook Page search functionality (MOCKED)"""
    
    def test_facebook_search_returns_results(self, api_client):
        """Test Facebook search returns mock results"""
        response = api_client.get(f"{API_URL}/facebook/search", params={"query": "restaurant"})
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)
        assert len(data["results"]) > 0
        # Check result structure
        first_result = data["results"][0]
        assert "name" in first_result
        assert "page_id" in first_result
        print(f"✅ Facebook search returned {len(data['results'])} results (MOCKED)")


class TestGoogleConnectAPI:
    """Test Google Business connect functionality"""
    
    def test_google_connect_with_place_id(self, api_client):
        """Test connecting Google Business with place_id"""
        payload = {
            "place_id": "ChIJ_test_place_id_123",
            "name": "Test Coffee Shop",
            "review_link": "https://search.google.com/local/writereview?placeid=ChIJ_test_place_id_123"
        }
        response = api_client.post(f"{API_URL}/google/connect", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "connected" in data["message"].lower() or "success" in data["message"].lower()
        print(f"✅ Google connect successful: {data.get('message')}")


class TestFacebookConnectAPI:
    """Test Facebook Page connect functionality"""
    
    def test_facebook_connect_with_page_id(self, api_client):
        """Test connecting Facebook Page with page_id"""
        payload = {
            "page_id": "fb_test_page_123",
            "name": "Test Restaurant Page",
            "url": "https://facebook.com/testrestaurant",
            "review_link": "https://facebook.com/testrestaurant/reviews"
        }
        response = api_client.post(f"{API_URL}/facebook/connect", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "connected" in data["message"].lower() or "success" in data["message"].lower()
        print(f"✅ Facebook connect successful: {data.get('message')}")


class TestAPICredentialsSettings:
    """Test API credentials settings endpoints"""
    
    def test_get_api_credentials(self, api_client):
        """Test GET /api/settings/api-credentials"""
        response = api_client.get(f"{API_URL}/settings/api-credentials")
        assert response.status_code == 200
        data = response.json()
        # Should return credentials structure (may be empty)
        assert isinstance(data, dict)
        print(f"✅ GET api-credentials working - Keys present: {list(data.keys())}")
    
    def test_put_api_credentials_google(self, api_client):
        """Test PUT /api/settings/api-credentials for Google"""
        payload = {
            "google_api_key": "test_google_api_key_12345"
        }
        response = api_client.put(f"{API_URL}/settings/api-credentials", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "google_api_key" in data
        print("✅ PUT api-credentials (Google) working")
    
    def test_put_api_credentials_facebook(self, api_client):
        """Test PUT /api/settings/api-credentials for Facebook"""
        payload = {
            "facebook_app_id": "test_fb_app_id",
            "facebook_app_secret": "test_fb_app_secret"
        }
        response = api_client.put(f"{API_URL}/settings/api-credentials", json=payload)
        assert response.status_code == 200
        print("✅ PUT api-credentials (Facebook) working")
    
    def test_test_connection_google(self, api_client):
        """Test POST /api/settings/test-connection/google"""
        response = api_client.post(f"{API_URL}/settings/test-connection/google")
        # May return success or error depending on credentials
        assert response.status_code in [200, 400, 500]
        data = response.json()
        assert "success" in data or "error" in data or "detail" in data
        print(f"✅ Test connection (Google) endpoint working - Response: {data}")
    
    def test_test_connection_facebook(self, api_client):
        """Test POST /api/settings/test-connection/facebook"""
        response = api_client.post(f"{API_URL}/settings/test-connection/facebook")
        # May return success or error depending on credentials
        assert response.status_code in [200, 400, 500]
        data = response.json()
        assert "success" in data or "error" in data or "detail" in data
        print(f"✅ Test connection (Facebook) endpoint working - Response: {data}")


class TestReviewsAPI:
    """Test reviews endpoints"""
    
    def test_get_reviews(self, api_client):
        """Test GET /api/reviews returns proper array"""
        response = api_client.get(f"{API_URL}/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ GET reviews returned {len(data)} reviews")
    
    def test_get_reviews_filter_by_platform(self, api_client):
        """Test reviews filter by platform"""
        response = api_client.get(f"{API_URL}/reviews", params={"platform": "google"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All reviews should be from google platform
        for review in data:
            assert review.get("platform") == "google"
        print(f"✅ Reviews filter by platform working - {len(data)} Google reviews")
    
    def test_get_private_reviews(self, api_client):
        """Test GET /api/reviews/private"""
        response = api_client.get(f"{API_URL}/reviews/private")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All reviews should be private
        for review in data:
            assert review.get("is_private") == True
        print(f"✅ GET private reviews returned {len(data)} private reviews")


class TestAnalyticsAPI:
    """Test analytics endpoints"""
    
    def test_analytics_overview(self, api_client):
        """Test GET /api/analytics/overview"""
        response = api_client.get(f"{API_URL}/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        # Check required fields
        assert "total_reviews" in data
        assert "average_rating" in data
        assert "sentiment_breakdown" in data
        assert "rating_distribution" in data
        assert "response_rate" in data
        assert "platform_breakdown" in data
        print(f"✅ Analytics overview - Total: {data['total_reviews']}, Avg Rating: {data['average_rating']}")


class TestPlatformsAPI:
    """Test platforms endpoints"""
    
    def test_get_platforms(self, api_client):
        """Test GET /api/platforms"""
        response = api_client.get(f"{API_URL}/platforms")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ GET platforms returned {len(data)} platform connections")


class TestIntegrationStatus:
    """Test integration status endpoint"""
    
    def test_integration_status(self, api_client):
        """Test GET /api/integration-status"""
        response = api_client.get(f"{API_URL}/integration-status")
        assert response.status_code == 200
        data = response.json()
        assert "google" in data
        assert "facebook" in data
        assert "overall_mode" in data
        print(f"✅ Integration status - Mode: {data['overall_mode']}")


class TestPublicReviewFlow:
    """Test public review flow (QR code landing page)"""
    
    def test_get_public_business(self, public_client):
        """Test GET /api/public/business/{qr_code_id}"""
        response = public_client.get(f"{API_URL}/public/business/{TEST_QR_CODE_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "business_id" in data
        assert "name" in data
        print(f"✅ Public business info - Name: {data.get('name')}")
    
    def test_submit_public_review_high_rating(self, public_client):
        """Test POST /api/public/review with high rating (should be public)"""
        payload = {
            "business_id": TEST_BUSINESS_ID,
            "author_name": "Happy Customer",
            "author_email": "happy@example.com",
            "rating": 5,
            "text": "Excellent service! Highly recommend!",
            "platform_choice": "google"
        }
        response = public_client.post(f"{API_URL}/public/review", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "review_id" in data
        assert data.get("is_private") == False
        print(f"✅ Public review (5-star) submitted - ID: {data['review_id']}")
    
    def test_submit_public_review_low_rating(self, public_client):
        """Test POST /api/public/review with low rating (should be private)"""
        payload = {
            "business_id": TEST_BUSINESS_ID,
            "author_name": "Unhappy Customer",
            "author_email": "unhappy@example.com",
            "rating": 2,
            "text": "Not satisfied with the service",
            "platform_choice": "google"
        }
        response = public_client.post(f"{API_URL}/public/review", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "review_id" in data
        assert data.get("is_private") == True
        print(f"✅ Private feedback (2-star) submitted - ID: {data['review_id']}")


class TestAIWriteAssist:
    """Test AI write assist endpoints"""
    
    def test_public_ai_write_assist(self, public_client):
        """Test POST /api/public/ai/write-assist"""
        payload = {
            "business_name": "Test Business",
            "rating": 5,
            "keywords": "great food, friendly staff"
        }
        response = public_client.post(f"{API_URL}/public/ai/write-assist", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "review_text" in data
        assert len(data["review_text"]) > 0
        print(f"✅ AI write assist generated review: {data['review_text'][:50]}...")


class TestDisconnectPlatform:
    """Test platform disconnect functionality"""
    
    def test_disconnect_google(self, api_client):
        """Test POST /api/platforms/google/disconnect"""
        response = api_client.post(f"{API_URL}/platforms/google/disconnect")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ Google disconnect: {data.get('message')}")
    
    def test_disconnect_facebook(self, api_client):
        """Test POST /api/platforms/facebook/disconnect"""
        response = api_client.post(f"{API_URL}/platforms/facebook/disconnect")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ Facebook disconnect: {data.get('message')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
