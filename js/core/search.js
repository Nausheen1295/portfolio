/* ==========================================================================
   NEXUS — knowledge search over projects.js (deterministic, no AI)
   Used by NEXA's offline mode now, and by global search / command center.
   Scores each project by where query terms appear; returns the best matches
   with a short "why it matched" list.
   ========================================================================== */
import { PROJECTS, getLab } from "../data/projects.js";

/* light synonym expansion so natural phrasing still finds things */
const SYNONYMS = {
  ai: ["artificial intelligence", "llm", "rag", "machine learning", "agents"],
  ml: ["machine learning", "computer vision", "image classification"],
  security: ["cybersecurity", "encryption", "cryptography", "privacy"],
  cyber: ["cybersecurity"],
  cybersecurity: ["security", "encryption", "cryptography", "threat"],
  crypto: ["cryptography", "encryption", "aes"],
  encryption: ["aes-256-gcm", "pbkdf2", "cryptography"],
  data: ["analytics", "data analysis", "data science", "visualisation"],
  web: ["react", "javascript", "html", "css"],
  vision: ["computer vision", "image"],
  climate: ["earth", "geospatial", "environment"],
  auth: ["webauthn", "biometric", "authentication"],
};

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is", "are", "was",
  "what", "which", "how", "why", "did", "does", "do", "you", "your", "she", "her", "nausheen", "nausheen's",
  "me", "show", "tell", "about", "explain", "use", "used", "using", "project", "projects", "like", "i'm", "im"]);

const FIELDS = [
  // [label, weight, getter]
  ["name", 8, (p) => p.name],
  ["lab", 4, (p) => getLab(p.lab)?.name],
  ["keywords", 4, (p) => p.keywords.join(" ")],
  ["technologies", 5, (p) => p.technologies.join(" ")],
  ["tagline", 3, (p) => p.tagline],
  ["summary", 2, (p) => p.summary],
  ["AI components", 3, (p) => p.aiCapabilities.join(" ")],
  ["security", 3, (p) => p.security.join(" ")],
  ["features", 1, (p) => p.features.join(" ")],
  ["architecture", 1, (p) => p.architecture?.nodes.map((n) => `${n.label} ${n.detail}`).join(" ")],
];

export function terms(query) {
  const base = query.toLowerCase().replace(/[^\w\s.+#-]/g, " ").split(/\s+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, "")).filter((t) => t.length > 1 && !STOP.has(t));
  return [...new Set(base.flatMap((t) => [t, ...(SYNONYMS[t] || [])]))];
}

/**
 * @param {string} query
 * @param {{limit?: number, projectId?: string}} [opts]
 * @returns {{project: object, score: number, matched: string[]}[]}
 */
export function searchProjects(query, { limit = 5, projectId } = {}) {
  const ts = terms(query);
  if (!ts.length) return [];
  // whole-word matching, so "ai" doesn't match inside "detail"
  const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const res = ts.map((t) => new RegExp(`(^|[^a-z0-9])${escapeRe(t)}($|[^a-z0-9])`));
  const pool = projectId ? PROJECTS.filter((p) => p.id === projectId) : PROJECTS;

  return pool.map((project) => {
    let score = 0;
    const matched = new Set();
    for (const [label, weight, get] of FIELDS) {
      const hay = (get(project) || "").toLowerCase();
      if (!hay) continue;
      for (const re of res) if (re.test(hay)) { score += weight; matched.add(label); }
    }
    if (project.status === "live" || project.status === "complete") score *= 1.1; // prefer real work on ties
    return { project, score, matched: [...matched] };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}
