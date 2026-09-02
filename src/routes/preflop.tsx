import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHint } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Metric } from "@/components/metric";
import { Explain } from "@/components/explain";
import { RANK_ORDER } from "@/lib/poker/hand";
import {
  comparePaint,
  gridCell,
  paintStats,
  type Action,
  type Paint,
} from "@/lib/poker/ranges";
import { loadCustoms, newCustom, saveCustoms, type CustomSpot } from "@/lib/poker/library";
import {
  filterSpots,
  KIND_LABEL,
  POSITIONS,
  SPOTS,
  STACKS,
  spotPaint,
  type Kind,
  type Position,
  type Spot,
} from "@/lib/poker/spots";
import { cn, fmt } from "@/lib/utils";

export const Route = createFileRoute("/preflop")({ component: PreflopPage });

type Brush = Action | "fold";
type AnySpot = Spot | CustomSpot;

const BRUSH: { id: Brush; label: string }[] = [
  { id: "raise", label: "Raise / 3-bet" },
  { id: "call", label: "Call" },
  { id: "allin", label: "All-in" },
  { id: "fold", label: "Fold" },
];

function solutionOf(s: AnySpot): Paint {
  if ("custom" in s && s.custom) return s.paint;
  return spotPaint(s);
}

function cellTone(a: Action | undefined, pair: boolean) {
  if (a === "raise") return "bg-accent text-primary-fg";
  if (a === "call") return "bg-warn text-primary-fg";
  if (a === "allin") return "bg-ok text-primary-fg";
  return pair ? "bg-surface text-muted" : "bg-bg text-subtle";
}

