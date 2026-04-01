// useNews.js — Custom React hook that fetches live news articles from NewsAPI.
// On mount (empty query): fetches top US business headlines.
// When the user types a query: debounces 500ms, then searches the /everything endpoint.
// Returns { articles, loading, error } for the UI to consume.

import { useState, useEffect, useRef } from "react";

// Read the API key from the .env file (VITE_ prefix exposes it to the client via Vite)
const API_KEY = import.meta.env.VITE_NEWSAPI_KEY;
const BASE_URL = "https://newsapi.org/v2";

// Keyword-to-category mapping used to auto-classify articles
// If an article's title or description contains any of these keywords,
// it gets assigned that category for display in the UI
const CATEGORY_KEYWORDS = {
  "M&A": ["acquire", "acquisition", "merger", "merge", "buyout", "takeover"],
  "R&D": ["research", "patent", "breakthrough", "innovation", "lab", "experiment", "discovery"],
  Financial: ["revenue", "earnings", "profit", "stock", "shares", "quarter", "fiscal", "investor"],
  Expansion: ["expand", "expansion", "new market", "growth", "open", "launch market", "global"],
  "Product Launch": ["launch", "unveil", "introduce", "release", "announce product", "new device"],
  "Product Strategy": ["strategy", "pivot", "roadmap", "vision", "plan", "rebrand"],
  "Market Entry": ["enter", "entry", "disrupt", "compete", "rival", "challenge"],
  "Content Strategy": ["content", "streaming", "media", "entertainment", "programming"],
};

// Scans the article title + description for keywords and returns the best-fit category.
// Falls back to "General" if no keywords match.
function guessCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "General";
}

// Converts a raw NewsAPI article object into the shape our app expects:
// { id, title, source, date, category, summary, url }
function transformArticle(article, index) {
  return {
    id: `news-${index}-${Date.now()}`,                                          // Unique ID combining index + timestamp
    title: article.title || "Untitled",
    source: article.source?.name || "Unknown",
    date: article.publishedAt?.split("T")[0] || new Date().toISOString().split("T")[0], // Extract YYYY-MM-DD
    category: guessCategory(article.title || "", article.description || ""),
    summary: article.description || article.content?.slice(0, 200) || "No summary available.",
    url: article.url,
  };
}

export default function useNews(query) {
  const [articles, setArticles] = useState([]);  // Array of transformed articles
  const [loading, setLoading] = useState(false);  // True while an API request is in-flight
  const [error, setError] = useState(null);        // Error message string, or null
  const debounceRef = useRef(null);                // Stores the setTimeout ID for debouncing
  const abortRef = useRef(null);                   // Stores the AbortController to cancel stale requests

  // Re-run whenever the search query changes
  useEffect(() => {
    // Clear any pending debounce timer from the previous keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const searchTerm = query.trim();

    // If the search bar is empty, immediately load top headlines (no debounce)
    if (!searchTerm) {
      fetchTopHeadlines();
      return;
    }

    // Otherwise, wait 500ms after the user stops typing before calling the API
    // This prevents firing a request on every single keystroke
    debounceRef.current = setTimeout(() => {
      fetchEverything(searchTerm);
    }, 500);

    // Cleanup: clear the debounce timer if the component re-renders or unmounts
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fetches top US business headlines (used when the search bar is empty)
  async function fetchTopHeadlines() {
    await doFetch(`${BASE_URL}/top-headlines?country=us&category=business&pageSize=15&apiKey=${API_KEY}`);
  }

  // Searches all articles matching the user's query, sorted by most recent
  async function fetchEverything(q) {
    const encoded = encodeURIComponent(q);
    await doFetch(`${BASE_URL}/everything?q=${encoded}&sortBy=publishedAt&pageSize=15&language=en&apiKey=${API_KEY}`);
  }

  // Core fetch function shared by both endpoints.
  // Cancels any in-flight request before starting a new one (via AbortController).
  async function doFetch(url) {
    if (abortRef.current) abortRef.current.abort();  // Cancel previous request
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();

      // NewsAPI returns { status: "ok", articles: [...] } on success
      if (data.status !== "ok") {
        throw new Error(data.message || "NewsAPI request failed");
      }

      // Filter out removed/empty articles, then transform into our app's format
      const transformed = (data.articles || [])
        .filter((a) => a.title && a.title !== "[Removed]")
        .map(transformArticle);

      setArticles(transformed);
    } catch (err) {
      // Don't treat a cancelled request as an error
      if (err.name === "AbortError") return;
      console.error("NewsAPI error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { articles, loading, error };
}
