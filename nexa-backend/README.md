# NEXA backend

The API behind **NEXA**, the assistant on the NEXUS portfolio. It answers questions about Nausheen's projects
**only from documented sources**, and says so when something isn't documented.

GitHub Pages only serves static files, so this service is deployed separately. The website calls it through
`js/nexa/client.js`.

```
Browser (GitHub Pages)                         NEXA backend (this folder)
──────────────────────                         ──────────────────────────────────────────────
js/nexa/ui.js ── js/nexa/client.js ──HTTPS──►  FastAPI  /health · /chat
                                               │  validation (pydantic) · CORS allow-list
                                               │  per-visitor rate limiting · body-size cap
                                               ▼
                                               Retriever (BM25 today → vector DB later)
                                               │  searches knowledge/portfolio.json
                                               ▼
                                               Generator → Claude (Anthropic SDK)
                                               │  grounded system prompt · JSON answer + cited ids
                                               ▼
                                               {answer, sources[], grounded}
```

## How an answer is produced
1. **Validate.** The question is 1–500 characters, `mode` is one of five values, `projectId` is a slug, and history holds at most 8 turns.
2. **Retrieve.** The service finds the most relevant knowledge chunks. A project named in the question, or picked as context, gets priority. That project's *"not yet documented"* chunk is always included, so NEXA can say "that isn't documented" and cite it.
3. **Short-circuit.** If nothing relevant is found, the service returns an honest "not documented" reply **without calling the model** (no cost, no hallucination).
4. **Generate.** Claude gets the static system prompt (grounding rules) plus the retrieved documents and the question, then returns structured JSON with `answer`, `cited_ids` and `grounded`.
5. **Verify citations.** Only ids that were actually retrieved become sources, so the model can't invent a source. An answer with no valid sources is marked `grounded: false`.

### Model settings
| Setting | Default | Why |
|---|---|---|
| `NEXA_MODEL` | `claude-opus-5-5` | Most capable default model. |
| `NEXA_EFFORT` | `low` | Short, grounded chat answers don't need deep reasoning. Raise it if answers feel thin. |
| `NEXA_FALLBACKS` | `true` | Server-side refusal fallback (`fallbacks: "default"`). If a safety classifier declines, the API retries on Anthropic's recommended fallback model. |

`stop_reason` is checked before any content is read. A refusal returns a polite, ungrounded reply, and a truncated answer returns a 502.

## Knowledge base
`knowledge/portfolio.json` is **generated**, so don't edit it by hand. Rebuild it from the site's data whenever projects change:

```bash
node ../tools/export-knowledge.mjs --readmes   # run from nexa-backend/, or: node tools/export-knowledge.mjs --readmes from the repo root
```

- **Sources:** `js/data/projects.js`, `js/data/profile.js` and (with `--readmes`) each project's GitHub README.
- **Status line:** every chunk starts with its project's status. Concept chunks say *"Everything below is a PLAN, not a built feature"*, so the model can't present plans as finished work.
- **Better answers:** document more in `projects.js` (problem, role, decisions, challenges, results). NEXA can only be as good as the documentation.

**Later (scale-up):** replace `BM25Retriever` with an embeddings + vector-store retriever. It only needs the same `search(query, k, project_id)` method; nothing else changes.

## Run locally
```bash
python -m venv .venv
.venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
pytest                            # 34 tests, no API key or network needed
copy .env.example .env            # then set ANTHROPIC_API_KEY (or run `ant auth login`)
uvicorn app.main:app --reload --port 8787
```
Without credentials, `/health` returns **503** and the website stays in its labelled documentation-search mode.

## Deploy (any container host: Render, Fly.io, Railway, Cloud Run…)
1. Deploy this folder with the included `Dockerfile`. It runs as a non-root user and listens on `$PORT`.
2. Set the environment variables from `.env.example` in the host's dashboard. **`ANTHROPIC_API_KEY` only ever lives there.**
3. Check that `https://<your-service>/health` returns `{"status":"ok"}`.
4. In the website, set `endpoint` in `js/nexa/config.js` to `https://<your-service>` (HTTPS is required) and redeploy GitHub Pages. NEXA switches to **Online** automatically.

## Security checklist
- **API key:** stays server-side only. Nothing in `app/` or the website contains secrets (a test enforces this).
- **CORS:** only the portfolio's origin (plus localhost) may call the API from a browser.
- **Input limits:** strict validation, a 32 KB body cap and a 500-character question limit.
- **Rate limiting:** per visitor, per minute and per day. It's in-memory, so use Redis if you run more than one instance.
- **Prompt injection:** documents and questions are treated as data. The system prompt tells the model to ignore instructions inside them, and citations are verified server-side.
- **Exposure and logging:** the auto-generated `/docs` pages are disabled, and logs record mode, counts and latency, never the question text.
- **Cost control:** rate limits, a `NEXA_MAX_TOKENS` cap, low effort, and a no-match short-circuit that skips the model entirely.

## Files
```
app/config.py      settings from environment variables
app/schemas.py     request/response models (the API contract)
app/knowledge.py   loads knowledge/portfolio.json
app/retrieval.py   Retriever interface + BM25 implementation
app/prompts.py     system prompt, mode instructions, answer JSON schema
app/generator.py   Claude call (structured output, fallbacks, stop-reason handling)
app/ratelimit.py   sliding-window rate limiter
app/main.py        FastAPI app: /health, /chat
tests/             API, safety and retrieval tests
```
