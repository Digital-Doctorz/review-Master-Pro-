# ReviewFlow - Product Requirements Document

## Original Problem Statement
Build ReviewFlow - a zero-knowledge review management platform focused exclusively on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses.

## What's Been Implemented (January 2025)

### MVP Features v2.3 - Webhook Support for Real-Time Syncing:

**NEW - Webhook Support (January 11, 2025):**
- [x] **Webhook Configuration API** - `/api/webhooks/config` for managing webhook settings
- [x] **Google Webhook Handler** - `/api/webhooks/google/{webhook_id}` receives Google Business Profile notifications
- [x] **Facebook Webhook Handler** - `/api/webhooks/facebook/{webhook_id}` receives Facebook Page recommendations
- [x] **Facebook Verification** - GET endpoint for Facebook webhook verification challenge
- [x] **Webhook Secret Management** - Secure token generation and regeneration
- [x] **Test Webhook Feature** - Create test reviews to verify integration
- [x] **Event Logging** - Track all webhook events with timestamps and status
- [x] **WebhookSettings Page** - New `/webhooks` route with full configuration UI
- [x] **Toggle Enable/Disable** - Per-platform webhook control
- [x] **Copy Webhook URLs** - Easy clipboard copy for platform setup
- [x] **Setup Instructions** - In-app documentation for Google & Facebook setup

**Previous - Hybrid API Integration (January 10, 2025):**
- [x] **Hybrid API Architecture** - Mock data by default, real APIs when credentials provided
- [x] **Google Reviews Service** - `/app/backend/services/google_reviews.py`
- [x] **Facebook Reviews Service** - `/app/backend/services/facebook_reviews.py`
- [x] **Integration Status API** - `/api/integration-status` shows current mode (demo/production)
- [x] **Manual Review Sync** - `/api/reviews/sync` endpoint for on-demand sync
- [x] **Demo Mode Indicator** - Dashboard shows "Demo Mode" badge when using mock data

**Customer Review Flow:**
- [x] Step 1: Animated star rating selection with emoji feedback
- [x] Step 2: Review writing with AI Write Assist
- [x] Smart Routing: Ratings <4 → private feedback (with contact details)
- [x] Smart Routing: Ratings ≥4 → choice of Google, Facebook, or Direct
- [x] Step 3: Platform selection (only for high ratings)
- [x] Step 4: Copy-before-redirect instructions
- [x] Contact details collection for private feedback

**Business Owner Features:**
- [x] **Google Business Magic Search** - Type business name, auto-find Google Place ID
- [x] **Facebook Page Magic Search** - Type page name, auto-find Facebook Page
- [x] **Enhanced QR Code Generator** - Multiple sizes, SVG/PNG download
- [x] **Private Feedback Inbox** - View all low-rating feedback with contact details
- [x] **AI Response Generation** - Professional, friendly, or apologetic tones
- [x] **Dashboard Refresh** - Manual refresh button to update data
- [x] **Platform Status Widget** - Shows connection status in sidebar

**Enhanced UI/UX (Crystal Flow Theme):**
- [x] **Glassmorphism Design** - Modern glass cards, frosted effects
- [x] **Animated Background** - Subtle floating gradient animation
- [x] **Micro-interactions** - Star pop animations, hover effects
- [x] **Public/Private Tabs** - Clear separation of review types
- [x] **Connection Prompt** - Helpful banner when no platforms connected

### Tech Stack:
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Framer Motion, Recharts
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **AI**: Gemini 3 Flash via emergentintegrations library
- **Auth**: Emergent-managed Google OAuth

## API Endpoints (v2.3)

### Authentication
- `POST /api/auth/session` - Exchange Emergent session for local session
- `GET /api/auth/me` - Get current user

### Business
- `POST /api/business` - Create business
- `GET /api/business` - Get user's business

