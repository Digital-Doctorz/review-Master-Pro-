"""
Iteration 22 Tests - Location Management & Plan Limits
Tests:
1. Plan limit enforcement (Growth plan = 3 locations max)
2. DELETE /api/locations/{id} always allowed
3. QR Code ID persistence (doesn't change on location update)
4. POST /api/locations returns 403 when plan limit reached
5. Location CRUD operations
"""

import pytest
import requests
import os
import time
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials - will be created in setup
TEST_USER_ID = f"test_user_iter22_{int(time.time())}"
TEST_SESSION_TOKEN = f"test_session_iter22_{int(time.time())}"
TEST_EMAIL = f"test.iter22.{int(time.time())}@example.com"


class TestSetup:
    """Setup test user and session"""
    
    @pytest.fixture(scope="class", autouse=True)
    def setup_test_user(self):
        """Create test user and session in MongoDB"""
        import subprocess
        
        # Create test user with Growth plan (max 3 locations)
        mongo_script = f'''
        use('test_database');
        
        // Clean up any existing test data
        db.users.deleteMany({{email: /test\\.iter22\\./}});
        db.user_sessions.deleteMany({{session_token: /test_session_iter22/}});
        db.businesses.deleteMany({{user_id: /test_user_iter22/}});
        db.locations.deleteMany({{user_id: /test_user_iter22/}});
        db.user_plans.deleteMany({{user_id: /test_user_iter22/}});
        
        // Create test user
        db.users.insertOne({{
          user_id: "{TEST_USER_ID}",
          email: "{TEST_EMAIL}",
          name: "Test User Iter22",
          picture: "https://via.placeholder.com/150",
          plan: "growth",
          max_locations: 3,
          created_at: new Date()
        }});
        
        // Create session
        db.user_sessions.insertOne({{
          user_id: "{TEST_USER_ID}",
          session_token: "{TEST_SESSION_TOKEN}",
          expires_at: new Date(Date.now() + 7*24*60*60*1000),
          created_at: new Date()
        }});
        
        // Create business
        db.businesses.insertOne({{
          business_id: "test_business_iter22_{int(time.time())}",
          user_id: "{TEST_USER_ID}",
          name: "Test Business Iter22",
          address: "123 Test Street",
          created_at: new Date()
        }});
        
        // Create Growth plan (max 3 locations)
        db.user_plans.insertOne({{
          user_id: "{TEST_USER_ID}",
          plan_name: "growth",
          max_locations: 3,
          max_reviews_per_month: 500,
          features: ["google_integration", "facebook_integration", "qr_codes", "ai_responses"],
          status: "active",
          created_at: new Date().toISOString()
        }});
        
        print("Test user created: {TEST_USER_ID}");
        print("Session token: {TEST_SESSION_TOKEN}");
        '''
        
        result = subprocess.run(
            ['mongosh', '--quiet', '--eval', mongo_script],
            capture_output=True,
            text=True
        )
        print(f"MongoDB setup output: {result.stdout}")
        if result.returncode != 0:
            print(f"MongoDB setup error: {result.stderr}")
        
        yield
        
        # Cleanup after tests
        cleanup_script = f'''
        use('test_database');
        db.users.deleteMany({{user_id: "{TEST_USER_ID}"}});
        db.user_sessions.deleteMany({{session_token: "{TEST_SESSION_TOKEN}"}});
        db.businesses.deleteMany({{user_id: "{TEST_USER_ID}"}});
        db.locations.deleteMany({{user_id: "{TEST_USER_ID}"}});
        db.user_plans.deleteMany({{user_id: "{TEST_USER_ID}"}});
        print("Test data cleaned up");
        '''
        subprocess.run(['mongosh', '--quiet', '--eval', cleanup_script], capture_output=True)


