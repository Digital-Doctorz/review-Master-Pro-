# ReviewFlow - Product Requirements Document

## Original Problem Statement
Build ReviewFlow - a zero-knowledge review management platform focused exclusively on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses.

## User Personas
1. **Small Business Owner** - Non-technical, needs simple setup (<3 minutes)
2. **Restaurant Manager** - Wants to respond quickly to reviews
3. **Marketing Manager** - Needs analytics and insights

## Core Requirements (Static)
- Zero-knowledge setup experience
- Google and Facebook review integration (MOCKED in MVP)
- AI-powered response generation
- Real-time review monitoring
- QR code generation for direct customer reviews
- Sentiment analysis and analytics
- Mobile-first responsive design

## What's Been Implemented (December 2025)

### MVP Features Completed:
- [x] **Landing Page** - Glassmorphism UI, hero section, features showcase, social proof
- [x] **Emergent Google OAuth** - Social login via auth.emergentagent.com
- [x] **Onboarding Flow** - 2-step business setup wizard
- [x] **Dashboard** - Live review feed, sentiment orb, quick stats, quick actions
- [x] **Integration Hub** - Mock Google/Facebook platform connections
- [x] **Review Inbox** - Filter by platform/sentiment/response status, AI response generation
- [x] **AI Response Generation** - Gemini 3 Flash integration via Emergent Universal Key
- [x] **Analytics Page** - Rating distribution, sentiment breakdown, trends chart
- [x] **QR Code Generator** - Download in PNG/SVG, copy link functionality
- [x] **Settings Page** - Business profile update
- [x] **Public Review Page** - Customer-facing review submission via QR code
- [x] **Responsive Layout** - Mobile-first with desktop sidebar

### Tech Stack:
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Framer Motion, Recharts
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **AI**: Gemini 3 Flash via emergentintegrations library
- **Auth**: Emergent-managed Google OAuth

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] Real Google Places API integration
- [ ] Real Facebook Graph API integration
- [ ] Email notifications for new reviews

### P1 - High Priority
- [ ] Team collaboration (invite members, role-based access)
- [ ] Review response scheduling
- [ ] Bulk response actions
- [ ] Webhook support for real-time review notifications

### P2 - Nice to Have
- [ ] Mobile app (iOS/Android)
- [ ] Additional platforms (Yelp, TripAdvisor)
- [ ] White-label QR code branding
- [ ] Custom response templates
- [ ] Export analytics reports

## Architecture

```
/app/
├── backend/
│   └── server.py          # FastAPI with all API endpoints
├── frontend/
│   ├── src/
│   │   ├── App.js         # Router with auth handling
│   │   ├── components/
│   │   │   └── Layout.jsx # Sidebar + mobile nav
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── Onboarding.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Integrations.jsx
│   │       ├── Reviews.jsx
│   │       ├── Analytics.jsx
│   │       ├── QRGenerator.jsx
│   │       ├── Settings.jsx
│   │       └── PublicReview.jsx
```

## API Endpoints
- `POST /api/auth/session` - Exchange Emergent session for local session
- `GET /api/auth/me` - Get current user
- `POST /api/business` - Create business
- `GET /api/business` - Get user's business
- `GET/POST /api/platforms/{platform}/connect` - Mock platform connection
- `GET /api/reviews` - Get reviews with filters
- `POST /api/reviews/{id}/respond` - Save response
- `POST /api/ai/generate-response` - Generate AI response
- `GET /api/analytics/overview` - Analytics summary
- `GET /api/public/business/{qr_code_id}` - Public business info
- `POST /api/public/review` - Submit public review

## Next Tasks
1. Integrate real Google Places API when user provides credentials
2. Integrate real Facebook Graph API
3. Add email notification service
4. Implement team collaboration features
