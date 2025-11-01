# Deployment Guide for Vercel 🚀

This guide will walk you through deploying your Voice Recording & AI Analysis app to Vercel.

## Pre-Deployment Checklist

- [ ] OpenAI API key ready
- [ ] GitHub repository created (recommended)
- [ ] Vercel account created
- [ ] All environment variables documented
- [ ] Tested locally with `npm run dev`

## Step-by-Step Deployment

### Option 1: Deploy via GitHub (Recommended)

This method enables automatic deployments on every push.

#### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Voice Recording & AI Analysis App"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration
5. Click "Deploy"

#### 3. Add Environment Variables

After deployment:

1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add the following variables:

**Required:**
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Optional (for Stripe):**
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**App Configuration:**
```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

4. For each variable, select the environments: Production, Preview, Development
5. Click "Save"

#### 4. Redeploy

After adding environment variables:
1. Go to "Deployments" tab
2. Click "..." on the latest deployment
3. Click "Redeploy"

### Option 2: Deploy via Vercel CLI

Perfect for quick deployments without GitHub.

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Deploy

```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - What's your project's name? recordingAgents
# - In which directory is your code located? ./
# - Auto-detected Project Settings (Next.js)
# - Override? No
```

#### 4. Add Environment Variables

```bash
# Add OpenAI API key
vercel env add OPENAI_API_KEY

# When prompted, enter the value and select environments

# Add other variables as needed
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

#### 5. Deploy to Production

```bash
vercel --prod
```

### Option 3: Deploy via Vercel Dashboard (Git Upload)

If you don't want to use GitHub:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Deploy from other Git providers" or "Continue with Email"
3. Upload your project as a ZIP file
4. Configure as above

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to project "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

### 2. Configure Stripe Webhooks (If Using)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → Webhooks
3. Click "Add endpoint"
4. URL: `https://your-app-name.vercel.app/api/stripe/webhook`
5. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Copy the webhook signing secret
7. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 3. Testing Your Deployment

1. Visit your deployed URL: `https://your-app-name.vercel.app`
2. Click "Start Recording" and grant microphone permission
3. Record a test message
4. Click "Stop Recording"
5. Click "Analyze Recording"
6. Verify all three agents return results

### 4. Monitor Logs

View logs in real-time:

**Via Dashboard:**
1. Go to your project
2. Click on a deployment
3. View "Function Logs"

**Via CLI:**
```bash
vercel logs
```

## Vercel Configuration Details

### Automatic Configuration

Vercel automatically detects and configures:
- Next.js framework
- Node.js 18+ runtime
- Serverless functions for API routes
- Edge optimization
- Automatic HTTPS

### Function Configuration

The API routes are deployed as serverless functions with:
- **Timeout**: 10 seconds (hobby), 60 seconds (pro)
- **Memory**: 1024 MB default
- **Region**: Auto (closest to user)

### Build Settings

Default settings (auto-detected):
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

## Environment Management

### Environment Types

Vercel has three environment types:

1. **Production**: Used for `vercel --prod` and `main` branch
2. **Preview**: Used for all other branches and pull requests
3. **Development**: Used with `vercel dev` locally

### Best Practices

```bash
# Set different keys for different environments
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_API_KEY preview
vercel env add OPENAI_API_KEY development

# Use test keys for preview/development
# Use production keys only for production
```

## Cost & Performance Optimization

### Vercel Limits (Hobby Plan)

- **Bandwidth**: 100 GB/month
- **Function Execution**: 100 GB-Hrs
- **Serverless Function Execution Time**: 10 seconds max
- **Deployments**: Unlimited

### OpenAI Cost Optimization

```typescript
// Consider caching results
// Add rate limiting
// Implement user authentication
// Use webhooks for long-running tasks
```

## Troubleshooting Deployment

### Common Issues

#### 1. "Module not found" errors

```bash
# Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

#### 2. Environment variables not working

- Make sure variables are set for all environments
- Redeploy after adding variables
- Check for typos in variable names
- Don't use quotes in Vercel dashboard (it adds them automatically)

#### 3. API routes timing out

- Check OpenAI API response times
- Consider increasing timeout (requires Pro plan)
- Optimize AI prompts for faster responses

#### 4. Microphone not working on HTTPS

- This should work automatically on Vercel (auto HTTPS)
- Browsers require HTTPS for microphone access
- Test on actual deployment URL, not preview

#### 5. Build fails

```bash
# Test build locally first
npm run build

# Check build logs on Vercel
# Fix any TypeScript errors
```

### Debug Deployment

```bash
# Check deployment status
vercel ls

# View specific deployment
vercel inspect [deployment-url]

# Stream logs
vercel logs --follow
```

## Updating Your Deployment

### Via GitHub (Automatic)

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically deploys!
```

### Via CLI

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Rollback

If something goes wrong:

1. Go to Vercel dashboard → Deployments
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Advanced Configuration

### Custom Vercel Config

Create `vercel.json` for advanced settings:

```json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Edge Functions (Optional)

For faster response times, consider Edge Runtime:

```typescript
export const runtime = 'edge'
```

## Security Checklist

- [ ] API keys stored in Vercel environment variables
- [ ] `.env` in `.gitignore`
- [ ] HTTPS enabled (automatic)
- [ ] CORS configured properly
- [ ] Rate limiting considered
- [ ] Webhook signatures verified (Stripe)

## Production Monitoring

### Set Up Monitoring

1. **Vercel Analytics**: Enable in dashboard
2. **Error Tracking**: Consider Sentry integration
3. **Uptime Monitoring**: Use UptimeRobot or similar
4. **OpenAI Usage**: Monitor in OpenAI dashboard

### Key Metrics to Watch

- Function execution time
- Error rate
- OpenAI API costs
- User engagement

## Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [OpenAI Community](https://community.openai.com)
- [Next.js Documentation](https://nextjs.org/docs)

## Quick Reference

```bash
# Install dependencies
npm install

# Test locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove project
vercel remove
```

---

Your app is now live! 🎉

**Next Steps:**
1. Share your app URL
2. Monitor initial usage
3. Gather feedback
4. Iterate and improve
5. Consider implementing Stripe for monetization

Happy deploying! 🚀

