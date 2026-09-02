/** Malmuth–Harville Independent Chip Model. */
export function calculateICM(stacks: number[], prizes: number[]): number[] {
  const n = stacks.length;
  const subMemo = new Map<string, number[]>();

  function icmSubtree(mask: number, pIdx: number): number[] {
    const out = new Array(n).fill(0);
    if (pIdx >= prizes.length) return out;
    let live = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) live++;
    if (live === 0) return out;
    const k = `${mask}:${pIdx}`;
    const cached = subMemo.get(k);
    if (cached) return cached.slice();
    const prize = prizes[pIdx] ?? 0;
    let rem = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) rem += stacks[i] ?? 0;
    if (rem <= 0) return out;
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue;
      const p = (stacks[i] ?? 0) / rem;
      out[i] += p * prize;
      if (live > 1 && pIdx + 1 < prizes.length) {
        const child = icmSubtree(mask ^ (1 << i), pIdx + 1);
        for (let j = 0; j < n; j++) out[j] += p * child[j];
      }
    }
    subMemo.set(k, out.slice());
    return out;
  }

  return icmSubtree((1 << n) - 1, 0);
}
