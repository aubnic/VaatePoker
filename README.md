# VaatePoker

Poker-læringsside med funksjonelle kalkulatorer. Alt kjører i nettleseren.

**Live:** åpne `index.html` lokalt, eller bruk GitHub Pages.

## Kalkulatorer

| Verktøy | Hva den gjør |
|---|---|
| **Potodds** | `call / (pot + innsats + extra callere + call + impliserte)`. Outs med skikkelig flop/turn-kombinatorikk. EV for call. |
| **Bounty / PKO** | Bounty power = chips i spill ÷ gjenstående $-pool. Instant bounty i chips, påkrevd equity med/uten bounty. |
| **ICM** | Malmuth–Harville. Verifisert: stacks 5000 / 3000 / 2000 og $50 / $30 / $20 → **$38.39 / $32.75 / $28.86**. Maks 9 spillere. |
| **PLO5** | Monte Carlo heads-up. Nøyaktig 2 hole-kort + 3 board. |
| **OCR** | Tesseract.js i nettleseren. Leser tall fra screenshot (ingen opplasting til server). |

## Kjøre

Ingen byggesteg. Åpne `index.html` i Chrome eller Firefox.

TypeScript-kjernen ligger i `src/lib/poker/` (samme formler som i nettsiden).

## Begrensninger

- ICM er eksponentiell — hold deg til finalbord.
- Bounty er cEV (bounty power), ikke full ICM+PKO.
- PLO5 er heads-up simulering, ikke solver.
- OCR er best effort og avhenger av bildekvalitet.

## Lisens

MIT
