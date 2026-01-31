"""
Iteration 34 - Guest Payment Flow Tests
Tests the "Pay First, Then Login" flow:
1. Guest user creates payment order (no auth required)
2. Guest payment verification (stores pending activation)
3. Activate pending payment (requires auth, links payment to user)
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGuestPaymentFlow:
    """Test the Pay First, Then Login flow"""
    
    def test_payment_config_endpoint(self):
        """Test /api/payment/config returns correct configuration"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "payment_enabled" in data, "Missing payment_enabled field"
        assert data["payment_enabled"] == True, "Payment should be enabled"
        assert "razorpay_key_id" in data, "Missing razorpay_key_id"
        assert "pricing" in data, "Missing pricing configuration"
        
        # Verify pricing structure
        pricing = data["pricing"]
        assert "starter" in pricing, "Missing starter plan pricing"
        assert "growth" in pricing, "Missing growth plan pricing"
        assert "enterprise" in pricing, "Missing enterprise plan pricing"
        
        # Verify starter plan pricing
        starter = pricing["starter"]
        assert starter["monthly_price"] == 499, f"Starter monthly should be 499, got {starter['monthly_price']}"
        print("✅ Payment config endpoint working correctly")
    
    def test_guest_create_order_no_auth_required(self):
        """Test /api/payment/guest/create-order works without authentication"""
        response = requests.post(
            f"{BASE_URL}/api/payment/guest/create-order",
            json={
                "plan_name": "starter",
                "billing_cycle": "monthly",
                "email": "test@example.com"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "order_id" in data, "Missing order_id in response"
        assert "guest_id" in data, "Missing guest_id in response"
        assert "amount" in data, "Missing amount in response"
        assert "key_id" in data, "Missing key_id in response"
        assert "description" in data, "Missing description in response"
        
        # Verify amount is correct (499 * 100 paise = 49900)
        assert data["amount"] == 49900, f"Expected 49900 paise, got {data['amount']}"
        assert data["currency"] == "INR", f"Expected INR, got {data['currency']}"
        
        # Verify guest_id format
        assert data["guest_id"].startswith("guest_"), f"guest_id should start with 'guest_', got {data['guest_id']}"
        
        print(f"✅ Guest order created: {data['order_id']}, guest_id: {data['guest_id']}")
        return data
    
    def test_guest_create_order_yearly_billing(self):
        """Test guest order creation with yearly billing"""
        response = requests.post(
            f"{BASE_URL}/api/payment/guest/create-order",
            json={
                "plan_name": "growth",
                "billing_cycle": "yearly"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Growth yearly: 799 * 12 * 100 = 958800 paise
        assert data["amount"] == 958800, f"Expected 958800 paise for yearly growth, got {data['amount']}"
        assert "1 Year" in data["description"], f"Description should mention '1 Year', got {data['description']}"
        
        print(f"✅ Guest yearly order created: {data['order_id']}")
    
    def test_guest_create_order_invalid_plan(self):
        """Test guest order creation with invalid plan name"""
        response = requests.post(
            f"{BASE_URL}/api/payment/guest/create-order",
            json={
                "plan_name": "invalid_plan",
                "billing_cycle": "monthly"
            }
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid plan, got {response.status_code}"
        print("✅ Invalid plan correctly rejected")
    
    def test_guest_verify_endpoint_exists(self):
        """Test /api/payment/guest/verify endpoint exists and validates signature"""
        response = requests.post(
            f"{BASE_URL}/api/payment/guest/verify",
            json={
                "razorpay_order_id": "order_test123",
                "razorpay_payment_id": "pay_test123",
                "razorpay_signature": "invalid_signature",
                "plan_name": "starter",
                "billing_cycle": "monthly",
                "guest_id": "guest_test123"
            }
        )
        
        # Should return 400 for invalid signature (not 404 or 500)
        assert response.status_code == 400, f"Expected 400 for invalid signature, got {response.status_code}"
        assert "verification failed" in response.json().get("detail", "").lower(), "Should mention verification failed"
        print("✅ Guest verify endpoint exists and validates signatures")
    
    def test_activate_pending_requires_auth(self):
        """Test /api/payment/activate-pending requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/payment/activate-pending",
            json={"guest_id": "guest_test123"}
        )
        
        assert response.status_code == 401, f"Expected 401 for unauthenticated request, got {response.status_code}"
        print("✅ Activate pending endpoint correctly requires authentication")
    
    def test_all_plan_types_create_order(self):
        """Test order creation for all plan types"""
        plans = [
            ("starter", "monthly", 49900),
            ("starter", "yearly", 478800),  # 399 * 12 * 100
            ("growth", "monthly", 99900),
            ("growth", "yearly", 958800),   # 799 * 12 * 100
            ("enterprise", "monthly", 249900),
            ("enterprise", "yearly", 2398800)  # 1999 * 12 * 100
        ]
        
        for plan_name, billing_cycle, expected_amount in plans:
            response = requests.post(
                f"{BASE_URL}/api/payment/guest/create-order",
                json={
                    "plan_name": plan_name,
                    "billing_cycle": billing_cycle
                }
            )
            
            assert response.status_code == 200, f"Failed for {plan_name}/{billing_cycle}: {response.text}"
            data = response.json()
            assert data["amount"] == expected_amount, f"Wrong amount for {plan_name}/{billing_cycle}: expected {expected_amount}, got {data['amount']}"
            print(f"✅ {plan_name.title()} {billing_cycle}: ₹{expected_amount/100}")


class TestAuthenticatedPaymentFlow:
    """Test authenticated payment endpoints"""
    
    @pytest.fixture
    def test_session(self):
        """Create a test user session for authenticated tests"""
        import subprocess
        import json
        
        # Create test user and session in MongoDB
        user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        session_token = f"test_session_{uuid.uuid4().hex[:16]}"
        
        mongo_script = f'''
        use test_database;
        db.users.insertOne({{
            user_id: "{user_id}",
            email: "test_{uuid.uuid4().hex[:6]}@example.com",
            name: "Test User",
            plan: "free",
            max_locations: 0,
            features: [],
            created_at: new Date()
        }});
        db.user_sessions.insertOne({{
            user_id: "{user_id}",
            session_token: "{session_token}",
            expires_at: new Date(Date.now() + 7*24*60*60*1000),
            created_at: new Date()
        }});
        '''
        
        result = subprocess.run(
            ["mongosh", "--quiet", "--eval", mongo_script],
            capture_output=True,
            text=True
        )
        
        yield {"user_id": user_id, "session_token": session_token}
        
        # Cleanup
        cleanup_script = f'''
        use test_database;
        db.users.deleteOne({{ user_id: "{user_id}" }});
        db.user_sessions.deleteOne({{ session_token: "{session_token}" }});
        db.user_plans.deleteOne({{ user_id: "{user_id}" }});
        db.pending_plan_activations.deleteMany({{ user_id: "{user_id}" }});
        '''
        subprocess.run(["mongosh", "--quiet", "--eval", cleanup_script], capture_output=True)
    
    def test_activate_pending_with_auth_no_pending(self, test_session):
        """Test activate-pending with auth but no pending payment"""
        response = requests.post(
            f"{BASE_URL}/api/payment/activate-pending",
            headers={"Authorization": f"Bearer {test_session['session_token']}"},
            json={"guest_id": "nonexistent_guest_id"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["success"] == False, "Should return success=False when no pending payment"
        print("✅ Activate pending correctly handles no pending payment")
    
    def test_user_plan_endpoint(self, test_session):
        """Test /api/user/plan endpoint returns plan data"""
        response = requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {test_session['session_token']}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "plan_name" in data or "plan_id" in data, "Should return plan information"
        print(f"✅ User plan endpoint working: {data.get('plan_name', data.get('plan_id', 'unknown'))}")


class TestPricingDisplay:
    """Test pricing configuration matches frontend display"""
    
    def test_pricing_values_match_frontend(self):
        """Verify pricing values match what frontend displays"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        
        pricing = response.json()["pricing"]
        
        # Expected values from Landing.jsx
        expected = {
            "starter": {"monthly": 499, "yearly_per_month": 399},
            "growth": {"monthly": 999, "yearly_per_month": 799},
            "enterprise": {"monthly": 2499, "yearly_per_month": 1999}
        }
        
        for plan, values in expected.items():
            assert pricing[plan]["monthly_price"] == values["monthly"], \
                f"{plan} monthly mismatch: expected {values['monthly']}, got {pricing[plan]['monthly_price']}"
            assert pricing[plan]["yearly_per_month"] == values["yearly_per_month"], \
                f"{plan} yearly_per_month mismatch: expected {values['yearly_per_month']}, got {pricing[plan]['yearly_per_month']}"
        
        print("✅ All pricing values match frontend display")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
