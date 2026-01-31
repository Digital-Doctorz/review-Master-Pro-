"""
Iteration 31 - Payment Flow Fix Testing
Tests for the fix: Changed monthly payments from subscription API to one-time orders
Both monthly and yearly now use /api/payment/create-order endpoint
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndConfig:
    """Basic health and payment config tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✅ Health endpoint returns healthy")
    
    def test_payment_config_endpoint(self):
        """Test /api/payment/config returns correct config"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        # Check payment is enabled
        assert data.get("payment_enabled") == True
        print("✅ Payment is enabled")
        
        # Check razorpay key is present
        assert "razorpay_key_id" in data
        assert data["razorpay_key_id"].startswith("rzp_")
        print("✅ Razorpay key ID present")
        
        # Check pricing structure
        assert "pricing" in data
        pricing = data["pricing"]
        
        # Verify all plans exist
        assert "starter" in pricing
        assert "growth" in pricing
        assert "enterprise" in pricing
        print("✅ All pricing plans present")
    
    def test_monthly_pricing_values(self):
        """Test monthly pricing values are correct"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        pricing = response.json()["pricing"]
        
        # Starter: ₹499/month
        assert pricing["starter"]["monthly_price"] == 499
        print("✅ Starter monthly price: ₹499")
        
        # Growth: ₹999/month
        assert pricing["growth"]["monthly_price"] == 999
        print("✅ Growth monthly price: ₹999")
        
        # Enterprise: ₹2,499/month
        assert pricing["enterprise"]["monthly_price"] == 2499
        print("✅ Enterprise monthly price: ₹2,499")
    
    def test_yearly_pricing_values(self):
        """Test yearly pricing values are correct"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        pricing = response.json()["pricing"]
        
        # Starter: ₹4,788/year
        assert pricing["starter"]["yearly_price"] == 4788
        print("✅ Starter yearly price: ₹4,788")
        
        # Growth: ₹9,588/year
        assert pricing["growth"]["yearly_price"] == 9588
        print("✅ Growth yearly price: ₹9,588")
        
        # Enterprise: ₹23,988/year
        assert pricing["enterprise"]["yearly_price"] == 23988
        print("✅ Enterprise yearly price: ₹23,988")


class TestPaymentEndpointsAuth:
    """Test payment endpoints require authentication"""
    
    def test_create_order_requires_auth(self):
        """Test /api/payment/create-order returns 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/payment/create-order",
            json={"plan_name": "starter", "billing_cycle": "monthly"}
        )
        assert response.status_code == 401
        print("✅ /api/payment/create-order returns 401 without auth")
    
    def test_verify_payment_requires_auth(self):
        """Test /api/payment/verify returns 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/payment/verify",
            json={
                "razorpay_order_id": "test",
                "razorpay_payment_id": "test",
                "razorpay_signature": "test"
            }
        )
        assert response.status_code == 401
        print("✅ /api/payment/verify returns 401 without auth")
    
    def test_payment_history_requires_auth(self):
        """Test /api/payment/history returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/payment/history")
        assert response.status_code == 401
        print("✅ /api/payment/history returns 401 without auth")
    
    def test_user_subscription_requires_auth(self):
        """Test /api/user/subscription returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/user/subscription")
        assert response.status_code == 401
        print("✅ /api/user/subscription returns 401 without auth")
    
    def test_subscription_cancel_requires_auth(self):
        """Test /api/subscription/cancel returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/subscription/cancel")
        assert response.status_code == 401
        print("✅ /api/subscription/cancel returns 401 without auth")


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_auth_me_requires_session(self):
        """Test /api/auth/me returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ /api/auth/me returns 401 without session")
    
    def test_business_requires_auth(self):
        """Test /api/business returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/business")
        assert response.status_code == 401
        print("✅ /api/business returns 401 without auth")
    
    def test_user_plan_requires_auth(self):
        """Test /api/user/plan returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/user/plan")
        assert response.status_code == 401
        print("✅ /api/user/plan returns 401 without auth")


class TestPublicEndpoints:
    """Test public endpoints that don't require auth"""
    
    def test_demo_business_accessible(self):
        """Test demo business endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/demo/business")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        print(f"✅ Demo business accessible: {data.get('name')}")
    
    def test_demo_reviews_accessible(self):
        """Test demo reviews endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/demo/reviews")
        assert response.status_code == 200
        data = response.json()
        assert "reviews" in data
        print(f"✅ Demo reviews accessible: {len(data.get('reviews', []))} reviews")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
