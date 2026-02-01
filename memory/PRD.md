# Review Master - Product Requirements Document

## Original Problem Statement
Build Review Master - a zero-friction review management platform focused on Google, Facebook, Amazon, Flipkart, JustDial, Swiggy, and Zomato reviews, with seamless setup, real-time monitoring, and AI-powered responses. Designed for non-technical business owners who can connect accounts in 60 seconds.

## What's Been Implemented (February 2025)

### Latest - v5.4 Platform Expansion & Full Integration (February 1, 2025):

**7 Platform Integration - Complete:**
- [x] Google, Facebook reviews (existing)
- [x] Amazon reviews integration (NEW)
- [x] Flipkart reviews integration (NEW)
- [x] JustDial reviews integration (NEW)
- [x] Swiggy, Zomato reviews (existing)
- [x] All platforms have proper icons, badges, and color schemes

**Landing Page Updates:**
- [x] Hero section text: "Google, Facebook, Amazon, Flipkart, JustDial, Swiggy & Zomato"
- [x] Dashboard preview shows 7 platform icons with "Connected Platforms (7)"
- [x] Hero stats: 1,847 Total Reviews, 4.7 Rating, 98% Response Rate
- [x] Features section: New "7 Platform Support" card as first feature
- [x] QR Code Generator shows all 7 platforms for customer selection
- [x] Updated copy mentions "7 platforms" throughout

**Dashboard Updates:**
- [x] Demo analytics: 1847 reviews, 4.7 rating, 91% positive ratio
- [x] Demo platforms: All 7 platforms shown as connected
- [x] Demo reviews: Includes Amazon, Flipkart, JustDial sample reviews
- [x] Platform Status: Shows "7 Connected" with color-coded badges
- [x] Platform badges: Google (blue), Facebook (indigo), Amazon (amber), Flipkart (yellow), JustDial (yellow), Swiggy (orange), Zomato (red)

**"We Help You Grow" Section:**
- [x] Removed step cards (Auto SMS, Rate Experience, Choose Platform)
- [x] Added 4 feature cards: 7 Platforms, Analytics, AI Replies, Protected
- [x] Updated benefits to 6 items in 2x3 grid:
  - Monitor reputation
  - Route negative to dashboard
  - Boost ratings
  - Boost sales
  - All-in-one platform
  - Build credibility

**Platform Icon SVGs:**
- [x] GoogleIcon, FacebookIcon (existing)
- [x] AmazonIcon, FlipkartIcon, JustDialIcon (NEW)
- [x] SwiggyIcon, ZomatoIcon (updated)

### v5.3 UI/UX Mobile Enhancement (February 1, 2025):

**Mobile Responsiveness Improvements:**
- [x] Stats Section (78%, 93%, 81%, 31%) - Now displays in proper 2x2 grid on mobile
- [x] Each stat card has gradient background, decorative icon, and shorter mobile text
- [x] "How It Works" section - Enhanced with better shadows and gradient step badges
- [x] Benefits list now displays in 2x2 grid on mobile with card styling
- [x] Dashboard Preview cards - Better rounded corners, shadows, and spacing
- [x] Navigation - Mobile-optimized logo and button scaling
- [x] All containers properly aligned and spaced for mobile devices

### v5.2 Pay First, Then Login Flow (January 31, 2025):

**Subscription Management:**
- [x] New `/subscription` page for users to manage their subscription
- [x] `/api/user/subscription` - Get detailed subscription info
- [x] `/api/subscription/cancel` - Cancel active subscription
- [x] `/api/subscription/update-payment-method` - Update payment method
- [x] `/api/payment/history` - Get payment history with proper auth

**Webhook Enhancements:**
- [x] Enhanced `subscription.charged` webhook handler
- [x] Auto-renewal extends plan by 30 days
- [x] Sends payment confirmation email on renewal
- [x] Records payment amount and type in history

**Pricing Fixes:**
- [x] Yearly prices: ₹4,788 (Starter), ₹9,588 (Growth), ₹23,988 (Enterprise)
- [x] Original prices: ₹5,988, ₹11,988, ₹29,988 (monthly × 12)
- [x] Correct savings: ₹1,200, ₹2,400, ₹6,000
- [x] URL param `?billing=yearly` preserved on toggle

**Testing Status (Iteration 30):**
- [x] All 13 backend tests passed (100% success rate)
- [x] All 11 frontend tests passed (100% success rate)
- [x] Subscription endpoints properly auth-protected
- [x] Pricing calculations verified

### v5.0 Paid Plans Only & UI Updates (January 31, 2025):

**UI Text Changes:**
- [x] "See A Demo" → "Try A Demo" everywhere
- [x] "Start Free Trial" → "View Plans" in hero
- [x] "Start Free Trial - ₹0 Today" → "View Plans & Pricing" in final CTA
- [x] Trust indicators: "7-day free trial" → "Instant setup", "No credit card" → "30-day money back"

