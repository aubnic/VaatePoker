export type QuizQ = {
  q: string;
  options: string[];
  answer: number;
  why: string;
  level: "Nybegynner" | "Viderekommen";
};

export const QUIZ: QuizQ[] = [
  {
    q: "Du har 4♠ 5♠ på floppen 6♠ 7♦ 2♣. Hvor mange outs har du til straight?",
    options: ["4", "8", "9", "15"],
    answer: 1,
    why: "Open-ended straight (3 og 8) = 8 outs. 3♠/8♠ gir også flush, men de er allerede blant de 8.",
    level: "Nybegynner",
  },
  {
    q: "Flush draw på floppen. Omtrent hvor ofte treffer du til river (rule of 4)?",
    options: ["9 %", "18 %", "35 %", "50 %"],
    answer: 2,
    why: "9 outs × 4 ≈ 36 % (nøyaktig ca. 35 %). På turn: ×2 ≈ 18 %.",
    level: "Nybegynner",
  },
  {
    q: "Motstander c-better 50 inn i en pot på 100. Hva er MDF (hvor ofte du må forsvare)?",
    options: ["25 %", "33 %", "50 %", "67 %"],
    answer: 3,
    why: "MDF = pot / (pot + bet) = 100/150 ≈ 67 %. Du kan folde ~33 %.",
    level: "Viderekommen",
  },
  {
    q: "Hvilken posisjon handler sist etter floppen i 6-max?",
    options: ["UTG", "SB", "BB", "BTN"],
    answer: 3,
    why: "Button handler sist postflop og har mest informasjon. Det er den mest profitable stolen.",
    level: "Nybegynner",
  },
  {
    q: "Pot er 40, du har 200 bak. Hva er SPR?",
    options: ["0.2", "4", "5", "8"],
    answer: 2,
    why: "SPR = effektiv stack / pot = 200/40 = 5. Rundt 5 betyr at overpar ofte vil stackes.",
    level: "Viderekommen",
  },
  {
    q: "Hvilken hånd vinner: straight eller flush?",
    options: ["Straight", "Flush", "Like", "Avhenger av kicker"],
    answer: 1,
    why: "Flush slår straight. Rekkefølge: high card < par < to par < trips < straight < flush < hus < four < straight flush.",
    level: "Nybegynner",
  },
  {
    q: "Hvor mange kombinasjoner har AKs?",
    options: ["3", "4", "6", "12"],
    answer: 1,
    why: "Suited: 4 farger (♠♥♦♣). Offsuit AKo har 12. Par har 6.",
    level: "Viderekommen",
  },
  {
    q: "Du bløffer 50 inn i 100. Hvor ofte må motstanderen folde for at en ren bløff skal gå i null (0 % equity)?",
    options: ["25 %", "33 %", "50 %", "67 %"],
    answer: 1,
    why: "FE = bet / (pot + bet) = 50/150 ≈ 33 %. Folde han oftere, er bløffen +EV.",
    level: "Viderekommen",
  },
  {
    q: "I PLO5, hvor mange hole-kort bruker du i den ferdige hånden?",
    options: ["1", "2", "3", "5"],
    answer: 1,
    why: "Omaha: nøyaktig 2 hole-kort + 3 board. Fem kort på hånden gir 10 mulige to-korts kombinasjoner.",
    level: "Nybegynner",
  },
  {
    q: "Hvorfor har short stack høyere ICM-$ per chip enn chipleader?",
    options: [
      "Fordi blinds treffer ham hardere",
      "Risk premium: han kan ikke tape mer enn stacken, men cashen er skjev",
      "Han vinner flere bounties",
      "ICM ignorerer short stacks",
    ],
    answer: 1,
    why: "Premier er ikke lineære. Å doble en kort stack øker $ mer enn å doble en stor stack (risk premium).",
    level: "Viderekommen",
  },
];
