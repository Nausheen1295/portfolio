// Hands-free scrolling: the gesture → scroll maths (no camera needed).
import { test } from "node:test";
import assert from "node:assert/strict";
import { scrollSpeed, isOpenPalm, palmCentre, DEAD_ZONE, MAX_SPEED } from "../../js/core/handsfree.js";

test("hand in the middle band holds still", () => {
  for (const y of [0.5, 0.5 - DEAD_ZONE, 0.5 + DEAD_ZONE, 0.45, 0.55]) assert.equal(scrollSpeed(y), 0);
});

test("raised hand scrolls up, lowered hand scrolls down, faster further out", () => {
  assert.ok(scrollSpeed(0.3) < 0);
  assert.ok(scrollSpeed(0.7) > 0);
  assert.ok(Math.abs(scrollSpeed(0.1)) > Math.abs(scrollSpeed(0.3)));
  assert.ok(Math.abs(scrollSpeed(0.7) + scrollSpeed(0.3)) < 1e-9); // symmetric
});

test("speed is capped at the edges of the frame", () => {
  assert.equal(scrollSpeed(1), MAX_SPEED);
  assert.equal(scrollSpeed(1.4), MAX_SPEED); // hand partly out of frame
  assert.equal(scrollSpeed(0), -MAX_SPEED);
});

// 21 hand landmarks: fingertips 8/12/16/20 either extended (open) or curled back to the palm (fist)
function hand({ open }) {
  const pts = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
  pts[0] = { x: 0.5, y: 0.8 };                                   // wrist
  for (const k of [5, 9, 13, 17]) pts[k] = { x: 0.5, y: 0.6 };   // knuckles
  for (const p of [6, 10, 14, 18]) pts[p] = { x: 0.5, y: 0.5 };  // middle joints
  for (const t of [8, 12, 16, 20]) pts[t] = { x: 0.5, y: open ? 0.3 : 0.65 };
  return pts;
}

test("open palm vs fist", () => {
  assert.equal(isOpenPalm(hand({ open: true })), true);
  assert.equal(isOpenPalm(hand({ open: false })), false);
});

test("palm centre averages the wrist and knuckles", () => {
  const c = palmCentre(hand({ open: true }));
  assert.ok(Math.abs(c.y - 0.64) < 1e-9);
  assert.equal(c.x, 0.5);
});
