// SplashScreen.jsx — Scrollable in-app landing page. Shown on every load; dismiss to open the dashboard.

import { useEffect, useRef } from "react";

/* ─── Scroll-reveal hook ──────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("srd-visible"); obs.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Section label ────────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-600/80">
      {children}
    </p>
  );
}

/* ─── Divider ──────────────────────────────────────────────────────────────── */
function Divider() {
  return <div className="h-px w-full bg-gradient-to-r from-transparent via-stone-800 to-transparent" />;
}

/* ─── App mockup ───────────────────────────────────────────────────────────── */
function AppMockup() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-4 pt-2" data-reveal>
      <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-stone-800 bg-stone-900/80 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          <div className="mx-3 flex-1 rounded border border-stone-800 bg-stone-950 px-3 py-1 text-center font-mono text-[10px] text-stone-600">
            localhost:5173 — Strategy Research Dashboard
          </div>
        </div>

        {/* App header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900/60 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-700/40 bg-amber-500/10 text-sm">📊</div>
            <div>
              <div className="text-[12px] font-bold text-stone-100">Strategy Research Dashboard</div>
              <div className="text-[10px] text-stone-600">Search companies · clip intelligence · run AI profiles</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-800/60 bg-emerald-950/60 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-medium text-emerald-400">Live</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-stone-800 bg-stone-900/40">
          {["Research 130", "Briefing", "Watchlist 3", "Trends", "Timeline 12", "Comparison Lab", "Reports", "Thesis Builder 2"].map((t, i) => (
            <div key={t} className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-[11px] font-medium ${i === 0 ? "border-b-2 border-amber-500 text-amber-400" : "text-stone-600"}`}>{t}</div>
          ))}
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-[1fr_0.7fr] divide-x divide-stone-800">
          {/* Left — news feed */}
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">📰</span>
                <span className="text-[11px] font-bold text-stone-300">Live News Feed</span>
              </div>
              <span className="rounded border border-stone-800 bg-stone-900 px-1.5 py-0.5 font-mono text-[9px] text-stone-500">130</span>
            </div>
            {/* Category tabs */}
            <div className="mb-3 flex gap-1.5 overflow-x-auto">
              {[{l:"All 130",a:true},{l:"Market Entry 4"},{l:"Financial 10"},{l:"Product Strategy"}].map(({l,a})=>(
                <div key={l} className={`shrink-0 rounded-lg border px-2.5 py-1 text-[9px] font-medium ${a ? "border-amber-700/50 bg-amber-500/10 text-amber-300" : "border-stone-800 text-stone-600"}`}>{l}</div>
              ))}
            </div>
            {/* News cards */}
            {[
              {bar:"bg-amber-500",cat:"Market Entry",catColor:"text-amber-400",date:"Apr 19, 2026",title:"Soaring jet fuel prices could threaten your European vacation",saved:true},
              {bar:"bg-sky-500",cat:"Financial",catColor:"text-sky-400",date:"Apr 18, 2026",title:"Fed holds rates — markets brace for Q2 guidance season"},
              {bar:"bg-violet-500",cat:"Product Strategy",catColor:"text-violet-400",date:"Apr 17, 2026",title:"Apple posts $124B revenue — AI services lead growth surge",dim:true},
            ].map((c,i)=>(
              <div key={i} className={`mb-2 overflow-hidden rounded-lg border border-stone-800 bg-stone-900/60 ${c.dim?"opacity-50":""}`}>
                <div className={`h-0.5 w-full ${c.bar}`} />
                <div className="p-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className={`text-[9px] font-semibold ${c.catColor}`}>{c.cat}</span>
                    <span className="text-[9px] text-stone-700">{c.date}</span>
                  </div>
                  <div className="mb-1.5 text-[10px] font-medium leading-snug text-stone-300">{c.title}</div>
                  <div className={`inline-block rounded border px-1.5 py-0.5 text-[8px] font-medium ${c.saved ? "border-amber-700/50 bg-amber-500/10 text-amber-400" : "border-stone-700 text-stone-600"}`}>
                    {c.saved ? "✓ Saved" : "Save to Matrix"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — saved strategies */}
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-300">Saved Strategies</span>
              <span className="rounded border border-stone-800 bg-stone-900 px-1.5 py-0.5 font-mono text-[9px] text-stone-500">2</span>
            </div>
            {[
              {bar:"bg-amber-500",title:"Soaring jet fuel prices could threaten your European vacation",meta:"Market Entry · Washington Post · Apr 19"},
              {bar:"bg-sky-500",title:"Fed holds rates — markets brace for Q2 guidance",meta:"Financial · Bloomberg · Apr 18",dim:true},
            ].map((c,i)=>(
              <div key={i} className={`mb-2 overflow-hidden rounded-lg border border-stone-800 bg-stone-900/60 ${c.dim?"opacity-60":""}`}>
                <div className={`h-0.5 w-full ${c.bar}`} />
                <div className="p-2.5">
                  <div className="mb-1 text-[10px] font-medium leading-snug text-stone-300">{c.title}</div>
                  <div className="mb-2 text-[9px] text-stone-600">{c.meta}</div>
                  <div className="h-5 rounded border border-stone-800 bg-stone-950/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats ────────────────────────────────────────────────────────────────── */
const STATS = [
  { num: "8",    label: "Specialist research tabs" },
  { num: "9+",   label: "AI profile sections" },
  { num: "100%", label: "Free with Groq or local Ollama" },
  { num: "0",    label: "Data sent to servers (local mode)" },
];

/* ─── Core features ────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: "📡", title: "Live News Feed",         desc: "Real-time headlines from NewsAPI, auto-categorised across 9 strategy lenses. Filter the feed by category with live article counts." },
  { icon: "🧠", title: "AI Company Profiles",    desc: "Generate a 9-section intelligence brief per company — Signal Scores (1–10) with an interactive radar chart and AI-written rationale for each rating." },
  { icon: "☀️", title: "Morning Briefing",        desc: "AI-synthesised daily digest built from your live feed. Top stories, key themes, companies to watch, and an editor's take — all in one card." },
  { icon: "📐", title: "Thesis Builder",          desc: "Group saved articles into investment theses. AI synthesises evidence for and against, plus what would have to be true for the thesis to hold." },
  { icon: "📊", title: "Trends & Analytics",      desc: "Category volume, company coverage, save-activity timelines, and keyword-based sentiment charts — all derived from your own research data." },
  { icon: "⚖️", title: "Comparison Lab",          desc: "Overlay radar charts and signal-score tables for up to four AI-profiled companies. Instantly see relative strengths and blind spots." },
];

/* ─── 8 tabs ───────────────────────────────────────────────────────────────── */
const TABS = [
  { n:"01", label:"Research",       desc:"Live news feed, article saving, company profile generation." },
  { n:"02", label:"Briefing",       desc:"AI-generated daily intelligence digest from your feed." },
  { n:"03", label:"Watchlist",      desc:"Monitor companies and keywords; live match counts." },
  { n:"04", label:"Trends",         desc:"Category volume, sentiment timelines, and save-activity charts." },
  { n:"05", label:"Timeline",       desc:"Saved articles in chronological order with week grouping." },
  { n:"06", label:"Comparison Lab", desc:"Side-by-side radar chart comparison of AI-profiled companies." },
  { n:"07", label:"Reports",        desc:"Build and export formatted research reports with AI summaries." },
  { n:"08", label:"Thesis Builder", desc:"Group articles into theses with AI synthesis for and against." },
];

/* ─── How it works ─────────────────────────────────────────────────────────── */
const STEPS = [
  { n:"01", title:"Search a topic or company",         desc:"Enter a query and the live feed pulls real-time headlines from NewsAPI, organised by category." },
  { n:"02", title:"Save intelligence to your matrix",  desc:"One click saves an article. Add a company tag and research notes to build your structured dataset." },
  { n:"03", title:"Generate an AI company profile",    desc:"Tag articles to a company and hit generate — a full 9-section brief with signal scores appears in seconds." },
  { n:"04", title:"Build a thesis around your ideas",  desc:"Move saved articles into a thesis. AI synthesises evidence for and against your hypothesis." },
  { n:"05", title:"Monitor, compare, and report",      desc:"Track keywords on the Watchlist, compare profiles in the Lab, and export polished reports from the Reports tab." },
];

/* ─── Main component ───────────────────────────────────────────────────────── */
export default function SplashScreen({ onEnter }) {
  useReveal();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950">

      {/* ─── Sticky Nav ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-800/80 bg-stone-950/90 px-6 py-3 backdrop-blur-md sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-amber-700/40 bg-amber-500/10 text-xs">📊</div>
          <span className="text-[13px] font-bold text-stone-100">Strategy Dashboard</span>
        </div>
        <div className="hidden items-center gap-6 sm:flex">
          {[["#features","Features"],["#tabs","8 Tabs"],["#how-it-works","How it works"],["#ai","AI Engine"]].map(([href,label])=>(
            <a key={href} href={href} className="text-[13px] text-stone-500 transition-colors hover:text-stone-200">{label}</a>
          ))}
        </div>
        <button
          onClick={onEnter}
          className="rounded-lg border border-amber-700/60 bg-amber-500/10 px-4 py-1.5 text-[13px] font-semibold text-amber-300 transition-all hover:bg-amber-500/20 hover:text-amber-200"
        >
          Open Dashboard →
        </button>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-amber-500/[0.06] blur-3xl" />

        <div className="relative max-w-3xl" data-reveal>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900/60 px-3.5 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-medium text-stone-400">Strategy Research Tool</span>
          </div>

          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-stone-50 sm:text-6xl">
            Your personal<br />intelligence desk
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-stone-500">
            A full research workflow in one professional dashboard — live news, AI intelligence profiles with signal scores, 8 specialist research tabs, and exportable reports.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onEnter}
              className="group flex items-center gap-2 rounded-xl border border-amber-700/60 bg-amber-500/10 px-6 py-3 text-[14px] font-semibold text-amber-300 transition-all hover:border-amber-600 hover:bg-amber-500/20"
            >
              Open Dashboard
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <a href="#features" className="flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900/60 px-6 py-3 text-[14px] font-medium text-stone-400 transition-colors hover:border-stone-700 hover:text-stone-200">
              Explore Features ↓
            </a>
          </div>

          <p className="mt-6 text-[12px] text-stone-700">Scroll to explore ↓</p>
        </div>
      </section>

      {/* ─── App Mockup ─────────────────────────────────────────── */}
      <AppMockup />

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-10" data-reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.num} className="rounded-xl border border-stone-800 bg-stone-900/60 p-5 text-center">
              <div className="text-3xl font-bold text-amber-400">{s.num}</div>
              <div className="mt-1 text-[11px] leading-snug text-stone-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ─── Core Features ──────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center" data-reveal>
          <SectionLabel>Core Features</SectionLabel>
          <h2 className="text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl">
            Everything a strategist<br />needs, built in
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-stone-500">
            From live news ingestion to AI-powered deep dives — the full research workflow in one professional interface.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="rounded-xl border border-stone-800 bg-stone-900/60 p-5 transition-colors hover:border-stone-700" data-reveal>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-stone-800 bg-stone-900 text-lg">
                {f.icon}
              </div>
              <div className="mb-1.5 text-[14px] font-semibold text-stone-200">{f.title}</div>
              <div className="text-[13px] leading-relaxed text-stone-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ─── 8 Research Tabs ────────────────────────────────────── */}
      <section id="tabs" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center" data-reveal>
          <SectionLabel>8 Research Tabs</SectionLabel>
          <h2 className="text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl">One app, eight specialist views</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-stone-500">
            Each tab is purpose-built for a distinct part of the research workflow.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {TABS.map((t) => (
            <div key={t.n} className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
              <div className="mb-2 font-mono text-[10px] font-semibold text-stone-700">{t.n}</div>
              <div className="mb-1 text-[13px] font-semibold text-stone-200">{t.label}</div>
              <div className="text-[12px] leading-relaxed text-stone-600">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ─── How it works ───────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-12 text-center" data-reveal>
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl">From feed to insight in minutes</h2>
        </div>

        <div className="space-y-0" data-reveal>
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex gap-6 border-b border-stone-800 py-6 last:border-b-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-800 bg-stone-900 font-mono text-[11px] font-semibold text-amber-600/80">
                {s.n}
              </div>
              <div>
                <div className="mb-1 text-[14px] font-semibold text-stone-200">{s.title}</div>
                <div className="text-[13px] leading-relaxed text-stone-500">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ─── AI Engine ──────────────────────────────────────────── */}
      <section id="ai" className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div data-reveal>
            <SectionLabel>AI Engine</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl">
              Deep profiles,<br />not summaries
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-stone-500">
              Every company profile is a 9-section investment-grade brief generated by Groq or local Ollama. Signal Scores are rated 1–10 across six strategic dimensions with AI-written rationale for each score, visualised on an interactive radar chart.
            </p>
            <div className="mt-6 space-y-2.5">
              {["Signal Scores with AI-written rationale per dimension","Interactive radar chart overlay in Comparison Lab","Evidence-for and evidence-against thesis synthesis","Executive summaries across multiple company profiles"].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-[13px] text-stone-400">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signal score mock */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6" data-reveal>
            <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600/80">Signal Scores — Apple Inc.</p>
            {[
              { label: "Strategic Momentum",   val: 9 },
              { label: "Market Opportunity",   val: 8 },
              { label: "Competitive Position", val: 9 },
              { label: "Financial Health",     val: 8 },
              { label: "Execution Capability", val: 8 },
              { label: "Risk Exposure",        val: 4 },
            ].map((s) => (
              <div key={s.label} className="mb-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[12px] text-stone-400">{s.label}</span>
                  <span className="font-mono text-[12px] font-semibold text-stone-300">{s.val}<span className="text-stone-700">/10</span></span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-stone-800">
                  <div
                    className="h-full rounded-full bg-amber-500/70 transition-all"
                    style={{ width: `${s.val * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ─── Tech stack ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-16" data-reveal>
        <div className="mb-8 text-center">
          <SectionLabel>Tech Stack</SectionLabel>
          <h2 className="text-2xl font-bold tracking-tight text-stone-100">Built with</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {[
            { label: "React", dot: "bg-sky-400" },
            { label: "Vite", dot: "bg-violet-400" },
            { label: "Tailwind CSS", dot: "bg-cyan-400" },
            { label: "shadcn/ui", dot: "bg-stone-400" },
            { label: "Recharts", dot: "bg-emerald-400" },
            { label: "Groq API", dot: "bg-amber-400" },
            { label: "Ollama", dot: "bg-orange-400" },
            { label: "NewsAPI", dot: "bg-rose-400" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900/60 px-4 py-2 text-[13px] text-stone-400 transition-colors hover:border-stone-700 hover:text-stone-200">
              <span className={`h-2 w-2 rounded-full ${t.dot}`} />
              {t.label}
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ─── Final CTA ──────────────────────────────────────────── */}
      <section className="px-6 py-20" data-reveal>
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/60 px-8 py-14 text-center">
            {/* Subtle amber glow at top */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-amber-500/[0.08] blur-3xl" />
            <div className="relative">
              <SectionLabel>Ready to start?</SectionLabel>
              <h2 className="text-3xl font-bold tracking-tight text-stone-50 sm:text-4xl">
                Open your research environment
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-stone-500">
                Everything loads in-browser. Bring your own Groq key for free AI — no subscription needed.
              </p>
              <button
                onClick={onEnter}
                className="group mt-8 inline-flex items-center gap-2.5 rounded-xl border border-amber-700/60 bg-amber-500/10 px-8 py-3.5 text-[15px] font-semibold text-amber-300 transition-all hover:border-amber-600 hover:bg-amber-500/20"
              >
                Open Dashboard
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-stone-800 px-6 py-6 text-center">
        <p className="text-[12px] text-stone-700">
          Strategy Research Dashboard · Built with React, Groq & NewsAPI ·{" "}
          <a href="https://github.com/jmitchell26-netizen/Strategy-Dashboard-" target="_blank" rel="noopener noreferrer" className="text-stone-600 transition-colors hover:text-stone-400">
            View on GitHub →
          </a>
        </p>
      </footer>

      {/* ─── Reveal animation styles ─────────────────────────────── */}
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        [data-reveal].srd-visible { opacity: 1; transform: translateY(0); }
      `}</style>

    </div>
  );
}
