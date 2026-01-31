"""
Iteration 30 - Subscription Management & Pricing Tests
Tests for:
1. New subscription management endpoints (/user/subscription, /subscription/cancel, /payment/history)
2. Correct yearly pricing (₹4,788, ₹9,588, ₹23,988)
3. Correct savings amounts (Save ₹1,200, Save ₹2,400, Save ₹6,000)
4. Auth protection on new endpoints
5. Health endpoint
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoint:
    """Health check tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ /api/health returns healthy")


class TestNewSubscriptionEndpoints:
    """Test new subscription management endpoints - auth protection"""
    
    def test_user_subscription_without_auth(self):
        """Test /api/user/subscription returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/user/subscription")
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in data.get("detail", "")
        print("✅ /api/user/subscription returns 401 without auth")
    
    def test_subscription_cancel_without_auth(self):
        """Test /api/subscription/cancel returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/subscription/cancel", json={})
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in data.get("detail", "")
        print("✅ /api/subscription/cancel returns 401 without auth")
    
    def test_payment_history_without_auth(self):
        """Test /api/payment/history returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/payment/history")
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in data.get("detail", "")
        print("✅ /api/payment/history returns 401 without auth")
    
    def test_update_payment_method_without_auth(self):
        """Test /api/subscription/update-payment-method returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/subscription/update-payment-method", json={})
        assert response.status_code == 401
        data = response.json()
        assert "Not authenticated" in data.get("detail", "")
        print("✅ /api/subscription/update-payment-method returns 401 without auth")


class TestPricingConfiguration:
    """Test pricing configuration values"""
    
    def test_payment_config_endpoint(self):
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
    
    def test_monthly_pricing(self):
        """Test monthly pricing is correct"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        pricing = data["pricing"]
        
        # Monthly prices
        assert pricing["starter"]["monthly_price"] == 499
        assert pricing["growth"]["monthly_price"] == 999
        assert pricing["enterprise"]["monthly_price"] == 2499
        
        print("✅ Monthly pricing correct:")
        print(f"   Starter: ₹499/mo")
        print(f"   Growth: ₹999/mo")
        print(f"   Enterprise: ₹2,499/mo")
    
    def test_yearly_pricing(self):
        """Test yearly pricing is correct (₹4,788, ₹9,588, ₹23,988)"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        pricing = data["pricing"]
        
        # Yearly total prices
        # Starter: ₹399/mo × 12 = ₹4,788
        assert pricing["starter"]["yearly_price"] == 4788
        
        # Growth: ₹799/mo × 12 = ₹9,588
        assert pricing["growth"]["yearly_price"] == 9588
        
        # Enterprise: ₹1,999/mo × 12 = ₹23,988
        assert pricing["enterprise"]["yearly_price"] == 23988
        
        print("✅ Yearly pricing correct:")
        print(f"   Starter: ₹4,788/year")
        print(f"   Growth: ₹9,588/year")
        print(f"   Enterprise: ₹23,988/year")
    
    def test_yearly_savings(self):
        """Test yearly savings amounts are correct (Save ₹1,200, Save ₹2,400, Save ₹6,000)"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        pricing = data["pricing"]
        
        # Calculate savings: (monthly × 12) - yearly_price
        # Starter: (499 × 12) - 4788 = 5988 - 4788 = 1200
        starter_monthly_total = pricing["starter"]["monthly_price"] * 12
        starter_yearly = pricing["starter"]["yearly_price"]
        starter_savings = starter_monthly_total - starter_yearly
        assert starter_savings == 1200, f"Expected 1200, got {starter_savings}"
        
        # Growth: (999 × 12) - 9588 = 11988 - 9588 = 2400
        growth_monthly_total = pricing["growth"]["monthly_price"] * 12
        growth_yearly = pricing["growth"]["yearly_price"]
        growth_savings = growth_monthly_total - growth_yearly
        assert growth_savings == 2400, f"Expected 2400, got {growth_savings}"
        
        # Enterprise: (2499 × 12) - 23988 = 29988 - 23988 = 6000
        enterprise_monthly_total = pricing["enterprise"]["monthly_price"] * 12
        enterprise_yearly = pricing["enterprise"]["yearly_price"]
        enterprise_savings = enterprise_monthly_total - enterprise_yearly
        assert enterprise_savings == 6000, f"Expected 6000, got {enterprise_savings}"
        
        print("✅ Yearly savings correct:")
        print(f"   Starter: Save ₹1,200")
        print(f"   Growth: Save ₹2,400")
        print(f"   Enterprise: Save ₹6,000")


class TestExistingAuthEndpoints:
    """Test existing auth-protected endpoints"""
    
    def test_auth_me_without_session(self):
        """Test /api/auth/me returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ /api/auth/me returns 401 without session")
    
    def test_business_endpoint_without_auth(self):
        """Test /api/business returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/business")
        assert response.status_code == 401
        print("✅ /api/business returns 401 without auth")
    
    def test_user_plan_without_auth(self):
        """Test /api/user/plan returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/user/plan")
        assert response.status_code == 401
        print("✅ /api/user/plan returns 401 without auth")


class TestPublicEndpoints:
    """Test public endpoints are accessible"""
    
    def test_public_business_demo(self):
        """Test public demo business endpoint"""
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_001")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert data["is_demo"] == True
        print(f"✅ Public demo business accessible: {data.get('name')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
