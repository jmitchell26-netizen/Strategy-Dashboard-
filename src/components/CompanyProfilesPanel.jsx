// CompanyProfilesPanel.jsx — Groups saved articles by "Company" tag, generates one AI profile per company,
// and lets the user open a side-by-side comparison of two profiles.

import { useMemo, useState } from "react";
import {
  generateCompanyProfile,
  isLlmConfigured,
  compareProfilesBrief,
} from "../api/openaiCompanyProfile";
import ProfileCompareModal from "./ProfileCompareModal";

function normalizeCompanyKey(name) {
  return (name || "").trim().toLowerCase();
}

export default function CompanyProfilesPanel({ savedItems, companyProfiles, onProfilesChange }) {
  const [generatingKey, setGeneratingKey] = useState(null);
  const [error, setError] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareSelection, setCompareSelection] = useState({ a: "", b: "" });
  const [synthesis, setSynthesis] = useState("");
  const [loadingSynthesis, setLoadingSynthesis] = useState(false);

  const groups = useMemo(() => {
    const map = new Map();
    for (const item of savedItems) {
      const raw = (item.companyName || "").trim();
      if (!raw) continue;
      const key = normalizeCompanyKey(raw);
      if (!map.has(key)) {
        map.set(key, { displayName: raw, items: [] });
      }
      map.get(key).items.push(item);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].displayName.localeCompare(b[1].displayName));
  }, [savedItems]);

  async function handleGenerate(key, displayName, items) {
    setError(null);
    setGeneratingKey(key);
    try {
      const summary = await generateCompanyProfile(displayName, items);
      onProfilesChange((prev) => ({
        ...prev,
        [key]: {
          displayName,
          summary,
          updatedAt: new Date().toISOString(),
        },
      }));
    } catch (e) {
      setError(e.message || "Generation failed");
    } finally {
      setGeneratingKey(null);
    }
  }

  const readyKeys = groups
    .map(([k]) => k)
    .filter((k) => companyProfiles[k]?.summary);

  async function handleSynthesis() {
    if (!compareSelection.a || !compareSelection.b || compareSelection.a === compareSelection.b) return;
    const pa = companyProfiles[compareSelection.a];
    const pb = companyProfiles[compareSelection.b];
    if (!pa?.summary || !pb?.summary) return;
    setLoadingSynthesis(true);
    setSynthesis("");
    try {
      const text = await compareProfilesBrief(
        pa.displayName,
        pa.summary,
        pb.displayName,
        pb.summary
      );
      setSynthesis(text);
    } catch (e) {
      setSynthesis(`Error: ${e.message}`);
    } finally {
      setLoadingSynthesis(false);
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-violet-500/15">
          <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-white">Company profiles (AI)</h3>
      </div>

      <p className="text-[12px] leading-relaxed text-slate-500">
        Tag saved articles with a <span className="font-semibold text-slate-400">Company</span> name. Group
        articles about the same firm, then generate one merged profile. Compare two profiles side by side.
        {!isLlmConfigured() && (
          <span className="mt-1 block text-amber-400/90">
            Add <code className="rounded bg-white/10 px-1 py-0.5 text-[11px]">VITE_OPENAI_API_KEY</code> or
            Ollama (<code className="rounded bg-white/10 px-1 py-0.5 text-[11px]">VITE_LLM_PROVIDER=ollama</code>{" "}
            + optional <code className="rounded bg-white/10 px-1 py-0.5 text-[11px]">VITE_OLLAMA_*</code>) to{" "}
            <code className="rounded bg-white/10 px-1 py-0.5 text-[11px]">.env</code> and restart the dev server.
          </span>
        )}
      </p>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] px-4 py-8 text-center text-[13px] text-slate-600">
          Tag at least one saved article with a company name to build profiles here.
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(([key, { displayName, items }]) => {
            const prof = companyProfiles[key];
            const loading = generatingKey === key;
            return (
              <div
                key={key}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{displayName}</p>
                    <p className="text-[11px] text-slate-500">Articles tagged: {items.length}</p>
                  </div>
                  <button
                    type="button"
                    disabled={loading || !isLlmConfigured()}
                    onClick={() => handleGenerate(key, displayName, items)}
                    className="rounded-xl border border-violet-500/40 bg-violet-500/15 px-3 py-1.5 text-[11px] font-bold text-violet-200 transition-all hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? "Generating…" : prof?.summary ? "Regenerate profile" : "Generate AI profile"}
                  </button>
                </div>
                {prof?.summary && (
                  <p className="text-[11px] text-slate-600">
                    Updated {new Date(prof.updatedAt).toLocaleString()}
                  </p>
                )}
                {prof?.summary && (
                  <div className="mt-2 max-h-[min(28rem,70vh)] overflow-y-auto rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5 text-[12px] leading-relaxed whitespace-pre-wrap text-slate-300">
                    {prof.summary}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {readyKeys.length >= 2 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="mb-3 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
            Compare two profiles
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-[13px] leading-snug text-slate-400">
              Company A
              <select
                value={compareSelection.a}
                onChange={(e) => setCompareSelection((s) => ({ ...s, a: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0c0c14] px-3 py-2 text-sm text-slate-200"
              >
                <option value="">Select…</option>
                {readyKeys.map((k) => (
                  <option key={k} value={k}>
                    {companyProfiles[k].displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 text-[13px] leading-snug text-slate-400">
              Company B
              <select
                value={compareSelection.b}
                onChange={(e) => setCompareSelection((s) => ({ ...s, b: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0c0c14] px-3 py-2 text-sm text-slate-200"
              >
                <option value="">Select…</option>
                {readyKeys.map((k) => (
                  <option key={k} value={k}>
                    {companyProfiles[k].displayName}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={!compareSelection.a || !compareSelection.b || compareSelection.a === compareSelection.b}
              onClick={() => {
                setSynthesis("");
                setCompareOpen(true);
              }}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-200 transition-all hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Open comparison
            </button>
          </div>
        </div>
      )}

      {compareOpen && compareSelection.a && compareSelection.b && (
        <ProfileCompareModal
          companyA={companyProfiles[compareSelection.a].displayName}
          companyB={companyProfiles[compareSelection.b].displayName}
          profileA={companyProfiles[compareSelection.a].summary}
          profileB={companyProfiles[compareSelection.b].summary}
          synthesis={synthesis}
          loadingSynthesis={loadingSynthesis}
          onClose={() => {
            setCompareOpen(false);
            setSynthesis("");
          }}
          onRequestSynthesis={handleSynthesis}
        />
      )}
    </div>
  );
}
