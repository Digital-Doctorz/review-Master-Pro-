"""
Iteration 25 - Swiggy and Zomato Integration Tests
Tests for:
- POST /api/swiggy/connect-location/{location_id} saves swiggy_link to location
- POST /api/zomato/connect-location/{location_id} saves zomato_link to location
- GET /api/public/business/{qr_code_id} returns swiggy and zomato in platforms object
- POST /api/swiggy/connect saves swiggy_link to business
- POST /api/zomato/connect saves zomato_link to business
"""

import pytest
import requests
import os
import uuid
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_USER_ID = f"test_user_swiggy_zomato_{uuid.uuid4().hex[:8]}"
TEST_SESSION_TOKEN = f"test_session_swiggy_zomato_{uuid.uuid4().hex[:8]}"
TEST_LOCATION_ID = f"loc_test_swiggy_zomato_{uuid.uuid4().hex[:8]}"
TEST_QR_CODE_ID = f"qr_test_swiggy_zomato_{uuid.uuid4().hex[:8]}"
TEST_BUSINESS_ID = f"biz_test_swiggy_zomato_{uuid.uuid4().hex[:8]}"

# Sample Swiggy and Zomato links
SWIGGY_SMART_LINK = "https://www.swiggy.com/restaurants/test-restaurant-123"
SWIGGY_LISTING_URL = "https://www.swiggy.com/city/bangalore/test-restaurant-koramangala-rest123"
ZOMATO_LINK = "https://www.zomato.com/bangalore/test-restaurant-koramangala"


