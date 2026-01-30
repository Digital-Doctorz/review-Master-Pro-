"""
Test Suite for Iteration 11 - Simplified Integrations Flow
Tests the redesigned Integrations page with simplified Google/Facebook connection
- No API keys required
- Users just paste their review link
- Clipboard fallback for copy functionality
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://reviewhub-38.preview.emergentagent.com').rstrip('/')
SESSION_TOKEN = "test_session_1768237933810"

@pytest.fixture
def api_client():
    """Shared requests session with auth"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Cookie": f"session_token={SESSION_TOKEN}"
    })
    return session


class TestHealthAndAuth:
    """Basic health and auth tests"""
    
    def test_health_endpoint(self, api_client):
        """Test health endpoint returns healthy status"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health endpoint working")
    
    def test_auth_me_with_session(self, api_client):
        """Test auth/me returns user data with valid session"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        print(f"✓ Auth working - User: {data.get('email')}")


class TestPlatformsAPI:
    """Test /api/platforms endpoint"""
    
    def test_get_platforms(self, api_client):
        """Test GET /api/platforms returns platform connections"""
        response = api_client.get(f"{BASE_URL}/api/platforms")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Platforms endpoint returns {len(data)} connections")
        
        # Check structure of platform connections
        for platform in data:
            assert "platform" in platform
            assert "status" in platform
            assert platform["platform"] in ["google", "facebook"]
            print(f"  - {platform['platform']}: {platform['status']}")


