// Shared helpers for news-style article objects (NewsAPI feed + pasted links).

export const CATEGORY_KEYWORDS = {
  "M&A": ["acquire", "acquisition", "merger", "merge", "buyout", "takeover"],
  "R&D": ["research", "patent", "breakthrough", "innovation", "lab", "experiment", "discovery"],
  Financial: ["revenue", "earnings", "profit", "stock", "shares", "quarter", "fiscal", "investor"],
  Expansion: ["expand", "expansion", "new market", "growth", "open", "launch market", "global"],
  "Product Launch": ["launch", "unveil", "introduce", "release", "announce product", "new device"],
  "Product Strategy": ["strategy", "pivot", "roadmap", "vision", "plan", "rebrand"],
  "Market Entry": ["enter", "entry", "disrupt", "compete", "rival", "challenge"],
  "Content Strategy": ["content", "streaming", "media", "entertainment", "programming"],
};

export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function guessCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return "General";
}

export function cleanContentSnippet(content) {
  if (!content || typeof content !== "string") return "";
  return content.replace(/\s*\[\+\d+\s*chars\]$/i, "").trim();
}

export function deriveShortSummary(description, content) {
  const desc = (description || "").trim();
  const body = cleanContentSnippet(content);

  if (body.length > 30) {
    let line = body.slice(0, 180).trim();
    const cut = line.lastIndexOf(" ");
    if (cut > 80) line = line.slice(0, cut);
    return line.endsWith("…") ? line : line + (body.length > 180 ? "…" : "");
  }

  if (!desc) return "";

  const sentences = desc.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [desc];
  const first = sentences[0]?.trim() || desc;
  if (desc.length > first.length + 25) {
    return first.length > 200 ? first.slice(0, 197) + "…" : first;
  }

  if (desc.length > 120) {
    return desc.slice(0, 117).trim() + "…";
  }

  return "";
}
