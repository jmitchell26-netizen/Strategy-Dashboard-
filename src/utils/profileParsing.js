// profileParsing.js — shared markdown parsers for company profile outputs.

/**
 * Parse the ## Signal Scores block.
 * Returns { label: { value: number, rationale: string|null } }.
 */
export function parseSignalScores(markdown) {
  const lines = markdown.split("\n");
  const scores = {};
  let inScores = false;

  for (const line of lines) {
    if (/^##\s+signal scores/i.test(line)) {
      inScores = true;
      continue;
    }
    if (inScores && /^##/.test(line)) inScores = false;
    if (!inScores) continue;

    // Match: "- Label: 7/10 — rationale..." or "- Label: 7/10"
    const match = line.match(/^[-*]\s+(.+?):\s*(\d+)(?:\/10)?(?:\s*[—–-]\s*(.+))?/i);
    if (!match) continue;

    scores[match[1].trim()] = {
      value: Math.min(10, Math.max(0, parseInt(match[2], 10))),
      rationale: match[3] ? match[3].trim() : null,
    };
  }

  return scores;
}
