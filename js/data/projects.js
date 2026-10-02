/* ==========================================================================
   NEXUS — PROJECT & LAB DATA (single source of truth)

   Every UI surface reads from here: lab map, project cards, case studies,
   search, the command center and — later — NEXA's knowledge base.

   CONTENT RULES
   - Only verified facts. Each documented project lists its `sources`.
   - Anything not yet documented is `null` (or an empty array). The UI and
     NEXA must render that as "Not documented yet" — never fill it in.
   - Status must reflect reality: only shipped work is "live"/"complete".
   ========================================================================== */

/**
 * @typedef {"live" | "complete" | "in-development" | "concept" | "experimental"} ProjectStatus
 *
 * @typedef {Object} ArchitectureNode
 * @property {string} id
 * @property {string} label
 * @property {string} layer      - "client" | "frontend" | "api" | "ai" | "data" | "external"
 * @property {string} detail     - one-paragraph explanation shown on click
 *
 * @typedef {Object} Artifact
 * @property {"repo"|"demo"|"wireframe"|"screenshot"|"doc"|"decision"|"commit"} type
 * @property {string} label
 * @property {string} url
 *
 * @typedef {Object} TimelineEntry
 * @property {string} stage          - one of JOURNEY_STAGES ids
 * @property {string} note
 * @property {string} [date]         - e.g. "2026-05" (only when verifiable)
 * @property {Artifact[]} [artifacts] - evidence: wireframes, docs, commits, demos…
 *
 * @typedef {Object} Project
 * @property {string}  id
 * @property {string}  name
 * @property {string}  lab                     - LAB id
 * @property {ProjectStatus} status
 * @property {boolean} featured
 * @property {string}  tagline
 * @property {string}  summary
 * @property {string|null} problem
 * @property {string|null} solution
 * @property {string[]} features
 * @property {string|null} role
 * @property {string[]} technologies           - verified (or clearly "planned" for concepts)
 * @property {boolean} technologiesPlanned     - true when the stack is a plan, not a fact
 * @property {string[]} aiCapabilities
 * @property {string[]} security
 * @property {string|null} database
 * @property {{nodes: ArchitectureNode[], flow: string[][]}|null} architecture
 * @property {string[]} challenges
 * @property {string[]} decisions
 * @property {TimelineEntry[]} timeline
 * @property {string|null} results
 * @property {{github?: string, live?: string, demo?: string}} links
 * @property {{src: string, width: number, height: number, alt: string, caption: string}[]} [media]  - screenshots
 * @property {string[]} keywords               - extra search terms
 * @property {string[]} sources                - where the facts come from
 */

export const STATUS = {
  "live":           { label: "Live",           description: "Shipped and publicly available." },
  "complete":       { label: "Completed",      description: "Finished project with public source code." },
  "in-development": { label: "In development", description: "Actively being built — not yet released." },
  "concept":        { label: "Concept",        description: "Designed and planned. Build not started yet." },
  "experimental":   { label: "Experimental",   description: "Playful prototypes and experiments." },
};

/** The engineering process every project moves through. `summary` describes the stage itself. */
export const JOURNEY_STAGES = [
  { id: "idea",         label: "Idea",               summary: "Spot a problem worth solving and capture the first sketch of a solution." },
  { id: "research",     label: "Research",           summary: "Study existing tools, user needs and the technology options before committing." },
  { id: "problem",      label: "Problem Definition", summary: "Pin down who it's for, what success looks like, and what is deliberately out of scope." },
  { id: "ux",           label: "UX / UI",            summary: "Wireframe and prototype the experience before writing production code." },
  { id: "architecture", label: "Architecture",       summary: "Choose the stack and design how components, data and external services fit together." },
  { id: "development",  label: "Development",        summary: "Build in small, testable increments under version control." },
  { id: "testing",      label: "Testing",            summary: "Verify behaviour, security and edge cases — and fix what breaks." },
  { id: "deployment",   label: "Deployment",         summary: "Ship to a real environment that people can actually use." },
  { id: "iteration",    label: "Iteration",          summary: "Learn from real use, improve, and document what changed and why." },
];

