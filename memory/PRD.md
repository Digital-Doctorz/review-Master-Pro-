# ReviewFlow - Product Requirements Document

## Original Problem Statement
Build ReviewFlow - a zero-knowledge review management platform focused exclusively on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses.

## What's Been Implemented (January 2025)

### MVP Features v2.2 - Hybrid API Integration:

**NEW - Hybrid Review Integration (January 10, 2025):**
- [x] **Hybrid API Architecture** - Mock data by default, real APIs when credentials provided
- [x] **Google Reviews Service** - `/app/backend/services/google_reviews.py`
- [x] **Facebook Reviews Service** - `/app/backend/services/facebook_reviews.py`
- [x] **Integration Status API** - `/api/integration-status` shows current mode (demo/production)
- [x] **Manual Review Sync** - `/api/reviews/sync` endpoint for on-demand sync
- [x] **Demo Mode Indicator** - Dashboard shows "Demo Mode" badge when using mock data
- [x] **Sync Reviews Button** - Dashboard button to manually sync reviews from platforms
- [x] **Integration Guide** - `/app/INTEGRATION_GUIDE.md` with setup instructions

**Fixed Issues:**
- [x] **Facebook Search** - Added `/api/facebook/search` endpoint with mock data
- [x] **Facebook Reviews Display** - Reviews now generated and displayed after connecting
- [x] **Dashboard Reviews** - All reviews (public & private) now properly fetched and displayed
- [x] **Reviews Page Tabs** - Added Public/Private tabs with proper filtering

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

## API Endpoints (v2.2)
- `POST /api/auth/session` - Exchange Emergent session for local session
- `GET /api/auth/me` - Get current user
- `POST /api/business` - Create business
- `GET /api/business` - Get user's business
- `GET /api/google/search?query=` - Search Google Business profiles (MOCK/REAL)
- `POST /api/google/connect` - Connect Google Business
- `GET /api/facebook/search?query=` - Search Facebook Pages (MOCK)
- `POST /api/facebook/connect` - Connect Facebook Page
- `GET/POST /api/platforms/{platform}/disconnect` - Disconnect platform
- `GET /api/reviews` - Get reviews with filters (including is_private)
- `GET /api/reviews/private` - Get private feedback only
- **NEW:** `POST /api/reviews/sync` - Manually sync reviews from connected platforms
- `POST /api/reviews/{id}/respond` - Save response
- `POST /api/ai/generate-response` - Generate AI response
- `POST /api/ai/write-assist` - AI help customers write reviews
- `GET /api/analytics/overview` - Analytics summary
- **NEW:** `GET /api/integration-status` - Get API integration status (demo/production)
- `GET /api/public/business/{qr_code_id}` - Public business info
- `POST /api/public/review` - Submit public review

## Code Architecture
```
/app/
├── backend/
│   ├── server.py           # Main FastAPI app with all endpoints
│   ├── services/           # NEW: Service layer
│   │   ├── __init__.py
│   │   ├── google_reviews.py   # Google review fetching (mock/real)
│   │   └── facebook_reviews.py # Facebook review fetching (mock/real)
│   └── .env               # Environment config (API keys)
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx    # Updated with sync button, demo mode
│       │   ├── Integrations.jsx
│       │   ├── Reviews.jsx
│       │   └── PublicReview.jsx
│       └── components/ui/  # Shadcn components
├── INTEGRATION_GUIDE.md    # NEW: How to enable real APIs
└── memory/
    └── PRD.md             # This file
```

## Enabling Real API Integration

### Google Places API
1. Create Google Cloud project
2. Enable Places API
3. Create API key
4. Add to `.env`: `GOOGLE_PLACES_API_KEY=your_key`

### Facebook Graph API
1. Create Facebook App
2. Get App ID and Secret
3. Add to `.env`: 
   - `FACEBOOK_APP_ID=your_id`
   - `FACEBOOK_APP_SECRET=your_secret`

See `/app/INTEGRATION_GUIDE.md` for detailed instructions.

## Prioritized Backlog

### P0 - Critical (Completed ✅)
- [x] Hybrid API integration (mock + real)
- [x] Integration status endpoint
- [x] Manual sync functionality

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
- [ ] Webhook support for real-time notifications

## Testing
- **Test Reports**: `/app/test_reports/iteration_4.json`
- **Test File**: `/app/tests/test_reviewflow_api.py`
- **Success Rate**: Backend 100%, Frontend 100%
