// CompanyProfileView.jsx — Parses AI-generated markdown profile into distinct visual cards per section.
// Each section gets a unique color, icon, and layout based on its content type.

const SECTION_META = {
  "executive overview": {
    icon: "🏢",
    label: "Executive Overview",
    color: "indigo",
    layout: "prose",
    prominent: true,
  },
  "strategic momentum": {
    icon: "📈",
    label: "Strategic Momentum",
    color: "blue",
    layout: "prose",
  },
  "key themes": {
    icon: "🏷️",
    label: "Key Themes",
    color: "violet",
    layout: "chips",
  },
  "risks & headwinds": {
    icon: "⚠️",
    label: "Risks & Headwinds",
    color: "red",
    layout: "bullets",
    bulletIcon: "▲",
  },
  "opportunities & tailwinds": {
    icon: "🚀",
    label: "Opportunities & Tailwinds",
    color: "green",
    layout: "bullets",
    bulletIcon: "↑",
  },
  "competitive & market signals": {
    icon: "⚔️",
    label: "Competitive & Market Signals",
    color: "amber",
    layout: "prose",
  },
  "financial & operational signals": {
    icon: "💰",
    label: "Financial & Operational Signals",
    color: "cyan",
    layout: "bullets",
    bulletIcon: "·",
  },
  "analyst's take": {
    icon: "🔍",
    label: "Analyst's Take",
    color: "violet",
    layout: "spotlight",
  },
  "open questions": {
    icon: "❓",
    label: "Open Questions & Follow-up",
    color: "purple",
    layout: "numbered",
  },
};

const COLOR_MAP = {
  indigo: {
    border: "border-indigo-500/25",
    bg: "bg-indigo-500/8",
    headerBg: "bg-indigo-500/12",
    iconBg: "bg-indigo-500/20",
    iconText: "text-indigo-300",
    label: "text-indigo-300",
    accent: "bg-indigo-500",
    chipBg: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  },
  blue: {
    border: "border-blue-500/25",
    bg: "bg-blue-500/5",
    headerBg: "bg-blue-500/10",
    iconBg: "bg-blue-500/20",
    iconText: "text-blue-300",
    label: "text-blue-300",
    accent: "bg-blue-500",
    chipBg: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  },
  violet: {
    border: "border-violet-500/25",
    bg: "bg-violet-500/5",
    headerBg: "bg-violet-500/10",
    iconBg: "bg-violet-500/20",
    iconText: "text-violet-300",
    label: "text-violet-300",
    accent: "bg-violet-500",
    chipBg: "bg-violet-500/15 border-violet-500/30 text-violet-300",
  },
  red: {
    border: "border-red-500/25",
    bg: "bg-red-500/5",
    headerBg: "bg-red-500/10",
    iconBg: "bg-red-500/20",
    iconText: "text-red-300",
    label: "text-red-300",
    accent: "bg-red-500",
    chipBg: "bg-red-500/15 border-red-500/30 text-red-300",
  },
  green: {
    border: "border-green-500/25",
    bg: "bg-green-500/5",
    headerBg: "bg-green-500/10",
    iconBg: "bg-green-500/20",
    iconText: "text-green-300",
    label: "text-green-300",
    accent: "bg-green-500",
    chipBg: "bg-green-500/15 border-green-500/30 text-green-300",
  },
  amber: {
    border: "border-amber-500/25",
    bg: "bg-amber-500/5",
    headerBg: "bg-amber-500/10",
    iconBg: "bg-amber-500/20",
    iconText: "text-amber-300",
    label: "text-amber-300",
    accent: "bg-amber-500",
    chipBg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  },
  cyan: {
    border: "border-cyan-500/25",
    bg: "bg-cyan-500/5",
    headerBg: "bg-cyan-500/10",
    iconBg: "bg-cyan-500/20",
    iconText: "text-cyan-300",
    label: "text-cyan-300",
    accent: "bg-cyan-500",
    chipBg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  },
  purple: {
    border: "border-purple-500/25",
    bg: "bg-purple-500/5",
    headerBg: "bg-purple-500/10",
    iconBg: "bg-purple-500/20",
    iconText: "text-purple-300",
    label: "text-purple-300",
    accent: "bg-purple-500",
    chipBg: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  },
};

