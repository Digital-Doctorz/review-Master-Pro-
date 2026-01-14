# Review Master - Product Requirements Document

## Original Problem Statement
Build Review Master - a zero-friction review management platform focused on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses. Designed for non-technical business owners who can connect accounts in 60 seconds.

## What's Been Implemented (January 2025)

### MVP Features v3.6 - Multi-Location Support & Bug Fixes:

**Multi-Location Management (January 14, 2025):**
- [x] **User Subscription Plans** - Starter (1 location), Growth (3 locations), Enterprise (unlimited)
- [x] **GET /api/user/plan** - Returns plan details with max_locations, current_locations, can_add_location
- [x] **Location CRUD APIs** - GET, POST, PUT, DELETE for /api/locations
- [x] **Location-Platform Connect** - /api/locations/{id}/connect/{google|facebook}
- [x] **Plan Limit Enforcement** - 403 error when location limit reached
- [x] **Facebook Plan Restriction** - Facebook integration requires Growth+ plan
- [x] **Frontend Integrations UI** - Updated to show plan status, location cards, connection status

**[object Object] Bug Fix (January 14, 2025):**
- [x] **extractErrorMessage Helper** - Global helper in App.js to safely extract error messages
- [x] **Dashboard Error Handling** - Added sentiment_breakdown defaults, proper error handling
- [x] **Analytics Error Handling** - Added rating_distribution, platform_breakdown defaults
- [x] **Reviews Error Handling** - Updated error logging to use displayMessage

**Backend Fixes (January 14, 2025):**
- [x] **Fixed Syntax Error** - Corrected invalid `del` statement in server.py
- [x] **Added Body Import** - Fixed NameError for Body in plan upgrade endpoint

### Previous Features (v3.0-3.5)

**Simplified Integration Flow:**
- [x] No API keys required - Users just paste their Google/Facebook review link
- [x] Clipboard fallback for secure contexts
- [x] Step-by-step connection instructions

**Review Master Rebrand:**
- [x] Animated logo with shine effect
- [x] Purple/indigo gradient theme
- [x] "60 Second Setup" messaging

**Core Features:**
- [x] Email notification service (Resend API)
- [x] Webhook support for real-time review syncing
- [x] Enhanced QR review flow with confetti
- [x] Hybrid API integration (mock/real)
- [x] AI-powered responses via Gemini 3 Flash
- [x] Private feedback inbox for low ratings
- [x] Analytics dashboard with charts

### Tech Stack:
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **AI**: Gemini 3 Flash via emergentintegrations library
- **Email**: Resend API (optional)
- **Auth**: Emergent-managed Google OAuth

## Key Features

### For Business Owners:
1. **Multi-Location Support** - Manage 1-999 locations based on plan
2. **Plan-Based Limits** - Starter (1 loc), Growth (3 locs), Enterprise (unlimited)
3. **60-Second Setup** - Connect Google/Facebook with just a review link
4. **Smart Review Routing** - Low ratings go to private inbox
5. **AI Smart Replies** - Generate professional responses
6. **QR Code Magic** - Print QR codes for customer reviews
7. **Real-time Notifications** - Email alerts for urgent reviews
8. **Analytics Dashboard** - Track sentiment and response rates

### For Customers:
1. **AI Write Assist** - Help writing reviews with AI
2. **Platform Choice** - Select where to post (Google, Facebook, Direct)
3. **Copy & Redirect** - Automatic redirect to review pages
4. **Confetti Celebration** - Fun animation for 5-star ratings

## API Endpoints (v3.6.0)

### Core
- `GET /api/` - Returns version info
- `GET /api/health` - Health check
- `GET /health` - Root health check for deployment

### Authentication
- `POST /api/auth/session` - Exchange Emergent session for local session
- `GET /api/auth/me` - Get current user

### User Plans (NEW)
- `GET /api/user/plan` - Get user's subscription plan with location limits
- `POST /api/user/plan/upgrade` - Upgrade to a new plan

