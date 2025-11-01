# Security Guide 🔒

This document outlines security best practices for the Voice Recording & AI Analysis app.

## Environment Variables

### Storage

**Local Development:**
- Store in `.env` file (never commit to git)
- The `.env` file is in `.gitignore` by default
- Use `.env.example` as a template

**Production (Vercel):**
- Store in Vercel Dashboard → Settings → Environment Variables
- Never hardcode in source code
- Use different keys for different environments

### Required Variables

```env
# REQUIRED - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Optional Variables

```env
# OPTIONAL - For Stripe integration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OPTIONAL - App configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Key Security

### OpenAI API Keys

**Best Practices:**
1. ✅ Store in environment variables
2. ✅ Use different keys for development and production
3. ✅ Set usage limits in OpenAI dashboard
4. ✅ Monitor usage regularly
5. ✅ Rotate keys periodically (every 90 days)
6. ❌ Never commit to git
7. ❌ Never share in public channels
8. ❌ Never hardcode in source files

**Setting Usage Limits:**
1. Go to [OpenAI Dashboard](https://platform.openai.com)
2. Navigate to Settings → Limits
3. Set monthly budget cap
4. Enable email notifications

**If Key is Compromised:**
1. Immediately delete the key in OpenAI dashboard
2. Generate a new key
3. Update environment variables
4. Review usage logs for suspicious activity
5. Check billing for unexpected charges

### Stripe API Keys

**Key Types:**
- **Test keys** (`sk_test_`, `pk_test_`): Use for development
- **Live keys** (`sk_live_`, `pk_live_`): Use only in production

**Best Practices:**
1. ✅ Test mode for all development
2. ✅ Separate keys for each environment
3. ✅ Verify webhook signatures
4. ✅ Enable Stripe Radar for fraud prevention
5. ❌ Never use live keys in development

## Application Security

### Input Validation

The app includes validation for:
- ✅ Audio file type and size
- ✅ API request parameters
- ✅ Webhook signatures (Stripe)

### Rate Limiting

**Recommended Implementation:**

```typescript
// Example: Add to middleware
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
}
```

**Why Rate Limiting?**
- Prevents API abuse
- Reduces costs
- Protects against DDoS
- Manages OpenAI quota

### CORS Configuration

The app runs on the same domain, so CORS is handled automatically. For custom configurations:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ]
  },
}
```

### HTTPS

**Automatic on Vercel:**
- All deployments use HTTPS
- Automatic SSL certificates
- HTTP automatically redirects to HTTPS

**Required for:**
- Microphone access (browser requirement)
- Secure API key transmission
- Cookie security
- Modern web standards

### Content Security Policy

**Recommended Headers:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  return response
}
```

## Data Privacy

### Audio Recordings

**Current Implementation:**
- Audio is recorded in browser
- Sent directly to OpenAI Whisper API
- NOT stored on our servers
- Deleted after transcription

**OpenAI Data Usage:**
- As of March 2023, API data is NOT used for training
- Data is retained for 30 days for abuse monitoring
- See [OpenAI API Data Usage Policy](https://openai.com/policies/api-data-usage-policies)

### Transcriptions

**Current Implementation:**
- Transcriptions are returned to the client
- NOT stored in database (by default)
- Only exists in browser session

**To Add Storage:**
```typescript
// Add database storage if needed
// Consider encryption at rest
// Implement user consent
// Add data retention policy
// Enable user data deletion
```

### User Privacy

**Current Status:**
- No user authentication (yet)
- No personal data collected
- No cookies (except Vercel analytics)
- No tracking scripts

**If Adding Users:**
- ✅ Implement proper authentication
- ✅ Encrypt sensitive data
- ✅ Add privacy policy
- ✅ GDPR compliance (if EU users)
- ✅ CCPA compliance (if CA users)
- ✅ Clear data deletion process

## Webhook Security

### Stripe Webhooks

**Signature Verification:**

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    // This verifies the webhook came from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response('Webhook signature verification failed', { 
      status: 400 
    })
  }
  
  // Process event...
}
```

**Best Practices:**
- ✅ Always verify signatures
- ✅ Use HTTPS endpoints
- ✅ Log all webhook events
- ✅ Implement idempotency
- ❌ Never skip verification

## Error Handling

### Secure Error Messages

**Production:**
```typescript
// Good - generic message to user
return NextResponse.json(
  { error: 'Processing failed' },
  { status: 500 }
)

