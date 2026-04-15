// Fetches Open Graph / page metadata for a URL so pasted links match the app’s article shape.
// Uses Microlink’s public API (browser-friendly). Some sites block previews; use manual fallback then.

import { hashString, guessCategory, deriveShortSummary } from "../utils/articleUtils";

const MICROLINK = "https://api.microlink.io";

export function normalizeArticleUrl(input) {
  const t = (input || "").trim();
  if (!t) throw new Error("Enter a URL.");
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  const u = new URL(withProto);
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Only http(s) links are supported.");
  return u.href;
}

function hostnameLabel(urlString) {
  try {
    const h = new URL(urlString).hostname.replace(/^www\./, "");
    return h || "Link";
  } catch {
    return "Link";
  }
}

/**
 * Build the same public article shape as NewsAPI items (plus sourceType for UI).
 * @param {object} opts
 * @param {string} opts.canonicalUrl
 * @param {string} opts.title
 * @param {string} opts.description
 * @param {string} [opts.sourceName] — publisher display name
 * @param {string} [opts.date] — YYYY-MM-DD
 */
export function buildPastedArticle({ canonicalUrl, title, description, sourceName, date }) {
  const t = (title || "").trim() || "Untitled";
  const descRaw = (description || "").trim();
  const descriptionFinal =
    descRaw.slice(0, 2000) || "No description available. Open the link or add research notes after saving.";
  let shortSummary = deriveShortSummary(descriptionFinal, "");
  if (shortSummary) {
    const dNorm = descriptionFinal.replace(/\s+/g, " ").trim();
    const sNorm = shortSummary.replace(/\s+/g, " ").trim();
    if (sNorm.length >= dNorm.length * 0.92) shortSummary = "";
  }

  return {
    id: `art-${hashString(canonicalUrl)}`,
    title: t,
    source: (sourceName || "").trim() || hostnameLabel(canonicalUrl),
    date: date || new Date().toISOString().split("T")[0],
    category: guessCategory(t, descriptionFinal),
    summary: descriptionFinal,
    shortSummary: shortSummary || "",
    url: canonicalUrl,
    sourceType: "pasted-link",
  };
}

/**
 * @returns {Promise<object>} article object for NewsCard / matrix
 */
export async function fetchArticleFromUrl(urlInput) {
  const canonicalUrl = normalizeArticleUrl(urlInput);
  const apiUrl = `${MICROLINK}?url=${encodeURIComponent(canonicalUrl)}`;
  const res = await fetch(apiUrl);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || `Preview request failed (${res.status})`);
  }
  if (json.status !== "success" || !json.data) {
    throw new Error(json.message || "Could not read a preview for this URL.");
  }

  const d = json.data;
  const title = (d.title || "").trim() || hostnameLabel(canonicalUrl);
  const description = (d.description || "").trim();

  let publisherName = hostnameLabel(canonicalUrl);
  if (typeof d.publisher === "string" && d.publisher.trim()) {
    publisherName = d.publisher.trim();
  } else if (d.publisher && typeof d.publisher.name === "string" && d.publisher.name.trim()) {
    publisherName = d.publisher.name.trim();
  }

  let dateStr = new Date().toISOString().split("T")[0];
  if (d.date) {
    const parsed = new Date(d.date);
    if (!Number.isNaN(parsed.getTime())) {
      dateStr = parsed.toISOString().split("T")[0];
    }
  }

  return buildPastedArticle({
    canonicalUrl: (d.url && String(d.url).trim()) || canonicalUrl,
    title,
    description,
    sourceName: publisherName,
    date: dateStr,
  });
}
