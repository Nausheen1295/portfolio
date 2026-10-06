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
    items: ["AI Agents", "Workflow Automation", "Prompt Engineering", "AI threat detection"],
    evidence: ["securevault-ai", "nexa"] },
  { id: "software", name: "Software Development",  icon: "code",
    items: ["Python", "Java", "JavaScript", "TypeScript", "REST APIs", "Android Studio"],
    evidence: ["securevault-ai", "playfair-cipher", "playground"] },
  { id: "web",      name: "Web Development",       icon: "globe",
    items: ["React", "Vite", "HTML", "CSS", "Canvas", "Responsive design"],
    evidence: ["securevault-ai", "playground"] },
  { id: "security", name: "Cybersecurity",         icon: "shield",
    items: ["AES-256-GCM", "PBKDF2", "WebAuthn", "Cryptography", "Packet analysis (Scapy)", "Phishing awareness"],
    evidence: ["securevault-ai", "playfair-cipher", "packet-sniffer"] },
  { id: "data",     name: "Databases & Data",      icon: "database",
    items: ["Oracle SQL", "Database design", "Data analysis", "Jupyter"],
    evidence: ["northstar-analysis"] },
  { id: "design",   name: "UI / UX",               icon: "pen",
    items: ["Figma", "Wireframing", "Prototyping", "User-centered design"],
    evidence: ["securevault-ai"] },
  { id: "cloud",    name: "Cloud & Deployment",    icon: "cloud",
    items: ["Vercel", "GitHub Pages", "Ethereum testnet (Sepolia)"],
    evidence: ["securevault-ai"] },
  { id: "tools",    name: "Developer Tools",       icon: "terminal",
    items: ["Git & GitHub", "VS Code", "Linux", "Cisco Packet Tracer"],
    evidence: [] },
];
