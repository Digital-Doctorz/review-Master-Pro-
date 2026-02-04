"""
Iteration 36 - Core API Tests
Tests for health, payment config, and demo mode functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://reviewmaster-10.preview.emergentagent.com"


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_endpoint_returns_200(self):
        """Test /api/health returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("PASSED: /api/health returns healthy status")


class TestPaymentConfig:
    """Payment configuration endpoint tests"""
    
    def test_payment_config_returns_200(self):
        """Test /api/payment/config returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        # Verify payment is enabled
        assert data.get("payment_enabled") == True
        print("PASSED: Payment is enabled")
        
        # Verify Razorpay key is present
        assert "razorpay_key_id" in data
        assert data["razorpay_key_id"].startswith("rzp_")
        print("PASSED: Razorpay key ID is present")
    
    def test_payment_config_has_correct_pricing(self):
        """Test /api/payment/config returns correct pricing"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        pricing = data.get("pricing", {})
        
        # Verify Starter plan pricing
        assert pricing.get("starter", {}).get("monthly_price") == 499
        print("PASSED: Starter plan is ₹499/month")
        
        # Verify Growth plan pricing
        assert pricing.get("growth", {}).get("monthly_price") == 999
        print("PASSED: Growth plan is ₹999/month")
        
        # Verify Enterprise plan pricing
        assert pricing.get("enterprise", {}).get("monthly_price") == 2499
        print("PASSED: Enterprise plan is ₹2,499/month")
    
    def test_payment_config_has_subscription_links(self):
        """Test /api/payment/config returns Razorpay subscription links"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        pricing = data.get("pricing", {})
        
        # Verify subscription links are present
        for plan in ["starter", "growth", "enterprise"]:
            link = pricing.get(plan, {}).get("razorpay_subscription_link")
            assert link is not None, f"Missing subscription link for {plan}"
            assert link.startswith("https://rzp.io/"), f"Invalid subscription link for {plan}"
        
        print("PASSED: All plans have valid Razorpay subscription links")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_me_returns_401_without_session(self):
        """Test /api/auth/me returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("PASSED: /api/auth/me returns 401 without session")


class TestDemoQRCode:
    """Demo QR code endpoint tests"""
    
    def test_demo_qr_code_page_accessible(self):
        """Test demo QR code review page is accessible"""
        response = requests.get(f"{BASE_URL}/review/demo_qr_001")
        # Should return HTML page (200) or redirect
        assert response.status_code in [200, 302, 304]
        print("PASSED: Demo QR code page is accessible")


class TestGuestPayment:
    """Guest payment endpoint tests"""
    
    def test_guest_create_order_works(self):
        """Test /api/payment/guest/create-order works without auth"""
        response = requests.post(
            f"{BASE_URL}/api/payment/guest/create-order",
            json={
                "plan_name": "starter",
                "billing_cycle": "yearly"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify order details
        assert "order_id" in data
        assert "amount" in data
        assert "key_id" in data
        assert "guest_id" in data
        
        print(f"PASSED: Guest order created - Order ID: {data['order_id']}")
        print(f"PASSED: Amount: ₹{data['amount']/100}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