function PreflopPage() {
  const [game, setGame] = useState<"alle" | "cash" | "mtt">("alle");
  const [bb, setBb] = useState<number | "alle">("alle");
  const [hero, setHero] = useState<Position | "alle">("alle");
  const [kind, setKind] = useState<Kind | "alle">("alle");
  const [customs, setCustoms] = useState<CustomSpot[]>([]);
  const [spotId, setSpotId] = useState(SPOTS[0]!.id);
  const [paint, setPaint] = useState<Paint>(() => spotPaint(SPOTS[0]!));
  const [brush, setBrush] = useState<Brush>("raise");
  const [train, setTrain] = useState(false);
  const [name, setName] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setCustoms(loadCustoms());
  }, []);

  const catalog = useMemo(() => {
    const extra = customs.map((c) => c as AnySpot);
    return filterSpots({
      game,
      bb,
      hero,
      kind,
      list: [...SPOTS, ...extra],
    });
  }, [game, bb, hero, kind, customs]);

  const spot = useMemo(
    () => catalog.find((s) => s.id === spotId) ?? catalog[0] ?? SPOTS[0]!,
    [catalog, spotId],
  );

  useEffect(() => {
    if (!catalog.some((s) => s.id === spotId) && catalog[0]) {
      const next = catalog[0];
      setSpotId(next.id);
      setPaint(train ? {} : solutionOf(next));
    }
  }, [catalog, spotId, train]);

  const stats = useMemo(() => paintStats(paint), [paint]);
  const sol = useMemo(() => solutionOf(spot), [spot]);
  const grade = useMemo(() => (train ? comparePaint(paint, sol) : null), [train, paint, sol]);

  function selectSpot(id: string) {
    const s = [...SPOTS, ...customs].find((x) => x.id === id) ?? SPOTS[0]!;
    setSpotId(s.id);
    setPaint(train ? {} : solutionOf(s));
    setSavedMsg(null);
  }

  function toggleTrain() {
    setTrain((t) => {
      const next = !t;
      setPaint(next ? {} : solutionOf(spot));
      return next;
    });
  }

  function applyBrush(key: string) {
    setPaint((prev) => {
      const next = { ...prev };
      if (brush === "fold") delete next[key];
      else next[key] = brush;
      return next;
    });
  }

  function saveMine() {
    const row = newCustom({
      title: name || `${spot.hero} ${spot.bb}bb ${KIND_LABEL[spot.kind]}`,
      game: spot.game,
      bb: spot.bb,
      hero: spot.hero,
      kind: spot.kind,
      paint,
    });
    const list = [row, ...customs];
    setCustoms(list);
    saveCustoms(list);
    setName("");
    setSavedMsg(`Lagret «${row.title}».`);
  }

  function removeCustom(id: string) {
    const list = customs.filter((c) => c.id !== id);
    setCustoms(list);
    saveCustoms(list);
    if (spotId === id) setSpotId(SPOTS[0]!.id);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">Range-lab</h1>
      <p className="mt-1 mb-4 max-w-2xl text-muted">
        Preflop etter posisjon og stack — som et treningsopplegg, ikke en solver. Presetene er pedagogiske
        6-max. Mal over med pensel, lagre dine egne, eller skjul fasit og tren.
      </p>
      <Explain title="GTO + egne charts">
        <p>
          En ekte GTO-solver (Pio, GTO Wizard) kjører millioner av noder. Det ligger ikke her, og vi kopierer
          ikke RaiseYourEdge. Det som ligger her er spots du faktisk møter: åpne, vs åpning, jam/fold — per
          sete og dybde.
        </p>
        <p>
          Fyll inn selv: velg pensel, klikk celler, lagre. Da blir <em>dine</em> solver-export eller coaching-notes
          libraryet. Ingen agent i bakgrunnen kan erstatte det — men formatet er laget for å fylles på.
        </p>
      </Explain>

      <div className="mb-4 flex flex-wrap gap-2">
        <Filter
          label="Spill"
          value={game}
          onChange={setGame}
          opts={[
            ["alle", "Alle"],
            ["cash", "Cash 100bb-ish"],
            ["mtt", "Turnering"],
          ]}
        />
        <Filter
          label="Stack"
          value={String(bb)}
          onChange={(v) => setBb(v === "alle" ? "alle" : Number(v))}
          opts={[["alle", "Alle bb"], ...STACKS.filter((s) => SPOTS.some((x) => x.bb === s)).map((s) => [String(s), `${s} bb`] as [string, string])]}
        />
        <Filter
          label="Posisjon"
          value={hero}
          onChange={(v) => setHero(v as Position | "alle")}
          opts={[["alle", "Alle"], ...POSITIONS.map((p) => [p, p] as [string, string])]}
        />
        <Filter
          label="Handling"
          value={kind}
          onChange={(v) => setKind(v as Kind | "alle")}
          opts={[
            ["alle", "Alle"],
            ["rfi", "Åpne"],
            ["vsopen", "Mot åpning"],
            ["jam", "Jam"],
          ]}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {catalog.map((s) => (
          <Button
            key={s.id}
            type="button"
            size="sm"
            variant={spot.id === s.id ? "default" : "secondary"}
            onClick={() => selectSpot(s.id)}
          >
            {s.title}
            {"custom" in s && s.custom ? " · min" : ""}
          </Button>
        ))}
        {catalog.length === 0 && <p className="text-sm text-muted">Ingen spots i dette filteret.</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
        <Card className="overflow-x-auto p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-lg font-medium">{spot.title}</p>
              <p className="text-xs text-subtle">
                {spot.hero} · {spot.bb} bb · {KIND_LABEL[spot.kind]}
                {spot.vs ? ` · ${spot.vs}` : ""} · {spot.game === "cash" ? "cash" : "MTT"}
              </p>
            </div>
            <Button type="button" size="sm" variant={train ? "default" : "secondary"} onClick={toggleTrain}>
              {train ? "Vis fasit" : "Tren (skjul fasit)"}
            </Button>
          </div>
          <p className="mb-3 text-sm text-muted">{spot.blurb}</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {BRUSH.map((b) => (
              <Button
                key={b.id}
                type="button"
                size="sm"
                variant={brush === b.id ? "default" : "secondary"}
                onClick={() => setBrush(b.id)}
              >
                {b.label}
              </Button>
            ))}
            <Button type="button" size="sm" variant="ghost" onClick={() => setPaint({})}>
              Tøm
            </Button>
            {!train && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setPaint(sol)}>
                Tilbakestill
              </Button>
            )}
          </div>
          <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}>
            {RANK_ORDER.split("").map((_, row) =>
              RANK_ORDER.split("").map((__, col) => {
                const key = gridCell(row, col);
                const pair = row === col;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyBrush(key)}
                    className={cn(
                      "aspect-square rounded-[var(--radius-xs)] text-xs font-medium tabular-nums",
                      cellTone(paint[key], pair),
                    )}
                  >
                    {key}
                  </button>
                );
              }),
            )}
          </div>
          <p className="mt-3 text-xs text-subtle">
            Raise/3-bet = grønn, call = sand, all-in = lys, fold = tom. Øvre triangel = suited.
          </p>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-sm text-muted">I range nå</p>
            <p className="font-display text-4xl font-medium tabular-nums">{fmt(stats.pct, 1)}%</p>
            <Metric k="Kombinasjoner" v={`${stats.combos} / 1326`} />
            <Metric k="Raise / 3-bet" v={String(stats.by.raise.size)} />
            <Metric k="Call" v={String(stats.by.call.size)} />
            <Metric k="All-in" v={String(stats.by.allin.size)} />
            {grade && (
              <>
                <Metric k="Treff mot fasit" v={`${fmt(grade.coverage, 0)}%`} tone={grade.coverage >= 80 ? "ok" : "bad"} />
                <Metric k="Mangler (combos)" v={String(grade.missC)} />
                <Metric k="Ekstra (combos)" v={String(grade.extraC)} />
              </>
            )}
          </Card>
          <Card>
            <p className="font-display text-base font-medium">Lagre som min</p>
            <CardHint className="mt-1 mb-3">
              Lim inn det du har fra solver eller coaching. Blir liggende i denne nettleseren.
            </CardHint>
            <Label>
              Navn
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`${spot.hero} ${spot.bb}bb`}
              />
            </Label>
            <Button type="button" className="w-full" onClick={saveMine}>
              Lagre range
            </Button>
            {savedMsg && <p className="mt-2 text-sm text-ok">{savedMsg}</p>}
            {customs.length > 0 && (
              <ul className="mt-3 space-y-2">
                {customs.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                    <button type="button" className="text-left text-accent" onClick={() => selectSpot(c.id)}>
                      {c.title}
                    </button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeCustom(c.id)}>
                      Slett
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Filter<T extends string>({
  label,
  value,
  onChange,
  opts,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  opts: [string, string][];
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <span className="uppercase tracking-[0.12em]">{label}</span>
      <select
        className="h-10 rounded-full border border-border bg-bg px-3 text-sm text-fg"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {opts.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
