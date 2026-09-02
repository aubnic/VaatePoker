import {
  combos,
  eval5,
  fullDeck,
  parseCards,
  rngFrom,
  shuffleInPlace,
  SUIT_SYMBOL,
} from "./hand.ts";

export { parseCards, SUIT_SYMBOL };

function bestOmaha(hole: string[], board: string[]): number {
  const h2 = combos(hole, 2);
  const b3 = combos(board, 3);
  let best = -1;
  for (const h of h2)
    for (const b of b3) {
      const v = eval5(h.concat(b));
      if (v > best) best = v;
    }
  return best;
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
