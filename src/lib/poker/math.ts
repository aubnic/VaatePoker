/** Stack-to-pot ratio. SPR < 4 → commit-heavy; 6–13 → playable; >13 → speculative. */
export function spr(effectiveStack: number, pot: number) {
  const value = pot > 0 ? effectiveStack / pot : Infinity;
  let zone: "commit" | "mellom" | "dyp";
  let hint: string;
  if (value < 4) {
    zone = "commit";
    hint = "Lav SPR. Sett- og trekkhender vil ofte stackes. Overpar og topp-par er sterke.";
  } else if (value <= 13) {
    zone = "mellom";
    hint = "Middels SPR. Rom for å spille gater, men én feilbet er kostbar.";
  } else {
    zone = "dyp";
    hint = "Høy SPR. Implied odds og spekulative hender (suited connectors) går opp i verdi.";
  }
  return { value, zone, hint };
}

/** Minimum defense frequency vs a bet. MDF = pot / (pot + bet). */
export function mdf(pot: number, bet: number) {
  const denom = pot + bet;
  const freq = denom > 0 ? pot / denom : 0;
  const fold = 1 - freq;
  return { freq, fold, potOdds: denom > 0 ? bet / (pot + 2 * bet) : 0 };
}

/**
 * Bluff EV: foldEquity * pot - (1-foldEquity) * bet
 * For semi-bluff, add equity when called.
 */
export function bluffEv(input: {
  pot: number;
  bet: number;
  foldPct: number;
  equityWhenCalled: number;
}) {
  const f = input.foldPct / 100;
  const e = input.equityWhenCalled / 100;
  const winFold = f * input.pot;
  const whenCalled = (1 - f) * (e * (input.pot + input.bet) - (1 - e) * input.bet);
  const ev = winFold + whenCalled;
  const feNeeded =
    input.pot + input.bet > 0
      ? (input.bet - e * (input.pot + 2 * input.bet)) / (input.pot + input.bet - e * (input.pot + 2 * input.bet) + 1e-12)
      : 1;
  return { ev, feNeeded: Math.max(0, Math.min(1, feNeeded)) };
}

/** Bankroll: recommended buy-ins and rough risk-of-ruin. */
export function bankrollPlan(input: {
  buyin: number;
  bankroll: number;
  winrateBbPer100: number;
  stdevBbPer100: number;
  game: "cash" | "mtt";
}) {
  const bi = input.buyin > 0 ? input.bankroll / input.buyin : 0;
  const target = input.game === "cash" ? 30 : 80;
  const wr = input.winrateBbPer100;
  const sd = Math.max(input.stdevBbPer100, 1);
  // Approximate RoR for a gambler with edge: exp(-2 μ B / σ²) in bb-units
  const bankrollBb = bi * 100;
  const ror =
    wr <= 0 ? 1 : Math.exp((-2 * wr * bankrollBb) / (sd * sd * 100));
  return {
    buyins: bi,
    target,
    ok: bi >= target * 0.8,
    ror: Math.min(1, ror),
    downswing2s: 2 * sd * Math.sqrt(1000 / 100), // ~1000 hands / 10 tournaments-ish in bb/100 units
  };
}
