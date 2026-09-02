import { paintFromSpec, type Paint } from "./ranges.ts";

export const POSITIONS = ["UTG", "HJ", "CO", "BTN", "SB", "BB"] as const;
export const STACKS = [8, 10, 15, 20, 25, 40, 100] as const;
export type Position = (typeof POSITIONS)[number];
export type Kind = "rfi" | "vsopen" | "jam";

export type Spot = {
  id: string;
  title: string;
  game: "cash" | "mtt";
  bb: number;
  hero: Position;
  kind: Kind;
  vs?: string;
  blurb: string;
  raise: string;
  call?: string;
};

/**
 * Pedagogiske 6-max-charts (ikke GTO Wizard / RYE-fasit).
 * Du kan male over og lagre dine egne.
 */
export const SPOTS: Spot[] = [
  {
    id: "c100-utg-rfi",
    title: "UTG åpne",
    game: "cash",
    bb: 100,
    hero: "UTG",
    kind: "rfi",
    blurb:
      "Fem spillere bak deg. Hold det stramt: par som kan sette, sterke broadway, noen suited connectors. ~12–15 %.",
    raise: "77+, A9s+, AJo+, KQo, KTs+, QJs, JTs, T9s",
  },
  {
    id: "c100-hj-rfi",
    title: "HJ åpne",
    game: "cash",
    bb: 100,
    hero: "HJ",
    kind: "rfi",
    blurb: "Én mindre bak deg enn UTG. Legg til flere suited aces og medium par. ~18–20 %.",
    raise: "55+, A2s+, ATo+, KJo+, QJo, K9s+, QTs+, JTs, T9s, 98s, 87s",
  },
  {
    id: "c100-co-rfi",
    title: "CO åpne",
    game: "cash",
    bb: 100,
    hero: "CO",
    kind: "rfi",
    blurb: "Cutoff stjeler mot BTN/blinds. Bredere: small pairs, suited gappers, flere offsuit. ~27 %.",
    raise: "22+, A2s+, A9o+, KTo+, QTo, JTo, K9s+, Q9s+, J9s+, T8s+, 98s, 97s, 87s, 76s, 65s",
  },
  {
    id: "c100-btn-rfi",
    title: "BTN åpne",
    game: "cash",
    bb: 100,
    hero: "BTN",
    kind: "rfi",
    blurb: "Sist postflop. Åpne det meste som kan treffe flop og spilles i posisjon. ~40 %.",
    raise:
      "22+, A2s+, A5o+, K4s+, K9o+, Q6s+, Q9o+, J7s+, J9o+, T7s+, T9o, 97s+, 87s, 86s, 76s, 75s, 65s, 54s",
  },
  {
    id: "c100-sb-rfi",
    title: "SB åpne",
    game: "cash",
    bb: 100,
    hero: "SB",
    kind: "rfi",
    blurb:
      "Bare BB bak, men du er først postflop. Åpne omtrent CO-bredt, ikke BTN-bredt. Raise/fold mer enn limp.",
    raise: "22+, A2s+, A8o+, K9s+, KTo+, Q9s+, QTo, J9s+, JTo, T8s+, 98s, 87s, 76s, 65s",
  },
  {
    id: "c100-bb-vs-btn",
    title: "BB vs BTN-åpning",
    game: "cash",
    bb: 100,
    hero: "BB",
    kind: "vsopen",
    vs: "BTN open",
    blurb:
      "Du får ~3:1 på floppen. 3-bet (rødt) er verdi + noen suited aces som bløff. Call (gult) er resten som kan realisere equity. Ikke forsvare 100 %.",
    raise: "TT+, AQs+, AKo, A5s, A4s, KJs+, QJs",
    call:
      "22+, A2s+, A9o+, A5o, K7s+, KTo+, Q8s+, QTo, J8s+, JTo, T8s+, T9o, 97s+, 87s, 86s, 76s, 75s, 65s, 54s",
  },
  {
    id: "c100-btn-vs-utg",
    title: "BTN vs UTG-åpning",
    game: "cash",
    bb: 100,
    hero: "BTN",
    kind: "vsopen",
    vs: "UTG open",
    blurb:
      "UTG er sterkt. 3-bet stramt for verdi, calle noen suited som spiller godt i posisjon. Fold de fleste KJo/QJo.",
    raise: "JJ+, AQs+, AKo",
    call: "99, TT, AJs, KQs, QJs, JTs, T9s, 98s, 87s",
  },
  {
    id: "m40-btn-rfi",
    title: "BTN åpne 40 bb",
    game: "mtt",
    bb: 40,
    hero: "BTN",
    kind: "rfi",
    blurb: "Middels stack. Fremdeles raise/fold, men 3-bet pots blir raskt all-in. Litt strammere enn 100 bb.",
    raise: "22+, A2s+, A8o+, K7s+, KTo+, Q8s+, QTo, J8s+, JTo, T8s+, 98s, 87s, 76s, 65s",
  },
  {
    id: "m25-co-rfi",
    title: "CO åpne 25 bb",
    game: "mtt",
    bb: 25,
    hero: "CO",
    kind: "rfi",
    blurb: "25 bb er overgang: mange åpninger er min-raise med plan om å jamme vs 3-bet med den øvre delen.",
    raise: "22+, A2s+, A9o+, K9s+, KTo+, Q9s+, QTo, J9s+, T9s, 98s, 87s",
  },
  {
    id: "m20-btn-jam",
    title: "BTN jam 20 bb",
    game: "mtt",
    bb: 20,
    hero: "BTN",
    kind: "jam",
    blurb: "Jam-or-fold-sone. 20 bb BTN dytter par, ace-rag suited og noen broadway. Ikke 65s lenger.",
    raise: "55+, A2s+, A9o+, A5s, A4s, KJs+, KQo, QJs, JTs",
  },
  {
    id: "m15-btn-jam",
    title: "BTN jam 15 bb",
    game: "mtt",
    bb: 15,
    hero: "BTN",
    kind: "jam",
    blurb: "Klassisk short-stack. Bredere enn 20 bb: flere suited connectors og ace-offsuit.",
    raise: "33+, A2s+, A7o+, K9s+, KTo+, QTs+, QJo, JTs, T9s, 98s",
  },
  {
    id: "m10-btn-jam",
    title: "BTN jam 10 bb",
    game: "mtt",
    bb: 10,
    hero: "BTN",
    kind: "jam",
    blurb: "Nash-aktig BTN-shove i 6-max. Ganske bredt — blinds må ha det pent for å calle.",
    raise: "22+, A2s+, A5o+, K8s+, KTo+, Q9s+, QTo, J9s+, JTo, T8s+, 98s, 87s, 76s",
  },
  {
    id: "m10-co-jam",
    title: "CO jam 10 bb",
    game: "mtt",
    bb: 10,
    hero: "CO",
    kind: "jam",
    blurb: "ÉN spiller mer bak (BTN). Strammere enn BTN-jam på samme stack.",
    raise: "22+, A2s+, A8o+, K9s+, KJo+, QTs+, JTs, T9s",
  },
  {
    id: "m10-sb-jam",
    title: "SB jam 10 bb",
    game: "mtt",
    bb: 10,
    hero: "SB",
    kind: "jam",
    blurb: "Heads-up mot BB. Dette er det bredeste jammet — nær HU-Nash. BB kaller strammere enn du tror.",
    raise: "22+, A2s+, A2o+, K4s+, K8o+, Q6s+, Q9o+, J7s+, J9o+, T7s+, T9o, 97s+, 87s, 86s, 76s, 65s",
  },
  {
    id: "m10-utg-jam",
    title: "UTG jam 10 bb",
    game: "mtt",
    bb: 10,
    hero: "UTG",
    kind: "jam",
    blurb: "Fem bak deg, 10 bb. Tight jam: par, sterke aces, noen KQ. Ikke jaga 87s her.",
    raise: "55+, A2s+, ATo+, KQs, KQo, QJs",
  },
  {
    id: "m8-btn-jam",
    title: "BTN jam 8 bb",
    game: "mtt",
    bb: 8,
    hero: "BTN",
    kind: "jam",
    blurb: "Under 10 bb er nesten alt som har to live kort et jam fra knappen. Feilen er å folde for mye.",
    raise: "22+, A2s+, A2o+, K6s+, K9o+, Q8s+, QTo+, J8s+, JTo, T8s+, 98s, 97s, 87s, 76s, 65s",
  },
  {
    id: "m10-bb-vs-btnjam",
    title: "BB vs BTN jam 10 bb",
    game: "mtt",
    bb: 10,
    hero: "BB",
    kind: "vsopen",
    vs: "BTN jam 10 bb",
    blurb:
      "Han dytter bredt, du kaller strammere enn åpningen hans. Dominans: A5o er stygt mot A2s+. Par 22–66 er ofte flip.",
    raise: "",
    call: "33+, A8s+, ATo+, KJs+, KQo, QJs",
  },
  {
    id: "m15-sb-jam",
    title: "SB jam 15 bb",
    game: "mtt",
    bb: 15,
    hero: "SB",
    kind: "jam",
    blurb: "SB 15 bb mot BB: bredere enn CO, strammere enn 10 bb. Mange Axs og Kxs.",
    raise: "22+, A2s+, A5o+, K8s+, KTo+, Q9s+, QJo, J9s+, T9s, 98s",
  },
];

export function spotPaint(spot: Spot): Paint {
  return paintFromSpec(spot.raise, spot.call ?? "", spot.kind === "jam");
}

export function filterSpots(opts: {
  game?: Spot["game"] | "alle";
  bb?: number | "alle";
  hero?: Position | "alle";
  kind?: Kind | "alle";
  list?: Spot[];
}) {
  const list = opts.list ?? SPOTS;
  return list.filter((s) => {
    if (opts.game && opts.game !== "alle" && s.game !== opts.game) return false;
    if (opts.bb && opts.bb !== "alle" && s.bb !== opts.bb) return false;
    if (opts.hero && opts.hero !== "alle" && s.hero !== opts.hero) return false;
    if (opts.kind && opts.kind !== "alle" && s.kind !== opts.kind) return false;
    return true;
  });
}

export const KIND_LABEL: Record<Kind, string> = {
  rfi: "Åpne (RFI)",
  vsopen: "Mot åpning",
  jam: "Jam / fold",
};
