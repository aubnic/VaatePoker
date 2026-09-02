export const STREETS = [
  {
    name: "Preflop",
    body: "Du har fått to skjulte kort (i Hold'em). Blinds ligger allerede i potten. Her bestemmer du om hånden er sterk nok til å spille, gitt posisjonen din.",
  },
  {
    name: "Flop",
    body: "Tre felleskort. Du ser 5 av 7 kort. De fleste avgjørelsene skjer her: treffer du? Har du et draw? Skal du satse eller gi deg?",
  },
  {
    name: "Turn",
    body: "Fjerde felleskort. Ett kort igjen. Draws blir dyrere å jage, og SPR (stack mot pot) forteller hvor committed du er.",
  },
  {
    name: "River",
    body: "Siste kort. Ingen outs igjen. Enten har du hånden, eller så bløffer du. Equity er 100 % eller 0 % mot en gitt hånd.",
  },
] as const;

export const HANDS = [
  {
    name: "Høyt kort",
    e: "A♠ Q♥ 8♦ 5♣ 2♠",
    body: "Ingen par. Høyeste kort avgjør. Ace-high slår king-high. Dette er den svakeste vis-hånden.",
  },
  {
    name: "Ett par",
    e: "A♠ A♥ 8♦ 5♣ 2♠",
    body: "To kort av samme verdi. Høyere par slår lavere. Ved like par vinner kicker (neste kort).",
  },
  {
    name: "To par",
    e: "J♠ J♥ 4♦ 4♣ A♠",
    body: "To forskjellige par. Høyeste par avgjør først, deretter det andre, så kicker.",
  },
  {
    name: "Tre like (trips / sett)",
    e: "Q♠ Q♥ Q♦ 9♣ 2♠",
    body: "Tre av samme verdi. Sett = du har et par på hånden og treffer det tredje på board. Trips = ett på hånden, to på board (lettere å se for motstanderen).",
  },
  {
    name: "Straight",
    e: "9♠ 8♥ 7♦ 6♣ 5♠",
    body: "Fem kort i verdi på rad, blandede farger. A kan være høy (TJQKA) eller lav (A2345, «hjulet»). 10-høy straight slår 9-høy.",
  },
  {
    name: "Flush",
    e: "A♥ J♥ 8♥ 5♥ 2♥",
    body: "Fem kort i samme farge, ikke i rekke. Høyeste kort i flushen avgjør. Ace-flush slår king-flush.",
  },
  {
    name: "Hus (full house)",
    e: "K♠ K♥ K♦ 4♣ 4♠",
    body: "Tre like + et par. Tripsene rangeres først: KKK44 slår QQQAA.",
  },
  {
    name: "Fire like",
    e: "9♠ 9♥ 9♦ 9♣ K♠",
    body: "Fire av samme verdi. Ekstremt sjeldent. Kicker brukes bare hvis begge har samme fours (felleskort).",
  },
  {
    name: "Straight flush / royal",
    e: "A♠ K♠ Q♠ J♠ T♠",
    body: "Straight i samme farge. Royal er A-høy spade/hjerter/ruter/kløver-straight flush — den beste hånden som finnes.",
  },
] as const;

export const POSITIONS = [
  {
    name: "UTG — under the gun",
    body: "Første til å handle preflop (til venstre for big blind). Alle bak deg kan raise. Derfor åpner du stramt, typisk de beste ~10–15 % av hendene: par 88+, AJs+, KQs, AK, AQ.",
  },
  {
    name: "HJ / CO — hijack og cutoff",
    body: "Nærmere knappen. Færre spillere bak deg, så du kan åpne flere hender. Cutoff er den klassiske «stjele-stolen» før knappen.",
  },
  {
    name: "BTN — button",
    body: "Dealeren. Du handler sist på flop, turn og river. Det er den mest profitable stolen: du ser hva alle andre gjør før du bestemmer. Åpne bredt (~35–45 %).",
  },
  {
    name: "SB — small blind",
    body: "Halv blind, og du handler først postflop. Dårligst posisjon etter floppen. Ikke forsvare for mange hender «fordi du allerede har penger inne».",
  },
  {
    name: "BB — big blind",
    body: "Full blind. Når noen bare åpner (min-raise), får du ofte 3:1 eller bedre på å se floppen. Derfor forsvarer du bredere enn SB, men du er fortsatt først postflop.",
  },
] as const;
