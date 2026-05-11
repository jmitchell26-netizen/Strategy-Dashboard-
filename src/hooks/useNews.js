// useNews.js — Fetches live news from Currents API (currentsapi.services).
// Works on any deployed domain. Free tier: 600 req/day, up to 200 articles per request.
// Default feed: 3 parallel category requests merged into one feed.
// With a query: debounces 500ms, then runs a keyword search.

import { useState, useEffect, useRef } from "react";
import {
  hashString,
  guessCategory,
  cleanContentSnippet,
  deriveShortSummary,
} from "../utils/articleUtils";

const API_KEY = import.meta.env.VITE_CURRENTS_API_KEY;
const BASE_URL = "https://api.currentsapi.services/v1";
const LIMIT = 10;

// Convert a Currents API article to the shape the app expects.
// Currents uses "news" array, "published" (not publishedAt), category as array, no source object.
function transformArticle(article, index) {
  const key = article.url || `${article.title || ""}-${article.published || ""}`;
  const description =
    article.description || cleanContentSnippet(article.content || "").slice(0, 500) || "No description available.";
  let shortSummary = deriveShortSummary(description, article.content);
  if (shortSummary) {
    const dNorm = description.replace(/\s+/g, " ").trim();
    const sNorm = shortSummary.replace(/\s+/g, " ").trim();
    if (sNorm.length >= dNorm.length * 0.92) shortSummary = "";
  }

  // Currents "published" format: "2024-01-01 12:00:00 +0000" — convert to ISO so sorting works
  const publishedAt = article.published
    ? new Date(article.published).toISOString()
    : new Date().toISOString();

  return {
    id: article.url ? `art-${hashString(article.url)}` : `art-${hashString(key)}-${index}`,
    title: article.title || "Untitled",
    source: article.author || extractDomain(article.url) || "Unknown",
    date: publishedAt.split("T")[0],
    category: guessCategory(article.title || "", article.description || ""),
    summary: description,
    shortSummary: shortSummary || "",
    url: article.url,
    publishedAt,
  };
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function toPublicArticle(t) {
  const { publishedAt: _p, ...rest } = t;
  return rest;
}

function mergeAndSortRawArticles(lists) {
  const seen = new Set();
  const merged = [];
  for (const list of lists) {
    for (const a of list) {
      if (!a.title) continue;
      const key = (a.url && a.url.trim()) || `${a.title}|${a.published || ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(a);
    }
  }
  merged.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
  return merged;
}

function isAbortError(err) {
  if (!err) return false;
  if (err.name === "AbortError") return true;
  return /aborted|AbortError/i.test(String(err.message || ""));
}

export default function useNews(query) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const fetchGenerationRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const searchTerm = query.trim();

    if (!searchTerm) {
      fetchTopHeadlines();
      return;
    }

    debounceRef.current = setTimeout(() => fetchSearch(searchTerm), 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  async function fetchTopHeadlines() {
    if (!API_KEY) {
      setError("Currents API key not configured. Add VITE_CURRENTS_API_KEY to your .env file.");
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const generation = ++fetchGenerationRef.current;

    const key = encodeURIComponent(API_KEY);
    const urls = [
      `${BASE_URL}/latest-news?language=en&category=business&apiKey=${key}`,
      `${BASE_URL}/latest-news?language=en&category=technology&apiKey=${key}`,
      `${BASE_URL}/latest-news?language=en&category=finance&apiKey=${key}`,
    ];

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        urls.map((url) => fetch(url, { signal: controller.signal }).then((r) => r.json()))
      );

      if (generation !== fetchGenerationRef.current || controller.signal.aborted) return;

      const rawLists = [];
      const errors = [];

      for (const result of results) {
        if (result.status === "fulfilled") {
          const data = result.value;
          console.log("Currents API response:", JSON.stringify(data).slice(0, 300));
          if (data.status === "ok" && Array.isArray(data.news)) {
            rawLists.push(data.news);
          } else {
            const msg = data.message || data.error || `Unexpected response: ${JSON.stringify(data).slice(0, 120)}`;
            errors.push(msg);
          }
        } else if (!isAbortError(result.reason)) {
          errors.push(result.reason?.message || "Request failed");
        }
      }

      if (generation !== fetchGenerationRef.current || controller.signal.aborted) return;

      if (rawLists.length === 0) {
        throw new Error(errors[0] || "Currents API returned no articles");
      }

      const transformed = mergeAndSortRawArticles(rawLists)
        .map((a, i) => transformArticle(a, i))
        .map(toPublicArticle);

      if (generation !== fetchGenerationRef.current) return;
      setArticles(transformed);

      if (errors.length > 0) console.warn("Some Currents API feeds failed:", errors);
    } catch (err) {
      if (generation !== fetchGenerationRef.current) return;
      if (isAbortError(err)) return;
      console.error("Currents API error:", err);
      setError(err.message);
    } finally {
      if (generation === fetchGenerationRef.current) setLoading(false);
    }
  }

  async function fetchSearch(q) {
    if (!API_KEY) {
      setError("Currents API key not configured. Add VITE_CURRENTS_API_KEY to your .env file.");
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const generation = ++fetchGenerationRef.current;

    const url = `${BASE_URL}/search?keywords=${encodeURIComponent(q)}&language=en&apiKey=${encodeURIComponent(API_KEY)}`;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();

      if (generation !== fetchGenerationRef.current || controller.signal.aborted) return;

      if (data.status !== "ok") {
        throw new Error(data.message || "Currents API search failed");
      }

      const transformed = (data.news || [])
        .map((a, i) => transformArticle(a, i))
        .map(toPublicArticle);

      if (generation !== fetchGenerationRef.current) return;
      setArticles(transformed);
    } catch (err) {
      if (generation !== fetchGenerationRef.current) return;
      if (isAbortError(err)) return;
      console.error("Currents API error:", err);
      setError(err.message);
    } finally {
      if (generation === fetchGenerationRef.current) setLoading(false);
    }
  }

  return { articles, loading, error };
}
