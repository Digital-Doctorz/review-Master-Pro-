# ReviewFlow - Product Requirements Document

## Original Problem Statement
Build ReviewFlow - a zero-knowledge review management platform focused exclusively on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses.

## User Personas
1. **Small Business Owner** - Non-technical, needs simple setup (<3 minutes)
2. **Restaurant Manager** - Wants to respond quickly to reviews
3. **Marketing Manager** - Needs analytics and insights
4. **Customer** - Wants easy way to leave reviews

## Core Requirements (Static)
- Zero-knowledge setup experience
- Google and Facebook review integration
- AI-powered response generation
- Smart routing for negative feedback (private)
- Real-time review monitoring
- QR code generation for direct customer reviews
- Sentiment analysis and analytics
- Mobile-first responsive design

## What's Been Implemented (December 2025)

### MVP Features v2.0 - Enhanced:

**Customer Review Flow (New!):**
- [x] Step 1: Animated star rating selection with emoji feedback
- [x] Step 2: Review writing with AI Write Assist
- [x] Smart Routing: Ratings <4 → private feedback (with contact details)
- [x] Smart Routing: Ratings ≥4 → choice of Google, Facebook, or Direct
- [x] Step 3: Platform selection (only for high ratings)
- [x] Step 4: Copy-before-redirect instructions
- [x] Contact details collection for private feedback

**Business Owner Features:**
- [x] **Google Business Magic Search** - Type business name, auto-find Google Place ID
- [x] **Facebook Page Connection** - Simple URL entry
- [x] **Enhanced QR Code Generator** - Multiple sizes, SVG/PNG download
- [x] **Private Feedback Inbox** - View all low-rating feedback with contact details
- [x] **AI Response Generation** - Professional, friendly, or apologetic tones

**Enhanced UI/UX (Crystal Flow Theme):**
- [x] **Glassmorphism Design** - Modern glass cards, frosted effects
- [x] **Animated Background** - Subtle floating gradient animation
- [x] **Micro-interactions** - Star pop animations, hover effects
- [x] **Bento Grid Features** - Unique layout for feature cards
- [x] **Testimonials Section** - Social proof on landing page
- [x] **Stats Section** - Trust indicators
- [x] **Typography** - Manrope (headings) + Plus Jakarta Sans (body)

### Tech Stack:
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Framer Motion, Recharts
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **AI**: Gemini 3 Flash via emergentintegrations library
- **Auth**: Emergent-managed Google OAuth

## API Endpoints (v2.0)
- `POST /api/auth/session` - Exchange Emergent session for local session
- `GET /api/auth/me` - Get current user
- `POST /api/business` - Create business
- `GET /api/business` - Get user's business
- **NEW:** `GET /api/google/search?query=` - Search Google Business profiles
- **NEW:** `POST /api/google/connect` - Connect Google Business
- **NEW:** `POST /api/facebook/connect` - Connect Facebook Page
- `GET/POST /api/platforms/{platform}/disconnect` - Disconnect platform
- `GET /api/reviews` - Get reviews with filters (including is_private)
- **NEW:** `GET /api/reviews/private` - Get private feedback only
- `POST /api/reviews/{id}/respond` - Save response
- `POST /api/ai/generate-response` - Generate AI response
- **NEW:** `POST /api/ai/write-assist` - AI help customers write reviews
- `GET /api/analytics/overview` - Analytics summary (includes private_feedback_count)
- `GET /api/public/business/{qr_code_id}` - Public business info with platform links
- `POST /api/public/review` - Submit public review (handles smart routing)

## Customer Flow Diagram
```
[Scan QR] → [Rate 1-5 Stars]
                ↓
         [Write Review + AI Assist]
                ↓
    ┌──── Rating < 4? ────┐
    │                     │
   YES                   NO
    │                     │
    ↓                     ↓
[Enter Contact]    [Choose Platform]
    │              (Google/FB/Direct)
    ↓                     │
[Send Private]     ┌──────┴──────┐
    │             Google     Facebook
    ↓               ↓           ↓
[Thank You]   [Copy Review]  [Copy Review]
                   ↓           ↓
             [Open Google] [Open Facebook]
                   ↓           ↓
              [Paste & Submit on Platform]
```

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] Real Google Places API integration (user provides API key)
- [ ] Real Facebook Graph API integration
- [ ] Email notifications for new reviews

### P1 - High Priority
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

## Next Tasks
1. Allow users to enter their own Google Places API key for real search
2. Add email notifications for new reviews
3. Implement customer follow-up workflow for private feedback
4. Add team collaboration features
