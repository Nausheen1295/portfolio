/* ==========================================================================
   NEXUS — CERTIFICATIONS (verified facts only)
   Source: Nausheen's résumé (resume.pdf). Add a `credentialUrl` (https) when a
   public verification link exists — the card then shows "Verify credential".
   ========================================================================== */

/**
 * @typedef {Object} Certification
 * @property {string} id
 * @property {string} title
 * @property {string} issuer
 * @property {string} date            - "YYYY-MM"
 * @property {string[]} topics        - only what the certificate itself names
 * @property {string|null} credentialUrl
 * @property {string[]} relatedSkills - SKILL_GROUPS ids this supports
 * @property {string} source
 */

/** @type {Certification[]} — newest first */
export const CERTIFICATIONS = [
  {
    id: "be10x-ai-tools",
    title: "Be10x AI Tool Workshop",
    issuer: "BE10x",
    date: "2026-01",
    topics: ["AI tools"],
    credentialUrl: null,
    relatedSkills: ["ai"],
    source: "Résumé",
  },
  {
    id: "linkedin-learning",
    title: "Software Design, AI Foundation, Python",
    issuer: "LinkedIn Learning",
    date: "2025-11",
    topics: ["Software Design", "AI Foundation", "Python"],
    credentialUrl: null,
    relatedSkills: ["software", "ai"],
    source: "Résumé",
  },
  {
    id: "power-eagles-digital-learning",
    title: "Digital Learning Training",
    issuer: "Power Eagles",
    date: "2025-06",
    topics: ["Digital learning"],
    credentialUrl: null,
    relatedSkills: [],
    source: "Résumé",
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const formatMonth = (ym) => { const [y, m] = ym.split("-").map(Number); return `${MONTHS[m - 1]} ${y}`; };
