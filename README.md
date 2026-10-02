# NEXUS Universe — Nausheen Haleelur Rahman

Portfolio of Nausheen Haleelur Rahman, AI & Software Developer.
Live at **https://nausheen1295.github.io/portfolio/**

Plain HTML, CSS and JavaScript (ES modules). There's no framework and no build step, and it deploys to GitHub Pages as it is.

## Run it locally
The site uses JavaScript modules, which browsers block when you double-click `index.html` (`file://`). Start a local server instead:

```bash
python -m http.server 8000      # then open http://localhost:8000
```
(Or use VS Code's **Live Server** extension.)

## Structure
```
index.html               Home page (NEXUS)
project.html             Case-study template — project.html?id=<project-id>
design-system.html       Living style guide: tokens and components (not indexed)
css/nexus/
  tokens.css             Design tokens: colour, type, spacing, radius, motion
  base.css               Reset, typography, focus states, utilities
  components.css         Buttons, cards, badges, nav, modal, NEXA chat, avatar…
  sections.css           Home-page section layouts
  universe.css           Universe map (desktop constellation + mobile carousel)
  case-study.css         Case-study page, architecture diagram, journey tracker
  journey.css            Engineering Journey section (stage rail + evidence)
  nexa.css               NEXA assistant interface
  command.css            Command Center + achievement notifications
js/
  main.js                Entry point (home)
  project-page.js        Entry point (case studies)
  data/projects.js       ★ Single source of truth for labs and projects
  data/profile.js        Verified profile facts and skill groups
  data/store.js          Store items
  core/                  boot, theme, nav, reveal, contact
  ui/                    icons, components, project-modal, architecture, toast
  sections/render.js     Renders data-driven sections
  sections/universe.js   Interactive lab map; deep links like #lab-security
  sections/journey.js    Engineering Journey: stages, follow-a-project, evidence
  core/search.js         Deterministic knowledge search over projects.js
  core/command-center.js ⌘K / Ctrl+K / "/" — search + "> commands" (all pages)
  core/achievements.js   Lab exploration achievements (localStorage)
  nexa/config.js         NEXA endpoint (null = offline). Never put secrets here.
  nexa/client.js         The only module that calls the NEXA API (contract documented inside)
  nexa/ui.js             Chat interface: modes, context, suggestions, doc-search fallback
playground/              Experimental Lab: hub + games
assets/                  og-image.png (social preview), apple-touch-icon.png, project screenshots (WebP)
404.html                 "Signal lost" page (GitHub Pages serves it for unknown URLs)
sitemap.xml              Generated — submit in Google Search Console
tools/export-knowledge.mjs  Builds NEXA's knowledge file from the site data (+ GitHub READMEs)
tools/update-preloads.mjs   Adds <link rel="modulepreload"> for every JS module (re-run after adding modules)
tools/build-sitemap.mjs     Regenerates sitemap.xml from the project data
nexa-backend/            NEXA API (FastAPI + Claude). Deployed separately — see nexa-backend/README.md
```

## Editing content
- **Projects / labs:** edit `js/data/projects.js`. Only add verified facts. Leave unknown fields `null`, and the site will show "not documented yet".
  Status values: `live`, `complete`, `in-development`, `concept`, `experimental`.
- **Engineering Journey:** add entries to a project's `timeline` — `{ stage, note, date?, artifacts?: [{ type, label, url }] }`.
  Stages: idea, research, problem, ux, architecture, development, testing, deployment, iteration.
  Artifact types: repo, demo, wireframe, screenshot, doc, decision, commit.
- **After editing project data:** run `node tools/export-knowledge.mjs --readmes` so NEXA's knowledge stays in sync.
- **NEXA:** set `endpoint` in `js/nexa/config.js` (https only) once the backend is deployed. Until then NEXA runs
  in clearly-labelled documentation-search mode and never generates answers.
- **Avatar:** put your animated or illustrated image in `assets/` and set `avatar: "assets/your-file.webp"` in `js/data/profile.js`.
- **Contact form:** posts to Formspree (`action` on the form in `index.html`).

## Command Center
Press **Ctrl+K** (⌘K on Mac) or **/** anywhere. Type to search projects, labs, skills and sections, or start with
**`>`** for commands: `open security lab`, `explain securevault`, `show data projects`, `show ai projects`,
`start interview`, `meet nexa`, `show engineering journey`, `theme light`, `achievements`, `help`.
A few hidden commands and a keyboard easter egg are left for visitors to find.

## After changing content
```bash
node tools/export-knowledge.mjs --readmes   # NEXA knowledge
node tools/build-sitemap.mjs                # sitemap
node tools/update-preloads.mjs              # only if you added/removed JS modules
```

## Tests
```bash
cd tests
npm install            # once — uses your installed Chrome, no browser download
npm test               # data guardrails + 85 end-to-end browser tests (~1 min)
npm run test:data      # just the content guardrails (instant)
cd ../nexa-backend && pytest   # 34 backend tests
```
- **Data guardrails** (`tests/unit/`): honesty rules, e.g. only shipped work is "Live", concept projects stay labelled as plans, excluded projects never appear, links and media are valid, NEXA knowledge isn't stale.
- **End-to-end** (`tests/e2e/`): every feature in desktop Chrome plus a phone profile, axe accessibility in both themes, no horizontal overflow at 5 widths, no-JavaScript and reduced-motion modes, and NEXA's online path against a mocked backend.
- **Server:** `tests/serve.mjs` serves the site under `/portfolio/` exactly like GitHub Pages, including the 404 page.

## Quality bar (checked in Phase 10)
- **Accessibility:** axe-core reports 0 violations on every page, in both themes. Keyboard-operable throughout, with visible focus and reduced-motion support.
- **Lighthouse (desktop):** Performance 95–100, Accessibility 100, Best Practices 100, SEO 100.
- **Responsive:** no horizontal overflow at 320 / 375 / 768 / 1024 / 1440 px.

## Deploying to GitHub Pages
Copy the site into the `portfolio` repo, but **leave out** `nexa-backend/.venv/` (it's huge; deploy the backend separately)
and `profile.png` (4 MB and no longer used — the avatar slot is for your illustrated image).
GitHub Pages only reads `robots.txt` at the domain root, so instead submit `sitemap.xml` in Google Search Console.
