# Review Master - Product Requirements Document

## Original Problem Statement
Build Review Master - a zero-friction review management platform focused on Google and Facebook reviews, with seamless setup, real-time monitoring, and AI-powered responses. Designed for non-technical business owners who can connect accounts in 60 seconds.

## What's Been Implemented (January 2025)

### Latest - v4.3 Location Management & Plan Limits (January 26, 2025):

**Plan-Based Location Management:**
- [x] Plan limits enforced: Starter (1 loc), Growth (3 locs), Enterprise (unlimited)
- [x] Backend returns 403 with clear error when exceeding plan limit
- [x] Upgrade modal shows when trying to add location beyond limit
- [x] Modal displays: current plan, locations used, upgrade options
- [x] Delete button always visible (even for last location)
- [x] Deleting location frees up slot for new location

**QR Code ID Persistence:**
- [x] QR Code ID (`qr_{alphanumeric}`) generated once at location creation
- [x] ID never changes when location details (name, address) are updated
- [x] "This ID is permanent" message displayed in Integrations page
- [x] QR codes remain scannable even after location updates

**QR Generator Enhancements:**
- [x] Location selector dropdown (when multiple locations exist)
- [x] Location info card showing: name, address, QR ID
- [x] 8 color themes + custom color pickers
- [x] Include Branding toggle
- [x] Size options (128px, 256px, 512px)
- [x] PNG/SVG download formats

### Previous Updates (v4.0-4.2)

**v4.2 - Demo QR & Branding:**
- [x] Demo QR code `/review/demo_qr_001` fully functional
- [x] "Powered by Review Master" branding throughout app
- [x] Demo review submission with mock success

**v4.1 - Trial & Upgrade:**
- [x] 7-day free trial with auto-delete
- [x] Plan upgrade for logged-in users
- [x] Comprehensive footer with contact info

**v4.0 - Core Features:**
- [x] Multi-location support
- [x] AI-powered responses (Gemini)
- [x] Review date/time display
- [x] Demo mode with sample data

### Previous Features (v3.0-4.0)

**v4.0 - Pricing & Review Reply:**
- [x] Pricing buttons: Starter/Growth "Try Now", Enterprise "Try All Features"
- [x] Growth badge: "BEST SAVINGS"
- [x] Private review reply: WhatsApp and Email options
- [x] Public review reply: "Post to Google/Facebook" button (MOCKED)
- [x] Plan selection stored during signup

**v3.0-3.9 - Core Features:**
- [x] Demo mode with sample data
- [x] Mobile-first UI with bottom navigation
- [x] All navigation routes working
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

## Trial & Upgrade Flow

### New User Signup:
```
1. User clicks "Start Free Trial" → Google OAuth
2. User authenticated → is_trial: true, trial_ends_at: 7 days from now
3. User can use all features during trial
4. After 7 days: cleanup_expired_trials() deletes all user data
```

### Plan Upgrade (Logged-in User):
```
1. User navigates to pricing section on Landing page
2. Buttons show "Upgrade to [Plan]" instead of "Try Now"
3. User clicks upgrade → POST /api/user/plan/upgrade
4. Plan updated, is_trial: false, features unlocked
5. User redirected to dashboard with new plan
```

## Testing Summary
- **Iteration 20**: Trial & Upgrade - 100% pass (16/16 backend, all frontend)
- **Iteration 19**: Pricing & review reply - 100% pass

## MOCKED APIs
- **Payment processing**: Plan upgrade is free (Stripe/Razorpay not integrated)
- **Review posting**: POST to Google/Facebook returns `posted_live: false`
- **WhatsApp/Email**: Uses native `wa.me` and `mailto:` links

## Deployment Status
- **Health Check**: `/api/health` returns healthy
- **Backend**: Running on port 8001
- **Frontend**: Running on port 3000
- **Preview URL**: https://feedback-hub-131.preview.emergentagent.com

## Prioritized Backlog

### P0 - Critical (Completed ✅)
- [x] 7-day free trial with auto-delete
- [x] Plan upgrade for logged-in users
- [x] Comprehensive footer
- [x] Mobile header alignment
- [x] Auth error flash mitigation

### P1 - High Priority
- [ ] **Stripe/Razorpay Payment Integration** - Process real subscriptions
- [ ] **Real Google/Facebook API** - Post responses live
- [ ] SEO optimization (meta tags, keywords, structured data)
- [ ] Team collaboration features
- [ ] Weekly email summaries

### P2 - Nice to Have
- [ ] Mobile app (iOS/Android)
- [ ] Yelp, TripAdvisor integration
- [ ] White-label QR branding
- [ ] Analytics export
- [ ] Screenshot OCR for review import

## Code Architecture
```
/app/
├── backend/
│   ├── server.py           # Auth, trial-status, plan/upgrade endpoints
│   └── services/           # Google, Facebook, Email services
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx    # Pricing with upgrade logic, footer
│       │   └── Reviews.jsx    # WhatsApp/Email reply
│       ├── components/
│       │   └── Layout.jsx     # Mobile header h-16
│       └── App.js            # ProtectedRoute with retry
└── tests/
    └── test_iteration20_trial_upgrade.py
```

## Key API Endpoints
- `POST /api/auth/session` - Create session with trial status
- `GET /api/user/trial-status` - Get trial info
- `POST /api/user/plan/upgrade` - Upgrade plan (mock payment)
- `GET /api/user/plan` - Get current plan
- `POST /api/reviews/{id}/respond` - Save reply (MOCKED live posting)

## Environment Variables
```
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
EMERGENT_LLM_KEY=your_key

# Frontend (.env)
REACT_APP_BACKEND_URL=https://your-domain.com
```
