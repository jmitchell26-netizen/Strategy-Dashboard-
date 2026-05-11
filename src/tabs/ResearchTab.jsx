// ResearchTab.jsx — The main two-column research view (moved from App.jsx).

import { useState, useMemo, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import PasteArticleLink from "../components/PasteArticleLink";
import NewsCard from "../components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import StrategyMatrix from "../components/StrategyMatrix";
import CompanyProfilesPanel from "../components/CompanyProfilesPanel";

const CATEGORY_COLORS = {
  "Product Strategy": { dot: "bg-violet-400",  active: "text-violet-700 border-violet-300" },
  Expansion:          { dot: "bg-emerald-400", active: "text-emerald-700 border-emerald-300" },
  Financial:          { dot: "bg-sky-400",     active: "text-sky-700 border-sky-300" },
  "Market Entry":     { dot: "bg-amber-400",   active: "text-amber-700 border-amber-300" },
  "R&D":              { dot: "bg-rose-400",    active: "text-rose-700 border-rose-300" },
  "Content Strategy": { dot: "bg-fuchsia-400", active: "text-fuchsia-700 border-fuchsia-300" },
  "Product Launch":   { dot: "bg-cyan-400",    active: "text-cyan-700 border-cyan-300" },
  "M&A":              { dot: "bg-orange-400",  active: "text-orange-700 border-orange-300" },
  General:            { dot: "bg-indigo-400",  active: "text-indigo-700 border-indigo-300" },
};

export default function ResearchTab({
  query, setQuery,
  feedArticles, loading, error,
  savedItems, savedIds,
  companyProfiles, onProfilesChange,
  onSave, onRemove, onUpdateNotes, onUpdateCompany,
  onPasteArticle, onRemovePasted,
  selectedIds, onToggleSelect, onCompare,
}) {
  const [activeCategory, setActiveCategory] = useState("All");

  const feedCategories = useMemo(() => {
    const cats = new Set(feedArticles.map((a) => a.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [feedArticles]);

  const displayedArticles = useMemo(() => {
    if (activeCategory === "All") return feedArticles;
    return feedArticles.filter((a) => a.category === activeCategory);
  }, [feedArticles, activeCategory]);

  // Reset category when the search term changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setActiveCategory("All"); }, [query]);

  return (
    <>
      {/* Search + Paste */}
      <div className="mb-8 space-y-3">
        <SearchBar query={query} onChange={setQuery} />
        <PasteArticleLink onArticleAdded={onPasteArticle} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {/* ── Left: Live News Feed ── */}
        <section>
          <div className="mb-4 flex items-center gap-3 border-b border-stone-200 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 bg-white">
              <svg className="h-3.5 w-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
              </svg>
            </div>
            <h2 className="text-[13px] font-bold tracking-tight text-stone-800">Live News Feed</h2>
            <span className="ml-auto rounded border border-stone-200 bg-white px-2 py-0.5 text-xs font-semibold tabular-nums text-stone-500">
              {displayedArticles.length}
              {activeCategory !== "All" && <span className="text-stone-300"> / {feedArticles.length}</span>}
            </span>
          </div>

          {/* Category tabs */}
          {!loading && feedCategories.length > 0 && (
            <div className="mb-4">
              <ScrollArea className="w-full">
                <div className="flex gap-1 pb-2">
                  <button
                    onClick={() => setActiveCategory("All")}
                    className={`shrink-0 rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeCategory === "All"
                        ? "border-amber-300 bg-amber-50 text-amber-700"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700"
                    }`}
                  >
                    All
                    <span className={`ml-1.5 tabular-nums ${activeCategory === "All" ? "text-amber-600" : "text-stone-300"}`}>
                      {feedArticles.length}
                    </span>
                  </button>
                  {feedCategories.map((cat) => {
                    const cc = CATEGORY_COLORS[cat];
                    const count = feedArticles.filter((a) => a.category === cat).length;
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`shrink-0 flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? `bg-white ${cc?.active ?? "text-stone-700 border-stone-300"}`
                            : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${cc?.dot ?? "bg-stone-400"}`} />
                        {cat}
                        <span className={`tabular-nums ${isActive ? "opacity-60" : "text-stone-300"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" className="h-1" />
              </ScrollArea>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span className="font-semibold">API Error:</span> {error}
            </div>
          )}

          <div className="space-y-2">
            {loading && feedArticles.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded border border-stone-200 bg-white p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 bg-stone-100" />
                    <Skeleton className="h-4 w-20 bg-stone-100" />
                  </div>
                  <Skeleton className="h-4 w-3/4 bg-stone-100" />
                  <Skeleton className="h-3 w-full bg-stone-100" />
                  <Skeleton className="h-3 w-5/6 bg-stone-100" />
                </div>
              ))
            ) : displayedArticles.length > 0 ? (
              <>
                {loading && (
                  <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-[11px] text-emerald-700">
                    Updating feed…
                  </div>
                )}
                {displayedArticles.map((item) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onSave={onSave}
                    isSaved={savedIds.has(item.id)}
                    onRemoveFromFeed={item.sourceType === "pasted-link" ? () => onRemovePasted(item.id) : undefined}
                  />
                ))}
              </>
            ) : (
              <div className="rounded border border-dashed border-stone-200 py-16 text-center">
                <p className="text-sm text-stone-400">
                  {activeCategory !== "All"
                    ? <><span className="text-stone-600">{activeCategory}</span> — no articles in current feed</>
                    : query
                      ? <>No results for "<span className="text-stone-600">{query}</span>"</>
                      : "No articles available right now"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Right: Saved Strategy Matrix ── */}
        <section className="rounded-md border border-stone-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3 border-b border-stone-200 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-amber-200 bg-amber-50">
              <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
              </svg>
            </div>
            <h2 className="text-[13px] font-bold tracking-tight text-stone-800">Saved Strategies</h2>
            <span className="ml-auto rounded border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-stone-500">
              {savedItems.length}
            </span>
          </div>

          <StrategyMatrix
            items={savedItems}
            onRemove={onRemove}
            onUpdateNotes={onUpdateNotes}
            onUpdateCompany={onUpdateCompany}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onCompare={onCompare}
          />

          <CompanyProfilesPanel
            savedItems={savedItems}
            companyProfiles={companyProfiles}
            onProfilesChange={onProfilesChange}
          />
        </section>
      </div>
    </>
  );
}
