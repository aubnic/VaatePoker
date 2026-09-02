/* VaatePoker prototype — all calculators run client-side */

const $ = (id) => document.getElementById(id);

function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  const el = $("view-" + name);
  if (el) el.classList.add("active");
  document.querySelectorAll("nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === name);
  });
  history.replaceState(null, "", "#" + name);
}

document.querySelectorAll("nav button").forEach((b) => {
  b.addEventListener("click", () => showView(b.dataset.view));
});

const hash = location.hash.replace("#", "");
if (hash) showView(hash);

function fmt(n, d = 1) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("nb-NO", { maximumFractionDigits: d, minimumFractionDigits: d });
}
function money(n) {
  return n.toLocaleString("nb-NO", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

/* ---------------- Pot odds ---------------- */
document.querySelectorAll(".quick-bets button").forEach((b) => {
  b.addEventListener("click", () => {
    const pot = Number($("pot-pot").value) || 0;
    $("pot-bet").value = Math.round(pot * Number(b.dataset.mult) * 100) / 100;
    calcPotOdds();
  });
});

function outsToEquity(outs, street) {
  const o = Math.max(0, Number(outs) || 0);
  if (street === "flop") {
    // more accurate than raw ×4 for high outs
    const p = 1 - ((47 - o) / 47) * ((46 - o) / 46);
    return p * 100;
  }
  if (street === "turn") return (o / 46) * 100;
  return null;
}

function calcPotOdds() {
  const pot = Number($("pot-pot").value) || 0;
  const bet = Number($("pot-bet").value) || 0;
  const extra = Math.max(0, Number($("pot-callers").value) || 0);
  const implied = Number($("pot-implied").value) || 0;
  const call = bet;
  const potAfterBet = pot + bet + extra * bet;
  const finalPot = potAfterBet + call;
  const req = finalPot > 0 ? call / (finalPot + implied) : 0;
  const reqRaw = finalPot > 0 ? call / finalPot : 0;
  const ratio = call > 0 ? potAfterBet / call : Infinity;

  const eqOverride = $("pot-eq").value;
  const street = $("pot-street").value;
  const outs = Number($("pot-outs").value) || 0;
  let equity;
  let eqSource;
  if (eqOverride !== "") {
    equity = Number(eqOverride);
    eqSource = "manuell equity";
  } else if (street === "river") {
    equity = null;
    eqSource = "river — oppgi equity selv";
  } else {
    equity = outsToEquity(outs, street);
    eqSource = street === "flop" ? `outs × flop (${outs} outs)` : `outs × turn (${outs} outs)`;
  }

  const ev = equity != null ? (equity / 100) * (potAfterBet + implied) - (1 - equity / 100) * call : null;
  const good = equity != null && equity / 100 >= req;

  $("pot-result").innerHTML = `
    <p class="muted">Påkrevd equity</p>
    <div class="big ${equity == null ? "" : good ? "ok" : "bad"}">${fmt(req * 100, 1)}%</div>
    <div class="metric"><span>Potodds-ratio</span><b>${fmt(ratio, 2)} : 1</b></div>
    <div class="metric"><span>Pot etter call</span><b>${fmt(finalPot, 0)}</b></div>
    <div class="metric"><span>Uten impliserte</span><b>${fmt(reqRaw * 100, 1)}%</b></div>
    <div class="metric"><span>Din equity (${eqSource})</span><b>${equity == null ? "—" : fmt(equity, 1) + "%"}</b></div>
    <div class="metric"><span>EV for call</span><b class="${ev == null ? "" : ev >= 0 ? "ok" : "bad"}">${ev == null ? "—" : (ev >= 0 ? "+" : "") + fmt(ev, 2)}</b></div>
    <p class="${equity == null ? "muted" : good ? "ok" : "bad"}">
      ${equity == null
        ? "Oppgi equity på river, eller bruk outs på flop/turn."
        : good
          ? "Call er +EV mot denne equityen."
          : "Call er −EV. Fold, med mindre impliserte odds / fold equity redder det."}
    </p>
    <p class="hint">Formel: call / (pot + innsats + extra·innsats + call + impliserte).</p>
  `;
}

/* ---------------- Bounty / PKO ---------------- */
function calcBounty() {
  const pot = Number($("b-pot").value) || 0;
  const call = Number($("b-call").value) || 0;
  const bounty = Number($("b-bounty").value) || 0;
  const instantPct = (Number($("b-instant").value) || 50) / 100;
  const chips = Number($("b-chips").value) || 1;
  const pool = Number($("b-pool").value) || 1;
  const eq = Number($("b-eq").value) || 0;
  const villainStack = Number($("b-villain").value) || 0;

  const bountyPower = chips / pool; // chips per $
  const instantCash = bounty * instantPct;
  const bountyChips = instantCash * bountyPower;
  const covering = villainStack > 0 && villainStack <= call + 1e-9;

  const potAfter = pot + call;
  const reqNoB = potAfter > 0 ? call / potAfter : 0;
  // only add full bounty if a knockout is possible (villain all-in covered)
  const bountyTerm = covering || villainStack === 0 ? bountyChips : bountyChips * 0.5;
  const reqWith = potAfter + bountyTerm > 0 ? call / (potAfter + bountyTerm) : 0;

  const evNo = (eq / 100) * pot - (1 - eq / 100) * call;
  const evYes = (eq / 100) * (pot + bountyTerm) - (1 - eq / 100) * call;

  $("bounty-result").innerHTML = `
    <p class="muted">Påkrevd equity med bounty</p>
    <div class="big ${eq >= reqWith * 100 ? "ok" : "bad"}">${fmt(reqWith * 100, 1)}%</div>
    <div class="metric"><span>Uten bounty</span><b>${fmt(reqNoB * 100, 1)}%</b></div>
    <div class="metric"><span>Bounty power</span><b>${fmt(bountyPower, 1)} chips / $</b></div>
    <div class="metric"><span>Instant bounty</span><b>$${money(instantCash)}</b></div>
    <div class="metric"><span>Bounty i chips</span><b>${fmt(bountyChips, 0)}</b></div>
    <div class="metric"><span>Knockout-justering</span><b>${covering || villainStack === 0 ? "full (covered / ukjent)" : "halvert (ikke covered)"}</b></div>
    <div class="metric"><span>Din equity</span><b>${fmt(eq, 1)}%</b></div>
    <div class="metric"><span>EV uten bounty</span><b class="${evNo >= 0 ? "ok" : "bad"}">${(evNo >= 0 ? "+" : "") + fmt(evNo, 0)}</b></div>
    <div class="metric"><span>EV med bounty</span><b class="${evYes >= 0 ? "ok" : "bad"}">${(evYes >= 0 ? "+" : "") + fmt(evYes, 0)}</b></div>
    <p class="${eq >= reqWith * 100 ? "ok" : "bad"}">
      ${eq >= reqWith * 100 ? "Call er +EV når bounty telles med." : "Fortsatt −EV selv med bounty — trenger mer equity eller større bounty."}
    </p>
    <p class="hint">Req. equity = call / (pot etter call + bounty_chips). Bounty power ≈ totale chips ÷ gjenstående premie+bounty-pool. Senere i turneringen (ICM) er dette en cEV-approksimasjon.</p>
  `;
}

/* ---------------- ICM ---------------- */
function rebuildICMRows() {
  const n = Number($("icm-n").value);
  const rows = $("icm-rows");
  const prizes = $("icm-prizes");
  rows.innerHTML = "";
  prizes.innerHTML = "";
  const defaultStacks = [5000, 3000, 2000, 1500, 1200, 1000, 800, 700, 600];
  const defaultPrizes = [50, 30, 20, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    rows.insertAdjacentHTML(
      "beforeend",
      `<label>Spiller ${i + 1} stack
        <input class="icm-stack" type="number" min="1" value="${defaultStacks[i] || 1000}" />
      </label>`
    );
    prizes.insertAdjacentHTML(
      "beforeend",
      `<label>${i + 1}. premie
        <input class="icm-prize" type="number" min="0" step="any" value="${defaultPrizes[i] || 0}" />
      </label>`
    );
  }
}

function icmPresetSng() {
  $("icm-n").value = "6";
  rebuildICMRows();
  const stacks = [4500, 2700, 1800, 1500, 1200, 900];
  const prizes = [84, 36, 0, 0, 0, 0];
  [...document.querySelectorAll(".icm-stack")].forEach((el, i) => (el.value = stacks[i]));
  [...document.querySelectorAll(".icm-prize")].forEach((el, i) => (el.value = prizes[i]));
}

rebuildICMRows();

function calculateICM(stacks, prizes) {
  const n = stacks.length;
  const subMemo = new Map();
  function key(mask, pIdx) {
    return mask + ":" + pIdx;
  }
  function icmSubtree(mask, pIdx) {
    const out = new Array(n).fill(0);
    if (pIdx >= prizes.length) return out;
    let live = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) live++;
    if (live === 0) return out;
    const k = key(mask, pIdx);
    if (subMemo.has(k)) return subMemo.get(k).slice();
    const prize = prizes[pIdx];
    let rem = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) rem += stacks[i];
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue;
      const p = stacks[i] / rem;
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

function calcICM() {
  const stacks = [...document.querySelectorAll(".icm-stack")].map((el) => Number(el.value) || 0);
  const prizes = [...document.querySelectorAll(".icm-prize")].map((el) => Number(el.value) || 0);
  if (stacks.some((s) => s <= 0)) {
    $("icm-result").innerHTML = `<p class="bad">Alle stacks må være &gt; 0.</p>`;
    return;
  }
  const totalChips = stacks.reduce((a, b) => a + b, 0);
  const totalPrize = prizes.reduce((a, b) => a + b, 0);
  const t0 = performance.now();
  const icm = calculateICM(stacks, prizes);
  const ms = performance.now() - t0;

  const rows = stacks
    .map((s, i) => {
      const chipPct = (s / totalChips) * 100;
      const icmPct = totalPrize ? (icm[i] / totalPrize) * 100 : 0;
      const prem = icmPct - chipPct;
      return `<tr>
        <td>P${i + 1}</td>
        <td>${fmt(s, 0)}</td>
        <td>${fmt(chipPct, 1)}%</td>
        <td><b>${money(icm[i])}</b></td>
        <td>${fmt(icmPct, 1)}%</td>
        <td class="${prem < -0.05 ? "bad" : prem > 0.05 ? "ok" : ""}">${prem >= 0 ? "+" : ""}${fmt(prem, 1)} pp</td>
      </tr>`;
    })
    .join("");

  $("icm-result").innerHTML = `
    <p class="muted">ICM-equity</p>
    <div class="big">${money(totalPrize)} totalt</div>
    <table>
      <thead><tr><th>Spiller</th><th>Stack</th><th>Chip %</th><th>$ equity</th><th>ICM %</th><th>vs chips</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="hint">Kjørt på ${fmt(ms, 0)} ms. Short stacks har høyere $ per chip enn chip-lederen (risk premium). ICM antar lik ferdighet.</p>
  `;
}

/* ---------------- PLO5 equity ---------------- */
const RANKS = "23456789TJQKA";
const SUITS = "cdhs";
const RANK_VAL = Object.fromEntries([...RANKS].map((r, i) => [r, i]));

function parseCards(str) {
  const parts = str.trim().toUpperCase().replace(/10/g, "T").split(/[\s,]+/).filter(Boolean);
  const cards = [];
  for (const p of parts) {
    if (p.length < 2) return { error: `Ugyldig kort: ${p}` };
    const rank = p[0] === "1" ? "T" : p[0];
    const suit = p[p.length - 1].toLowerCase();
    if (!RANKS.includes(rank) || !SUITS.includes(suit)) return { error: `Ugyldig kort: ${p}` };
    cards.push(rank + suit);
  }
  return { cards };
}

function cardId(c) {
  return RANK_VAL[c[0]] * 4 + SUITS.indexOf(c[1]);
}

function eval5(cards) {
  // cards: array of "Ah" etc. Returns comparable integer (higher better).
  const ranks = cards.map((c) => RANK_VAL[c[0]]).sort((a, b) => b - a);
  const suits = cards.map((c) => c[1]);
  const flush = suits.every((s) => s === suits[0]);
  const uniq = [...new Set(ranks)];
  let straight = false;
  let highStraight = 0;
  if (uniq.length === 5) {
    if (uniq[0] - uniq[4] === 4) {
      straight = true;
      highStraight = uniq[0];
    } else if (uniq[0] === 12 && uniq[1] === 3 && uniq[2] === 2 && uniq[3] === 1 && uniq[4] === 0) {
      straight = true;
      highStraight = 3; // wheel, 5-high
    }
  }
  const counts = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const groups = Object.entries(counts)
    .map(([r, n]) => [Number(r), n])
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  const kick = (...xs) => xs.reduce((acc, x) => acc * 13 + x, 0);

  if (straight && flush) return 8 * 1e8 + highStraight;
  if (groups[0][1] === 4) return 7 * 1e8 + kick(groups[0][0], groups[1][0]);
  if (groups[0][1] === 3 && groups[1][1] === 2) return 6 * 1e8 + kick(groups[0][0], groups[1][0]);
  if (flush) return 5 * 1e8 + kick(...ranks);
  if (straight) return 4 * 1e8 + highStraight;
  if (groups[0][1] === 3) return 3 * 1e8 + kick(groups[0][0], groups[1][0], groups[2][0]);
  if (groups[0][1] === 2 && groups[1][1] === 2)
    return 2 * 1e8 + kick(Math.max(groups[0][0], groups[1][0]), Math.min(groups[0][0], groups[1][0]), groups[2][0]);
  if (groups[0][1] === 2) return 1 * 1e8 + kick(groups[0][0], groups[1][0], groups[2][0], groups[3][0]);
  return kick(...ranks);
}

function combos(arr, k) {
  const out = [];
  const rec = (start, cur) => {
    if (cur.length === k) {
      out.push(cur.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      cur.push(arr[i]);
      rec(i + 1, cur);
      cur.pop();
    }
  };
  rec(0, []);
  return out;
}

function bestOmaha(hole, board) {
  const h2 = combos(hole, 2);
  const b3 = combos(board, 3);
  let best = -1;
  for (const h of h2) for (const b of b3) {
    const v = eval5(h.concat(b));
    if (v > best) best = v;
  }
  return best;
}

function fullDeck() {
  const d = [];
  for (const r of RANKS) for (const s of SUITS) d.push(r + s);
  return d;
}

function shuffleInPlace(a, rng) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

// mulberry32
function rngFrom(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

async function calcPLO5() {
  const heroP = parseCards($("p5-hero").value);
  const vilP = parseCards($("p5-villain").value);
  const boardP = parseCards($("p5-board").value || "");
  if (heroP.error) return void ($("plo5-result").innerHTML = `<p class="bad">${heroP.error}</p>`);
  if (vilP.error) return void ($("plo5-result").innerHTML = `<p class="bad">${vilP.error}</p>`);
  if (boardP.error) return void ($("plo5-result").innerHTML = `<p class="bad">${boardP.error}</p>`);
  if (heroP.cards.length !== 5 || vilP.cards.length !== 5) {
    $("plo5-result").innerHTML = `<p class="bad">PLO5 krever nøyaktig 5 hole-kort per spiller.</p>`;
    return;
  }
  if (boardP.cards.length > 5) {
    $("plo5-result").innerHTML = `<p class="bad">Board kan ha maks 5 kort.</p>`;
    return;
  }
  const used = new Set([...heroP.cards, ...vilP.cards, ...boardP.cards]);
  if (used.size !== 10 + boardP.cards.length) {
    $("plo5-result").innerHTML = `<p class="bad">Duplikatkort oppdaget.</p>`;
    return;
  }

  const needBoard = 5 - boardP.cards.length;
  const remaining = fullDeck().filter((c) => !used.has(c));
  const iters = Number($("p5-iters").value);
  $("plo5-result").innerHTML = `<p class="muted">Simulerer ${iters.toLocaleString("nb-NO")} runouts…</p>`;
  await new Promise((r) => setTimeout(r, 20));

  const rng = rngFrom(Date.now() % 1e9);
  let wins = 0, losses = 0, ties = 0;
  const t0 = performance.now();
  for (let i = 0; i < iters; i++) {
    shuffleInPlace(remaining, rng);
    const board = boardP.cards.concat(remaining.slice(0, needBoard));
    const hv = bestOmaha(heroP.cards, board);
    const vv = bestOmaha(vilP.cards, board);
    if (hv > vv) wins++;
    else if (hv < vv) losses++;
    else ties++;
  }
  const ms = performance.now() - t0;
  const eq = ((wins + ties / 2) / iters) * 100;
  const vEq = ((losses + ties / 2) / iters) * 100;
  const tiePct = (ties / iters) * 100;

  $("plo5-result").innerHTML = `
    <p class="muted">Hero equity</p>
    <div class="big ok">${fmt(eq, 1)}%</div>
    <div class="bar">
      <i class="hero" style="width:${eq}%"></i>
      <i class="tie" style="width:${tiePct}%"></i>
      <i class="villain" style="width:${vEq}%"></i>
    </div>
    <div class="metric"><span>Hero vinner</span><b>${fmt((wins / iters) * 100, 1)}%</b></div>
    <div class="metric"><span>Uavgjort</span><b>${fmt(tiePct, 1)}%</b></div>
    <div class="metric"><span>Villain equity</span><b>${fmt(vEq, 1)}%</b></div>
    <div class="metric"><span>Iterasjoner</span><b>${iters.toLocaleString("nb-NO")} · ${fmt(ms, 0)} ms</b></div>
    <p class="hint">Beste 5-kortshånd med nøyaktig 2 hole + 3 board. Monte Carlo — kjør flere iterasjoner for strammere CI (~±1/√N).</p>
  `;
}

/* card picker */
(function buildPicker() {
  const box = $("p5-picker");
  if (!box) return;
  const order = [..."AKQJT98765432"];
  const suitSym = { s: "♠", h: "♥", d: "♦", c: "♣" };
  for (const s of ["s", "h", "d", "c"]) {
    for (const r of order) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "pcard" + (s === "h" || s === "d" ? " red" : "");
      el.textContent = r + suitSym[s];
      el.dataset.card = r + s;
      el.addEventListener("click", () => {
        const active = document.activeElement;
        const target =
          active && (active.id === "p5-hero" || active.id === "p5-villain" || active.id === "p5-board")
            ? active
            : $("p5-hero");
        const cur = target.value.trim();
        target.value = (cur ? cur + " " : "") + el.dataset.card;
        target.focus();
      });
      box.appendChild(el);
    }
  }
})();

/* ---------------- OCR ---------------- */
let lastOcrNumbers = [];

$("ocr-file")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = $("ocr-preview");
  img.src = url;
  img.hidden = false;
  $("ocr-status").textContent = file.name;
});

async function runOCR() {
  const file = $("ocr-file").files[0];
  if (!file) {
    $("ocr-status").textContent = "Velg et bilde først.";
    return;
  }
  if (typeof Tesseract === "undefined") {
    $("ocr-status").textContent = "Tesseract lastet ikke. Sjekk nett.";
    return;
  }
  $("ocr-status").textContent = "Leser… første gang kan ta 10–20 s (laster språkmodell).";
  $("ocr-text").textContent = "…";
  try {
    const { data } = await Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          $("ocr-status").textContent = `Leser… ${Math.round(m.progress * 100)}%`;
        }
      },
    });
    const text = (data.text || "").trim();
    $("ocr-text").textContent = text || "(ingen tekst funnet)";
    const nums = [...text.matchAll(/(\d{1,3}(?:[ .,]\d{3})+|\d+(?:[.,]\d+)?)/g)]
      .map((m) => m[1].replace(/[^\d.,]/g, "").replace(/\s/g, ""))
      .map((s) => Number(s.replace(/\s/g, "").replace(",", ".")))
      .filter((n) => Number.isFinite(n) && n > 0);
    lastOcrNumbers = nums;
    $("ocr-nums").innerHTML = nums.length
      ? nums.slice(0, 24).map((n) => `<span>${n}</span>`).join("")
      : "<span class='muted'>Ingen tall</span>";
    $("ocr-status").textContent = `Ferdig. ${nums.length} tall funnet.`;
  } catch (err) {
    $("ocr-status").textContent = "OCR feilet: " + err.message;
  }
}

function sendOcrTo(which) {
  if (!lastOcrNumbers.length) return;
  const n = lastOcrNumbers[0];
  if (which === "pot") {
    $("pot-pot").value = n;
    showView("potodds");
    calcPotOdds();
  } else {
    $("b-pot").value = n;
    showView("bounty");
  }
}

/* initial demo calc */
calcPotOdds();
