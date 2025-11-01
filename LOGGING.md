# Logging Documentation 📊

This application includes comprehensive logging to track all OpenAI API calls, measure performance, and capture errors.

## Log Files Location

All logs are stored in the `logs/` directory:
```
logs/
└── app-YYYY-MM-DD.log
```

- Logs are created daily with date-based filenames
- Example: `app-2024-11-01.log`
- Logs are automatically rotated each day
- The `logs/` directory is git-ignored for security

## What Gets Logged

### 1. Whisper API Calls

**Logged Information:**
- Request received timestamp
- File size and type
- API call start time
- API call duration (round trip time)
- Transcription length and word count
- Any errors with full stack trace

**Example Log Entry:**
```
[2024-11-01T12:30:45.123Z] [INFO] [Whisper] Starting OpenAI Whisper API call | Metadata: {"requestId":"req_1730467845123","fileSize":"245.67 KB","fileType":"audio/webm"}
[2024-11-01T12:30:47.890Z] [INFO] [Whisper] OpenAI Whisper API call completed successfully | Duration: 2767ms | Metadata: {"requestId":"req_1730467845123","transcriptionLength":156,"wordsEstimate":24}
```

### 2. Mood Analysis Agent

**Logged Information:**
- Request received
- Transcription length
- GPT-4 API call duration
- Tokens used
- Response length
- Errors if any

**Example Log Entry:**
```
[2024-11-01T12:30:48.123Z] [INFO] [MoodAgent] Starting GPT-4 mood analysis | Metadata: {"requestId":"mood_1730467848123","transcriptionLength":156}
[2024-11-01T12:30:50.234Z] [INFO] [MoodAgent] GPT-4 mood analysis completed | Duration: 2111ms | Metadata: {"requestId":"mood_1730467848123","tokensUsed":245,"moodLength":187}
```

### 3. Sentiment Analysis Agent

**Logged Information:**
- Request received
- Transcription length
- GPT-4 API call duration
- Tokens used
- Response length
- Errors if any

**Example Log Entry:**
```
[2024-11-01T12:30:48.234Z] [INFO] [SentimentAgent] Starting GPT-4 sentiment analysis | Metadata: {"requestId":"sentiment_1730467848234","transcriptionLength":156}
[2024-11-01T12:30:50.890Z] [INFO] [SentimentAgent] GPT-4 sentiment analysis completed | Duration: 2656ms | Metadata: {"requestId":"sentiment_1730467848234","tokensUsed":238,"sentimentLength":192}
```

### 4. Summary Generation Agent

**Logged Information:**
- Request received
- Transcription length
- GPT-4 API call duration
- Tokens used
- Summary length
- Errors if any

**Example Log Entry:**
```
[2024-11-01T12:30:48.345Z] [INFO] [SummaryAgent] Starting GPT-4 summary generation | Metadata: {"requestId":"summary_1730467848345","transcriptionLength":156}
[2024-11-01T12:30:51.123Z] [INFO] [SummaryAgent] GPT-4 summary generation completed | Duration: 2778ms | Metadata: {"requestId":"summary_1730467848345","tokensUsed":198,"summaryLength":145}
```

## Log Levels

### INFO
Normal operation logs, successful API calls, performance metrics

### ERROR
Failed API calls, exceptions, critical errors with full stack traces

### WARN
Missing data, validation issues, non-critical problems

### DEBUG
Detailed debugging information (can be enabled for development)

## Log Format

Each log entry follows this format:
```
[timestamp] [level] [service] message | Duration: Xms | Metadata: {...}
```

**Components:**
- `timestamp`: ISO 8601 format (e.g., `2024-11-01T12:30:45.123Z`)
- `level`: INFO, ERROR, WARN, or DEBUG
- `service`: Whisper, MoodAgent, SentimentAgent, or SummaryAgent
- `message`: Human-readable description
- `duration`: API call round trip time in milliseconds (when applicable)
- `metadata`: Additional context as JSON (request IDs, file info, token counts, etc.)

## Console Output

Logs are also output to the console in real-time:

**INFO/DEBUG:**
```
[INFO] [Whisper] Starting OpenAI Whisper API call (2767ms)
```

**ERROR:**
```
[ERROR] [Whisper] Transcription failed { error: 'Rate limit exceeded', errorStatus: 429 }
```

## Performance Tracking

### Measured Metrics

1. **Whisper API Round Trip Time**
   - Measures audio file upload to OpenAI
   - Transcription processing time
   - Response download time

2. **GPT-4 Agent Processing Time**
   - Each agent call is timed independently
   - Includes request/response time
   - Excludes local processing

3. **Token Usage**
   - Input tokens (transcription length)
   - Output tokens (response length)
   - Total tokens per request

### Example Performance Summary

For a typical 30-second recording:
```
Whisper Transcription: 2.7s
Mood Analysis: 2.1s
Sentiment Analysis: 2.6s
Summary Generation: 2.8s
Total Processing: ~10.2s
```

## Error Tracking

### Error Log Format

When errors occur, detailed information is captured:

```
[2024-11-01T12:35:45.123Z] [ERROR] [Whisper] Transcription failed | Metadata: {"requestId":"req_1730468145123","errorStatus":401,"errorCode":"invalid_api_key","error":"Incorrect API key provided","stack":"Error: Incorrect API key provided\n    at OpenAI.request (/path/to/file.js:123:45)..."}
```

### Common Errors Logged

1. **Invalid API Key** (401)
   - Logs error status and message
   - Includes request ID for tracking

