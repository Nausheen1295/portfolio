/* ============================================================
   PLAYGROUND — shared helpers (used by index.html AND every
   game/app page). Exposes a small global: window.PG
   ============================================================ */
(function () {
  const STORE = "pg-scores";
  const read = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } };
  const write = (obj) => { try { localStorage.setItem(STORE, JSON.stringify(obj)); } catch {} };
  const root = document.documentElement;

  const PG = {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,

    /* ---------- scores (saved on this device) ---------- */
    get(key) { return read()[key]; },
    set(key, value) { const s = read(); s[key] = value; write(s); },
    // Save `score` if it beats the stored best. Returns true on a new best.
    record(key, score, lowerIsBetter = false) {
      const prev = PG.get(key);
      const better = prev == null || (lowerIsBetter ? score < prev : score > prev);
      if (better) PG.set(key, score);
      return better;
    },
    bump(key, by = 1) { const v = (PG.get(key) || 0) + by; PG.set(key, v); return v; },

    /* ---------- theme helpers ---------- */
    css(name) { return getComputedStyle(root).getPropertyValue(name).trim(); },
    toggleTheme() {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("nx-theme", next); } catch {}
      document.dispatchEvent(new Event("themechange"));
    },

    /* ---------- toast ---------- */
    toast(msg) {
      let t = document.getElementById("toast");
      if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(PG._toastTimer);
      PG._toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
    },

    /* ---------- confetti / petal burst ---------- */
    confetti({ x = innerWidth / 2, y = innerHeight / 3, count = 150 } = {}) {
      if (PG.reducedMotion) return;
      const c = document.createElement("canvas");
      c.className = "fx-canvas";
      document.body.appendChild(c);
      const ctx = c.getContext("2d");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = innerWidth * dpr; c.height = innerHeight * dpr;
      ctx.scale(dpr, dpr);

      const colors = ["--pink-300", "--pink-400", "--pink-500", "--pink-600"].map(PG.css).concat("#ffd166", "#ffffff");
      const parts = Array.from({ length: count }, (_, i) => {
        const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 10;
        return {
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5,
          w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
          r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
          color: colors[i % colors.length], petal: Math.random() < 0.18,
        };
      });

      const start = performance.now();
      (function frame(now) {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        let alive = 0;
        for (const p of parts) {
          p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.25;
          p.x += p.vx; p.y += p.vy; p.r += p.vr;
          if (p.y < innerHeight + 40) alive++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          if (p.petal) { ctx.font = "18px serif"; ctx.fillText("🌸", -9, 6); }
          else { ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2))); }
          ctx.restore();
        }
        if (alive && now - start < 5000) requestAnimationFrame(frame);
        else c.remove();
      })(start);
    },

    /* ---------- swipe detection for touch games ---------- */
    onSwipe(el, cb) {
      let sx = 0, sy = 0;
      el.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      el.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        cb(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
      }, { passive: true });
    },
  };

  window.PG = PG;

  /* ---------- chrome for the individual game pages ---------- */
  if (document.body.classList.contains("pg-page")) {
    const toggle = document.getElementById("themeToggle");
    const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    const sync = () => {
      const dark = root.getAttribute("data-theme") !== "light";
      toggle.innerHTML = dark ? SUN : MOON;
      toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    };
    if (toggle) {
      toggle.addEventListener("click", () => { PG.toggleTheme(); sync(); });
      sync();
    }
  }
})();
