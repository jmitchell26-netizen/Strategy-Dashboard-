// CompanyProfileView.jsx — Professional research-report layout for AI company profiles.
// Renders a clean document style (no coloured gradient cards). Exports:
//   default CompanyProfileView  — full report (used inside the modal)
//   CompanyProfilePreview       — compact excerpt + mini radar (used in the panel card)

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { parseSignalScores } from "../utils/profileParsing";

// ─── Parsers ─────────────────────────────────────────────────────────────────

/** Split raw markdown into sections by ## heading. */
function parseMarkdownSections(markdown) {
  const lines = markdown.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (current) sections.push(current);
      current = { rawHeading: line.replace(/^##\s+/, "").replace(/\*\*/g, "").trim(), lines: [] };
    } else if (/^---+$/.test(line.trim())) {
      // skip dividers
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

/** Extract bullet points from lines, stripping markdown syntax. */
function extractBullets(lines) {
  const bullets = [];
  let cur = "";
  for (const line of lines) {
    const t = line.trim();
    if (/^[-*•]\s+/.test(t)) {
      if (cur) bullets.push(cur.trim());
      cur = t.replace(/^[-*•]\s+/, "").replace(/\*\*/g, "");
    } else if (t && cur) {
      cur += " " + t.replace(/\*\*/g, "");
    } else if (!t && cur) {
      bullets.push(cur.trim());
      cur = "";
    }
  }
  if (cur) bullets.push(cur.trim());
  return bullets.filter(Boolean);
}

/** Extract prose paragraphs (joined non-bullet lines). */
function extractProse(lines) {
  const paras = [];
  let cur = [];
  for (const line of lines) {
    const t = line.trim().replace(/\*\*/g, "").replace(/^#+\s*/, "");
    if (t) { cur.push(t); }
    else if (cur.length) { paras.push(cur.join(" ")); cur = []; }
  }
  if (cur.length) paras.push(cur.join(" "));
  return paras.filter(Boolean);
}

/** Return first ~260 characters of content, cut at a sentence boundary. */
function excerptLines(lines, maxChars = 260) {
  const text = lines
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("-") && !l.startsWith("*"))
    .join(" ")
    .replace(/\*\*/g, "");
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const dot = cut.lastIndexOf(".");
  return dot > maxChars * 0.6 ? cut.slice(0, dot + 1) : cut + "…";
}

function isScoresSection(heading) {
  return heading.toLowerCase().includes("signal score");
}

// ─── Signal Scores visualisation ─────────────────────────────────────────────

function MiniRadar({ scores }) {
  const data = Object.entries(scores).map(([metric, s]) => ({ metric, value: s.value, fullMark: 10 }));
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={180}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#e7e5e4" strokeOpacity={0.5} />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "#78716c", fontSize: 9, fontWeight: 500 }}
        />
        <Radar dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.12} strokeWidth={1.5} />
        <RechartsTooltip
          contentStyle={{ background: "#1c1917", border: "1px solid #44403c", borderRadius: 8, fontSize: 11 }}
          labelStyle={{ color: "#1c1917" }}
          itemStyle={{ color: "#f59e0b" }}
          formatter={(v) => [`${v} / 10`]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function FullRadar({ scores }) {
  const data = Object.entries(scores).map(([metric, s]) => ({ metric, value: s.value, fullMark: 10 }));
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e7e5e4" strokeOpacity={0.5} />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "#78716c", fontSize: 10, fontWeight: 500 }}
        />
        <Radar dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
        <RechartsTooltip
          contentStyle={{ background: "#1c1917", border: "1px solid #44403c", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#1c1917" }}
          itemStyle={{ color: "#f59e0b" }}
          formatter={(v) => [`${v} / 10`]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function ScoreBars({ scores, showRationale = false }) {
  return (
    <div className={`grid grid-cols-1 gap-3 ${showRationale ? "" : "sm:grid-cols-2"}`}>
      {Object.entries(scores).map(([label, { value, rationale }]) => {
        const isRisk = label.toLowerCase().includes("risk");
        const pct = value * 10;
        const barColor = isRisk
          ? pct > 60 ? "bg-red-500" : pct > 40 ? "bg-amber-500" : "bg-emerald-500"
          : pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400";
        return (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="font-medium text-stone-600">{label}</span>
              <span className="tabular-nums text-stone-500">{value}/10</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
              <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            {showRationale && rationale && (
              <p className="pt-0.5 text-[11px] leading-relaxed text-stone-500">{rationale}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Document section renderer ───────────────────────────────────────────────

function DocSection({ heading, lines, isFirst }) {
  const isAnalyst = heading.toLowerCase().includes("analyst");
  const isOverview = heading.toLowerCase().includes("executive");
  const bullets = extractBullets(lines);
  const prose = extractProse(lines);

  // Choose bullets vs prose: prefer bullets if the AI produced them
  const useBullets = bullets.length > 0 && (prose.length === 0 || bullets.length >= 2);

  return (
    <div className={`${!isFirst ? "border-t border-stone-800 pt-5" : ""} pb-5`}>
      {/* Section label */}
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
        {heading}
      </p>

      {isAnalyst ? (
        /* Analyst's Take — blockquote style */
        <div className="border-l-[3px] border-amber-700/60 pl-4">
          <div className="space-y-2">
            {prose.map((p, i) => (
              <p key={i} className="text-[13px] italic leading-relaxed text-stone-700">{p}</p>
            ))}
          </div>
        </div>
      ) : useBullets ? (
        <div className="space-y-2.5">
          {bullets.map((b, i) => {
            // "Key Themes" format: "Label — description"
            const sepIdx = b.search(/ [—–] /);
            const label = sepIdx > 0 ? b.slice(0, sepIdx).trim() : null;
            const desc = sepIdx > 0 ? b.slice(sepIdx + 3).trim() : b;
            return (
              <div key={i} className="flex gap-3 items-start">
                <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-stone-600" />
                <p className="text-[13px] leading-relaxed text-stone-800">
                  {label && (
                    <span className="font-semibold text-stone-700">{label}{" — "}</span>
                  )}
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {prose.map((p, i) => (
            <p
              key={i}
              className={`leading-relaxed text-stone-800 ${isOverview ? "text-[14px]" : "text-[13px]"}`}
            >
              {p}
            </p>
          ))}
          {!prose.length && (
            <p className="text-[12px] italic text-stone-600">(Limited data — flagged for further research)</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Compact preview (shown in the panel card) ───────────────────────────────

export function CompanyProfilePreview({ markdown }) {
  const sections = parseMarkdownSections(markdown);
  const scores = parseSignalScores(markdown);
  const hasScores = Object.keys(scores).length > 0;

  const execSection = sections.find((s) => s.rawHeading.toLowerCase().includes("executive"));
  const excerpt = excerptLines(execSection?.lines ?? sections[0]?.lines ?? []);

  return (
    <div className="space-y-4">
      {excerpt && (
        <p className="text-[13px] leading-relaxed text-stone-700">{excerpt}</p>
      )}

      {hasScores && (
        <div className="rounded-xl border border-stone-200 bg-white p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
            Signal Scores
          </p>
          <MiniRadar scores={scores} />
          <div className="mt-3">
            <ScoreBars scores={scores} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Full document view (used inside the modal) ──────────────────────────────

export default function CompanyProfileView({ markdown }) {
  if (!markdown) return null;

  const sections = parseMarkdownSections(markdown);
  const scores = parseSignalScores(markdown);
  const hasScores = Object.keys(scores).length > 0;
  const visibleSections = sections.filter((s) => !isScoresSection(s.rawHeading));

  if (!sections.length) {
    return <p className="text-[13px] text-stone-800">{markdown}</p>;
  }

  return (
    <div>
      {/* Signal scores panel */}
      {hasScores && (
        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
            Signal Scores
          </p>
          <FullRadar scores={scores} />
          <div className="mt-4">
            <ScoreBars scores={scores} showRationale={true} />
          </div>
        </div>
      )}

      {/* Report sections */}
      {visibleSections.map((s, i) => (
        <DocSection key={i} heading={s.rawHeading} lines={s.lines} isFirst={i === 0} />
      ))}
    </div>
  );
}
