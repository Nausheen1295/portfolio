/* ==========================================================================
   NEXUS — entry point
   ========================================================================== */
import { LABS, PROJECTS } from "./data/projects.js";
import { runBoot } from "./core/boot.js";
import { initTheme } from "./core/theme.js";
import { initNav } from "./core/nav.js";
import { reveal } from "./core/reveal.js";
import { initContact } from "./core/contact.js";
import { initProjectModal } from "./ui/project-modal.js";
import { renderHero, renderProjects, renderSkills, renderStore, hydrateIcons } from "./sections/render.js";
import { initUniverse } from "./sections/universe.js";
import { initJourney } from "./sections/journey.js";
import { initNexa } from "./nexa/ui.js";
import { initCommandCenter } from "./core/command-center.js";

document.documentElement.classList.add("nx-ready");

runBoot({ projectCount: PROJECTS.length, labCount: LABS.length });
initTheme(document.getElementById("themeBtn"));
initNav();

renderHero();
const projects = renderProjects();
const universe = initUniverse(document.getElementById("universeMap"), {
  onFilter(labId) {
    projects.show(labId);
    document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
  },
});
initJourney(document.getElementById("journeyMount"));
const nexa = initNexa(document.getElementById("nexaMount"));
renderSkills();
renderStore();
hydrateIcons();

initProjectModal();
initCommandCenter({ nexa, projects, universe });
initContact();
reveal();

document.getElementById("year").textContent = new Date().getFullYear();
