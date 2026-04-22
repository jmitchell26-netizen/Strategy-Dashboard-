// SplashScreen.jsx — Entry screen displayed on every load. Dismiss to open the dashboard.

import { useEffect, useState } from "react";

const FEATURES = [
  {
    id: "feed",
    label: "Live Research Feed",
    desc: "Real-time news across 9 categories with one-click saves to your matrix.",
  },
  {
    id: "profiles",
    label: "AI Company Profiles",
    desc: "Deep intelligence reports with 6-dimension signal scores and analyst rationale.",
  },
  {
    id: "briefing",
    label: "Morning Briefing",
    desc: "AI-synthesised daily digest of your live feed — themes, signals, companies to watch.",
  },
  {
    id: "thesis",
    label: "Thesis Builder",
    desc: "Group saved articles into investment theses. AI synthesises evidence for and against.",
  },
  {
    id: "trends",
    label: "Trends & Analytics",
    desc: "Category volume, sentiment timelines, and save-activity charts from your research.",
  },
  {
    id: "comparison",
    label: "Comparison Lab",
    desc: "Overlay radar charts and score tables for up to four AI-profiled companies.",
  },
];

function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-[11px] tabular-nums text-stone-600">
      {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
    </span>
  );
}

export default function SplashScreen({ onEnter }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950">

      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-stone-800/80 px-6 py-3 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-amber-700/40 bg-amber-500/10">
            <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
            </svg>
          </div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
            Strategy Research Dashboard
          </span>
        </div>
        <LiveClock />
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 items-center justify-center overflow-auto px-6 py-12 sm:px-10">
        <div className="w-full max-w-2xl">

          {/* Headline block */}
          <div className="mb-10">
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-600/80">
              Research Intelligence Platform
            </p>
            <h1 className="text-[2.2rem] font-bold leading-[1.15] tracking-tight text-stone-50 sm:text-5xl">
              Built for serious<br />
              strategic research.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-stone-500">
              Monitor live news, build deep company profiles with AI signal scores,
              and organise your thinking into investment theses — all in one environment.
            </p>
          </div>

          {/* Feature list */}
          <div className="mb-10 border-t border-stone-800">
            {FEATURES.map((f, i) => (
              <div
                key={f.id}
                className="flex items-start gap-5 border-b border-stone-800/60 py-3.5"
              >
                <span className="w-5 shrink-0 pt-[1px] font-mono text-[11px] tabular-nums text-stone-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="w-44 shrink-0 text-[13px] font-semibold text-stone-300">{f.label}</span>
                  <span className="text-[13px] leading-snug text-stone-600">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-5">
            <button
              onClick={onEnter}
              className="group flex items-center gap-2.5 rounded-xl border border-amber-700/60 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-300 transition-all hover:border-amber-600 hover:bg-amber-500/20 hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
            >
              Open Dashboard
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <span className="text-[12px] text-stone-700">{today}</span>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex shrink-0 items-center justify-between border-t border-stone-800/80 px-6 py-3 sm:px-10">
        <div className="flex items-center gap-4">
          {["Groq", "Ollama", "NewsAPI", "Recharts"].map((t) => (
            <span key={t} className="font-mono text-[10px] text-stone-700">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[10px] text-emerald-600">Live feed ready</span>
        </div>
      </div>

    </div>
  );
}
