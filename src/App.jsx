// App.jsx — Root component of the Strategy Research Dashboard.
// Manages all top-level state: search query, saved items, Battle View selection.
// Renders the two-column layout: Live News Feed (left) and Saved Strategy Matrix (right).

import { useState, useMemo, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import NewsCard from "./components/NewsCard";
import StrategyMatrix from "./components/StrategyMatrix";
import BattleView from "./components/BattleView";
import useNews from "./hooks/useNews";

function App() {
  // --- Search state ---
  // The current text in the search bar; passed to useNews to fetch matching articles
  const [query, setQuery] = useState("");

  // --- Saved strategies state ---
  // Initialize from localStorage so saved items persist across page refreshes.
  // Uses a lazy initializer (function passed to useState) so localStorage is only read once on mount.
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const stored = localStorage.getItem("savedStrategies");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync savedItems to localStorage every time the array changes (add, remove, or edit notes)
  useEffect(() => {
    localStorage.setItem("savedStrategies", JSON.stringify(savedItems));
  }, [savedItems]);

  // --- NewsAPI hook ---
  // Fetches live articles from NewsAPI based on the search query.
  // Returns the articles array, a loading flag, and any error message.
  const { articles, loading, error } = useNews(query);

  // --- Derived state ---
  // A Set of IDs for items already saved to the matrix.
  // Used to disable the "Save to Matrix" button on already-saved news cards.
  const savedIds = useMemo(
    () => new Set(savedItems.map((item) => item.id)),
    [savedItems]
  );

  // --- Handlers ---

  // Save a news article to the strategy matrix (adds an empty "notes" field)
  function handleSave(item) {
    if (savedIds.has(item.id)) return; // Prevent duplicates
    setSavedItems((prev) => [{ ...item, notes: "" }, ...prev]); // Prepend to top of list
  }

  // Remove a saved item from the matrix by its ID
  function handleRemove(id) {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  }

  // Update the "Research Notes" text for a specific saved item
  function handleUpdateNotes(id, notes) {
    setSavedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  }

  // --- Battle View (comparison) state ---
  // selectedIds: a Set holding up to 2 item IDs that the user has checked for comparison
  const [selectedIds, setSelectedIds] = useState(new Set());
  // battlePair: when set to [itemA, itemB], the BattleView modal opens
  const [battlePair, setBattlePair] = useState(null);

  // Toggle an item's selection checkbox (max 2 selected at a time)
  function handleToggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);         // Uncheck: remove from selection
      } else {
        if (next.size >= 2) return prev; // Already have 2 selected — ignore
        next.add(id);            // Check: add to selection
      }
      return next;
    });
  }

  // Open the Battle View modal with the two selected items
  function handleCompare() {
    if (selectedIds.size !== 2) return; // Safety check
    const [idA, idB] = [...selectedIds];
    const a = savedItems.find((item) => item.id === idA);
    const b = savedItems.find((item) => item.id === idB);
    if (a && b) setBattlePair([a, b]);
  }

  // Close the Battle View modal and clear the selection
  function handleCloseBattle() {
    setBattlePair(null);
    setSelectedIds(new Set());
  }

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ===== Animated background orbs =====
          Three large, blurred circles that slowly float around behind the content.
          They create an ambient aurora-like glow effect. */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="animate-float absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="animate-float-delayed absolute top-1/3 -right-24 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="animate-float absolute -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-emerald-600/10 blur-[110px]" />
      </div>

      {/* Subtle noise texture overlay for visual depth */}
      <div className="noise-overlay pointer-events-none fixed inset-0 -z-10 opacity-50" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ===== Header ===== */}
        <header className="animate-fade-in mb-10">
          <div className="mb-1 flex items-center gap-3">
            {/* Gradient icon badge */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
              </svg>
            </div>
            {/* Title with gradient text effect */}
            <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              Strategy Research Dashboard
            </h1>
          </div>
          <p className="mt-2 pl-[52px] text-sm font-medium text-slate-500">
            Search companies, review live intelligence, and curate your strategy matrix.
          </p>
        </header>

        {/* ===== Search Bar ===== */}
        <div className="animate-slide-up mb-10" style={{ animationDelay: "0.1s" }}>
          <SearchBar query={query} onChange={setQuery} />
        </div>

        {/* ===== Two-column layout ===== */}
        <div className="grid gap-8 lg:grid-cols-2">

          {/* ===== LEFT COLUMN: Live News Feed ===== */}
          <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {/* Section header with animated "Live" indicator dot */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
                {/* Pinging green dot animation */}
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-semibold tracking-wide text-emerald-400 uppercase">
                  Live
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">News Feed</h2>
              {/* Article count badge */}
              <span className="ml-auto rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-0.5 text-xs font-semibold tabular-nums text-slate-400">
                {articles.length}
              </span>
            </div>

            {/* API error banner — only shows when there's an error from NewsAPI */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                <span className="font-semibold">API Error:</span> {error}
              </div>
            )}

            {/* News articles list — shows skeleton loaders, articles, or empty state */}
            <div className="space-y-4">
              {loading ? (
                // Skeleton loading placeholders (4 pulsing cards while the API responds)
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5"
                  >
                    <div className="mb-3 flex justify-between">
                      <div className="h-5 w-24 rounded-full bg-white/[0.05]" />
                      <div className="h-4 w-20 rounded bg-white/[0.04]" />
                    </div>
                    <div className="mb-2 h-4 w-3/4 rounded bg-white/[0.06]" />
                    <div className="mb-1 h-3 w-full rounded bg-white/[0.03]" />
                    <div className="mb-4 h-3 w-5/6 rounded bg-white/[0.03]" />
                    <div className="flex justify-between">
                      <div className="h-3 w-16 rounded bg-white/[0.04]" />
                      <div className="h-7 w-28 rounded-xl bg-white/[0.04]" />
                    </div>
                  </div>
                ))
              ) : articles.length > 0 ? (
                // Render each news article as a card with staggered entrance animation
                articles.map((item, i) => (
                  <div
                    key={item.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${0.05 + i * 0.04}s` }}
                  >
                    <NewsCard
                      item={item}
                      onSave={handleSave}
                      isSaved={savedIds.has(item.id)}
                    />
                  </div>
                ))
              ) : (
                // Empty state when no articles match the search
                <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30 py-16 text-center backdrop-blur-sm">
                  <p className="text-sm font-medium text-slate-600">
                    {query
                      ? <>No results for "<span className="text-slate-400">{query}</span>"</>
                      : "No articles available right now"}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ===== RIGHT COLUMN: Saved Strategy Matrix ===== */}
          <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {/* Section header with grid icon */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1">
                <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
                </svg>
                <span className="text-xs font-semibold tracking-wide text-violet-400 uppercase">
                  Matrix
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">Saved Strategies</h2>
              {/* Saved item count badge */}
              <span className="ml-auto rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-0.5 text-xs font-semibold tabular-nums text-slate-400">
                {savedItems.length}
              </span>
            </div>

            {/* Sticky container so the matrix stays visible while scrolling the news feed */}
            <div className="sticky top-8">
              <StrategyMatrix
                items={savedItems}
                onRemove={handleRemove}
                onUpdateNotes={handleUpdateNotes}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onCompare={handleCompare}
              />
            </div>
          </section>
        </div>
      </div>

      {/* ===== Battle View Modal =====
          Renders as a full-screen overlay when the user selects 2 items and clicks "Battle View".
          Shows side-by-side comparison with animated metric bars. */}
      {battlePair && (
        <BattleView itemA={battlePair[0]} itemB={battlePair[1]} onClose={handleCloseBattle} />
      )}
    </div>
  );
}

export default App;
