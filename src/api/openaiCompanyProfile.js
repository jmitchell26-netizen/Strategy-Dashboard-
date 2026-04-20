// openaiCompanyProfile.js — LLM calls for company profiles + comparison (OpenAI API or local/cloud Ollama).
// Env: VITE_OPENAI_* and/or VITE_OLLAMA_* — see .env.example. Never commit real keys.

const OPENAI_CHAT = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You are a senior strategy research analyst at a top-tier investment firm. You receive news articles and research notes about ONE company. Your job is to produce a rigorous, detailed intelligence brief that a portfolio manager or strategist could act on.

Write a structured "Company Intelligence Profile" in Markdown. Be specific, analytical, and thorough. Use full sentences and developed paragraphs where indicated — do NOT just write one-liners. Every section should reflect deep reasoning from the provided clippings.

---

## Executive Overview
Write 4–6 sentences synthesizing the current strategic moment for this company. What is the dominant narrative? What has changed recently? What is the most important thing a decision-maker needs to understand right now?

## Strategic Momentum
Assess where the company's trajectory is heading. Is momentum accelerating or decelerating? What internal moves (products, leadership, M&A, cost cuts) are driving it? Write 3–5 sentences.

## Key Themes
Bullet list of 4–7 recurring strategic themes across the clippings. For each bullet, write 1–2 sentences of explanation — not just a label.

## Risks & Headwinds
Bullet list of 4–6 specific risks with 1–2 sentences each. Include regulatory, competitive, macro, operational, and reputational dimensions where relevant.

## Opportunities & Tailwinds
Bullet list of 4–6 specific opportunities with 1–2 sentences each. Be concrete — reference actual trends, markets, or product lines mentioned in the clippings.

## Competitive & Market Signals
2–4 paragraphs analyzing what the news reveals about this company's standing vs. competitors, industry dynamics, and market share trajectory. Name competitors where mentioned.

## Financial & Operational Signals
Note any financial figures, guidance, margin commentary, cost structure signals, or operational metrics referenced in the clippings. If thin, say so — do not invent numbers.

## Analyst's Take
Write 3–5 sentences with your own synthesis: what is the single most important strategic bet this company is making, and what would have to be true for it to pay off?

## Open Questions & Follow-up Research
Bullet list of 4–6 specific questions that remain unanswered or need deeper investigation.

---

Ground every claim in the provided clippings. If evidence is thin for a section, write "(Limited data — flagged for further research)" rather than speculating. Do not invent financial figures, quotes, or citations.`;

function env(name) {
  return import.meta.env[name] || "";
}

/** Which backend to use: explicit VITE_LLM_PROVIDER, else infer from keys / URLs. */
function getProvider() {
  const explicit = env("VITE_LLM_PROVIDER").toLowerCase();
  if (explicit === "openai") return "openai";
  if (explicit === "ollama") return "ollama";

  if (env("VITE_OLLAMA_API_KEY") || env("VITE_OLLAMA_BASE_URL")) return "ollama";
  if (env("VITE_OPENAI_API_KEY")) return "openai";
  return null;
}

/**
 * OpenAI-compatible chat URL for Ollama (local or remote).
 * In dev, localhost/127.0.0.1 uses Vite proxy to avoid CORS.
 */
function getOllamaChatUrl() {
  const raw = env("VITE_OLLAMA_BASE_URL").replace(/\/$/, "") || "http://127.0.0.1:11434";
  let basePath = `${raw}/v1/chat/completions`;

  if (import.meta.env.DEV) {
    try {
      const u = new URL(raw.startsWith("http") ? raw : `http://${raw}`);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        basePath = "/ollama-proxy/v1/chat/completions";
      }
    } catch {
      /* keep basePath */
    }
  }

  return basePath;
}

function getChatConfig() {
  const provider = getProvider();
  if (provider === "ollama") {
    const apiKey = env("VITE_OLLAMA_API_KEY");
    const model = env("VITE_OLLAMA_MODEL") || "llama3.2";
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    return {
      provider: "ollama",
      url: getOllamaChatUrl(),
      headers,
      model,
    };
  }
  if (provider === "openai") {
    const apiKey = env("VITE_OPENAI_API_KEY");
    return {
      provider: "openai",
      url: OPENAI_CHAT,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      model: OPENAI_MODEL,
    };
  }
  return null;
}