/** Architecture layers, in the order they appear top → bottom in diagrams. */
export const LAYERS = [
  { id: "client",   label: "Client" },
  { id: "frontend", label: "Frontend" },
  { id: "api",      label: "API" },
  { id: "ai",       label: "Processing & AI" },
  { id: "data",     label: "Data & Storage" },
  { id: "external", label: "External services" },
];

export const LABS = [
  { id: "security",     code: "LAB-01", name: "Security Lab",     icon: "shield", flagship: "securevault-ai",
    tagline: "Encryption, threat detection and privacy-first software." },
  { id: "ai",           code: "LAB-02", name: "AI Lab",           icon: "cpu",    flagship: "nexa",
    tagline: "Assistants and agents grounded in real knowledge." },
  { id: "knowledge",    code: "LAB-03", name: "Knowledge Lab",    icon: "brain",  flagship: "mindscape-ai",
    tagline: "Tools for thinking, remembering and connecting ideas." },
  { id: "data",         code: "LAB-04", name: "Data Lab",         icon: "chart",  flagship: "insightforge",
    tagline: "Turning raw data into decisions and clear visuals." },
  { id: "earth",        code: "LAB-05", name: "Earth Lab",        icon: "globe",  flagship: "earthpulse",
    tagline: "Climate and geospatial intelligence from live data." },
  { id: "bio",          code: "LAB-06", name: "Bio Lab",          icon: "leaf",   flagship: "floramind-ai",
    tagline: "Computer vision for the living world." },
  { id: "experimental", code: "LAB-07", name: "Experimental Lab", icon: "flask",  flagship: "playground",
    tagline: "Games, mini-apps and ideas that don't fit anywhere else — yet." },
];

const GH = "https://github.com/Nausheen1295";