2. **Rate Limit Exceeded** (429)
   - Logs when API rate limits are hit
   - Includes retry-after information

3. **Network Errors**
   - Connection timeouts
   - DNS resolution failures
   - Network interruptions

4. **Invalid Input**
   - Missing audio files
   - Empty transcriptions
   - Invalid file formats

## Viewing Logs

### Real-time Console Logs

Watch logs in your terminal while the app is running:
```bash
npm run dev
```

### View Log Files

**Today's log:**
```bash
cat logs/app-$(date +%Y-%m-%d).log
```

**All logs:**
```bash
ls -la logs/
```

**Tail logs in real-time:**
```bash
tail -f logs/app-$(date +%Y-%m-%d).log
```

**Search for errors:**
```bash
grep ERROR logs/app-*.log
```

**Search for specific request:**
```bash
grep "req_1730467845123" logs/app-*.log
```

### Log Analysis

**Count API calls today:**
```bash
grep "OpenAI.*API call completed" logs/app-$(date +%Y-%m-%d).log | wc -l
```

**Average Whisper response time:**
```bash
grep "Whisper.*completed" logs/app-$(date +%Y-%m-%d).log | grep -oP "Duration: \K\d+" | awk '{sum+=$1; count++} END {print sum/count "ms"}'
```

**Find all errors:**
```bash
grep "\[ERROR\]" logs/app-$(date +%Y-%m-%d).log
```

## Log Rotation

Logs are automatically rotated daily:
- New file created each day
- Old logs are preserved
- No automatic deletion (manage manually)

### Manual Log Management

**Delete logs older than 30 days:**
```bash
find logs/ -name "app-*.log" -mtime +30 -delete
```

**Archive old logs:**
```bash
tar -czf logs-archive-$(date +%Y-%m).tar.gz logs/*.log
```

**Clear all logs (be careful!):**
```bash
rm -rf logs/*.log
```

## Production Considerations

### Vercel Deployment

On Vercel, file system writes are limited:
- Console logs work perfectly
- File logging may not persist
- Consider external logging service for production

### Recommended Production Logging

For production deployments:

1. **Vercel Logs**
   ```bash
   vercel logs
   ```

2. **Third-party Services**
   - [Logtail](https://logtail.com/)
   - [Papertrail](https://papertrailapp.com/)
   - [Datadog](https://www.datadoghq.com/)
   - [Sentry](https://sentry.io/) (for errors)

3. **Environment-based Logging**
   ```typescript
   // Only write to files in development
   if (process.env.NODE_ENV === 'development') {
     appendFileSync(this.logFile, formattedLog, 'utf8')
   }
   ```

## Logger API

### Import the Logger

```typescript
import { logger, measureTime } from '@/lib/logger'
```

### Log Methods

**Info:**
```typescript
logger.info('ServiceName', 'Message', duration?, metadata?)
```

**Error:**
```typescript
logger.error('ServiceName', 'Message', error?, metadata?)
```

**Warning:**
```typescript
logger.warn('ServiceName', 'Message', metadata?)
```

**Debug:**
```typescript
logger.debug('ServiceName', 'Message', metadata?)
```

### Measure Execution Time

```typescript
const { result, duration } = await measureTime(async () => {
  return await someAsyncOperation()
})

logger.info('Service', 'Operation completed', duration)
```

## Privacy & Security

### What NOT to Log

❌ API keys or secrets  
❌ Full audio file contents  
❌ Personal user information  
❌ Sensitive business data

### What IS Logged

✅ Request timing and performance  
✅ File metadata (size, type)  
✅ Error messages and codes  
✅ Token usage  
✅ Request IDs for tracing

### Log Security

- Logs directory is git-ignored
- No sensitive data in logs
- File permissions restrict access
- Regular rotation recommended

## Troubleshooting

### Logs Not Creating

**Check permissions:**
```bash
ls -la logs/
chmod 755 logs/
```

**Check disk space:**
```bash
df -h
```

### Missing Duration Info

Duration is only logged for successful API calls. If missing:
- Check if the request failed
- Look for ERROR logs
- Verify API key is valid

### High API Response Times

If you see consistently high durations:
- Check your internet connection
- Verify OpenAI API status: https://status.openai.com/
- Consider reducing file sizes
- Check for rate limiting

## Example Complete Request Flow

```
[12:30:45.123] [INFO] [Whisper] Transcription request received
[12:30:45.234] [INFO] [Whisper] Starting OpenAI Whisper API call | fileSize: 245.67 KB
[12:30:47.890] [INFO] [Whisper] OpenAI Whisper API call completed (2656ms)
[12:30:48.123] [INFO] [MoodAgent] Mood analysis request received
[12:30:48.234] [INFO] [MoodAgent] Starting GPT-4 mood analysis
[12:30:50.345] [INFO] [MoodAgent] GPT-4 mood analysis completed (2111ms)
[12:30:48.345] [INFO] [SentimentAgent] Sentiment analysis request received
[12:30:48.456] [INFO] [SentimentAgent] Starting GPT-4 sentiment analysis
[12:30:51.112] [INFO] [SentimentAgent] GPT-4 sentiment analysis completed (2656ms)
[12:30:48.567] [INFO] [SummaryAgent] Summary request received
[12:30:48.678] [INFO] [SummaryAgent] Starting GPT-4 summary generation
[12:30:51.456] [INFO] [SummaryAgent] GPT-4 summary generation completed (2778ms)
```

**Total Processing Time: ~6.3 seconds**

---

Happy logging! 📊 Monitor your API performance and catch errors early!

