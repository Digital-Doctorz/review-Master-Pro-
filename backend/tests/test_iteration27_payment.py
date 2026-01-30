"""
Iteration 27 - Payment Flow and Session Tests
Tests the critical bug fix: payment endpoints now use get_current_user (session_token) instead of session_id cookie
"""
import pytest
import requests
import os
from datetime import datetime, timezone, timedelta
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndConfig:
    """Test health and configuration endpoints"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✅ Health endpoint returns healthy")
    
    def test_payment_config_endpoint(self):
        """Test /api/payment/config returns correct configuration"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "razorpay_key_id" in data
        assert "payment_enabled" in data
        assert "pricing" in data
        
        # Verify pricing structure
        pricing = data["pricing"]
        assert "starter" in pricing
        assert "growth" in pricing
        assert "enterprise" in pricing
        
        # Verify starter pricing
        starter = pricing["starter"]
        assert starter["monthly_price"] == 499
        assert starter["yearly_price"] == 4788  # 399 * 12
        
        print(f"✅ Payment config: Razorpay key={data['razorpay_key_id'][:10]}..., enabled={data['payment_enabled']}")


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_auth_me_without_session(self):
        """Test /api/auth/me returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ /api/auth/me correctly returns 401 without session")
    
    def test_auth_me_with_invalid_session(self):
        """Test /api/auth/me returns 401 with invalid session"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )
        assert response.status_code == 401
        print("✅ /api/auth/me correctly returns 401 with invalid session")
    
    def test_auth_session_without_session_id(self):
        """Test /api/auth/session returns 400 without session_id"""
        response = requests.post(
            f"{BASE_URL}/api/auth/session",
            json={}
        )
        assert response.status_code == 400
        data = response.json()
        assert "session_id required" in data.get("detail", "")
        print("✅ /api/auth/session correctly returns 400 without session_id")


class TestPaymentEndpointsAuth:
    """Test payment endpoints require authentication (the critical bug fix)"""
    
    def test_create_order_requires_auth(self):
        """Test /api/payment/create-order returns 401 without session"""
        response = requests.post(
            f"{BASE_URL}/api/payment/create-order",
            json={"plan_name": "starter", "billing_cycle": "monthly"}
        )
        assert response.status_code == 401
        print("✅ /api/payment/create-order correctly requires authentication")
    
    def test_verify_payment_requires_auth(self):
        """Test /api/payment/verify returns 401 without session"""
        response = requests.post(
            f"{BASE_URL}/api/payment/verify",
            json={
                "razorpay_order_id": "order_test123",
                "razorpay_payment_id": "pay_test123",
                "razorpay_signature": "sig_test123",
                "plan_name": "starter",
                "billing_cycle": "monthly"
            }
        )
        assert response.status_code == 401
        print("✅ /api/payment/verify correctly requires authentication")
    
    def test_create_subscription_requires_auth(self):
        """Test /api/payment/create-subscription returns 401 without session"""
        response = requests.post(
            f"{BASE_URL}/api/payment/create-subscription",
            json={"plan_name": "starter"}
        )
        assert response.status_code == 401
        print("✅ /api/payment/create-subscription correctly requires authentication")
    
    def test_create_order_with_invalid_session(self):
        """Test /api/payment/create-order returns 401 with invalid session"""
        response = requests.post(
            f"{BASE_URL}/api/payment/create-order",
            json={"plan_name": "starter", "billing_cycle": "monthly"},
            headers={"Authorization": "Bearer invalid_session_token"}
        )
        assert response.status_code == 401
        print("✅ /api/payment/create-order correctly rejects invalid session")


class TestProtectedEndpoints:
    """Test other protected endpoints require authentication"""
    
    def test_business_requires_auth(self):
        """Test /api/business returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/business")
        assert response.status_code == 401
        print("✅ /api/business correctly requires authentication")
    
    def test_user_plan_requires_auth(self):
        """Test /api/user/plan returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/user/plan")
        assert response.status_code == 401
        print("✅ /api/user/plan correctly requires authentication")
    
    def test_reviews_requires_auth(self):
        """Test /api/reviews returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 401
        print("✅ /api/reviews correctly requires authentication")
    
    def test_locations_requires_auth(self):
        """Test /api/locations returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/locations")
        assert response.status_code == 401
        print("✅ /api/locations correctly requires authentication")


class TestPublicEndpoints:
    """Test public endpoints that don't require authentication"""
    
    def test_public_review_page(self):
        """Test /api/public/review/{qr_code_id} is accessible"""
        # Test with demo QR code
        response = requests.get(f"{BASE_URL}/api/public/review/demo_qr_001")
        # Should return 200 or 404 (not 401)
        assert response.status_code in [200, 404]
        print(f"✅ Public review endpoint accessible (status: {response.status_code})")
    
    def test_public_submit_review(self):
        """Test /api/public/review endpoint accepts reviews"""
        # This should work without auth
        response = requests.post(
            f"{BASE_URL}/api/public/review",
            json={
                "business_id": "test_business_123",
                "author_name": "Test User",
                "rating": 5,
                "text": "Great service!",
                "platform_choice": "direct"
            }
        )
        # Should return 200/201 or 404 (business not found), not 401
        assert response.status_code in [200, 201, 404]
        print(f"✅ Public review submission endpoint accessible (status: {response.status_code})")


class TestDemoMode:
    """Test demo mode functionality"""
    
    def test_demo_qr_code_info(self):
        """Test demo QR code returns business info"""
        response = requests.get(f"{BASE_URL}/api/public/review/demo_qr_001")
        # Demo QR should return business info or 404 if not seeded
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Demo QR code returns business: {data.get('business_name', 'N/A')}")
        else:
            print(f"⚠️ Demo QR code not found (status: {response.status_code}) - may need seeding")


class TestPaymentConfigDetails:
    """Detailed tests for payment configuration"""
    
    def test_all_plan_pricing(self):
        """Test all plan pricing is correct"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        pricing = data["pricing"]
        
        # Starter plan
        assert pricing["starter"]["monthly_price"] == 499
        assert pricing["starter"]["yearly_per_month"] == 399
        assert pricing["starter"]["yearly_price"] == 4788  # 399 * 12
        
        # Growth plan
        assert pricing["growth"]["monthly_price"] == 999
        assert pricing["growth"]["yearly_per_month"] == 799
        assert pricing["growth"]["yearly_price"] == 9588  # 799 * 12
        
        # Enterprise plan
        assert pricing["enterprise"]["monthly_price"] == 2499
        assert pricing["enterprise"]["yearly_per_month"] == 1999
        assert pricing["enterprise"]["yearly_price"] == 23988  # 1999 * 12
        
        print("✅ All plan pricing verified correctly")
    
    def test_razorpay_enabled(self):
        """Test Razorpay is enabled"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        assert data["payment_enabled"] == True
        assert data["razorpay_key_id"].startswith("rzp_")
        print(f"✅ Razorpay enabled with key: {data['razorpay_key_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
