# Vercel Logging Guide 📊

## How Logging Works in Vercel

In Vercel, you **cannot** access file-based logs (`logs/app-*.log`). Instead, Vercel captures:
- All `console.log()` statements
- All `console.error()` statements  
- All `console.warn()` statements

These logs are available in the Vercel Dashboard.

## ✅ Updated Logging Strategy

Your app now uses **dual logging**:
1. **File-based logs** (for local development) - `logs/` directory
2. **Console logs** (for Vercel) - `console.log()` and `console.error()`

All API routes now log to **both** systems, so you get:
- Local development: File logs + Console logs
- Vercel production: Console logs (visible in dashboard)

## 📍 Where to Find Logs in Vercel

### Option 1: Real-Time Logs (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **"Logs"** in the left sidebar
4. You'll see real-time logs streaming
5. Filter by:
   - Function (API routes)
   - Status code
   - Time range

### Option 2: Function Logs

1. Go to your project in Vercel
2. Click **"Functions"** tab
3. Click on any API route (e.g., `/api/transcribe`)
4. See logs specific to that function

### Option 3: Deployment Logs

1. Go to **"Deployments"** tab
2. Click on a specific deployment
3. See all logs from that deployment

## 🔍 What Gets Logged

### All API Routes Now Log:

#### Success Logs:
```javascript
// Whisper API
[Whisper API] Request received { requestId, timestamp }
[Whisper API] Processing audio file { requestId, fileSize, fileType }
[Whisper API] Success { requestId, transcriptionLength, wordsEstimate, duration }

// Mood API
[Mood API] Request received { requestId, timestamp }
[Mood API] Success { requestId, tokensUsed, moodLength, duration }

// Sentiment API
[Sentiment API] Request received { requestId, timestamp }
[Sentiment API] Success { requestId, tokensUsed, sentimentLength, duration }

// Summary API
[Summary API] Request received { requestId, timestamp }
[Summary API] Success { requestId, tokensUsed, summaryLength, duration }
```

#### Error Logs:
```javascript
// Example error format
[Whisper API] Error: {
  requestId: 'req_1762040000000',
  error: 'API key invalid',
  stack: '...',
  timestamp: '2025-11-01T...'
}
```

### Frontend Also Logs:

All the existing browser console logs are still there:
- `[RECORDING]` - Recording events
- `[TRANSCRIPTION]` - Transcription progress
- `[NAVIGATION]` - Page redirects
- `[PREPAY PAGE]` - Preview page events
- `[RESULT PAGE]` - Results page events
- `[STRIPE]` - Payment flow

## 🔧 Enhanced Error Handling

### The JSON Parsing Error Fix

The app now:

1. **Checks response status** before parsing JSON
2. **Wraps all `.json()` calls** in try-catch blocks
3. **Logs raw response text** if JSON parsing fails
4. **Includes request IDs** in all error responses

### Example Error Handling:

```typescript
// Before (could fail silently)
const data = await response.json()

// After (safe with detailed errors)
if (!response.ok) {
  const text = await response.text()
  console.error('[API] Error:', text.substring(0, 500))
  throw new Error('Request failed')
}

try {
  const data = await response.json()
  if (!data.transcription) {
    throw new Error('Missing data in response')
  }
} catch (e) {
  console.error('[API] Failed to parse JSON:', e)
  const text = await response.text()
  console.error('[API] Raw response:', text.substring(0, 500))
  throw new Error('Invalid response format')
}
```

## 📊 Monitoring Your App in Vercel

### Check for Errors:

1. **Go to Vercel Dashboard → Logs**
2. **Filter by:**
   - Status: `500` (server errors)
   - Status: `400` (bad requests)
   - Search: `Error:` or `Failed`

3. **Look for patterns:**
   ```
   [Whisper API] Error: { requestId, error, timestamp }
   [Mood API] Error: { requestId, error, timestamp }
   ```

### Track Performance:

Search for "Success" to see performance metrics:
```
[Whisper API] Success { duration: "2157ms", transcriptionLength: 130 }
[Mood API] Success { duration: "2336ms", tokensUsed: 177 }
```

### Debug Specific Issues:

1. Find the `requestId` from the error
2. Search for that ID in logs
3. See the complete flow:
   ```
   [Whisper API] Request received { requestId: 'req_123' }
   [Whisper API] Processing audio file { requestId: 'req_123', ... }
   [Whisper API] Error: { requestId: 'req_123', error: '...' }
   ```