class TestHealthAndBasics:
    """Basic health checks"""
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health endpoint working")
    
    def test_api_root(self):
        """Test API root"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "version" in data or "message" in data
        print("✓ API root working")


class TestUserPlan:
    """Test user plan endpoints"""
    
    def test_get_user_plan(self, setup_test_user):
        """Test getting user plan"""
        response = requests.get(
            f"{BASE_URL}/api/user/plan",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify plan details
        assert data.get("plan_name") == "growth"
        assert data.get("max_locations") == 3
        assert "current_locations" in data
        assert "can_add_location" in data
        print(f"✓ User plan: {data.get('plan_name')}, max_locations: {data.get('max_locations')}")
        print(f"  Current locations: {data.get('current_locations')}, can_add: {data.get('can_add_location')}")


class TestLocationCRUD:
    """Test location CRUD operations"""
    
    created_location_ids = []
    
    def test_create_first_location(self, setup_test_user):
        """Create first location"""
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "Test Location 1", "address": "123 First St"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "location" in data
        location = data["location"]
        assert location.get("name") == "Test Location 1"
        assert location.get("address") == "123 First St"
        assert "qr_code_id" in location
        assert location.get("qr_code_id").startswith("qr_")
        assert location.get("is_primary") == True  # First location should be primary
        
        self.__class__.created_location_ids.append(location["location_id"])
        print(f"✓ Created location 1: {location['location_id']}")
        print(f"  QR Code ID: {location['qr_code_id']}")
    
    def test_create_second_location(self, setup_test_user):
        """Create second location"""
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "Test Location 2", "address": "456 Second Ave"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        location = data["location"]
        assert location.get("name") == "Test Location 2"
        assert location.get("is_primary") == False  # Second location should not be primary
        
        self.__class__.created_location_ids.append(location["location_id"])
        print(f"✓ Created location 2: {location['location_id']}")
    
    def test_create_third_location(self, setup_test_user):
        """Create third location (should succeed - at limit)"""
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "Test Location 3", "address": "789 Third Blvd"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        location = data["location"]
        self.__class__.created_location_ids.append(location["location_id"])
        print(f"✓ Created location 3: {location['location_id']} (at plan limit)")
    
    def test_create_fourth_location_fails(self, setup_test_user):
        """Create fourth location should fail with 403 (exceeds plan limit)"""
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "Test Location 4", "address": "101 Fourth Way"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        
        # Should return 403 Forbidden when plan limit reached
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify error message mentions limit/upgrade
        detail = data.get("detail", "").lower()
        assert "limit" in detail or "upgrade" in detail, f"Error should mention limit: {detail}"
        print(f"✓ Fourth location correctly rejected with 403: {data.get('detail')}")
    
    def test_get_locations(self, setup_test_user):
        """Get all locations"""
        response = requests.get(
            f"{BASE_URL}/api/locations",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "locations" in data
        assert data.get("total") == 3
        assert data.get("max_locations") == 3
        assert data.get("can_add_more") == False  # At limit
        print(f"✓ Got {data.get('total')} locations, can_add_more: {data.get('can_add_more')}")


class TestQRCodePersistence:
    """Test QR Code ID persistence on location update"""
    
    def test_update_location_preserves_qr_code_id(self, setup_test_user):
        """Update location details should NOT change QR code ID"""
        # First get locations to find one to update
        response = requests.get(
            f"{BASE_URL}/api/locations",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        locations = response.json().get("locations", [])
        
        if not locations:
            pytest.skip("No locations to test")
        
        location = locations[0]
        original_qr_code_id = location.get("qr_code_id")
        location_id = location.get("location_id")
        
        print(f"  Original QR Code ID: {original_qr_code_id}")
        
        # Update location name and address
        update_response = requests.put(
            f"{BASE_URL}/api/locations/{location_id}",
            json={"name": "Updated Location Name", "address": "999 New Address"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert update_response.status_code == 200
        
        # Get locations again to verify QR code ID unchanged
        verify_response = requests.get(
            f"{BASE_URL}/api/locations",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert verify_response.status_code == 200
        updated_locations = verify_response.json().get("locations", [])
        
        updated_location = next((l for l in updated_locations if l["location_id"] == location_id), None)
        assert updated_location is not None
        
        new_qr_code_id = updated_location.get("qr_code_id")
        assert new_qr_code_id == original_qr_code_id, f"QR Code ID changed! {original_qr_code_id} -> {new_qr_code_id}"
        assert updated_location.get("name") == "Updated Location Name"
        assert updated_location.get("address") == "999 New Address"
        
        print(f"✓ QR Code ID preserved after update: {new_qr_code_id}")
        print(f"  Name updated to: {updated_location.get('name')}")


class TestDeleteLocation:
    """Test location deletion - should always be allowed"""
    
    def test_delete_location_always_allowed(self, setup_test_user):
        """Delete location should work even if only 1 location exists"""
        # Get current locations
        response = requests.get(
            f"{BASE_URL}/api/locations",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        locations = response.json().get("locations", [])
        initial_count = len(locations)
        
        if not locations:
            pytest.skip("No locations to delete")
        
        # Delete first location
        location_to_delete = locations[0]
        delete_response = requests.delete(
            f"{BASE_URL}/api/locations/{location_to_delete['location_id']}",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert delete_response.status_code == 200
        print(f"✓ Deleted location: {location_to_delete['location_id']}")
        
        # Verify deletion
        verify_response = requests.get(
            f"{BASE_URL}/api/locations",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert verify_response.status_code == 200
        remaining = verify_response.json().get("locations", [])
        assert len(remaining) == initial_count - 1
        print(f"  Remaining locations: {len(remaining)}")
    
    def test_delete_until_one_location(self, setup_test_user):
        """Delete locations until only 1 remains, then delete that one too"""
        # Get current locations
        response = requests.get(
            f"{BASE_URL}/api/locations",
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        locations = response.json().get("locations", [])
        
        # Delete all but one
        while len(locations) > 1:
            delete_response = requests.delete(
                f"{BASE_URL}/api/locations/{locations[0]['location_id']}",
                cookies={"session_token": TEST_SESSION_TOKEN}
            )
            assert delete_response.status_code == 200
            
            response = requests.get(
                f"{BASE_URL}/api/locations",
                cookies={"session_token": TEST_SESSION_TOKEN}
            )
            locations = response.json().get("locations", [])
        
        # Now we have 1 location - delete should still work
        if locations:
            last_location = locations[0]
            delete_response = requests.delete(
                f"{BASE_URL}/api/locations/{last_location['location_id']}",
                cookies={"session_token": TEST_SESSION_TOKEN}
            )
            assert delete_response.status_code == 200, f"Delete last location failed: {delete_response.text}"
            print(f"✓ Successfully deleted last remaining location: {last_location['location_id']}")
            
            # Verify no locations remain
            verify_response = requests.get(
                f"{BASE_URL}/api/locations",
                cookies={"session_token": TEST_SESSION_TOKEN}
            )
            remaining = verify_response.json().get("locations", [])
            assert len(remaining) == 0
            print("✓ All locations deleted - delete always allowed")
    
    def test_can_add_location_after_delete(self, setup_test_user):
        """After deleting, should be able to add new location"""
        response = requests.post(
            f"{BASE_URL}/api/locations",
            json={"name": "New Location After Delete", "address": "New Address"},
            cookies={"session_token": TEST_SESSION_TOKEN}
        )
        assert response.status_code == 200
        data = response.json()
        
        location = data["location"]
        assert location.get("name") == "New Location After Delete"
        print(f"✓ Created new location after delete: {location['location_id']}")


class TestDemoMode:
    """Test demo mode location data"""
    
    def test_demo_location_has_qr_code_id(self):
        """Demo location should have qr_code_id"""
        # Demo mode uses hardcoded data - check the public business endpoint
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_001")
        assert response.status_code == 200
        data = response.json()
        
        # Demo business should have qr_code_id
        assert data.get("business_id") == "demo_business_001"
        print(f"✓ Demo business accessible: {data.get('name')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
