"""
Iteration 15 - Location Management & Multi-Location Support Tests
Tests for:
- /api/user/plan - User subscription plan with location limits
- /api/locations - List user's locations
- POST /api/locations - Create new location respecting plan limits
- DELETE /api/locations/{id} - Soft delete a location
- POST /api/locations/{id}/connect/google - Connect Google to a location
- POST /api/locations/{id}/connect/facebook - Connect Facebook to a location
- /api/analytics/overview - Analytics with proper sentiment_breakdown structure
- /api/platforms - Platform connections
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
SESSION_TOKEN = os.environ.get('TEST_SESSION_TOKEN', '')

class TestHealthAndAuth:
    """Basic health and auth tests"""
    
    def test_health_check(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health check passed")
    
    def test_auth_me_with_session(self):
        """Test auth/me endpoint with session token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        print(f"✓ Auth/me passed - User: {data.get('email')}")


class TestUserPlan:
    """User plan and subscription tests"""
    
    def test_get_user_plan(self):
        """Test GET /api/user/plan returns plan with location limits"""
        response = requests.get(
            f"{BASE_URL}/api/user/plan",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify plan structure
        assert "plan_name" in data, "plan_name field missing"
        assert "max_locations" in data, "max_locations field missing"
        assert "current_locations" in data, "current_locations field missing"
        assert "can_add_location" in data, "can_add_location field missing"
        
        # Verify data types
        assert isinstance(data["max_locations"], int), "max_locations should be int"
        assert isinstance(data["current_locations"], int), "current_locations should be int"
        assert isinstance(data["can_add_location"], bool), "can_add_location should be bool"
        
        print(f"✓ User plan: {data.get('plan_name')}, max_locations: {data.get('max_locations')}")
        return data


class TestBusinessSetup:
    """Business setup tests - needed before location tests"""
    
    def test_create_business_if_not_exists(self):
        """Create business if user doesn't have one"""
        # First check if business exists
        response = requests.get(
            f"{BASE_URL}/api/business",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        
        if response.status_code == 200 and response.json():
            print(f"✓ Business already exists: {response.json().get('name')}")
            return response.json()
        
        # Create business
        response = requests.post(
            f"{BASE_URL}/api/business",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"},
            json={
                "name": "Test Business Iteration 15",
                "category": "Restaurant",
                "address": "123 Test Street"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "business_id" in data
        print(f"✓ Business created: {data.get('business_id')}")
        return data


class TestLocations:
    """Location management tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Ensure business exists before location tests"""
        response = requests.get(
            f"{BASE_URL}/api/business",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        if not (response.status_code == 200 and response.json()):
            requests.post(
                f"{BASE_URL}/api/business",
                headers={"Authorization": f"Bearer {SESSION_TOKEN}"},
                json={"name": "Test Business", "category": "Restaurant"}
            )
    
    def test_get_locations(self):
        """Test GET /api/locations returns list of locations"""
        response = requests.get(
            f"{BASE_URL}/api/locations",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "locations" in data, "locations field missing"
        assert "total" in data, "total field missing"
        assert "max_locations" in data, "max_locations field missing"
        assert "can_add_more" in data, "can_add_more field missing"
        
        assert isinstance(data["locations"], list), "locations should be a list"
        print(f"✓ Locations: {data.get('total')} of {data.get('max_locations')}")
        return data
    
    def test_create_location(self):
        """Test POST /api/locations creates new location"""
        response = requests.post(
            f"{BASE_URL}/api/locations",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"},
            json={
                "name": "Test Location Iteration 15",
                "address": "456 Test Avenue"
            }
        )
        
        # Could be 200 (success) or 403 (limit reached)
        if response.status_code == 403:
            data = response.json()
            assert "limit" in data.get("detail", "").lower() or "upgrade" in data.get("detail", "").lower()
            print(f"✓ Location limit enforced: {data.get('detail')}")
            return None
        
        assert response.status_code == 200
        data = response.json()
        assert "location" in data, "location field missing in response"
        assert "location_id" in data["location"], "location_id missing"
        print(f"✓ Location created: {data['location'].get('location_id')}")
        return data["location"]
    
    def test_delete_location(self):
        """Test DELETE /api/locations/{id} soft deletes location"""
        # First get locations
        response = requests.get(
            f"{BASE_URL}/api/locations",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        locations = response.json().get("locations", [])
        
        if len(locations) <= 1:
            print("✓ Skipping delete test - only 1 or 0 locations")
            return
        
        # Delete the last non-primary location
        location_to_delete = None
        for loc in reversed(locations):
            if not loc.get("is_primary"):
                location_to_delete = loc
                break
        
        if not location_to_delete:
            print("✓ Skipping delete test - no non-primary locations")
            return
        
        location_id = location_to_delete["location_id"]
        response = requests.delete(
            f"{BASE_URL}/api/locations/{location_id}",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Location deleted: {location_id}")


class TestLocationPlatformConnections:
    """Location platform connection tests"""
    
    def get_first_location(self):
        """Helper to get first location"""
        response = requests.get(
            f"{BASE_URL}/api/locations",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        locations = response.json().get("locations", [])
        return locations[0] if locations else None
    
    def test_connect_google_to_location(self):
        """Test POST /api/locations/{id}/connect/google"""
        location = self.get_first_location()
        if not location:
            pytest.skip("No locations available")
        
        location_id = location["location_id"]
        response = requests.post(
            f"{BASE_URL}/api/locations/{location_id}/connect/google",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"},
            json={
                "review_link": "https://g.page/r/test-google-review-link",
                "platform_name": "Test Google Business"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "google" in data.get("message", "").lower()
        print(f"✓ Google connected to location: {location_id}")
    
    def test_connect_facebook_to_location(self):
        """Test POST /api/locations/{id}/connect/facebook"""
        location = self.get_first_location()
        if not location:
            pytest.skip("No locations available")
        
        location_id = location["location_id"]
        response = requests.post(
            f"{BASE_URL}/api/locations/{location_id}/connect/facebook",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"},
            json={
                "review_link": "https://facebook.com/testbusiness/reviews",
                "platform_name": "Test Facebook Page"
            }
        )
        
        # Could be 200 (success) or 403 (not in plan)
        if response.status_code == 403:
            data = response.json()
            assert "facebook" in data.get("detail", "").lower() or "plan" in data.get("detail", "").lower()
            print(f"✓ Facebook plan restriction enforced: {data.get('detail')}")
            return
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Facebook connected to location: {location_id}")


class TestAnalytics:
    """Analytics endpoint tests"""
    
    def test_analytics_overview_structure(self):
        """Test GET /api/analytics/overview returns proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/overview",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "total_reviews" in data, "total_reviews field missing"
        assert "average_rating" in data, "average_rating field missing"
        assert "sentiment_breakdown" in data, "sentiment_breakdown field missing"
        assert "rating_distribution" in data, "rating_distribution field missing"
        assert "response_rate" in data, "response_rate field missing"
        assert "platform_breakdown" in data, "platform_breakdown field missing"
        
        # Verify sentiment_breakdown structure (this was the [object Object] bug)
        sentiment = data["sentiment_breakdown"]
        assert isinstance(sentiment, dict), "sentiment_breakdown should be a dict"
        assert "positive" in sentiment, "positive missing from sentiment_breakdown"
        assert "neutral" in sentiment, "neutral missing from sentiment_breakdown"
        assert "negative" in sentiment, "negative missing from sentiment_breakdown"
        
        print(f"✓ Analytics overview: {data.get('total_reviews')} reviews, {data.get('average_rating')} avg rating")
        print(f"  Sentiment: positive={sentiment.get('positive')}, neutral={sentiment.get('neutral')}, negative={sentiment.get('negative')}")
        return data


class TestPlatforms:
    """Platform connections tests"""
    
    def test_get_platforms(self):
        """Test GET /api/platforms returns platform connections"""
        response = requests.get(
            f"{BASE_URL}/api/platforms",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "platforms should return a list"
        
        for platform in data:
            assert "platform" in platform, "platform field missing"
            assert "status" in platform, "status field missing"
            assert platform["platform"] in ["google", "facebook"], f"Unknown platform: {platform['platform']}"
        
        connected = [p for p in data if p.get("status") == "connected"]
        print(f"✓ Platforms: {len(connected)} connected out of {len(data)}")
        return data


class TestIntegrationStatus:
    """Integration status tests"""
    
    def test_integration_status(self):
        """Test GET /api/integration-status returns proper structure"""
        response = requests.get(
            f"{BASE_URL}/api/integration-status",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "google" in data, "google field missing"
        assert "facebook" in data, "facebook field missing"
        assert "overall_mode" in data, "overall_mode field missing"
        
        print(f"✓ Integration status: {data.get('overall_mode')} mode")
        return data


# Run tests if executed directly
if __name__ == "__main__":
    import sys
    sys.exit(pytest.main([__file__, "-v", "--tb=short"]))
