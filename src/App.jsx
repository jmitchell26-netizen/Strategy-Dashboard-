import { useState, useMemo } from "react";
import SearchBar from "./components/SearchBar";
import NewsCard from "./components/NewsCard";
import StrategyMatrix from "./components/StrategyMatrix";
import { placeholderNews } from "./data/placeholderNews";

function App() {
  const [query, setQuery] = useState("");
  const [savedItems, setSavedItems] = useState([]);

  const filteredNews = useMemo(() => {
    if (!query.trim()) return placeholderNews;
    const lower = query.toLowerCase();
    return placeholderNews.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.source.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        item.summary.toLowerCase().includes(lower)
    );
  }, [query]);

  const savedIds = useMemo(
    () => new Set(savedItems.map((item) => item.id)),
    [savedItems]
  );

  function handleSave(item) {
    if (savedIds.has(item.id)) return;
    setSavedItems((prev) => [item, ...prev]);
  }

  function handleRemove(id) {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="animate-float absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="animate-float-delayed absolute top-1/3 -right-24 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="animate-float absolute -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-emerald-600/10 blur-[110px]" />
      </div>

      {/* Noise texture overlay */}
      <div className="noise-overlay pointer-events-none fixed inset-0 -z-10 opacity-50" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="animate-fade-in mb-10">
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
              </svg>
            </div>
            <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              Strategy Research Dashboard
            </h1>
          </div>
          <p className="mt-2 pl-[52px] text-sm font-medium text-slate-500">
            Search companies, review live intelligence, and curate your strategy matrix.
          </p>
        </header>

        {/* Search */}
        <div className="animate-slide-up mb-10" style={{ animationDelay: "0.1s" }}>
          <SearchBar query={query} onChange={setQuery} />
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left — Live News Feed */}
          <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-semibold tracking-wide text-emerald-400 uppercase">
                  Live
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">News Feed</h2>
              <span className="ml-auto rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-0.5 text-xs font-semibold tabular-nums text-slate-400">
                {filteredNews.length}
              </span>
            </div>

            <div className="space-y-4">
              {filteredNews.length > 0 ? (
                filteredNews.map((item, i) => (
                  <div
                    key={item.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${0.25 + i * 0.06}s` }}
                  >
                    <NewsCard
                      item={item}
                      onSave={handleSave}
                      isSaved={savedIds.has(item.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30 py-16 text-center backdrop-blur-sm">
                  <p className="text-sm font-medium text-slate-600">
                    No results for "<span className="text-slate-400">{query}</span>"
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Right — Saved Strategy Matrix */}
          <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
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
              <span className="ml-auto rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-0.5 text-xs font-semibold tabular-nums text-slate-400">
                {savedItems.length}
              </span>
            </div>

            <div className="sticky top-8">
              <StrategyMatrix items={savedItems} onRemove={handleRemove} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
