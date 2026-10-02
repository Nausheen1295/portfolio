/* ==========================================================================
   NEXA — client configuration
   The NEXA backend (RAG API) will be hosted separately from GitHub Pages.
   Set `endpoint` once it's deployed. NEVER put API keys or secrets here —
   this file ships to every visitor. Keys live only on the backend.
   ========================================================================== */
export const NEXA_CONFIG = {
  endpoint: null,          // e.g. "https://nexa-api.example.com/v1" — null = offline
  timeoutMs: 20000,
  maxQuestionLength: 500,
  maxHistory: 8,           // previous turns sent for context
};
