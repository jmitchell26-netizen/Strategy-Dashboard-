// App.jsx — Root component of the Strategy Research Dashboard.
// Manages all top-level state: search query, saved items, Battle View selection.
// Renders the two-column layout: Live News Feed (left) and Saved Strategy Matrix (right).

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import SearchBar from "./components/SearchBar";
import PasteArticleLink from "./components/PasteArticleLink";
import NewsCard from "./components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import StrategyMatrix from "./components/StrategyMatrix";
import CompanyProfilesPanel from "./components/CompanyProfilesPanel";
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
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.map((item) => ({
            ...item,
            companyName: item.companyName ?? "",
          }))
        : [];
    } catch {
      return [];
    }
  });

  // Sync savedItems to localStorage every time the array changes (add, remove, or edit notes)
  useEffect(() => {
    localStorage.setItem("savedStrategies", JSON.stringify(savedItems));
  }, [savedItems]);

  // --- AI company profiles (keyed by normalized company name; see CompanyProfilesPanel) ---
  const [companyProfiles, setCompanyProfiles] = useState(() => {
    try {
      const stored = localStorage.getItem("companyProfiles");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("companyProfiles", JSON.stringify(companyProfiles));
  }, [companyProfiles]);

  // --- NewsAPI hook ---
  // Fetches live articles from NewsAPI based on the search query.
  // Returns the articles array, a loading flag, and any error message.
  const { articles, loading, error } = useNews(query);

  // Pasted URLs (same article shape as the feed); persisted so they survive refresh.
  const [pastedArticles, setPastedArticles] = useState(() => {
    try {
      const stored = localStorage.getItem("pastedFeedArticles");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("pastedFeedArticles", JSON.stringify(pastedArticles));
  }, [pastedArticles]);

  // Merged feed: pasted first (newest paste on top), then NewsAPI items excluding duplicate URLs.
  const feedArticles = useMemo(() => {
    const pastedUrls = new Set(pastedArticles.map((a) => (a.url || "").toLowerCase()));
    const rest = articles.filter((a) => !pastedUrls.has((a.url || "").toLowerCase()));
    return [...pastedArticles, ...rest];
  }, [pastedArticles, articles]);

  function handlePastedArticleAdded(article) {
    setPastedArticles((prev) => {
      const u = (article.url || "").toLowerCase();
      const without = prev.filter(
        (a) => a.id !== article.id && (a.url || "").toLowerCase() !== u
      );
      return [article, ...without];
    });
  }

  function handleRemovePastedFromFeed(id) {
    setPastedArticles((prev) => prev.filter((a) => a.id !== id));
  }

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
    if (savedIds.has(item.id)) return;
    setSavedItems((prev) => [{ ...item, notes: "", companyName: "" }, ...prev]);
    toast.success("Saved to matrix", {
      description: item.title.slice(0, 72) + (item.title.length > 72 ? "…" : ""),
    });
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

  function handleUpdateCompany(id, companyName) {
    setSavedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, companyName } : item))
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
    <div className="min-h-screen bg-zinc-950">

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ===== Header ===== */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
              <svg className="h-4.5 w-4.5 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Strategy Research Dashboard
              </h1>
              <p className="text-xs text-zinc-500">
                Search companies · clip intelligence · run AI profiles
              </p>
            </div>
          </div>
          <Separator className="mt-6 bg-zinc-800" />
        </header>

        {/* ===== Search + Paste row ===== */}
        <div className="mb-8 space-y-3">
          <SearchBar query={query} onChange={setQuery} />
          <PasteArticleLink onArticleAdded={handlePastedArticleAdded} />
        </div>

        {/* ===== Two-column layout ===== */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* ===== LEFT COLUMN: Live News Feed ===== */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <h2 className="text-sm font-semibold text-zinc-300">Live Feed</h2>
              <span className="ml-auto rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-400">
                {feedArticles.length}
              </span>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">
                <span className="font-semibold">API Error:</span> {error}
              </div>
            )}

            <div className="space-y-3">
              {loading && feedArticles.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-24 bg-zinc-800" />
                      <Skeleton className="h-4 w-20 bg-zinc-800" />
                    </div>
                    <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                    <Skeleton className="h-3 w-full bg-zinc-800" />
                    <Skeleton className="h-3 w-5/6 bg-zinc-800" />
                    <div className="flex justify-between pt-1">
                      <Skeleton className="h-3 w-16 bg-zinc-800" />
                      <Skeleton className="h-7 w-28 bg-zinc-800" />
                    </div>
                  </div>
                ))
              ) : feedArticles.length > 0 ? (
                <>
                  {loading && (
                    <div className="rounded-lg border border-emerald-900 bg-emerald-950/50 px-3 py-2 text-center text-[11px] text-emerald-400">
                      Updating feed…
                    </div>
                  )}
                  {feedArticles.map((item) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      onSave={handleSave}
                      isSaved={savedIds.has(item.id)}
                      onRemoveFromFeed={
                        item.sourceType === "pasted-link"
                          ? () => handleRemovePastedFromFeed(item.id)
                          : undefined
                      }
                    />
                  ))}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center">
                  <p className="text-sm text-zinc-600">
                    {query ? <>No results for "<span className="text-zinc-400">{query}</span>"</> : "No articles available right now"}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ===== RIGHT COLUMN: Saved Strategy Matrix ===== */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
              </svg>
              <h2 className="text-sm font-semibold text-zinc-300">Saved Strategies</h2>
              <span className="ml-auto rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-400">
                {savedItems.length}
              </span>
            </div>

            {/* Sticky container so the matrix stays visible while scrolling the news feed */}
            <div className="sticky top-8">
              <StrategyMatrix
                items={savedItems}
                onRemove={handleRemove}
                onUpdateNotes={handleUpdateNotes}
                onUpdateCompany={handleUpdateCompany}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onCompare={handleCompare}
              />
            </div>

            <CompanyProfilesPanel
              savedItems={savedItems}
              companyProfiles={companyProfiles}
              onProfilesChange={setCompanyProfiles}
            />
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
