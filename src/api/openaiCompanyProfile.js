// openaiCompanyProfile.js — Calls OpenAI to merge many tagged articles into one company profile.
// Requires VITE_OPENAI_API_KEY in .env (never commit real keys). For production, use a backend proxy.

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You are a strategy research analyst. You receive multiple news articles and notes about ONE company.
Write a single consolidated "company intelligence profile" in Markdown with these sections:

## Executive overview
Brief narrative of what matters for this company right now (2–4 sentences).

## Key themes
Bullet list of recurring strategic themes across the clippings.

## Risks & headwinds
Bullet list.

## Opportunities & tailwinds
Bullet list.

## Competitive & market signals
What the news suggests about positioning vs peers or industry.

## Open questions
What remains unclear or needs follow-up research.

Use only facts and themes supported by the provided text. If the clippings are thin, say so explicitly. Do not invent financial numbers or citations.`;

export function getOpenAiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY || "";
}

/**
 * @param {string} displayName — Company label shown to the user
 * @param {Array<{title: string, source: string, date: string, summary?: string, notes?: string}>} articles
 * @returns {Promise<string>} Markdown profile text
 */
export async function generateCompanyProfile(displayName, articles) {
  const key = getOpenAiKey();
  if (!key) {
    throw new Error(
      "Missing OpenAI API key. Add VITE_OPENAI_API_KEY to your .env file in the project root and restart the dev server."
    );
  }

  const chunks = articles.map((a, i) => {
    const summary = (a.summary || "").slice(0, 2500);
    const notes = (a.notes || "").slice(0, 2000);
    return `### Clipping ${i + 1}\n- **Title:** ${a.title}\n- **Source:** ${a.source} (${a.date})\n- **Summary:** ${summary}\n- **Research notes:** ${notes || "(none)"}\n`;
  });

  const userContent = `**Company:** ${displayName}\n\n${chunks.join("\n")}`;

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.35,
      max_tokens: 2500,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || res.statusText || "OpenAI request failed";
    throw new Error(msg);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from OpenAI");
  return text;
}

/**
 * Optional: short AI synthesis comparing two existing profile markdown strings.
 */
export async function compareProfilesBrief(companyA, profileA, companyB, profileB) {
  const key = getOpenAiKey();
  if (!key) {
    throw new Error("Missing VITE_OPENAI_API_KEY");
  }

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You compare two company intelligence profiles. Write 4–6 bullet points highlighting the sharpest contrasts and similarities (strategy, risk, opportunities). Be concise and grounded only in the profiles provided.",
        },
        {
          role: "user",
          content: `Compare **${companyA}** vs **${companyB}**.\n\n# ${companyA}\n${profileA.slice(0, 12000)}\n\n# ${companyB}\n${profileB.slice(0, 12000)}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 900,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "OpenAI request failed");
  }
  return data.choices?.[0]?.message?.content?.trim() || "";
}