### Platform Integrations
- `GET /api/google/search?query=` - Search Google Business profiles
- `POST /api/google/connect` - Connect Google Business
- `GET /api/facebook/search?query=` - Search Facebook Pages
- `POST /api/facebook/connect` - Connect Facebook Page
- `GET/POST /api/platforms/{platform}/disconnect` - Disconnect platform
- `GET /api/integration-status` - Get API integration status

### Reviews
- `GET /api/reviews` - Get reviews with filters
- `GET /api/reviews/private` - Get private feedback only
- `POST /api/reviews/sync` - Manually sync reviews from platforms
- `POST /api/reviews/{id}/respond` - Save response

### Webhooks (NEW)
- `GET /api/webhooks/config` - Get webhook configuration
- `PUT /api/webhooks/config` - Update webhook settings
- `POST /api/webhooks/regenerate-secret` - Regenerate webhook secret
- `GET /api/webhooks/events` - Get recent webhook events
- `POST /api/webhooks/google/{webhook_id}` - Google webhook handler (public)
- `POST /api/webhooks/facebook/{webhook_id}` - Facebook webhook handler (public)
- `GET /api/webhooks/facebook/{webhook_id}` - Facebook verification challenge
- `POST /api/webhooks/test/{platform}` - Test webhook integration

### AI
- `POST /api/ai/generate-response` - Generate AI response
- `POST /api/ai/write-assist` - AI help customers write reviews

### Analytics
- `GET /api/analytics/overview` - Analytics summary

### Public
- `GET /api/public/business/{qr_code_id}` - Public business info
- `POST /api/public/review` - Submit public review

## Code Architecture
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI app with all endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── google_reviews.py   # Google review fetching (mock/real)
│   │   ├── facebook_reviews.py # Facebook review fetching (mock/real)
│   │   └── webhook_service.py  # Webhook parsing and verification
│   └── .env               # Environment config
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Integrations.jsx
│       │   ├── Reviews.jsx
│       │   ├── WebhookSettings.jsx  # NEW
│       │   └── PublicReview.jsx
│       └── components/ui/
├── tests/
│   ├── test_reviewflow_api.py
│   └── test_webhook_api.py      # NEW
├── INTEGRATION_GUIDE.md
└── memory/
    └── PRD.md
```

## Database Collections
- `users` - User accounts
- `businesses` - Business profiles
- `platform_connections` - Google/Facebook connection status
- `reviews` - All reviews (public and private)
- `webhook_configs` - Webhook configuration per business (NEW)
- `webhook_events` - Webhook event logs (NEW)

## Environment Variables
```
# Required
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
EMERGENT_LLM_KEY=your_key

# Webhook (auto-generated if not set)
WEBHOOK_BASE_URL=https://your-domain.com

# Optional - Real API Integration
GOOGLE_PLACES_API_KEY=your_google_key
FACEBOOK_APP_ID=your_fb_app_id
FACEBOOK_APP_SECRET=your_fb_secret
```

## Testing
- **Test Reports**: `/app/test_reports/iteration_5.json`
- **Test Files**: 
  - `/app/tests/test_reviewflow_api.py`
  - `/app/tests/test_webhook_api.py`
- **Success Rate**: Backend 100%, Frontend 100%

## Prioritized Backlog

### P0 - Critical (Completed ✅)
- [x] Hybrid API integration (mock + real)
- [x] Integration status endpoint
- [x] Manual sync functionality
- [x] Webhook support for real-time syncing

### P1 - High Priority
- [ ] Email notifications for new reviews
- [ ] Team collaboration (invite members, role-based access)
- [ ] Review response scheduling
- [ ] Bulk response actions
- [ ] Customer follow-up for private feedback

### P2 - Nice to Have
- [ ] Mobile app (iOS/Android)
- [ ] Additional platforms (Yelp, TripAdvisor)
- [ ] White-label QR code branding
- [ ] Custom response templates
- [ ] Export analytics reports
