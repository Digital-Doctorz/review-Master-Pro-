#!/usr/bin/env python3
"""
ReviewFlow Backend API Testing Suite
Tests all API endpoints using the public URL from frontend/.env
"""

import requests
import sys
import json
from datetime import datetime
import uuid
import time

class ReviewFlowAPITester:
    def __init__(self, base_url="https://reviewhub-30.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.business_id = None
        self.qr_code_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            if expected_status and actual_status:
                print(f"   Expected: {expected_status}, Got: {actual_status}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def make_request(self, method, endpoint, data=None, expected_status=200, auth_required=False):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            else:
                return False, {}, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            return success, response_data, response.status_code

        except requests.exceptions.RequestException as e:
            return False, {}, f"Request failed: {str(e)}"

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n🔍 Testing Basic Endpoints...")
        
        # Test root endpoint
        success, data, status = self.make_request('GET', '', expected_status=200)
        self.log_test("GET /api/", success, 
                     f"Response: {data.get('message', 'No message')}" if success else "Failed to connect",
                     200, status)

        # Test health endpoint
        success, data, status = self.make_request('GET', 'health', expected_status=200)
        self.log_test("GET /api/health", success,
                     f"Status: {data.get('status', 'Unknown')}" if success else "Health check failed",
                     200, status)

        # Test public business endpoint with non-existent ID
        success, data, status = self.make_request('GET', 'public/business/nonexistent', expected_status=404)
        self.log_test("GET /api/public/business/nonexistent", success,
                     "Should return 404 for non-existent business" if success else "Unexpected response",
                     404, status)

    def create_test_user_session(self):
        """Create test user and session in MongoDB for testing"""
        print("\n🔍 Creating Test User Session...")
        
        # Generate test data
        timestamp = int(time.time())
        self.user_id = f"test_user_{timestamp}"
        self.session_token = f"test_session_{timestamp}"
        test_email = f"test.user.{timestamp}@example.com"
        
        # We'll simulate having a valid session by creating one directly
        # In a real scenario, this would come from the OAuth flow
        print(f"Generated test user_id: {self.user_id}")
        print(f"Generated session_token: {self.session_token}")
        
        # For now, we'll test without auth and note that auth endpoints need manual setup
        return True

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔍 Testing Auth Endpoints...")
        
        # Test /auth/me without token (should fail)
        success, data, status = self.make_request('GET', 'auth/me', expected_status=401, auth_required=True)
        self.log_test("GET /api/auth/me (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

        # Test session creation (would need valid session_id from Emergent)
        print("ℹ️  Note: Auth endpoints require Emergent OAuth session_id for full testing")

    def test_business_endpoints(self):
        """Test business-related endpoints"""
        print("\n🔍 Testing Business Endpoints...")
        
        # Test get business without auth
        success, data, status = self.make_request('GET', 'business', expected_status=401, auth_required=True)
        self.log_test("GET /api/business (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

        # Test create business without auth
        business_data = {
            "name": "Test Restaurant",
            "category": "Restaurant",
            "address": "123 Test St",
            "phone": "+1234567890",
            "website": "https://test.com"
        }
        success, data, status = self.make_request('POST', 'business', data=business_data, expected_status=401, auth_required=True)
        self.log_test("POST /api/business (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

    def test_platform_endpoints(self):
        """Test platform integration endpoints"""
        print("\n🔍 Testing Platform Endpoints...")
        
        # Test get platforms without auth
        success, data, status = self.make_request('GET', 'platforms', expected_status=401, auth_required=True)
        self.log_test("GET /api/platforms (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

        # Test Google search endpoint without auth
        success, data, status = self.make_request('GET', 'google/search?query=test', expected_status=401, auth_required=True)
        self.log_test("GET /api/google/search (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

        # Test Google connect without auth
        google_connect_data = {
            "place_id": "ChIJ_mock_001",
            "name": "Test Business",
            "review_link": "https://search.google.com/local/writereview?placeid=ChIJ_mock_001"
        }
        success, data, status = self.make_request('POST', 'google/connect', data=google_connect_data, expected_status=401, auth_required=True)
        self.log_test("POST /api/google/connect (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

        # Test Facebook connect without auth
        facebook_connect_data = {
            "page_url": "https://facebook.com/testbusiness",
            "page_name": "Test Business"
        }
        success, data, status = self.make_request('POST', 'facebook/connect', data=facebook_connect_data, expected_status=401, auth_required=True)
        self.log_test("POST /api/facebook/connect (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

        # Test platform disconnect without auth
        success, data, status = self.make_request('POST', 'platforms/google/disconnect', expected_status=401, auth_required=True)
        self.log_test("POST /api/platforms/google/disconnect (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

    def test_review_endpoints(self):
        """Test review-related endpoints"""
        print("\n🔍 Testing Review Endpoints...")
        
        # Test get reviews without auth
        success, data, status = self.make_request('GET', 'reviews', expected_status=401, auth_required=True)
        self.log_test("GET /api/reviews (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

        # Test public review submission (should work without auth)
        review_data = {
            "business_id": "test_business_id",
            "platform": "direct",
            "author_name": "Test Customer",
            "rating": 5,
            "text": "Great service!"
        }
        success, data, status = self.make_request('POST', 'public/review', data=review_data, expected_status=404)
        self.log_test("POST /api/public/review", success,
                     "Should return 404 for non-existent business" if success else f"Unexpected response: {data}",
                     404, status)

    def test_ai_endpoints(self):
        """Test AI response generation endpoints"""
        print("\n🔍 Testing AI Endpoints...")
        
        # Test AI response generation without auth
        ai_data = {
            "review_text": "Great service!",
            "rating": 5,
            "business_name": "Test Restaurant",
            "tone": "professional"
        }
        success, data, status = self.make_request('POST', 'ai/generate-response', data=ai_data, expected_status=401, auth_required=True)
        self.log_test("POST /api/ai/generate-response (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

        # Test AI write assist without auth
        write_assist_data = {
            "rating": 5,
            "business_name": "Test Restaurant",
            "keywords": "great food, excellent service"
        }
        success, data, status = self.make_request('POST', 'ai/write-assist', data=write_assist_data, expected_status=401, auth_required=True)
        self.log_test("POST /api/ai/write-assist (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        print("\n🔍 Testing Analytics Endpoints...")
        
        # Test analytics overview without auth
        success, data, status = self.make_request('GET', 'analytics/overview', expected_status=401, auth_required=True)
        self.log_test("GET /api/analytics/overview (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

        # Test analytics trends without auth
        success, data, status = self.make_request('GET', 'analytics/trends', expected_status=401, auth_required=True)
        self.log_test("GET /api/analytics/trends (no auth)", success,
                     "Should return 401 without authentication" if success else "Unexpected response",
                     401, status)

    def run_all_tests(self):
        """Run all test suites"""
        print(f"🚀 Starting ReviewFlow API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Run test suites
        self.test_basic_endpoints()
        self.create_test_user_session()
        self.test_auth_endpoints()
        self.test_business_endpoints()
        self.test_platform_endpoints()
        self.test_review_endpoints()
        self.test_ai_endpoints()
        self.test_analytics_endpoints()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = ReviewFlowAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())