class TestSwiggyZomatoIntegration:
    """Test Swiggy and Zomato integration endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup_test_data(self):
        """Setup test user, session, location, and business before tests"""
        from pymongo import MongoClient
        
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        # Create test user
        db.users.insert_one({
            "user_id": TEST_USER_ID,
            "email": f"test_swiggy_zomato_{uuid.uuid4().hex[:6]}@example.com",
            "name": "Test Swiggy Zomato User",
            "plan": "growth",
            "max_locations": 10,
            "features": ["google_integration", "facebook_integration", "swiggy_integration", "zomato_integration"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create test session
        db.user_sessions.insert_one({
            "user_id": TEST_USER_ID,
            "session_token": TEST_SESSION_TOKEN,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create test location
        db.locations.insert_one({
            "location_id": TEST_LOCATION_ID,
            "user_id": TEST_USER_ID,
            "name": "Test Restaurant for Swiggy/Zomato",
            "address": "123 Test Street, Bangalore",
            "qr_code_id": TEST_QR_CODE_ID,
            "is_active": True,
            "is_primary": True,
            "google_place_id": None,
            "google_review_link": None,
            "facebook_page_id": None,
            "facebook_page_url": None,
            "swiggy_link": None,
            "zomato_link": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create test business
        db.businesses.insert_one({
            "business_id": TEST_BUSINESS_ID,
            "user_id": TEST_USER_ID,
            "name": "Test Business for Swiggy/Zomato",
            "category": "Restaurant",
            "qr_code_id": f"qr_biz_{uuid.uuid4().hex[:8]}",
            "swiggy_link": None,
            "zomato_link": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        yield
        
        # Cleanup after tests
        db.users.delete_many({"user_id": TEST_USER_ID})
        db.user_sessions.delete_many({"session_token": TEST_SESSION_TOKEN})
        db.locations.delete_many({"location_id": TEST_LOCATION_ID})
        db.businesses.delete_many({"business_id": TEST_BUSINESS_ID})
        db.platform_connections.delete_many({"business_id": TEST_BUSINESS_ID})
        client.close()
    
    @pytest.fixture
    def auth_headers(self):
        """Return headers with auth token"""
        return {
            "Authorization": f"Bearer {TEST_SESSION_TOKEN}",
            "Content-Type": "application/json"
        }
    
    # ============ SWIGGY LOCATION CONNECT TESTS ============
    
    def test_swiggy_connect_location_success(self, auth_headers):
        """Test POST /api/swiggy/connect-location/{location_id} saves swiggy_link"""
        response = requests.post(
            f"{BASE_URL}/api/swiggy/connect-location/{TEST_LOCATION_ID}",
            headers=auth_headers,
            json={
                "swiggy_link": SWIGGY_SMART_LINK,
                "restaurant_name": "Test Restaurant"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["message"] == "Swiggy connected to location"
        assert data["swiggy_link"] == SWIGGY_SMART_LINK
        assert data["restaurant_name"] == "Test Restaurant"
        print(f"SUCCESS: Swiggy connected to location - {data}")
    
    def test_swiggy_connect_location_listing_url(self, auth_headers):
        """Test Swiggy connect with listing URL format"""
        response = requests.post(
            f"{BASE_URL}/api/swiggy/connect-location/{TEST_LOCATION_ID}",
            headers=auth_headers,
            json={
                "swiggy_link": SWIGGY_LISTING_URL,
                "restaurant_name": "Test Restaurant Listing"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["swiggy_link"] == SWIGGY_LISTING_URL
        print(f"SUCCESS: Swiggy listing URL connected - {data}")
    
    def test_swiggy_connect_location_missing_link(self, auth_headers):
        """Test Swiggy connect fails without swiggy_link"""
        response = requests.post(
            f"{BASE_URL}/api/swiggy/connect-location/{TEST_LOCATION_ID}",
            headers=auth_headers,
            json={"restaurant_name": "Test Restaurant"}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "Swiggy link is required" in data.get("detail", "")
        print(f"SUCCESS: Swiggy connect correctly rejects missing link - {data}")
    
    def test_swiggy_connect_location_not_found(self, auth_headers):
        """Test Swiggy connect fails for non-existent location"""
        response = requests.post(
            f"{BASE_URL}/api/swiggy/connect-location/loc_nonexistent_123",
            headers=auth_headers,
            json={"swiggy_link": SWIGGY_SMART_LINK}
        )
        
        assert response.status_code == 404
        print(f"SUCCESS: Swiggy connect correctly returns 404 for non-existent location")
    
    def test_swiggy_connect_location_unauthorized(self):
        """Test Swiggy connect fails without auth"""
        response = requests.post(
            f"{BASE_URL}/api/swiggy/connect-location/{TEST_LOCATION_ID}",
            json={"swiggy_link": SWIGGY_SMART_LINK}
        )
        
        assert response.status_code == 401
        print(f"SUCCESS: Swiggy connect correctly requires authentication")
    
    # ============ ZOMATO LOCATION CONNECT TESTS ============
    
    def test_zomato_connect_location_success(self, auth_headers):
        """Test POST /api/zomato/connect-location/{location_id} saves zomato_link"""
        response = requests.post(
            f"{BASE_URL}/api/zomato/connect-location/{TEST_LOCATION_ID}",
            headers=auth_headers,
            json={
                "zomato_link": ZOMATO_LINK,
                "restaurant_name": "Test Restaurant Zomato"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["message"] == "Zomato connected to location"
        assert data["zomato_link"] == ZOMATO_LINK
        assert data["restaurant_name"] == "Test Restaurant Zomato"
        print(f"SUCCESS: Zomato connected to location - {data}")
    
    def test_zomato_connect_location_missing_link(self, auth_headers):
        """Test Zomato connect fails without zomato_link"""
        response = requests.post(
            f"{BASE_URL}/api/zomato/connect-location/{TEST_LOCATION_ID}",
            headers=auth_headers,
            json={"restaurant_name": "Test Restaurant"}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "Zomato link is required" in data.get("detail", "")
        print(f"SUCCESS: Zomato connect correctly rejects missing link - {data}")
    
    def test_zomato_connect_location_not_found(self, auth_headers):
        """Test Zomato connect fails for non-existent location"""
        response = requests.post(
            f"{BASE_URL}/api/zomato/connect-location/loc_nonexistent_456",
            headers=auth_headers,
            json={"zomato_link": ZOMATO_LINK}
        )
        
        assert response.status_code == 404
        print(f"SUCCESS: Zomato connect correctly returns 404 for non-existent location")
    
    def test_zomato_connect_location_unauthorized(self):
        """Test Zomato connect fails without auth"""
        response = requests.post(
            f"{BASE_URL}/api/zomato/connect-location/{TEST_LOCATION_ID}",
            json={"zomato_link": ZOMATO_LINK}
        )
        
        assert response.status_code == 401
        print(f"SUCCESS: Zomato connect correctly requires authentication")
    
    # ============ PUBLIC BUSINESS ENDPOINT TESTS ============
    
    def test_public_business_returns_swiggy_platform(self, auth_headers):
        """Test GET /api/public/business/{qr_code_id} returns swiggy in platforms"""
        # First connect Swiggy
        connect_response = requests.post(
            f"{BASE_URL}/api/swiggy/connect-location/{TEST_LOCATION_ID}",
            headers=auth_headers,
            json={"swiggy_link": SWIGGY_SMART_LINK}
        )
        assert connect_response.status_code == 200
        
        # Then check public endpoint
        response = requests.get(f"{BASE_URL}/api/public/business/{TEST_QR_CODE_ID}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify swiggy_link is in response
        assert data.get("swiggy_link") == SWIGGY_SMART_LINK, f"Expected swiggy_link, got {data.get('swiggy_link')}"
        
        # Verify swiggy is in platforms object
        assert "platforms" in data
        assert "swiggy" in data["platforms"], f"Expected swiggy in platforms, got {data['platforms'].keys()}"
        assert data["platforms"]["swiggy"]["connected"] == True
        assert data["platforms"]["swiggy"]["review_link"] == SWIGGY_SMART_LINK
        print(f"SUCCESS: Public business returns Swiggy platform - {data['platforms']['swiggy']}")
    
    def test_public_business_returns_zomato_platform(self, auth_headers):
        """Test GET /api/public/business/{qr_code_id} returns zomato in platforms"""
        # First connect Zomato
        connect_response = requests.post(
            f"{BASE_URL}/api/zomato/connect-location/{TEST_LOCATION_ID}",
            headers=auth_headers,
            json={"zomato_link": ZOMATO_LINK}
        )
        assert connect_response.status_code == 200
        
        # Then check public endpoint
        response = requests.get(f"{BASE_URL}/api/public/business/{TEST_QR_CODE_ID}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify zomato_link is in response
        assert data.get("zomato_link") == ZOMATO_LINK, f"Expected zomato_link, got {data.get('zomato_link')}"
        
        # Verify zomato is in platforms object
        assert "platforms" in data
        assert "zomato" in data["platforms"], f"Expected zomato in platforms, got {data['platforms'].keys()}"
        assert data["platforms"]["zomato"]["connected"] == True
        assert data["platforms"]["zomato"]["review_link"] == ZOMATO_LINK
        print(f"SUCCESS: Public business returns Zomato platform - {data['platforms']['zomato']}")
    
    def test_public_business_returns_both_swiggy_zomato(self, auth_headers):
        """Test public endpoint returns both Swiggy and Zomato when both connected"""
        # Connect both platforms
        requests.post(
            f"{BASE_URL}/api/swiggy/connect-location/{TEST_LOCATION_ID}",
            headers=auth_headers,
            json={"swiggy_link": SWIGGY_SMART_LINK}
        )
        requests.post(
            f"{BASE_URL}/api/zomato/connect-location/{TEST_LOCATION_ID}",
            headers=auth_headers,
            json={"zomato_link": ZOMATO_LINK}
        )
        
        # Check public endpoint
        response = requests.get(f"{BASE_URL}/api/public/business/{TEST_QR_CODE_ID}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify both platforms are present
        assert "swiggy" in data["platforms"]
        assert "zomato" in data["platforms"]
        assert data["platforms"]["swiggy"]["connected"] == True
        assert data["platforms"]["zomato"]["connected"] == True
        print(f"SUCCESS: Public business returns both Swiggy and Zomato platforms")
    
    # ============ DEMO QR CODE TESTS ============
    
    def test_demo_qr_returns_google_facebook_only(self):
        """Test demo QR code returns only Google and Facebook (no Swiggy/Zomato)"""
        response = requests.get(f"{BASE_URL}/api/public/business/demo_qr_001")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_demo"] == True
        assert "google" in data["platforms"]
        assert "facebook" in data["platforms"]
        # Demo doesn't have Swiggy/Zomato by default
        assert data.get("swiggy_link") is None or "swiggy" not in data.get("platforms", {})
        assert data.get("zomato_link") is None or "zomato" not in data.get("platforms", {})
        print(f"SUCCESS: Demo QR returns Google and Facebook platforms only")
    
    # ============ BUSINESS-LEVEL SWIGGY/ZOMATO CONNECT TESTS ============
    
    def test_swiggy_connect_business_success(self, auth_headers):
        """Test POST /api/swiggy/connect saves swiggy_link to business"""
        response = requests.post(
            f"{BASE_URL}/api/swiggy/connect",
            headers=auth_headers,
            json={
                "swiggy_link": SWIGGY_SMART_LINK,
                "restaurant_name": "Test Business Swiggy"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["message"] == "Swiggy connected successfully"
        assert data["swiggy_link"] == SWIGGY_SMART_LINK
        print(f"SUCCESS: Swiggy connected to business - {data}")
    
    def test_zomato_connect_business_success(self, auth_headers):
        """Test POST /api/zomato/connect saves zomato_link to business"""
        response = requests.post(
            f"{BASE_URL}/api/zomato/connect",
            headers=auth_headers,
            json={
                "zomato_link": ZOMATO_LINK,
                "restaurant_name": "Test Business Zomato"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["message"] == "Zomato connected successfully"
        assert data["zomato_link"] == ZOMATO_LINK
        print(f"SUCCESS: Zomato connected to business - {data}")
    
    def test_swiggy_connect_invalid_url(self, auth_headers):
        """Test Swiggy connect rejects non-Swiggy URLs"""
        response = requests.post(
            f"{BASE_URL}/api/swiggy/connect",
            headers=auth_headers,
            json={"swiggy_link": "https://www.google.com/invalid"}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "valid Swiggy link" in data.get("detail", "")
        print(f"SUCCESS: Swiggy connect rejects invalid URL - {data}")
    
    def test_zomato_connect_invalid_url(self, auth_headers):
        """Test Zomato connect rejects non-Zomato URLs"""
        response = requests.post(
            f"{BASE_URL}/api/zomato/connect",
            headers=auth_headers,
            json={"zomato_link": "https://www.google.com/invalid"}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "valid Zomato link" in data.get("detail", "")
        print(f"SUCCESS: Zomato connect rejects invalid URL - {data}")


class TestSwiggyZomatoDisconnect:
    """Test platform disconnect functionality for Swiggy and Zomato"""
    
    @pytest.fixture(autouse=True)
    def setup_test_data(self):
        """Setup test user, session, and business"""
        from pymongo import MongoClient
        
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        self.test_user_id = f"test_user_disconnect_{uuid.uuid4().hex[:8]}"
        self.test_session_token = f"test_session_disconnect_{uuid.uuid4().hex[:8]}"
        self.test_business_id = f"biz_test_disconnect_{uuid.uuid4().hex[:8]}"
        
        # Create test user
        db.users.insert_one({
            "user_id": self.test_user_id,
            "email": f"test_disconnect_{uuid.uuid4().hex[:6]}@example.com",
            "name": "Test Disconnect User",
            "plan": "growth",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create test session
        db.user_sessions.insert_one({
            "user_id": self.test_user_id,
            "session_token": self.test_session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create test business with Swiggy and Zomato connected
        db.businesses.insert_one({
            "business_id": self.test_business_id,
            "user_id": self.test_user_id,
            "name": "Test Business Disconnect",
            "category": "Restaurant",
            "qr_code_id": f"qr_disconnect_{uuid.uuid4().hex[:8]}",
            "swiggy_restaurant_id": "swiggy_123",
            "swiggy_restaurant_name": "Test Restaurant",
            "swiggy_link": SWIGGY_SMART_LINK,
            "zomato_restaurant_id": "zomato_456",
            "zomato_restaurant_name": "Test Restaurant",
            "zomato_link": ZOMATO_LINK,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create platform connections
        db.platform_connections.insert_one({
            "business_id": self.test_business_id,
            "platform": "swiggy",
            "status": "connected",
            "restaurant_id": "swiggy_123",
            "review_link": SWIGGY_SMART_LINK
        })
        db.platform_connections.insert_one({
            "business_id": self.test_business_id,
            "platform": "zomato",
            "status": "connected",
            "restaurant_id": "zomato_456",
            "review_link": ZOMATO_LINK
        })
        
        yield
        
        # Cleanup
        db.users.delete_many({"user_id": self.test_user_id})
        db.user_sessions.delete_many({"session_token": self.test_session_token})
        db.businesses.delete_many({"business_id": self.test_business_id})
        db.platform_connections.delete_many({"business_id": self.test_business_id})
        client.close()
    
    def test_disconnect_swiggy(self):
        """Test disconnecting Swiggy platform"""
        headers = {
            "Authorization": f"Bearer {self.test_session_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/platforms/swiggy/disconnect",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Swiggy disconnected"
        print(f"SUCCESS: Swiggy disconnected - {data}")
    
    def test_disconnect_zomato(self):
        """Test disconnecting Zomato platform"""
        headers = {
            "Authorization": f"Bearer {self.test_session_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/platforms/zomato/disconnect",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Zomato disconnected"
        print(f"SUCCESS: Zomato disconnected - {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
