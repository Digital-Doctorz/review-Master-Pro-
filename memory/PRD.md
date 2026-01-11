# Review Master - Product Requirements Document

## Original Problem Statement
Build Review Master - a zero-friction review management platform focused on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses. Designed for non-technical business owners who can connect accounts in 60 seconds.

## What's Been Implemented (January 2025)

### MVP Features v3.0 - Rebrand & Enhancement:

**NEW - Review Master Rebrand (January 11, 2025):**
- [x] **Animated Logo** - `/app/frontend/src/components/AnimatedLogo.jsx` with shine effect and sparkles
- [x] **Full Rebrand** - All "ReviewFlow" instances replaced with "Review Master"
- [x] **Updated Color Scheme** - Purple/indigo gradient theme
- [x] **New Tagline** - "60 Second Setup" messaging
- [x] **API Version 3.0.0** - Updated backend version

**NEW - Notification Settings Page:**
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
2. **Smart Review Routing** - Low ratings (1-3 stars) go to private inbox, not public
3. **AI Smart Replies** - Generate professional responses in seconds
4. **QR Code Magic** - Print QR codes for easy customer reviews
5. **Real-time Notifications** - Get alerted for urgent reviews via webhook/email
6. **Analytics Dashboard** - Track sentiment trends and response rates

### For Customers:
1. **AI Write Assist** - Help writing reviews with AI
2. **Platform Choice** - Select where to post (Google, Facebook, or Direct)
3. **Confetti Celebration** - Fun animation for 5-star ratings
4. **Copy & Go** - Easy instructions for posting on external platforms

## API Endpoints (v3.0.0)

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
│       │   ├── AnimatedLogo.jsx  # NEW animated logo
│       │   └── Layout.jsx
│       ├── pages/
│       │   ├── Landing.jsx       # Rebranded
│       │   ├── Dashboard.jsx
│       │   ├── NotificationSettings.jsx  # NEW
│       │   ├── WebhookSettings.jsx
│       │   └── PublicReview.jsx  # Enhanced
│       └── App.js
└── tests/
    ├── test_rebrand_and_notifications.py  # NEW
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

# Optional - Real API Integration
GOOGLE_PLACES_API_KEY=your_google_key
FACEBOOK_APP_ID=your_fb_app_id
FACEBOOK_APP_SECRET=your_fb_secret
```

## Testing
- **Test Reports**: `/app/test_reports/iteration_7.json`
- **Test Files**: 
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
