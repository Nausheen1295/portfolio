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
  { id: "web",          code: "LAB-08", name: "Web Lab",          icon: "code",   flagship: "corizo-ecommerce",
    tagline: "Full-stack web applications — from REST APIs to deployed products." },
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

  /* ----------------------------------------- CORIZO PROGRAMME (2026) */
  {
    id: "corizo-ecommerce",
    name: "Tech World E-Commerce",
    lab: "web",
    status: "in-development",
    featured: true,
    tagline: "Full-stack electronics store — Corizo web development major project",
    summary: "A full-stack e-commerce website for electronics. Customers browse products, manage a cart and place " +
      "cash-on-delivery orders; administrators manage products, stock, orders and customers from a dashboard.",
    problem: null,
    solution: null,
    features: [
      "Product catalogue with live search, category filters and sort options",
      "Customer accounts: register, log in and log out securely",
      "Shopping cart with quantity changes, stock availability and live totals",
      "Checkout with a shipping address and cash-on-delivery orders",
      "Order history with order and payment status",
      "Admin dashboard: active products, total orders, orders to process and revenue",
      "Admins add, edit, hide and restore products, and upload product images",
      "Order status workflow (Pending → Confirmed → Shipped → Delivered, or Cancelled); stock returns automatically on cancellation",
      "Role-based access control for customer and admin accounts",
    ],
    role: null,
    technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "Node.js", "Express.js", "MongoDB Atlas", "Mongoose",
      "express-session", "connect-mongo", "bcryptjs", "Cloudinary", "Multer", "Render"],
    technologiesPlanned: false,
    aiCapabilities: [],
    security: [
      "Passwords hashed with bcrypt, never stored in plain text",
      "Login sessions stored in the database with secure, HTTP-only cookies",
      "Admin pages and actions protected on the server",
      "Prices and stock always checked on the server, never trusted from the browser",
    ],
    database: "MongoDB Atlas via Mongoose, with User, Product and Order models; sessions stored in MongoDB (connect-mongo).",
    architecture: {
      nodes: [
        { id: "browser", layer: "client", label: "Customer / Admin",
          detail: "Customers shop from the catalogue, cart and checkout pages; administrators use the dashboard to manage products, orders and customers." },
        { id: "frontend", layer: "frontend", label: "Bootstrap web pages",
          detail: "Responsive HTML, CSS and JavaScript pages built with Bootstrap 5: home catalogue, register/log in, cart, checkout, my orders and the admin dashboard." },
        { id: "api", layer: "api", label: "Express.js API",
          detail: "Node.js + Express server with routes for auth, products, cart, orders and uploads. Middleware checks login and admin access on the server." },
        { id: "sessions", layer: "api", label: "Sessions & auth",
          detail: "express-session with connect-mongo stores login sessions in the database using secure, HTTP-only cookies; passwords are hashed with bcrypt." },
        { id: "db", layer: "data", label: "MongoDB Atlas",
          detail: "Mongoose models for Users, Products and Orders. Prices and stock are validated on the server before any order is saved." },
        { id: "images", layer: "external", label: "Cloudinary",
          detail: "Product images uploaded from the admin dashboard (via Multer) are stored on Cloudinary." },
      ],
      flow: [["browser", "frontend"], ["frontend", "api"], ["api", "sessions"], ["api", "db"], ["sessions", "db"], ["api", "images"]],
    },
    challenges: [],
    decisions: [],
    timeline: [
      { stage: "development", date: "2026-10", note: "Built during the Corizo Web Development internship as the major project; work is ongoing.",
        artifacts: [{ type: "repo", label: "Source code", url: `${GH}/corizo-ecommerce-website` }] },
      { stage: "testing", note: "Automated end-to-end test of the full shopping flow (Node.js)." },
      { stage: "deployment", note: "Deployed on Render (free plan — the first load can take up to a minute while the server wakes).",
        artifacts: [{ type: "demo", label: "Live store", url: "https://corizo-store.onrender.com" }] },
    ],
    results: null,
    links: { github: `${GH}/corizo-ecommerce-website`, live: "https://corizo-store.onrender.com" },
    keywords: ["e-commerce", "shopping cart", "full-stack", "web development", "node", "mongodb", "authentication", "admin dashboard", "corizo"],
    sources: [`${GH}/corizo-ecommerce-website#readme`],
  },
  {
    id: "corizo-student-management",
    name: "Student Management App",
    lab: "web",
    status: "complete",
    featured: true,
    tagline: "Full-stack CRUD application — Corizo web development minor project",
    summary: "A responsive full-stack student management application with a REST API for creating, viewing, updating, " +
      "deleting and searching student records, backed by MongoDB Atlas and deployed on Render.",
    problem: null,
    solution: null,
    features: [
      "Create, view, update and delete student records (delete asks for confirmation)",
      "Search by student name, email, phone number or course",
      "Required-field validation and duplicate-email prevention",
      "Records stored in MongoDB Atlas",
      "Responsive interface built with Bootstrap",
      "REST API built with Express.js: GET/POST/PUT/DELETE /api/students, plus a status check",
    ],
    role: null,
    technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "Node.js", "Express.js", "MongoDB Atlas", "Mongoose", "Render"],
    technologiesPlanned: false,
    aiCapabilities: [],
    security: ["Database credentials kept in environment variables; the .env file is never committed"],
    database: "MongoDB Atlas via Mongoose (Student model).",
    architecture: {
      nodes: [
        { id: "browser", layer: "client", label: "User",
          detail: "Manages student records from a single dashboard: add, edit, delete and search." },
        { id: "frontend", layer: "frontend", label: "Bootstrap dashboard",
          detail: "HTML, CSS and JavaScript front end (Bootstrap 5) that calls the API with the Fetch API." },
        { id: "api", layer: "api", label: "Express REST API",
          detail: "Node.js + Express routes: GET /api/students (with ?search=), GET/PUT/DELETE /api/students/:id, POST /api/students, GET /api/test." },
        { id: "db", layer: "data", label: "MongoDB Atlas",
          detail: "Student records stored through a Mongoose model, with validation and unique email addresses." },
      ],
      flow: [["browser", "frontend"], ["frontend", "api"], ["api", "db"]],
    },
    challenges: [],
    decisions: [],
    timeline: [
      { stage: "development", date: "2026-10", note: "Built during the Corizo Web Development internship as the individual minor project.",
        artifacts: [{ type: "repo", label: "Source code", url: `${GH}/Corizo-CRUD-Application` }] },
      { stage: "deployment", note: "Deployed on Render.",
        artifacts: [{ type: "demo", label: "Live app", url: "https://corizo-student-management.onrender.com/" }] },
    ],
    results: null,
    links: { github: `${GH}/Corizo-CRUD-Application`, live: "https://corizo-student-management.onrender.com/" },
    keywords: ["crud", "rest api", "full-stack", "web development", "node", "mongodb", "student management", "corizo"],
    sources: [`${GH}/Corizo-CRUD-Application#readme`],
  },
  {
    id: "stock-price-prediction",
    name: "Stock Price Prediction",
    lab: "ai",
    status: "complete",
    featured: true,
    tagline: "ML & deep learning for next-day forecasting — Corizo machine learning minor project",
    summary: "Forecasts Apple (AAPL) next-day closing prices with Ridge Regression, Random Forest and an LSTM network, " +
      "and tests honestly whether the forecasts beat simple baselines.",
    problem: "Investors want to know where the market is heading, but forecasting stock prices is notoriously hard.",
    solution: "Predict the next-day return from engineered price features, compare against naive and drift baselines, " +
      "and check statistical significance and a simple trading simulation before trusting any model.",
    features: [
      "Exploratory analysis: trends, return distribution, volatility, correlations and autocorrelation",
      "20 engineered features: lagged returns, moving-average gaps, momentum, volatility, RSI and S&P 500 returns",
      "Chronological split: train 70% (2007–2013), validation 15%, test 15% (Oct 2014 – Feb 2016)",
      "Models: Naive and Drift baselines, Ridge Regression, Random Forest and an LSTM (Keras)",
      "Metrics: RMSE, MAE, MAPE, R², directional accuracy, a binomial significance test and a trading simulation",
    ],
    role: null,
    technologies: ["Python", "pandas", "NumPy", "scikit-learn", "TensorFlow / Keras", "SciPy", "Matplotlib", "seaborn", "Jupyter"],
    technologiesPlanned: false,
    aiCapabilities: [
      "Supervised regression: Ridge Regression and Random Forest Regressor",
      "Deep learning: LSTM (Long Short-Term Memory) neural network",
      "Hyper-parameter tuning on a held-out validation set",
    ],
    security: [],
    database: "Public Yahoo Finance daily adjusted closing prices, 3 Jan 2007 – 1 Mar 2016 (2,306 trading days) for AAPL, MSFT, IBM, SBUX and the S&P 500.",
    architecture: null,
    challenges: [],
    decisions: [
      "Predict next-day return rather than price, then convert back: price = today's close × (1 + predicted return)",
      "Split the data chronologically (no shuffling) so the test set is genuinely in the future",
    ],
    timeline: [
      { stage: "development", date: "2026-10", note: "Completed as the Corizo Machine Learning minor project.",
        artifacts: [{ type: "doc", label: "Notebook & README", url: `${GH}/portfolio/tree/main/projects/stock-price-prediction` }] },
      { stage: "testing", note: "Evaluated on a 339-day test set against naive and drift baselines, with a significance test." },
    ],
    results: "On the 339-day test set no model beat the naive baseline on RMSE (naive 1.903 vs Random Forest 1.911, LSTM 1.923). " +
      "Random Forest predicted direction best at 53.4%, but this is not statistically significant (p ≈ 0.12) — consistent with " +
      "the Efficient Market Hypothesis. Educational project only, not financial advice.",
    links: { github: `${GH}/portfolio/tree/main/projects/stock-price-prediction` },
    keywords: ["machine learning", "deep learning", "lstm", "random forest", "forecasting", "time series", "finance", "stocks", "corizo"],
    sources: [`${GH}/portfolio/tree/main/projects/stock-price-prediction`],
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
    features: ["Petal Snake (Canvas, swipe + keyboard)", "Memory Match (CSS 3D card flips, two difficulties)", "Pixel Studio (free-draw pixel art + color-by-number pictures)", "Air Pop (webcam game: MediaPipe hand tracking or motion detection)", "More experiments in progress"],
    role: "Designed and built solo.",
    technologies: ["JavaScript", "HTML Canvas", "CSS", "MediaPipe"],
    technologiesPlanned: false,
    aiCapabilities: [],
    security: [], database: null, architecture: null,
    challenges: [], decisions: [],
    timeline: [
      { stage: "development", note: "Petal Snake (Canvas), Memory Match (CSS 3D), Pixel Studio (CSS Grid pixel art) and Air Pop (webcam game) built in vanilla JavaScript; Air Pop uses MediaPipe for hand tracking.",
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
