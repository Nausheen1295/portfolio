/* ==========================================================================
   NEXA — API client (the only module that talks to the NEXA backend)

   API CONTRACT (implemented by the separately-hosted NEXA backend)
   ----------------------------------------------------------------
   GET  {endpoint}/health
        200 → { status: "ok" }

   POST {endpoint}/chat
        body → {
          question:  string            (1–500 chars)
          mode:      "recruiter" | "developer" | "simple" | "architecture" | "interview"
          projectId: string | null     (focus the answer on one project)
          history:   { role: "user" | "nexa", content: string }[]   (last N turns)
        }
        200  → {
          answer:     string           (plain text / light markdown)
          sources:    { title: string, url: string }[]   (documents the answer used)
          grounded:   boolean          (false = nothing relevant was found)
        }
        429  → { error, retryAfter }   (rate limited)
        4xx/5xx → { error }

   The backend owns all secrets (LLM keys, vector DB). Answers must come only
   from the indexed knowledge base; when nothing is found it must say so.
   ========================================================================== */
import { NEXA_CONFIG } from "./config.js";

/**
 * @typedef {{kind: "answer", answer: string, sources: {title: string, url: string}[], grounded: boolean}} NexaAnswer
 * @typedef {{kind: "offline"}} NexaOffline
 * @typedef {{kind: "error", message: string, retryAfter?: number}} NexaError
 * @typedef {NexaAnswer | NexaOffline | NexaError} NexaResult
 */

export const MODES = [
  { id: "recruiter",    label: "Recruiter",    hint: "Impact, skills and role — no jargon." },
  { id: "developer",    label: "Developer",    hint: "Stack, implementation and trade-offs." },
  { id: "simple",       label: "Simple",       hint: "Explained like you're new to tech." },
  { id: "architecture", label: "Architecture", hint: "Components, data flow and design." },
  { id: "interview",    label: "Interview",    hint: "Ask interview questions — answers in Nausheen's voice." },
];

const isConfigured = () => typeof NEXA_CONFIG.endpoint === "string" && NEXA_CONFIG.endpoint.startsWith("https://");

async function request(path, init = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), NEXA_CONFIG.timeoutMs);
  try {
    return await fetch(`${NEXA_CONFIG.endpoint.replace(/\/$/, "")}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...(init.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

export const nexaClient = {
  /** @returns {Promise<"online" | "offline">} */
  async status() {
    if (!isConfigured()) return "offline";
    try {
      const res = await request("/health");
      return res.ok ? "online" : "offline";
    } catch {
      return "offline";
    }
  },

  /**
   * @param {{question: string, mode: string, projectId?: string|null, history?: {role: string, content: string}[]}} input
   * @returns {Promise<NexaResult>}
   */
  async ask({ question, mode, projectId = null, history = [] }) {
    if (!isConfigured()) return { kind: "offline" };

    const q = String(question).trim().slice(0, NEXA_CONFIG.maxQuestionLength);
    if (!q) return { kind: "error", message: "Please type a question." };

    try {
      const res = await request("/chat", {
        method: "POST",
        body: JSON.stringify({ question: q, mode, projectId, history: history.slice(-NEXA_CONFIG.maxHistory) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) return { kind: "error", message: "NEXA is getting a lot of questions — please try again shortly.", retryAfter: data.retryAfter };
      if (!res.ok) return { kind: "error", message: "NEXA couldn't answer right now. Please try again." };
      return {
        kind: "answer",
        answer: String(data.answer || ""),
        // Only https links can become sources — never javascript:, data: or relative URLs from the API.
        sources: Array.isArray(data.sources)
          ? data.sources.filter((s) => s && typeof s.url === "string" && /^https:\/\//i.test(s.url)).slice(0, 8)
          : [],
        grounded: data.grounded !== false,
      };
    } catch (e) {
      return { kind: "error", message: e.name === "AbortError" ? "NEXA took too long to respond." : "Couldn't reach NEXA. Check your connection." };
    }
  },
};
