import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
//   onCompare        — callback to open the Battle View modal with the 2 selected items
//   onUpdateCompany  — callback(id, companyName) to tag an article with a company for AI profiles
export default function StrategyMatrix({
  items,
  onRemove,
  onUpdateNotes,
  onUpdateCompany,
  selectedIds,
  onToggleSelect,
  onCompare,
}) {
  // ===== Empty state =====
  // Shown when the user hasn't saved any items yet
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-800 bg-stone-900/30 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stone-800 bg-stone-900">
          <svg className="h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-stone-500">Your matrix is empty</p>
        <p className="mt-1 text-xs text-stone-600">Save articles from the news feed to get started</p>
      </div>
    );
  }

  // Track how many items are currently selected (for the compare toolbar messaging)
  const selCount = selectedIds.size;

  return (
    <div className="space-y-3">

      {/* ===== Compare toolbar ===== */}
      {items.length >= 2 && (
        <div className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-2.5">
          <p className="text-[12px] font-medium text-stone-500">
            {selCount === 0 && "Select 2 items to compare"}
            {selCount === 1 && "Select 1 more item"}
            {selCount === 2 && "Ready to compare"}
          </p>
          {/* Battle View button — enabled only when exactly 2 items are checked.
              Gets a shimmer animation and amber glow when active. */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onCompare}
                disabled={selCount !== 2}
                variant="outline"
                size="sm"
                className={`transition-all duration-300 ${
                  selCount === 2
                    ? "animate-shimmer border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 bg-[length:200%_100%] text-amber-300 shadow-lg shadow-amber-500/10 hover:border-amber-400/50 hover:bg-amber-500/20"
                    : "border-white/[0.04] bg-white/[0.02] text-slate-600"
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Battle View
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {selCount === 2 ? "Open Battle View comparison" : "Select exactly 2 items to compare"}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* ===== Saved item cards ===== */}
      {items.map((item, i) => {
        const isSelected = selectedIds.has(item.id);
        const dot = categoryDot[item.category];
        return (
          <div
            key={item.id}
            className={`animate-fade-in overflow-hidden rounded-xl border transition-all duration-200 ${
              isSelected
                ? "border-amber-600/40 bg-amber-500/[0.05] shadow-sm shadow-amber-500/5"
                : "border-stone-700/70 bg-stone-900 hover:border-stone-600"
            }`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Category color accent bar */}
            <div className={`h-0.5 w-full ${dot ?? "bg-stone-700"}`} />

            <div className="p-4">
              {/* --- Header row --- */}
              <div className="mb-2.5 flex items-start gap-2.5">
                <button
                  onClick={() => onToggleSelect(item.id)}
                  className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 cursor-pointer items-center justify-center rounded border transition-all duration-200 ${
                    isSelected
                      ? "border-amber-500/60 bg-amber-500/20 text-amber-400"
                      : "border-stone-600 bg-stone-800 text-transparent hover:border-stone-500"
                  }`}
                >
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </button>

                <h3 className="flex-1 text-[13px] font-semibold leading-snug text-stone-200">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="text-stone-200 decoration-stone-600 underline-offset-2 transition-colors hover:text-amber-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}>
                      {item.title}
                    </a>
                  ) : item.title}
                </h3>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="shrink-0 rounded p-1 text-stone-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remove from saved matrix</TooltipContent>
                </Tooltip>
              </div>

              {/* --- Metadata row --- */}
              <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 pl-7 text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-medium text-stone-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${dot ?? "bg-stone-500"}`} />
                  {item.category}
                </span>
                <span className="text-stone-700">·</span>
                <span className="text-stone-600">{item.source}</span>
                <span className="text-stone-700">·</span>
                <span className="tabular-nums text-stone-700">{item.date}</span>
              </div>

              {/* --- Company tag --- */}
              <div className="mb-3 pl-7">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-600">
                  Company
                </label>
                <Input
                  type="text"
                  value={item.companyName || ""}
                  onChange={(e) => onUpdateCompany(item.id, e.target.value)}
                  placeholder="e.g. Apple, Tesla — same name for all articles about one firm"
                  className="h-auto rounded-lg border-stone-700 bg-stone-800/80 px-3 py-1.5 text-[12px] text-stone-300 placeholder:text-stone-600 focus-visible:border-amber-600/50 focus-visible:ring-amber-500/20"
                />
              </div>

              {/* --- Research Notes --- */}
              <div className="pl-7">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-600">
                  Research Notes
                </label>
                <Textarea
                  value={item.notes || ""}
                  onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                  placeholder="Add your analysis…"
                  rows={2}
                  className="resize-none rounded-lg border-stone-700 bg-stone-800/80 px-3 py-2 text-[12px] leading-relaxed text-stone-300 placeholder:text-stone-600 focus-visible:border-amber-600/50 focus-visible:ring-amber-500/20"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
