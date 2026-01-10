# ReviewFlow - Real API Integration Guide

This guide explains how to enable real Google and Facebook review fetching in ReviewFlow.

## Current Mode

By default, ReviewFlow operates in **Demo Mode** using mock data. This allows you to test all features without needing API credentials.

## Enabling Real Google Reviews

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable billing (required for Places API)

### Step 2: Enable Required APIs
1. In the Cloud Console, go to **APIs & Services > Library**
2. Search for and enable:
   - **Places API**
   - **Places API (New)**

### Step 3: Create API Key
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. (Recommended) Restrict the key to only Places API

### Step 4: Add to Environment
Add your API key to `/app/backend/.env`:
```
GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Step 5: Restart Backend
```bash
sudo supervisorctl restart backend
```

### Limitations
- The Places API provides up to 5 reviews per place
- For full review management, Google Business Profile API with OAuth is required
- Reviews may have a slight delay (Google caches data)

---

## Enabling Real Facebook Reviews

### Step 1: Create a Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **My Apps > Create App**
3. Choose **Business** app type
4. Complete the app setup

### Step 2: Get App Credentials
1. In your app dashboard, go to **Settings > Basic**
2. Copy your **App ID** and **App Secret**

### Step 3: Configure Permissions
1. Go to **App Review > Permissions and Features**
2. Request the following permissions:
   - `pages_read_engagement`
   - `pages_show_list`
   - `pages_read_user_content` (for reviews)

### Step 4: Business Verification (Production)
For production access to reviews:
1. Complete Facebook Business Verification
2. This can take 1-2 weeks

### Step 5: Add to Environment
Add your credentials to `/app/backend/.env`:
```
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
```

### Step 6: Restart Backend
```bash
sudo supervisorctl restart backend
```

### Limitations
- Facebook deprecated star ratings in 2018
- Now uses "Recommendations" (positive/negative)
- Full review access requires Page Access Token

---

## Checking Integration Status

You can check the current integration status via the API:

```bash
curl -X GET "https://your-domain/api/integration-status" \
  -H "Cookie: session_token=your_token"
```

Response shows which integrations are active:
```json
{
  "google": {
    "platform": "google",
    "real_api_enabled": false,
    "status": "demo_mode"
  },
  "facebook": {
    "platform": "facebook", 
    "real_api_enabled": false,
    "status": "demo_mode"
  },
  "overall_mode": "demo"
}
```

---

## Syncing Reviews

### Automatic Sync
Reviews are synced automatically when you connect a platform.

### Manual Sync
Use the "Sync Reviews" button on the dashboard, or call:
```bash
curl -X POST "https://your-domain/api/reviews/sync" \
  -H "Cookie: session_token=your_token"
```

---

## Troubleshooting

### Reviews not appearing
1. Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
2. Verify API keys are correct
3. Ensure platform is connected (check Integrations page)

### API Rate Limits
- Google Places API: 100 requests/second (default)
- Facebook Graph API: 200 calls/hour/user

### Need Help?
- Check the application logs for detailed error messages
- Verify your API credentials are valid and have proper permissions
