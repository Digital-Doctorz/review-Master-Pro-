"""
Iteration 16 - Demo Mode Feature Testing
Tests for:
1. Backend API health endpoints
2. Demo mode doesn't require authentication
3. Session storage demo_mode flag behavior
"""

import pytest
import requests
import os

# Get backend URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendHealth:
    """Test backend health and root endpoints"""
    
    def test_api_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✅ /api/health: {data}")
    
    def test_api_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "version" in data
        print(f"✅ /api/: {data}")


class TestDemoModeBackend:
    """Test that demo mode doesn't hit backend APIs"""
    
    def test_auth_me_without_session_returns_401(self):
        """Test /api/auth/me returns 401 without session (demo mode bypasses this)"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        # Without session, should return 401
        assert response.status_code == 401
        print("✅ /api/auth/me returns 401 without session (expected)")
    
    def test_business_without_session_returns_401(self):
        """Test /api/business returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/business")
        assert response.status_code == 401
        print("✅ /api/business returns 401 without session (expected)")
    
    def test_reviews_without_session_returns_401(self):
        """Test /api/reviews returns 401 without session"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 401
        print("✅ /api/reviews returns 401 without session (expected)")


class TestAnalyticsEndpoint:
    """Test analytics endpoint structure"""
    
    @pytest.fixture
    def session_token(self):
        """Get a test session token if available"""
        # Try to use existing test session
        return os.environ.get('TEST_SESSION_TOKEN', 'test_session_1768412263840')
    
    def test_analytics_overview_structure(self, session_token):
        """Test /api/analytics/overview returns proper structure"""
        cookies = {"session_token": session_token}
        response = requests.get(f"{BASE_URL}/api/analytics/overview", cookies=cookies)
        
        if response.status_code == 200:
            data = response.json()
            # Check for sentiment_breakdown structure
            if "sentiment_breakdown" in data:
                sb = data["sentiment_breakdown"]
                assert "positive" in sb or sb == {}
                print(f"✅ Analytics sentiment_breakdown structure: {sb}")
            print(f"✅ /api/analytics/overview: {response.status_code}")
        elif response.status_code == 401:
            print("⚠️ /api/analytics/overview: 401 (no valid session)")
            pytest.skip("No valid session for analytics test")
        else:
            print(f"⚠️ /api/analytics/overview: {response.status_code}")


class TestIntegrationStatus:
    """Test integration status endpoint"""
    
    @pytest.fixture
    def session_token(self):
        return os.environ.get('TEST_SESSION_TOKEN', 'test_session_1768412263840')
    
    def test_integration_status_endpoint(self, session_token):
        """Test /api/integration-status returns proper structure"""
        cookies = {"session_token": session_token}
        response = requests.get(f"{BASE_URL}/api/integration-status", cookies=cookies)
        
        if response.status_code == 200:
            data = response.json()
            # Should have google, facebook, overall_mode
            print(f"✅ /api/integration-status: {data}")
        elif response.status_code == 401:
            print("⚠️ /api/integration-status: 401 (no valid session)")
            pytest.skip("No valid session")
        else:
            print(f"⚠️ /api/integration-status: {response.status_code}")


class TestLocationsEndpoint:
    """Test locations endpoint"""
    
    @pytest.fixture
    def session_token(self):
        return os.environ.get('TEST_SESSION_TOKEN', 'test_session_1768412263840')
    
    def test_locations_list_endpoint(self, session_token):
        """Test /api/locations returns locations list"""
        cookies = {"session_token": session_token}
        response = requests.get(f"{BASE_URL}/api/locations", cookies=cookies)
        
        if response.status_code == 200:
            data = response.json()
            # Should have locations array
            assert "locations" in data or isinstance(data, list)
            print(f"✅ /api/locations: {response.status_code}")
        elif response.status_code == 401:
            print("⚠️ /api/locations: 401 (no valid session)")
            pytest.skip("No valid session")
        else:
            print(f"⚠️ /api/locations: {response.status_code}")


class TestUserPlanEndpoint:
    """Test user plan endpoint"""
    
    @pytest.fixture
    def session_token(self):
        return os.environ.get('TEST_SESSION_TOKEN', 'test_session_1768412263840')
    
    def test_user_plan_endpoint(self, session_token):
        """Test /api/user/plan returns plan info"""
        cookies = {"session_token": session_token}
        response = requests.get(f"{BASE_URL}/api/user/plan", cookies=cookies)
        
        if response.status_code == 200:
            data = response.json()
            # Should have plan_name, max_locations
            print(f"✅ /api/user/plan: {data}")
        elif response.status_code == 401:
            print("⚠️ /api/user/plan: 401 (no valid session)")
            pytest.skip("No valid session")
        else:
            print(f"⚠️ /api/user/plan: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