## 🚨 Common Errors & Solutions

### Error: "Failed to execute 'json' on 'Response'"

**Cause:** API returned non-JSON (HTML error page or empty response)

**Fixed by:**
- Checking `response.ok` before parsing
- Logging raw response text
- Better error messages with request IDs

**How to debug:**
1. Find the error in Vercel logs
2. Look for the raw response text
3. Check if API key is valid
4. Verify OpenAI API is accessible

### Error: "No transcription provided"

**Cause:** Frontend not sending data correctly

**How to debug:**
1. Check frontend logs: `[PREPAY PAGE]` or `[RESULT PAGE]`
2. Verify localStorage has `pendingTranscription`
3. Check network tab in browser

### Error: "One or more agent requests failed"

**Cause:** One of the AI agent APIs failed

**Fixed by:**
- Detailed logging for each agent
- Individual error messages
- Request IDs for tracking

**How to debug:**
1. Look for specific agent error:
   - `[Mood API] Error:`
   - `[Sentiment API] Error:`
   - `[Summary API] Error:`
2. Check OpenAI API status
3. Verify API key has access to GPT-4

## 🎯 Vercel Log Filters

Use these search terms in Vercel logs:

### Find Errors:
```
Error:
Failed
status: 500
status: 400
```

### Find Specific Flows:
```
[Whisper API]
[Mood API]
[Sentiment API]
[Summary API]
```

### Find Request by ID:
```
req_1762040000000
mood_1762040000000
sentiment_1762040000000
summary_1762040000000
```

### Find Performance Issues:
```
duration:
tokensUsed:
```

## 📝 Example Log Flow (Success)

```
# Recording & Transcription
[Whisper API] Request received { requestId: 'req_1762040123456' }
[Whisper API] Processing audio file { fileSize: "145.23 KB" }
[Whisper API] Success { duration: "2157ms", transcriptionLength: 130 }

# Prepay Page (Free Analyses)
[Sentiment API] Request received { requestId: 'sentiment_1762040125000' }
[Summary API] Request received { requestId: 'summary_1762040125100' }
[Sentiment API] Success { duration: "2047ms", tokensUsed: 183 }
[Summary API] Success { duration: "1812ms", tokensUsed: 122 }

# After Payment (All Analyses)
[Mood API] Request received { requestId: 'mood_1762040130000' }
[Sentiment API] Request received { requestId: 'sentiment_1762040130100' }
[Summary API] Request received { requestId: 'summary_1762040130200' }
[Mood API] Success { duration: "2336ms", tokensUsed: 177 }
[Sentiment API] Success { duration: "2047ms", tokensUsed: 183 }
[Summary API] Success { duration: "1812ms", tokensUsed: 122 }
```

## 📝 Example Log Flow (Error)

```
# Recording starts fine
[Whisper API] Request received { requestId: 'req_1762040123456' }
[Whisper API] Processing audio file { fileSize: "145.23 KB" }

# Error occurs
[Whisper API] Error: {
  requestId: 'req_1762040123456',
  error: 'Incorrect API key provided',
  stack: '...',
  timestamp: '2025-11-01T20:30:45.123Z'
}

# Frontend sees the error
[TRANSCRIPTION] Failed to parse error response: SyntaxError...
[TRANSCRIPTION] Raw error response: <!DOCTYPE html>...
```

## 🔒 Environment Variables in Vercel

Make sure you have set:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `OPENAI_API_KEY` = `your-api-key`
3. **Important:** Redeploy after adding/changing env vars

## ✅ Testing Logs Locally

Before deploying to Vercel:

```bash
npm run dev
```

Open browser console and terminal - you'll see **both** file logs and console logs.

Test all flows:
1. Record audio
2. Check prepay page
3. Test payment (skip or pay)
4. Check result page
5. Look for any errors in console

## 🚀 Deploy to Vercel

```bash
# Make sure environment variables are set in Vercel Dashboard first
vercel --prod
```

After deployment:
1. Test the app
2. Go to Vercel Dashboard → Logs
3. See real-time logs as you use the app

---

**Your app now has production-ready logging for Vercel!** 📊

All errors are caught, logged with detailed information, and accessible through the Vercel Dashboard.

