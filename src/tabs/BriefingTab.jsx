// BriefingTab.jsx — AI-generated daily morning briefing from the live feed.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { generateMorningBriefing, isLlmConfigured } from "../api/openaiCompanyProfile";

// Section heading → display label (all rendered with the same neutral style)
const SECTION_LABELS = {
  "top stories":    "Top Stories",
  "key themes":     "Key Themes Today",
  "companies":      "Companies to Watch",
  "market signals": "Market Signals",
  "editor":         "Editor's Take",
};

function getSectionLabel(heading) {
  const h = heading.toLowerCase();
  for (const [key, label] of Object.entries(SECTION_LABELS)) {
    if (h.includes(key)) return label;
  }
  return heading;
}

function parseSections(markdown) {
  const lines = markdown.split("\n");
  const sections = [];
  let current = null;
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^##\s+/, "").replace(/\*\*/g, "").trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

function extractBullets(lines) {
  const items = [];
  let cur = "";
  for (const line of lines) {
    const t = line.trim();
    if (/^[-*•]\s+/.test(t)) {
      if (cur) items.push(cur.trim());
      cur = t.replace(/^[-*•]\s+/, "").replace(/\*\*/g, "");
    } else if (t && cur) {
      cur += " " + t.replace(/\*\*/g, "");
    } else if (!t && cur) { items.push(cur.trim()); cur = ""; }
  }
  if (cur) items.push(cur.trim());
  return items.filter(Boolean);
}

function extractProse(lines) {
  const paras = [];
  let cur = [];
  for (const line of lines) {
    const t = line.trim().replace(/\*\*/g, "").replace(/^#+\s*/, "");
    if (t) cur.push(t);
    else if (cur.length) { paras.push(cur.join(" ")); cur = []; }
  }
  if (cur.length) paras.push(cur.join(" "));
  return paras.filter(Boolean);
}

function BriefingSection({ heading, lines, isFirst }) {
  const label = getSectionLabel(heading);
  const bullets = extractBullets(lines);
  const prose = extractProse(lines);
  const useBullets = bullets.length > 0;
  const isEditor = heading.toLowerCase().includes("editor");

  return (
    <div className={`${isFirst ? "" : "border-t border-stone-200 pt-5"} pb-5`}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600/80">{label}</p>

      {isEditor ? (
        <div className="border-l-[3px] border-amber-300 pl-4">
          {prose.map((p, i) => (
            <p key={i} className="text-[13px] italic leading-relaxed text-stone-600">{p}</p>
          ))}
        </div>
      ) : useBullets ? (
        <div className="space-y-2.5">
          {bullets.map((b, i) => {
            const boldMatch = b.match(/^\*{0,2}(.+?)\*{0,2}\s*[—–]\s*(.+)/);
            const headline = boldMatch ? boldMatch[1].trim() : null;
            const body = boldMatch ? boldMatch[2].trim() : b;
            return (
              <div key={i} className="flex gap-3 items-start">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-stone-600" />
                <p className="text-[13px] leading-relaxed text-stone-700">
                  {headline && <span className="font-semibold text-stone-800">{headline} — </span>}
                  {body}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {prose.map((p, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-stone-600">{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BriefingTab({ feedArticles, briefing, setBriefing }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const isToday = briefing?.date === new Date().toDateString();

  async function handleGenerate() {
    if (!isLlmConfigured()) return;
    setGenerating(true);
    setError(null);
    try {
      const text = await generateMorningBriefing(feedArticles);
      setBriefing({ text, date: new Date().toDateString(), generatedAt: new Date().toISOString(), articleCount: feedArticles.length });
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  const sections = briefing?.text ? parseSections(briefing.text) : [];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">Morning Briefing</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">{today}</h2>
          {briefing && (
            <p className="mt-1 text-xs text-stone-400">
              {isToday ? "Generated today" : "From " + new Date(briefing.generatedAt).toLocaleDateString()}
              {" · "}{briefing.articleCount} articles analysed
              {!isToday && <span className="ml-2 text-amber-600"> · Stale — regenerate for today's feed</span>}
            </p>
          )}
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating || !isLlmConfigured() || feedArticles.length === 0}
          variant="outline"
          size="sm"
          className="shrink-0 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 disabled:opacity-40"
        >
          {generating
            ? <><Spinner className="mr-2 h-3.5 w-3.5" />Generating…</>
            : briefing ? "Regenerate" : "Generate Briefing"}
        </Button>
      </div>

      {!isLlmConfigured() && (
        <div className="mb-6 rounded-xl border border-stone-200 bg-white/60 px-4 py-3 text-sm text-stone-400">
          Configure an LLM in <code className="rounded bg-stone-100 px-1 text-xs text-stone-600">.env</code> to generate briefings.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Generating skeleton */}
      {generating && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${i > 0 ? "border-t border-stone-200 pt-5" : ""} space-y-2`}>
              <Skeleton className="h-2.5 w-24 bg-stone-100" />
              <div className="space-y-1.5 pt-1">
                {Array.from({ length: i === 4 ? 2 : 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-full bg-stone-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Briefing content */}
      {!generating && sections.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white px-6 py-5">
          {sections.map((s, i) => (
            <BriefingSection key={i} heading={s.heading} lines={s.lines} isFirst={i === 0} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!generating && !briefing && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 py-24 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200 bg-white">
            <svg className="h-5 w-5 text-stone-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-stone-500">No briefing yet</p>
          <p className="mt-1 text-xs text-stone-600">Press "Generate Briefing" to summarise today's feed in seconds.</p>
        </div>
      )}
    </div>
  );
}
