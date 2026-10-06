/* ==========================================================================
   NEXUS — "Products I sell" (FUTURE ENHANCEMENT)
   Digital products planned for a future storefront. Nothing is on sale yet:
   every item is `planned`, has no price, and offers "Notify me" only.
   When one launches, set status: "available", add `price` and a `buyUrl`.
   ========================================================================== */

/** @typedef {{id: string, icon: string, name: string, description: string, status: "planned"|"available", price?: string, buyUrl?: string}} Product */

/** @type {Product[]} */
export const STORE = [
  { id: "figma-ui-kit",     icon: "🎨", status: "planned", name: "Figma UI Kit",                description: "A clean, reusable UI component kit to design beautiful apps faster." },
  { id: "ai-prompt-pack",   icon: "🤖", status: "planned", name: "AI Prompt Pack",              description: "Ready-to-use prompts and automation templates for everyday productivity." },
  { id: "app-starter",      icon: "📱", status: "planned", name: "App Starter Template",        description: "An Android app starter with clean architecture to kickstart your build." },
  { id: "resume-portfolio", icon: "📄", status: "planned", name: "Resume & Portfolio Template", description: "A modern, ATS-friendly résumé plus a portfolio template." },
];

/** What the future storefront will add — shown as a roadmap, clearly marked as planned. */
export const STORE_ROADMAP = [
  { step: "Now", label: "Register interest", detail: "Leave your email to hear when a product launches." },
  { step: "Next", label: "Product pages & previews", detail: "Screenshots, contents and who each product is for." },
  { step: "Later", label: "Secure checkout", detail: "Buy and download directly from the NEXUS Store." },
];
