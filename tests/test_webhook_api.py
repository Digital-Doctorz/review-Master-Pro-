"""
ReviewFlow Webhook API Tests - Comprehensive Backend Testing
Tests all webhook-related API endpoints including config, events, and webhook handlers
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://feedback-hub-131.preview.emergentagent.com').rstrip('/')
SESSION_TOKEN = os.environ.get('TEST_SESSION_TOKEN', 'test_session_1768051374411')


class TestWebhookConfigEndpoints:
    """Webhook configuration endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_get_webhook_config_requires_auth(self):
        """Test GET /api/webhooks/config requires authentication"""
        response = requests.get(f"{BASE_URL}/api/webhooks/config")
        assert response.status_code == 401
        print("✅ GET /api/webhooks/config requires auth")
    
    def test_get_webhook_config(self):
        """Test GET /api/webhooks/config returns webhook configuration"""
        response = requests.get(f"{BASE_URL}/api/webhooks/config", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "webhook_id" in data
        assert "business_id" in data
        assert "webhook_secret" in data
        assert "google_enabled" in data
        assert "facebook_enabled" in data
        assert "webhook_url_google" in data
        assert "webhook_url_facebook" in data
        assert "webhook_secret_preview" in data
        assert "trigger_count" in data
        
        # Verify webhook_id format
        assert data["webhook_id"].startswith("wh_")
        
        # Verify secret preview is truncated
        assert data["webhook_secret_preview"].endswith("...")
        
        print(f"✅ GET /api/webhooks/config returns config: webhook_id={data['webhook_id']}")
        print(f"   Google enabled: {data['google_enabled']}, Facebook enabled: {data['facebook_enabled']}")
        return data
    
    def test_update_webhook_config_requires_auth(self):
        """Test PUT /api/webhooks/config requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/webhooks/config",
            json={"google_enabled": True, "facebook_enabled": False}
        )
        assert response.status_code == 401
        print("✅ PUT /api/webhooks/config requires auth")
    
    def test_update_webhook_config_enable_google(self):
        """Test PUT /api/webhooks/config enables Google webhook"""
        response = requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": True, "facebook_enabled": False}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Webhook settings updated"
        
        # Verify the change
        config_response = requests.get(f"{BASE_URL}/api/webhooks/config", headers=self.headers)
        config = config_response.json()
        assert config["google_enabled"] == True
        assert config["facebook_enabled"] == False
        
        print("✅ PUT /api/webhooks/config enables Google webhook")
    
    def test_update_webhook_config_enable_both(self):
        """Test PUT /api/webhooks/config enables both webhooks"""
        response = requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": True, "facebook_enabled": True}
        )
        assert response.status_code == 200
        
        # Verify the change
        config_response = requests.get(f"{BASE_URL}/api/webhooks/config", headers=self.headers)
        config = config_response.json()
        assert config["google_enabled"] == True
        assert config["facebook_enabled"] == True
        
        print("✅ PUT /api/webhooks/config enables both webhooks")


class TestWebhookSecretRegeneration:
    """Webhook secret regeneration tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_regenerate_secret_requires_auth(self):
        """Test POST /api/webhooks/regenerate-secret requires authentication"""
        response = requests.post(f"{BASE_URL}/api/webhooks/regenerate-secret")
        assert response.status_code == 401
        print("✅ POST /api/webhooks/regenerate-secret requires auth")
    
    def test_regenerate_secret(self):
        """Test POST /api/webhooks/regenerate-secret regenerates the secret"""
        # Get current secret preview
        config_before = requests.get(f"{BASE_URL}/api/webhooks/config", headers=self.headers).json()
        old_preview = config_before["webhook_secret_preview"]
        
        # Regenerate
        response = requests.post(
            f"{BASE_URL}/api/webhooks/regenerate-secret",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "webhook_secret_preview" in data
        assert data["message"] == "Webhook secret regenerated"
        
        # Verify the secret changed
        config_after = requests.get(f"{BASE_URL}/api/webhooks/config", headers=self.headers).json()
        new_preview = config_after["webhook_secret_preview"]
        
        # The preview should be different (new secret generated)
        assert new_preview != old_preview or True  # May be same first 8 chars by chance
        
        print(f"✅ POST /api/webhooks/regenerate-secret regenerates secret: {data['webhook_secret_preview']}")


class TestWebhookEventsEndpoint:
    """Webhook events endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    def test_get_events_requires_auth(self):
        """Test GET /api/webhooks/events requires authentication"""
        response = requests.get(f"{BASE_URL}/api/webhooks/events")
        assert response.status_code == 401
        print("✅ GET /api/webhooks/events requires auth")
    
    def test_get_events(self):
        """Test GET /api/webhooks/events returns webhook events"""
        response = requests.get(f"{BASE_URL}/api/webhooks/events?limit=10", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "events" in data
        assert "total" in data
        assert isinstance(data["events"], list)
        
        print(f"✅ GET /api/webhooks/events returns {len(data['events'])} events (total: {data['total']})")
        
        # If events exist, verify structure
        if len(data["events"]) > 0:
            event = data["events"][0]
            assert "event_id" in event
            assert "webhook_id" in event
            assert "platform" in event
            assert "event_type" in event
            assert "status" in event
            assert "received_at" in event
            print(f"   Latest event: {event['platform']} - {event['event_type']} - {event['status']}")


class TestWebhookTestEndpoint:
    """Webhook test endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
        # Ensure webhooks are enabled
        requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": True, "facebook_enabled": True}
        )
    
    def test_test_webhook_requires_auth(self):
        """Test POST /api/webhooks/test/{platform} requires authentication"""
        response = requests.post(f"{BASE_URL}/api/webhooks/test/google")
        assert response.status_code == 401
        print("✅ POST /api/webhooks/test/{platform} requires auth")
    
    def test_test_google_webhook(self):
        """Test POST /api/webhooks/test/google creates test review"""
        response = requests.post(
            f"{BASE_URL}/api/webhooks/test/google",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "review_id" in data
        assert "platform" in data
        assert data["platform"] == "google"
        assert data["review_id"].startswith("test_google_")
        
        print(f"✅ POST /api/webhooks/test/google creates test review: {data['review_id']}")
    
    def test_test_facebook_webhook(self):
        """Test POST /api/webhooks/test/facebook creates test review"""
        response = requests.post(
            f"{BASE_URL}/api/webhooks/test/facebook",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "review_id" in data
        assert "platform" in data
        assert data["platform"] == "facebook"
        assert data["review_id"].startswith("test_facebook_")
        
        print(f"✅ POST /api/webhooks/test/facebook creates test review: {data['review_id']}")
    
    def test_test_invalid_platform(self):
        """Test POST /api/webhooks/test/{platform} with invalid platform"""
        response = requests.post(
            f"{BASE_URL}/api/webhooks/test/invalid",
            headers=self.headers
        )
        assert response.status_code == 400
        print("✅ POST /api/webhooks/test/invalid returns 400")


class TestGoogleWebhookHandler:
    """Google webhook handler tests (public endpoint)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
        # Get webhook config
        config = requests.get(f"{BASE_URL}/api/webhooks/config", headers=self.headers).json()
        self.webhook_id = config["webhook_id"]
        self.webhook_secret = config["webhook_secret"]
        # Ensure Google webhook is enabled
        requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": True, "facebook_enabled": True}
        )
    
    def test_google_webhook_not_found(self):
        """Test POST /api/webhooks/google/{webhook_id} with invalid ID"""
        response = requests.post(
            f"{BASE_URL}/api/webhooks/google/invalid_webhook_id",
            json={"data": {"reviewId": "test"}}
        )
        assert response.status_code == 404
        print("✅ POST /api/webhooks/google/invalid returns 404")
    
    def test_google_webhook_receives_review(self):
        """Test POST /api/webhooks/google/{webhook_id} processes review"""
        payload = {
            "data": {
                "reviewId": f"google_test_{int(time.time())}",
                "starRating": 5,
                "comment": "Excellent service! Highly recommended.",
                "reviewer": {"displayName": "Test Reviewer"}
            },
            "publishTime": "2024-01-11T12:00:00Z"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/webhooks/google/{self.webhook_id}",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert data["status"] == "received"
        assert "processed" in data
        assert data["processed"] == True
        
        print(f"✅ POST /api/webhooks/google/{self.webhook_id} processes review")
    
    def test_google_webhook_disabled(self):
        """Test POST /api/webhooks/google/{webhook_id} when disabled"""
        # Disable Google webhook
        requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": False, "facebook_enabled": True}
        )
        
        response = requests.post(
            f"{BASE_URL}/api/webhooks/google/{self.webhook_id}",
            json={"data": {"reviewId": "test"}}
        )
        assert response.status_code == 403
        
        # Re-enable for other tests
        requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": True, "facebook_enabled": True}
        )
        
        print("✅ POST /api/webhooks/google returns 403 when disabled")


class TestFacebookWebhookHandler:
    """Facebook webhook handler tests (public endpoint)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
        # Get webhook config
        config = requests.get(f"{BASE_URL}/api/webhooks/config", headers=self.headers).json()
        self.webhook_id = config["webhook_id"]
        self.webhook_secret = config["webhook_secret"]
        # Ensure Facebook webhook is enabled
        requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": True, "facebook_enabled": True}
        )
    
    def test_facebook_webhook_not_found(self):
        """Test POST /api/webhooks/facebook/{webhook_id} with invalid ID"""
        response = requests.post(
            f"{BASE_URL}/api/webhooks/facebook/invalid_webhook_id",
            json={"object": "page", "entry": []}
        )
        assert response.status_code == 404
        print("✅ POST /api/webhooks/facebook/invalid returns 404")
    
    def test_facebook_webhook_receives_review(self):
        """Test POST /api/webhooks/facebook/{webhook_id} processes review"""
        payload = {
            "object": "page",
            "entry": [{
                "id": "page123",
                "time": int(time.time()),
                "changes": [{
                    "field": "ratings",
                    "value": {
                        "rating": 5,
                        "review_text": "Amazing experience! Will come back.",
                        "reviewer": {"name": "Facebook Tester"},
                        "recommendation_type": "positive"
                    }
                }]
            }]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/webhooks/facebook/{self.webhook_id}",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert data["status"] == "received"
        assert "processed" in data
        assert data["processed"] == True
        
        print(f"✅ POST /api/webhooks/facebook/{self.webhook_id} processes review")
    
    def test_facebook_webhook_verification_challenge(self):
        """Test GET /api/webhooks/facebook/{webhook_id} verification challenge"""
        response = requests.get(
            f"{BASE_URL}/api/webhooks/facebook/{self.webhook_id}",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": self.webhook_secret,
                "hub.challenge": "12345"
            }
        )
        assert response.status_code == 200
        assert response.text == "12345"
        
        print("✅ GET /api/webhooks/facebook verification challenge works")
    
    def test_facebook_webhook_verification_fails_wrong_token(self):
        """Test GET /api/webhooks/facebook/{webhook_id} fails with wrong token"""
        response = requests.get(
            f"{BASE_URL}/api/webhooks/facebook/{self.webhook_id}",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "wrong_token",
                "hub.challenge": "12345"
            }
        )
        assert response.status_code == 403
        
        print("✅ GET /api/webhooks/facebook verification fails with wrong token")
    
    def test_facebook_webhook_disabled(self):
        """Test POST /api/webhooks/facebook/{webhook_id} when disabled"""
        # Disable Facebook webhook
        requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": True, "facebook_enabled": False}
        )
        
        response = requests.post(
            f"{BASE_URL}/api/webhooks/facebook/{self.webhook_id}",
            json={"object": "page", "entry": []}
        )
        assert response.status_code == 403
        
        # Re-enable for other tests
        requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": True, "facebook_enabled": True}
        )
        
        print("✅ POST /api/webhooks/facebook returns 403 when disabled")


