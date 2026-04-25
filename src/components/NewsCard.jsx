// NewsCard.jsx — Displays a single news article in the Live News Feed.

const categoryConfig = {
  "Product Strategy": { text: "text-violet-600", dot: "bg-violet-400", bar: "bg-violet-400" },
  Expansion:          { text: "text-emerald-600", dot: "bg-emerald-400", bar: "bg-emerald-400" },
  Financial:          { text: "text-sky-600",     dot: "bg-sky-400",    bar: "bg-sky-400" },
  "Market Entry":     { text: "text-amber-600",   dot: "bg-amber-400",  bar: "bg-amber-400" },
  "R&D":              { text: "text-rose-600",    dot: "bg-rose-400",   bar: "bg-rose-400" },
  "Content Strategy": { text: "text-fuchsia-600", dot: "bg-fuchsia-400", bar: "bg-fuchsia-400" },
  "Product Launch":   { text: "text-cyan-600",    dot: "bg-cyan-400",   bar: "bg-cyan-400" },
  "M&A":              { text: "text-orange-600",  dot: "bg-orange-400", bar: "bg-orange-400" },
  General:            { text: "text-indigo-600",  dot: "bg-indigo-400", bar: "bg-indigo-400" },
};

const fallback = { text: "text-stone-500", dot: "bg-stone-400", bar: "bg-stone-300" };

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function NewsCard({ item, onSave, isSaved, onRemoveFromFeed }) {
  const cat = categoryConfig[item.category] || fallback;
  const articleUrl = item.url;

  return (
    <Card className="overflow-hidden border-stone-200 bg-white transition-colors hover:bg-stone-50">
      {/* Category colour accent strip */}
      <div className={`h-0.5 w-full ${cat.bar}`} />
      <CardContent className="p-4">

        {/* Top row: badges + date */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.sourceType === "pasted-link" && (
              <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700 text-[10px]">
                Your link
              </Badge>
            )}
            <Badge variant="outline" className={`text-[10px] border-stone-200 bg-transparent ${cat.text}`}>
              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${cat.dot}`} />
              {item.category}
            </Badge>
          </div>
          <time className="shrink-0 text-[11px] tabular-nums text-stone-400">{item.date}</time>
        </div>

        {/* Title */}
        {articleUrl ? (
          <h3 className="mb-2 text-sm font-semibold leading-snug">
            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              className="text-stone-800 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-amber-700 hover:decoration-amber-400">
              {item.title}
              <svg className="ml-1 inline h-3 w-3 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5M19 5v6m0 0h-6m6 0L9 15" />
              </svg>
            </a>
          </h3>
        ) : (
          <h3 className="mb-2 text-sm font-semibold leading-snug text-stone-800">{item.title}</h3>
        )}

        {/* Description */}
        <p className="mb-3 text-[13px] leading-relaxed text-stone-500">{item.summary}</p>

        {/* Short summary callout */}
        {item.shortSummary && (
          <div className="mb-3 rounded border border-stone-200 bg-stone-50 px-3 py-2">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Summary</p>
            <p className="text-[12px] leading-relaxed text-stone-600">{item.shortSummary}</p>
          </div>
        )}

        <Separator className="my-3 bg-stone-100" />

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-stone-400">{item.source}</span>
            {onRemoveFromFeed && (
              <button type="button" onClick={onRemoveFromFeed}
                className="text-[11px] text-stone-400 transition-colors hover:text-red-500">
                Remove
              </button>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => onSave(item)} disabled={isSaved} variant="outline" size="sm"
                className={isSaved
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                  : "border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800"
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
