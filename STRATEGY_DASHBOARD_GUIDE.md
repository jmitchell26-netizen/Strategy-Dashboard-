# Strategy Research Dashboard — Project Guide

This document summarizes how the app is built, how to run it, where configuration lives, and how each major feature works.

---

## What it is

A **React** single-page app for strategy research: browse a **live news feed** (NewsAPI), **save** articles into a personal **strategy matrix**, add **research notes** and **company tags**, optionally generate **AI company profiles** from grouped articles (OpenAI), **compare** two profiles, and open **Battle View** to compare two saved articles with a **synthetic metric** visualization.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Linting | ESLint 9 + React hooks / refresh plugins |

---

## Repository layout (important files)

```
strategy-dashboard/
├── .env                 ← Create locally (gitignored). API keys go here.
├── .env.example         ← Template only; safe to commit.
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx                    ← Root state, layout, two columns
    ├── api/
    │   └── openaiCompanyProfile.js ← OpenAI: profile + compare helpers
    ├── hooks/
    │   └── useNews.js               ← NewsAPI fetch, debounced search, empty-query feed
    ├── data/
    │   └── placeholderNews.js     ← Dev / fallback data if used
    └── components/
        ├── SearchBar.jsx
        ├── NewsCard.jsx           ← Feed cards, save, article links
        ├── StrategyMatrix.jsx     ← Saved cards, notes, company field, selection, Battle
        ├── CompanyProfilesPanel.jsx ← AI profiles by company tag, compare modal trigger
        ├── ProfileCompareModal.jsx ← Side-by-side profiles + optional AI synthesis
        └── BattleView.jsx         ← Two-article modal, deterministic metric bars
```

---

## Running the app

1. **Open a terminal** and go to the project folder (the one that contains `package.json`):

   ```bash
   cd "/Users/joeymitchell/Coding Spring- Mitchell /strategy-dashboard"
   ```

   If your path differs, use the folder that holds **`strategy-dashboard/package.json`**, not the parent `Coding Spring- Mitchell` folder alone.

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

Create **`strategy-dashboard/.env`** next to `package.json`. Copy from `.env.example` if you like.

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_NEWSAPI_KEY` | Yes (for live feed) | [NewsAPI](https://newsapi.org/) key |
| `VITE_OPENAI_API_KEY` | No | [OpenAI](https://platform.openai.com/api-keys) — company profiles + AI comparison |

**Format** (no spaces around `=`):

```bash
VITE_NEWSAPI_KEY=your_newsapi_key
VITE_OPENAI_API_KEY=your_openai_key
```

After changing `.env`, **restart** `npm run dev` so Vite reloads env.

**Security:** Names starting with `VITE_` are **embedded in the client bundle**. Anyone can see them in the browser. That is acceptable for **local development** only. For a public site, call NewsAPI and OpenAI from a **backend** and keep secrets on the server.

---

## How the app behaves (feature review)

### Live news feed (`useNews.js` + `NewsCard.jsx`)

- **Empty search:** Several headline requests run in parallel (e.g. US business, US tech, UK business), results are **merged**, **deduped by URL**, and sorted by date. Page size is up to **100** per request where the API allows.
- **With a query:** Debounced search (about **500 ms**) against the **everything** endpoint, larger page size.
- Articles get a **guessed category** from title/description keywords (M&A, R&D, Financial, etc.).
- Cards can show **Description** and, when available, a **Short summary** derived from content or the first sentence.
- **Save to Matrix** adds the article to the right column (duplicates blocked).

### Saved strategy matrix (`StrategyMatrix.jsx`)

- Each row: **checkbox** (select up to **two** items), **remove**, **metadata**, **Company** (text), **Research Notes** (textarea).
- **Company** is the tag used to **group** articles for AI profiles (see below). Same company name for all clippings about one firm; grouping is **case-insensitive** after trim.
- **Battle View** opens when exactly **two** items are selected and the user triggers compare (synthetic metrics — see Battle View).

### Battle View (`BattleView.jsx`)

- Full-screen modal comparing **two saved articles**.
- **Six metrics** per side are **deterministic** (hash from id + title + category boosts), not live AI — useful for a quick visual “side by side” comparison.
- Closing **clears** the two checkboxes.

### AI company profiles (`openaiCompanyProfile.js` + `CompanyProfilesPanel.jsx`)

- **Requires** `VITE_OPENAI_API_KEY` and a working OpenAI account.
- Groups saved items by **Company**; **Generate AI profile** sends **all** tagged articles for that group to **`gpt-4o-mini`** and stores a Markdown **profile** (sections like executive overview, themes, risks, opportunities, etc.).
- Profiles are stored in **`localStorage`** under the key **`companyProfiles`** (object keyed by normalized company name).

### Profile comparison (`ProfileCompareModal.jsx`)

- After at least **two** profiles exist, pick **Company A** and **Company B** → **Open comparison**.
- **AI comparison summary** runs a **second** OpenAI call for a short contrast between the two profile texts.

---

## Data persisted in the browser

| `localStorage` key | Contents |
|--------------------|----------|
| `savedStrategies` | Array of saved articles + `notes`, `companyName`, etc. |
| `companyProfiles` | Object: `{ [normalizedCompanyKey]: { displayName, summary, updatedAt } }` |

Clear site data for this origin to reset.

---

## API integration details

| Service | Code location | Endpoint (conceptually) |
|---------|----------------|-------------------------|
| NewsAPI | `src/hooks/useNews.js` | `https://newsapi.org/v2/...` |
| OpenAI | `src/api/openaiCompanyProfile.js` | `https://api.openai.com/v1/chat/completions` |

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| No feed / API error | `VITE_NEWSAPI_KEY` in `.env`, restart dev server, NewsAPI key limits and plan. |
| “Generate” disabled / amber warning | `VITE_OPENAI_API_KEY` missing or wrong name; restart after editing `.env`. |
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

---

*Generated from the current codebase; update this file if the app’s behavior or structure changes.*
