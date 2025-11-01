# Stripe Automatic Redirect Setup Guide 🔄

## Overview

Your app is configured to automatically receive users back from Stripe after payment using Stripe's built-in redirect functionality. This eliminates the need for manual URL entry!

## 🎯 How Stripe Redirect Works

According to [Stripe's documentation](https://docs.stripe.com/payments/checkout/custom-success-page), when you configure a success URL in your Stripe Payment Link, Stripe will:

1. Complete the payment
2. Automatically redirect to your success URL
3. Append `?session_id={CHECKOUT_SESSION_ID}` to the URL
4. Your app detects the `session_id` parameter
5. Automatically runs the mood analysis
6. Shows results on the same page!

## ⚙️ Configuration Required

### Step 1: Configure Your Stripe Payment Link

**For Local Testing:**

1. Go to [Stripe Test Dashboard](https://dashboard.stripe.com/test/payment-links)
2. Find your payment link or create a new one
3. Click **Edit** on the payment link
4. In the **After payment** section, set:
   - **Success page:** Custom URL
   - **URL:** `http://localhost:3000`
5. Save changes

**Important:** You don't need to add `?payment=success` or `?session_id=` manually. Stripe automatically appends the session_id!

### Step 2: For Production (Vercel)

When deploying to production:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/payment-links) (live mode)
2. Update your payment link
3. Set success URL to: `https://your-app-name.vercel.app`
4. Stripe will automatically append: `?session_id={CHECKOUT_SESSION_ID}`

## 🧪 Testing the Automatic Redirect

### Complete Test Flow

1. **Start your app:**
   ```bash
   cd /Users/dpang/dev/recordingAgents
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Record audio:**
   - Click "Start Recording"
   - Speak: "Testing automatic Stripe redirect!"
   - Click "Stop Recording"

4. **Analyze (FREE):**
   - Click "Analyze Recording"
   - See Sentiment & Summary immediately ✅
   - See Mood with "Pay to Unlock" button 🔒

5. **Pay for Mood:**
   - Click "💳 Pay to Unlock Mood Analysis"
   - Redirects to Stripe TEST page
   - Use test card: `4242 4242 4242 4242`
   - Complete payment

6. **Automatic Return! 🎉**
   - Stripe automatically redirects to: `http://localhost:3000?session_id=cs_test_xxx`
   - App detects the `session_id` parameter
   - Mood analysis runs automatically
   - Results appear in the Mood box!
   - **No manual URL entry needed!**

## 📊 What Happens Under the Hood

### URL Flow

**Before Payment:**
```
http://localhost:3000
```

**Click Pay:**
```
https://buy.stripe.com/test_3cI3cwc7Rasl18U4ToeAg00
```

**After Payment (Automatic):**
```
http://localhost:3000?session_id=cs_test_a1b2c3d4e5f6g7h8i9j0
```

**Cleaned URL:**
```
http://localhost:3000
```
(The app automatically cleans the URL after detecting payment)

### Code Detection

```typescript
// App checks for session_id parameter
const urlParams = new URLSearchParams(window.location.search)
const stripeSessionId = urlParams.get('session_id')

if (stripeSessionId) {
  // Payment successful!
  // Run mood analysis automatically
  runMoodAnalysis(transcription)
}
```

## 📝 Logs You'll See

### Initial Recording (FREE):
```
[INFO] [Whisper] Starting OpenAI Whisper API call
[INFO] [Whisper] Completed (2157ms)
[INFO] [SentimentAgent] Completed (2047ms)
[INFO] [SummaryAgent] Completed (1812ms)
```

### Click Pay Button:
```
[Payment] Redirecting to Stripe TEST payment page for mood analysis...
```

### Automatic Return from Stripe:
```
[Payment] Payment successful, running mood analysis...
[Payment] Stripe session ID: cs_test_a1b2c3d4e5f6g7h8i9j0
[INFO] [MoodAgent] Mood analysis request received
[INFO] [MoodAgent] Starting GPT-4 mood analysis
[INFO] [MoodAgent] GPT-4 mood analysis completed (2336ms)
```

## 🔧 Stripe Payment Link Configuration

### In Stripe Dashboard

Your payment link should have these settings:

**Product Details:**
- Name: "Mood Analysis" (or your preferred name)
- Description: "Unlock detailed mood analysis for your recording"
- Price: Your chosen price (e.g., $2.00)

**After payment:**
- ✅ **Success page:** Custom URL
- **URL:** `http://localhost:3000` (local) or `https://your-app.vercel.app` (production)
- ❌ Don't add `?session_id` manually - Stripe adds it automatically!

**Customer information:**
- Collect email address (optional but recommended)
- Collect billing address (optional)

## 🌐 Production Deployment

### Update Stripe for Production

1. **Create production payment link:**
   - Switch to Live mode in Stripe
   - Create new payment link or update existing
   - Set success URL to your Vercel URL

2. **Update your app:**
   - Change payment link in code to production link
   - Deploy to Vercel
   - Test with real card (or test card in test mode)

3. **Environment-specific URLs:**

```typescript
// Example for environment-specific configuration
const stripeLink = process.env.NODE_ENV === 'production'
  ? 'https://buy.stripe.com/YOUR_PRODUCTION_LINK'
  : 'https://buy.stripe.com/test_3cI3cwc7Rasl18U4ToeAg00'
```

## 🔒 Security Considerations

### Current Implementation
- ✅ Stripe session_id passed via URL
- ✅ Client-side detection
- ⚠️ No server-side verification (yet)

### Recommended Enhancement

For production, add server-side verification:

```typescript
// app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const { session_id } = await request.json()
  
  try {
    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)
    
    if (session.payment_status === 'paid') {
      return NextResponse.json({ verified: true })
    }
    
    return NextResponse.json({ verified: false }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
```

## 📱 Mobile Considerations

The automatic redirect works on mobile devices too:

- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Mobile browsers
- ✅ In-app browsers

No special configuration needed!

## 🐛 Troubleshooting

### Issue: Not redirecting back after payment

**Solution 1: Check Stripe Dashboard**
- Verify success URL is set in payment link
- Make sure it's exactly: `http://localhost:3000` (no trailing slash)
- Don't add `?payment=success` or `?session_id` manually

**Solution 2: Check Browser**
- Disable popup blockers
- Allow redirects
- Check console for errors (F12)

**Solution 3: Verify Payment Link**
- Make sure you're using the correct test link
- Link should be active and published
- Test mode enabled if using test cards

### Issue: Mood analysis not running after redirect

**Check localStorage:**
```javascript
// In browser console (F12)
localStorage.getItem('pendingTranscription')  // Should have text
localStorage.getItem('pendingMoodPayment')     // Should be 'true'
```

**Check URL:**
- Should have `?session_id=cs_test_...` parameter
- Check browser console for logs

**Check Logs:**
```
[Payment] Payment successful, running mood analysis...
[Payment] Stripe session ID: cs_test_xxx
```

### Issue: "Payment successful but no transcription found"

**Cause:** localStorage was cleared or browser was closed

**Solution:** 
- Keep browser open during payment
- Don't clear browser data during flow
- Record audio again if needed

## 📊 Success Metrics

Your redirect is working correctly when:

1. ✅ User completes payment on Stripe
2. ✅ Automatically redirects to your app
3. ✅ URL contains `?session_id=cs_test_...`
4. ✅ "Payment successful!" message appears
5. ✅ Mood analysis runs automatically
6. ✅ Mood results appear in the box
7. ✅ URL cleans up to `http://localhost:3000`

## 🎯 Next Steps

1. ✅ Configure success URL in Stripe Dashboard
2. ✅ Test the automatic redirect flow
3. ✅ Verify mood analysis runs automatically
4. 📚 Read about [Stripe Checkout Sessions](https://docs.stripe.com/api/checkout/sessions)
5. 🔒 Consider adding server-side verification
6. 🚀 Deploy to production with production URLs

## 🔗 Helpful Links

- [Stripe: Customize redirect behavior](https://docs.stripe.com/payments/checkout/custom-success-page)
- [Stripe: Payment Links](https://docs.stripe.com/payment-links)
- [Stripe: Test Cards](https://docs.stripe.com/testing)
- [Stripe Dashboard (Test Mode)](https://dashboard.stripe.com/test/payment-links)

---

**Your automatic redirect is configured!** 🎉

Just set up the success URL in your Stripe Payment Link dashboard, and users will automatically return to your app after payment - no manual URL entry needed!

