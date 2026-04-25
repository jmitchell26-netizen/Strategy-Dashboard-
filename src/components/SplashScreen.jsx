// SplashScreen.jsx — Light, editorial landing page. Dismiss to open the dashboard.

import { useEffect } from "react";

/* ─── Scroll-reveal ───────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("srd-vis"); obs.unobserve(e.target); }
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Thin rule ───────────────────────────────────────────────────────────── */
function Rule() {
  return <div style={{ height: 1, background: "#e8e2d9", width: "100%" }} />;
}

/* ─── App mockup ──────────────────────────────────────────────────────────── */
function AppMockup() {
  return (
    <div data-reveal style={{ maxWidth: 960, margin: "0 auto", padding: "0 2rem 2rem" }}>
      <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #2c2924", background: "#0c0b09", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>
        {/* Chrome */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#131210", borderBottom: "1px solid #2c2924", padding: "10px 16px" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(239,68,68,0.5)" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(245,158,11,0.5)" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(52,211,153,0.5)" }} />
          <div style={{ flex: 1, marginLeft: 12, background: "#0c0b09", border: "1px solid #2c2924", borderRadius: 6, padding: "4px 12px", fontFamily: "monospace", fontSize: 10, color: "#57534e", textAlign: "center" }}>
            localhost:5173 — Strategy Research Dashboard
          </div>
        </div>

        {/* App header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #2c2924", background: "#131210", padding: "10px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📊</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f5f0eb" }}>Strategy Research Dashboard</div>
              <div style={{ fontSize: 10, color: "#57534e" }}>Search companies · clip intelligence · run AI profiles</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(6,78,59,0.3)", border: "1px solid rgba(6,78,59,0.6)", borderRadius: 20, padding: "4px 10px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
            <span style={{ fontSize: 10, color: "#34d399", fontWeight: 500 }}>Live</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #2c2924", background: "#0f0e0c", overflowX: "auto" }}>
          {["Research 130","Briefing","Watchlist 3","Trends","Timeline 12","Comparison Lab","Reports","Thesis Builder 2"].map((t, i) => (
            <div key={t} style={{ flexShrink: 0, padding: "10px 16px", fontSize: 11, fontWeight: 500, color: i === 0 ? "#f59e0b" : "#57534e", borderBottom: i === 0 ? "2px solid #f59e0b" : "none", whiteSpace: "nowrap" }}>{t}</div>
          ))}
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 0.65fr", borderTop: "none" }}>
          {/* Left */}
          <div style={{ padding: 16, borderRight: "1px solid #2c2924" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12 }}>📰</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#d6d3d1" }}>Live News Feed</span>
              </div>
              <span style={{ fontSize: 9, color: "#57534e", fontFamily: "monospace", background: "#1a1814", border: "1px solid #2c2924", borderRadius: 4, padding: "2px 6px" }}>130</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {[{l:"All 130",a:true},{l:"Market Entry"},{l:"Financial"},{l:"Product Strategy"}].map(({l,a})=>(
                <div key={l} style={{ fontSize: 9, padding: "4px 8px", borderRadius: 6, border: `1px solid ${a ? "rgba(245,158,11,0.4)" : "#2c2924"}`, background: a ? "rgba(245,158,11,0.08)" : "transparent", color: a ? "#f59e0b" : "#78716c" }}>{l}</div>
              ))}
            </div>
            {[
              { bar:"#f59e0b", cat:"Market Entry", catC:"#fbbf24", date:"Apr 24, 2026", title:"Soaring jet fuel prices could threaten European vacation plans", saved:true },
              { bar:"#38bdf8", cat:"Financial",    catC:"#38bdf8", date:"Apr 23, 2026", title:"Fed holds rates — markets brace for Q2 guidance season" },
              { bar:"#a78bfa", cat:"Product Strategy", catC:"#a78bfa", date:"Apr 22, 2026", title:"Apple posts $124B revenue — AI services lead growth surge", dim:true },
            ].map((c,i)=>(
              <div key={i} style={{ marginBottom: 8, borderRadius: 8, border: "1px solid #2c2924", background: "#131210", overflow: "hidden", opacity: c.dim ? 0.45 : 1 }}>
                <div style={{ height: 2, background: c.bar }} />
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: c.catC }}>{c.cat}</span>
                    <span style={{ fontSize: 9, color: "#44403c" }}>{c.date}</span>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: "#d6d3d1", lineHeight: 1.4, marginBottom: 6 }}>{c.title}</div>
                  <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, border: `1px solid ${c.saved ? "rgba(245,158,11,0.4)" : "#2c2924"}`, background: c.saved ? "rgba(245,158,11,0.08)" : "transparent", color: c.saved ? "#f59e0b" : "#57534e" }}>
                    {c.saved ? "✓ Saved" : "Save to Matrix"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right */}
          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#d6d3d1" }}>Saved Strategies</span>
              <span style={{ fontSize: 9, color: "#57534e", fontFamily: "monospace", background: "#1a1814", border: "1px solid #2c2924", borderRadius: 4, padding: "2px 6px" }}>2</span>
            </div>
            {[
              { bar:"#f59e0b", title:"Jet fuel prices threaten European vacations", meta:"Market Entry · Washington Post · Apr 24" },
              { bar:"#38bdf8", title:"Fed holds rates — markets brace for Q2 guidance", meta:"Financial · Bloomberg · Apr 23", dim:true },
            ].map((c,i)=>(
              <div key={i} style={{ marginBottom: 8, borderRadius: 8, border: "1px solid #2c2924", background: "#131210", overflow: "hidden", opacity: c.dim ? 0.55 : 1 }}>
                <div style={{ height: 2, background: c.bar }} />
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, fontWeight: 500, color: "#d6d3d1", lineHeight: 1.4, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 9, color: "#57534e", marginBottom: 8 }}>{c.meta}</div>
                  <div style={{ height: 18, borderRadius: 4, border: "1px solid #2c2924", background: "#0c0b09" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function SplashScreen({ onEnter }) {
  useReveal();

  const FEATURES = [
    { icon: "📡", title: "Live News Feed",       desc: "Real-time headlines from NewsAPI, auto-categorised across 9 strategy lenses with live article counts." },
    { icon: "🧠", title: "AI Company Profiles",  desc: "9-section intelligence brief per company with Signal Scores, radar chart, and AI-written rationale for every rating." },
    { icon: "☀️", title: "Morning Briefing",      desc: "AI-synthesised daily digest of your feed — top stories, key themes, and companies to watch." },
    { icon: "📐", title: "Thesis Builder",        desc: "Group saved articles into investment theses. AI synthesises evidence for and against your hypothesis." },
    { icon: "📊", title: "Trends & Analytics",    desc: "Category volume, sentiment timelines, and save-activity charts derived from your own research data." },
    { icon: "⚖️", title: "Comparison Lab",        desc: "Overlay radar charts for up to four AI-profiled companies and spot relative strengths at a glance." },
  ];

  const STEPS = [
    { n:"01", t:"Search a topic or company",        d:"Enter a query and the live feed pulls real-time headlines, auto-organised by category." },
    { n:"02", t:"Save intelligence to your matrix", d:"One click saves an article. Add a company tag and research notes to build your dataset." },
    { n:"03", t:"Generate an AI company profile",   d:"Tag articles to a company and hit generate — a full 9-section brief appears in seconds." },
    { n:"04", t:"Build a thesis around your ideas", d:"Move saved articles into a thesis. AI synthesises evidence for and against your hypothesis." },
    { n:"05", t:"Monitor, compare, and report",     d:"Track keywords, compare profiles in the Lab, and export polished reports." },
  ];

  const TABS = [
    ["01","Research","Live feed, save articles, generate AI profiles."],
    ["02","Briefing","AI daily digest from your live feed."],
    ["03","Watchlist","Track companies and keywords with live match counts."],
    ["04","Trends","Category volume, sentiment, and save-activity charts."],
    ["05","Timeline","Saved articles grouped by week."],
    ["06","Comparison Lab","Radar chart comparison of AI-profiled companies."],
    ["07","Reports","Build and export formatted research reports."],
    ["08","Thesis Builder","Group articles into theses with AI synthesis."],
  ];

  return (
    <>
      {/* ── Google Fonts for serif headlines ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        [data-reveal] { opacity: 0; transform: translateY(22px); transition: opacity 0.65s ease, transform 0.65s ease; }
        [data-reveal].srd-vis { opacity: 1; transform: translateY(0); }
        .srd-btn-outline { border: 1px solid #c9a84c; background: transparent; color: #8a6c2a; padding: 0.7rem 2rem; border-radius: 6px; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: background 0.2s, color 0.2s; }
        .srd-btn-outline:hover { background: #f5f0e8; color: #6b4f1a; }
        .srd-btn-dark { border: none; background: #1a1612; color: #f5f0eb; padding: 0.85rem 2.5rem; border-radius: 6px; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .srd-btn-dark:hover { background: #2c2520; }
        html { scroll-behavior: smooth; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 50, overflowY: "auto", background: "#faf8f5", fontFamily: "'Inter', sans-serif", color: "#1a1612" }}>

        {/* ─── NAV ─────────────────────────────────────────────────── */}
        <nav style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2.5rem", height: 60, background: "rgba(250,248,245,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e2d9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid #d4c5a0", background: "#f5edd8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📊</div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1612", letterSpacing: "-0.01em" }}>Strategy Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[["#features","Features"],["#tabs","8 Tabs"],["#works","How it works"],["#ai","AI Engine"]].map(([href,label]) => (
              <a key={href} href={href} style={{ fontSize: 13, color: "#78716c", textDecoration: "none", fontWeight: 500 }}
                onMouseEnter={e => e.target.style.color="#1a1612"} onMouseLeave={e => e.target.style.color="#78716c"}>
                {label}
              </a>
            ))}
          </div>
          <button onClick={onEnter} className="srd-btn-outline">Open Dashboard →</button>
        </nav>

        {/* ─── HERO ────────────────────────────────────────────────── */}
        <section style={{ minHeight: "92vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8rem 2rem 4rem" }}>
          <div data-reveal>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#a08040", marginBottom: "1.5rem" }}>
              Strategy Research Tool
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.02em", color: "#1a1612", marginBottom: "1.75rem" }}>
              Your personal<br />intelligence desk
            </h1>
            <p style={{ maxWidth: 520, margin: "0 auto 2.5rem", fontSize: 16, lineHeight: 1.75, color: "#78716c", fontWeight: 400 }}>
              A full research workflow in one professional dashboard — live news, AI intelligence profiles with signal scores, 8 specialist research tabs, and exportable reports.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={onEnter} className="srd-btn-dark">
                Open Dashboard
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <a href="#features" style={{ border: "1px solid #d4c5a0", background: "transparent", color: "#78716c", padding: "0.7rem 1.8rem", borderRadius: 6, fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.04em", textDecoration: "none", display: "inline-block" }}>
                Explore Features ↓
              </a>
            </div>
          </div>
        </section>

        {/* ─── APP MOCKUP ──────────────────────────────────────────── */}
        <AppMockup />

        {/* ─── STATS ───────────────────────────────────────────────── */}
        <div data-reveal style={{ maxWidth: 880, margin: "0 auto", padding: "2rem 2rem 4rem", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#e8e2d9", borderRadius: 14, overflow: "hidden" }}>
          {[["8","Specialist research tabs"],["9+","AI profile sections"],["100%","Free with Groq or Ollama"],["0","Data sent to servers"]].map(([n,l]) => (
            <div key={n} style={{ background: "#faf8f5", padding: "2rem 1.5rem", textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: "#1a1612", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 12, color: "#a09080", marginTop: 8, lineHeight: 1.4 }}>{l}</div>
            </div>
          ))}
        </div>

        <Rule />

        {/* ─── FEATURES ────────────────────────────────────────────── */}
        <section id="features" style={{ maxWidth: 960, margin: "0 auto", padding: "6rem 2rem" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a08040", marginBottom: 12 }}>Core Features</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#1a1612", lineHeight: 1.2, marginBottom: 16 }}>
              Everything a strategist<br />needs, built in
            </h2>
            <p style={{ fontSize: 15, color: "#78716c", maxWidth: 480, margin: "0 auto" }}>From live news ingestion to AI-powered deep dives — the full research workflow in one interface.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#e8e2d9", borderRadius: 14, overflow: "hidden" }}>
            {FEATURES.map((f) => (
              <div key={f.title} data-reveal style={{ background: "#faf8f5", padding: "2rem 1.75rem" }}>
                <div style={{ fontSize: 22, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1612", marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.65, color: "#78716c" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <Rule />

        {/* ─── 8 TABS ──────────────────────────────────────────────── */}
        <section id="tabs" style={{ maxWidth: 960, margin: "0 auto", padding: "6rem 2rem" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a08040", marginBottom: 12 }}>8 Research Tabs</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#1a1612", lineHeight: 1.2 }}>One app, eight specialist views</h2>
          </div>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "#e8e2d9", borderRadius: 14, overflow: "hidden" }}>
            {TABS.map(([n, label, desc]) => (
              <div key={n} style={{ background: "#faf8f5", padding: "1.5rem 1.25rem" }}>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "#c0b090", marginBottom: 8 }}>{n}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1612", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 12, lineHeight: 1.55, color: "#a09080" }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        <Rule />

        {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
        <section id="works" style={{ maxWidth: 680, margin: "0 auto", padding: "6rem 2rem" }}>
          <div data-reveal style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a08040", marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#1a1612" }}>From feed to insight<br />in minutes</h2>
          </div>
          <div data-reveal>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: "flex", gap: 24, padding: "1.75rem 0", borderBottom: i < STEPS.length - 1 ? "1px solid #e8e2d9" : "none" }}>
                <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 8, border: "1px solid #e0d8cc", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: "#a08040" }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1612", marginBottom: 6 }}>{s.t}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.65, color: "#78716c" }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Rule />

        {/* ─── AI ENGINE ───────────────────────────────────────────── */}
        <section id="ai" style={{ maxWidth: 960, margin: "0 auto", padding: "6rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
            <div data-reveal>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a08040", marginBottom: 16 }}>AI Engine</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "#1a1612", lineHeight: 1.2, marginBottom: 20 }}>Deep profiles,<br />not summaries</h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "#78716c", marginBottom: 24 }}>
                Every company profile is a 9-section investment-grade brief generated by Groq or local Ollama. Signal Scores are rated 1–10 across six strategic dimensions with AI-written rationale for every rating.
              </p>
              {["Signal Scores with AI-written rationale per dimension","Interactive radar chart overlay in Comparison Lab","Evidence-for and against thesis synthesis","Executive summaries across multiple company profiles"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                  <svg style={{ width: 14, height: 14, flexShrink: 0, marginTop: 3, color: "#a08040" }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span style={{ fontSize: 13, color: "#78716c" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Signal score card */}
            <div data-reveal style={{ background: "#f0ebe3", borderRadius: 14, border: "1px solid #e0d8cc", padding: "2rem" }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a08040", marginBottom: 20 }}>Signal Scores — Apple Inc.</p>
              {[["Strategic Momentum",9],["Market Opportunity",8],["Competitive Position",9],["Financial Health",8],["Execution Capability",8],["Risk Exposure",4]].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#5c5040" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: "#1a1612" }}>{val}<span style={{ color: "#c0b090" }}>/10</span></span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "#ddd6c8", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, background: val >= 7 ? "#a08040" : val >= 5 ? "#c0a060" : "#c08060", width: `${val * 10}%`, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Rule />

        {/* ─── TECH STACK ──────────────────────────────────────────── */}
        <section data-reveal style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a08040", marginBottom: 28 }}>Built with</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {["React","Vite","Tailwind CSS","shadcn/ui","Recharts","Groq API","Ollama","NewsAPI"].map((t) => (
              <div key={t} style={{ padding: "8px 18px", border: "1px solid #e0d8cc", borderRadius: 20, fontSize: 13, color: "#78716c", background: "#f5f0e8" }}>{t}</div>
            ))}
          </div>
        </section>

        {/* ─── DARK CTA ────────────────────────────────────────────── */}
        <section style={{ background: "#141210", padding: "6rem 2rem", textAlign: "center" }}>
          <div data-reveal style={{ maxWidth: 580, margin: "0 auto" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a08040", marginBottom: 20 }}>Ready to start?</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, color: "#f5f0eb", lineHeight: 1.1, marginBottom: 20 }}>
              Open your research<br />environment
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: "#78716c", marginBottom: 36, maxWidth: 440, margin: "0 auto 2.5rem" }}>
              Everything loads in-browser. Bring your own Groq key for free AI-powered analysis — no subscription needed.
            </p>
            <button onClick={onEnter} className="srd-btn-dark" style={{ fontSize: "0.9rem", padding: "1rem 2.75rem", borderRadius: 8, background: "#f5f0eb", color: "#141210" }}
              onMouseEnter={e => { e.currentTarget.style.background="#e8e0d4"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#f5f0eb"; }}>
              Open Dashboard →
            </button>
          </div>
        </section>

        {/* ─── FOOTER ──────────────────────────────────────────────── */}
        <footer style={{ background: "#141210", borderTop: "1px solid #2c2924", padding: "1.5rem 2rem", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#44403c" }}>
            Strategy Research Dashboard · Built with React, Groq & NewsAPI ·{" "}
            <a href="https://github.com/jmitchell26-netizen/Strategy-Dashboard-" target="_blank" rel="noopener noreferrer" style={{ color: "#78716c", textDecoration: "none" }}>
              View on GitHub →
            </a>
          </p>
        </footer>

      </div>
    </>
  );
}
