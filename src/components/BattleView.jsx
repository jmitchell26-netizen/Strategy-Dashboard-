// BattleView.jsx — Full-screen modal that compares two saved strategy items side-by-side.
// Generates 6 success metrics for each item (based on its category and a deterministic hash),
// then renders animated bars showing which item wins each metric.
// Displays a scoreboard and a final verdict at the bottom.

// Maps each category to its Tailwind dot color (reused from StrategyMatrix)
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

// Simple string hashing function.
// Produces a deterministic positive integer from any string input.
// Used to generate consistent (non-random) metric scores for each article.
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Generates an array of 6 metric objects for a given item.
// Each metric has: { label, value (10–95), color }.
// Scores are deterministic (same article always gets the same scores) and
// boosted by category — e.g. M&A articles score higher on disruption and risk.
function generateMetrics(item) {
  // Create a seed from the item's ID + title so scores are consistent across renders
  const seed = hashString(item.id + item.title);
  // Seeded pseudo-random function: given an offset, returns a number 1–100
  // Uses the Knuth multiplicative hash constant (2654435761) for good distribution
  const seeded = (offset) => ((seed + offset * 2654435761) % 100) + 1;

  // Category-specific score boosts — each category excels in different areas
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
  // Clamp values between 10 and 95 so bars are always visible and never overflow
  const clamp = (v) => Math.max(10, Math.min(95, v));

  return [
    { label: "Strategic Impact", value: clamp(seeded(1) % 60 + 40 + (boosts.disruption || 0)), color: "violet" },
    { label: "Market Disruption", value: clamp(seeded(2) % 50 + 30 + (boosts.disruption || 0)), color: "blue" },
    { label: "Innovation Score", value: clamp(seeded(3) % 55 + 25 + (boosts.innovation || 0)), color: "cyan" },
    { label: "Growth Potential", value: clamp(seeded(4) % 50 + 35 + (boosts.growth || 0)), color: "emerald" },
    { label: "Risk Level", value: clamp(seeded(5) % 60 + 20 + (boosts.risk || 0)), color: "rose" },
    { label: "Competitive Edge", value: clamp(seeded(6) % 50 + 30 + (boosts.competitive || 0)), color: "amber" },
  ];
}

// Tailwind class sets for each metric color — controls the bar fill, glow, and text
const barColors = {
  violet: { bar: "bg-violet-500", glow: "shadow-violet-500/30", text: "text-violet-400" },
  blue: { bar: "bg-blue-500", glow: "shadow-blue-500/30", text: "text-blue-400" },
  cyan: { bar: "bg-cyan-500", glow: "shadow-cyan-500/30", text: "text-cyan-400" },
  emerald: { bar: "bg-emerald-500", glow: "shadow-emerald-500/30", text: "text-emerald-400" },
  rose: { bar: "bg-rose-500", glow: "shadow-rose-500/30", text: "text-rose-400" },
  amber: { bar: "bg-amber-500", glow: "shadow-amber-500/30", text: "text-amber-400" },
};

// MetricBar — Renders a single metric row with a label, score, and animated fill bar.
// The winning side gets a glowing bar + green arrow; the losing side is dimmed.
function MetricBar({ label, value, color, opponentValue }) {
  const c = barColors[color];
  const isWinning = value > opponentValue;  // Does this side beat the opponent?
  const isTied = value === opponentValue;

  return (
    <div className="mb-4 last:mb-0">
      {/* Label and numeric score */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{label}</span>
        <div className="flex items-center gap-1.5">
          {/* Green up-arrow shown only for the winning side */}
          {!isTied && isWinning && (
            <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          )}
          {/* Numeric score — white if winning, dimmed if losing */}
          <span className={`text-[13px] font-bold tabular-nums ${isWinning ? "text-white" : "text-slate-500"}`}>
            {value}
          </span>
        </div>
      </div>
      {/* Animated bar — width transitions in over 1 second with a 0.3s delay for visual effect */}
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${c.bar} ${isWinning ? `shadow-md ${c.glow}` : "opacity-40"}`}
          style={{
            width: `${value}%`,
            transitionDelay: "0.3s",
          }}
        />
      </div>
    </div>
  );
}

// BattleView — The main comparison modal component.
// Props:
//   itemA   — first saved item to compare (left side)
//   itemB   — second saved item to compare (right side)
//   onClose — callback to close the modal
export default function BattleView({ itemA, itemB, onClose }) {
  // Generate metrics for both items
  const metricsA = generateMetrics(itemA);
  const metricsB = generateMetrics(itemB);

  // Count how many of the 6 metrics each side wins
  const winsA = metricsA.filter((m, i) => m.value > metricsB[i].value).length;
  const winsB = metricsB.filter((m, i) => m.value > metricsA[i].value).length;

  return (
    // Full-screen backdrop overlay with blur
    <div className="animate-fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:p-6">
      {/* Modal container — stops click events from closing the modal */}
      <div
        className="animate-slide-up relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c18]/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative ambient glow blobs in the corners */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 -bottom-32 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />

        {/* ===== Modal Header ===== */}
        <div className="relative border-b border-white/[0.06] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Amber gradient icon badge */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Battle View</h2>
                <p className="text-[12px] font-medium text-slate-500">Strategy comparison analysis</p>
              </div>
            </div>
            {/* Close button (X icon) */}
            <button
              onClick={onClose}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scoreboard — shows how many metrics each side won.
              The leader gets a green highlight; ties get amber. */}
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

        {/* ===== Side-by-side comparison body ===== */}
        <div className="relative grid gap-0 sm:grid-cols-2">
          {/* Vertical divider line between the two sides */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent sm:block" />

          {/* ----- Left side: Item A ----- */}
          <div className="border-b border-white/[0.04] p-6 sm:border-b-0 sm:border-r sm:border-white/[0.04] sm:p-8">
            {/* Item A info card */}
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${categoryDot[itemA.category] || "bg-slate-400"}`} />
                <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{itemA.category}</span>
              </div>
              <h3 className="mb-2 text-[15px] leading-snug font-bold text-white">{itemA.title}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="font-medium">{itemA.source}</span>
                <span>·</span>
                <span className="tabular-nums">{itemA.date}</span>
              </div>
              {/* Show the user's research notes if they wrote any */}
              {itemA.notes && (
                <div className="mt-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-[12px] leading-relaxed text-slate-400 italic">
                  "{itemA.notes}"
                </div>
              )}
            </div>

            {/* Item A metric bars */}
            <div>
              {metricsA.map((m, i) => (
                <MetricBar key={m.label} {...m} opponentValue={metricsB[i].value} />
              ))}
            </div>
          </div>

          {/* ----- Right side: Item B ----- */}
          <div className="p-6 sm:p-8">
            {/* Item B info card */}
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${categoryDot[itemB.category] || "bg-slate-400"}`} />
                <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">{itemB.category}</span>
              </div>
              <h3 className="mb-2 text-[15px] leading-snug font-bold text-white">{itemB.title}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="font-medium">{itemB.source}</span>
                <span>·</span>
                <span className="tabular-nums">{itemB.date}</span>
              </div>
              {/* Show the user's research notes if they wrote any */}
              {itemB.notes && (
                <div className="mt-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-[12px] leading-relaxed text-slate-400 italic">
                  "{itemB.notes}"
                </div>
              )}
            </div>

            {/* Item B metric bars */}
            <div>
              {metricsB.map((m, i) => (
                <MetricBar key={m.label} {...m} opponentValue={metricsA[i].value} />
              ))}
            </div>
          </div>
        </div>

        {/* ===== Footer verdict =====
            Declares the overall winner or a tie based on total metrics won. */}
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
