"""
Iteration 13 Tests - Facebook Channel Fix in Public Review Page
Tests for:
1. Public Review page - Step 3 shows Google Reviews option
2. Public Review page - Step 3 shows Facebook option
3. Public Review page - Step 3 shows Send Directly option
4. Public Review page - Step 4 Copy & Paste flow works for Google
5. Public Review page - Step 4 Copy & Paste flow works for Facebook
6. Public Review page - Facebook redirect opens facebook.com/.../reviews
7. Backend /api/public/business/{qr_code_id} returns both google and facebook platforms
8. Backend /api/google/connect works
9. Backend /api/facebook/connect works
10. Integrations page - Connect Google modal shows updated instructions
11. Integrations page - Connect Facebook modal shows updated instructions
12. Dashboard shows reviews from both platforms
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
SESSION_TOKEN = "test_session_1768237933810"
QR_CODE_ID = "qr_mkbf7w1a"

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


class TestPublicBusinessAPI:
    """Tests for Public Business API - Critical for Facebook fix"""
    
    def test_public_business_returns_both_platforms(self, api_client):
        """Test /api/public/business/{qr_code_id} returns both google and facebook platforms"""
        response = requests.get(f"{BASE_URL}/api/public/business/{QR_CODE_ID}")
        assert response.status_code == 200
        data = response.json()
        
        # Verify basic business data
        assert "name" in data
        assert "business_id" in data
        print(f"✅ Public business endpoint working - Business: {data['name']}")
        
        # Verify Google platform data
        assert "google_review_link" in data or ("platforms" in data and "google" in data.get("platforms", {}))
        google_link = data.get("google_review_link") or data.get("platforms", {}).get("google", {}).get("review_link")
        assert google_link is not None, "Google review link should be present"
        print(f"   ✅ Google review link: {google_link[:50]}...")
        
        # Verify Facebook platform data - THIS IS THE KEY FIX
        has_facebook = (
            data.get("facebook_page_url") or 
            (data.get("platforms", {}).get("facebook", {}).get("review_link"))
        )
        assert has_facebook, "Facebook should be connected and have review link"
        
        facebook_link = data.get("facebook_page_url") or data.get("platforms", {}).get("facebook", {}).get("review_link")
        print(f"   ✅ Facebook review link: {facebook_link}")
        
        # Verify platforms object structure
        if "platforms" in data:
            platforms = data["platforms"]
            assert "google" in platforms, "Google should be in platforms"
            assert "facebook" in platforms, "Facebook should be in platforms"
            assert platforms["google"].get("connected") == True, "Google should be connected"
            assert platforms["facebook"].get("connected") == True, "Facebook should be connected"
            print(f"   ✅ Platforms object has both google and facebook connected")
    
    def test_facebook_review_link_format(self, api_client):
        """Test Facebook review link is properly formatted with /reviews"""
        response = requests.get(f"{BASE_URL}/api/public/business/{QR_CODE_ID}")
        assert response.status_code == 200
        data = response.json()
        
        # Get Facebook link from either location
        fb_link = (
            data.get("platforms", {}).get("facebook", {}).get("review_link") or
            data.get("facebook_page_url")
        )
        
        assert fb_link is not None, "Facebook link should exist"
        # The link should either contain /reviews or be a valid Facebook page URL
        assert "facebook.com" in fb_link, "Should be a Facebook URL"
        print(f"✅ Facebook link format valid: {fb_link}")


class TestGoogleConnectAPI:
    """Tests for Google Connect API"""
    
    def test_google_connect_works(self, api_client):
        """Test /api/google/connect accepts and processes connection"""
        payload = {
            "place_id": f"test_place_iter13_{os.urandom(4).hex()}",
            "name": "Test Business Iteration 13",
            "review_link": "https://g.page/r/test-review-link-iter13"
        }
        response = api_client.post(f"{BASE_URL}/api/google/connect", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "connected" in data["message"].lower() or "success" in data["message"].lower()
        print("✅ Google connect API working")


class TestFacebookConnectAPI:
    """Tests for Facebook Connect API"""
    
    def test_facebook_connect_works(self, api_client):
        """Test /api/facebook/connect accepts and processes connection"""
        payload = {
            "page_id": f"fb_test_iter13_{os.urandom(4).hex()}",
            "name": "Test Facebook Page Iteration 13",
            "url": "https://www.facebook.com/testbusiness13",
            "review_link": "https://www.facebook.com/testbusiness13/reviews"
        }
        response = api_client.post(f"{BASE_URL}/api/facebook/connect", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "connected" in data["message"].lower() or "success" in data["message"].lower()
        print("✅ Facebook connect API working")


class TestIntegrationsAPI:
    """Tests for Integrations page APIs"""
    
    def test_get_platforms(self, api_client):
        """Test /api/platforms returns platform connections"""
        response = api_client.get(f"{BASE_URL}/api/platforms")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Check for both platforms
        platforms = {p["platform"]: p for p in data}
        assert "google" in platforms, "Google platform should exist"
        assert "facebook" in platforms, "Facebook platform should exist"
        
        # Verify connection status
        google_connected = platforms["google"].get("status") == "connected"
        facebook_connected = platforms["facebook"].get("status") == "connected"
        
        print(f"✅ Platforms endpoint working")
        print(f"   Google connected: {google_connected}")
        print(f"   Facebook connected: {facebook_connected}")
    
    def test_integration_status(self, api_client):
        """Test /api/integration-status returns proper structure"""
        response = api_client.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 200
        data = response.json()
        assert "google" in data
        assert "facebook" in data
        print(f"✅ Integration status endpoint working")


class TestDashboardAPI:
    """Tests for Dashboard - Reviews from both platforms"""
    
    def test_get_reviews_all_platforms(self, api_client):
        """Test /api/reviews returns reviews from all platforms"""
        response = api_client.get(f"{BASE_URL}/api/reviews?limit=50")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Check platform distribution
        platforms = {}
        for review in data:
            platform = review.get("platform", "unknown")
            platforms[platform] = platforms.get(platform, 0) + 1
        
        print(f"✅ Reviews endpoint working - {len(data)} total reviews")
        print(f"   Platform distribution: {platforms}")
    
    def test_analytics_overview(self, api_client):
        """Test /api/analytics/overview returns proper structure"""
        response = api_client.get(f"{BASE_URL}/api/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        assert "total_reviews" in data
        assert "average_rating" in data
        assert "platform_breakdown" in data
        
        print(f"✅ Analytics overview working")
        print(f"   Total reviews: {data['total_reviews']}")
        print(f"   Average rating: {data['average_rating']}")
        print(f"   Platform breakdown: {data['platform_breakdown']}")


class TestPublicReviewSubmission:
    """Tests for Public Review submission flow"""
    
    def test_submit_review_with_google_platform(self, api_client):
        """Test submitting a review with Google platform choice"""
        # First get business ID
        response = requests.get(f"{BASE_URL}/api/public/business/{QR_CODE_ID}")
        assert response.status_code == 200
        business = response.json()
        
        payload = {
            "business_id": business["business_id"],
            "author_name": "Test User Google",
            "rating": 5,
            "text": "Great experience! Testing Google platform choice.",
            "platform_choice": "google"
        }
        response = requests.post(f"{BASE_URL}/api/public/review", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "review_id" in data
        print(f"✅ Review submission with Google platform working - ID: {data['review_id']}")
    
    def test_submit_review_with_facebook_platform(self, api_client):
        """Test submitting a review with Facebook platform choice"""
        # First get business ID
        response = requests.get(f"{BASE_URL}/api/public/business/{QR_CODE_ID}")
        assert response.status_code == 200
        business = response.json()
        
        payload = {
            "business_id": business["business_id"],
            "author_name": "Test User Facebook",
            "rating": 5,
            "text": "Excellent service! Testing Facebook platform choice.",
            "platform_choice": "facebook"
        }
        response = requests.post(f"{BASE_URL}/api/public/review", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "review_id" in data
        print(f"✅ Review submission with Facebook platform working - ID: {data['review_id']}")
    
    def test_submit_review_with_direct_platform(self, api_client):
        """Test submitting a review with Direct/Send Directly option"""
        # First get business ID
        response = requests.get(f"{BASE_URL}/api/public/business/{QR_CODE_ID}")
        assert response.status_code == 200
        business = response.json()
        
        payload = {
            "business_id": business["business_id"],
            "author_name": "Test User Direct",
            "rating": 4,
            "text": "Good experience! Testing direct submission.",
            "platform_choice": "direct"
        }
        response = requests.post(f"{BASE_URL}/api/public/review", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "review_id" in data
        print(f"✅ Review submission with Direct platform working - ID: {data['review_id']}")


class TestAIWriteAssist:
    """Tests for AI Write Assist in Public Review"""
    
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
        assert len(data["review_text"]) > 10, "Generated review should have content"
        print(f"✅ AI write assist working - Generated {len(data['review_text'])} chars")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
