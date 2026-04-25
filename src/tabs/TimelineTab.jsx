// TimelineTab.jsx — Saved articles in chronological order with filters and expandable notes.

import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const CAT_DOT = {
  "Product Strategy":"bg-violet-400","Expansion":"bg-emerald-400","Financial":"bg-sky-400",
  "Market Entry":"bg-amber-400","R&D":"bg-rose-400","Content Strategy":"bg-fuchsia-400",
  "Product Launch":"bg-cyan-400","M&A":"bg-orange-400","General":"bg-indigo-400",
};
const CAT_BAR = {
  "Product Strategy":"bg-violet-500","Expansion":"bg-emerald-500","Financial":"bg-sky-500",
  "Market Entry":"bg-amber-500","R&D":"bg-rose-500","Content Strategy":"bg-fuchsia-500",
  "Product Launch":"bg-cyan-500","M&A":"bg-orange-500","General":"bg-indigo-500",
};

function formatWeek(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "Unknown date";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function groupByWeek(items) {
  const map = new Map();
  for (const item of items) {
    const d = item.savedAt ? new Date(item.savedAt) : new Date(item.date || Date.now());
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function TimelineTab({ savedItems, onRemove, onUpdateNotes, onUpdateCompany }) {
  const [catFilter, setCatFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const companies = useMemo(() => {
    const s = new Set(savedItems.map((i) => (i.companyName || "").trim()).filter(Boolean));
    return Array.from(s).sort();
  }, [savedItems]);

  const categories = useMemo(() => {
    const s = new Set(savedItems.map((i) => i.category).filter(Boolean));
    return Array.from(s).sort();
  }, [savedItems]);

  const filtered = useMemo(() => {
    let items = [...savedItems].sort((a, b) => {
      const da = new Date(a.savedAt || a.date || 0);
      const db = new Date(b.savedAt || b.date || 0);
      return db - da;
    });
    if (catFilter !== "All") items = items.filter((i) => i.category === catFilter);
    if (companyFilter !== "All") items = items.filter((i) => (i.companyName || "").trim() === companyFilter);
    return items;
  }, [savedItems, catFilter, companyFilter]);

  const grouped = useMemo(() => groupByWeek(filtered), [filtered]);

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Timeline</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">Research Timeline</h2>
        <p className="mt-1 text-sm text-stone-500">Your saved articles in chronological order.</p>
      </div>

      {/* Filters */}
      {savedItems.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {/* Category filter */}
          <div className="flex flex-wrap gap-1">
            {["All", ...categories].map((cat) => (
              <button key={cat} onClick={() => setCatFilter(cat)}
                className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                  catFilter === cat
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700"
                }`}>
                {cat === "All" ? "All Categories" : (
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${CAT_DOT[cat] || "bg-stone-500"}`} />
                    {cat}
                  </span>
                )}
              </button>
            ))}
          </div>
          {companies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {["All", ...companies].map((co) => (
                <button key={co} onClick={() => setCompanyFilter(co)}
                  className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                    companyFilter === co
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700"
                  }`}>
                  {co === "All" ? "All Companies" : co}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {savedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 py-24 text-center">
          <p className="text-sm font-semibold text-stone-500">No saved articles yet</p>
          <p className="mt-1 text-xs text-stone-400">Save articles in the Research tab to build your timeline.</p>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-10">
        {grouped.map(([weekStart, items]) => (
          <div key={weekStart}>
            {/* Week label */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold text-stone-500">
                Week of {formatWeek(weekStart)}
              </span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            {/* Items in this week */}
            <div className="relative space-y-3 pl-6">
              {/* Vertical line */}
              <div className="absolute left-0 top-2 bottom-2 w-px bg-stone-200" />

              {items.map((item) => {
                const isOpen = expandedId === item.id;
                const dot = CAT_DOT[item.category] || "bg-stone-500";
                const bar = CAT_BAR[item.category] || "bg-stone-600";
                return (
                  <div key={item.id} className="relative">
                    {/* Timeline node */}
                    <div className={`absolute -left-[19px] top-4 h-2.5 w-2.5 rounded-full border-2 border-stone-50 ${dot}`} />

                    <div className={`overflow-hidden rounded border transition-colors ${
                      isOpen ? "border-stone-300 bg-white" : "border-stone-200 bg-white hover:border-stone-300"
                    }`}>
                      <div className={`h-0.5 w-full ${bar}`} />
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            {item.url ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer"
                                className="text-[13px] font-semibold leading-snug text-stone-700 hover:text-amber-700 transition-colors">
                                {item.title}
                              </a>
                            ) : (
                              <p className="text-[13px] font-semibold leading-snug text-stone-700">{item.title}</p>
                            )}
                            <p className="mt-0.5 text-[11px] text-stone-600">
                              {item.category} · {item.source} · {item.date}
                              {item.companyName && <span className="ml-2 font-medium text-stone-500">{item.companyName}</span>}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button onClick={() => setExpandedId(isOpen ? null : item.id)}
                              className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors">
                              <svg className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                            <button onClick={() => onRemove(item.id)}
                              className="rounded p-1 text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
                            <div>
                              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-600">Company</label>
                              <Input value={item.companyName || ""} onChange={(e) => onUpdateCompany(item.id, e.target.value)}
                                placeholder="e.g. Apple" className="h-auto border-stone-200 bg-stone-50 px-3 py-1.5 text-[12px] text-stone-700 placeholder:text-stone-300 focus-visible:border-amber-400" />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-600">Research Notes</label>
                              <Textarea value={item.notes || ""} onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                                placeholder="Add your analysis…" rows={3}
                                className="resize-none border-stone-200 bg-stone-50 text-[12px] text-stone-700 placeholder:text-stone-300 focus-visible:border-amber-600/50" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