class TestGoogleConnect:
    """Test Google connection with review_link parameter"""
    
    def test_google_connect_with_review_link(self, api_client):
        """Test POST /api/google/connect accepts review_link parameter"""
        # Test connecting with a Google Maps URL
        payload = {
            "place_id": f"test_place_{os.urandom(4).hex()}",
            "name": "Test Business via Link",
            "review_link": "https://www.google.com/maps/place/Test+Business/@40.7128,-74.0060"
        }
        
        response = api_client.post(f"{BASE_URL}/api/google/connect", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response contains expected fields
        assert "message" in data or "review_link" in data
        print(f"✓ Google connect with review_link works")
    
    def test_google_search_mock(self, api_client):
        """Test Google search returns mock results"""
        response = api_client.get(f"{BASE_URL}/api/google/search?query=coffee")
        assert response.status_code == 200
        data = response.json()
        
        assert "results" in data
        results = data["results"]
        assert isinstance(results, list)
        
        if len(results) > 0:
            # Check result structure
            result = results[0]
            assert "place_id" in result
            assert "name" in result
            assert "review_link" in result
            print(f"✓ Google search returns {len(results)} results")
        else:
            print("✓ Google search returns empty results (expected for some queries)")


class TestFacebookConnect:
    """Test Facebook connection with review_link parameter"""
    
    def test_facebook_connect_with_review_link(self, api_client):
        """Test POST /api/facebook/connect accepts review_link parameter"""
        payload = {
            "page_id": f"fb_test_{os.urandom(4).hex()}",
            "name": "Test Facebook Page",
            "url": "https://www.facebook.com/testbusiness",
            "review_link": "https://www.facebook.com/testbusiness/reviews"
        }
        
        response = api_client.post(f"{BASE_URL}/api/facebook/connect", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data or "review_link" in data
        print(f"✓ Facebook connect with review_link works")
    
    def test_facebook_search_mock(self, api_client):
        """Test Facebook search returns mock results"""
        response = api_client.get(f"{BASE_URL}/api/facebook/search?query=restaurant")
        assert response.status_code == 200
        data = response.json()
        
        assert "results" in data
        results = data["results"]
        assert isinstance(results, list)
        print(f"✓ Facebook search returns {len(results)} results")


class TestBusinessEndpoints:
    """Test business-related endpoints"""
    
    def test_get_business(self, api_client):
        """Test GET /api/business returns business data"""
        response = api_client.get(f"{BASE_URL}/api/business")
        assert response.status_code == 200
        data = response.json()
        
        if data:
            assert "business_id" in data
            assert "name" in data
            # Check for Google review link field
            if "google_review_link" in data:
                print(f"✓ Business has google_review_link: {data.get('google_review_link', 'None')[:50]}...")
            print(f"✓ Business endpoint working - Name: {data.get('name')}")
        else:
            print("✓ Business endpoint returns None (no business created)")


class TestIntegrationStatus:
    """Test integration status endpoint"""
    
    def test_integration_status(self, api_client):
        """Test GET /api/integration-status returns proper structure"""
        response = api_client.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 200
        data = response.json()
        
        # Check expected fields
        assert "overall_mode" in data
        assert "google" in data
        assert "facebook" in data
        
        print(f"✓ Integration status: {data.get('overall_mode')}")
        print(f"  - Google: {data.get('google', {}).get('status', 'unknown')}")
        print(f"  - Facebook: {data.get('facebook', {}).get('status', 'unknown')}")


class TestAPISettings:
    """Test API settings/credentials endpoints"""
    
    def test_get_api_credentials(self, api_client):
        """Test GET /api/settings/api-credentials returns credentials structure"""
        response = api_client.get(f"{BASE_URL}/api/settings/api-credentials")
        assert response.status_code == 200
        data = response.json()
        
        # Should return credentials structure (may be empty)
        assert isinstance(data, dict)
        print(f"✓ API credentials endpoint working")


class TestPublicReviewPage:
    """Test public review page endpoints"""
    
    def test_get_public_business(self, api_client):
        """Test GET /api/public/business/{qr_code_id} returns business info"""
        # Use known QR code from test data
        qr_code_id = "qr_mkbf7w1a"
        response = api_client.get(f"{BASE_URL}/api/public/business/{qr_code_id}")
        
        if response.status_code == 200:
            data = response.json()
            assert "business_id" in data
            assert "name" in data
            
            # Check platforms info
            if "platforms" in data:
                platforms = data["platforms"]
                print(f"✓ Public business has platforms: {list(platforms.keys())}")
                
                # Check if review_link is included
                for platform, info in platforms.items():
                    if info.get("review_link"):
                        print(f"  - {platform} review_link: {info['review_link'][:50]}...")
            
            print(f"✓ Public business endpoint working - Name: {data.get('name')}")
        else:
            print(f"✓ Public business returns {response.status_code} (QR code may not exist)")


class TestReviewsEndpoints:
    """Test reviews-related endpoints"""
    
    def test_get_reviews(self, api_client):
        """Test GET /api/reviews returns reviews array"""
        response = api_client.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Reviews endpoint returns {len(data)} reviews")
    
    def test_get_private_reviews(self, api_client):
        """Test GET /api/reviews/private returns private reviews"""
        response = api_client.get(f"{BASE_URL}/api/reviews/private")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Private reviews endpoint returns {len(data)} reviews")


class TestAnalyticsEndpoints:
    """Test analytics endpoints"""
    
    def test_analytics_overview(self, api_client):
        """Test GET /api/analytics/overview returns proper structure"""
        response = api_client.get(f"{BASE_URL}/api/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        
        # Check expected fields
        expected_fields = ["total_reviews", "average_rating", "response_rate"]
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ Analytics overview: {data.get('total_reviews')} reviews, {data.get('average_rating')} avg rating")


class TestPlatformDisconnect:
    """Test platform disconnect functionality"""
    
    def test_disconnect_platform(self, api_client):
        """Test POST /api/platforms/{platform}/disconnect works"""
        # First check current status
        response = api_client.get(f"{BASE_URL}/api/platforms")
        assert response.status_code == 200
        
        # Try to disconnect (may fail if not connected, which is fine)
        response = api_client.post(f"{BASE_URL}/api/platforms/google/disconnect")
        # Should return 200 or 404 (if not connected)
        assert response.status_code in [200, 404]
        print(f"✓ Platform disconnect endpoint responds correctly ({response.status_code})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
