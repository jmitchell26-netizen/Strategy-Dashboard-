// TrendsTab.jsx — Charts + filters + drill-down for feed/saved analytics.

import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid, LineChart, Line, Legend,
} from "recharts";

const POS = new Set(["growth","grow","grew","expand","expansion","beat","beats","exceeded","record","launch","launches","launched","partnership","deal","wins","win","profit","profitable","surge","surged","rally","gain","gains","rise","rises","rose","strong","strength","positive","upgrade","raised","innovation","breakthrough","opportunity","milestone","leading","ahead","outperform"]);
const NEG = new Set(["decline","declined","drop","drops","fell","fall","loss","losses","miss","missed","below","cut","cuts","layoff","layoffs","lawsuit","fine","penalty","investigation","probe","warning","warns","risk","concern","weak","weakness","negative","downgrade","reduces","slump","crash","crisis","dispute","struggle","struggles","missed","failed","fail","disappointing"]);

const CAT_COLORS = {
  "Product Strategy": "#a78bfa","Expansion":"#34d399","Financial":"#38bdf8",
  "Market Entry":"#fbbf24","R&D":"#f87171","Content Strategy":"#e879f9",
  "Product Launch":"#22d3ee","M&A":"#fb923c","General":"#818cf8",
};

const CUSTOM_TOOLTIP_STYLE = {
  contentStyle: { background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#1c1917" }, itemStyle: { color: "#f59e0b" },
};

function sentimentScore(text) {
  if (!text) return null;
  const words = text.toLowerCase().split(/\W+/);
  let pos = 0;
  let neg = 0;
  for (const w of words) { if (POS.has(w)) pos++; if (NEG.has(w)) neg++; }
  if (pos + neg === 0) return null;
  return Math.round(((pos - neg) / Math.sqrt(pos + neg + 1)) * 100) / 100;
}

function parseTimestamp(raw) {
  const d = new Date(raw || "");
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

function inDateWindow(item, rangeDays) {
  if (rangeDays === "all") return true;
  const ts = parseTimestamp(item.savedAt || item.date);
  if (!ts) return false;
  const now = Date.now();
  const windowMs = Number(rangeDays) * 24 * 60 * 60 * 1000;
  return ts >= now - windowMs;
}

function weekKeyFromItem(item) {
  const d = parseTimestamp(item.savedAt || item.date);
  const date = d ? new Date(d) : new Date();
  return `${date.getFullYear()}-W${String(Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)).padStart(2, "0")}`;
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-stone-800">{title}</h3>
      {subtitle && <p className="text-[11px] text-stone-400">{subtitle}</p>}
    </div>
  );
}

function ChartCard({ children, className = "" }) {
  return <div className={`rounded border border-stone-200 bg-white p-5 ${className}`}>{children}</div>;
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded border border-stone-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-stone-900">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-stone-500">{hint}</p>}
    </div>
  );
}

