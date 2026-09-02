import { RANK_ORDER } from "./hand.ts";

export type Action = "raise" | "call" | "allin";
export type Paint = Partial<Record<string, Action>>;

export function comboCount(key: string): number {
  if (key.length === 2) return 6;
  if (key.endsWith("s")) return 4;
  return 12;
}

export function rangeStats(selected: Set<string>) {
  let combos = 0;
  for (const k of selected) combos += comboCount(k);
  return { combos, pct: (combos / 1326) * 100, hands: selected.size };
}

export function paintStats(paint: Paint) {
  const by: Record<Action, Set<string>> = {
    raise: new Set(),
    call: new Set(),
    allin: new Set(),
  };
  for (const [k, a] of Object.entries(paint)) {
    if (a) by[a].add(k);
  }
  const inRange = new Set([...by.raise, ...by.call, ...by.allin]);
  return { ...rangeStats(inRange), by, inRange };
}

/** Expand "77+", "A5s+", "KTo+" or a bare hand. */
export function expandToken(token: string): string[] {
  const t = token.trim();
  if (!t) return [];
  if (!t.endsWith("+")) return [t];
  const base = t.slice(0, -1);
  if (base.length === 2 && base[0] === base[1]) {
    const idx = RANK_ORDER.indexOf(base[0]!);
    if (idx < 0) return [];
    return [...RANK_ORDER]
      .slice(0, idx + 1)
      .map((r) => r + r);
  }
  const suited = base.endsWith("s");
  const off = base.endsWith("o");
  if (!suited && !off) return [t];
  const r1 = base[0]!;
  const r2 = base[1]!;
  const i1 = RANK_ORDER.indexOf(r1);
  const i2 = RANK_ORDER.indexOf(r2);
  if (i1 < 0 || i2 < 0 || i2 <= i1) return [];
  const out: string[] = [];
  const suffix = suited ? "s" : "o";
  for (let j = i1 + 1; j <= i2; j++) {
    out.push(r1 + RANK_ORDER[j]! + suffix);
  }
  return out;
}

export function expandSpec(spec: string): string[] {
  const keys = new Set<string>();
  for (const raw of spec.split(/[,\s]+/).filter(Boolean)) {
    for (const k of expandToken(raw)) keys.add(k);
  }
  return [...keys];
}

export function paintFromSpec(raise: string, call = "", asAllin = false): Paint {
  const p: Paint = {};
  for (const k of expandSpec(call)) p[k] = "call";
  for (const k of expandSpec(raise)) p[k] = asAllin ? "allin" : "raise";
  return p;
}

export function comparePaint(user: Paint, sol: Paint) {
  const u = paintStats(user).inRange;
  const s = paintStats(sol).inRange;
  let hitC = 0;
  let missC = 0;
  let extraC = 0;
  for (const k of s) {
    const c = comboCount(k);
    if (u.has(k)) hitC += c;
    else missC += c;
  }
  for (const k of u) {
    if (!s.has(k)) extraC += comboCount(k);
  }
  const solC = hitC + missC;
  return {
    hitC,
    missC,
    extraC,
    solC,
    coverage: solC ? (hitC / solC) * 100 : 100,
  };
}

export function gridCell(row: number, col: number): string {
  const r1 = RANK_ORDER[row]!;
  const r2 = RANK_ORDER[col]!;
  if (row === col) return r1 + r2;
  if (row < col) return r1 + r2 + "s";
  return r2 + r1 + "o";
}

export function keysOf(paint: Paint): string[] {
  return Object.keys(paint).filter((k) => paint[k]);
}
