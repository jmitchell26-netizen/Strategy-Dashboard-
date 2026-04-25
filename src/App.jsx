// App.jsx — Navigation shell. Owns all shared state and renders the active tab.

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import BattleView from "./components/BattleView";
import SplashScreen from "./components/SplashScreen";
import useNews from "./hooks/useNews";
import ResearchTab from "./tabs/ResearchTab";
import BriefingTab from "./tabs/BriefingTab";
import WatchlistTab from "./tabs/WatchlistTab";
import TrendsTab from "./tabs/TrendsTab";
import TimelineTab from "./tabs/TimelineTab";
import ComparisonLabTab from "./tabs/ComparisonLabTab";
import ReportsTab from "./tabs/ReportsTab";
import ThesisBuilderTab from "./tabs/ThesisBuilderTab";

const NAV_TABS = [
  { id: "research",    label: "Research" },
  { id: "briefing",    label: "Briefing" },
  { id: "watchlist",   label: "Watchlist" },
  { id: "trends",      label: "Trends" },
  { id: "timeline",    label: "Timeline" },
  { id: "comparison",  label: "Comparison Lab" },
  { id: "reports",     label: "Reports" },
  { id: "thesis",      label: "Thesis Builder" },
];

function ls(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("research");

  // ── Feed state ────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const { articles, loading, error } = useNews(query);

  const [pastedArticles, setPastedArticles] = useState(() => ls("pastedFeedArticles", []));
  useEffect(() => { localStorage.setItem("pastedFeedArticles", JSON.stringify(pastedArticles)); }, [pastedArticles]);

  const feedArticles = useMemo(() => {
    const pastedUrls = new Set(pastedArticles.map((a) => (a.url || "").toLowerCase()));
    return [...pastedArticles, ...articles.filter((a) => !pastedUrls.has((a.url || "").toLowerCase()))];
  }, [pastedArticles, articles]);

  // ── Saved items ───────────────────────────────────────────────
  const [savedItems, setSavedItems] = useState(() => {
    const raw = ls("savedStrategies", []);
    return Array.isArray(raw)
      ? raw.map((item) => ({ ...item, companyName: item.companyName ?? "", savedAt: item.savedAt ?? item.date ?? new Date().toISOString() }))
      : [];
  });
  useEffect(() => { localStorage.setItem("savedStrategies", JSON.stringify(savedItems)); }, [savedItems]);

  const savedIds = useMemo(() => new Set(savedItems.map((i) => i.id)), [savedItems]);

  // ── AI company profiles ───────────────────────────────────────
  const [companyProfiles, setCompanyProfiles] = useState(() => ls("companyProfiles", {}));
  useEffect(() => { localStorage.setItem("companyProfiles", JSON.stringify(companyProfiles)); }, [companyProfiles]);

  // ── Watchlist ─────────────────────────────────────────────────
  const [watchlist, setWatchlist] = useState(() => ls("watchlist", []));
  useEffect(() => { localStorage.setItem("watchlist", JSON.stringify(watchlist)); }, [watchlist]);

  // ── Theses ────────────────────────────────────────────────────
  const [theses, setTheses] = useState(() => ls("theses", []));
  useEffect(() => { localStorage.setItem("theses", JSON.stringify(theses)); }, [theses]);

  // ── Morning briefing ──────────────────────────────────────────
  const [briefing, setBriefing] = useState(() => ls("morningBriefing", null));
  useEffect(() => { if (briefing) localStorage.setItem("morningBriefing", JSON.stringify(briefing)); }, [briefing]);

  // ── Battle view ───────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [battlePair, setBattlePair] = useState(null);

  // ── Handlers ──────────────────────────────────────────────────
  function handlePasteArticle(article) {
    setPastedArticles((prev) => {
      const u = (article.url || "").toLowerCase();
      return [article, ...prev.filter((a) => a.id !== article.id && (a.url || "").toLowerCase() !== u)];
    });
  }
  function handleRemovePasted(id) { setPastedArticles((prev) => prev.filter((a) => a.id !== id)); }

  function handleSave(item) {
    if (savedIds.has(item.id)) return;
    setSavedItems((prev) => [{ ...item, notes: "", companyName: "", savedAt: new Date().toISOString() }, ...prev]);
    toast.success("Saved to matrix", { description: item.title.slice(0, 72) + (item.title.length > 72 ? "…" : "") });
  }
  function handleRemove(id) { setSavedItems((prev) => prev.filter((i) => i.id !== id)); }
  function handleUpdateNotes(id, notes) { setSavedItems((prev) => prev.map((i) => i.id === id ? { ...i, notes } : i)); }
  function handleUpdateCompany(id, companyName) { setSavedItems((prev) => prev.map((i) => i.id === id ? { ...i, companyName } : i)); }

  function handleToggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { if (next.size >= 2) return prev; next.add(id); }
      return next;
    });
  }
  function handleCompare() {
    if (selectedIds.size !== 2) return;
    const [idA, idB] = [...selectedIds];
    const a = savedItems.find((i) => i.id === idA);
    const b = savedItems.find((i) => i.id === idB);
    if (a && b) setBattlePair([a, b]);
  }
  function handleCloseBattle() { setBattlePair(null); setSelectedIds(new Set()); }

  // ── Badge counts for nav ──────────────────────────────────────
  const navBadges = {
    research:   feedArticles.length,
    watchlist:  watchlist.length || null,
    timeline:   savedItems.length || null,
    thesis:     theses.length || null,
    comparison: Object.values(companyProfiles).filter((p) => p?.summary).length || null,
  };

  if (splashVisible) {
    return <SplashScreen onEnter={() => setSplashVisible(false)} />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="border-b border-stone-200 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 bg-white">
                <svg className="h-4.5 w-4.5 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              </div>
              <div>
                <h1 className="text-[15px] font-bold tracking-tight text-stone-900">Strategy Research Dashboard</h1>
                <p className="text-[11px] text-stone-400">Search companies · clip intelligence · run AI profiles</p>
              </div>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-emerald-700">Live</span>
            </div>
          </div>
        </header>

        {/* ── Navigation tabs ─────────────────────────────────── */}
        <div className="border-b border-stone-200">
          <ScrollArea className="w-full">
            <nav className="flex">
              {NAV_TABS.map((tab) => {
                const badge = navBadges[tab.id];
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-amber-700 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-amber-600"
                        : "text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    {tab.label}
                    {badge != null && (
                      <span className={`ml-1.5 text-[10px] tabular-nums ${isActive ? "text-amber-600" : "text-stone-300"}`}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <ScrollBar orientation="horizontal" className="h-0" />
          </ScrollArea>
        </div>

        {/* ── Tab content ─────────────────────────────────────── */}
        <div className="py-8">
          {activeTab === "research" && (
            <ResearchTab
              query={query} setQuery={setQuery}
              feedArticles={feedArticles} loading={loading} error={error}
              savedItems={savedItems} savedIds={savedIds}
              companyProfiles={companyProfiles} onProfilesChange={setCompanyProfiles}
              onSave={handleSave} onRemove={handleRemove}
              onUpdateNotes={handleUpdateNotes} onUpdateCompany={handleUpdateCompany}
              onPasteArticle={handlePasteArticle} onRemovePasted={handleRemovePasted}
              selectedIds={selectedIds} onToggleSelect={handleToggleSelect}
              onCompare={handleCompare} battlePair={battlePair} onCloseBattle={handleCloseBattle}
            />
          )}
          {activeTab === "briefing" && (
            <BriefingTab feedArticles={feedArticles} briefing={briefing} setBriefing={setBriefing} />
          )}
          {activeTab === "watchlist" && (
            <WatchlistTab watchlist={watchlist} setWatchlist={setWatchlist} feedArticles={feedArticles} />
          )}
          {activeTab === "trends" && (
            <TrendsTab feedArticles={feedArticles} savedItems={savedItems} />
          )}
          {activeTab === "timeline" && (
            <TimelineTab savedItems={savedItems} onRemove={handleRemove} onUpdateNotes={handleUpdateNotes} onUpdateCompany={handleUpdateCompany} />
          )}
          {activeTab === "comparison" && (
            <ComparisonLabTab companyProfiles={companyProfiles} />
          )}
          {activeTab === "reports" && (
            <ReportsTab savedItems={savedItems} companyProfiles={companyProfiles} />
          )}
          {activeTab === "thesis" && (
            <ThesisBuilderTab savedItems={savedItems} theses={theses} setTheses={setTheses} />
          )}
        </div>

      </div>

      {battlePair && (
        <BattleView itemA={battlePair[0]} itemB={battlePair[1]} onClose={handleCloseBattle} />
      )}
    </div>
  );
}

export default App;
