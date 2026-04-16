# Strategy Research Dashboard — Project Guide

This document summarizes how the app is built, how to run it, where configuration lives, and how each major feature works.

---

## What it is

A **React** single-page app for strategy research: browse a **live news feed** (NewsAPI), **paste your own article links** into the feed, **save** articles into a personal **strategy matrix**, add **research notes** and **company tags**, generate **AI company profiles** from grouped articles (**OpenAI** or **local Ollama**), **compare** two profiles, and open **Battle View** to compare two saved articles with a **synthetic metric** visualization.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Linting | ESLint 9 + React hooks / refresh plugins |
| News | [NewsAPI](https://newsapi.org/) |
| AI (optional) | OpenAI API **or** local/cloud [Ollama](https://ollama.com) |
| Link previews | [Microlink](https://microlink.io/) public API (no key required) |

---

## Repository layout (important files)

```
strategy-dashboard/
├── .env                 ← Create locally (gitignored). API keys go here.
├── .env.example         ← Template only; safe to commit.
├── index.html
├── package.json
├── vite.config.js       ← Vite config + dev proxy for local Ollama (avoids CORS)
├── eslint.config.js
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx                     ← Root state, layout, feed merge, pasted articles
    ├── api/
    │   ├── openaiCompanyProfile.js ← LLM calls: OpenAI or Ollama; profile + compare
    │   └── linkPreviewArticle.js   ← Microlink fetch + buildPastedArticle helper
    ├── hooks/
    │   └── useNews.js               ← NewsAPI fetch, debounced search, empty-query feed
    ├── utils/
    │   └── articleUtils.js          ← Shared: hashString, guessCategory, deriveShortSummary
    ├── data/
    │   └── placeholderNews.js     ← Dev / fallback data if used
    └── components/
        ├── SearchBar.jsx
        ├── PasteArticleLink.jsx    ← Paste-a-URL UI with Microlink preview + manual fallback
        ├── NewsCard.jsx            ← Feed cards, "Your link" badge, save, remove pasted
        ├── StrategyMatrix.jsx      ← Saved cards, notes, company field, selection, Battle
        ├── CompanyProfilesPanel.jsx ← AI profiles by company tag, full text, compare trigger
        ├── ProfileCompareModal.jsx ← Side-by-side profiles + optional AI synthesis
        └── BattleView.jsx          ← Two-article modal, deterministic metric bars
```

---

## Running the app

1. **Open a terminal** and go to the project folder:

   ```bash
   cd strategy-dashboard
   ```

2. **Install dependencies** (first time or after pull):

   ```bash
   npm install
   ```

3. **Start the dev server**:

   ```bash
   npm run dev
   ```

4. **Production build** (optional):

   ```bash
   npm run build
   npm run preview   # serve dist/ locally
   ```

5. **Lint**:

   ```bash
   npm run lint
   ```

---

## Environment variables

Create **`.env`** next to `package.json`. Copy from `.env.example`.

### Required

| Variable | Purpose |
|----------|---------|
| `VITE_NEWSAPI_KEY` | [NewsAPI](https://newsapi.org/) key — drives the live feed |

### AI profiles — pick OpenAI OR Ollama (both optional)

| Variable | Purpose |
|----------|---------|
| `VITE_OPENAI_API_KEY` | [OpenAI](https://platform.openai.com/api-keys) — paid after credits |
| `VITE_LLM_PROVIDER` | `openai` or `ollama` — forces a backend; inferred from keys if omitted |
| `VITE_OLLAMA_BASE_URL` | Ollama base URL (default `http://127.0.0.1:11434`). Set to Ollama Cloud URL if used. |
| `VITE_OLLAMA_API_KEY` | Ollama API key — local Ollama usually needs none; Ollama Cloud may require it |
| `VITE_OLLAMA_MODEL` | Model name (default `llama3.2`). Must match a name from `ollama list`. |

**Ollama quick start (free, local):**
```bash
ollama serve          # start the daemon
ollama pull llama3.2  # download the model (one-time, a few GB)
ollama list           # confirm the name
```
Set `VITE_LLM_PROVIDER=ollama` in `.env` and restart `npm run dev`.

After changing `.env`, **always restart** `npm run dev` so Vite reloads env.

**Security:** `VITE_` variables are embedded in the browser bundle. Use for local dev only; for a public site, proxy API calls through a backend.

---

## How the app behaves (feature review)

### Live news feed (`useNews.js` + `NewsCard.jsx`)

- **Empty search:** Several headline requests run in parallel (US business, US tech, UK business), results are **merged**, **deduped by URL**, and sorted by date.
- **With a query:** Debounced search (~500 ms) against the **everything** endpoint.
- Articles get a **guessed category** from title/description keywords (M&A, R&D, Financial, etc.) via `articleUtils.guessCategory`.
- Cards show **Description** and, when available, a **Short summary**.
- **Save to Matrix** adds the article to the right column (duplicates blocked).

### Paste your own article link (`PasteArticleLink.jsx` + `linkPreviewArticle.js`)

- Enter any URL in the **"Add your own article"** box under the search bar.
- The app calls the **[Microlink](https://microlink.io/)** public API to fetch title, description, and publisher (no key needed).
- The card appears at the **top of the feed** with a **"Your link"** badge and works identically to news feed articles.
- If Microlink can't read the page, a **manual entry** form appears for title and description.
- Pasted articles are stored in **`localStorage`** (`pastedFeedArticles`) and survive page refresh.
- A **"Remove from feed"** link on the card clears it from the feed (does not affect anything already saved to the matrix).
- The merged feed deduplicates by URL — if NewsAPI also returns the same link, the pasted version takes precedence.

### Saved strategy matrix (`StrategyMatrix.jsx`)

- Each row: **checkbox** (select up to **two** items), **remove**, **metadata**, **Company** (text), **Research Notes** (textarea).
- **Company** tags group articles for AI profiles. Grouping is **case-insensitive** after trim.
- **Battle View** opens when exactly **two** items are selected.

### Battle View (`BattleView.jsx`)

- Full-screen modal comparing **two saved articles**.
- **Six metrics** per side are **deterministic** (hash from id + title + category boosts), not live AI.
- Closing **clears** the two checkboxes.

### AI company profiles (`openaiCompanyProfile.js` + `CompanyProfilesPanel.jsx`)

- Requires either `VITE_OPENAI_API_KEY` (paid) **or** a running Ollama instance with `VITE_LLM_PROVIDER=ollama`.
- Groups saved items by **Company**; **Generate AI profile** sends all tagged articles to the configured LLM and stores a Markdown **profile** (executive overview, themes, risks, opportunities, competitive signals, open questions).
- The **full profile** is shown in a scrollable area — no truncation.
- Profiles are stored in **`localStorage`** under `companyProfiles`.

### Profile comparison (`ProfileCompareModal.jsx`)

- After at least **two** profiles exist, pick **Company A** and **Company B** → **Open comparison**.
- **AI comparison summary** runs a second LLM call for a short contrast between the two profiles.

---

## Data persisted in the browser

| `localStorage` key | Contents |
|--------------------|----------|
| `savedStrategies` | Array of saved articles + `notes`, `companyName`, etc. |
| `companyProfiles` | Object: `{ [normalizedCompanyKey]: { displayName, summary, updatedAt } }` |
| `pastedFeedArticles` | Array of articles added via the paste-link feature |

Clear site data for this origin to reset.

---

## API integration details

| Service | Code location | Notes |
|---------|----------------|-------|
| NewsAPI | `src/hooks/useNews.js` | `https://newsapi.org/v2/...` |
| OpenAI | `src/api/openaiCompanyProfile.js` | `https://api.openai.com/v1/chat/completions` |
| Ollama | `src/api/openaiCompanyProfile.js` | OpenAI-compatible endpoint; local dev uses `/ollama-proxy` (Vite proxy in `vite.config.js`) to avoid CORS |
| Microlink | `src/api/linkPreviewArticle.js` | `https://api.microlink.io` — no key required |

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| No feed / API error | `VITE_NEWSAPI_KEY` in `.env`, restart dev server, NewsAPI key limits. |
| AI amber warning | Add `VITE_OPENAI_API_KEY` or Ollama vars; restart after editing `.env`. |
| Ollama "model not found" | Run `ollama pull <model>` and set `VITE_OLLAMA_MODEL` to match `ollama list`. |
| OpenAI quota error | Check billing at [platform.openai.com](https://platform.openai.com/account/billing) or switch to Ollama. |
| Paste link "could not read preview" | Microlink can't access the page. Use the manual title/description form. |
| Company profiles empty | At least one saved article must have **Company** filled in. |
| Compare profiles missing | Two **different** companies must each have a **generated** profile first. |

---

## Scripts (from `package.json`)

| Script | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |

---

## Related docs

- [Vite env variables](https://vite.dev/guide/env-and-mode.html)
- [NewsAPI documentation](https://newsapi.org/docs)
- [OpenAI API reference](https://platform.openai.com/docs/api-reference)
- [Ollama](https://ollama.com)
- [Microlink API](https://microlink.io/docs/api/getting-started/overview)

---

*Update this file whenever the app's behavior or structure changes.*
