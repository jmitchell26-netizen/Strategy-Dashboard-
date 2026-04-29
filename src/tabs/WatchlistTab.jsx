// WatchlistTab.jsx — Track companies and keywords; shows matching articles from the live feed.

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Tiny dots only — same set as category dots used throughout the app
const TERM_DOTS = [
  "bg-amber-400", "bg-sky-400", "bg-violet-400", "bg-emerald-400",
  "bg-rose-400", "bg-cyan-400", "bg-orange-400", "bg-fuchsia-400",
];

function matchesArticle(term, article) {
  const t = term.toLowerCase();
  return (
    (article.title || "").toLowerCase().includes(t) ||
    (article.summary || "").toLowerCase().includes(t) ||
    (article.companyName || "").toLowerCase().includes(t)
  );
}

export default function WatchlistTab({ watchlist, setWatchlist, feedArticles }) {
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [sortMode, setSortMode] = useState("matches-desc");

  function addTermValue(rawTerm) {
    const term = rawTerm.trim();
    if (!term || watchlist.some((w) => w.term.toLowerCase() === term.toLowerCase())) return;
    setWatchlist((prev) => [...prev, { id: Date.now().toString(), term, addedAt: new Date().toISOString(), colorIdx: watchlist.length % TERM_DOTS.length }]);
  }

  function addTerm(e) {
    e.preventDefault();
    addTermValue(input);
    setInput("");
  }

  function removeTerm(id) {
    setWatchlist((prev) => prev.filter((w) => w.id !== id));
    if (expanded === id) setExpanded(null);
  }

  const watchlistWithMatches = useMemo(() =>
    watchlist.map((w) => ({
      ...w,
      matches: feedArticles.filter((a) => matchesArticle(w.term, a)),
    })),
    [watchlist, feedArticles]
  );

  const totalMatches = watchlistWithMatches.reduce((sum, w) => sum + w.matches.length, 0);
  const sortedWatchlist = useMemo(() => {
    const next = [...watchlistWithMatches];
    if (sortMode === "matches-desc") {
      next.sort((a, b) => b.matches.length - a.matches.length || a.term.localeCompare(b.term));
    } else if (sortMode === "matches-asc") {
      next.sort((a, b) => a.matches.length - b.matches.length || a.term.localeCompare(b.term));
    } else if (sortMode === "alpha") {
      next.sort((a, b) => a.term.localeCompare(b.term));
    } else if (sortMode === "recent") {
      next.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    }
    return next;
  }, [watchlistWithMatches, sortMode]);

  const quickSuggestions = useMemo(() => {
    const watched = new Set(watchlist.map((w) => w.term.toLowerCase()));
    const seen = new Set();
    const companies = [];
    for (const a of feedArticles) {
      const name = (a.companyName || "").trim();
      const key = name.toLowerCase();
      if (!name || watched.has(key) || seen.has(key)) continue;
      if (name.length > 32) continue;
      seen.add(key);
      companies.push(name);
      if (companies.length >= 8) break;
    }
    return companies;
  }, [feedArticles, watchlist]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">Watchlist</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">Company & Keyword Monitor</h2>
        <p className="mt-1 text-sm text-stone-500">
          Add terms to watch — matching articles from the live feed appear automatically.
          {watchlist.length > 0 && <span className="ml-2 tabular-nums text-stone-400">{totalMatches} matches across {watchlist.length} terms</span>}
        </p>
      </div>

      {/* Add term form */}
      <form onSubmit={addTerm} className="mb-8 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Company name or keyword (e.g. Apple, AI regulation, chip shortage)"
          className="flex-1 border-stone-200 bg-white text-stone-800 placeholder:text-stone-300 focus-visible:border-amber-400 focus-visible:ring-amber-200"
        />
        <Button type="submit" disabled={!input.trim()}
          className="shrink-0 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40">
          Watch
        </Button>
      </form>

      {quickSuggestions.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-[11px] font-medium text-stone-500">Quick add from feed companies</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => addTermValue(term)}
                className="rounded border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-700 transition-colors hover:border-amber-300 hover:text-amber-700"
              >
                + {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {watchlist.length > 0 && (
        <div className="mb-3 flex items-center justify-end">
          <label className="mr-2 text-[11px] text-stone-500">Sort</label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="rounded border border-stone-200 bg-white px-2.5 py-1 text-[12px] text-stone-700 focus:border-amber-400 focus:outline-none"
          >
            <option value="matches-desc">Most matches</option>
            <option value="matches-asc">Fewest matches</option>
            <option value="recent">Recently added</option>
            <option value="alpha">A-Z</option>
          </select>
        </div>
      )}

      {/* Empty state */}
      {watchlist.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded border border-dashed border-stone-200 py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded border border-stone-200 bg-white">
            <svg className="h-6 w-6 text-stone-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-stone-500">Nothing being watched</p>
          <p className="mt-1 text-xs text-stone-400">Add a company or keyword above to start monitoring the feed.</p>
        </div>
      )}

      {/* Watchlist cards */}
      <div className="space-y-3">
        {sortedWatchlist.map((w) => {
          const dot = TERM_DOTS[w.colorIdx ?? 0];
          const isOpen = expanded === w.id;
          return (
            <div key={w.id} className="rounded border border-stone-200 bg-white overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                <span className="flex-1 text-sm font-semibold text-stone-700">{w.term}</span>
                <Badge variant="outline" className="tabular-nums text-[11px] border-stone-200 bg-stone-50 text-stone-500">
                  {w.matches.length} {w.matches.length === 1 ? "match" : "matches"}
                </Badge>
                <button
                  onClick={() => setExpanded(isOpen ? null : w.id)}
                  className="rounded p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                >
                  <svg className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <button onClick={() => removeTerm(w.id)} className="rounded p-1 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Matching articles */}
              {isOpen && (
                <div className="border-t border-stone-100">
                  {w.matches.length === 0 ? (
                    <p className="px-4 py-3 text-[12px] italic text-stone-400">No matching articles in the current feed.</p>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {w.matches.map((a) => (
                        <div key={a.id} className="px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {a.url ? (
                                <a href={a.url} target="_blank" rel="noopener noreferrer"
                                  className="text-[13px] font-medium text-stone-700 hover:text-amber-700 transition-colors line-clamp-2">
                                  {a.title}
                                </a>
                              ) : (
                                <p className="text-[13px] font-medium text-stone-700 line-clamp-2">{a.title}</p>
                              )}
                              <p className="mt-0.5 text-[11px] text-stone-400">{a.source} · {a.date} · {a.category}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
