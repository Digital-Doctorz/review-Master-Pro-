"""
Iteration 28 - Subscription Flow Tests
Tests for:
1. Login button on homepage for existing users
2. Pricing section with monthly/yearly toggle
3. Subscription endpoints (create-subscription, verify-subscription)
4. Payment config with correct pricing
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndConfig:
    """Basic health and configuration tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health endpoint working")
    
    def test_payment_config(self):
        """Test /api/payment/config returns correct pricing"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        # Check payment is enabled
        assert data["payment_enabled"] == True
        print("✅ Payment is enabled")
        
        # Check Razorpay key exists
        assert "razorpay_key_id" in data
        assert data["razorpay_key_id"].startswith("rzp_")
        print(f"✅ Razorpay key configured: {data['razorpay_key_id'][:15]}...")
        
        # Check pricing for all plans
        pricing = data["pricing"]
        
        # Starter plan
        assert pricing["starter"]["monthly_price"] == 499
        assert pricing["starter"]["yearly_per_month"] == 399
        print("✅ Starter pricing correct: ₹499/mo, ₹399/mo yearly")
        
        # Growth plan
        assert pricing["growth"]["monthly_price"] == 999
        assert pricing["growth"]["yearly_per_month"] == 799
        print("✅ Growth pricing correct: ₹999/mo, ₹799/mo yearly")
        
        # Enterprise plan
        assert pricing["enterprise"]["monthly_price"] == 2499
        assert pricing["enterprise"]["yearly_per_month"] == 1999
        print("✅ Enterprise pricing correct: ₹2499/mo, ₹1999/mo yearly")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_me_without_session(self):
        """Test /api/auth/me returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ /api/auth/me returns 401 without session")
    
    def test_auth_me_with_invalid_session(self):
        """Test /api/auth/me returns 401 with invalid session"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"session_token": "invalid_token_12345"}
        )
        assert response.status_code == 401
        print("✅ /api/auth/me returns 401 with invalid session")


class TestSubscriptionEndpoints:
    """Subscription endpoint tests - verify auth protection"""
    
    def test_create_subscription_without_auth(self):
        """Test /api/payment/create-subscription returns 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/payment/create-subscription",
            json={"plan_name": "starter"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in data.get("detail", "")
        print("✅ /api/payment/create-subscription returns 401 without auth")
    
    def test_verify_subscription_without_auth(self):
        """Test /api/payment/verify-subscription returns 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/payment/verify-subscription",
            json={
                "razorpay_subscription_id": "sub_test123",
                "razorpay_payment_id": "pay_test123",
                "razorpay_signature": "sig_test123",
                "plan_name": "starter"
            }
        )
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in data.get("detail", "")
        print("✅ /api/payment/verify-subscription returns 401 without auth")
    
    def test_create_order_without_auth(self):
        """Test /api/payment/create-order returns 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/payment/create-order",
            json={"plan_name": "starter", "billing_cycle": "yearly"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in data.get("detail", "")
        print("✅ /api/payment/create-order returns 401 without auth")
    
    def test_verify_payment_without_auth(self):
        """Test /api/payment/verify returns 401 without auth"""
        response = requests.post(
            f"{BASE_URL}/api/payment/verify",
            json={
                "razorpay_order_id": "order_test123",
                "razorpay_payment_id": "pay_test123",
                "razorpay_signature": "sig_test123",
                "plan_name": "starter",
                "billing_cycle": "yearly"
            }
        )
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in data.get("detail", "")
        print("✅ /api/payment/verify returns 401 without auth")


class TestProtectedEndpoints:
    """Test other protected endpoints return 401 without auth"""
    
    def test_business_endpoint(self):
        """Test /api/business returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/business")
        assert response.status_code == 401
        print("✅ /api/business returns 401 without auth")
    
    def test_user_plan_endpoint(self):
        """Test /api/user/plan returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/user/plan")
        assert response.status_code == 401
        print("✅ /api/user/plan returns 401 without auth")
    
    def test_reviews_endpoint(self):
        """Test /api/reviews returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 401
        print("✅ /api/reviews returns 401 without auth")
    
    def test_locations_endpoint(self):
        """Test /api/locations returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/locations")
        assert response.status_code == 401
        print("✅ /api/locations returns 401 without auth")


class TestPublicEndpoints:
    """Test public endpoints are accessible"""
    
    def test_public_business_page(self):
        """Test public business page endpoint for QR code flow"""
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_001")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert data["name"] == "Demo Coffee Shop"
        assert data["is_demo"] == True
        print(f"✅ Public business page accessible: {data.get('name')}")
    
    def test_public_review_submission(self):
        """Test public review submission endpoint exists"""
        # Test that endpoint exists and accepts POST
        response = requests.post(
            f"{BASE_URL}/api/public/review",
            json={
                "qr_code_id": "demo_qr_001",
                "rating": 5,
                "text": "Test review from iteration 28",
                "reviewer_name": "Test User",
                "platform": "direct"
            }
        )
        # Should return 200 or 201 for successful submission
        assert response.status_code in [200, 201]
        print("✅ Public review submission endpoint working")


class TestPlanConfigs:
    """Test plan configuration values"""
    
    def test_plan_pricing_values(self):
        """Verify all plan pricing is correct"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        pricing = data["pricing"]
        
        # Verify monthly prices
        assert pricing["starter"]["monthly_price"] == 499
        assert pricing["growth"]["monthly_price"] == 999
        assert pricing["enterprise"]["monthly_price"] == 2499
        
        # Verify yearly per month prices (20% discount)
        assert pricing["starter"]["yearly_per_month"] == 399
        assert pricing["growth"]["yearly_per_month"] == 799
        assert pricing["enterprise"]["yearly_per_month"] == 1999
        
        # Verify yearly totals
        assert pricing["starter"]["yearly_price"] == 399 * 12  # 4788
        assert pricing["growth"]["yearly_price"] == 799 * 12  # 9588
        assert pricing["enterprise"]["yearly_price"] == 1999 * 12  # 23988
        
        print("✅ All plan pricing values verified")
        print(f"   Starter: ₹499/mo or ₹4,788/year")
        print(f"   Growth: ₹999/mo or ₹9,588/year")
        print(f"   Enterprise: ₹2,499/mo or ₹23,988/year")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
