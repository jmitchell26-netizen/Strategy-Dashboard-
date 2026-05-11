// ComparisonLabTab.jsx — Compare up to 4 company profiles with overlaid radar chart + score table.

import { useState, useMemo } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { parseSignalScores } from "../utils/profileParsing";

const COMPANY_COLORS = ["#f59e0b", "#38bdf8", "#a78bfa", "#34d399", "#f87171"];
const MAX_SELECT = 4;

const SCORE_DIMENSIONS = ["Strategic Momentum", "Market Opportunity", "Competitive Position", "Risk Exposure", "Financial Health", "Execution Capability"];

export default function ComparisonLabTab({ companyProfiles }) {
  const [selected, setSelected] = useState([]);

  const readyProfiles = useMemo(() =>
    Object.entries(companyProfiles)
      .filter(([, p]) => p?.summary)
      .map(([key, p]) => ({ key, name: p.displayName, scores: parseSignalScores(p.summary) }))
      .filter((p) => Object.keys(p.scores).length > 0),
    [companyProfiles]
  );

  function toggleCompany(key) {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, key];
    });
  }

  const selectedProfiles = selected.map((key) => readyProfiles.find((p) => p.key === key)).filter(Boolean);

  // Build radar data: one point per dimension
  const radarData = useMemo(() => {
    return SCORE_DIMENSIONS.map((dim) => {
      const point = { dim };
      for (const prof of selectedProfiles) {
        const entry = prof.scores[dim];
        point[prof.name] = entry?.value ?? null;
      }
      return point;
    });
  }, [selectedProfiles]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Comparison Lab</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">Profile Comparison Lab</h2>
        <p className="mt-1 text-sm text-stone-500">
          Select up to {MAX_SELECT} companies with generated profiles to compare signal scores side by side.
        </p>
      </div>

      {readyProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded border border-stone-200 bg-white">
            <svg className="h-6 w-6 text-stone-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-stone-500">No profiles with signal scores</p>
          <p className="mt-1 text-xs text-stone-600">Generate AI profiles for at least 2 companies in the Research tab, then come back here.</p>
        </div>
      ) : (
        <>
          {/* Company selector */}
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-600">
              Select companies ({selected.length}/{MAX_SELECT})
            </p>
            <div className="flex flex-wrap gap-2">
              {readyProfiles.map((prof) => {
                const isSelected = selected.includes(prof.key);
                const colorIdx = selected.indexOf(prof.key);
                const dotColor = isSelected ? COMPANY_COLORS[colorIdx] : null;
                return (
                  <button
                    key={prof.key}
                    onClick={() => toggleCompany(prof.key)}
                    disabled={!isSelected && selected.length >= MAX_SELECT}
                    className={`flex items-center gap-2 rounded border px-4 py-2 text-sm font-semibold transition-all ${
                      isSelected
                        ? "border-stone-300 bg-white text-stone-700"
                        : "border-stone-200 bg-white text-stone-400 hover:border-stone-300 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: dotColor ?? "#d6d3d1" }}
                    />
                    {prof.name}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedProfiles.length < 2 ? (
            <div className="rounded-xl border border-dashed border-stone-200 py-12 text-center">
              <p className="text-sm text-stone-600">Select at least 2 companies above to start comparing.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overlay Radar */}
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Signal Score Overlay</p>
                <p className="mb-4 text-[11px] text-stone-600">All companies plotted on the same axes — larger area = stronger overall signal.</p>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={radarData} outerRadius="70%">
                    <PolarGrid stroke="#e7e5e4" strokeOpacity={0.5} />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: "#78716c", fontSize: 10, fontWeight: 500 }} />
                    {selectedProfiles.map((prof, i) => (
                      <Radar
                        key={prof.key}
                        name={prof.name}
                        dataKey={prof.name}
                        stroke={COMPANY_COLORS[i]}
                        fill={COMPANY_COLORS[i]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                    <Tooltip
                      contentStyle={{ background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#e7e5e4" }}
                      formatter={(v, name) => [v != null ? `${v}/10` : "N/A", name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Score comparison table */}
              <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                <div className="px-5 py-3 border-b border-stone-200">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Score Breakdown</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-800">
                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-600">Dimension</th>
                        {selectedProfiles.map((prof, i) => (
                          <th key={prof.key} className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider"
                            style={{ color: COMPANY_COLORS[i] }}>
                            {prof.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SCORE_DIMENSIONS.map((dim) => {
                        const values = selectedProfiles.map((prof) => prof.scores[dim]?.value ?? null);
                        const validValues = values.filter((v) => v !== null);
                        const maxVal = validValues.length ? Math.max(...validValues) : null;
                        return (
                          <tr key={dim} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                            <td className="px-5 py-3 text-[12px] font-medium text-stone-400">{dim}</td>
                            {values.map((val, i) => {
                              const isTop = val !== null && val === maxVal && validValues.length > 1;
                              const isRisk = dim.toLowerCase().includes("risk");
                              const pct = val != null ? val * 10 : 0;
                              const barColor = isRisk
                                ? pct > 60 ? "#ef4444" : pct > 40 ? "#f59e0b" : "#34d399"
                                : pct >= 70 ? "#34d399" : pct >= 40 ? "#f59e0b" : "#ef4444";
                              return (
                                <td key={i} className="px-4 py-3 text-center">
                                  {val != null ? (
                                    <div className="flex flex-col items-center gap-1.5">
                                      <span className={`text-[13px] font-bold tabular-nums ${isTop ? "text-amber-300" : "text-stone-300"}`}>
                                        {val}<span className="text-[10px] font-normal text-stone-600">/10</span>
                                        {isTop && <span className="ml-1 text-[9px] text-amber-500">▲</span>}
                                      </span>
                                      <div className="h-1 w-16 overflow-hidden rounded-full bg-stone-800">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-stone-700">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strengths and weaknesses */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProfiles.length}, 1fr)` }}>
                {selectedProfiles.map((prof, i) => {
                  const entries = Object.entries(prof.scores)
                    .filter(([, s]) => s?.value != null)
                    .sort((a, b) => b[1].value - a[1].value);
                  const top = entries.slice(0, 2);
                  const bottom = entries.slice(-2).reverse();
                  return (
                    <div key={prof.key} className="rounded-xl border border-stone-200 bg-white p-4"
                      style={{ borderTopColor: COMPANY_COLORS[i], borderTopWidth: 2 }}>
                      <p className="mb-3 text-[11px] font-bold tracking-wide" style={{ color: COMPANY_COLORS[i] }}>{prof.name}</p>
                      <div className="space-y-2">
                        {top.map(([dim, s]) => (
                          <div key={dim} className="flex items-center gap-2 text-[11px]">
                            <span className="text-emerald-400">↑</span>
                            <span className="text-stone-300">{dim}</span>
                            <span className="ml-auto tabular-nums text-stone-500">{s.value}/10</span>
                          </div>
                        ))}
                        {bottom.map(([dim, s]) => (
                          <div key={dim} className="flex items-center gap-2 text-[11px]">
                            <span className="text-red-400">↓</span>
                            <span className="text-stone-400">{dim}</span>
                            <span className="ml-auto tabular-nums text-stone-600">{s.value}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
