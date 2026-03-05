# Solimax PL Backend

## Endpoints

### Consultant
- POST /api/consultant/ask
  - Body: { "question": "...", "language": "pl|ua|de|en", "history": [{"role":"user|assistant","content":"..."}] (optional), "page": "...", "sessionId": "..." }
  - Response: { "answer": "...", "meta": { "inDomain": true, "kbMatches": 1, "kbCoverage": "high|medium|low|none", "usedLLM": false, "errorCode": "http_401|timeout|empty|network", "rateLimitRemaining": { "ip": 10, "session": 5, "daily": 800 } } }

- POST /api/consultant/chat
  - Body: { "question": "...", "language": "pl|ua|de|en", "history": [{"role":"user|assistant","content":"..."}] (optional), "page": "...", "sessionId": "..." }
  - Response: { "answer": "...", "meta": { "inDomain": true, "kbMatches": 1, "kbCoverage": "high|medium|low|none", "usedLLM": false, "errorCode": "http_401|timeout|empty|network", "rateLimitRemaining": { "ip": 10, "session": 5, "daily": 800 } } }

- POST /api/consultant/lead
  - Body: { "name": "...", "phone": "...", "email": "...", "source": "consultant|calculator" }
  - Response: { "status": "received" }

- GET /api/consultant/health
  - Response: { "status": "ok", "timestamp": "..." }

- GET /api/consultant/status
  - Response: { "llmEnabled": true|false, "model": "gpt-4o-mini", "reason": "missing_api_key|ok" }

### Health
- GET /api/health
  - Response: { "ok": true, "timestamp": "..." }

## PowerShell tests

### Health
```
Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4000/api/health" | Select-Object StatusCode, StatusDescription, Content
```

### Ask (single question)
```
$body = @{ question = 'Co to jest falownik?'; language = 'pl' } | ConvertTo-Json -Depth 6
Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4000/api/consultant/ask" -Method POST -ContentType "application/json" -Body $body | Select-Object StatusCode, StatusDescription, Content
```

### Chat (history)
```
$body = @{ question = 'Jak dobrać inwerter?'; language = 'pl'; history = @(@{ role = 'user'; content = 'Co to jest falownik?' }, @{ role = 'assistant'; content = '...' }) } | ConvertTo-Json -Depth 6
Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4000/api/consultant/chat" -Method POST -ContentType "application/json" -Body $body | Select-Object StatusCode, StatusDescription, Content
```

### Out-of-domain (blocked)
```
$body = @{ question = 'casino bonus'; language = 'en' } | ConvertTo-Json -Depth 6
Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4000/api/consultant/ask" -Method POST -ContentType "application/json" -Body $body | Select-Object StatusCode, StatusDescription, Content
```

## Env (optional)
- CONSULTANT_LLM_API_KEY
- CONSULTANT_LLM_API_URL
- CONSULTANT_LLM_MODEL
- MAX_INPUT_CHARS
- MAX_OUTPUT_TOKENS
- DAILY_DIALOG_LIMIT
- MAX_HISTORY_ITEMS

## LLM setup (OpenAI)
1. Create an API key in the OpenAI dashboard: https://platform.openai.com/api-keys
2. Add it to [solimax-pl-backend/.env](solimax-pl-backend/.env):
  - CONSULTANT_LLM_API_KEY=YOUR_KEY
  - CONSULTANT_LLM_MODEL=gpt-4o-mini (optional)
3. Restart backend:
```
npm run dev
```

## LLM verification
- Check status:
```
Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4000/api/consultant/status" | Select-Object StatusCode, StatusDescription, Content
```
- Example PowerShell query (expect meta.usedLLM=true):
```
$body = @{ question = 'Jak działa falownik w instalacji PV?'; language = 'pl' } | ConvertTo-Json -Depth 6
Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:4000/api/consultant/ask" -Method POST -ContentType "application/json" -Body $body | Select-Object StatusCode, StatusDescription, Content
```
 - Expected JSON fragment:
   { "meta": { "usedLLM": true } }

### Admin Panel (token protected)
- GET /admin?token=ADMIN_TOKEN
- POST /admin
- GET /admin/new
- GET /admin/:id/edit
- POST /admin/:id
- POST /admin/:id/delete
