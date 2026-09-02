import assert from "node:assert/strict";
import { test } from "node:test";
import { bluffEv, mdf, spr } from "./math.ts";
import { comboCount, rangeStats } from "./ranges.ts";

test("SPR 200/40 = 5", () => {
  const r = spr(200, 40);
  assert.equal(r.value, 5);
  assert.equal(r.zone, "mellom");
});

test("MDF half-pot bet is 2/3", () => {
  const r = mdf(100, 50);
  assert.ok(Math.abs(r.freq - 100 / 150) < 1e-9);
});

test("pure bluff 50 into 100 needs 33% FE", () => {
  const r = bluffEv({ pot: 100, bet: 50, foldPct: 0, equityWhenCalled: 0 });
  assert.ok(r.ev < 0);
  const need = bluffEv({ pot: 100, bet: 50, foldPct: 33.333, equityWhenCalled: 0 });
  assert.ok(Math.abs(need.ev) < 0.5);
});

test("combo counts", () => {
  assert.equal(comboCount("AA"), 6);
  assert.equal(comboCount("AKs"), 4);
  assert.equal(comboCount("AKo"), 12);
  const s = rangeStats(new Set(["AA", "KK", "AKs"]));
  assert.equal(s.combos, 16);
});