/** Parse raw markdown string into sections keyed by normalized heading. */
function parseMarkdownSections(markdown) {
  const lines = markdown.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    // Match ## headings (skip ### sub-headings — they stay as prose)
    if (/^##\s+/.test(line)) {
      if (current) sections.push(current);
      current = {
        rawHeading: line.replace(/^##\s+/, "").replace(/\*\*/g, "").trim(),
        lines: [],
      };
    } else if (/^---+$/.test(line.trim())) {
      // separator — skip
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

/** Extract bullet items from lines (strips leading -, *, •, **bold**: ) */
function extractBullets(lines) {
  const bullets = [];
  let current = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*•]\s+/.test(trimmed)) {
      if (current) bullets.push(current.trim());
      current = trimmed.replace(/^[-*•]\s+/, "").replace(/\*\*/g, "");
    } else if (trimmed && current) {
      current += " " + trimmed.replace(/\*\*/g, "");
    } else if (!trimmed && current) {
      bullets.push(current.trim());
      current = "";
    }
  }
  if (current) bullets.push(current.trim());
  return bullets.filter(Boolean);
}

/** Extract prose paragraphs (non-bullet lines joined into paragraphs) */
function extractProse(lines) {
  const paras = [];
  let current = [];
  for (const line of lines) {
    const trimmed = line.trim().replace(/\*\*/g, "").replace(/^#+\s*/, "");
    if (trimmed) {
      current.push(trimmed);
    } else if (current.length) {
      paras.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) paras.push(current.join(" "));
  return paras.filter(Boolean);
}

// ─── Sub-renderers ──────────────────────────────────────────────

function ProseSection({ lines, prominent }) {
  const paras = extractProse(lines);
  if (!paras.length) return <p className="text-[12px] italic text-slate-600">(Limited data)</p>;
  return (
    <div className="space-y-2">
      {paras.map((p, i) => (
        <p key={i} className={prominent ? "text-[14px] leading-relaxed text-slate-200" : "text-[13px] leading-relaxed text-slate-300"}>
          {p}
        </p>
      ))}
    </div>
  );
}

function BulletsSection({ lines, bulletIcon, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.indigo;
  const bullets = extractBullets(lines);
  if (!bullets.length) return <p className="text-[12px] italic text-slate-600">(Limited data — flagged for further research)</p>;
  return (
    <div className="space-y-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-2.5">
          <span className={`mt-0.5 shrink-0 text-[11px] font-bold ${c.iconText}`}>{bulletIcon || "·"}</span>
          <p className="text-[13px] leading-relaxed text-slate-300">{b}</p>
        </div>
      ))}
    </div>
  );
}

function ChipsSection({ lines, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.violet;
  const bullets = extractBullets(lines);
  const paras = extractProse(lines);
  const items = bullets.length ? bullets : paras;
  if (!items.length) return <p className="text-[12px] italic text-slate-600">(Limited data)</p>;
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        // Split on " — " or ": " to separate label from description
        const sepIdx = item.search(/ [—–-] | : /);
        const label = sepIdx > 0 ? item.slice(0, sepIdx).trim() : item;
        const desc = sepIdx > 0 ? item.slice(sepIdx).replace(/^[ —–-:]+/, "").trim() : null;
        return (
          <div key={i} className="flex items-start gap-2.5">
            <span className={`mt-0.5 inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${c.chipBg}`}>
              {label}
            </span>
            {desc && <p className="text-[12px] leading-relaxed text-slate-400">{desc}</p>}
          </div>
        );
      })}
    </div>
  );
}

