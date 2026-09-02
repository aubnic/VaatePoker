import { bestHoldem7, fullDeck, rngFrom, shuffleInPlace } from "./hand.ts";

export function simulateHoldem(input: {
  hero: string[];
  villain: string[];
  board: string[];
  iters: number;
}) {
  if (input.hero.length !== 2 || input.villain.length !== 2) {
    throw new Error("Hold'em krever nøyaktig 2 hole-kort per spiller.");
  }
  if (input.board.length > 5) throw new Error("Board kan ha maks 5 kort.");
  const used = new Set([...input.hero, ...input.villain, ...input.board]);
  if (used.size !== 4 + input.board.length) throw new Error("Duplikatkort oppdaget.");

  const need = 5 - input.board.length;
  const remaining = fullDeck().filter((c) => !used.has(c));
  const rng = rngFrom(Date.now() % 1e9);
  let wins = 0;
  let losses = 0;
  let ties = 0;
  const t0 = performance.now();
  for (let i = 0; i < input.iters; i++) {
    shuffleInPlace(remaining, rng);
    const board = input.board.concat(remaining.slice(0, need));
    const hv = bestHoldem7(input.hero, board);
    const vv = bestHoldem7(input.villain, board);
    if (hv > vv) wins++;
    else if (hv < vv) losses++;
    else ties++;
  }
  const ms = performance.now() - t0;
  return {
    wins,
    losses,
    ties,
    eq: ((wins + ties / 2) / input.iters) * 100,
    vEq: ((losses + ties / 2) / input.iters) * 100,
    tiePct: (ties / input.iters) * 100,
    ms,
    iters: input.iters,
  };
}
