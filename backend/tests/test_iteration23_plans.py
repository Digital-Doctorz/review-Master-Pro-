"""
Iteration 23 - Plan Activation Tests
Tests for:
1. GET /api/user/plan returns correct plan from users collection if not in user_plans
2. Enterprise plan shows 'Unlimited' badge and 'All Features Unlocked'
3. Growth plan shows 'X of 3 locations used'
4. Starter plan shows 'X of 1 location used'
5. Plan is synced from users collection to user_plans collection on first request
6. Facebook integration enabled for Growth and Enterprise plans
7. Enterprise shows unlimited locations in Integrations page
8. Add Location button shows correctly based on plan limits
"""

import pytest
import requests
import os
import time
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# MongoDB client for test setup
mongo_client = MongoClient(MONGO_URL)
db = mongo_client[DB_NAME]


class TestPlanActivation:
    """Test plan activation and sync from users to user_plans collection"""
    
    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        """Setup test data and cleanup after tests"""
        self.test_users = []
        self.test_sessions = []
        yield
        # Cleanup
        for user_id in self.test_users:
            db.users.delete_many({"user_id": user_id})
            db.user_sessions.delete_many({"user_id": user_id})
            db.user_plans.delete_many({"user_id": user_id})
            db.locations.delete_many({"user_id": user_id})
    
    def create_test_user(self, plan_name="starter"):
        """Create a test user with specified plan in users collection"""
        timestamp = int(time.time() * 1000)
        user_id = f"test_user_iter23_{plan_name}_{timestamp}"
        session_token = f"test_session_iter23_{plan_name}_{timestamp}"
        
        # Plan configurations
        plan_configs = {
            "starter": {"max_locations": 1, "features": ["google_integration", "qr_codes", "ai_responses", "email_notifications", "basic_analytics"]},
            "growth": {"max_locations": 3, "features": ["google_integration", "facebook_integration", "qr_codes", "ai_responses", "email_notifications", "whatsapp_alerts", "advanced_analytics", "private_inbox", "custom_branding"]},
            "enterprise": {"max_locations": 999, "features": ["all_platforms", "unlimited_qr", "ai_responses", "dedicated_manager", "custom_analytics", "api_access", "white_label", "priority_support"]}
        }
        
        plan_config = plan_configs.get(plan_name, plan_configs["starter"])
        
        # Create user with plan in users collection (simulating signup)
        user_doc = {
            "user_id": user_id,
            "email": f"test.iter23.{plan_name}.{timestamp}@example.com",
            "name": f"Test User {plan_name.title()}",
            "picture": "https://via.placeholder.com/150",
            "plan": plan_name,
            "max_locations": plan_config["max_locations"],
            "features": plan_config["features"],
            "is_trial": True,
            "trial_ends_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.users.insert_one(user_doc)
        
        # Create session
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.user_sessions.insert_one(session_doc)
        
        self.test_users.append(user_id)
        self.test_sessions.append(session_token)
        
        return user_id, session_token
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        # Health endpoint returns HTML (frontend), check API health
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✅ API health check passed")
    
    def test_enterprise_plan_returns_correct_data(self):
        """Test that Enterprise plan user gets correct plan data with unlimited locations"""
        user_id, session_token = self.create_test_user("enterprise")
        
        # Verify user_plans collection is empty for this user initially
        existing_plan = db.user_plans.find_one({"user_id": user_id})
        assert existing_plan is None, "user_plans should be empty before first /api/user/plan call"
        
        # Call GET /api/user/plan - should sync from users collection
        response = requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify plan data
        assert data["plan_name"] == "enterprise", f"Expected enterprise, got {data.get('plan_name')}"
        assert data["max_locations"] == 999, f"Expected 999 max_locations, got {data.get('max_locations')}"
        assert data["can_add_location"] == True, "Enterprise should always be able to add locations"
        
        # Verify plan was synced to user_plans collection
        synced_plan = db.user_plans.find_one({"user_id": user_id}, {"_id": 0})
        assert synced_plan is not None, "Plan should be synced to user_plans collection"
        assert synced_plan["plan_name"] == "enterprise"
        
        print(f"✅ Enterprise plan test passed: max_locations={data['max_locations']}, can_add_location={data['can_add_location']}")
    
    def test_growth_plan_returns_correct_data(self):
        """Test that Growth plan user gets correct plan data with 3 max locations"""
        user_id, session_token = self.create_test_user("growth")
        
        # Call GET /api/user/plan
        response = requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify plan data
        assert data["plan_name"] == "growth", f"Expected growth, got {data.get('plan_name')}"
        assert data["max_locations"] == 3, f"Expected 3 max_locations, got {data.get('max_locations')}"
        assert "facebook_integration" in data.get("features", []), "Growth plan should have facebook_integration"
        
        print(f"✅ Growth plan test passed: max_locations={data['max_locations']}, features include facebook_integration")
    
    def test_starter_plan_returns_correct_data(self):
        """Test that Starter plan user gets correct plan data with 1 max location"""
        user_id, session_token = self.create_test_user("starter")
        
        # Call GET /api/user/plan
        response = requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify plan data
        assert data["plan_name"] == "starter", f"Expected starter, got {data.get('plan_name')}"
        assert data["max_locations"] == 1, f"Expected 1 max_location, got {data.get('max_locations')}"
        assert "facebook_integration" not in data.get("features", []), "Starter plan should NOT have facebook_integration"
        
        print(f"✅ Starter plan test passed: max_locations={data['max_locations']}")
    
    def test_plan_sync_from_users_to_user_plans(self):
        """Test that plan is synced from users collection to user_plans on first request"""
        user_id, session_token = self.create_test_user("growth")
        
        # Verify user_plans is empty
        assert db.user_plans.find_one({"user_id": user_id}) is None
        
        # First call to /api/user/plan
        response = requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200
        
        # Verify plan was synced
        synced_plan = db.user_plans.find_one({"user_id": user_id}, {"_id": 0})
        assert synced_plan is not None, "Plan should be synced to user_plans"
        assert synced_plan["plan_name"] == "growth"
        assert synced_plan["max_locations"] == 3
        
        print("✅ Plan sync test passed: plan synced from users to user_plans collection")
    
    def test_enterprise_can_add_unlimited_locations(self):
        """Test that Enterprise plan can add many locations without hitting limit"""
        user_id, session_token = self.create_test_user("enterprise")
        
        # First call to sync plan
        requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        # Create 5 locations (more than Growth's 3 limit)
        for i in range(5):
            response = requests.post(
                f"{BASE_URL}/api/locations",
                json={"name": f"Enterprise Location {i+1}", "address": f"Address {i+1}"},
                headers={"Authorization": f"Bearer {session_token}"}
            )
            assert response.status_code == 200, f"Failed to create location {i+1}: {response.text}"
        
        # Verify all 5 locations created
        response = requests.get(
            f"{BASE_URL}/api/locations",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5, f"Expected 5 locations, got {data['total']}"
        assert data["can_add_more"] == True, "Enterprise should always be able to add more"
        
        print("✅ Enterprise unlimited locations test passed: created 5 locations successfully")
    
    def test_growth_plan_limited_to_3_locations(self):
        """Test that Growth plan is limited to 3 locations"""
        user_id, session_token = self.create_test_user("growth")
        
        # First call to sync plan
        requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        # Create 3 locations (at limit)
        for i in range(3):
            response = requests.post(
                f"{BASE_URL}/api/locations",
                json={"name": f"Growth Location {i+1}", "address": f"Address {i+1}"},
                headers={"Authorization": f"Bearer {session_token}"}
            )
            assert response.status_code == 200, f"Failed to create location {i+1}: {response.text}"
        
        # Try to create 4th location - should fail
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "Growth Location 4", "address": "Address 4"},
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 403, f"Expected 403 for 4th location, got {response.status_code}"
        assert "limit" in response.text.lower(), "Error should mention limit"
        
        print("✅ Growth plan limit test passed: 3 locations allowed, 4th blocked with 403")
    
    def test_starter_plan_limited_to_1_location(self):
        """Test that Starter plan is limited to 1 location"""
        user_id, session_token = self.create_test_user("starter")
        
        # First call to sync plan
        requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        # Create 1 location
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "Starter Location 1", "address": "Address 1"},
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200, f"Failed to create first location: {response.text}"
        
        # Try to create 2nd location - should fail
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "Starter Location 2", "address": "Address 2"},
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 403, f"Expected 403 for 2nd location, got {response.status_code}"
        
        print("✅ Starter plan limit test passed: 1 location allowed, 2nd blocked with 403")
    
    def test_facebook_integration_blocked_for_starter(self):
        """Test that Facebook integration is blocked for Starter plan"""
        user_id, session_token = self.create_test_user("starter")
        
        # Sync plan
        requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        # Create a location first
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "Starter Location", "address": "Address"},
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200
        location_id = response.json()["location"]["location_id"]
        
        # Try to connect Facebook - should fail for Starter
        response = requests.post(
            f"{BASE_URL}/api/locations/{location_id}/connect/facebook",
            json={"review_link": "https://facebook.com/testpage/reviews"},
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 403, f"Expected 403 for Facebook on Starter, got {response.status_code}"
        assert "upgrade" in response.text.lower() or "growth" in response.text.lower(), "Error should mention upgrade"
        
        print("✅ Facebook blocked for Starter test passed")
    
    def test_facebook_integration_allowed_for_growth(self):
        """Test that Facebook integration is allowed for Growth plan"""
        user_id, session_token = self.create_test_user("growth")
        
        # Sync plan
        requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        # Create a location first
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "Growth Location", "address": "Address"},
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200
        location_id = response.json()["location"]["location_id"]
        
        # Connect Facebook - should work for Growth
        response = requests.post(
            f"{BASE_URL}/api/locations/{location_id}/connect/facebook",
            json={"review_link": "https://facebook.com/testpage/reviews"},
            headers={"Authorization": f"Bearer {session_token}"}
        )
        assert response.status_code == 200, f"Expected 200 for Facebook on Growth, got {response.status_code}: {response.text}"
        
        print("✅ Facebook allowed for Growth test passed")
    
    def test_locations_endpoint_returns_correct_max_locations(self):
        """Test that GET /api/locations returns correct max_locations based on plan"""
        # Test Enterprise
        user_id_ent, session_token_ent = self.create_test_user("enterprise")
        requests.get(f"{BASE_URL}/api/user/plan", headers={"Authorization": f"Bearer {session_token_ent}"})
        
        response = requests.get(
            f"{BASE_URL}/api/locations",
            headers={"Authorization": f"Bearer {session_token_ent}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["max_locations"] == 999, f"Enterprise should have 999 max_locations, got {data['max_locations']}"
        
        # Test Growth
        user_id_growth, session_token_growth = self.create_test_user("growth")
        requests.get(f"{BASE_URL}/api/user/plan", headers={"Authorization": f"Bearer {session_token_growth}"})
        
        response = requests.get(
            f"{BASE_URL}/api/locations",
            headers={"Authorization": f"Bearer {session_token_growth}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["max_locations"] == 3, f"Growth should have 3 max_locations, got {data['max_locations']}"
        
        # Test Starter
        user_id_starter, session_token_starter = self.create_test_user("starter")
        requests.get(f"{BASE_URL}/api/user/plan", headers={"Authorization": f"Bearer {session_token_starter}"})
        
        response = requests.get(
            f"{BASE_URL}/api/locations",
            headers={"Authorization": f"Bearer {session_token_starter}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["max_locations"] == 1, f"Starter should have 1 max_location, got {data['max_locations']}"
        
        print("✅ Locations endpoint max_locations test passed for all plans")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
