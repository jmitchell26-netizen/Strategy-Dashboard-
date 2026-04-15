// useNews.js — Custom React hook that fetches live news articles from NewsAPI.
// Empty search: runs several top-headlines requests in parallel (US business, US tech, UK business),
// merges, dedupes by URL, and sorts by date — many more sources than a single category call.
// With a query: debounces 500ms, then searches /everything with a larger page size.
// Returns { articles, loading, error } for the UI to consume.

import { useState, useEffect, useRef } from "react";
import {
  hashString,
  guessCategory,
  cleanContentSnippet,
  deriveShortSummary,
} from "../utils/articleUtils";

// Read the API key from the .env file (VITE_ prefix exposes it to the client via Vite)
const API_KEY = import.meta.env.VITE_NEWSAPI_KEY;
const BASE_URL = "https://newsapi.org/v2";

// NewsAPI allows up to 100 articles per request on most plans (free tier included).
// Using the max gives the broadest feed without extra round-trips per category.
const PAGE_SIZE = 100;

// Converts a raw NewsAPI article object into the shape our app expects:
// { id, title, source, date, category, summary, shortSummary, url }
// ID is stable per URL so merged feeds don’t create duplicate keys.
function transformArticle(article, index) {
  const key = article.url || `${article.title || ""}-${article.publishedAt || ""}`;
  const description =
    article.description || cleanContentSnippet(article.content || "").slice(0, 500) || "No description available.";
  let shortSummary = deriveShortSummary(description, article.content);
  if (shortSummary) {
    const dNorm = description.replace(/\s+/g, " ").trim();
    const sNorm = shortSummary.replace(/\s+/g, " ").trim();
    // Drop if it repeats almost the entire description (single-sentence articles)
    if (sNorm.length >= dNorm.length * 0.92) shortSummary = "";
  }

  return {
    id: article.url ? `art-${hashString(article.url)}` : `art-${hashString(key)}-${index}`,
    title: article.title || "Untitled",
    source: article.source?.name || "Unknown",
    date: article.publishedAt?.split("T")[0] || new Date().toISOString().split("T")[0],
    category: guessCategory(article.title || "", article.description || ""),
    summary: description,
    shortSummary: shortSummary || "",
    url: article.url,
    publishedAt: article.publishedAt || "", // used only for sorting merged lists
  };
}

// Strip internal field before exposing to UI (optional — App only uses known fields)
function toPublicArticle(t) {
  const { publishedAt: _p, ...rest } = t;
  return rest;
}

// Dedupe by URL (fallback: title+date), then sort newest first
function mergeAndSortRawArticles(lists) {
  const seen = new Set();
  const merged = [];
  for (const list of lists) {
    for (const a of list) {
      if (!a.title || a.title === "[Removed]") continue;
      const key = (a.url && a.url.trim()) || `${a.title}|${a.publishedAt || ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(a);
    }
  }
  merged.sort((a, b) => {
    const ta = new Date(a.publishedAt || 0).getTime();
    const tb = new Date(b.publishedAt || 0).getTime();
    return tb - ta;
  });
  return merged;
}

function isAbortError(err) {
  if (!err) return false;
  if (err.name === "AbortError") return true;
  const msg = String(err.message || "");
  return /aborted|AbortError/i.test(msg);
}

export default function useNews(query) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  // Bumps on each new fetch so we never apply results from a superseded or aborted run (e.g. React Strict Mode).
  const fetchGenerationRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const searchTerm = query.trim();

    if (!searchTerm) {
      fetchTopHeadlinesMerged();
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchEverything(searchTerm);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // Abort in-flight fetches when the effect cleans up (route change, Strict Mode remount, query change)
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch helpers use stable constants; only `query` should retrigger
  }, [query]);

  // Parallel top-headlines: multiple countries/categories = many distinct outlets (still one merged list).
  // NewsAPI counts each HTTP request toward your daily quota — here we use 3 requests for the default feed.
  async function fetchTopHeadlinesMerged() {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const generation = ++fetchGenerationRef.current;

    const key = encodeURIComponent(API_KEY);
    const urls = [
      `${BASE_URL}/top-headlines?country=us&category=business&pageSize=${PAGE_SIZE}&apiKey=${key}`,
      `${BASE_URL}/top-headlines?country=us&category=technology&pageSize=${PAGE_SIZE}&apiKey=${key}`,
      `${BASE_URL}/top-headlines?country=gb&category=business&pageSize=${PAGE_SIZE}&apiKey=${key}`,
    ];

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        urls.map((url) => fetch(url, { signal: controller.signal }).then((r) => r.json()))
      );

      // A newer fetch started or React aborted this run — do not touch state or treat as API failure
      if (generation !== fetchGenerationRef.current || controller.signal.aborted) return;

      const rawLists = [];
      const errors = [];

      for (const result of results) {
        if (result.status === "fulfilled") {
          const data = result.value;
          if (data.status === "ok" && Array.isArray(data.articles)) {
            rawLists.push(data.articles);
          } else if (data.message) {
            errors.push(data.message);
          }
        } else if (!isAbortError(result.reason)) {
          errors.push(result.reason?.message || "Request failed");
        }
      }

      if (generation !== fetchGenerationRef.current || controller.signal.aborted) return;

      if (rawLists.length === 0) {
        if (controller.signal.aborted) return;
        throw new Error(errors[0] || "NewsAPI returned no articles");
      }

      const mergedRaw = mergeAndSortRawArticles(rawLists);
      const transformed = mergedRaw.map((a, i) => transformArticle(a, i)).map(toPublicArticle);

      if (generation !== fetchGenerationRef.current) return;

      setArticles(transformed);

      // If some feeds failed, surface a soft warning in console (optional partial failure)
      if (errors.length > 0 && rawLists.length > 0) {
        console.warn("Some headline feeds failed:", errors);
      }
    } catch (err) {
      if (generation !== fetchGenerationRef.current) return;
      if (isAbortError(err)) return;
      console.error("NewsAPI error:", err);
      setError(err.message);
    } finally {
      if (generation === fetchGenerationRef.current) {
        setLoading(false);
      }
    }
  }

  // Single-request search across all English articles, newest first
  async function fetchEverything(q) {
    const encoded = encodeURIComponent(q);
    const key = encodeURIComponent(API_KEY);
    const url = `${BASE_URL}/everything?q=${encoded}&sortBy=publishedAt&pageSize=${PAGE_SIZE}&language=en&apiKey=${key}`;
    await doFetch(url);
  }

  // Shared single-response path (used for search)
  async function doFetch(url) {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const generation = ++fetchGenerationRef.current;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();

      if (generation !== fetchGenerationRef.current || controller.signal.aborted) return;

      if (data.status !== "ok") {
        throw new Error(data.message || "NewsAPI request failed");
      }

      const transformed = (data.articles || [])
        .filter((a) => a.title && a.title !== "[Removed]")
        .map((a, i) => transformArticle(a, i))
        .map(toPublicArticle);

      if (generation !== fetchGenerationRef.current) return;

      setArticles(transformed);
    } catch (err) {
      if (generation !== fetchGenerationRef.current) return;
      if (isAbortError(err)) return;
      console.error("NewsAPI error:", err);
      setError(err.message);
    } finally {
      if (generation === fetchGenerationRef.current) {
        setLoading(false);
      }
    }
  }

  return { articles, loading, error };
}
