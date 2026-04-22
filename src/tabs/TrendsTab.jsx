// TrendsTab.jsx — Charts: category volume, company coverage, save activity, heat grid, sentiment.

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid, LineChart, Line, Legend,
} from "recharts";

// ── Sentiment scoring ─────────────────────────────────────────────────────────
const POS = new Set(["growth","grow","grew","expand","expansion","beat","beats","exceeded","record","launch","launches","launched","partnership","deal","wins","win","profit","profitable","surge","surged","rally","gain","gains","rise","rises","rose","strong","strength","positive","upgrade","raised","innovation","breakthrough","opportunity","milestone","leading","ahead","outperform"]);
const NEG = new Set(["decline","declined","drop","drops","fell","fall","loss","losses","miss","missed","below","cut","cuts","layoff","layoffs","lawsuit","fine","penalty","investigation","probe","warning","warns","risk","concern","weak","weakness","negative","downgrade","reduces","slump","crash","crisis","dispute","struggle","struggles","missed","failed","fail","disappointing"]);

function sentimentScore(text) {
  if (!text) return null;
  const words = text.toLowerCase().split(/\W+/);
  let pos = 0, neg = 0;
  for (const w of words) { if (POS.has(w)) pos++; if (NEG.has(w)) neg++; }
  if (pos + neg === 0) return null;
  return Math.round(((pos - neg) / Math.sqrt(pos + neg + 1)) * 100) / 100;
}

const CAT_COLORS = {
  "Product Strategy": "#a78bfa","Expansion":"#34d399","Financial":"#38bdf8",
  "Market Entry":"#fbbf24","R&D":"#f87171","Content Strategy":"#e879f9",
  "Product Launch":"#22d3ee","M&A":"#fb923c","General":"#818cf8",
};

const CUSTOM_TOOLTIP_STYLE = {
  contentStyle: { background: "#1c1917", border: "1px solid #44403c", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#e7e5e4" }, itemStyle: { color: "#f59e0b" },
};

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-stone-200">{title}</h3>
      {subtitle && <p className="text-[11px] text-stone-600">{subtitle}</p>}
    </div>
  );
}

function ChartCard({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-stone-800 bg-stone-900/60 p-5 ${className}`}>
      {children}
    </div>
  );
}

export default function TrendsTab({ feedArticles, savedItems }) {

  // 1. Category volume from feed
  const categoryData = useMemo(() => {
    const map = {};
    for (const a of feedArticles) { const c = a.category || "General"; map[c] = (map[c] || 0) + 1; }
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [feedArticles]);

  // 2. Company coverage from saved items
  const companyData = useMemo(() => {
    const map = {};
    for (const a of savedItems) {
      const c = (a.companyName || "").trim();
      if (c) map[c] = (map[c] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [savedItems]);

  // 3. Save activity by week
  const saveActivity = useMemo(() => {
    const map = {};
    for (const item of savedItems) {
      const d = item.savedAt ? new Date(item.savedAt) : new Date();
      const week = `${d.getFullYear()}-W${String(Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)).padStart(2, "0")}`;
      map[week] = (map[week] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-10).map(([week, count]) => ({ week, count }));
  }, [savedItems]);

  // 4. Sentiment per company over time
  const sentimentData = useMemo(() => {
    const companies = [...new Set(savedItems.map((i) => (i.companyName || "").trim()).filter(Boolean))].slice(0, 5);
    if (!companies.length) return { companies: [], data: [] };

    const byDate = {};
    for (const item of savedItems) {
      const co = (item.companyName || "").trim();
      if (!co) continue;
      const d = (item.savedAt || item.date || "").slice(0, 10);
      if (!d) continue;
      const score = sentimentScore((item.title || "") + " " + (item.summary || ""));
      if (score === null) continue;
      if (!byDate[d]) byDate[d] = {};
      if (!byDate[d][co]) byDate[d][co] = [];
      byDate[d][co].push(score);
    }

    const data = Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, scores]) => {
        const point = { date };
        for (const co of companies) {
          const arr = scores[co];
          point[co] = arr ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100 : undefined;
        }
        return point;
      });

    return { companies, data };
  }, [savedItems]);

  const SENTIMENT_COLORS = ["#f59e0b", "#38bdf8", "#a78bfa", "#34d399", "#f87171"];

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Trends</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-100">Research Analytics</h2>
        <p className="mt-1 text-sm text-stone-500">Live charts from your feed and saved matrix.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* 1. Category Volume */}
        <ChartCard>
          <SectionHeader title="Feed by Category" subtitle={`${feedArticles.length} articles in current feed`} />
          {categoryData.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-600">Load the feed to see category breakdown.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 12 }}>
                <XAxis type="number" tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#a8a29e", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [v, "Articles"]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CAT_COLORS[entry.name] || "#78716c"} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 2. Company Coverage */}
        <ChartCard>
          <SectionHeader title="Company Coverage" subtitle="Saved articles by tagged company" />
          {companyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-stone-600">Tag saved articles with company names to see coverage here.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={companyData} layout="vertical" margin={{ left: 0, right: 12 }}>
                <XAxis type="number" tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#a8a29e", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [v, "Articles"]} />
                <Bar dataKey="count" fill="#f59e0b" fillOpacity={0.7} radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 3. Save Activity */}
        <ChartCard>
          <SectionHeader title="Research Activity" subtitle="Articles saved per week" />
          {saveActivity.length < 2 ? (
            <p className="py-8 text-center text-sm text-stone-600">Save more articles to see your research cadence.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={saveActivity} margin={{ left: 0, right: 4, top: 4 }}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#292524" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [v, "Saved"]} />
                <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fill="url(#actGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 4. Category Heat Grid */}
        <ChartCard>
          <SectionHeader title="Category Heat Map" subtitle="Intensity = article share of current feed" />
          {categoryData.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-600">Load the feed to see the heat map.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CAT_COLORS).map(([cat, color]) => {
                const count = feedArticles.filter((a) => a.category === cat).length;
                const maxCount = Math.max(...categoryData.map((d) => d.count), 1);
                const intensity = count / maxCount;
                return (
                  <div
                    key={cat}
                    className="rounded-lg p-3 text-center transition-all"
                    style={{ background: count > 0 ? `${color}${Math.round(intensity * 40 + 10).toString(16).padStart(2,"0")}` : "#1c191733", border: `1px solid ${count > 0 ? color + "40" : "#292524"}` }}
                  >
                    <p className="text-[18px] font-bold tabular-nums" style={{ color: count > 0 ? color : "#57534e" }}>{count}</p>
                    <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide" style={{ color: count > 0 ? color : "#57534e", opacity: 0.8 }}>
                      {cat.length > 14 ? cat.slice(0, 12) + "…" : cat}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>

        {/* 5. Sentiment Timeline */}
        <ChartCard className="lg:col-span-2">
          <SectionHeader title="Sentiment Timeline" subtitle="Keyword-based sentiment score per saved company over time (positive = bullish coverage)" />
          {sentimentData.data.length < 2 || sentimentData.companies.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-600">
              Tag saved articles with company names and save more articles to see sentiment trends.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sentimentData.data} margin={{ left: 0, right: 4, top: 4 }}>
                <CartesianGrid stroke="#292524" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#a8a29e" }} />
                {sentimentData.companies.map((co, i) => (
                  <Line
                    key={co} type="monotone" dataKey={co}
                    stroke={SENTIMENT_COLORS[i % SENTIMENT_COLORS.length]}
                    strokeWidth={2} dot={false} connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>
    </div>
  );
}
