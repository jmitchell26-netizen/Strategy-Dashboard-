// BattleView.jsx — Full-screen modal comparing two saved strategy items side-by-side.
// Uses a Recharts RadarChart for visual metric comparison and horizontal bars for detail.

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Maps each category to its Tailwind dot color
const categoryDot = {
  "Product Strategy": "bg-violet-400",
  Expansion: "bg-emerald-400",
  Financial: "bg-sky-400",
  "Market Entry": "bg-amber-400",
  "R&D": "bg-rose-400",
  "Content Strategy": "bg-fuchsia-400",
  "Product Launch": "bg-cyan-400",
  "M&A": "bg-orange-400",
  General: "bg-indigo-400",
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function generateMetrics(item) {
  const seed = hashString(item.id + item.title);
  const seeded = (offset) => ((seed + offset * 2654435761) % 100) + 1;

  const categoryBoosts = {
    "M&A": { disruption: 20, risk: 15 },
    "R&D": { innovation: 25, timeHorizon: 20 },
    Expansion: { disruption: 10, growth: 20 },
    Financial: { risk: -10, growth: 15 },
    "Market Entry": { disruption: 15, competitive: 20 },
    "Product Launch": { innovation: 15, growth: 10 },
    "Product Strategy": { competitive: 15, innovation: 10 },
    "Content Strategy": { growth: 10, competitive: 10 },
    General: {},
  };

  const boosts = categoryBoosts[item.category] || {};
  const clamp = (v) => Math.max(10, Math.min(95, v));

  return [
    { label: "Strategic Impact", value: clamp(seeded(1) % 60 + 40 + (boosts.disruption || 0)), color: "violet" },
    { label: "Market Disruption", value: clamp(seeded(2) % 50 + 30 + (boosts.disruption || 0)), color: "blue" },
    { label: "Innovation", value: clamp(seeded(3) % 55 + 25 + (boosts.innovation || 0)), color: "cyan" },
    { label: "Growth Potential", value: clamp(seeded(4) % 50 + 35 + (boosts.growth || 0)), color: "emerald" },
    { label: "Risk Level", value: clamp(seeded(5) % 60 + 20 + (boosts.risk || 0)), color: "rose" },
    { label: "Competitive Edge", value: clamp(seeded(6) % 50 + 30 + (boosts.competitive || 0)), color: "amber" },
  ];
}

function MetricBar({ label, value, opponentValue }) {
  const isWinning = value > opponentValue;
  const isTied = value === opponentValue;

  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">{label}</span>
        <div className="flex items-center gap-1">
          {!isTied && isWinning && (
            <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          )}
          <span className={`text-[12px] font-bold tabular-nums ${isWinning ? "text-white" : "text-slate-500"}`}>
            {value}
          </span>
        </div>
      </div>
      <Progress
        value={value}
        className={`h-1.5 bg-white/[0.04] transition-all duration-1000 ${isWinning ? "" : "opacity-30"}`}
        style={{ "--progress-color": isWinning ? undefined : "rgba(255,255,255,0.2)" }}
      />
    </div>
  );
}

