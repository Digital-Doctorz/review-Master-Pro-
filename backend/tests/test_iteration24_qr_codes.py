"""
Iteration 24 - QR Code Scanning Fix Tests
Tests for GET /api/public/business/{qr_code_id} and POST /api/public/review
- Real QR codes (qr_191a9cd1) should find location in locations collection
- Demo QR codes (demo_qr_001) should return mock data
- Review submission should work with location_id
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestQRCodeLookup:
    """Tests for QR code lookup endpoint - GET /api/public/business/{qr_code_id}"""
    
    def test_real_qr_code_returns_optm_health_care(self):
        """Real QR code qr_191a9cd1 should return OPTM Health Care data"""
        response = requests.get(f"{BASE_URL}/api/public/business/qr_191a9cd1")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify business name
        assert data.get("name") == "OPTM Health Care", f"Expected 'OPTM Health Care', got {data.get('name')}"
        
        # Verify location_id is returned
        assert data.get("location_id") == "loc_8cdb3f54", f"Expected location_id 'loc_8cdb3f54', got {data.get('location_id')}"
        
        # Verify address
        assert "145" in data.get("address", ""), f"Expected address containing '145', got {data.get('address')}"
        assert "Rashbehari" in data.get("address", ""), f"Expected address containing 'Rashbehari', got {data.get('address')}"
        
        # Verify Google review link
        assert data.get("google_review_link") == "https://g.page/r/CflFjp9J6VijEBM/review", \
            f"Expected Google review link, got {data.get('google_review_link')}"
        
        # Verify Facebook page URL
        assert data.get("facebook_page_url") == "https://www.facebook.com/OPTMHealthCare", \
            f"Expected Facebook URL, got {data.get('facebook_page_url')}"
    
    def test_real_qr_code_has_google_platform(self):
        """Real QR code should have Google platform connected"""
        response = requests.get(f"{BASE_URL}/api/public/business/qr_191a9cd1")
        
        assert response.status_code == 200
        data = response.json()
        
        platforms = data.get("platforms", {})
        assert "google" in platforms, "Google platform should be connected"
        assert platforms["google"]["connected"] == True, "Google should be connected"
        assert platforms["google"]["review_link"] == "https://g.page/r/CflFjp9J6VijEBM/review", \
            f"Google review link mismatch: {platforms['google'].get('review_link')}"
    
    def test_real_qr_code_has_facebook_platform(self):
        """Real QR code should have Facebook platform connected"""
        response = requests.get(f"{BASE_URL}/api/public/business/qr_191a9cd1")
        
        assert response.status_code == 200
        data = response.json()
        
        platforms = data.get("platforms", {})
        assert "facebook" in platforms, "Facebook platform should be connected"
        assert platforms["facebook"]["connected"] == True, "Facebook should be connected"
        assert "OPTMHealthCare" in platforms["facebook"]["review_link"], \
            f"Facebook review link should contain OPTMHealthCare: {platforms['facebook'].get('review_link')}"
    
    def test_demo_qr_code_returns_demo_coffee_shop(self):
        """Demo QR code demo_qr_001 should return Demo Coffee Shop data"""
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_001")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify demo business
        assert data.get("name") == "Demo Coffee Shop", f"Expected 'Demo Coffee Shop', got {data.get('name')}"
        assert data.get("business_id") == "demo_business_001", f"Expected 'demo_business_001', got {data.get('business_id')}"
        assert data.get("is_demo") == True, "Should be marked as demo"
        assert data.get("category") == "Restaurant & Cafe", f"Expected 'Restaurant & Cafe', got {data.get('category')}"
    
    def test_demo_qr_code_has_both_platforms(self):
        """Demo QR code should have both Google and Facebook platforms"""
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_001")
        
        assert response.status_code == 200
        data = response.json()
        
        platforms = data.get("platforms", {})
        assert "google" in platforms, "Demo should have Google platform"
        assert "facebook" in platforms, "Demo should have Facebook platform"
        assert platforms["google"]["connected"] == True
        assert platforms["facebook"]["connected"] == True
    
    def test_invalid_qr_code_returns_404(self):
        """Invalid QR code should return 404"""
        response = requests.get(f"{BASE_URL}/api/public/business/invalid_qr_xyz123")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"


class TestReviewSubmission:
    """Tests for review submission endpoint - POST /api/public/review"""
    
    def test_submit_review_with_location_id(self):
        """Submit review with location_id (loc_8cdb3f54) should succeed"""
        payload = {
            "business_id": "loc_8cdb3f54",
            "author_name": "Test User Iter24",
            "author_email": "test_iter24@example.com",
            "rating": 5,
            "text": "Excellent healthcare service! Very professional staff.",
            "platform_choice": "google"
        }
        
        response = requests.post(f"{BASE_URL}/api/public/review", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "review_id" in data, "Response should contain review_id"
        assert data.get("is_private") == False, "5-star review should not be private"
        assert data.get("platform_choice") == "google", f"Platform choice should be 'google', got {data.get('platform_choice')}"
    
    def test_submit_private_review_low_rating(self):
        """Low rating (< 4) should create private review"""
        payload = {
            "business_id": "loc_8cdb3f54",
            "author_name": "Unhappy Customer",
            "author_email": "unhappy@example.com",
            "author_phone": "+91 9876543210",
            "rating": 2,
            "text": "Service could be improved. Long wait times.",
            "platform_choice": "google"
        }
        
        response = requests.post(f"{BASE_URL}/api/public/review", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("is_private") == True, "Low rating review should be private"
        assert "review_id" in data
    
    def test_submit_demo_review_returns_mock_success(self):
        """Demo business review should return mock success without DB save"""
        payload = {
            "business_id": "demo_business_001",
            "author_name": "Demo Reviewer",
            "author_email": "demo@example.com",
            "rating": 4,
            "text": "Great demo experience!",
            "platform_choice": "direct"
        }
        
        response = requests.post(f"{BASE_URL}/api/public/review", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("is_demo") == True, "Demo review should be marked as demo"
        assert "demo_review_" in data.get("review_id", ""), "Demo review_id should have demo prefix"
    
    def test_submit_review_invalid_business_returns_404(self):
        """Review for invalid business should return 404"""
        payload = {
            "business_id": "invalid_business_xyz",
            "author_name": "Test User",
            "rating": 5,
            "text": "Test review",
            "platform_choice": "direct"
        }
        
        response = requests.post(f"{BASE_URL}/api/public/review", json=payload)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_submit_review_with_facebook_platform(self):
        """Submit review with Facebook platform choice"""
        payload = {
            "business_id": "loc_8cdb3f54",
            "author_name": "Facebook Reviewer",
            "author_email": "fb_reviewer@example.com",
            "rating": 5,
            "text": "Amazing service! Will recommend to friends.",
            "platform_choice": "facebook"
        }
        
        response = requests.post(f"{BASE_URL}/api/public/review", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("platform_choice") == "facebook", f"Platform should be 'facebook', got {data.get('platform_choice')}"
    
    def test_submit_direct_review(self):
        """Submit direct review (not to Google/Facebook)"""
        payload = {
            "business_id": "loc_8cdb3f54",
            "author_name": "Direct Reviewer",
            "author_email": "direct@example.com",
            "rating": 4,
            "text": "Good service overall.",
            "platform_choice": "direct"
        }
        
        response = requests.post(f"{BASE_URL}/api/public/review", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("is_private") == False, "4-star review should not be private"


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_health(self):
        """API health endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
    
    def test_api_root(self):
        """API root should return version info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "version" in data or "message" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
