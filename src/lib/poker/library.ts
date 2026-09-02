import type { Paint } from "./ranges";
import type { Kind, Position, Spot } from "./spots";

const KEY = "vaate-range-library";

export type CustomSpot = Spot & { custom: true; paint: Paint };

export function loadCustoms(): CustomSpot[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomSpot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustoms(list: CustomSpot[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function newCustom(input: {
  title: string;
  game: Spot["game"];
  bb: number;
  hero: Position;
  kind: Kind;
  paint: Paint;
}): CustomSpot {
  return {
    id: `custom-${Date.now()}`,
    title: input.title.trim() || "Min range",
    game: input.game,
    bb: input.bb,
    hero: input.hero,
    kind: input.kind,
    blurb: "Lagret av deg. Overstyrer ikke presetene — den ligger i «Mine».",
    raise: "",
    custom: true,
    paint: { ...input.paint },
  };
}