// Custom tooltip for the radar chart
function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0c0c18]/95 px-3 py-2 text-[12px] shadow-xl">
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function BattleView({ itemA, itemB, onClose }) {
  const metricsA = generateMetrics(itemA);
  const metricsB = generateMetrics(itemB);

  const winsA = metricsA.filter((m, i) => m.value > metricsB[i].value).length;
  const winsB = metricsB.filter((m, i) => m.value > metricsA[i].value).length;

  // Merge metrics into radar chart data format
  const radarData = metricsA.map((m, i) => ({
    metric: m.label,
    [itemA.source || "A"]: m.value,
    [itemB.source || "B"]: metricsB[i].value,
  }));

  // Animate radar in after mount
  const [radarVisible, setRadarVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRadarVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  const nameA = itemA.source || "Article A";
  const nameB = itemB.source || "Article B";

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="animate-slide-up relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c18]/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 -bottom-32 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />

        {/* Header */}
        <div className="relative border-b border-white/[0.06] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Battle View</h2>
                <p className="text-[12px] font-medium text-slate-500">Strategy comparison analysis</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="icon"
              className="border-white/[0.06] bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Scoreboard */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className={`rounded-full px-3 py-1 text-[13px] font-bold tabular-nums ${winsA > winsB ? "bg-emerald-500/15 text-emerald-400" : winsA < winsB ? "bg-white/[0.04] text-slate-500" : "bg-amber-500/10 text-amber-400"}`}>
              {winsA}
            </div>
            <span className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">Metrics Won</span>
            <div className={`rounded-full px-3 py-1 text-[13px] font-bold tabular-nums ${winsB > winsA ? "bg-emerald-500/15 text-emerald-400" : winsB < winsA ? "bg-white/[0.04] text-slate-500" : "bg-amber-500/10 text-amber-400"}`}>
              {winsB}
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div
          className="border-b border-white/[0.06] px-6 py-6 sm:px-8"
          style={{ opacity: radarVisible ? 1 : 0, transition: "opacity 0.6s ease" }}
        >
          <p className="mb-4 text-center text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            Metric Radar
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "rgba(148,163,184,0.8)", fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip content={<RadarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "rgba(148,163,184,0.8)", paddingTop: "12px" }}
              />
              <Radar
                name={nameA}
                dataKey={nameA}
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.18}
                strokeWidth={2}
                dot={{ r: 3, fill: "#8b5cf6" }}
              />
              <Radar
                name={nameB}
                dataKey={nameB}
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.18}
                strokeWidth={2}
                dot={{ r: 3, fill: "#06b6d4" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Side-by-side detail */}
        <div className="relative grid gap-0 sm:grid-cols-2">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent sm:block" />

          {/* Left: Item A */}
          <div className="border-b border-white/[0.04] p-6 sm:border-b-0 sm:border-r sm:border-white/[0.04] sm:p-8">
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${categoryDot[itemA.category] || "bg-slate-400"}`} />
                <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{itemA.category}</span>
              </div>
              <h3 className="mb-2 text-[15px] font-bold leading-snug">
                {itemA.url ? (
                  <a href={itemA.url} target="_blank" rel="noopener noreferrer"
                    className="text-white underline decoration-white/20 underline-offset-2 hover:text-sky-300 hover:decoration-sky-400/50">
                    {itemA.title}
                  </a>
                ) : <span className="text-white">{itemA.title}</span>}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="font-medium">{itemA.source}</span>
                <span>·</span>
                <span className="tabular-nums">{itemA.date}</span>
              </div>
              {itemA.notes && (
                <div className="mt-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-[12px] leading-relaxed text-slate-400 italic">
                  "{itemA.notes}"
                </div>
              )}
            </div>
            <div>
              {metricsA.map((m, i) => (
                <MetricBar key={m.label} {...m} opponentValue={metricsB[i].value} />
              ))}
            </div>
          </div>

          {/* Right: Item B */}
          <div className="p-6 sm:p-8">
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${categoryDot[itemB.category] || "bg-slate-400"}`} />
                <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{itemB.category}</span>
              </div>
              <h3 className="mb-2 text-[15px] font-bold leading-snug">
                {itemB.url ? (
                  <a href={itemB.url} target="_blank" rel="noopener noreferrer"
                    className="text-white underline decoration-white/20 underline-offset-2 hover:text-sky-300 hover:decoration-sky-400/50">
                    {itemB.title}
                  </a>
                ) : <span className="text-white">{itemB.title}</span>}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="font-medium">{itemB.source}</span>
                <span>·</span>
                <span className="tabular-nums">{itemB.date}</span>
              </div>
              {itemB.notes && (
                <div className="mt-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-[12px] leading-relaxed text-slate-400 italic">
                  "{itemB.notes}"
                </div>
              )}
            </div>
            <div>
              {metricsB.map((m, i) => (
                <MetricBar key={m.label} {...m} opponentValue={metricsA[i].value} />
              ))}
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className="border-t border-white/[0.06] px-6 py-5 text-center sm:px-8">
          {winsA === winsB ? (
            <p className="text-sm font-semibold text-amber-400">
              Dead heat — both strategies show equal strength across metrics
            </p>
          ) : (
            <p className="text-sm font-semibold text-emerald-400">
              {winsA > winsB ? itemA.title : itemB.title}
              <span className="ml-1 font-medium text-slate-500">leads in {Math.max(winsA, winsB)} of 6 metrics</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
