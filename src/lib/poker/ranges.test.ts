import assert from "node:assert/strict";
import { test } from "node:test";
import { comboCount, expandSpec, expandToken, paintFromSpec, rangeStats } from "./ranges.ts";
import { SPOTS, spotPaint } from "./spots.ts";

test("77+ is pairs 77 through AA", () => {
  const x = expandToken("77+");
  assert.deepEqual(x, ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77"]);
});

test("A5s+ is AKs through A5s", () => {
  const x = expandToken("A5s+");
  assert.ok(x.includes("AKs") && x.includes("A5s") && !x.includes("A4s"));
});

test("KTo+ is KQo KJo KTo", () => {
  assert.deepEqual(expandToken("KTo+"), ["KQo", "KJo", "KTo"]);
});

test("UTG 100bb RFI is in a tight window", () => {
  const p = spotPaint(SPOTS[0]!);
  const s = rangeStats(new Set(Object.keys(p)));
  assert.ok(s.pct > 10 && s.pct < 20, String(s.pct));
});

test("3bet overwrites call on the same hand", () => {
  const p = paintFromSpec("TT+", "22+");
  assert.equal(p.AA, "raise");
  assert.equal(p["77"], "call");
});

test("every spot paints at least one combo", () => {
  for (const s of SPOTS) {
    const p = spotPaint(s);
    const n = Object.keys(p).length;
    assert.ok(n > 0, s.id);
  }
});

test("combo still 1326 math", () => {
  assert.equal(comboCount("AA") + comboCount("AKs") + comboCount("AKo"), 22);
  assert.equal(expandSpec("AA, AKs").length, 2);
});
