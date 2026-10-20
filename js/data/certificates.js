/* ==========================================================================
   NEXUS — CERTIFICATIONS (verified facts only)
   Source: the certificates themselves (assets/certificates/). Every title,
   issuer, date, credential ID and highlight below is copied from the
   certificate. Add a `credentialUrl` (https) when a public verification
   page exists — the card then shows "Verify credential".
   ========================================================================== */

/**
 * @typedef {Object} Certification
 * @property {string} id
 * @property {string} title
 * @property {string} issuer
 * @property {string} [partner]          - co-issuer shown on the certificate
 * @property {string} date               - "YYYY-MM" (used for sorting)
 * @property {string} dateLabel          - exactly as on the certificate
 * @property {string[]} topics           - skills the certificate itself names
 * @property {string[]} [highlights]     - outcomes / tasks listed on the certificate
 * @property {string|null} credentialId
 * @property {string|null} credentialUrl
 * @property {{src: string, width: number, height: number}} image
 * @property {string|null} pdf
 * @property {string[]} relatedSkills    - SKILL_GROUPS ids this supports
 * @property {string} source
 */

const A = "assets/certificates/";
const img = (id, width, height) => ({ src: `${A}${id}.webp`, width, height });

/** @type {Certification[]} — newest first */
export const CERTIFICATIONS = [
  {
    id: "corizo-web-development",
    title: "Web Development Training",
    issuer: "Corizo",
    partner: "Mood Indigo",
    date: "2026-10",
    dateLabel: "5 Sep – 5 Oct 2026",
    topics: ["Web development"],
    credentialId: "CRZ109428",
    credentialUrl: null,
    image: img("corizo-web-development", 1600, 1131),
    pdf: `${A}corizo-web-development.pdf`,
    relatedSkills: ["web"],
    source: "Certificate",
  },
  {
    id: "corizo-machine-learning",
    title: "Machine Learning Training",
    issuer: "Corizo",
    partner: "Mood Indigo",
    date: "2026-10",
    dateLabel: "5 Sep – 5 Oct 2026",
    topics: ["Machine learning"],
    credentialId: "CRZ110134",
    credentialUrl: null,
    image: img("corizo-machine-learning", 1600, 1131),
    pdf: `${A}corizo-machine-learning.pdf`,
    relatedSkills: ["ai"],
    source: "Certificate",
  },
  {
    id: "linkedin-software-testing",
    title: "Programming Foundations: Software Testing/QA",
    issuer: "LinkedIn Learning",
    date: "2026-02",
    dateLabel: "8 Feb 2026 · 1 h 55 min",
    topics: ["Software Testing", "Programming Foundations", "Software Quality Assurance"],
    credentialId: "3d102f4d483ba748a185e19e6db2cafaf4609857da2187330c8ecc5390beff1a",
    credentialUrl: null,
    image: img("linkedin-software-testing", 1600, 1236),
    pdf: `${A}linkedin-software-testing.pdf`,
    relatedSkills: ["software"],
    source: "Certificate",
  },
  {
    id: "forage-cybersecurity",
    title: "Cybersecurity Job Simulation",
    issuer: "Forage",
    partner: "Mastercard",
    date: "2026-01",
    dateLabel: "13 Jan 2026",
    topics: ["Cybersecurity", "Phishing simulation"],
    highlights: ["Design a phishing email simulation", "Interpret phishing simulation results"],
    credentialId: "fusLSynHaAsNxaXH2",
    credentialUrl: null,
    image: img("forage-cybersecurity", 1600, 1130),
    pdf: `${A}forage-cybersecurity.pdf`,
    relatedSkills: ["security"],
    source: "Certificate",
  },
  {
    id: "be10x-ai-tools",
    title: "AI Tools Workshop",
    issuer: "be10x",
    date: "2026-01",
    dateLabel: "2 Jan 2026",
    topics: ["AI tools", "ChatGPT"],
    highlights: [
      "Create presentations using AI in under 5 min",
      "Analyse data using AI in under 30 min",
      "Code and debug using AI in under 10 min",
    ],
    credentialId: null,
    credentialUrl: null,
    image: img("be10x-ai-tools", 1600, 1067),
    pdf: `${A}be10x-ai-tools.pdf`,
    relatedSkills: ["ai"],
    source: "Certificate",
  },
  {
    id: "linkedin-ai-foundations-ml",
    title: "Artificial Intelligence Foundations: Machine Learning",
    issuer: "LinkedIn Learning",
    date: "2025-09",
    dateLabel: "12 Sep 2025 · 1 h 50 min",
    topics: ["Machine Learning", "Artificial Intelligence (AI)"],
    credentialId: "dfacedb42f87fb7b91f2935d7383bdd1615f1a0f89de7df7c519bfd3dea44b1e",
    credentialUrl: null,
    image: img("linkedin-ai-foundations-ml", 1600, 1236),
    pdf: `${A}linkedin-ai-foundations-ml.pdf`,
    relatedSkills: ["ai"],
    source: "Certificate",
  },
  {
    id: "linkedin-learning-python",
    title: "Learning Python",
    issuer: "LinkedIn Learning",
    date: "2025-08",
    dateLabel: "16 Aug 2025 · 3 h 41 min",
    topics: ["Python (Programming Language)"],
    credentialId: "12549f59f7c4f1730141a43a2f917e7ddcc65e88a2391726284c874dcc12ad7f",
    credentialUrl: null,
    image: img("linkedin-learning-python", 1600, 1236),
    pdf: `${A}linkedin-learning-python.pdf`,
    relatedSkills: ["software"],
    source: "Certificate",
  },
  {
    id: "power-eagles-digital-learning",
    title: "Digital Learning Training",
    issuer: "Power Eagles",
    date: "2025-06",
    dateLabel: "Jun 2025",
    topics: ["Digital learning", "Business concepts"],
    highlights: ["Certificate of Achievement — completed as Top Earner of the company"],
    credentialId: null,
    credentialUrl: null,
    image: img("power-eagles-digital-learning", 904, 1280),
    pdf: null,
    relatedSkills: [],
    source: "Certificate (date from résumé)",
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const formatMonth = (ym) => { const [y, m] = ym.split("-").map(Number); return `${MONTHS[m - 1]} ${y}`; };
