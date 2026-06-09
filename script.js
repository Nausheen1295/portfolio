/* ============================================================
   PORTFOLIO — interactivity
   ============================================================ */

/* ---------- CONFIG: edit these ---------- */
const CONFIG = {
  githubUsername: "Nausheen1295",   // ← your GitHub username (live projects pull from here)
  formspreeId: "xwvjbokz",          // ← your Formspree form ID — messages go straight to your inbox.
  typedRoles: [
    "Computer Science Graduate 🎓",
    "AI & Software Developer 🤖",
    "App Developer 📱",
    "UI/UX Designer 🎨",
    "Problem Solver 🧩",
    "Lifelong Learner 📚",
  ],
};

/* ============================================================
   THEME (dark / light) — persisted
   ============================================================ */
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme")
  || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
root.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

/* ============================================================
   NAVBAR — scroll style, mobile menu, active link, progress
   ============================================================ */
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const scrollProgress = document.getElementById("scrollProgress");
const backTop = document.getElementById("backTop");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll(".nav-link").forEach(link =>
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  })
);

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  navbar.classList.toggle("scrolled", y > 30);
  backTop.classList.toggle("show", y > 500);

  const h = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (y / h) * 100 + "%";

  // active nav link
  let current = "";
  document.querySelectorAll("section[id]").forEach(sec => {
    if (y >= sec.offsetTop - 120) current = sec.id;
  });
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
});

backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ============================================================
   TYPING EFFECT
   ============================================================ */
const typedEl = document.getElementById("typed");
let roleIdx = 0, charIdx = 0, deleting = false;
function typeLoop() {
  const word = CONFIG.typedRoles[roleIdx];
  typedEl.textContent = word.substring(0, charIdx);
  if (!deleting && charIdx < word.length) {
    charIdx++;
    setTimeout(typeLoop, 90);
  } else if (deleting && charIdx > 0) {
    charIdx--;
    setTimeout(typeLoop, 45);
  } else {
    if (!deleting) { deleting = true; setTimeout(typeLoop, 1600); }
    else { deleting = false; roleIdx = (roleIdx + 1) % CONFIG.typedRoles.length; setTimeout(typeLoop, 300); }
  }
}
typeLoop();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ============================================================
   ANIMATED COUNTERS + SKILL BARS (trigger on view)
   ============================================================ */
const counters = document.querySelectorAll(".stat-num");
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const tick = () => {
      n += step;
      if (n >= target) { el.textContent = target; }
      else { el.textContent = n; requestAnimationFrame(tick); }
    };
    tick();
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => countObserver.observe(c));

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const fill = entry.target.querySelector(".skill-fill");
    if (fill) fill.style.width = entry.target.dataset.level + "%";
    skillObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });
document.querySelectorAll(".skill").forEach(s => skillObserver.observe(s));

/* ============================================================
   PROJECTS — live from GitHub, with graceful fallback
   ============================================================ */
const projectsGrid = document.getElementById("projectsGrid");
const projectSearch = document.getElementById("projectSearch");
let allProjects = [];

const langEmoji = {
  JavaScript: "🟨", TypeScript: "🔷", Python: "🐍", HTML: "🌐", CSS: "🎨",
  Java: "☕", "C++": "➕", C: "🔧", Go: "🐹", Rust: "🦀", PHP: "🐘", Ruby: "💎",
};

const fallbackProjects = [
  { name: "Awesome Web App", description: "A full-stack web application built with React and Node.js.", html_url: "#", homepage: "", language: "JavaScript", stargazers_count: 12, forks_count: 3 },
  { name: "ML Playground", description: "Experiments in machine learning and data visualization.", html_url: "#", homepage: "", language: "Python", stargazers_count: 8, forks_count: 1 },
  { name: "Portfolio Site", description: "This very portfolio — responsive, animated, themeable.", html_url: "#", homepage: "", language: "CSS", stargazers_count: 5, forks_count: 0 },
  { name: "Algo Visualizer", description: "Interactive visualizations of sorting & pathfinding algorithms.", html_url: "#", homepage: "", language: "TypeScript", stargazers_count: 20, forks_count: 6 },
];

function renderProjects(list) {
  if (!list.length) {
    projectsGrid.innerHTML = `<p class="blog-empty">No projects match your search.</p>`;
    return;
  }
  projectsGrid.innerHTML = list.map(p => {
    const emoji = langEmoji[p.language] || "📁";
    const live = p.homepage ? `<a href="${p.homepage}" target="_blank" rel="noopener">🔗 Live Demo</a>` : "";
    return `
      <article class="project-card reveal visible">
        <div class="project-top">
          <span class="project-icon">${emoji}</span>
          <span class="project-stars">⭐ ${p.stargazers_count} &nbsp; 🍴 ${p.forks_count}</span>
        </div>
        <h3>${escapeHtml(prettyName(p.name))}</h3>
        <p>${escapeHtml(p.description || "No description provided.")}</p>
        ${p.language ? `<div class="project-langs"><span class="lang-pill">${p.language}</span></div>` : ""}
        <div class="project-links">
          <a href="${p.html_url}" target="_blank" rel="noopener">⌨ Code</a>
          ${live}
        </div>
      </article>`;
  }).join("");
}

