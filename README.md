# Strategy Research Dashboard

A **React** single-page app for strategy research. Browse a live news feed, paste your own article links, save clippings to a personal strategy matrix, add research notes and company tags, generate AI company profiles, compare two profiles side by side, and run **Battle View** to compare two saved articles with visualized metrics.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Linting | ESLint 9 |
| News | [NewsAPI](https://newsapi.org/) |
| AI (optional) | OpenAI API **or** local [Ollama](https://ollama.com) |
| Link previews | [Microlink](https://microlink.io/) (free, no key needed) |

---

## Quick start

```bash
cd strategy-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment variables

Copy `.env.example` to `.env` and fill in your keys. **Restart `npm run dev`** after any change.

```bash
# Required for live news feed
VITE_NEWSAPI_KEY=your_newsapi_key

# --- AI profiles: pick OpenAI OR Ollama ---

# OpenAI (paid after free credits)
VITE_OPENAI_API_KEY=your_openai_key

# Ollama — free local inference (run: ollama serve + ollama pull llama3.2)
VITE_LLM_PROVIDER=ollama
VITE_OLLAMA_BASE_URL=http://127.0.0.1:11434
VITE_OLLAMA_MODEL=llama3.2
# VITE_OLLAMA_API_KEY=   # only for Ollama Cloud
```

`VITE_` variables are embedded in the browser bundle — use for local dev only.

---

## Features

### Live news feed
Parallel top-headlines requests (US business, US tech, UK business) merged, deduped, and sorted newest-first. Debounced search hits the `/everything` endpoint. Articles are auto-categorized (M&A, R&D, Financial, etc.).

### Paste your own article link
Enter any URL under the search bar. The app fetches title, description, and publisher via Microlink and adds it to the top of the feed with a **"Your link"** badge. If the preview fails, fill in title and description manually. Pasted articles persist across refreshes and work with every feature below.

### Strategy matrix
Save any article (from the feed or pasted). Each saved item has: checkbox for Battle View selection, remove, **Company** tag, and **Research Notes**.

### AI company profiles
Group saved articles by Company tag and click **Generate AI profile** for a Markdown intelligence report (executive overview, key themes, risks, opportunities, competitive signals, open questions). Works with **OpenAI** or **local Ollama**. Generated profiles are stored in `localStorage`.

### Profile comparison
With two profiles generated, compare them side by side. An optional AI synthesis bullet-point summary highlights the sharpest contrasts.

### Battle View
Select two saved articles (checkboxes), open Battle View for a full-screen side-by-side comparison with six deterministic metric bars per article.

---

## Data persisted in the browser

| `localStorage` key | Contents |
|--------------------|----------|
| `savedStrategies` | Saved articles with notes and company tags |
| `companyProfiles` | AI-generated profiles keyed by company name |
| `pastedFeedArticles` | Articles added via the paste-link feature |

Clear site data for this origin to reset everything.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No news feed | Check `VITE_NEWSAPI_KEY` in `.env`; restart dev server |
| AI amber warning | Add `VITE_OPENAI_API_KEY` or Ollama vars; restart |
| Ollama "model not found" | Run `ollama pull <model>` and match `VITE_OLLAMA_MODEL` to `ollama list` |
| OpenAI quota error | Check billing at [platform.openai.com](https://platform.openai.com/account/billing) or switch to Ollama |
| Paste link no preview | Microlink couldn't read the site — use manual title/description entry |
| Company profiles empty | At least one saved article must have **Company** filled in |
| Compare missing | Two different companies must each have a generated profile |

---

## Related docs

- [NewsAPI docs](https://newsapi.org/docs)
- [OpenAI API reference](https://platform.openai.com/docs/api-reference)
- [Ollama](https://ollama.com)
- [Vite env variables](https://vite.dev/guide/env-and-mode.html)
- [Microlink](https://microlink.io/)

See **`STRATEGY_DASHBOARD_GUIDE.md`** for a full technical walkthrough of the codebase.