function DrilldownPanel({ drilldown, onClear }) {
  if (!drilldown) return null;
  return (
    <div className="mb-6 rounded border border-amber-200 bg-amber-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">Drilldown</p>
          <p className="text-sm font-semibold text-stone-800">{drilldown.title}</p>
        </div>
        <button
          onClick={onClear}
          className="rounded border border-amber-200 bg-white px-2 py-1 text-[11px] text-amber-700 transition-colors hover:border-amber-300"
        >
          Clear
        </button>
      </div>
      {drilldown.items.length === 0 ? (
        <p className="text-xs text-stone-600">No records match this data point.</p>
      ) : (
        <div className="space-y-2">
          {drilldown.items.slice(0, 12).map((item) => (
            <div key={item.id} className="rounded border border-stone-200 bg-white px-3 py-2">
              {item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer noopener" className="text-[12px] font-medium text-stone-800 hover:text-amber-700">
                  {item.title}
                </a>
              ) : (
                <p className="text-[12px] font-medium text-stone-800">{item.title}</p>
              )}
              <p className="mt-0.5 text-[11px] text-stone-500">
                {item.companyName || "Unassigned"} · {item.source} · {item.date}
              </p>
            </div>
          ))}
          {drilldown.items.length > 12 && (
            <p className="text-[11px] text-stone-500">Showing 12 of {drilldown.items.length} matching records.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrendsTab({ feedArticles, savedItems }) {
  const [rangeDays, setRangeDays] = useState("30");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [drilldown, setDrilldown] = useState(null);

  const companyOptions = useMemo(
    () => [...new Set(savedItems.map((i) => (i.companyName || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [savedItems]
  );
  const categoryOptions = useMemo(
    () => [...new Set(feedArticles.map((a) => a.category || "General"))].sort((a, b) => a.localeCompare(b)),
    [feedArticles]
  );

  const filteredFeed = useMemo(() => (
    feedArticles.filter((a) => {
      if (!inDateWindow(a, rangeDays)) return false;
      if (categoryFilter !== "all" && (a.category || "General") !== categoryFilter) return false;
      if (companyFilter !== "all") {
        const co = (a.companyName || "").trim().toLowerCase();
        if (!co || co !== companyFilter.toLowerCase()) return false;
      }
      return true;
    })
  ), [feedArticles, rangeDays, categoryFilter, companyFilter]);

  const filteredSaved = useMemo(() => (
    savedItems.filter((item) => {
      if (!inDateWindow(item, rangeDays)) return false;
      if (companyFilter !== "all" && (item.companyName || "").trim().toLowerCase() !== companyFilter.toLowerCase()) return false;
      return true;
    })
  ), [savedItems, rangeDays, companyFilter]);

  const categoryData = useMemo(() => {
    const map = {};
    for (const a of filteredFeed) {
      const c = a.category || "General";
      map[c] = (map[c] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filteredFeed]);

  const companyData = useMemo(() => {
    const map = {};
    for (const a of filteredSaved) {
      const c = (a.companyName || "").trim();
      if (c) map[c] = (map[c] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [filteredSaved]);

  const saveActivity = useMemo(() => {
    const map = {};
    for (const item of filteredSaved) {
      const week = weekKeyFromItem(item);
      map[week] = (map[week] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-10).map(([week, count]) => ({ week, count }));
  }, [filteredSaved]);

  const sentimentData = useMemo(() => {
    const companies = [...new Set(filteredSaved.map((i) => (i.companyName || "").trim()).filter(Boolean))].slice(0, 5);
    if (!companies.length) return { companies: [], data: [] };

    const byDate = {};
    for (const item of filteredSaved) {
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

    const data = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([date, scores]) => {
      const point = { date };
      for (const co of companies) {
        const arr = scores[co];
        point[co] = arr ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100 : undefined;
      }
      return point;
    });
    return { companies, data };
  }, [filteredSaved]);

  const SENTIMENT_COLORS = ["#f59e0b", "#38bdf8", "#a78bfa", "#34d399", "#f87171"];
  const insightStats = useMemo(() => {
    const uniqueTrackedCompanies = new Set(
      filteredSaved.map((i) => (i.companyName || "").trim()).filter(Boolean).map((name) => name.toLowerCase())
    ).size;
    const topCategory = categoryData[0] ? `${categoryData[0].name} (${categoryData[0].count})` : "No feed data";
    const topCompany = companyData[0] ? `${companyData[0].name} (${companyData[0].count})` : "No tags yet";
    const latestWeek = saveActivity[saveActivity.length - 1];
    const sentimentValues = sentimentData.data.flatMap((row) =>
      sentimentData.companies.map((co) => row[co]).filter((v) => typeof v === "number")
    );
    const avgSentiment = sentimentValues.length
      ? (sentimentValues.reduce((sum, v) => sum + v, 0) / sentimentValues.length).toFixed(2)
      : "n/a";

    return {
      feedVolume: filteredFeed.length,
      trackedCompanies: uniqueTrackedCompanies,
      topCategory,
      topCompany,
      latestWeekSaved: latestWeek ? latestWeek.count : 0,
      avgSentiment,
    };
  }, [filteredFeed, filteredSaved, categoryData, companyData, saveActivity, sentimentData]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Trends</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">Research Analytics</h2>
        <p className="mt-1 text-sm text-stone-500">Live charts from your feed and saved matrix.</p>
      </div>

      <div className="mb-6 rounded border border-stone-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-stone-500">Date range</label>
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(e.target.value)}
              className="w-full rounded border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[12px] text-stone-700 focus:border-amber-400 focus:outline-none"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-stone-500">Company</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full rounded border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[12px] text-stone-700 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All companies</option>
              {companyOptions.map((co) => <option key={co} value={co}>{co}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-stone-500">Category (feed)</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[12px] text-stone-700 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      <DrilldownPanel drilldown={drilldown} onClear={() => setDrilldown(null)} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Feed Volume" value={insightStats.feedVolume} hint={insightStats.topCategory} />
        <StatCard label="Tracked Companies" value={insightStats.trackedCompanies} hint={insightStats.topCompany} />
        <StatCard label="Last Week Saves" value={insightStats.latestWeekSaved} hint="Based on saved article cadence" />
        <StatCard label="Avg Sentiment" value={insightStats.avgSentiment} hint="Across scored company coverage" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard>
          <SectionHeader title="Feed by Category" subtitle={`${filteredFeed.length} articles in filtered feed`} />
          {categoryData.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-600">No feed records in this filter set.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 12 }}>
                <XAxis type="number" tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#a8a29e", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [v, "Articles"]} />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                  onClick={(entry) => {
                    const category = entry?.name || entry?.payload?.name;
                    if (!category) return;
                    const items = filteredFeed.filter((a) => (a.category || "General") === category);
                    setDrilldown({ title: `Feed articles in ${category}`, items });
                  }}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CAT_COLORS[entry.name] || "#78716c"} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

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
                <Bar
                  dataKey="count"
                  fill="#f59e0b"
                  fillOpacity={0.7}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={20}
                  onClick={(entry) => {
                    const company = entry?.name || entry?.payload?.name;
                    if (!company) return;
                    setDrilldown({
                      title: `Saved coverage for ${company}`,
                      items: filteredSaved.filter((i) => (i.companyName || "").trim() === company),
                    });
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard>
          <SectionHeader title="Research Activity" subtitle="Articles saved per week" />
          {saveActivity.length < 2 ? (
            <p className="py-8 text-center text-sm text-stone-600">Save more articles to see your research cadence.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={saveActivity}
                margin={{ left: 0, right: 4, top: 4 }}
                onClick={(state) => {
                  const week = state?.activeLabel;
                  if (!week) return;
                  setDrilldown({
                    title: `Saved items in ${week}`,
                    items: filteredSaved.filter((item) => weekKeyFromItem(item) === week),
                  });
                }}
              >
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} formatter={(v) => [v, "Saved"]} />
                <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fill="url(#actGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard>
          <SectionHeader title="Category Heat Map" subtitle="Click a tile to open underlying feed items" />
          {categoryData.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-600">No feed records in this filter set.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CAT_COLORS).map(([cat, color]) => {
                const items = filteredFeed.filter((a) => (a.category || "General") === cat);
                const count = items.length;
                const maxCount = Math.max(...categoryData.map((d) => d.count), 1);
                const intensity = count / maxCount;
                return (
                  <button
                    key={cat}
                    onClick={() => setDrilldown({ title: `Heat map: ${cat}`, items })}
                    className="rounded-lg p-3 text-center transition-all"
                    style={{
                      background: count > 0 ? `${color}${Math.round(intensity * 40 + 10).toString(16).padStart(2, "0")}` : "#f5f5f4",
                      border: `1px solid ${count > 0 ? color + "40" : "#e7e5e4"}`,
                    }}
                  >
                    <p className="text-[18px] font-bold tabular-nums" style={{ color: count > 0 ? color : "#a8a29e" }}>{count}</p>
                    <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide" style={{ color: count > 0 ? color : "#a8a29e", opacity: 0.9 }}>
                      {cat.length > 14 ? `${cat.slice(0, 12)}…` : cat}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </ChartCard>

        <ChartCard className="lg:col-span-2">
          <SectionHeader title="Sentiment Timeline" subtitle="Keyword-based sentiment score per saved company over time (positive = bullish coverage)" />
          {sentimentData.data.length < 2 || sentimentData.companies.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-600">
              Tag saved articles with company names and save more articles to see sentiment trends.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={sentimentData.data}
                margin={{ left: 0, right: 4, top: 4 }}
                onClick={(state) => {
                  const date = state?.activeLabel;
                  if (!date) return;
                  setDrilldown({
                    title: `Sentiment records on ${date}`,
                    items: filteredSaved.filter((item) => (item.savedAt || item.date || "").slice(0, 10) === date),
                  });
                }}
              >
                <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#78716c", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...CUSTOM_TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#78716c" }} />
                {sentimentData.companies.map((co, i) => (
                  <Line
                    key={co}
                    type="monotone"
                    dataKey={co}
                    stroke={SENTIMENT_COLORS[i % SENTIMENT_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
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
