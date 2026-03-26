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
};

const fallback = {
  bg: "bg-slate-500/10",
  text: "text-slate-300",
  dot: "bg-slate-400",
};

export default function NewsCard({ item, onSave, isSaved }) {
  const cat = categoryConfig[item.category] || fallback;

  return (
    <article className="gradient-border group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-black/20">
      {/* Hover accent glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-500/0 blur-3xl transition-all duration-500 group-hover:bg-violet-500/10" />

      <div className="relative">
        {/* Top row */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${cat.bg} ${cat.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
            {item.category}
          </span>
          <time className="text-[11px] font-medium tabular-nums text-slate-600">
            {item.date}
          </time>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-[15px] leading-snug font-semibold text-white/90 transition-colors group-hover:text-white">
          {item.title}
        </h3>

        {/* Summary */}
        <p className="mb-5 text-[13px] leading-relaxed text-slate-400/80">
          {item.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
            {item.source}
          </span>
          <button
            onClick={() => onSave(item)}
            disabled={isSaved}
            className={`relative overflow-hidden rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-300 ${
              isSaved
                ? "cursor-default border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "cursor-pointer border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:border-violet-400/50 hover:bg-violet-500/20 hover:shadow-lg hover:shadow-violet-500/10 active:scale-95"
            }`}
          >
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
