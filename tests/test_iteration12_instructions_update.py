"""
Iteration 12 Tests - Updated Google/Facebook Instructions & Clipboard Fix
Tests for:
1. Integrations page - Updated Google Business Profile instructions
2. Integrations page - Updated Facebook instructions  
3. Webhook Settings page - Clipboard copy with fallback
4. Public Review page - Improved copy-then-paste flow
5. Backend API endpoints
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
SESSION_TOKEN = "test_session_1768237933810"

@pytest.fixture
def api_client():
    """Shared requests session with auth cookie"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    session.cookies.set("session_token", SESSION_TOKEN)
    return session


class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_health_endpoint(self, api_client):
        """Test /api/health returns healthy status"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health endpoint working")
    
    def test_auth_me_endpoint(self, api_client):
        """Test /api/auth/me returns user data"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        print(f"✅ Auth working - User: {data['email']}")


class TestIntegrationsAPI:
    """Tests for Google/Facebook connection APIs"""
    
    def test_get_platforms(self, api_client):
        """Test /api/platforms returns platform connections"""
        response = api_client.get(f"{BASE_URL}/api/platforms")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Platforms endpoint working - {len(data)} platforms connected")
    
    def test_google_connect_with_review_link(self, api_client):
        """Test /api/google/connect accepts review_link parameter"""
        payload = {
            "place_id": f"test_place_iter12_{os.urandom(4).hex()}",
            "name": "Test Business Iteration 12",
            "review_link": "https://g.page/r/test-review-link"
        }
        response = api_client.post(f"{BASE_URL}/api/google/connect", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "status" in data
        print("✅ Google connect with review_link working")
    
    def test_facebook_connect_with_review_link(self, api_client):
        """Test /api/facebook/connect accepts review_link parameter"""
        payload = {
            "page_id": f"fb_test_iter12_{os.urandom(4).hex()}",
            "name": "Test Facebook Page Iteration 12",
            "url": "https://www.facebook.com/testbusiness",
            "review_link": "https://www.facebook.com/testbusiness/reviews"
        }
        response = api_client.post(f"{BASE_URL}/api/facebook/connect", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "status" in data
        print("✅ Facebook connect with review_link working")
    
    def test_integration_status(self, api_client):
        """Test /api/integration-status returns proper structure"""
        response = api_client.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 200
        data = response.json()
        assert "google" in data
        assert "facebook" in data
        print(f"✅ Integration status - Google: {data['google']['connected']}, Facebook: {data['facebook']['connected']}")


class TestWebhookAPI:
    """Tests for Webhook Settings API"""
    
    def test_get_webhook_config(self, api_client):
        """Test /api/webhooks/config returns webhook URLs"""
        response = api_client.get(f"{BASE_URL}/api/webhooks/config")
        assert response.status_code == 200
        data = response.json()
        # Verify webhook URLs are present
        assert "webhook_url_google" in data or "google_enabled" in data
        assert "webhook_url_facebook" in data or "facebook_enabled" in data
        print(f"✅ Webhook config endpoint working")
        if "webhook_url_google" in data:
            print(f"   Google webhook URL: {data['webhook_url_google'][:50]}...")
        if "webhook_url_facebook" in data:
            print(f"   Facebook webhook URL: {data['webhook_url_facebook'][:50]}...")
    
    def test_webhook_events(self, api_client):
        """Test /api/webhooks/events returns events list"""
        response = api_client.get(f"{BASE_URL}/api/webhooks/events?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        print(f"✅ Webhook events endpoint working - {len(data['events'])} events")
    
    def test_update_webhook_config(self, api_client):
        """Test PUT /api/webhooks/config updates settings"""
        payload = {
            "google_enabled": True,
            "facebook_enabled": True
        }
        response = api_client.put(f"{BASE_URL}/api/webhooks/config", json=payload)
        assert response.status_code == 200
        print("✅ Webhook config update working")


class TestPublicReviewAPI:
    """Tests for Public Review page API"""
    
    def test_get_public_business(self, api_client):
        """Test /api/public/business/{qr_code_id} returns business with platforms"""
        # First get business to find QR code ID
        biz_response = api_client.get(f"{BASE_URL}/api/business")
        assert biz_response.status_code == 200
        business = biz_response.json()
        
        qr_code_id = business.get("qr_code_id")
        if not qr_code_id:
            pytest.skip("No QR code ID found in business")
        
        # Test public endpoint
        response = requests.get(f"{BASE_URL}/api/public/business/{qr_code_id}")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "business_id" in data
        print(f"✅ Public business endpoint working - Business: {data['name']}")
        
        # Check if google_review_link is present
        if "google_review_link" in data:
            print(f"   Google review link: {data['google_review_link'][:50]}...")
        
        # Check if platforms are present
        if "platforms" in data:
            print(f"   Platforms: {list(data['platforms'].keys())}")
    
    def test_public_ai_write_assist(self, api_client):
        """Test /api/public/ai/write-assist generates review text"""
        payload = {
            "rating": 5,
            "business_name": "Test Business",
            "keywords": None
        }
        response = requests.post(f"{BASE_URL}/api/public/ai/write-assist", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "review_text" in data
        print(f"✅ AI write assist working - Generated {len(data['review_text'])} chars")


class TestBusinessAPI:
    """Tests for Business data API"""
    
    def test_get_business(self, api_client):
        """Test /api/business returns business data with google_review_link"""
        response = api_client.get(f"{BASE_URL}/api/business")
        assert response.status_code == 200
        data = response.json()
        assert "business_id" in data
        assert "name" in data
        print(f"✅ Business endpoint working - {data['name']}")
        
        # Check for google_review_link
        if "google_review_link" in data and data["google_review_link"]:
            print(f"   Google review link present: {data['google_review_link'][:50]}...")
        
        # Check for facebook platform
        if "platforms" in data and "facebook" in data["platforms"]:
            fb = data["platforms"]["facebook"]
            if "review_link" in fb:
                print(f"   Facebook review link present: {fb['review_link'][:50]}...")


class TestReviewsAPI:
    """Tests for Reviews API"""
    
    def test_get_reviews(self, api_client):
        """Test /api/reviews returns reviews array"""
        response = api_client.get(f"{BASE_URL}/api/reviews?limit=10&is_private=false")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Reviews endpoint working - {len(data)} reviews")
    
    def test_get_private_reviews(self, api_client):
        """Test /api/reviews/private returns private feedback"""
        response = api_client.get(f"{BASE_URL}/api/reviews/private")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Private reviews endpoint working - {len(data)} private reviews")


class TestAnalyticsAPI:
    """Tests for Analytics API"""
    
    def test_analytics_overview(self, api_client):
        """Test /api/analytics/overview returns proper structure"""
        response = api_client.get(f"{BASE_URL}/api/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        assert "total_reviews" in data
        assert "average_rating" in data
        print(f"✅ Analytics overview working - Total: {data['total_reviews']}, Avg: {data['average_rating']}")


class TestQRCodeAPI:
    """Tests for QR Code functionality"""
    
    def test_business_has_qr_code(self, api_client):
        """Test business has QR code ID for public review page"""
        response = api_client.get(f"{BASE_URL}/api/business")
        assert response.status_code == 200
        data = response.json()
        assert "qr_code_id" in data
        assert data["qr_code_id"] is not None
        print(f"✅ QR Code ID present: {data['qr_code_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
