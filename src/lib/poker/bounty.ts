export function calcBounty(input: {
  pot: number;
  call: number;
  bounty: number;
  instantPct: number;
  chipsInPlay: number;
  remainingPool: number;
  equity: number;
  villainStack: number;
}) {
  const bountyPower = input.chipsInPlay / Math.max(input.remainingPool, 1e-9);
  const instantCash = input.bounty * (input.instantPct / 100);
  const bountyChips = instantCash * bountyPower;
  const covering = input.villainStack > 0 && input.villainStack <= input.call + 1e-9;
  const bountyTerm = covering || input.villainStack === 0 ? bountyChips : bountyChips * 0.5;
  const potAfter = input.pot + input.call;
  const reqNoB = potAfter > 0 ? input.call / potAfter : 0;
  const reqWith = potAfter + bountyTerm > 0 ? input.call / (potAfter + bountyTerm) : 0;
  const evNo = (input.equity / 100) * input.pot - (1 - input.equity / 100) * input.call;
  const evYes =
    (input.equity / 100) * (input.pot + bountyTerm) - (1 - input.equity / 100) * input.call;
  return {
    bountyPower,
    instantCash,
    bountyChips,
    covering,
    bountyTerm,
    potAfter,
    reqNoB,
    reqWith,
    evNo,
    evYes,
    plusEv: input.equity >= reqWith * 100,
  };
}
