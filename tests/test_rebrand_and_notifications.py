"""
Test suite for Review Master rebrand and notification settings
Tests:
- API rebrand to "Review Master" with version 3.0.0
- Health endpoint
- Notification settings CRUD
- Test email functionality
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
SESSION_TOKEN = "test_session_1768051374411"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def authenticated_client(api_client):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {SESSION_TOKEN}"})
    return api_client


class TestAPIRebrand:
    """Test API rebrand to Review Master"""
    
    def test_api_root_returns_review_master(self, api_client):
        """GET /api/ should return 'Review Master API' with version 3.0.0"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["message"] == "Review Master API"
        assert data["version"] == "3.0.0"
    
    def test_health_endpoint(self, api_client):
        """GET /api/health should return healthy status"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"


class TestNotificationSettings:
    """Test notification settings endpoints"""
    
    def test_get_notification_settings_requires_auth(self, api_client):
        """GET /api/notifications/settings should require authentication"""
        response = api_client.get(f"{BASE_URL}/api/notifications/settings")
        assert response.status_code == 401
    
    def test_get_notification_settings(self, authenticated_client):
        """GET /api/notifications/settings should return notification preferences"""
        response = authenticated_client.get(f"{BASE_URL}/api/notifications/settings")
        assert response.status_code == 200
        
        data = response.json()
        # Check required fields
        assert "email_new_reviews" in data
        assert "email_private_feedback" in data
        assert "email_weekly_summary" in data
        assert "notification_email" in data
        assert "email_service_enabled" in data
        
        # Verify types
        assert isinstance(data["email_new_reviews"], bool)
        assert isinstance(data["email_private_feedback"], bool)
        assert isinstance(data["email_weekly_summary"], bool)
        assert isinstance(data["email_service_enabled"], bool)
    
    def test_update_notification_settings_requires_auth(self, api_client):
        """PUT /api/notifications/settings should require authentication"""
        response = api_client.put(
            f"{BASE_URL}/api/notifications/settings",
            json={"email_new_reviews": True}
        )
        assert response.status_code == 401
    
    def test_update_notification_settings(self, authenticated_client):
        """PUT /api/notifications/settings should update preferences"""
        # Update settings
        update_data = {
            "email_new_reviews": True,
            "email_private_feedback": True,
            "email_weekly_summary": True
        }
        response = authenticated_client.put(
            f"{BASE_URL}/api/notifications/settings",
            json=update_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["message"] == "Notification settings updated"
        
        # Verify persistence
        get_response = authenticated_client.get(f"{BASE_URL}/api/notifications/settings")
        assert get_response.status_code == 200
        
        settings = get_response.json()
        assert settings["email_new_reviews"] == True
        assert settings["email_private_feedback"] == True
        assert settings["email_weekly_summary"] == True
        
        # Reset weekly summary to false
        authenticated_client.put(
            f"{BASE_URL}/api/notifications/settings",
            json={"email_weekly_summary": False}
        )
    
    def test_send_test_email_requires_auth(self, api_client):
        """POST /api/notifications/test should require authentication"""
        response = api_client.post(f"{BASE_URL}/api/notifications/test")
        assert response.status_code == 401
    
    def test_send_test_email(self, authenticated_client):
        """POST /api/notifications/test should attempt to send test email"""
        response = authenticated_client.post(f"{BASE_URL}/api/notifications/test")
        assert response.status_code == 200
        
        data = response.json()
        # Email service is disabled, so status should be "disabled"
        assert "status" in data
        assert data["status"] in ["success", "disabled", "error"]
        
        # Since RESEND_API_KEY is not configured, expect disabled
        if data["status"] == "disabled":
            assert data["message"] == "Failed to send"


class TestEmailStatus:
    """Test email service status endpoint"""
    
    def test_email_status_endpoint(self, api_client):
        """GET /api/email/status should return email service status"""
        response = api_client.get(f"{BASE_URL}/api/email/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "enabled" in data
        assert isinstance(data["enabled"], bool)


class TestIntegrationStatus:
    """Test integration status endpoint"""
    
    def test_integration_status_requires_auth(self, api_client):
        """GET /api/integration-status should require authentication"""
        response = api_client.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 401
    
    def test_integration_status(self, authenticated_client):
        """GET /api/integration-status should return platform integration status"""
        response = authenticated_client.get(f"{BASE_URL}/api/integration-status")
        assert response.status_code == 200
        
        data = response.json()
        # Check required fields
        assert "google" in data
        assert "facebook" in data
        assert "email" in data
        assert "overall_mode" in data
        
        # Check email status is included
        assert "enabled" in data["email"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