function SpotlightSection({ lines }) {
  const paras = extractProse(lines);
  if (!paras.length) return <p className="text-[12px] italic text-slate-600">(Limited data)</p>;
  return (
    <div className="relative rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 px-4 py-3.5">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl bg-gradient-to-b from-violet-400 to-indigo-500" />
      <div className="space-y-2 pl-2">
        {paras.map((p, i) => (
          <p key={i} className="text-[13px] leading-relaxed text-slate-200 italic">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

function NumberedSection({ lines, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.purple;
  const bullets = extractBullets(lines);
  if (!bullets.length) return <p className="text-[12px] italic text-slate-600">(Limited data)</p>;
  return (
    <div className="space-y-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-2.5">
          <span className={`mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${c.iconBg} ${c.iconText}`}>
            {i + 1}
          </span>
          <p className="text-[13px] leading-relaxed text-slate-300">{b}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────────────

function SectionCard({ section }) {
  const key = section.rawHeading.toLowerCase().trim();
  const meta = Object.entries(SECTION_META).find(([k]) => key.includes(k))?.[1];

  if (!meta) {
    // Fallback for unknown sections
    const paras = extractProse(section.lines);
    if (!paras.length) return null;
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">{section.rawHeading}</p>
        <div className="space-y-1.5">
          {paras.map((p, i) => <p key={i} className="text-[13px] text-slate-300 leading-relaxed">{p}</p>)}
        </div>
      </div>
    );
  }

  const c = COLOR_MAP[meta.color] || COLOR_MAP.indigo;

  return (
    <div className={`rounded-xl border ${c.border} ${meta.prominent ? "bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent" : c.bg} overflow-hidden`}>
      {/* Section header */}
      <div className={`flex items-center gap-2.5 px-4 py-2.5 ${c.headerBg} border-b ${c.border}`}>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base ${c.iconBg}`}>
          {meta.icon}
        </span>
        <span className={`text-[11px] font-bold uppercase tracking-widest ${c.label}`}>
          {meta.label}
        </span>
        <span className={`ml-auto h-1 w-1 rounded-full ${c.accent} opacity-60`} />
      </div>

      {/* Section body */}
      <div className="px-4 py-3.5">
        {meta.layout === "prose" && (
          <ProseSection lines={section.lines} prominent={meta.prominent} />
        )}
        {meta.layout === "bullets" && (
          <BulletsSection lines={section.lines} bulletIcon={meta.bulletIcon} color={meta.color} />
        )}
        {meta.layout === "chips" && (
          <ChipsSection lines={section.lines} color={meta.color} />
        )}
        {meta.layout === "spotlight" && (
          <SpotlightSection lines={section.lines} />
        )}
        {meta.layout === "numbered" && (
          <NumberedSection lines={section.lines} color={meta.color} />
        )}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────

export default function CompanyProfileView({ markdown }) {
  if (!markdown) return null;
  const sections = parseMarkdownSections(markdown);
  if (!sections.length) {
    return <p className="text-[13px] text-slate-400">{markdown}</p>;
  }

  // Put Executive Overview and Analyst's Take full-width; pair others in a 2-col grid
  const prominent = sections.filter(s => {
    const k = s.rawHeading.toLowerCase();
    return k.includes("executive") || k.includes("analyst");
  });
  const grid = sections.filter(s => {
    const k = s.rawHeading.toLowerCase();
    return !k.includes("executive") && !k.includes("analyst");
  });

  return (
    <div className="space-y-3">
      {/* Executive Overview — always first, full width */}
      {prominent.filter(s => s.rawHeading.toLowerCase().includes("executive")).map((s, i) => (
        <SectionCard key={i} section={s} />
      ))}

      {/* 2-column grid for middle sections */}
      {grid.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {grid.map((s, i) => <SectionCard key={i} section={s} />)}
        </div>
      )}

      {/* Analyst's Take — always last, full width spotlight */}
      {prominent.filter(s => s.rawHeading.toLowerCase().includes("analyst")).map((s, i) => (
        <SectionCard key={i} section={s} />
      ))}
    </div>
  );
}