### Locations (NEW)
- `GET /api/locations` - List all locations with plan limits
- `POST /api/locations` - Create new location (enforces plan limit)
- `PUT /api/locations/{id}` - Update location
- `DELETE /api/locations/{id}` - Soft delete location
- `POST /api/locations/{id}/connect/{platform}` - Connect Google/Facebook
- `POST /api/locations/{id}/disconnect/{platform}` - Disconnect platform

### Business & Integrations
- `GET /api/business` - Get user's business
- `POST /api/business` - Create business
- `GET /api/platforms` - Get platform connections
- `GET /api/integration-status` - Get integration status

### Reviews
- `GET /api/reviews` - Get reviews with filters
- `POST /api/reviews/sync` - Manual sync from platforms
- `POST /api/public/review` - Submit review from QR page
- `POST /api/public/ai/write-assist` - AI review generation

### Analytics
- `GET /api/analytics/overview` - Overview with sentiment_breakdown
- `GET /api/analytics/trends` - Trend data over time

### Notifications
- `GET /api/notifications/settings` - Get notification preferences
- `PUT /api/notifications/settings` - Update notifications
- `POST /api/notifications/test` - Send test email

## Code Architecture
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI app (v3.6.0)
│   ├── services/
│   │   ├── google_reviews.py   
│   │   ├── facebook_reviews.py 
│   │   ├── webhook_service.py  
│   │   └── email_service.py
│   └── .env               
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AnimatedLogo.jsx
│       │   ├── ErrorBoundary.jsx
│       │   ├── Layout.jsx
│       │   └── ReviewCard.jsx
│       ├── pages/
│       │   ├── ApiSettings.jsx
│       │   ├── Dashboard.jsx      # Updated error handling
│       │   ├── Integrations.jsx   # Multi-location UI
│       │   ├── Analytics.jsx      # Updated error handling
│       │   ├── Landing.jsx
│       │   ├── PublicReview.jsx
│       │   └── Reviews.jsx        # Updated error handling
│       └── App.js                 # extractErrorMessage helper
└── tests/
    └── test_iteration15_location_management.py
```

## Plan Configurations
```javascript
{
  "starter": {
    "max_locations": 1,
    "features": ["google_integration", "qr_codes", "ai_responses", "email_notifications", "basic_analytics"],
    "price_monthly": 499
  },
  "growth": {
    "max_locations": 3,
    "features": ["google_integration", "facebook_integration", "qr_codes", "ai_responses", ...],
    "price_monthly": 999
  },
  "enterprise": {
    "max_locations": 999,
    "features": ["all features", "white_label", "dedicated_support"],
    "price_monthly": 2499
  }
}
```

## Testing
- **Test Reports**: `/app/test_reports/iteration_15.json`
- **Test Files**: `/app/tests/test_iteration15_location_management.py`
- **Success Rate**: Backend 92%, Frontend 100%
- **All Frontend Pages Load Without [object Object] Error**

## Prioritized Backlog

### P0 - Critical (Completed ✅)
- [x] Multi-location support with plan limits
- [x] [object Object] bug fix
- [x] Backend syntax fixes

### P1 - High Priority
- [ ] **Payment Integration (Stripe)** - Process subscriptions for plans
- [ ] WhatsApp notifications for urgent reviews
- [ ] Team collaboration features
- [ ] Weekly email summaries (cron job)

### P2 - Nice to Have
- [ ] Mobile app (iOS/Android)
- [ ] Additional platforms (Yelp, TripAdvisor)
- [ ] White-label QR code branding
- [ ] Export analytics reports

## Environment Variables
```
# Required
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
EMERGENT_LLM_KEY=your_key
WEBHOOK_BASE_URL=https://your-domain.com

# Optional - Email
RESEND_API_KEY=re_your_key

# Optional - Real API (or use paste-link method)
GOOGLE_PLACES_API_KEY=your_google_key
FACEBOOK_APP_ID=your_fb_app_id
```
