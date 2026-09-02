import { RANK_ORDER } from "./hand.ts";

export type HandType = "pair" | "suited" | "offsuit";

export function handKey(r1: string, r2: string, suited: boolean): string {
  if (r1 === r2) return r1 + r2;
  return suited ? r1 + r2 + "s" : r1 + r2 + "o";
}

export function allHandKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < RANK_ORDER.length; i++) {
    for (let j = 0; j < RANK_ORDER.length; j++) {
      const a = RANK_ORDER[i]!;
      const b = RANK_ORDER[j]!;
      if (i === j) keys.push(a + b);
      else if (i < j) keys.push(a + b + "s");
      else keys.push(b + a + "o");
    }
  }
  return keys;
}

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

function expand(spec: string[]): Set<string> {
  return new Set(spec);
}

/** Tight-aggressive 6-max opens (pedagogisk, ikke solver). */
export const PRESETS: Record<string, { label: string; level: string; hands: Set<string> }> = {
  utg: {
    label: "6-max UTG åpne",
    level: "Nybegynner",
    hands: expand([
      "AA","KK","QQ","JJ","TT","99","88",
      "AKs","AQs","AJs","ATs","A9s",
      "KQs","KJs","KTs","QJs","QTs","JTs",
      "AKo","AQo","AJo","KQo",
    ]),
  },
  btn: {
    label: "6-max BTN åpne",
    level: "Nybegynner",
    hands: expand([
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s","K8s","QJs","QTs","Q9s","JTs","J9s","T9s","T8s",
      "98s","97s","87s","86s","76s","75s","65s",
      "AKo","AQo","AJo","ATo","A9o","KQo","KJo","KTo","QJo","QTo","JTo",
    ]),
  },
  bbdef: {
    label: "BB defend vs BTN (ca.)",
    level: "Viderekommen",
    hands: expand([
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s","K8s","K7s","K6s","QJs","QTs","Q9s","Q8s",
      "JTs","J9s","J8s","T9s","T8s","98s","97s","87s","76s","65s","54s",
      "AKo","AQo","AJo","ATo","A9o","A8o","A7o","A5o",
      "KQo","KJo","KTo","QJo","QTo","JTo","T9o",
    ]),
  },
  jam10: {
    label: "BTN shove ~10 bb",
    level: "Turnering",
    hands: expand([
      "AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
      "KQs","KJs","KTs","K9s","K8s","QJs","QTs","Q9s","JTs","J9s","T9s","98s","87s","76s",
      "AKo","AQo","AJo","ATo","A9o","A8o","KQo","KJo","KTo","QJo","QTo","JTo",
    ]),
  },
  jam15: {
    label: "BTN shove ~15 bb",
    level: "Turnering",
    hands: expand([
      "AA","KK","QQ","JJ","TT","99","88","77","66",
      "AKs","AQs","AJs","ATs","A9s","A8s","A7s","A5s","A4s",
      "KQs","KJs","KTs","QJs","JTs",
      "AKo","AQo","AJo","KQo",
    ]),
  },
};

export function gridCell(row: number, col: number): string {
  const r1 = RANK_ORDER[row]!;
  const r2 = RANK_ORDER[col]!;
  if (row === col) return r1 + r2;
  if (row < col) return r1 + r2 + "s";
  return r2 + r1 + "o";
}
