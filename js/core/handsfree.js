/* ==========================================================================
   NEXUS — hands-free scrolling (webcam hand gestures, all main pages)
   Open hand raised → scroll up, lowered → scroll down, middle → hold still.
   Fist or no hand → stop. Uses MediaPipe Hand Landmarker, loaded only when
   the visitor turns the mode on; the camera picture never leaves the device.
   ========================================================================== */
import { icon } from "../ui/icons.js";
import { toast } from "../ui/toast.js";

const MP = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0";
const MODEL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const SESSION_KEY = "nx-handsfree";

/* ---------- pure gesture maths (unit-tested) ---------- */
export const DEAD_ZONE = 0.12;   // ± around the middle of the frame where nothing scrolls
export const MAX_SPEED = 1600;   // px per second at the very top / bottom of the frame

/** Palm height in the frame (0 = top, 1 = bottom) → scroll speed in px/s (negative = up). */
export function scrollSpeed(palmY) {
  const off = palmY - 0.5, reach = 0.5 - DEAD_ZONE;
  if (Math.abs(off) <= DEAD_ZONE) return 0;
  const t = Math.min(1, (Math.abs(off) - DEAD_ZONE) / reach);
  return Math.sign(off) * (120 + (MAX_SPEED - 120) * t * t);
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
/** All four fingertips further from the wrist than their middle joints. */
export const isOpenPalm = (h) => [[8, 6], [12, 10], [16, 14], [20, 18]].every(([tip, pip]) => dist(h[tip], h[0]) > dist(h[pip], h[0]) * 1.15);
/** Centre of the palm: wrist + the four knuckles. */
export const palmCentre = (h) => {
  const pts = [0, 5, 9, 13, 17].map((i) => h[i]);
  return { x: pts.reduce((s, p) => s + p.x, 0) / 5, y: pts.reduce((s, p) => s + p.y, 0) / 5 };
};

/* ---------- UI + camera ---------- */
let fab, panel, canvas, ctx, label, video;
let stream = null, landmarker = null, raf = 0, lastVideoTime = -1, velocity = 0, lastFrame = 0, hand = null, open = false;
let starting = false;

export function initHandsFree() {
  if (fab) return { toggle };
  fab = document.createElement("button");
  fab.type = "button";
  fab.className = "nx-btn nx-btn--icon nx-hf-fab";
  fab.setAttribute("aria-pressed", "false");
  fab.setAttribute("aria-label", "Hands-free scrolling (uses your camera)");
  fab.title = "Hands-free scrolling";
  fab.innerHTML = icon("hand", { size: 20 });
  fab.addEventListener("click", toggle);

  panel = document.createElement("section");
  panel.className = "nx-hf";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Hands-free scrolling");
  panel.innerHTML = `
    <div class="nx-hf-head">
      <strong>${icon("hand", { size: 16 })} Hands-free</strong>
      <button type="button" class="nx-btn nx-btn--icon nx-btn--sm nx-hf-close" aria-label="Turn off hands-free scrolling">${icon("close", { size: 16 })}</button>
    </div>
    <canvas width="240" height="180" aria-hidden="true"></canvas>
    <p class="nx-hf-label" aria-live="polite">Starting camera…</p>
    <p class="nx-hf-tip">✋ Raise your open hand to scroll up, lower it to scroll down. ✊ Fist to stop.</p>`;
  canvas = panel.querySelector("canvas");
  ctx = canvas.getContext("2d");
  label = panel.querySelector(".nx-hf-label");
  panel.querySelector(".nx-hf-close").addEventListener("click", stop);

  video = document.createElement("video");
  video.muted = true; video.playsInline = true;
  video.className = "nx-hf-video";
  video.setAttribute("aria-hidden", "true");

  document.body.append(panel, fab, video);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && stream) loop(); });

  // Carry the mode across pages in this visit — but only if the camera is already allowed (no surprise prompts).
  let wanted = false;
  try { wanted = sessionStorage.getItem(SESSION_KEY) === "1"; } catch {}
  if (wanted) {
    const query = navigator.permissions?.query?.({ name: "camera" });
    (query || Promise.reject()).then((p) => { if (p.state === "granted") start(); }).catch(() => {});
  }
  return { toggle };
}

export function toggle() { if (stream || starting) stop(); else start(); }

