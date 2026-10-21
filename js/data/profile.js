/* ==========================================================================
   NEXUS — PROFILE DATA (verified facts only)
   Source: the existing portfolio content and public GitHub repositories.
   ========================================================================== */

export const PROFILE = {
  name: "Nausheen Haleelur Rahman",
  initials: "NHR",
  role: "AI & Software Developer",
  headline: "Building intelligent, secure, and user-centered software experiences.",
  location: "Dubai, United Arab Emirates",
  status: "Open to opportunities",
  spokenLanguages: ["English", "Tamil", "Hindi", "Urdu"],

  education: [
    {
      degree: "BSc (Hons) Computer Science",
      school: "University of West London (UWL)",
      period: "Oct 2023 – May 2026",
      detail: "Software Engineering, AI & Automation, Databases, Computer Networks, App Development, UI/UX Design.",
    },
    {
      degree: "Higher Secondary — Science",
      school: "The Central School",
      period: "2023",
      detail: "Graduated with 87%.",
    },
  ],

  experience: [
    {
      title: "Web Development Trainee & Intern",
      org: "Corizo (with IIT Bombay's Mood Indigo)",
      period: "Sep 2026 – present",
      detail: "Certified training in web development (5 Sep – 5 Oct 2026), then the internship phase: built and deployed a " +
        "Student Management CRUD app (minor project) and a full-stack e-commerce store (major project, ongoing).",
    },
    {
      title: "Machine Learning Trainee & Intern",
      org: "Corizo (with IIT Bombay's Mood Indigo)",
      period: "Sep 2026 – present",
      detail: "Certified training in machine learning (5 Sep – 5 Oct 2026), then the internship phase: completed a Stock Price " +
        "Prediction minor project comparing Ridge Regression, Random Forest and LSTM models.",
    },
    {
      title: "Rotational Intern",
      org: "Medulla",
      period: "2025",
      detail: "Rotated across Technical, Database, and CSR & Marketing functions — IT support, data management, and collaborating with multidisciplinary teams.",
    },
  ],

  links: {
    email: "naus2005official@gmail.com",
    github: "https://github.com/Nausheen1295",
    linkedin: "https://www.linkedin.com/in/nausheen-haleelur-rahman-45a55a234/",
    resume: "resume.pdf",
  },

  // Illustrated / animated avatar. Drop the file in assets/ and set the path.
  // Until then the UI shows the monogram fallback.
  avatar: null, // e.g. "assets/avatar.webp"
};

/**
 * Skills grouped by domain. `evidence` links each group to project ids in
 * projects.js, so skills are backed by work rather than self-rated percentages.
 */
export const SKILL_GROUPS = [
  { id: "ai",       name: "AI & Machine Learning", icon: "cpu",
    items: ["Machine learning (scikit-learn)", "Deep learning (LSTM, Keras)", "AI Agents", "Workflow Automation", "Prompt Engineering", "AI threat detection"],
    evidence: ["stock-price-prediction", "securevault-ai", "nexa"] },
  { id: "software", name: "Software Development",  icon: "code",
    items: ["Python", "Java", "JavaScript", "TypeScript", "REST APIs", "Android Studio"],
    evidence: ["securevault-ai", "playfair-cipher", "playground"] },
  { id: "web",      name: "Web Development",       icon: "globe",
    items: ["Node.js", "Express.js", "REST APIs", "Bootstrap", "React", "Vite", "HTML", "CSS", "Canvas", "Responsive design"],
    evidence: ["corizo-ecommerce", "corizo-student-management", "securevault-ai", "playground"] },
  { id: "security", name: "Cybersecurity",         icon: "shield",
    items: ["AES-256-GCM", "PBKDF2", "WebAuthn", "Cryptography", "Packet analysis (Scapy)", "Phishing awareness"],
    evidence: ["securevault-ai", "playfair-cipher", "packet-sniffer"] },
  { id: "data",     name: "Databases & Data",      icon: "database",
    items: ["MongoDB Atlas", "Mongoose", "Oracle SQL", "Database design", "Data analysis", "pandas", "Jupyter"],
    evidence: ["corizo-ecommerce", "stock-price-prediction", "northstar-analysis"] },
  { id: "design",   name: "UI / UX",               icon: "pen",
    items: ["Figma", "Wireframing", "Prototyping", "User-centered design"],
    evidence: ["securevault-ai"] },
  { id: "cloud",    name: "Cloud & Deployment",    icon: "cloud",
    items: ["Render", "Vercel", "GitHub Pages", "Ethereum testnet (Sepolia)"],
    evidence: ["corizo-ecommerce", "securevault-ai"] },
  { id: "tools",    name: "Developer Tools",       icon: "terminal",
    items: ["Git & GitHub", "VS Code", "Linux", "Cisco Packet Tracer"],
    evidence: [] },
];