function prettyName(name) {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

async function loadProjects() {
  try {
    const res = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=100`);
    if (!res.ok) throw new Error("GitHub API error");
    let repos = await res.json();
    repos = repos.filter(r => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 9);
    allProjects = repos.length ? repos : fallbackProjects;
  } catch (e) {
    allProjects = fallbackProjects;
  }
  renderProjects(allProjects);
}

projectSearch.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  renderProjects(allProjects.filter(p =>
    (p.name + " " + (p.description || "") + " " + (p.language || "")).toLowerCase().includes(q)
  ));
});

loadProjects();

/* ============================================================
   PRODUCTS — buy buttons
   ============================================================ */
document.querySelectorAll(".buy-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showToast(`🛒 "${btn.dataset.product}" — checkout coming soon! Email me to order.`);
  });
});

/* ============================================================
   BLOG — add / delete posts, saved in localStorage
   ============================================================ */
const blogGrid = document.getElementById("blogGrid");
const newPostBtn = document.getElementById("newPostBtn");
const blogForm = document.getElementById("blogForm");
const cancelPost = document.getElementById("cancelPost");

const seedPosts = [
  { id: 1, title: "Why I'm Passionate About AI", tags: ["AI", "thoughts"], body: "Artificial Intelligence is reshaping how we build software. Here's why I chose to centre my journey around AI-driven, user-focused solutions...", date: "2026-01-20" },
  { id: 2, title: "Lessons From My Medulla Internship", tags: ["career", "experience"], body: "Rotating across Technical, Database, and CSR & Marketing functions taught me more than code — teamwork, data integrity, and real-world problem solving. Here's what I took away...", date: "2025-11-10" },
  { id: 3, title: "Designing With the User in Mind", tags: ["UI/UX", "design"], body: "Good design isn't just about looks — it's about how it feels to use. Here are my favourite principles for user-centered design in Figma...", date: "2025-12-15" },
];

function getPosts() {
  const stored = localStorage.getItem("blogPosts");
  return stored ? JSON.parse(stored) : seedPosts;
}
function savePosts(posts) { localStorage.setItem("blogPosts", JSON.stringify(posts)); }

function renderBlog() {
  const posts = getPosts();
  if (!posts.length) {
    blogGrid.innerHTML = `<p class="blog-empty">No posts yet. Click "Write New Post" to add one! ✍️</p>`;
    return;
  }
  blogGrid.innerHTML = posts.map(p => `
    <article class="blog-card reveal visible">
      <button class="blog-delete" data-id="${p.id}" title="Delete post">🗑️</button>
      <span class="blog-date">📅 ${formatDate(p.date)}</span>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.body)}</p>
      <div class="blog-tags">${(p.tags || []).map(t => `<span class="blog-tag">#${escapeHtml(t)}</span>`).join("")}</div>
    </article>`).join("");

  blogGrid.querySelectorAll(".blog-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const posts = getPosts().filter(p => String(p.id) !== btn.dataset.id);
      savePosts(posts);
      renderBlog();
      showToast("🗑️ Post deleted.");
    });
  });
}

newPostBtn.addEventListener("click", () => {
  blogForm.hidden = !blogForm.hidden;
  if (!blogForm.hidden) blogForm.scrollIntoView({ behavior: "smooth", block: "center" });
});
cancelPost.addEventListener("click", () => { blogForm.hidden = true; blogForm.reset(); });

blogForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("postTitle").value.trim();
  const body = document.getElementById("postBody").value.trim();
  const tags = document.getElementById("postTags").value.split(",").map(t => t.trim()).filter(Boolean);
  if (!title || !body) return;

  const posts = getPosts();
  posts.unshift({ id: Date.now(), title, body, tags, date: new Date().toISOString().slice(0, 10) });
  savePosts(posts);
  blogForm.reset();
  blogForm.hidden = true;
  renderBlog();
  showToast("✅ Post published!");
});

renderBlog();

/* ============================================================
   CONTACT FORM
   ============================================================ */
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("cName").value.trim();
  const email = document.getElementById("cEmail").value.trim();
  const msg = document.getElementById("cMessage").value.trim();

  // If a Formspree ID is configured, send the message straight to the inbox.
  if (CONFIG.formspreeId) {
    formNote.textContent = "Sending... ✉️";
    try {
      const res = await fetch(`https://formspree.io/f/${CONFIG.formspreeId}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(contactForm),
      });
      if (res.ok) {
        formNote.textContent = `Thank you, ${name}! Your message has been sent. 💖`;
        contactForm.reset();
        showToast("✅ Message sent successfully!");
      } else {
        formNote.textContent = "Oops — something went wrong. Please email me directly.";
      }
    } catch {
      formNote.textContent = "Network error. Please email me directly.";
    }
    return;
  }

  // Fallback (no Formspree set): open the visitor's email app pre-filled.
  formNote.textContent = `Thanks, ${name}! Opening your email app...`;
  const subject = encodeURIComponent(`Portfolio contact from ${name}`);
  const bodyText = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
  setTimeout(() => {
    window.location.href = `mailto:naus2005official@gmail.com?subject=${subject}&body=${bodyText}`;
    contactForm.reset();
  }, 600);
});

/* ============================================================
   HELPERS
   ============================================================ */
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 3200);
}
function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return d; }
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("year").textContent = new Date().getFullYear();