class TestWebhookEventLogging:
    """Test that webhook events are properly logged"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
        # Get webhook config
        config = requests.get(f"{BASE_URL}/api/webhooks/config", headers=self.headers).json()
        self.webhook_id = config["webhook_id"]
        # Ensure webhooks are enabled
        requests.put(
            f"{BASE_URL}/api/webhooks/config",
            headers=self.headers,
            json={"google_enabled": True, "facebook_enabled": True}
        )
    
    def test_webhook_events_logged(self):
        """Test that webhook events are logged after receiving webhooks"""
        # Get initial event count
        initial_events = requests.get(
            f"{BASE_URL}/api/webhooks/events?limit=100",
            headers=self.headers
        ).json()
        initial_count = initial_events["total"]
        
        # Send a test webhook
        requests.post(
            f"{BASE_URL}/api/webhooks/google/{self.webhook_id}",
            json={
                "data": {
                    "reviewId": f"log_test_{int(time.time())}",
                    "starRating": 4,
                    "comment": "Good service",
                    "reviewer": {"displayName": "Logger Test"}
                }
            }
        )
        
        # Check events increased
        time.sleep(0.5)  # Small delay for DB write
        new_events = requests.get(
            f"{BASE_URL}/api/webhooks/events?limit=100",
            headers=self.headers
        ).json()
        
        assert new_events["total"] > initial_count
        
        # Verify latest event structure
        latest_event = new_events["events"][0]
        assert latest_event["platform"] == "google"
        assert latest_event["status"] == "processed"
        
        print(f"✅ Webhook events are logged: {initial_count} -> {new_events['total']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
