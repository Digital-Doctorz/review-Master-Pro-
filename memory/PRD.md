# ReviewFlow - Product Requirements Document

## Original Problem Statement
Build ReviewFlow - a zero-knowledge review management platform focused exclusively on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses.

## What's Been Implemented (January 2025)

### MVP Features v3.0 - Comprehensive Enhancement:

**NEW - Email Notifications (January 11, 2025):**
- [x] **Email Service** - `/app/backend/services/email_service.py` with Resend API integration
- [x] **Notification Templates** - Beautiful HTML emails for new reviews, private feedback, welcome
- [x] **Notification Settings** - Per-business settings for email preferences
- [x] **Test Email** - `/api/notifications/test` to verify email setup
- [x] **Webhook Email Integration** - Auto-send emails when reviews arrive via webhooks

**NEW - Enhanced UI/UX with Wow Effect:**
- [x] **Confetti Animation** - Celebration effect for 5-star ratings
- [x] **Progress Steps Indicator** - Visual flow through review submission
- [x] **Smart Review Routing** - <4 stars → private feedback, ≥4 stars → public with channel selection
- [x] **Platform Selection Cards** - Beautiful Google/Facebook/Direct option cards
- [x] **Copy & Go Flow** - Instructions to copy review and post on chosen platform
- [x] **Mobile-First Design** - Optimized for budget Android phones
- [x] **Smooth Animations** - Framer Motion transitions throughout

**NEW - Public AI Review Enhancement:**
- [x] **Public AI Endpoint** - `/api/public/ai/write-assist` for unauthenticated users
- [x] **AI Write Button** - Generate full review from scratch
- [x] **AI Enhance Button** - Improve existing review text
- [x] **Fallback Templates** - Works even if AI service is unavailable

**Previous Features (v2.3):**
- [x] Webhook support for real-time review syncing
- [x] Hybrid API integration (mock/real)
- [x] Magic search for Google/Facebook business profiles
- [x] QR code generator with multiple sizes
- [x] AI-powered response generation
- [x] Private feedback inbox
- [x] Analytics dashboard

### Tech Stack:
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **AI**: Gemini 3 Flash via emergentintegrations library
- **Email**: Resend API (optional)
- **Auth**: Emergent-managed Google OAuth

## API Endpoints (v3.0)

### Authentication
- `POST /api/auth/session` - Exchange Emergent session for local session
- `GET /api/auth/me` - Get current user

### Business
- `POST /api/business` - Create business
- `GET /api/business` - Get user's business

### Platform Integrations
- `GET /api/google/search?query=` - Magic search Google Business
- `POST /api/google/connect` - Connect Google Business
- `GET /api/facebook/search?query=` - Magic search Facebook Pages
- `POST /api/facebook/connect` - Connect Facebook Page
- `GET /api/integration-status` - Get integration status (Google, Facebook, Email)

### Reviews
- `GET /api/reviews` - Get reviews with filters
- `GET /api/reviews/private` - Get private feedback
- `POST /api/reviews/sync` - Manual sync from platforms

### Email Notifications (NEW)
- `GET /api/notifications/settings` - Get notification preferences
- `PUT /api/notifications/settings` - Update notification preferences
- `POST /api/notifications/test` - Send test email
- `GET /api/email/status` - Get email service status

### Webhooks
- `GET /api/webhooks/config` - Get webhook configuration
- `PUT /api/webhooks/config` - Update webhook settings
- `POST /api/webhooks/google/{id}` - Google webhook handler
- `POST /api/webhooks/facebook/{id}` - Facebook webhook handler

### Public (No Auth Required)
- `GET /api/public/business/{qr_code_id}` - Get business info for QR page
- `POST /api/public/review` - Submit review from QR page
- **NEW:** `POST /api/public/ai/write-assist` - AI review generation for customers

### AI
- `POST /api/ai/generate-response` - Generate response (authenticated)
- `POST /api/ai/write-assist` - AI review writing (authenticated)

## Code Architecture
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI app
│   ├── services/
│   │   ├── google_reviews.py   
│   │   ├── facebook_reviews.py 
│   │   ├── webhook_service.py  
│   │   └── email_service.py    # NEW
│   └── .env               
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── PublicReview.jsx  # Enhanced with confetti, progress steps
│       │   ├── Dashboard.jsx
│       │   ├── WebhookSettings.jsx
│       │   └── ...
│       └── components/ui/
├── tests/
│   ├── test_reviewflow_api.py
│   ├── test_webhook_api.py
│   └── test_notifications_and_public_review.py  # NEW
└── memory/
    └── PRD.md
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
- **Test Reports**: `/app/test_reports/iteration_6.json`
- **Test Files**: 
  - `/app/tests/test_reviewflow_api.py`
  - `/app/tests/test_webhook_api.py`
  - `/app/tests/test_notifications_and_public_review.py`
- **Success Rate**: Backend 100%, Frontend 100%

## Prioritized Backlog

### P0 - Critical (Completed ✅)
- [x] Hybrid API integration
- [x] Webhook support for real-time syncing
- [x] Email notifications
- [x] Enhanced QR review flow with AI
- [x] Public AI endpoint for customers

### P1 - High Priority
- [ ] Team collaboration (invite members, role-based access)
- [ ] Review response scheduling
- [ ] Bulk response actions
- [ ] Weekly email summaries

### P2 - Nice to Have
- [ ] Mobile app (iOS/Android)
- [ ] Additional platforms (Yelp, TripAdvisor)
- [ ] White-label QR code branding
- [ ] Custom response templates
- [ ] Export analytics reports
