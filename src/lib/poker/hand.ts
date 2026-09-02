export const RANKS = "23456789TJQKA";
export const RANK_ORDER = "AKQJT98765432";
export const SUITS = "cdhs";
export const RANK_VAL: Record<string, number> = Object.fromEntries(
  [...RANKS].map((r, i) => [r, i]),
);

export const SUIT_SYMBOL: Record<string, string> = {
  s: "♠",
  h: "♥",
  d: "♦",
  c: "♣",
};

export function parseCards(str: string): { cards: string[]; error?: string } {
  const parts = str
    .trim()
    .toUpperCase()
    .replace(/10/g, "T")
    .split(/[\s,]+/)
    .filter(Boolean);
  const cards: string[] = [];
  for (const p of parts) {
    if (p.length < 2) return { cards: [], error: `Ugyldig kort: ${p}` };
    const rank = p[0] === "1" ? "T" : p[0];
    const suit = p[p.length - 1]!.toLowerCase();
    if (!RANKS.includes(rank!) || !SUITS.includes(suit)) {
      return { cards: [], error: `Ugyldig kort: ${p}` };
    }
    cards.push(rank + suit);
  }
  return { cards };
}

export function eval5(cards: string[]): number {
  const ranks = cards.map((c) => RANK_VAL[c[0]!] ?? 0).sort((a, b) => b - a);
  const suits = cards.map((c) => c[1]);
  const flush = suits.every((s) => s === suits[0]);
  const uniq = [...new Set(ranks)];
  let straight = false;
  let highStraight = 0;
  if (uniq.length === 5) {
    if (uniq[0]! - uniq[4]! === 4) {
      straight = true;
      highStraight = uniq[0]!;
    } else if (uniq[0] === 12 && uniq[1] === 3 && uniq[2] === 2 && uniq[3] === 1 && uniq[4] === 0) {
      straight = true;
      highStraight = 3;
    }
  }
  const counts: Record<number, number> = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const groups = Object.entries(counts)
    .map(([r, n]) => [Number(r), n] as const)
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  const kick = (...xs: number[]) => xs.reduce((acc, x) => acc * 13 + x, 0);

  if (straight && flush) return 8 * 1e8 + highStraight;
  if (groups[0]?.[1] === 4) return 7 * 1e8 + kick(groups[0][0], groups[1]?.[0] ?? 0);
  if (groups[0]?.[1] === 3 && groups[1]?.[1] === 2)
    return 6 * 1e8 + kick(groups[0][0], groups[1][0]);
  if (flush) return 5 * 1e8 + kick(...ranks);
  if (straight) return 4 * 1e8 + highStraight;
  if (groups[0]?.[1] === 3)
    return 3 * 1e8 + kick(groups[0][0], groups[1]?.[0] ?? 0, groups[2]?.[0] ?? 0);
  if (groups[0]?.[1] === 2 && groups[1]?.[1] === 2)
    return (
      2 * 1e8 +
      kick(
        Math.max(groups[0][0], groups[1][0]),
        Math.min(groups[0][0], groups[1][0]),
        groups[2]?.[0] ?? 0,
      )
    );
  if (groups[0]?.[1] === 2)
    return (
      1 * 1e8 +
      kick(groups[0][0], groups[1]?.[0] ?? 0, groups[2]?.[0] ?? 0, groups[3]?.[0] ?? 0)
    );
  return kick(...ranks);
}

export function combos<T>(arr: T[], k: number): T[][] {
  const out: T[][] = [];
  const rec = (start: number, cur: T[]) => {
    if (cur.length === k) {
      out.push(cur.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      cur.push(arr[i]!);
      rec(i + 1, cur);
      cur.pop();
    }
  };
  rec(0, []);
  return out;
}

export function fullDeck() {
  const d: string[] = [];
  for (const r of RANKS) for (const s of SUITS) d.push(r + s);
  return d;
}

export function shuffleInPlace(a: string[], rng: () => number) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
}

export function rngFrom(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function bestHoldem7(hole: string[], board: string[]): number {
  const seven = hole.concat(board);
  let best = -1;
  for (const c of combos(seven, 5)) {
    const v = eval5(c);
    if (v > best) best = v;
  }
  return best;
}
