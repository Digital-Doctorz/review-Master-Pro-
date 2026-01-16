# Review Master - Product Requirements Document

## Original Problem Statement
Build Review Master - a zero-friction review management platform focused on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses. Designed for non-technical business owners who can connect accounts in 60 seconds.

## What's Been Implemented (January 2025)

### Latest - v4.0 Pricing & Review Reply Updates (January 15, 2025):

**Pricing Page Updates:**
- [x] **Button Text Changed**:
  - Starter: "Try Now →"
  - Growth: "Try Now →"  
  - Enterprise: "Try All Features →"
- [x] **Growth Badge**: Changed from "Most Popular" to "BEST SAVINGS"
- [x] **Pricing**: Starting at ₹499/month
- [x] **Toggle Fixed**: Month/Year toggle redesigned as clean pill buttons

**Review Reply Functionality:**
- [x] **Public Reviews**: "Post to Google" or "Post to Facebook" button
- [x] **Private Reviews**: WhatsApp and Email reply options
  - WhatsApp button opens wa.me with pre-filled message
  - Email button opens mailto with subject/body
- [x] **AI Response Options**: Professional, Friendly, Apologetic
- [x] **Platform-specific posting** (MOCKED - returns posted_live: false)

**Plan-Based Feature Activation:**
- [x] **Plan selection stored** in sessionStorage when user clicks pricing button
- [x] **Plan sent to backend** during auth session creation
- [x] **User plan saved** with features based on tier:
  - Starter: 1 location, Google only, basic features
  - Growth: 3 locations, Google + Facebook, WhatsApp alerts
  - Enterprise: Unlimited locations, all features

### Previous Features (v3.0-3.9)

**v3.9 - Mobile-First UI:**
- [x] Mobile bottom nav (4 items + More)
- [x] Full-screen mobile menu
- [x] Auth flow error fix
- [x] Email setup guide

**v3.8 - Navigation Fixes:**
- [x] All navigation routes working
- [x] Demo mode on all pages

**Core Features:**
- [x] Simplified integration (paste review link)
- [x] Email notifications (Resend)
- [x] Webhook support
- [x] AI-powered responses (Gemini 3 Flash)
- [x] QR code generation
- [x] Analytics dashboard
- [x] Multi-location support

### Tech Stack:
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **AI**: Gemini 3 Flash via emergentintegrations
- **Email**: Resend API
- **Auth**: Emergent-managed Google OAuth

## Pricing Plans

| Plan | Monthly | Yearly | Locations | Platforms |
|------|---------|--------|-----------|-----------|
| Starter | ₹499 | ₹399 | 1 | Google |
| Growth | ₹999 | ₹799 | 3 | Google + Facebook |
| Enterprise | ₹2499 | ₹1999 | Unlimited | All |

### Plan Features:

**Starter:**
- 100 reviews/month
- 1 business location
- Google Reviews integration
- QR code generator
- AI review responses
- Email notifications
- Basic analytics

**Growth (BEST SAVINGS):**
- 500 reviews/month
- 3 business locations
- Google + Facebook integration
- Unlimited QR codes
- AI review responses
- Priority email + WhatsApp alerts
- Advanced analytics & reports
- Private feedback inbox
- Custom branding

**Enterprise:**
- Unlimited reviews
- Unlimited locations
- All platform integrations
- Dedicated account manager
- Custom analytics dashboard
- API access
- White-label option
- Priority 24/7 support

## Review Reply Flow

### Public Reviews (Google/Facebook):
```
1. User clicks on review → Dialog opens
2. User types or generates AI response
3. Clicks "Post to Google" or "Post to Facebook"
4. Response saved to DB
5. If platform connected, posts live (currently MOCKED)
```

### Private Reviews (Direct, <4 stars):
```
1. User clicks on private review → Dialog opens
2. User types or generates AI response
3. Options:
   a. "Send via WhatsApp" → Opens wa.me link
   b. "Send via Email" → Opens mailto link
   c. "Save Response" → Saves to DB only
```

## Testing Summary
- **Iteration 19**: Pricing & review reply - 100% pass (21/21 backend, all frontend)
- **All pricing buttons correct**
- **WhatsApp/Email reply working**
- **Plan selection flow working**

## MOCKED APIs
- Review posting to Google/Facebook (returns posted_live: false)
- WhatsApp uses native wa.me link
- Email uses native mailto link

## Deployment Status
- **Health Check**: `/api/health` returns healthy
- **Backend**: Running on port 8001
- **Frontend**: Running on port 3000
- **Preview URL**: https://feedback-hub-131.preview.emergentagent.com

## Prioritized Backlog

### P0 - Critical (Completed ✅)
- [x] Pricing page updates (buttons, badges, toggle)
- [x] Review reply functionality (WhatsApp, Email)
- [x] Plan-based feature activation
- [x] Mobile navigation fix
- [x] Demo mode feature

### P1 - High Priority
- [ ] **Stripe Payment Integration** - Process real subscriptions
- [ ] **Real Google/Facebook API** - Post responses live
- [ ] Team collaboration features
- [ ] Weekly email summaries

### P2 - Nice to Have
- [ ] Mobile app (iOS/Android)
- [ ] Yelp, TripAdvisor integration
- [ ] White-label QR branding
- [ ] Analytics export

## Code Architecture
```
/app/
├── backend/
│   ├── server.py           # Auth with plan selection, respond endpoint
│   └── services/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx    # Updated pricing
│       │   └── Reviews.jsx    # WhatsApp/Email reply
│       └── App.js            # Plan selection in auth
└── tests/
    └── test_iteration19_pricing_reviews.py
```

## Environment Variables
```
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
EMERGENT_LLM_KEY=your_key

# Frontend (.env)
REACT_APP_BACKEND_URL=https://your-domain.com
```
