export type Street = "flop" | "turn" | "river";

export function outsToEquity(outs: number, street: Street): number | null {
  const o = Math.max(0, outs);
  if (street === "flop") {
    const p = 1 - ((47 - o) / 47) * ((46 - o) / 46);
    return p * 100;
  }
  if (street === "turn") return (o / 46) * 100;
  return null;
}

export function calcPotOdds(input: {
  pot: number;
  bet: number;
  extraCallers: number;
  implied: number;
  outs: number;
  street: Street;
  equityOverride: number | null;
}) {
  const call = input.bet;
  const potAfterBet = input.pot + input.bet + Math.max(0, input.extraCallers) * input.bet;
  const finalPot = potAfterBet + call;
  const req = finalPot > 0 ? call / (finalPot + input.implied) : 0;
  const reqRaw = finalPot > 0 ? call / finalPot : 0;
  const ratio = call > 0 ? potAfterBet / call : Infinity;

  let equity: number | null;
  let eqSource: string;
  if (input.equityOverride != null) {
    equity = input.equityOverride;
    eqSource = "manuell equity";
  } else if (input.street === "river") {
    equity = null;
    eqSource = "river — oppgi equity selv";
  } else {
    equity = outsToEquity(input.outs, input.street);
    eqSource =
      input.street === "flop"
        ? `outs × flop (${input.outs} outs)`
        : `outs × turn (${input.outs} outs)`;
  }

  const ev =
    equity != null
      ? (equity / 100) * (potAfterBet + input.implied) - (1 - equity / 100) * call
      : null;
  const good = equity != null && equity / 100 >= req;

  return { call, potAfterBet, finalPot, req, reqRaw, ratio, equity, eqSource, ev, good };
}
