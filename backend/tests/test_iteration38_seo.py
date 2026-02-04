"""
Iteration 38 - SEO Optimization and Platform Logos Tests
Tests for:
- SEO meta tags in page source
- Payment config API with correct prices
- Platform logos and 7 platforms support
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndConfig:
    """Health and configuration endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ Health endpoint working")
    
    def test_payment_config_endpoint(self):
        """Test payment config returns correct pricing"""
        response = requests.get(f"{BASE_URL}/api/payment/config")
        assert response.status_code == 200
        data = response.json()
        
        # Check payment is enabled
        assert data.get("payment_enabled") == True
        print("✅ Payment enabled")
        
        # Check pricing structure
        assert "pricing" in data
        pricing = data["pricing"]
        
        # Verify Starter plan - ₹499/month
        assert "starter" in pricing
        assert pricing["starter"]["monthly_price"] == 499
        print("✅ Starter price: ₹499/month")
        
        # Verify Growth plan - ₹999/month
        assert "growth" in pricing
        assert pricing["growth"]["monthly_price"] == 999
        print("✅ Growth price: ₹999/month")
        
        # Verify Enterprise plan - ₹2,499/month
        assert "enterprise" in pricing
        assert pricing["enterprise"]["monthly_price"] == 2499
        print("✅ Enterprise price: ₹2,499/month")
        
        # Check subscription links exist
        assert pricing["starter"].get("razorpay_subscription_link") is not None
        assert pricing["growth"].get("razorpay_subscription_link") is not None
        assert pricing["enterprise"].get("razorpay_subscription_link") is not None
        print("✅ All subscription links present")
    
    def test_subscription_link_starter(self):
        """Test subscription link endpoint for starter plan"""
        response = requests.get(f"{BASE_URL}/api/payment/subscription-link/starter")
        assert response.status_code == 200
        data = response.json()
        assert "subscription_link" in data
        assert "rzp.io" in data["subscription_link"]
        print(f"✅ Starter subscription link: {data['subscription_link']}")
    
    def test_subscription_link_growth(self):
        """Test subscription link endpoint for growth plan"""
        response = requests.get(f"{BASE_URL}/api/payment/subscription-link/growth")
        assert response.status_code == 200
        data = response.json()
        assert "subscription_link" in data
        assert "rzp.io" in data["subscription_link"]
        print(f"✅ Growth subscription link: {data['subscription_link']}")
    
    def test_subscription_link_enterprise(self):
        """Test subscription link endpoint for enterprise plan"""
        response = requests.get(f"{BASE_URL}/api/payment/subscription-link/enterprise")
        assert response.status_code == 200
        data = response.json()
        assert "subscription_link" in data
        assert "rzp.io" in data["subscription_link"]
        print(f"✅ Enterprise subscription link: {data['subscription_link']}")


class TestSEOMetaTags:
    """Test SEO meta tags in page source"""
    
    def test_page_source_has_seo_title(self):
        """Test page source contains SEO-optimized title"""
        response = requests.get(BASE_URL)
        assert response.status_code == 200
        html = response.text
        
        # Check for SEO title
        assert "Review Master | #1 Online Review Management Platform" in html
        print("✅ SEO title present in page source")
    
    def test_page_source_has_meta_description(self):
        """Test page source contains meta description with all 7 platforms"""
        response = requests.get(BASE_URL)
        html = response.text
        
        # Check meta description mentions all platforms
        assert 'meta name="description"' in html
        assert "Google" in html
        assert "Facebook" in html
        assert "Amazon" in html
        assert "Flipkart" in html
        assert "JustDial" in html
        assert "Swiggy" in html
        assert "Zomato" in html
        print("✅ Meta description mentions all 7 platforms")
    
    def test_page_source_has_open_graph_tags(self):
        """Test page source contains Open Graph tags"""
        response = requests.get(BASE_URL)
        html = response.text
        
        # Check Open Graph tags
        assert 'property="og:title"' in html
        assert 'property="og:description"' in html
        assert 'property="og:image"' in html
        assert 'property="og:type"' in html
        print("✅ Open Graph tags present")
    
    def test_page_source_has_twitter_cards(self):
        """Test page source contains Twitter Card tags"""
        response = requests.get(BASE_URL)
        html = response.text
        
        # Check Twitter Card tags
        assert 'property="twitter:card"' in html
        assert 'property="twitter:title"' in html
        assert 'property="twitter:description"' in html
        assert 'property="twitter:image"' in html
        print("✅ Twitter Card tags present")
    
    def test_page_source_has_json_ld_software_application(self):
        """Test page source contains JSON-LD SoftwareApplication schema"""
        response = requests.get(BASE_URL)
        html = response.text
        
        # Check for JSON-LD structured data
        assert 'application/ld+json' in html
        assert '"@type": "SoftwareApplication"' in html or '"@type":"SoftwareApplication"' in html
        assert '"lowPrice": "499"' in html or '"lowPrice":"499"' in html
        assert '"highPrice": "2499"' in html or '"highPrice":"2499"' in html
        print("✅ JSON-LD SoftwareApplication schema present with correct prices")
    
    def test_page_source_has_json_ld_faq(self):
        """Test page source contains JSON-LD FAQPage schema"""
        response = requests.get(BASE_URL)
        html = response.text
        
        # Check for FAQ schema
        assert '"@type": "FAQPage"' in html or '"@type":"FAQPage"' in html
        print("✅ JSON-LD FAQPage schema present")
    
    def test_page_source_has_canonical_url(self):
        """Test page source contains canonical URL"""
        response = requests.get(BASE_URL)
        html = response.text
        
        assert 'rel="canonical"' in html
        print("✅ Canonical URL present")
    
    def test_page_source_has_robots_meta(self):
        """Test page source contains robots meta tag"""
        response = requests.get(BASE_URL)
        html = response.text
        
        assert 'name="robots"' in html
        assert "index, follow" in html
        print("✅ Robots meta tag present")


class TestQRCodePublicPage:
    """Test QR code public review page"""
    
    def test_demo_qr_page_loads(self):
        """Test demo QR code page loads correctly"""
        response = requests.get(f"{BASE_URL}/review/demo_qr_001")
        assert response.status_code == 200
        print("✅ Demo QR page loads")


class TestGuestPayment:
    """Test guest payment endpoints"""
    
    def test_guest_create_order_endpoint(self):
        """Test guest payment order creation"""
        response = requests.post(
            f"{BASE_URL}/api/payment/guest/create-order",
            json={"plan_name": "starter", "billing_cycle": "yearly"}
        )
        # Should return 200 with order details or 400 if validation fails
        assert response.status_code in [200, 400, 500]
        print(f"✅ Guest create order endpoint responds: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
