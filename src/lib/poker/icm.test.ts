import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateICM } from "./icm.ts";

test("ICM 5000/3000/2000 vs 50/30/20", () => {
  const r = calculateICM([5000, 3000, 2000], [50, 30, 20]);
  assert.equal(r.reduce((a, b) => a + b, 0).toFixed(2), "100.00");
  assert.equal(r[0]!.toFixed(2), "38.39");
  assert.equal(r[1]!.toFixed(2), "32.75");
  assert.equal(r[2]!.toFixed(2), "28.86");
});
