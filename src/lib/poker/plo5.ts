const RANKS = "23456789TJQKA";
const SUITS = "cdhs";
const RANK_VAL: Record<string, number> = Object.fromEntries(
  [...RANKS].map((r, i) => [r, i]),
);

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

function eval5(cards: string[]): number {
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

function combos<T>(arr: T[], k: number): T[][] {
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

function bestOmaha(hole: string[], board: string[]): number {
  const h2 = combos(hole, 2);
  const b3 = combos(board, 3);
  let best = -1;
  for (const h of h2) for (const b of b3) {
    const v = eval5(h.concat(b));
    if (v > best) best = v;
  }
  return best;
}

function fullDeck() {
  const d: string[] = [];
  for (const r of RANKS) for (const s of SUITS) d.push(r + s);
  return d;
}

function shuffleInPlace(a: string[], rng: () => number) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
}

function rngFrom(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulatePlo5(input: {
  hero: string[];
  villain: string[];
  board: string[];
  iters: number;
}) {
  const used = new Set([...input.hero, ...input.villain, ...input.board]);
  if (used.size !== 10 + input.board.length) {
    throw new Error("Duplikatkort oppdaget.");
  }
  if (input.hero.length !== 5 || input.villain.length !== 5) {
    throw new Error("PLO5 krever nøyaktig 5 hole-kort per spiller.");
  }
  if (input.board.length > 5) throw new Error("Board kan ha maks 5 kort.");

  const needBoard = 5 - input.board.length;
  const remaining = fullDeck().filter((c) => !used.has(c));
  const rng = rngFrom(Date.now() % 1e9);
  let wins = 0;
  let losses = 0;
  let ties = 0;
  const t0 = performance.now();
  for (let i = 0; i < input.iters; i++) {
    shuffleInPlace(remaining, rng);
    const board = input.board.concat(remaining.slice(0, needBoard));
    const hv = bestOmaha(input.hero, board);
    const vv = bestOmaha(input.villain, board);
    if (hv > vv) wins++;
    else if (hv < vv) losses++;
    else ties++;
  }
  const ms = performance.now() - t0;
  const eq = ((wins + ties / 2) / input.iters) * 100;
  const vEq = ((losses + ties / 2) / input.iters) * 100;
  const tiePct = (ties / input.iters) * 100;
  return { wins, losses, ties, eq, vEq, tiePct, ms, iters: input.iters };
}

export const SUIT_SYMBOL: Record<string, string> = {
  s: "♠",
  h: "♥",
  d: "♦",
  c: "♣",
};
