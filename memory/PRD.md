# Review Master - Product Requirements Document

## Original Problem Statement
Build Review Master - a zero-friction review management platform focused on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses. Designed for non-technical business owners who can connect accounts in 60 seconds.

## What's Been Implemented (January 2025)

### MVP Features v3.5 - Updated Instructions & Flow:

**NEW - Improved Connection Instructions (January 12, 2025):**
- [x] **Google Instructions Updated** - Step-by-step: Sign in to Google Business Profile → Select business → Click "Ask for reviews" → Copy link
- [x] **Facebook Instructions Updated** - Step-by-step: Open Facebook Page → Click Reviews tab → Click "Write a review" → Copy URL
- [x] **Clickable Links** - Direct links to business.google.com and facebook.com/pages
- [x] **Webhook Clipboard Fix** - Fixed clipboard error on Webhook Settings page with fallback

**NEW - Improved Public Review Flow (January 12, 2025):**
- [x] **Clear 2-Step Process** - Step 1: Copy your review, Step 2: Open Google/Facebook & paste
- [x] **Step Locking** - "Open Platform" button disabled until review is copied
- [x] **Better UX** - Clear visual feedback when review is copied

### MVP Features v3.4 - Simplified User Experience:

**Super Simple Integration (January 12, 2025):**
- [x] **No API Keys Required** - Users just paste their Google/Facebook review link - that's it!
- [x] **Redesigned Integrations Page** - Clean, simple modal with step-by-step instructions
- [x] **Clipboard Fallback** - Fixed "Clipboard API blocked" error with document.execCommand fallback
- [x] **API Settings Page Simplified** - Shows "You don't need this page!" with link to simple Integrations

### MVP Features v3.3 - Error Handling & Stability:

**[object Object] Bug Fix (January 12, 2025):**
- [x] **Axios Error Interceptor** - Added global axios response interceptor in App.js to properly extract error messages as strings
- [x] **ErrorBoundary Improvements** - Enhanced error message extraction to prevent rendering raw objects
- [x] **Analytics Null Checks** - Added safety checks for Object.entries calls on potentially undefined data
- [x] **All 18 API Tests Passing** - Comprehensive testing verified no [object Object] errors appear

### MVP Features v3.2 - Self-Service API Credentials & Enhanced UX:

**API Credentials Self-Service (January 12, 2025):**
- [x] **API Settings Page** - `/app/frontend/src/pages/ApiSettings.jsx` - Users can enter their own Google Places API key and Facebook App credentials
- [x] **Step-by-Step Instructions** - Accordion-style guides with direct links to Google Cloud Console and Facebook Developers
- [x] **Test Connection** - Verify API credentials work before saving
- [x] **Demo/Production Mode Banner** - Shows current integration status

**Enhanced Integrations Page (January 12, 2025):**
- [x] **Magic Search Modals** - Search modals for Google Business and Facebook Page discovery
- [x] **User-Friendly Business Names** - Shows connected business names instead of cryptic IDs
- [x] **Manual URL Setup** - Option to manually enter Google review link or Facebook page URL
- [x] **Improved Status Indicators** - Clear connected/disconnected states with sync timestamps

**Enhanced Public Review Flow (January 12, 2025):**
- [x] **Channel Selection** - Customers choose where to post (Google, Facebook, or Direct)
- [x] **Copy & Redirect** - Clear instructions to copy review text and redirect to actual platform review page
- [x] **Platform Review Links** - Auto-redirect to Google Maps review page or Facebook reviews when selected

**Backend Endpoints Added:**
- `GET /api/settings/api-credentials` - Get user's saved API credentials
- `PUT /api/settings/api-credentials` - Save Google/Facebook API credentials
- `POST /api/settings/test-connection/{platform}` - Test API credentials

### MVP Features v3.1 - Bug Fixes & Code Quality:

**Bug Fixes (January 12, 2025):**
- [x] **[object Object] Bug Fixed** - Dashboard error handling improved, all API responses return proper data structures
- [x] **ReviewCard Component Extracted** - `/app/frontend/src/components/ReviewCard.jsx` - Fixes unstable-nested-components ESLint error
- [x] **Code Refactoring** - Reviews.jsx cleaned up with standalone ReviewCard component

### MVP Features v3.0 - Rebrand & Enhancement:

**Review Master Rebrand (January 11, 2025):**
- [x] **Animated Logo** - `/app/frontend/src/components/AnimatedLogo.jsx` with shine effect and sparkles
- [x] **Full Rebrand** - All "ReviewFlow" instances replaced with "Review Master"
- [x] **Updated Color Scheme** - Purple/indigo gradient theme
- [x] **New Tagline** - "60 Second Setup" messaging
- [x] **API Version 3.0.0** - Updated backend version

**Notification Settings Page:**
- [x] **Notification Preferences** - Email toggles for new reviews, private feedback, weekly summary
- [x] **Email Configuration** - Set notification email address
- [x] **Test Email** - Send test notification to verify setup
- [x] **Email Service Status** - Shows if email is configured/enabled

**Previous Features:**
- [x] Email notification service with Resend API
- [x] Webhook support for real-time review syncing
- [x] Enhanced QR review flow with confetti, progress steps, AI enhancement
- [x] Hybrid API integration (mock/real)
- [x] Magic search for Google/Facebook business profiles
- [x] AI-powered response generation
- [x] Private feedback inbox for low ratings

### Tech Stack:
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **AI**: Gemini 3 Flash via emergentintegrations library
- **Email**: Resend API (optional)
- **Auth**: Emergent-managed Google OAuth

## Key Features

