// Paste a URL to fetch metadata and show the article in the feed like NewsAPI items.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import {
  fetchArticleFromUrl,
  buildPastedArticle,
  normalizeArticleUrl,
} from "../api/linkPreviewArticle";

export default function PasteArticleLink({ onArticleAdded }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  async function handleFetch(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const article = await fetchArticleFromUrl(url);
      onArticleAdded(article);
      setUrl("");
      setShowManual(false);
      setManualTitle("");
      setManualDescription("");
    } catch (err) {
      setError(err.message || "Could not load preview");
      setShowManual(true);
      if (!manualTitle.trim()) {
        try {
          setManualTitle(new URL(normalizeArticleUrl(url)).hostname.replace(/^www\./, ""));
        } catch {
          setManualTitle("");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handleManualAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      const canonical = normalizeArticleUrl(url);
      const article = buildPastedArticle({
        canonicalUrl: canonical,
        title: manualTitle.trim() || "Untitled",
        description: manualDescription.trim(),
      });
      onArticleAdded(article);
      setUrl("");
      setShowManual(false);
      setManualTitle("");
      setManualDescription("");
    } catch (err) {
      setError(err.message || "Invalid URL");
    }
  }

  return (
    <Card className="border-stone-800 bg-stone-900">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 6.364 6.364l-3.465 3.465a4.5 4.5 0 0 1-6.364 0 4.5 4.5 0 0 1 0-6.364l1.06-1.06m-.53 2.47 2.47-2.47a4.5 4.5 0 0 1 6.364 6.364l-3.465 3.465a4.5 4.5 0 0 1-6.364 0 4.5 4.5 0 0 1 0-6.364l1.06-1.06" />
          </svg>
          <span className="text-sm font-medium text-stone-300">Add your own article</span>
          <span className="text-[11px] text-stone-600">— paste a link to bring it into the feed</span>
        </div>

        <form onSubmit={handleFetch} className="flex gap-2">
          <Input
            type="text"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            autoComplete="off"
            className="flex-1 border-stone-700 bg-stone-800 text-sm text-stone-200 placeholder:text-stone-600 focus-visible:border-amber-600/60 focus-visible:ring-amber-500/20"
          />
          <Button type="submit" disabled={loading || !url.trim()} variant="outline" size="sm"
            className="shrink-0 border-amber-700/60 bg-amber-500/10 text-amber-300 hover:border-amber-600 hover:bg-amber-500/20 hover:text-amber-200">
            {loading ? <><Spinner className="mr-1.5 h-3 w-3" />Fetching…</> : "Add to feed"}
          </Button>
        </form>

        {error && (
          <p className="mt-2 text-[12px] text-amber-400">
            {error}{showManual ? " Fill in details below to add manually." : ""}
          </p>
        )}

        {showManual && url.trim() && (
          <form onSubmit={handleManualAdd} className="mt-3 space-y-2 rounded-lg border border-stone-700/60 bg-stone-800/50 p-3">
            <p className="text-[11px] font-medium text-stone-500">Manual entry</p>
            <Input type="text" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Title"
              className="border-stone-700 bg-stone-800 text-sm text-stone-200 placeholder:text-stone-600" />
            <Textarea value={manualDescription} onChange={(e) => setManualDescription(e.target.value)}
              placeholder="Short description or excerpt (optional)" rows={3}
              className="resize-y border-stone-700 bg-stone-800 text-sm text-stone-200 placeholder:text-stone-600" />
            <Button type="submit" variant="outline" size="sm"
              className="border-stone-700 bg-stone-800 text-stone-300 hover:border-stone-600 hover:bg-stone-700">
              Add without preview
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
