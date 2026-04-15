// Paste a URL to fetch metadata and show the article in the feed like NewsAPI items.

import { useState } from "react";
import {
  fetchArticleFromUrl,
  buildPastedArticle,
  normalizeArticleUrl,
} from "../api/linkPreviewArticle";

export default function PasteArticleLink({ onArticleAdded }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  async function handleFetch(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const article = await fetchArticleFromUrl(url);
      onArticleAdded(article);
      setUrl("");
      setShowManual(false);
      setManualTitle("");
      setManualDescription("");
    } catch (err) {
      setError(err.message || "Could not load preview");
      setShowManual(true);
      if (!manualTitle.trim()) {
        try {
          setManualTitle(new URL(normalizeArticleUrl(url)).hostname.replace(/^www\./, ""));
        } catch {
          setManualTitle("");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handleManualAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      const canonical = normalizeArticleUrl(url);
      const article = buildPastedArticle({
        canonicalUrl: canonical,
        title: manualTitle.trim() || "Untitled",
        description: manualDescription.trim(),
      });
      onArticleAdded(article);
      setUrl("");
      setShowManual(false);
      setManualTitle("");
      setManualDescription("");
    } catch (err) {
      setError(err.message || "Invalid URL");
    }
  }

  return (
    <div className="rounded-2xl border border-sky-500/15 bg-gradient-to-br from-sky-500/[0.06] to-transparent p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15">
          <svg className="h-4 w-4 text-sky-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 6.364 6.364l-3.465 3.465a4.5 4.5 0 0 1-6.364 0 4.5 4.5 0 0 1 0-6.364l1.06-1.06m-.53 2.47 2.47-2.47a4.5 4.5 0 0 1 6.364 6.364l-3.465 3.465a4.5 4.5 0 0 1-6.364 0 4.5 4.5 0 0 1 0-6.364l1.06-1.06"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Add your own article</h3>
          <p className="text-[11px] text-slate-500">
            Paste a link — it appears in the feed so you can save, tag, battle, and run AI profiles like any story.
          </p>
        </div>
      </div>

      <form onSubmit={handleFetch} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          type="text"
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0c0c14] px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="shrink-0 rounded-xl border border-sky-500/35 bg-sky-500/15 px-4 py-2.5 text-xs font-bold tracking-wide text-sky-200 transition-all hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Fetching…" : "Add to feed"}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-[12px] text-amber-400/90">
          {error}{" "}
          {showManual ? (
            <>
              You can fill in title and description below and add it anyway.
            </>
          ) : null}
        </p>
      )}

      {showManual && url.trim() && (
        <form onSubmit={handleManualAdd} className="mt-3 space-y-2 rounded-xl border border-white/[0.06] bg-black/20 p-3">
          <p className="text-[11px] font-medium text-slate-500">Manual entry</p>
          <input
            type="text"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-white/[0.08] bg-[#0c0c14] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/40 focus:outline-none"
          />
          <textarea
            value={manualDescription}
            onChange={(e) => setManualDescription(e.target.value)}
            placeholder="Short description or excerpt (optional)"
            rows={3}
            className="w-full resize-y rounded-lg border border-white/[0.08] bg-[#0c0c14] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/40 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg border border-violet-500/35 bg-violet-500/15 px-3 py-2 text-[11px] font-bold text-violet-200 hover:bg-violet-500/25"
          >
            Add to feed without preview
          </button>
        </form>
      )}
    </div>
  );
}
