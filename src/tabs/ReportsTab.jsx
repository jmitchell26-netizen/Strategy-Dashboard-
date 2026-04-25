// ReportsTab.jsx — Build and export research reports from saved articles and AI profiles.

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { generateReportSummary, isLlmConfigured } from "../api/openaiCompanyProfile";

function ReportPreview({ config, companyProfiles, savedItems, execSummary }) {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const selectedProfiles = config.companies
    .map((key) => companyProfiles[key])
    .filter(Boolean);
  const selectedArticles = config.includeArticles
    ? savedItems.filter((i) => {
        const co = (i.companyName || "").trim().toLowerCase();
        return config.companies.some((key) => companyProfiles[key]?.displayName.toLowerCase() === co || key === co);
      })
    : [];

  return (
    <div className="space-y-8 text-stone-800">
      {/* Title */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-xl font-bold text-stone-900">{config.title || "Strategy Intelligence Report"}</h1>
        <p className="mt-1 text-sm text-stone-500">{today} · {selectedProfiles.length} companies</p>
      </div>

      {/* Executive Summary */}
      {execSummary && (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Executive Summary</p>
          <div className="space-y-2">
            {execSummary.split("\n").filter(Boolean).map((p, i) => (
              <p key={i} className="text-[13px] leading-relaxed text-stone-300">{p.replace(/\*\*/g, "")}</p>
            ))}
          </div>
        </div>
      )}

      {/* Company sections */}
      {selectedProfiles.map((prof) => (
        <div key={prof.displayName} className="border-t border-stone-800 pt-6">
          <h2 className="mb-1 text-base font-bold text-stone-900">{prof.displayName}</h2>
          <p className="text-[11px] text-stone-600">Updated {new Date(prof.updatedAt).toLocaleDateString()}</p>
          {prof.summary && (
            <div className="mt-3 text-[13px] leading-relaxed text-stone-400 line-clamp-6">
              {prof.summary.replace(/^##.+$/gm, "").replace(/\*\*/g, "").slice(0, 600)}…
            </div>
          )}
        </div>
      ))}

      {/* Supporting articles */}
      {config.includeArticles && selectedArticles.length > 0 && (
        <div className="border-t border-stone-800 pt-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Supporting Articles</p>
          <div className="space-y-2">
            {selectedArticles.map((a) => (
              <div key={a.id} className="flex gap-3 text-[12px]">
                <span className="shrink-0 tabular-nums text-stone-600">{a.date}</span>
                <span className="text-stone-400">{a.title}</span>
                <span className="ml-auto shrink-0 text-stone-600">{a.source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research notes */}
      {config.includeNotes && (
        <div className="border-t border-stone-800 pt-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Research Notes</p>
          {savedItems.filter((i) => i.notes?.trim()).map((i) => (
            <div key={i.id} className="mb-3">
              <p className="text-[12px] font-medium text-stone-300">{i.title}</p>
              <p className="mt-1 text-[12px] text-stone-500 italic">{i.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildMarkdown(config, companyProfiles, savedItems, execSummary) {
  const today = new Date().toLocaleDateString();
  let md = `# ${config.title || "Strategy Intelligence Report"}\n_${today}_\n\n`;
  if (execSummary) md += `## Executive Summary\n${execSummary}\n\n`;
  for (const key of config.companies) {
    const prof = companyProfiles[key];
    if (!prof) continue;
    md += `---\n\n${prof.summary || ""}\n\n`;
  }
  if (config.includeArticles) {
    const articles = savedItems.filter((i) => {
      const co = (i.companyName || "").trim().toLowerCase();
      return config.companies.some((key) => companyProfiles[key]?.displayName.toLowerCase() === co || key === co);
    });
    if (articles.length) {
      md += `## Supporting Articles\n`;
      for (const a of articles) md += `- ${a.date} — **${a.title}** (${a.source})\n`;
      md += "\n";
    }
  }
  if (config.includeNotes) {
    const noted = savedItems.filter((i) => i.notes?.trim());
    if (noted.length) {
      md += `## Research Notes\n`;
      for (const i of noted) md += `**${i.title}**\n> ${i.notes}\n\n`;
    }
  }
  return md;
}

export default function ReportsTab({ savedItems, companyProfiles }) {
  const profileList = useMemo(() =>
    Object.entries(companyProfiles)
      .filter(([, p]) => p?.summary)
      .map(([key, p]) => ({ key, name: p.displayName })),
    [companyProfiles]
  );

  const [config, setConfig] = useState({
    title: "",
    companies: [],
    includeArticles: true,
    includeNotes: true,
  });
  const [execSummary, setExecSummary] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  function toggleCompany(key) {
    setConfig((c) => ({
      ...c,
      companies: c.companies.includes(key) ? c.companies.filter((k) => k !== key) : [...c.companies, key],
    }));
    setExecSummary("");
  }

  async function handleGenExecSummary() {
    if (config.companies.length < 2) return;
    setGenerating(true);
    setError(null);
    try {
      const companies = config.companies.map((key) => ({
        name: companyProfiles[key].displayName,
        summary: companyProfiles[key].summary,
      }));
      const text = await generateReportSummary(companies);
      setExecSummary(text);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopyMarkdown() {
    const md = buildMarkdown(config, companyProfiles, savedItems, execSummary);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const canPreview = config.companies.length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      {/* ── Builder panel ── */}
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">Reports</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-stone-900">Report Builder</h2>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-stone-600">Report Title</label>
          <input
            value={config.title}
            onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
            placeholder="Strategy Intelligence Report"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[13px] text-stone-700 placeholder:text-stone-300 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Companies */}
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-stone-600">
            Include Companies ({config.companies.length} selected)
          </label>
          {profileList.length === 0 ? (
            <p className="text-[12px] text-stone-600">Generate AI profiles first in the Research tab.</p>
          ) : (
            <div className="space-y-1.5">
              {profileList.map((p) => {
                const isOn = config.companies.includes(p.key);
                return (
                  <label key={p.key} className="flex cursor-pointer items-center gap-2.5 rounded border border-stone-200 bg-white px-3 py-2 hover:border-stone-300 transition-colors">
                    <div className={`h-4 w-4 rounded border-2 transition-colors flex items-center justify-center ${
                      isOn ? "border-amber-400 bg-amber-400" : "border-stone-300 bg-transparent"
                    }`} onClick={() => toggleCompany(p.key)}>
                      {isOn && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                    </div>
                    <span className="text-[13px] text-stone-700">{p.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-stone-600">Include</label>
          {[
            { key: "includeArticles", label: "Supporting articles" },
            { key: "includeNotes", label: "Research notes" },
          ].map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5">
              <div className={`h-4 w-4 rounded border-2 transition-colors flex items-center justify-center ${
                config[key] ? "border-amber-400 bg-amber-400" : "border-stone-300 bg-transparent"
              }`} onClick={() => setConfig((c) => ({ ...c, [key]: !c[key] }))}>
                {config[key] && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
              </div>
              <span className="text-[13px] text-stone-400">{label}</span>
            </label>
          ))}
        </div>

        {error && <p className="text-[12px] text-red-400">{error}</p>}

        {/* Actions */}
        <div className="space-y-2 border-t border-stone-200 pt-4">
          <Button
            onClick={handleGenExecSummary}
            disabled={generating || config.companies.length < 2 || !isLlmConfigured()}
            variant="outline"
            className="w-full border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40"
            size="sm"
          >
            {generating ? <><Spinner className="mr-2 h-3.5 w-3.5" />Generating…</> : "Generate Executive Summary"}
          </Button>
          <Button onClick={handleCopyMarkdown} disabled={!canPreview} variant="outline"
            className="w-full border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-800" size="sm">
            {copied ? "✓ Copied!" : "Copy as Markdown"}
          </Button>
          <Button onClick={() => window.print()} disabled={!canPreview} variant="outline"
            className="w-full border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-800" size="sm">
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* ── Preview panel ── */}
      <div className="rounded border border-stone-200 bg-white p-6 min-h-[400px]">
        {!canPreview ? (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-stone-500">Report preview</p>
            <p className="mt-1 text-xs text-stone-400">Select at least one company to see a preview.</p>
          </div>
        ) : (
          <ReportPreview
            config={config}
            companyProfiles={companyProfiles}
            savedItems={savedItems}
            execSummary={execSummary}
          />
        )}
      </div>
    </div>
  );
}
