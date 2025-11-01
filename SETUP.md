# Quick Setup Guide 🚀

Get your Voice Recording & AI Analysis app running in 5 minutes!

## Prerequisites

Before you begin, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] npm, yarn, or pnpm package manager
- [ ] OpenAI account ([Sign up](https://platform.openai.com/signup))
- [ ] A code editor (VS Code recommended)
- [ ] A terminal/command line interface

## Step 1: Verify Node.js Installation

Open your terminal and run:

```bash
node --version
# Should show v18.0.0 or higher

npm --version
# Should show 9.0.0 or higher
```

If not installed, download from [nodejs.org](https://nodejs.org/).

## Step 2: Navigate to Project Directory

```bash
cd /Users/dpang/dev/recordingAgents
```

## Step 3: Install Dependencies

Choose your preferred package manager:

```bash
# Using npm (recommended)
npm install

# OR using yarn
yarn install

# OR using pnpm
pnpm install
```

This will install:
- Next.js 14
- React 18
- OpenAI SDK
- Stripe SDK
- TypeScript and types

**Wait time:** About 1-2 minutes depending on internet speed.

## Step 4: Get Your OpenAI API Key

### 4.1 Create OpenAI Account

1. Go to [platform.openai.com/signup](https://platform.openai.com/signup)
2. Sign up with email or Google account
3. Verify your email address
4. Add payment method (required for API access)

### 4.2 Generate API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it (e.g., "RecordingAgents Dev")
4. Click "Create secret key"
5. **IMPORTANT:** Copy the key immediately (you won't see it again!)

Your key looks like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4.3 Set Usage Limits (Recommended)

1. Go to Settings → Limits
2. Set a monthly budget (e.g., $10)
3. Enable email alerts
4. This prevents unexpected charges!

**Expected costs:**
- About $0.02-0.03 per recording
- $10 = ~300-500 recordings

## Step 5: Configure Environment Variables

### 5.1 Create .env File

```bash
# Copy the example file
cp .env.example .env

# Or create manually
touch .env
```

### 5.2 Add Your API Key

Open `.env` in your code editor and add:

```env
# Replace with your actual key
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Add app URL for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ CRITICAL:**
- Never commit `.env` to git (it's already in `.gitignore`)
- Never share your API key publicly
- Keep this file secure

### 5.3 Verify .env File

```bash
# Check file exists and is not empty
cat .env

# Should show:
# OPENAI_API_KEY=sk-proj-...
```

## Step 6: Start Development Server

```bash
npm run dev
```

You should see:

```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Ready in 2.5s
```

## Step 7: Test the Application

### 7.1 Open Browser

Navigate to [http://localhost:3000](http://localhost:3000)

### 7.2 Test Recording

1. Click "Start Recording" button
2. Your browser will ask for microphone permission
   - Click "Allow" or "Yes"
3. Speak into your microphone (try: "Hello, this is a test recording.")
4. Click "Stop Recording"
5. Click "Analyze Recording"
6. Wait 5-10 seconds
7. You should see:
   - ✅ Transcription
   - ✅ Mood Analysis
   - ✅ Sentiment Analysis
   - ✅ Summary

### 7.3 Troubleshooting Test

**If microphone permission is denied:**
- Chrome: Settings → Privacy and Security → Site Settings → Microphone
- Safari: Preferences → Websites → Microphone
- Firefox: Preferences → Privacy & Security → Permissions → Microphone

**If "API key not configured" error:**
- Check `.env` file exists
- Check key is correctly formatted
- Restart development server
- Check for extra spaces or quotes

**If transcription fails:**
- Verify API key is valid
- Check OpenAI account has credits
- Check internet connection
- View console for detailed errors (F12 in browser)

## Step 8: Verify Everything Works

Run through this checklist:

- [ ] App loads at localhost:3000
- [ ] Can grant microphone permission
- [ ] Recording indicator appears when recording
- [ ] Can stop recording
- [ ] Transcription returns text
- [ ] Mood analysis shows results
- [ ] Sentiment analysis shows results
- [ ] Summary shows results
- [ ] No errors in browser console (F12)

## Next Steps

### For Local Development

1. **Make changes** - Edit files in `/app` directory
2. **Hot reload** - Changes appear automatically
3. **View logs** - Check terminal for server logs
4. **Debug** - Use browser DevTools (F12)

### Optional: Stripe Setup (For Payments)

**Only if you want to add payments:**

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard
3. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```
4. Uncomment code in Stripe API routes
5. See `README.md` for full Stripe setup

### Deploy to Production

When ready to deploy:

1. Read `DEPLOYMENT.md` for detailed instructions
2. Push code to GitHub
3. Deploy to Vercel
4. Add environment variables in Vercel dashboard

## Common Issues & Solutions

### Issue: "Port 3000 already in use"

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Issue: "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "OpenAI API key not valid"

1. Check key format: `sk-proj-...` (new format) or `sk-...` (old format)
2. Verify key in OpenAI dashboard
3. Try creating a new key
4. Check for extra spaces in `.env`

### Issue: "Rate limit exceeded"

1. You've hit OpenAI's rate limit
2. Wait a few minutes
3. Or upgrade your OpenAI plan

### Issue: Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## Project Structure Overview

```
recordingAgents/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── transcribe/        # Whisper API
│   │   ├── agents/            # AI agents
│   │   │   ├── mood/
│   │   │   ├── sentiment/
│   │   │   └── summary/
│   │   └── stripe/            # Payment endpoints
│   ├── page.tsx               # Main UI (START HERE)
│   └── layout.tsx             # App layout
├── .env                        # Your secrets (DO NOT COMMIT)
├── .env.example               # Template
├── package.json               # Dependencies
└── README.md                  # Full documentation
```

## Development Workflow

### Making Changes

1. **Edit frontend**: Modify `app/page.tsx`
2. **Edit API**: Modify files in `app/api/`
3. **Add styling**: Edit `app/page.module.css`
4. **Save** - Changes appear automatically

### Testing Changes

1. **Browser**: Test UI changes
2. **Console**: Check for errors (F12)
3. **Terminal**: Check server logs
4. **Network tab**: Inspect API calls

### Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Add new feature"

# Push
git push
```

## Cost Monitoring

### Check OpenAI Usage

1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. View daily usage
3. Monitor costs
4. Set alerts

### Estimated Costs (per recording)

- **Whisper transcription**: ~$0.006 per minute
- **GPT-4 analysis (3 agents)**: ~$0.015
- **Total**: ~$0.02-0.03 per recording

## Getting Help

### Documentation

- 📖 [README.md](./README.md) - Full documentation
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to Vercel
- 🔒 [SECURITY.md](./SECURITY.md) - Security best practices

### Resources

- [Next.js Docs](https://nextjs.org/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Support

If you're stuck:
1. Check browser console for errors (F12)
2. Check terminal for server errors
3. Review this setup guide
4. Check README.md troubleshooting section

## Success Checklist

You're ready to develop when:

- ✅ Dependencies installed
- ✅ OpenAI API key configured
- ✅ Dev server running
- ✅ App loads in browser
- ✅ Can record and transcribe audio
- ✅ All three agents return results
- ✅ No errors in console

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Clear cache and reinstall
rm -rf node_modules .next && npm install
```

## Environment Variables Quick Reference

```env
# Required
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# Optional - Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Optional - App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

**You're all set!** 🎉

Start building amazing voice-powered applications!

Need help? Check `README.md` or `DEPLOYMENT.md` for more details.