**Free Trial Removed - All Plans Paid:**
- [x] New users created with plan="free" (no features until payment)
- [x] Removed is_trial, trial_ends_at from user creation
- [x] Backend cleanup_expired_trials still exists but won't create new trial users
- [x] Added /api/user/plan-status endpoint

**Login Button Added:**
- [x] Login button visible in navbar for non-logged users
- [x] Redirects to Google OAuth
- [x] Shows "Dashboard" for logged-in users, "Go to Dashboard" for paid users

**Pricing Buttons Updated:**
- [x] Monthly: "Subscribe ₹499/mo", "Subscribe ₹999/mo", "Subscribe ₹2499/mo"
- [x] Yearly: "Pay ₹4,788/year", "Pay ₹9,588/year", "Pay ₹23,988/year"
- [x] Processing state shows "Processing..."

**Testing Status (Iteration 29):**
- [x] All 15 frontend tests passed (100% success rate)
- [x] All free trial references removed
- [x] All UI text changes verified

### v4.9 Subscription Flow & Login Button (January 31, 2025):

**Login Button for Existing Users:**
- [x] Added Login button in navbar for non-logged users
- [x] Login redirects to Google OAuth (auth.emergentagent.com)
- [x] Shows "Dashboard" button for logged-in users without paid plan
- [x] Shows "Go to Dashboard" for users with active paid plans

**True Monthly Recurring Subscriptions:**
- [x] Monthly plans now use Razorpay Subscription API (auto-recurring)
- [x] Payment creates subscription that auto-renews every month
- [x] Added `/api/payment/verify-subscription` endpoint
- [x] Users see "✓ Auto-renews monthly • Cancel anytime" messaging
- [x] Button shows "Subscribe ₹X/mo" for monthly plans

**Yearly One-Time Payments:**
- [x] Yearly plans remain as one-time payments
- [x] Users see "✓ One-time payment • Full year access" messaging
- [x] Button shows "Pay ₹X,XXX" for yearly plans

**Testing Status (Iteration 28):**
- [x] All 15 backend tests passed (100% success rate)
- [x] All 9 frontend UI tests passed
- [x] Login button, subscription endpoints, pricing UI all verified

### v4.8 User Experience Improvements (January 30, 2025):

**CRITICAL BUG FIX - Session Authentication:**
- [x] Fixed payment endpoints using wrong cookie name (session_id → session_token)
- [x] Payment endpoints now use get_current_user dependency for proper authentication
- [x] Fixed User model access (user.name instead of user.get("name"))
- [x] All 18 backend tests pass, 100% success rate

**Auto-Login for Returning Paid Users:**
- [x] Logged-in users with active paid plans auto-redirect to /dashboard from landing page
- [x] Toast notification welcomes returning users
- [x] Navigation shows "Go to Dashboard" button for paid users

**Payment Flow Improvements:**
- [x] Unauthenticated users clicking payment → redirected to Google login
- [x] Selected plan stored in sessionStorage before login redirect
- [x] After login, auto-triggers payment for the selected plan
- [x] Handles 401 errors gracefully with re-authentication prompt

**Enhanced Demo Mode:**
- [x] Demo dashboard shows all 4 platforms (Google, Facebook, Swiggy, Zomato)
- [x] Demo review page (/review/demo_qr_001) shows all platform options
- [x] "Try QR Scan Demo" button added to landing page hero
- [x] Demo data includes Swiggy/Zomato sample reviews

**Testing Status (Iteration 27):**
- [x] All 18 backend tests passed (100% success rate)
- [x] All frontend flows verified working
- [x] Login redirect to Google OAuth verified
- [x] Demo mode verified with all 4 integrations

### v4.7 Razorpay Payment Integration (January 30, 2025):

**Payment System Implemented:**
- [x] Razorpay backend integration with order creation and verification
- [x] Yearly plans: One-time payment for full 12 months upfront
- [x] Monthly plans: One-time payment for 1 month (MOCKED - not true recurring)
- [x] Pricing display:
  - Yearly: Shows total amount (e.g., ₹4,788/year) with 20% savings
  - Monthly: Shows per-month amount (e.g., ₹499/month)
- [x] Payment verification and plan activation
- [x] Webhook handler for subscription events
- [x] Payment history tracking

**Pricing Configuration:**
- Starter: ₹499/month or ₹4,788/year (save ₹1,200)
- Growth: ₹999/month or ₹9,588/year (save ₹2,400)
- Enterprise: ₹2,499/month or ₹23,988/year (save ₹6,000)

**Backend Endpoints Added:**
- `/api/payment/config` - Get Razorpay key and pricing
- `/api/payment/create-order` - Create one-time payment order
- `/api/payment/verify` - Verify payment and activate plan
- `/api/payment/create-subscription` - Create monthly subscription
- `/api/payment/webhook` - Handle Razorpay webhooks
- `/api/payment/history` - Get user's payment history