async function start() {
  if (starting || stream) return;
  if (!navigator.mediaDevices?.getUserMedia) { toast("Hands-free needs a camera and a secure (https) page."); return; }
  starting = true;
  setActive(true);
  panel.hidden = false;
  say("Waiting for camera permission…");
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
  } catch (e) {
    starting = false;
    stop(e.name === "NotAllowedError" ? "Camera permission was blocked — allow it in the address bar to scroll hands-free." : "No camera found for hands-free scrolling.");
    return;
  }
  if (!starting) { stream.getTracks().forEach((t) => t.stop()); stream = null; return; } // turned off while waiting
  video.srcObject = stream;
  video.play().catch(() => {});

  if (!landmarker) {
    say("Loading hand tracking (about 20 MB, first time only)…");
    try {
      const vision = await import(`${MP}/vision_bundle.mjs`);
      const files = await vision.FilesetResolver.forVisionTasks(`${MP}/wasm`);
      const opts = (delegate) => ({ baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: "VIDEO", numHands: 1 });
      try { landmarker = await vision.HandLandmarker.createFromOptions(files, opts("GPU")); }
      catch { landmarker = await vision.HandLandmarker.createFromOptions(files, opts("CPU")); }
    } catch {
      starting = false;
      stop("Couldn't load hand tracking — check your internet connection and try again.");
      return;
    }
  }
  if (!starting) return; // turned off while the model was loading
  starting = false;
  try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
  say("Show an open hand ✋");
  toast("Hands-free scrolling is on");
  lastFrame = performance.now();
  loop();
}

function stop(message) {
  starting = false;
  cancelAnimationFrame(raf);
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null; video.srcObject = null; hand = null; velocity = 0;
  setActive(false);
  panel.hidden = true;
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  toast(typeof message === "string" ? message : "Hands-free scrolling is off");
}

function setActive(on) {
  fab.setAttribute("aria-pressed", String(on));
  fab.classList.toggle("is-on", on);
}

let lastSaid = "";
function say(text) { if (text !== lastSaid) { lastSaid = text; label.textContent = text; } }

function loop() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame);
}

function frame(now) {
  if (!stream) return;
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  if (landmarker && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const h = landmarker.detectForVideo(video, now).landmarks?.[0];
    hand = h || null;
    open = !!h && isOpenPalm(h);
  }

  const target = hand && open ? scrollSpeed(palmCentre(hand).y) : 0;
  // ease in gently, but brake quickly when the hand closes or leaves the "scroll" bands
  velocity += (target - velocity) * Math.min(1, dt * (target ? 6 : 16));
  // "instant": the site uses smooth scrolling, which would animate (and keep cancelling) each tiny step
  if (Math.abs(velocity) > 4) window.scrollBy({ top: velocity * dt, behavior: "instant" });
  else velocity = 0;

  say(!hand ? "Show an open hand ✋" : !open ? "Paused ✊ — open your hand to scroll"
    : target < 0 ? "Scrolling up ↑" : target > 0 ? "Scrolling down ↓" : "Holding — move up or down");
  draw(target);
  raf = requestAnimationFrame(frame);
}

function draw(target) {
  const W = canvas.width, H = canvas.height;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  if (video.readyState >= 2) {
    // mirrored "cover" fit, like a selfie view
    const s = Math.max(W / video.videoWidth, H / video.videoHeight), dw = video.videoWidth * s, dh = video.videoHeight * s;
    ctx.translate((W + dw) / 2, (H - dh) / 2); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, dw, dh);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  // zones: up band, still band, down band
  const top = (0.5 - DEAD_ZONE) * H, bottom = (0.5 + DEAD_ZONE) * H;
  ctx.fillStyle = target < 0 ? "rgba(34,211,238,.35)" : "rgba(34,211,238,.12)";
  ctx.fillRect(0, 0, W, top);
  ctx.fillStyle = target > 0 ? "rgba(139,123,255,.38)" : "rgba(139,123,255,.12)";
  ctx.fillRect(0, bottom, W, H - bottom);
  ctx.fillStyle = "#fff"; ctx.font = "600 18px system-ui, sans-serif"; ctx.textAlign = "center";
  ctx.fillText("↑", W / 2, top / 2 + 6);
  ctx.fillText("↓", W / 2, bottom + (H - bottom) / 2 + 6);
  if (hand) {
    const c = palmCentre(hand);
    ctx.beginPath(); ctx.arc((1 - c.x) * W, c.y * H, 10, 0, 6.28);
    ctx.fillStyle = open ? "#22d3ee" : "#f87171"; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = "#fff"; ctx.stroke();
  }
  ctx.restore();
}
