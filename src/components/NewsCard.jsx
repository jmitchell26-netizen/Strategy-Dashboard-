// NewsCard.jsx — Displays a single news article in the Live News Feed.
// Each card shows the category badge, date, title, summary, source, and a "Save to Matrix" button.
// When NewsAPI provides item.url, the title and "Read full article" open the publisher in a new tab.
// The save button disables and changes to "✓ Saved" once the item has been saved.

// Color configuration for each category — controls the badge background, text, and dot colors.
// Each category gets a unique color so users can visually scan the feed at a glance.
const categoryConfig = {
  "Product Strategy": {
    bg: "bg-violet-500/10",
    text: "text-violet-300",
    dot: "bg-violet-400",
  },
  Expansion: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  Financial: {
    bg: "bg-sky-500/10",
    text: "text-sky-300",
    dot: "bg-sky-400",
  },
  "Market Entry": {
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    dot: "bg-amber-400",
  },
  "R&D": {
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    dot: "bg-rose-400",
  },
  "Content Strategy": {
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-300",
    dot: "bg-fuchsia-400",
  },
  "Product Launch": {
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    dot: "bg-cyan-400",
  },
  "M&A": {
    bg: "bg-orange-500/10",
    text: "text-orange-300",
    dot: "bg-orange-400",
  },
  General: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
    dot: "bg-indigo-400",
  },
};

// Fallback colors for any category not in the config above
const fallback = {
  bg: "bg-slate-500/10",
  text: "text-slate-300",
  dot: "bg-slate-400",
};

// Props:
//   item     — the news article object { id, title, source, date, category, summary, url? }
//   onSave   — callback to save this item to the strategy matrix
//   isSaved  — boolean, true if this item is already in the matrix
export default function NewsCard({ item, onSave, isSaved }) {
  // Look up the color scheme for this article's category
  const cat = categoryConfig[item.category] || fallback;
  // NewsAPI provides the publisher URL; open in a new tab when present
  const articleUrl = item.url;

  return (
    // "gradient-border" class (from index.css) adds an animated gradient border on hover
    // "group" enables group-hover: styles on child elements
    <article className="gradient-border group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-black/20">

      {/* Decorative glow that appears in the top-right corner on hover */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-500/0 blur-3xl transition-all duration-500 group-hover:bg-violet-500/10" />

      <div className="relative">
        {/* Top row: category badge (left) and date (right) */}
        <div className="mb-3 flex items-center justify-between gap-3">
          {/* Category pill with colored dot */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${cat.bg} ${cat.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
            {item.category}
          </span>
          {/* Publication date */}
          <time className="text-[11px] font-medium tabular-nums text-slate-600">
            {item.date}
          </time>
        </div>

        {/* Article title — links to the full story on the publisher site when URL is available */}
        {articleUrl ? (
          <h3 className="mb-2 text-[15px] leading-snug font-semibold">
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 underline decoration-white/20 underline-offset-2 transition-colors hover:text-sky-300 hover:decoration-sky-400/50"
            >
              {item.title}
              <span className="ml-1 inline-block align-middle text-sky-400/80" aria-hidden>
                <svg className="inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5M19 5v6m0 0h-6m6 0L9 15" />
                </svg>
              </span>
            </a>
          </h3>
        ) : (
          <h3 className="mb-2 text-[15px] leading-snug font-semibold text-white/90 transition-colors group-hover:text-white">
            {item.title}
          </h3>
        )}

        {/* Article summary / description */}
        <p className="mb-4 text-[13px] leading-relaxed text-slate-400/80">
          {item.summary}
        </p>

        {/* Explicit “open article” link — easier to discover than title alone */}
        {articleUrl && (
          <p className="mb-5">
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-sky-400/90 transition-colors hover:text-sky-300"
            >
              Read full article
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5M19 5v6m0 0h-6m6 0L9 15" />
              </svg>
            </a>
          </p>
        )}

        {/* Footer: source name (left) and save button (right) */}
        <div className="flex items-center justify-between">
          {/* News source in uppercase */}
          <span className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
            {item.source}
          </span>

          {/* Save to Matrix / Saved button */}
          <button
            onClick={() => onSave(item)}
            disabled={isSaved}
            className={`relative overflow-hidden rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-300 ${
              isSaved
                ? "cursor-default border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"   // Saved state: green, disabled
                : "cursor-pointer border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:border-violet-400/50 hover:bg-violet-500/20 hover:shadow-lg hover:shadow-violet-500/10 active:scale-95" // Active state: violet with click animation
            }`}
          >
            {/* Shimmer animation overlay — only shown on unsaved buttons */}
            {!isSaved && (
              <span className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent bg-[length:200%_100%]" />
            )}
            <span className="relative">
              {isSaved ? "✓ Saved" : "Save to Matrix"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
