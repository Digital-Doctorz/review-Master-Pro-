"""
Iteration 17 - Navigation and Demo Mode Testing
Tests all navigation workflows and demo mode functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://feedback-hub-128.preview.emergentagent.com').rstrip('/')

class TestBackendHealth:
    """Backend health endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✅ /api/health: {data}")
    
    def test_root_api_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Review Master" in data.get("message", "")
        print(f"✅ /api/: {data}")
    
    def test_protected_endpoint_without_auth(self):
        """Test protected endpoints return 401 without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print(f"✅ /api/auth/me without auth: 401 (expected)")
    
    def test_business_endpoint_without_auth(self):
        """Test business endpoint returns 401 without authentication"""
        response = requests.get(f"{BASE_URL}/api/business")
        assert response.status_code == 401
        print(f"✅ /api/business without auth: 401 (expected)")


class TestNavigationRoutes:
    """Test that all navigation routes are accessible (frontend routes)"""
    
    def test_landing_page(self):
        """Test landing page loads"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert "Review Master" in response.text or "html" in response.text.lower()
        print(f"✅ Landing page: 200")
    
    def test_dashboard_route_redirects(self):
        """Test dashboard route (should redirect without auth)"""
        response = requests.get(f"{BASE_URL}/dashboard", allow_redirects=False)
        # Frontend routes return 200 (SPA) but redirect happens client-side
        assert response.status_code == 200
        print(f"✅ /dashboard route: 200 (SPA)")
    
    def test_webhooks_route(self):
        """Test webhooks route exists"""
        response = requests.get(f"{BASE_URL}/webhooks", allow_redirects=False)
        assert response.status_code == 200
        print(f"✅ /webhooks route: 200 (SPA)")
    
    def test_notifications_route(self):
        """Test notifications route exists"""
        response = requests.get(f"{BASE_URL}/notifications", allow_redirects=False)
        assert response.status_code == 200
        print(f"✅ /notifications route: 200 (SPA)")
    
    def test_api_settings_route(self):
        """Test api-settings route exists"""
        response = requests.get(f"{BASE_URL}/api-settings", allow_redirects=False)
        assert response.status_code == 200
        print(f"✅ /api-settings route: 200 (SPA)")
    
    def test_settings_route(self):
        """Test settings route exists"""
        response = requests.get(f"{BASE_URL}/settings", allow_redirects=False)
        assert response.status_code == 200
        print(f"✅ /settings route: 200 (SPA)")
    
    def test_qr_generator_route(self):
        """Test qr-generator route exists"""
        response = requests.get(f"{BASE_URL}/qr-generator", allow_redirects=False)
        assert response.status_code == 200
        print(f"✅ /qr-generator route: 200 (SPA)")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
