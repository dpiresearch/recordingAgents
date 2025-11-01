# Voice Recording & AI Analysis App 🎤✨

A powerful web application that records voice through your laptop, transcribes it using OpenAI Whisper, and analyzes it with multiple AI agents. Built with Next.js 14 and designed for deployment on Vercel.

## Features

- 🎙️ **Voice Recording**: Record audio directly from your browser
- 📝 **AI Transcription**: Powered by OpenAI Whisper for accurate speech-to-text
- 😊 **Mood Analysis**: AI agent determines the speaker's mood from the recording
- 💭 **Sentiment Detection**: Analyzes emotional state (nervous, happy, sad, etc.)
- 📋 **Smart Summarization**: Automatically generates concise summaries
- 📊 **Comprehensive Logging**: Track all API calls, response times, and errors
- 💳 **Stripe Payment Integration**: Payment required before mood analysis results
- 🚀 **Vercel Optimized**: Deploy with one click

## Architecture

The application uses a modern, scalable architecture:

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│  - Audio Record │
│  - UI/UX        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│       API Routes                │
├─────────────────────────────────┤
│  /api/transcribe                │
│  └─ OpenAI Whisper             │
│                                 │
│  /api/agents/mood              │
│  └─ GPT-4 (Mood Analysis)     │
│                                 │
│  /api/agents/sentiment         │
│  └─ GPT-4 (Sentiment)          │
│                                 │
│  /api/agents/summary           │
│  └─ GPT-4 (Summarization)      │
│                                 │
│  /api/stripe/* (Placeholders)  │
└─────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- OpenAI API account
- (Optional) Stripe account for payments

## Installation

1. **Clone the repository** (or you're already here!)

```bash
cd recordingAgents
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

## Configuration

### Required: OpenAI API Key

You need an OpenAI API key for the app to work. 

**To get your API key:**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key (you won't be able to see it again!)

**Add it to your `.env` file:**

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT SECURITY NOTES:**
- Never commit your `.env` file to git (it's already in `.gitignore`)
- Never share your API key publicly
- For production on Vercel, add keys via Vercel's environment variables dashboard
- Rotate your keys regularly

### Optional: Stripe Integration

The app includes placeholders for Stripe payment integration. When you're ready to monetize:

**Get your Stripe keys:**
1. Go to https://stripe.com and create an account
2. Navigate to Developers → API Keys
3. Copy your Publishable and Secret keys

**Add to `.env`:**

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**To implement Stripe:**
1. Uncomment the code in `/app/api/stripe/create-checkout/route.ts`
2. Uncomment the code in `/app/api/stripe/webhook/route.ts`
3. Create products/prices in Stripe Dashboard
4. Configure webhook endpoints
5. Update the frontend to include payment UI

## Running Locally

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**To test the app:**
1. Click "Start Recording"
2. Speak into your microphone
3. Click "Stop Recording"
4. Click "Analyze Recording"
5. Wait for transcription and AI analysis

## Deployment to Vercel

### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Method 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure environment variables in Vercel dashboard:
   - Add `OPENAI_API_KEY`
   - Add other variables as needed
6. Deploy!

### Method 3: Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel auto-detects Next.js
4. Add environment variables
5. Click "Deploy"

**⚠️ Important for Vercel Deployment:**
- Add all environment variables in Vercel dashboard (Settings → Environment Variables)
- Make sure `OPENAI_API_KEY` is set for Production, Preview, and Development
- The app will show helpful error messages if keys are missing

## Project Structure

```
recordingAgents/
├── app/
│   ├── api/
│   │   ├── transcribe/
│   │   │   └── route.ts          # Whisper transcription endpoint
│   │   ├── agents/
│   │   │   ├── mood/
│   │   │   │   └── route.ts      # Mood analysis agent
│   │   │   ├── sentiment/
│   │   │   │   └── route.ts      # Sentiment analysis agent
│   │   │   └── summary/
│   │   │       └── route.ts      # Summary agent
│   │   └── stripe/
│   │       ├── create-checkout/
│   │       │   └── route.ts      # Stripe checkout (placeholder)
│   │       └── webhook/
│   │           └── route.ts      # Stripe webhook (placeholder)
│   ├── page.tsx                   # Main application page
│   ├── page.module.css            # Styles
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.example
└── README.md
```

## API Endpoints

### POST `/api/transcribe`
Transcribes audio using OpenAI Whisper.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `audio` file (webm, mp3, wav, etc.)

**Response:**
```json
{
  "transcription": "The transcribed text..."
}
```

### POST `/api/agents/mood`
Analyzes the mood of the speaker.

**Request:**
```json
{
  "transcription": "The text to analyze"
}
```

**Response:**
```json
{
  "mood": "The speaker appears enthusiastic and energetic..."
}
```

### POST `/api/agents/sentiment`
Analyzes the sentiment and emotional state.

**Request:**
```json
{
  "transcription": "The text to analyze"
}
```

**Response:**
```json
{
  "sentiment": "The speaker seems confident and calm..."
}
```

### POST `/api/agents/summary`
Generates a summary of the transcription.

**Request:**
```json
{
  "transcription": "The text to summarize"
}
```

**Response:**
```json
{
  "summary": "A concise summary of the main points..."
}
```

## Cost Considerations

**OpenAI Pricing (as of 2024):**
- Whisper API: ~$0.006 per minute of audio
- GPT-4: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens

**For a typical 1-minute recording:**
- Transcription: ~$0.006
- 3 AI agents: ~$0.01-0.02
- **Total: ~$0.02-0.03 per recording**

Consider implementing Stripe to offset API costs!

## Troubleshooting

### Microphone Access Issues
- Make sure you grant microphone permission in your browser
- Check browser settings: Settings → Privacy → Microphone
- Try a different browser (Chrome/Edge recommended)

### API Key Errors
- Verify your `OPENAI_API_KEY` is correct
- Check if you have credits in your OpenAI account
- Make sure there are no extra spaces in the `.env` file

### Transcription Fails
- Check audio format is supported (webm, mp3, wav, m4a, etc.)
- Ensure file size is under 25MB
- Verify internet connection

### Deployment Issues on Vercel
- Double-check environment variables are set
- Check Vercel function logs for errors
- Ensure Node.js version is compatible (18+)

## Future Enhancements

- [ ] Support for multiple languages
- [ ] Audio file upload (in addition to recording)
- [ ] Export transcriptions as PDF/TXT
- [ ] User authentication
- [ ] Save history of recordings
- [ ] Real-time transcription
- [ ] Custom agent configurations
- [ ] Emotion detection from voice tone (not just words)
- [ ] Integration with calendar apps
- [ ] Team collaboration features

## Security Best Practices

1. **API Keys**: Always use environment variables, never hardcode
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Input Validation**: The app validates all inputs
4. **CORS**: Configure for production domains only
5. **HTTPS**: Always use HTTPS in production (automatic on Vercel)
6. **Webhook Verification**: Stripe webhooks verify signatures

## Support & Questions

For issues or questions:
1. Check this README
2. Review error messages in browser console
3. Check Vercel deployment logs
4. Verify environment variables

## License

MIT License - feel free to use this project for personal or commercial purposes!

---

Built with ❤️ using Next.js, OpenAI, and modern web technologies.