/** True if either OpenAI key or Ollama (URL/key/provider) is configured. */
export function isLlmConfigured() {
  return getChatConfig() !== null;
}

/** @deprecated Use isLlmConfigured(); kept for any external imports */
export function getOpenAiKey() {
  return isLlmConfigured() ? "1" : "";
}

async function chatCompletions(body) {
  const cfg = getChatConfig();
  if (!cfg) {
    throw new Error(
      "No LLM configured. Add VITE_OPENAI_API_KEY, or Ollama settings (VITE_OLLAMA_BASE_URL / VITE_OLLAMA_API_KEY / VITE_LLM_PROVIDER=ollama) in .env and restart the dev server."
    );
  }
  if (cfg.provider === "openai" && !env("VITE_OPENAI_API_KEY")) {
    throw new Error(
      "Missing OpenAI API key. Add VITE_OPENAI_API_KEY to your .env file in the project root and restart the dev server."
    );
  }

  const res = await fetch(cfg.url, {
    method: "POST",
    headers: cfg.headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let msg =
      data.error?.message ||
      (typeof data.error === "string" ? data.error : null) ||
      res.statusText ||
      "LLM request failed";
    if (
      cfg.provider === "ollama" &&
      /not found/i.test(msg) &&
      /model/i.test(msg)
    ) {
      msg += ` — Install it in Terminal: ollama pull ${cfg.model}  (or set VITE_OLLAMA_MODEL to a name from ollama list).`;
    }
    throw new Error(msg);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from model");
  return text;
}

/**
 * @param {string} displayName — Company label shown to the user
 * @param {Array<{title: string, source: string, date: string, summary?: string, notes?: string}>} articles
 * @returns {Promise<string>} Markdown profile text
 */
export async function generateCompanyProfile(displayName, articles) {
  const cfg = getChatConfig();
  if (!cfg) {
    throw new Error(
      "No LLM configured. Add VITE_OPENAI_API_KEY or Ollama env vars — see .env.example — and restart the dev server."
    );
  }

  const chunks = articles.map((a, i) => {
    const summary = (a.summary || "").slice(0, 2500);
    const notes = (a.notes || "").slice(0, 2000);
    return `### Clipping ${i + 1}\n- **Title:** ${a.title}\n- **Source:** ${a.source} (${a.date})\n- **Summary:** ${summary}\n- **Research notes:** ${notes || "(none)"}\n`;
  });

  const userContent = `**Company:** ${displayName}\n\n${chunks.join("\n")}`;

  return chatCompletions({
    model: cfg.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    temperature: 0.5,
    max_tokens: 5000,
  });
}

/**
 * Optional: short AI synthesis comparing two existing profile markdown strings.
 */
export async function compareProfilesBrief(companyA, profileA, companyB, profileB) {
  const cfg = getChatConfig();
  if (!cfg) {
    throw new Error("No LLM configured");
  }

  return chatCompletions({
    model: cfg.model,
    messages: [
      {
        role: "system",
        content:
          "You are a senior strategy analyst comparing two company intelligence profiles. Write a structured comparison with these sections:\n\n**Strategic Divergence** — 3–4 sentences on how their core strategies differ.\n\n**Shared Risks** — 2–3 bullets on risks both face.\n\n**Contrasting Opportunities** — 2–3 bullets on where each has an edge the other lacks.\n\n**Relative Positioning** — 2–3 sentences on which company appears better positioned and why, based only on the profiles provided.\n\nBe analytical and specific. Ground every claim in the provided profiles.",
      },
      {
        role: "user",
        content: `Compare **${companyA}** vs **${companyB}**.\n\n# ${companyA}\n${profileA.slice(0, 12000)}\n\n# ${companyB}\n${profileB.slice(0, 12000)}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 1800,
  });
}
