# Stripe Payment Integration Setup 💳

Your app now requires payment before running the AI mood analysis!

## 🎯 How It Works

1. User records audio
2. Audio is transcribed using Whisper
3. **User is redirected to Stripe payment**
4. After successful payment, user returns to app
5. AI agents (mood, sentiment, summary) run automatically
6. Results are displayed on the same page

## ⚙️ Stripe Configuration Required

### Step 1: Configure Return URL in Stripe Dashboard

You need to set up the **success URL** in your Stripe payment link:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Payment Links**
3. Find your payment link: `https://buy.stripe.com/test_3cI3cwc7Rasl18U4ToeAg00`
4. Click **Edit** or create a new payment link
5. Set the **Success URL** to:

   **For Local Testing:**
   ```
   http://localhost:3000?payment=success
   ```

   **For Production (Vercel):**
   ```
   https://your-app-name.vercel.app?payment=success
   ```

### Step 2: Test the Flow Locally

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Record audio and click "Analyze Recording"

4. You'll be redirected to Stripe

5. **For Testing:**
   - Use Stripe test cards: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

6. After payment, manually add `?payment=success` to your URL:
   ```
   http://localhost:3000?payment=success
   ```

7. The app will automatically:
   - Show "Payment successful!" message
   - Run all AI agents
   - Display results

### Step 3: Production Setup

When deploying to production, configure these URLs in Stripe:

**Success URL:**
```
https://your-app-name.vercel.app?payment=success
```

**Cancel URL (optional):**
```
https://your-app-name.vercel.app?payment=cancelled
```

## 📊 Payment Flow Diagram

```
┌─────────────────┐
│  User Records   │
│     Audio       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OpenAI Whisper  │
│  Transcription  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Save to         │
│ localStorage    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Redirect to   │
│ Stripe Payment  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   User Pays     │
│  on Stripe.com  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirect Back  │
│ ?payment=success│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Retrieve from   │
│ localStorage    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Run AI Agents  │
│  (Mood, Sent,   │
│    Summary)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show Results    │
│   Same Page     │
└─────────────────┘
```

## 🔍 Logging

The payment flow includes logging:

```javascript
[Payment] Redirecting to Stripe payment page...
// After successful payment:
[Payment] Payment successful, running AI analysis...
[INFO] [MoodAgent] Mood analysis request received
[INFO] [SentimentAgent] Sentiment analysis request received
[INFO] [SummaryAgent] Summary request received
```

## 🧪 Testing Locally (Workaround)

Since Stripe redirects to their domain, here's how to test locally:

### Option 1: Manual Testing
1. Record audio and click "Analyze"
2. You'll be redirected to Stripe
3. Complete the test payment
4. Manually navigate to: `http://localhost:3000?payment=success`
5. The analysis will run automatically!

### Option 2: Bypass Payment for Development
Add a development bypass button (temporary):

```typescript
// In app/page.tsx, add a dev-only button:
{process.env.NODE_ENV === 'development' && audioBlob && (
  <button onClick={() => {
    const transcription = localStorage.getItem('pendingTranscription')
    if (transcription) runAgentAnalysis(transcription)
  }}>
    🔧 Dev: Skip Payment
  </button>
)}
```

## 💰 Pricing Considerations

With the payment flow:
- Users pay before seeing analysis results
- Transcription happens before payment (free preview)
- AI analysis (mood, sentiment, summary) only after payment

**Cost per user after payment:**
- Mood Analysis: ~$0.005 (177 tokens)
- Sentiment Analysis: ~$0.005 (183 tokens)  
- Summary: ~$0.004 (122 tokens)
- **Total: ~$0.014 per paid analysis**

Make sure your Stripe price covers OpenAI costs + profit margin!

## 🔒 Security Notes

**Current Implementation:**
- ✅ Transcription stored in localStorage (client-side)
- ✅ Payment required before analysis
- ⚠️ No server-side payment verification

**Recommended Improvements for Production:**

1. **Server-side Verification:**
   ```typescript
   // Verify payment on server before running agents
   // Use Stripe webhooks to confirm payment
   ```

2. **Session Management:**
   ```typescript
   // Store transcription server-side with session ID
   // More secure than localStorage
   ```

3. **Payment Validation:**
   ```typescript
   // Verify payment_intent_id from Stripe
   // Prevent URL manipulation
   ```

## 📱 User Experience

**What Users See:**

1. **Record Screen:**
   - "Start Recording" button
   - "Stop Recording" button
   - "Analyze Recording" button

2. **After Clicking Analyze:**
   - Transcription processing (2-3 seconds)
   - Redirect to Stripe payment page

3. **Stripe Payment Page:**
   - Your product description
   - Payment form
   - "Pay" button

4. **After Payment:**
   - Redirect back to your app
   - "✅ Payment successful! Analyzing your recording..."
   - Loading state while AI agents run
   - Results appear (transcription + 3 analyses)

## 🚨 Troubleshooting

### Issue: "Payment successful but no transcription found"
**Solution:** User's localStorage was cleared. Ask them to record again.

### Issue: Stuck on "Analyzing your recording..."
**Solution:** Check browser console for errors. Verify OpenAI API key is set.

### Issue: Not redirecting back after payment
**Solution:** Check Stripe payment link success URL configuration.

### Issue: Payment page doesn't load
**Solution:** Verify the Stripe payment link URL is correct and active.

## 🎨 Customization

### Change Payment Link
Update in `app/page.tsx`:
```typescript
window.location.href = 'https://buy.stripe.com/YOUR_PAYMENT_LINK'
```

### Customize Success Message
Update in `app/page.tsx`:
```typescript
<div className={styles.successMessage}>
  ✅ Your custom message here!
</div>
```

### Add Cancel Handling
```typescript
const paymentCancelled = urlParams.get('payment') === 'cancelled'
if (paymentCancelled) {
  setError('Payment was cancelled. Please try again.')
}
```

## 📚 Documentation Links

- [Stripe Payment Links](https://stripe.com/docs/payment-links)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## ✅ Checklist

Before going live:
- [ ] Stripe payment link created
- [ ] Success URL configured in Stripe
- [ ] Test with Stripe test card
- [ ] Verify return flow works
- [ ] Check all AI agents run after payment
- [ ] Test on mobile devices
- [ ] Set up production URLs
- [ ] Consider server-side payment verification
- [ ] Add cancel URL handling
- [ ] Monitor conversion rates

---

**Your payment flow is now integrated!** 

Remember to configure the Stripe success URL to point back to your app with `?payment=success` parameter.

For local testing, manually add `?payment=success` to your URL after completing the test payment on Stripe.

