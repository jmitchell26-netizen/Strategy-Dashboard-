// ThesisBuilderTab.jsx — Build investment theses by grouping saved articles; AI synthesis per thesis.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { generateThesisSummary, isLlmConfigured } from "../api/openaiCompanyProfile";


const CAT_DOT = {
  "Product Strategy":"bg-violet-400","Expansion":"bg-emerald-400","Financial":"bg-sky-400",
  "Market Entry":"bg-amber-400","R&D":"bg-rose-400","Content Strategy":"bg-fuchsia-400",
  "Product Launch":"bg-cyan-400","M&A":"bg-orange-400","General":"bg-indigo-400",
};

function parseSummarySection(markdown) {
  const lines = markdown.split("\n");
  const sections = [];
  let current = null;
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^##\s+/, "").trim(), lines: [] };
    } else if (current) current.lines.push(line);
  }
  if (current) sections.push(current);
  return sections;
}

function ThesisSummaryView({ text }) {
  const sections = parseSummarySection(text);
  const COLORS = {
    "evidence supporting": "text-emerald-400",
    "evidence against": "text-red-400",
    "what would have": "text-amber-400",
  };
  return (
    <div className="space-y-4 mt-4">
      {sections.map((s, i) => {
        const key = Object.keys(COLORS).find((k) => s.heading.toLowerCase().includes(k));
        const color = COLORS[key] || "text-stone-400";
        const bullets = s.lines.filter((l) => /^[-*•]\s/.test(l.trim())).map((l) => l.trim().replace(/^[-*•]\s+/, "").replace(/\*\*/g, ""));
        const prose = s.lines.filter((l) => !/^[-*•]\s/.test(l.trim()) && l.trim()).map((l) => l.trim().replace(/\*\*/g, ""));
        return (
          <div key={i} className="border-t border-stone-100 pt-3">
            <p className={`mb-2 text-[10px] font-bold uppercase tracking-[0.12em] ${color}`}>{s.heading}</p>
            {bullets.length > 0 ? (
              <div className="space-y-1.5">
                {bullets.map((b, j) => (
                  <div key={j} className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-600" />
                    <p className="text-[12px] leading-relaxed text-stone-600">{b}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {prose.map((p, j) => <p key={j} className="text-[12px] leading-relaxed text-stone-400">{p}</p>)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ThesisBuilderTab({ savedItems, theses, setTheses }) {
  const [focusedThesis, setFocusedThesis] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [error, setError] = useState(null);

  function createThesis() {
    const id = Date.now().toString();
    setTheses((prev) => [...prev, { id, title: "New Thesis", hypothesis: "", articleIds: [], aiSummary: null }]);
    setFocusedThesis(id);
  }

  function updateThesis(id, patch) {
    setTheses((prev) => prev.map((t) => t.id === id ? { ...t, ...patch } : t));
  }

  function deleteThesis(id) {
    setTheses((prev) => prev.filter((t) => t.id !== id));
    if (focusedThesis === id) setFocusedThesis(null);
  }

  function toggleArticle(thesisId, articleId) {
    setTheses((prev) => prev.map((t) => {
      if (t.id !== thesisId) return t;
      const has = t.articleIds.includes(articleId);
      return { ...t, articleIds: has ? t.articleIds.filter((id) => id !== articleId) : [...t.articleIds, articleId] };
    }));
  }

  async function handleSynthesize(thesis) {
    if (!isLlmConfigured()) return;
    setGeneratingId(thesis.id);
    setError(null);
    try {
      const articles = savedItems.filter((i) => thesis.articleIds.includes(i.id));
      const text = await generateThesisSummary(thesis.title, thesis.hypothesis, articles);
      updateThesis(thesis.id, { aiSummary: text });
    } catch (e) {
      setError(e.message);
    } finally {
      setGeneratingId(null);
    }
  }

  const focused = theses.find((t) => t.id === focusedThesis);

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">

      {/* ── Left: thesis list ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">Thesis Builder</p>
            <h2 className="mt-0.5 text-lg font-bold text-stone-900">Your Theses</h2>
          </div>
          <Button onClick={createThesis} size="sm"
            className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100">
            + New
          </Button>
        </div>

        {theses.length === 0 && (
          <div className="rounded border border-dashed border-stone-200 py-12 text-center">
            <p className="text-sm text-stone-400">Create a thesis to start grouping articles.</p>
          </div>
        )}

        {theses.map((thesis) => {
          const isActive = focusedThesis === thesis.id;
          return (
            <div
              key={thesis.id}
              onClick={() => setFocusedThesis(thesis.id)}
              className={`cursor-pointer overflow-hidden rounded border transition-all ${
                isActive ? "border-amber-300 bg-amber-50" : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              {isActive && <div className="h-0.5 w-full bg-amber-400" />}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[13px] font-semibold ${isActive ? "text-amber-700" : "text-stone-700"}`}>
                    {thesis.title || "Untitled"}
                  </p>
                  <button onClick={(e) => { e.stopPropagation(); deleteThesis(thesis.id); }}
                    className="rounded p-0.5 text-stone-300 hover:text-red-500 transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="mt-0.5 text-[11px] text-stone-400">
                  {thesis.articleIds.length} article{thesis.articleIds.length !== 1 ? "s" : ""}
                  {thesis.aiSummary && <span className="ml-2 text-emerald-600">· AI synthesised</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Right: thesis workspace ── */}
      {!focused ? (
        <div className="flex flex-col items-center justify-center rounded border border-dashed border-stone-200 py-24 text-center">
          <p className="text-sm font-semibold text-stone-500">Select or create a thesis</p>
          <p className="mt-1 text-xs text-stone-400">Click a thesis on the left to open the workspace.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Title + Hypothesis */}
          <div className="rounded border border-stone-200 bg-white p-5">
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Thesis Title</label>
                <input
                  value={focused.title}
                  onChange={(e) => updateThesis(focused.id, { title: e.target.value })}
                  className="w-full rounded border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-800 focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. Apple is pivoting to services"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Hypothesis</label>
                <Textarea
                  value={focused.hypothesis}
                  onChange={(e) => updateThesis(focused.id, { hypothesis: e.target.value })}
                  placeholder="State your thesis in 1–3 sentences. What do you believe is true and why does it matter strategically?"
                  rows={3}
                  className="resize-none border-stone-200 bg-stone-50 text-[13px] text-stone-700 placeholder:text-stone-300 focus-visible:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-stone-100 pt-4">
              <Button
                onClick={() => handleSynthesize(focused)}
                disabled={generatingId === focused.id || !isLlmConfigured() || focused.articleIds.length === 0}
                size="sm"
                className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40"
              >
                {generatingId === focused.id ? <><Spinner className="mr-2 h-3.5 w-3.5" />Synthesising…</> : "AI Synthesise"}
              </Button>
              <p className="text-[11px] text-stone-400">
                {focused.articleIds.length === 0 ? "Add articles below first." : `${focused.articleIds.length} articles selected.`}
              </p>
            </div>

            {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}
          </div>

          {/* AI Summary */}
          {focused.aiSummary && (
            <div className="rounded border border-stone-200 bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">AI Synthesis</p>
              <ThesisSummaryView text={focused.aiSummary} />
            </div>
          )}

          {/* Article pool */}
          <div className="rounded border border-stone-200 bg-white p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
              Article Pool — click to add/remove from thesis
            </p>
            {savedItems.length === 0 ? (
              <p className="text-[12px] text-stone-400">Save articles in the Research tab to add them here.</p>
            ) : (
              <div className="space-y-2">
                {savedItems.map((item) => {
                  const isAdded = focused.articleIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleArticle(focused.id, item.id)}
                      className={`flex cursor-pointer items-start gap-3 rounded border p-3 transition-all ${
                        isAdded
                          ? "border-amber-300 bg-amber-50"
                          : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isAdded ? "border-amber-400 bg-amber-400" : "border-stone-300"
                      }`}>
                        {isAdded && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium leading-snug text-stone-700 line-clamp-2">{item.title}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-stone-400">
                          <span className={`h-1.5 w-1.5 rounded-full ${CAT_DOT[item.category] || "bg-stone-400"}`} />
                          {item.category} · {item.source} · {item.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