### For Business Owners:
1. **60-Second Setup** - Connect Google/Facebook with just your business name
2. **Self-Service API Credentials** - Enter your own Google Places API key and Facebook credentials
3. **Smart Review Routing** - Low ratings (1-3 stars) go to private inbox, not public
4. **AI Smart Replies** - Generate professional responses in seconds
5. **QR Code Magic** - Print QR codes for easy customer reviews
6. **Real-time Notifications** - Get alerted for urgent reviews via webhook/email
7. **Analytics Dashboard** - Track sentiment trends and response rates

### For Customers:
1. **AI Write Assist** - Help writing reviews with AI
2. **Platform Choice** - Select where to post (Google, Facebook, or Direct)
3. **Copy & Redirect** - Automatic redirect to Google Maps or Facebook review page
4. **Confetti Celebration** - Fun animation for 5-star ratings

## API Endpoints (v3.2.0)

### Core
- `GET /api/` - Returns "Review Master API" with version 3.0.0
- `GET /api/health` - Health check

### Authentication
- `POST /api/auth/session` - Exchange Emergent session for local session
- `GET /api/auth/me` - Get current user

### Business & Integrations
- `GET /api/google/search?query=` - Magic search Google Business
- `POST /api/google/connect` - Connect Google Business
- `GET /api/facebook/search?query=` - Magic search Facebook Pages
- `POST /api/facebook/connect` - Connect Facebook Page
- `GET /api/integration-status` - Get integration status (includes email)

### API Credentials (NEW)
- `GET /api/settings/api-credentials` - Get user's saved credentials
- `PUT /api/settings/api-credentials` - Save Google/Facebook credentials
- `POST /api/settings/test-connection/{platform}` - Test API credentials

### Reviews
- `GET /api/reviews` - Get reviews with filters
- `POST /api/reviews/sync` - Manual sync from platforms
- `POST /api/public/review` - Submit review from QR page
- `POST /api/public/ai/write-assist` - AI review generation (public)

### Notifications
- `GET /api/notifications/settings` - Get notification preferences
- `PUT /api/notifications/settings` - Update notification preferences
- `POST /api/notifications/test` - Send test email
- `GET /api/email/status` - Get email service status

### Webhooks
- `GET /api/webhooks/config` - Get webhook configuration
- `PUT /api/webhooks/config` - Update webhook settings
- `POST /api/webhooks/google/{id}` - Google webhook handler
- `POST /api/webhooks/facebook/{id}` - Facebook webhook handler

## Code Architecture
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI app (v3.0.0)
│   ├── services/
│   │   ├── google_reviews.py   
│   │   ├── facebook_reviews.py 
│   │   ├── webhook_service.py  
│   │   └── email_service.py
│   └── .env               
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AnimatedLogo.jsx  # Animated logo
│       │   ├── ReviewCard.jsx    # NEW standalone component
│       │   └── Layout.jsx
│       ├── pages/
│       │   ├── Landing.jsx       # Rebranded
│       │   ├── Dashboard.jsx
│       │   ├── Integrations.jsx  # ENHANCED with Magic Search
│       │   ├── ApiSettings.jsx   # NEW API credentials page
│       │   ├── NotificationSettings.jsx
│       │   ├── WebhookSettings.jsx
│       │   └── PublicReview.jsx  # ENHANCED with channel selection
│       └── App.js
└── tests/
    ├── test_iteration9_features.py  # NEW (24 tests)
    ├── test_bug_fixes_iteration8.py
    ├── test_rebrand_and_notifications.py
    └── test_notifications_and_public_review.py
```

## Environment Variables
```
# Required
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
EMERGENT_LLM_KEY=your_key
WEBHOOK_BASE_URL=https://your-domain.com

# Optional - Email Notifications
RESEND_API_KEY=re_your_key
SENDER_EMAIL=notifications@yourdomain.com

# Optional - Real API Integration (users can also set via UI)
GOOGLE_PLACES_API_KEY=your_google_key
FACEBOOK_APP_ID=your_fb_app_id
FACEBOOK_APP_SECRET=your_fb_secret
```

## Testing
- **Test Reports**: `/app/test_reports/iteration_11.json`
- **Test Files**: 
  - `/app/tests/test_iteration11_simplified_integrations.py` (15 tests) - Simplified integration flow
  - `/app/tests/test_iteration10_object_error.py` (18 tests)
  - `/app/tests/test_iteration9_features.py` (24 tests)
  - `/app/tests/test_bug_fixes_iteration8.py` (14 tests)
  - `/app/tests/test_rebrand_and_notifications.py` (11 tests)
  - `/app/tests/test_notifications_and_public_review.py` (21 tests)
- **Success Rate**: Backend 100%, Frontend 100%

## Prioritized Backlog

### P0 - Critical (Completed ✅)
- [x] Review Master rebrand with animated logo
- [x] Notification settings page
- [x] Email notification service
- [x] Webhook support
- [x] Enhanced QR review flow
- [x] **[object Object] bug fix** (Jan 12, 2025)
- [x] **ReviewCard component extraction** (Jan 12, 2025)
- [x] **Self-service API credentials** (Jan 12, 2025)
- [x] **Enhanced Integrations page with Magic Search** (Jan 12, 2025)
- [x] **Public review channel selection and redirect** (Jan 12, 2025)
- [x] **SUPER SIMPLE Integration** (Jan 12, 2025) - No API keys needed, just paste review link
- [x] **Clipboard fallback** (Jan 12, 2025) - Fixed blocked Clipboard API error

### P1 - High Priority
- [ ] WhatsApp notifications for urgent reviews
- [ ] Team collaboration (invite members, role-based access)
- [ ] Review response scheduling
- [ ] Weekly email summaries (cron job)

### P2 - Nice to Have
- [ ] Mobile app (iOS/Android)
- [ ] Additional platforms (Yelp, TripAdvisor)
- [ ] White-label QR code branding
- [ ] Custom response templates
- [ ] Export analytics reports