/** @type {Project[]} */
export const PROJECTS = [
  /* ---------------------------------------------------------------- LIVE */
  {
    id: "securevault-ai",
    name: "SecureVault AI",
    lab: "security",
    status: "live",
    featured: true,
    tagline: "Next-gen cloud security platform",
    summary: "File encryption meets AI-powered threat detection — AES-256-GCM encryption that runs locally, " +
      "an AI threat scanner, biometric login, a blockchain key vault and zero-knowledge sharing.",
    problem: null,
    solution: "Encrypt files on the user's own device so they never leave it, and pair that with automated " +
      "threat scanning, passwordless biometric login and auditable key storage.",
    features: [
      "AES-256-GCM file encryption with PBKDF2 key derivation (310k iterations)",
      "Random salt & IV per file; batch file processing; 100% local — files never leave your device",
      "AI threat scanner: Shannon entropy analysis, file-signature matching, confidence scoring",
      "VirusTotal API integration",
      "Biometric authentication via WebAuthn (fingerprint / platform authenticators) — zero biometric data stored",
      "Blockchain key vault on the Ethereum Sepolia testnet with MetaMask, immutable audit trail and key revocation",
      "Zero-knowledge sharing: password never in the share URL, expiring links, max view count, one-click revocation, checksum verification",
      "Security analytics: real-time security score, threat history charts, event audit log, risk dashboard",
    ],
    role: null,
    technologies: ["React 18", "Vite 5", "JavaScript", "AES-256-GCM", "PBKDF2", "WebAuthn", "Ethereum (Sepolia)", "MetaMask", "VirusTotal API", "Vercel"],
    technologiesPlanned: false,
    aiCapabilities: [
      "Threat scanning using Shannon entropy analysis and file-signature matching",
      "Confidence scoring for detected threats",
    ],
    security: [
      "AES-256-GCM authenticated encryption",
      "PBKDF2 key derivation, 310,000 iterations",
      "Unique random salt and IV per file",
      "Client-side processing — plaintext files never uploaded",
      "WebAuthn biometrics with no biometric data stored",
      "Share links never contain the password; expiry, view limits and revocation",
    ],
    database: null,
    architecture: {
      nodes: [
        { id: "user", layer: "client", label: "User",
          detail: "Signs in with a password or a WebAuthn platform authenticator (fingerprint / face). No biometric data is stored by the app." },
        { id: "frontend", layer: "frontend", label: "React + Vite app",
          detail: "Single-page app built with React 18 and Vite 5, deployed on Vercel. Hosts the dashboard, scanner, vault and sharing UI." },
        { id: "crypto", layer: "ai", label: "Encryption engine",
          detail: "AES-256-GCM with keys derived through PBKDF2 (310k iterations) and a random salt + IV per file. Runs locally, so files never leave the device." },
        { id: "scanner", layer: "ai", label: "AI threat scanner",
          detail: "Analyses files with Shannon entropy and signature matching, produces a confidence score, and can cross-check with the VirusTotal API." },
        { id: "api", layer: "api", label: "Serverless API",
          detail: "The repository contains an api/ directory alongside the Vercel config. Its exact responsibilities are not documented yet." },
        { id: "chain", layer: "data", label: "Blockchain key vault",
          detail: "Key records are stored on the Ethereum Sepolia testnet through MetaMask, giving an immutable audit trail with support for key revocation." },
        { id: "virustotal", layer: "external", label: "VirusTotal",
          detail: "External threat-intelligence service used by the scanner for additional verification." },
      ],
      flow: [["user", "frontend"], ["frontend", "crypto"], ["frontend", "scanner"], ["frontend", "api"], ["scanner", "virustotal"], ["frontend", "chain"]],
    },
    challenges: [],
    decisions: [],
    timeline: [
      { stage: "development", date: "2026-05", note: "Repository created on GitHub — May 2026.",
        artifacts: [{ type: "repo", label: "Source code", url: `${GH}/securevault-ai` }] },
      { stage: "deployment", note: "Deployed on Vercel with a public live demo.",
        artifacts: [{ type: "demo", label: "Live demo", url: "https://securevaultai-brown.vercel.app" }] },
    ],
    results: null,
    links: { github: `${GH}/securevault-ai`, live: "https://securevaultai-brown.vercel.app" },
    // Screenshots from the project repo, resized to 960px WebP and hosted with the site.
    media: [
      ["login", 760, "login page", "Login"],
      ["dashboard", 678, "security dashboard", "Dashboard"],
      ["aithreatscanner", 671, "AI threat scanner", "AI Threat Scanner"],
      ["blockchainkeyvault", 673, "blockchain key vault", "Blockchain Key Vault"],
    ].map(([f, h, alt, caption]) => ({
      src: `assets/projects/securevault-ai/${f}.webp`, width: 960, height: h,
      alt: `SecureVault AI — ${alt}`, caption,
    })),
    keywords: ["cybersecurity", "encryption", "cryptography", "privacy", "blockchain", "biometrics", "malware", "web"],
    sources: [`${GH}/securevault-ai#readme`],
  },

  /* ------------------------------------------------------------ CONCEPTS */
  {
    id: "nexa",
    name: "NEXA",
    lab: "ai",
    status: "concept",
    featured: true,
    tagline: "AI portfolio assistant & digital twin",
    summary: "An assistant that answers questions about Nausheen's projects using retrieval over real project " +
      "documentation — with recruiter, developer, architecture and interview modes. It must never invent facts.",
    problem: "Portfolios are static: visitors can't ask follow-up questions about how or why something was built.",
    solution: "Retrieval-augmented generation over READMEs, architecture notes and decisions, answering only from documented sources.",
    features: [
      "Modes: Recruiter, Developer, Simple, Architecture, Interview",
      "Answers grounded in indexed project documentation, with sources",
      "Says when information isn't documented instead of guessing",
      "Mock technical interview about the portfolio",
    ],
    role: null,
    technologies: ["Python", "FastAPI", "RAG", "Vector database", "LLM API"],
    technologiesPlanned: true,
    aiCapabilities: ["Retrieval-augmented generation", "Persona / mode-conditioned answers", "Interview simulation"],
    security: ["API keys kept server-side only", "Rate limiting and input validation on the API"],
    database: null,
    architecture: {
      nodes: [
        { id: "ui", layer: "frontend", label: "NEXA chat UI", detail: "The chat interface on this portfolio (GitHub Pages). It only talks to the NEXA API." },
        { id: "api", layer: "api", label: "NEXA API", detail: "Planned separately-hosted backend (GitHub Pages can't run servers). Handles auth, validation and rate limiting." },
        { id: "rag", layer: "ai", label: "RAG pipeline", detail: "Embeds the question, retrieves the most relevant documentation chunks and builds a grounded prompt." },
        { id: "kb", layer: "data", label: "Project knowledge base", detail: "Indexed READMEs, architecture docs, decisions and project metadata — including this site's project data file." },
        { id: "llm", layer: "external", label: "LLM", detail: "Generates the final answer from retrieved context only, citing sources." },
      ],
      flow: [["ui", "api"], ["api", "rag"], ["rag", "kb"], ["rag", "llm"]],
    },
    challenges: [], decisions: [], timeline: [{ stage: "idea", note: "Concept defined: purpose, modes and a planned RAG architecture." }],
    results: null,
    links: {},
    keywords: ["chatbot", "assistant", "llm", "rag", "artificial intelligence", "digital twin"],
    sources: [],
  },
  {
    id: "mindscape-ai",
    name: "MindScape AI",
    lab: "knowledge",
    status: "concept",
    featured: true,
    tagline: "AI-powered second brain",
    summary: "A knowledge-management platform that captures notes, links related ideas automatically and lets you query your own knowledge.",
    problem: null, solution: null,
    features: ["Note capture", "Automatic linking of related ideas", "Semantic search across your knowledge"],
    role: null,
    technologies: ["Python", "Embeddings", "Graph visualisation"],
    technologiesPlanned: true,
    aiCapabilities: ["Semantic search", "Idea linking"],
    security: [], database: null, architecture: null,
    challenges: [], decisions: [], timeline: [{ stage: "idea", note: "Concept defined — features and stack planned, build not started." }],
    results: null, links: {},
    keywords: ["notes", "knowledge management", "second brain", "productivity", "artificial intelligence"],
    sources: [],
  },
  {
    id: "insightforge",
    name: "InsightForge",
    lab: "data",
    status: "concept",
    featured: true,
    tagline: "AI data analytics & visualisation",
    summary: "Upload a dataset, get automatic profiling, charts and plain-language insights.",
    problem: null, solution: null,
    features: ["Dataset upload & profiling", "Automatic chart suggestions", "Natural-language insights"],
    role: null,
    technologies: ["Python", "Pandas", "SQL", "Data visualisation"],
    technologiesPlanned: true,
    aiCapabilities: ["Insight generation", "Chart recommendation"],
    security: [], database: null, architecture: null,
    challenges: [], decisions: [], timeline: [{ stage: "idea", note: "Concept defined — features and stack planned, build not started." }],
    results: null, links: {},
    keywords: ["analytics", "dashboard", "data science", "charts", "artificial intelligence"],
    sources: [],
  },
  {
    id: "earthpulse",
    name: "EarthPulse",
    lab: "earth",
    status: "concept",
    featured: true,
    tagline: "Climate & geospatial intelligence",
    summary: "A platform that brings real-time earth and climate data together on interactive maps.",
    problem: null, solution: null,
    features: ["Real-time climate data feeds", "Geospatial map visualisation", "Trend and anomaly views"],
    role: null,
    technologies: ["JavaScript", "Mapping library", "Public climate APIs"],
    technologiesPlanned: true,
    aiCapabilities: [],
    security: [], database: null, architecture: null,
    challenges: [], decisions: [], timeline: [{ stage: "idea", note: "Concept defined — features and stack planned, build not started." }],
    results: null, links: {},
    keywords: ["climate", "maps", "geospatial", "environment", "real-time data"],
    sources: [],
  },
  {
    id: "floramind-ai",
    name: "FloraMind AI",
    lab: "bio",
    status: "concept",
    featured: true,
    tagline: "Computer-vision plant intelligence",
    summary: "Identify plants and spot signs of plant disease from a photo using computer vision.",
    problem: null, solution: null,
    features: ["Plant identification from photos", "Plant-health / disease indicators", "Care guidance"],
    role: null,
    technologies: ["Python", "Computer vision", "Image classification"],
    technologiesPlanned: true,
    aiCapabilities: ["Image classification"],
    security: [], database: null, architecture: null,
    challenges: [], decisions: [], timeline: [{ stage: "idea", note: "Concept defined — features and stack planned, build not started." }],
    results: null, links: {},
    keywords: ["computer vision", "plants", "machine learning", "image recognition", "artificial intelligence"],
    sources: [],
  },

  /* ------------------------------------------- EXPERIMENTAL (built here) */
  {
    id: "playground",
    name: "NEXUS Playground",
    lab: "experimental",
    status: "experimental",
    featured: false,
    tagline: "Browser games & mini-apps, zero libraries",
    summary: "Small games and tools built from scratch in vanilla JavaScript — Canvas rendering, CSS 3D transforms and local high scores.",
    problem: null, solution: null,
    features: ["Petal Snake (Canvas, swipe + keyboard)", "Memory Match (CSS 3D card flips, two difficulties)", "More experiments in progress"],
    role: "Designed and built solo.",
    technologies: ["JavaScript", "HTML Canvas", "CSS"],
    technologiesPlanned: false,
    aiCapabilities: [],
    security: [], database: null, architecture: null,
    challenges: [], decisions: [],
    timeline: [
      { stage: "development", note: "Petal Snake (Canvas) and Memory Match (CSS 3D) built from scratch in vanilla JavaScript.",
        artifacts: [{ type: "demo", label: "Play the games", url: "playground/" }] },
    ],
    results: null,
    links: { demo: "playground/" },
    keywords: ["games", "javascript", "canvas", "fun"],
    sources: [],
  },

  /* ------------------------------------ SUPPORTING WORK (public repos) */
  {
    id: "playfair-cipher",
    name: "NR Playfair Cipher",
    lab: "security",
    status: "complete",
    featured: false,
    tagline: "Extended classical cipher",
    summary: "A modified Playfair cipher supporting uppercase and lowercase letters, numbers and special characters.",
    problem: null, solution: null, features: [], role: null,
    technologies: ["Python"], technologiesPlanned: false,
    aiCapabilities: [], security: ["Classical cryptography"], database: null, architecture: null,
    challenges: [], decisions: [], timeline: [], results: null,
    links: { github: `${GH}/NR-Playfair-Cipher` },
    keywords: ["cryptography", "cipher", "cybersecurity", "encryption"],
    sources: [`${GH}/NR-Playfair-Cipher`],
  },
  {
    id: "packet-sniffer",
    name: "Packet Sniffer",
    lab: "security",
    status: "complete",
    featured: false,
    tagline: "CodeAlpha cybersecurity task",
    summary: "A basic network packet sniffer built with Python and Scapy, plus a phishing-awareness video.",
    problem: null, solution: null, features: [], role: null,
    technologies: ["Python", "Scapy"], technologiesPlanned: false,
    aiCapabilities: [], security: ["Network traffic analysis"], database: null, architecture: null,
    challenges: [], decisions: [], timeline: [], results: null,
    links: { github: `${GH}/CodeAlpha_CyberSecurity` },
    keywords: ["networking", "cybersecurity", "packets", "phishing"],
    sources: [`${GH}/CodeAlpha_CyberSecurity#readme`],
  },
  {
    id: "northstar-analysis",
    name: "NorthStar Mobility Analysis",
    lab: "data",
    status: "complete",
    featured: false,
    tagline: "Urban mobility & logistics data analysis",
    summary: "Coursework analysing NorthStar urban mobility and logistics data in Jupyter notebooks.",
    problem: null, solution: null, features: [], role: null,
    technologies: ["Python", "Jupyter Notebook"], technologiesPlanned: false,
    aiCapabilities: [], security: [], database: null, architecture: null,
    challenges: [], decisions: [], timeline: [], results: null,
    links: { github: `${GH}/NorthStar-Coursework` },
    keywords: ["data analysis", "logistics", "coursework", "data science"],
    sources: [`${GH}/NorthStar-Coursework#readme`],
  },
];

/* ---------------------------------------------------------------- helpers */
export const getProject = (id) => PROJECTS.find((p) => p.id === id) || null;
export const getLab = (id) => LABS.find((l) => l.id === id) || null;
export const projectsInLab = (labId) => PROJECTS.filter((p) => p.lab === labId);
export const featuredProjects = () => PROJECTS.filter((p) => p.featured);