**Frontend Updates:**
- Updated pricing cards to show yearly totals
- Added savings badges (Save ₹X,XXX)
- "One-time payment • Full year access" label for yearly
- "Billed monthly • Cancel anytime" label for monthly
- Razorpay checkout integration

**Note:** Payment is **MOCKED** until Razorpay API keys are configured in backend/.env:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET (optional, for webhooks)

### v4.6 Deep Link Automation for Swiggy/Zomato (January 28, 2025):

**One-Tap Review Posting:**
- [x] Automatic clipboard copy when tapping platform button
- [x] Platform-specific deep links:
  - Android: Intent URLs with package names for app detection
  - iOS: Custom URL schemes (swiggy://, zomato://) with web fallback
  - Desktop: Direct web links
- [x] Platform-themed UI (orange for Swiggy, red for Zomato)
- [x] Step-by-step instructions for mobile app users
- [x] "Just copy review" fallback option

**Demo Mode Updates:**
- [x] Demo business now includes Swiggy and Zomato links
- [x] All 4 platforms testable in demo mode

**Technical Implementation:**
- Mobile detection: `/iPhone|iPad|iPod|Android/i`
- Android intent format: `intent://domain/path#Intent;scheme=https;package=com.app.name;end`
- iOS fallback: 2.5s timeout before web redirect

### v4.5 Landing Page UI Sections (January 28, 2025):

**Enhanced "Critical Role of Online Reviews" Section:**
- [x] Two-column layout: text left, stats right (sticky on desktop)
- [x] 4 animated stat cards with gradient percentages (78%, 93%, 81%, 31%)
- [x] Color-coded cards: indigo (78%), violet (93%), sky (81%), emerald (31%)
- [x] Soft pastel backgrounds matching the indigo/purple theme
- [x] "Industry Statistics" badge with icon
- [x] "See How It Works" CTA button
- [x] No overlapping elements, clean professional layout

**Enhanced "How It Works" Section:**
- [x] Beautiful purple-to-violet gradient background
- [x] 3-step flow design (no overlapping cards):
  - Step 1: Automated SMS card
  - Step 2: Rate Experience card (Positive/Private buttons)
  - Step 3: Choose Platform card (Google, Facebook, Swiggy, Zomato)
- [x] Vertical connecting lines between steps
- [x] Glass-morphism badge "How It Works"
- [x] Benefits list with glass-effect icons
- [x] Dual CTAs: "Get Started Free" and "Watch Demo"
- [x] Fully responsive on mobile

### v4.4 Swiggy & Zomato Integration (January 28, 2025):

**Swiggy Integration:**
- [x] `POST /api/swiggy/connect-location/{location_id}` saves swiggy_link
- [x] Swiggy card on Integrations page (orange theme)
- [x] Step-by-step setup guide with 2 options:
  - Option 1: Swiggy Smart Link (recommended)
  - Option 2: Copy from Swiggy customer app
- [x] PublicReview shows orange Swiggy button when connected
- [x] Copy & Go flow: "Open Swiggy & paste" instructions

**Zomato Integration:**
- [x] `POST /api/zomato/connect-location/{location_id}` saves zomato_link
- [x] Zomato card on Integrations page (red theme)
- [x] 5-step setup guide for getting Zomato page URL
- [x] PublicReview shows red Zomato button when connected
- [x] Copy & Go flow: "Open Zomato & paste" instructions

**Platform Support in QR Code Flow:**
- [x] `GET /api/public/business/{qr_code_id}` returns all 4 platforms
- [x] Customers see: Google, Facebook, Swiggy, Zomato options
- [x] Each platform opens in respective app/website

**Landing Page Updates:**
- [x] Hero: "Google, Facebook, Swiggy & Zomato" mentioned
- [x] Dashboard preview shows all 4 platforms connected
- [x] Growth plan: "Swiggy & Zomato integration" added
- [x] Enterprise plan: "All platforms (Google, Facebook, Swiggy, Zomato)"

### Previous Updates (v4.0-4.3)

**v4.3 - Location Management:**
- [x] Plan limits enforced: Starter (1), Growth (3), Enterprise (unlimited)
- [x] QR Code ID persistence (never changes when location updated)
- [x] Upgrade modal when exceeding plan limit

**v4.2 - Demo QR & Branding:**
- [x] Demo QR code `/review/demo_qr_001` fully functional
- [x] "Powered by Review Master" branding throughout

**v4.1 - Trial & Upgrade:**
- [x] 7-day free trial with auto-delete
- [x] Plan upgrade for logged-in users

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
- **Preview URL**: https://reviewmaster-8.preview.emergentagent.com

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
