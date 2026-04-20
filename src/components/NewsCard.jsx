// NewsCard.jsx — Displays a single news article in the Live News Feed.

const categoryConfig = {
  "Product Strategy": { bg: "bg-violet-500/10", text: "text-violet-300", dot: "bg-violet-400" },
  Expansion:          { bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-400" },
  Financial:          { bg: "bg-sky-500/10", text: "text-sky-300", dot: "bg-sky-400" },
  "Market Entry":     { bg: "bg-amber-500/10", text: "text-amber-300", dot: "bg-amber-400" },
  "R&D":              { bg: "bg-rose-500/10", text: "text-rose-300", dot: "bg-rose-400" },
  "Content Strategy": { bg: "bg-fuchsia-500/10", text: "text-fuchsia-300", dot: "bg-fuchsia-400" },
  "Product Launch":   { bg: "bg-cyan-500/10", text: "text-cyan-300", dot: "bg-cyan-400" },
  "M&A":              { bg: "bg-orange-500/10", text: "text-orange-300", dot: "bg-orange-400" },
  General:            { bg: "bg-indigo-500/10", text: "text-indigo-300", dot: "bg-indigo-400" },
};

const fallback = { bg: "bg-zinc-700/30", text: "text-zinc-400", dot: "bg-zinc-500" };

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function NewsCard({ item, onSave, isSaved, onRemoveFromFeed }) {
  const cat = categoryConfig[item.category] || fallback;
  const articleUrl = item.url;

  return (
    <Card className="border-zinc-800 bg-zinc-900 transition-colors hover:bg-zinc-800/70">
      <CardContent className="p-5">

        {/* Top row: badges + date */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.sourceType === "pasted-link" && (
              <Badge variant="outline" className="border-sky-800 bg-sky-950/50 text-sky-400 text-[10px]">
                Your link
              </Badge>
            )}
            <Badge variant="outline" className={`text-[10px] border-zinc-700 bg-transparent ${cat.text}`}>
              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${cat.dot}`} />
              {item.category}
            </Badge>
          </div>
          <time className="shrink-0 text-[11px] tabular-nums text-zinc-600">{item.date}</time>
        </div>

        {/* Title */}
        {articleUrl ? (
          <h3 className="mb-2.5 text-sm font-semibold leading-snug">
            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              className="text-zinc-100 underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-sky-400 hover:decoration-sky-700">
              {item.title}
              <svg className="ml-1 inline h-3 w-3 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5M19 5v6m0 0h-6m6 0L9 15" />
              </svg>
            </a>
          </h3>
        ) : (
          <h3 className="mb-2.5 text-sm font-semibold leading-snug text-zinc-100">{item.title}</h3>
        )}

        {/* Description */}
        <p className="mb-3 text-[13px] leading-relaxed text-zinc-400">{item.summary}</p>

        {/* Short summary callout */}
        {item.shortSummary && (
          <div className="mb-3 rounded-md border border-zinc-700/60 bg-zinc-800/50 px-3 py-2">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Summary</p>
            <p className="text-[12px] leading-relaxed text-zinc-300">{item.shortSummary}</p>
          </div>
        )}

        <Separator className="my-3 bg-zinc-800" />

        {/* Footer: source + actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-zinc-500">{item.source}</span>
            {onRemoveFromFeed && (
              <button type="button" onClick={onRemoveFromFeed}
                className="text-[11px] text-zinc-600 transition-colors hover:text-rose-400">
                Remove
              </button>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => onSave(item)} disabled={isSaved} variant="outline" size="sm"
                className={isSaved
                  ? "border-emerald-800 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-950/50"
                  : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
                }>
                {isSaved ? "✓ Saved" : "Save to Matrix"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isSaved ? "Already in your matrix" : "Save this article to your strategy matrix"}</TooltipContent>
          </Tooltip>
        </div>

      </CardContent>
    </Card>
  );
}