// Bad - exposes internal details
return NextResponse.json(
  { error: `Database connection failed: ${err.message}` },
  { status: 500 }
)
```

**Development:**
```typescript
// Log detailed errors server-side
console.error('Detailed error:', error)

// Return generic error to client
return NextResponse.json(
  { error: 'Processing failed' },
  { status: 500 }
)
```

### Error Logging

**Recommended Setup:**
1. Use Vercel's built-in logging
2. Consider Sentry for error tracking
3. Set up alerts for critical errors
4. Monitor API error rates

## Deployment Security

### Vercel Security Features

**Automatic:**
- ✅ DDoS protection
- ✅ SSL/TLS certificates
- ✅ Edge network security
- ✅ Automatic security updates

**Recommended Settings:**
1. Enable deployment protection
2. Set up team access controls
3. Enable audit logs (Pro plan)
4. Configure IP allowlist (if needed)

### Git Security

**Before Committing:**
```bash
# Check for secrets
git diff

# Scan for leaked secrets (install git-secrets)
git secrets --scan

# Review .gitignore
cat .gitignore
```

**If Secret Leaked:**
1. DO NOT just delete the commit
2. The secret is still in git history
3. Rotate the compromised secret immediately
4. Use `git filter-branch` or BFG Repo-Cleaner
5. Force push (if private repo)
6. Contact GitHub support for public repos

## Monitoring & Alerting

### What to Monitor

1. **API Usage:**
   - OpenAI API calls
   - Cost per day/month
   - Error rates
   - Response times

2. **Security Events:**
   - Failed authentication attempts
   - Unusual API usage patterns
   - High error rates
   - Webhook failures

3. **Performance:**
   - Function execution time
   - Cold start frequency
   - Client-side errors

### Setting Up Alerts

**OpenAI:**
1. Dashboard → Settings → Limits
2. Set budget alerts
3. Enable email notifications

**Vercel:**
1. Project → Settings → Integrations
2. Add Slack/Discord for alerts
3. Monitor function logs

**Stripe:**
1. Dashboard → Settings → Notifications
2. Enable fraud alerts
3. Set up webhook monitoring

## Compliance

### GDPR (If serving EU users)

- [ ] Implement user consent for recordings
- [ ] Provide privacy policy
- [ ] Enable data export
- [ ] Enable data deletion
- [ ] Document data processing

### CCPA (If serving CA users)

- [ ] Provide privacy notice
- [ ] Enable opt-out mechanism
- [ ] Disclose data sharing
- [ ] Honor deletion requests

### Accessibility

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast

## Security Checklist

### Before Launch

- [ ] All API keys in environment variables
- [ ] `.env` in `.gitignore`
- [ ] HTTPS enabled
- [ ] Error messages don't leak sensitive data
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] Webhook signatures verified
- [ ] Monitoring and alerts set up
- [ ] Usage limits configured
- [ ] Security headers added
- [ ] Dependencies updated
- [ ] Security audit completed

### Regular Maintenance

- [ ] Review API usage monthly
- [ ] Rotate API keys every 90 days
- [ ] Update dependencies weekly
- [ ] Review error logs weekly
- [ ] Check for security advisories
- [ ] Test backup restoration
- [ ] Review access controls
- [ ] Update documentation

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: [your-security-email@domain.com]
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
4. Allow reasonable time for fix
5. We'll credit you (if desired) after fix is deployed

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OpenAI Security Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [Stripe Security](https://stripe.com/docs/security/guide)
- [Vercel Security](https://vercel.com/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

## Update History

- 2024-11: Initial security documentation
- Security reviews should be conducted quarterly

---

**Remember: Security is an ongoing process, not a one-time setup!**

Stay vigilant and keep your app secure! 🔒

