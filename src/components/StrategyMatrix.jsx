// StrategyMatrix.jsx — Displays the user's saved news items as selectable cards.
// Each card shows the article title, metadata, a Research Notes textarea, and a checkbox
// for selecting items to compare in Battle View.
// Shows an empty state when no items have been saved yet.

// Maps each category name to its corresponding Tailwind dot color class
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

// Props:
//   items          — array of saved strategy items (each has id, title, source, date, category, notes)
//   onRemove       — callback to remove an item by id
//   onUpdateNotes  — callback(id, notesText) to update an item's research notes
//   selectedIds    — Set of item IDs currently checked for comparison
//   onToggleSelect — callback(id) to check/uncheck an item for comparison
//   onCompare      — callback to open the Battle View modal with the 2 selected items
export default function StrategyMatrix({
  items,
  onRemove,
  onUpdateNotes,
  selectedIds,
  onToggleSelect,
  onCompare,
}) {
  // ===== Empty state =====
  // Shown when the user hasn't saved any items yet
  if (items.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01] py-20 text-center backdrop-blur-sm">
        {/* Animated gradient background pulse */}
        <div className="animate-glow-pulse pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-blue-500/[0.03]" />
        <div className="relative">
          {/* Grid icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <svg
              className="h-7 w-7 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Your matrix is empty
          </p>
          <p className="mt-1.5 text-xs text-slate-600">
            Save news items to build your strategy overview
          </p>
        </div>
      </div>
    );
  }

  // Track how many items are currently selected (for the compare toolbar messaging)
  const selCount = selectedIds.size;

  return (
    <div className="space-y-3">

      {/* ===== Compare toolbar =====
          Only shows when there are 2+ items in the matrix.
          Displays selection guidance text and the "Battle View" button. */}
      {items.length >= 2 && (
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 backdrop-blur-sm">
          {/* Dynamic instruction text based on how many items are selected */}
          <p className="text-[12px] font-medium text-slate-500">
            {selCount === 0 && "Select 2 items to compare"}
            {selCount === 1 && "Select 1 more item"}
            {selCount === 2 && "Ready to compare"}
            {selCount > 2 && "Select only 2 items"}
          </p>
          {/* Battle View button — enabled only when exactly 2 items are checked.
              Gets a shimmer animation and amber glow when active. */}
          <button
            onClick={onCompare}
            disabled={selCount !== 2}
            className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-300 ${
              selCount === 2
                ? "animate-shimmer cursor-pointer border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 bg-[length:200%_100%] text-amber-300 shadow-lg shadow-amber-500/10 hover:border-amber-400/50 hover:shadow-amber-500/20 active:scale-95"
                : "cursor-not-allowed border border-white/[0.04] bg-white/[0.02] text-slate-600"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {/* Swap arrows icon */}
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Battle View
            </span>
          </button>
        </div>
      )}

      {/* ===== Saved item cards ===== */}
      {items.map((item, i) => {
        const isSelected = selectedIds.has(item.id); // Whether this card's checkbox is checked
        return (
          <div
            key={item.id}
            // Highlight with amber border/glow when selected for comparison
            className={`animate-fade-in rounded-2xl border p-4 backdrop-blur-xl transition-all duration-200 ${
              isSelected
                ? "border-amber-500/30 bg-amber-500/[0.04] shadow-lg shadow-amber-500/5"
                : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
            }`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* --- Header row: checkbox, title, remove button --- */}
            <div className="mb-2 flex items-start gap-3">
              {/* Selection checkbox — toggles this item for Battle View comparison */}
              <button
                onClick={() => onToggleSelect(item.id)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-200 ${
                  isSelected
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-400"          // Checked state
                    : "border-white/[0.08] bg-white/[0.02] text-transparent hover:border-white/[0.15]" // Unchecked state
                }`}
              >
                {/* Checkmark icon — visible only when selected (text-transparent hides it otherwise) */}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </button>

              {/* Article title */}
              <h3 className="flex-1 text-[13px] leading-snug font-semibold text-slate-200">
                {item.title}
              </h3>

              {/* Remove button — deletes this item from the saved matrix */}
              <button
                onClick={() => onRemove(item.id)}
                className="shrink-0 cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide text-red-400/60 uppercase transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                Remove
              </button>
            </div>

            {/* --- Metadata row: category dot + name, source, date --- */}
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 pl-8 text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-400">
                {/* Colored dot matching the article's category */}
                <span className={`h-1.5 w-1.5 rounded-full ${categoryDot[item.category] || "bg-slate-400"}`} />
                {item.category}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-medium text-slate-500">{item.source}</span>
              <span className="text-slate-600">·</span>
              <span className="tabular-nums text-slate-600">{item.date}</span>
            </div>

            {/* --- Research Notes textarea ---
                Lets the user type their own strategic analysis for this article.
                Notes are persisted to localStorage via the parent's state management. */}
            <div className="pl-8">
              <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                {/* Pencil icon */}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Research Notes
              </label>
              <textarea
                value={item.notes || ""}
                onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                placeholder="Add your analysis…"
                rows={2}
                className="w-full resize-none rounded-xl border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-300 placeholder-slate-600 transition-colors focus:border-violet-500/30 focus:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-violet-500/20"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
