# Quick Logging Guide 📊

Your app now has comprehensive logging! Here's what you need to know:

## 🎯 What's Logged

Every API call to OpenAI is now tracked:

### Whisper API (Transcription)
- ✅ When the call starts
- ✅ File size and type
- ⏱️ **Round trip time in milliseconds**
- ✅ Transcription length
- ⚠️ Any errors with full details

### AI Agents (Mood, Sentiment, Summary)
- ✅ When each agent starts processing
- ⏱️ **GPT-4 response time for each agent**
- ✅ Token usage (costs)
- ✅ Response length
- ⚠️ Any errors

## 📍 Where to Find Logs

### 1. In Your Terminal (Real-time)
Look at your terminal where `npm run dev` is running. You'll see:

```
[INFO] [Whisper] Transcription request received
[INFO] [Whisper] Starting OpenAI Whisper API call (2767ms)
[INFO] [MoodAgent] GPT-4 mood analysis completed (2111ms)
[INFO] [SentimentAgent] GPT-4 sentiment analysis completed (2656ms)
[INFO] [SummaryAgent] GPT-4 summary generation completed (2778ms)
```

### 2. In Log Files
Check the `logs/` directory:

```bash
# View today's log
cat logs/app-$(date +%Y-%m-%d).log

# Watch logs in real-time
tail -f logs/app-$(date +%Y-%m-%d).log

# Search for errors
grep ERROR logs/app-*.log
```

## 🧪 Test the Logging

1. **Open your browser** to http://localhost:3000
2. **Record audio** (click Start Recording, speak, then Stop)
3. **Click "Analyze Recording"**
4. **Check your terminal** - you'll see detailed logs!

## 📊 Sample Log Output

When you make a recording, you'll see something like:

```
[INFO] [Whisper] Transcription request received {"requestId":"req_1730467845123"}
[INFO] [Whisper] Starting OpenAI Whisper API call {"fileSize":"245.67 KB","fileType":"audio/webm"}
[INFO] [Whisper] OpenAI Whisper API call completed successfully (2767ms) {"transcriptionLength":156,"wordsEstimate":24}

[INFO] [MoodAgent] Mood analysis request received {"requestId":"mood_1730467848123"}
[INFO] [MoodAgent] Starting GPT-4 mood analysis {"transcriptionLength":156}
[INFO] [MoodAgent] GPT-4 mood analysis completed (2111ms) {"tokensUsed":245}

[INFO] [SentimentAgent] Sentiment analysis request received
[INFO] [SentimentAgent] Starting GPT-4 sentiment analysis
[INFO] [SentimentAgent] GPT-4 sentiment analysis completed (2656ms) {"tokensUsed":238}

[INFO] [SummaryAgent] Summary request received
[INFO] [SummaryAgent] Starting GPT-4 summary generation
[INFO] [SummaryAgent] GPT-4 summary generation completed (2778ms) {"tokensUsed":198}
```

## ⏱️ Performance Tracking

The numbers in parentheses are **round trip times**:
- **Whisper**: Time to upload, transcribe, and get response
- **Each Agent**: Time for GPT-4 to process and respond

**Typical timings:**
- Whisper: 2-4 seconds (depends on audio length)
- Each Agent: 2-3 seconds
- Total: ~8-12 seconds for everything

## 🚨 Error Logging

If something goes wrong, you'll see detailed error logs:

```
[ERROR] [Whisper] Transcription failed {"error":"Rate limit exceeded","errorStatus":429}
```

## 🔧 Useful Commands

```bash
# List all log files
ls -la logs/

# Count today's API calls
grep "completed successfully" logs/app-$(date +%Y-%m-%d).log | wc -l

# Find all errors
grep "\[ERROR\]" logs/app-*.log

# Calculate average Whisper response time
grep "Whisper.*completed" logs/app-$(date +%Y-%m-%d).log | grep -oP "Duration: \K\d+" | awk '{sum+=$1; count++} END {print "Average: " sum/count "ms"}'
```

## 📂 Log Files Are Protected

- ✅ Logs are in `.gitignore` (won't be committed)
- ✅ New log file created each day
- ✅ Old logs preserved until you delete them

## 💡 Pro Tips

1. **Monitor costs**: Check token usage in logs
2. **Track performance**: Watch response times for slowdowns
3. **Debug issues**: Search logs by request ID
4. **Optimize**: If times are high, check your internet connection

---

**Your app is now fully instrumented! Every API call is tracked.** 🎉

Try making a recording and watch the logs appear in real-time!

