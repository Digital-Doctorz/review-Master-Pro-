"""
Iteration 21 Tests - Demo QR Code, QR Customization, and Branding Features
Tests:
- Demo QR code page loads at /review/demo_qr_001 (no 404 error)
- Demo business info returns correctly from GET /api/public/business/demo_qr_001
- Demo review submission works at POST /api/public/review with demo_business_001
- Full demo review flow verification
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasics:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("SUCCESS: Health endpoint returns healthy")
    
    def test_root_api_endpoint(self):
        """Test root API endpoint returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Review Master" in data["message"]
        print("SUCCESS: Root API endpoint returns API info")


class TestDemoQRCodeFeatures:
    """Tests for demo QR code functionality"""
    
    def test_demo_business_endpoint_returns_data(self):
        """Test GET /api/public/business/demo_qr_001 returns demo business data"""
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_001")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify required fields
        assert data["business_id"] == "demo_business_001"
        assert data["name"] == "Demo Coffee Shop"
        assert data["category"] == "Restaurant & Cafe"
        assert data["is_demo"] == True
        
        # Verify platform connections
        assert "platforms" in data
        assert "google" in data["platforms"]
        assert "facebook" in data["platforms"]
        assert data["platforms"]["google"]["connected"] == True
        assert data["platforms"]["facebook"]["connected"] == True
        
        print("SUCCESS: Demo business endpoint returns correct data")
    
    def test_demo_business_has_google_review_link(self):
        """Test demo business has Google review link"""
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_001")
        assert response.status_code == 200
        
        data = response.json()
        assert "google_review_link" in data
        assert data["google_review_link"] is not None
        assert "g.page" in data["google_review_link"] or "google" in data["google_review_link"]
        
        print("SUCCESS: Demo business has Google review link")
    
    def test_demo_business_has_facebook_page_url(self):
        """Test demo business has Facebook page URL"""
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_001")
        assert response.status_code == 200
        
        data = response.json()
        assert "facebook_page_url" in data
        assert data["facebook_page_url"] is not None
        assert "facebook.com" in data["facebook_page_url"]
        
        print("SUCCESS: Demo business has Facebook page URL")
    
    def test_demo_qr_with_different_suffix(self):
        """Test demo QR codes with different suffixes work"""
        # Any QR code starting with demo_qr should work
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_test123")
        assert response.status_code == 200
        
        data = response.json()
        assert data["is_demo"] == True
        assert data["business_id"] == "demo_business_001"
        
        print("SUCCESS: Demo QR codes with different suffixes work")
    
    def test_non_demo_qr_returns_404(self):
        """Test non-existent QR code returns 404"""
        response = requests.get(f"{BASE_URL}/api/public/business/nonexistent_qr_12345")
        assert response.status_code == 404
        
        print("SUCCESS: Non-existent QR code returns 404")


class TestDemoReviewSubmission:
    """Tests for demo review submission"""
    
    def test_demo_review_submission_5_stars(self):
        """Test demo review submission with 5 stars (public review)"""
        payload = {
            "business_id": "demo_business_001",
            "author_name": "Test User",
            "author_email": "test@example.com",
            "rating": 5,
            "text": "Amazing demo experience! Great coffee and service!",
            "platform_choice": "google"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/public/review",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify demo response
        assert data["is_demo"] == True
        assert "review_id" in data
        assert data["review_id"].startswith("demo_review_")
        assert data["is_private"] == False
        assert data["next_step"] == "copy_and_go"
        assert "Thank you" in data["message"]
        
        print("SUCCESS: Demo 5-star review submission works")
    
    def test_demo_review_submission_3_stars(self):
        """Test demo review submission with 3 stars (private feedback)"""
        payload = {
            "business_id": "demo_business_001",
            "author_name": "Test User",
            "author_email": "test@example.com",
            "rating": 3,
            "text": "Average experience, could be better.",
            "platform_choice": "direct"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/public/review",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify demo response for low rating
        assert data["is_demo"] == True
        assert data["is_private"] == True
        assert data["next_step"] == "success"
        
        print("SUCCESS: Demo 3-star review submission works (private)")
    
    def test_demo_review_submission_1_star(self):
        """Test demo review submission with 1 star (private feedback)"""
        payload = {
            "business_id": "demo_business_001",
            "author_name": "Test User",
            "author_email": "test@example.com",
            "author_phone": "+1234567890",
            "rating": 1,
            "text": "Very disappointed with the service.",
            "platform_choice": "direct"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/public/review",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify demo response for very low rating
        assert data["is_demo"] == True
        assert data["is_private"] == True
        
        print("SUCCESS: Demo 1-star review submission works (private)")
    
    def test_demo_review_with_facebook_platform(self):
        """Test demo review submission with Facebook platform choice"""
        payload = {
            "business_id": "demo_business_001",
            "author_name": "Facebook Tester",
            "rating": 5,
            "text": "Great experience! Will share on Facebook!",
            "platform_choice": "facebook"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/public/review",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_demo"] == True
        assert data["next_step"] == "copy_and_go"
        
        print("SUCCESS: Demo review with Facebook platform works")
    
    def test_demo_review_with_direct_platform(self):
        """Test demo review submission with direct platform choice"""
        payload = {
            "business_id": "demo_business_001",
            "author_name": "Direct Tester",
            "rating": 4,
            "text": "Good experience, sending directly to business.",
            "platform_choice": "direct"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/public/review",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_demo"] == True
        assert data["next_step"] == "success"  # Direct goes straight to success
        
        print("SUCCESS: Demo review with direct platform works")


class TestPublicAIEndpoints:
    """Tests for public AI endpoints used in review flow"""
    
    def test_ai_write_assist_endpoint(self):
        """Test AI write assist endpoint for generating reviews"""
        payload = {
            "rating": 5,
            "business_name": "Demo Coffee Shop",
            "keywords": "great coffee, friendly staff"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/public/ai/write-assist",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "review_text" in data
        assert len(data["review_text"]) > 10
        
        print("SUCCESS: AI write assist endpoint works")
    
    def test_ai_enhance_endpoint(self):
        """Test AI enhance endpoint for improving reviews"""
        payload = {
            "review_text": "Good coffee",
            "rating": 5,
            "business_name": "Demo Coffee Shop"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/public/ai/enhance",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "enhanced_text" in data
        assert len(data["enhanced_text"]) > len(payload["review_text"])
        
        print("SUCCESS: AI enhance endpoint works")


class TestEmailServiceStatus:
    """Tests for email service status endpoint"""
    
    def test_email_status_endpoint(self):
        """Test email status endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/email/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        
        print("SUCCESS: Email status endpoint accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
