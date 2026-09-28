# PHG Profit Calculator

Monthly P&L, break-even, and what-if tool for Powerhouze Group. Static site — no build step, no dependencies. Open `index.html` or deploy to Render / Vercel / GitHub Pages as-is.

## What it does

- **Team** — headcount, $/hr and hours/month per group (TJ closers, TJ dialers, PH $4 tier, PH $3 tier, Egypt, admin seats). Payroll shows per card. Hours default to 173.33/mo (40 hrs × 52 wks ÷ 12).
- **Phone lines** — one line per seat, auto-filled from headcount: $60 local line (IP extension) = TJ closers + admin; $100 dialer license = TJ dialers + Philippines + Egypt. Type over to override, "re-link" to go back to auto.
- **Overhead** — editable list of fixed costs. Add / remove rows as vendors change.
- **Collections** — enter a total, or closer/dialer averages. Remit %, reserves, fees, and commission thresholds are editable under "Deductions & commission".
- **Ledger** — live profit/loss, margin, break-even bar, pay-stub style breakdown, per-agent numbers.
- **Pin scenario** — freeze the current result as a baseline, then change anything and see the delta.
- **Copy summary** — plain-text summary for Discord / email.
- Inputs persist in `localStorage`. **Reset** restores the defaults.

## Formulas

```
team payroll      = count × $/hr × hrs/mo
net revenue rate  = 1 − remit% − reserve% − fee%
net revenue       = gross collected × net rate
commission        = closers × max(0, closerAvg − closerFloor) × closerRate
                  + dialers × max(0, dialerAvg − dialerFloor) × dialerRate
total expenses    = payroll + commission + phone lines + overhead
profit            = net revenue − total expenses
break-even        = smallest gross where net revenue ≥ payroll + commission + phone + overhead
                    (solved numerically; equals fixed ÷ net rate when commission is 0)
```

## Updating the roster

1. Edit `DEFAULTS` at the top of `script.js` (counts, rates, hours, overhead rows).
2. Update the matching `value=""` attributes and "Roster as of" text in `index.html`.
3. Bump `ROSTER_DATE` and `STORAGE_KEY` in `script.js` (so saved browser inputs don't hide the new defaults).

**Current defaults (Sep 28, 2026):** 10 TJ closers + 2 TJ dialers @ $7.80/hr · 6 PH @ $4 · 25 PH @ $3 · 1 Egypt @ $4 · 3 admin seats · 173.33 hrs/mo · remit 20% · commission 0% · phone pricing from USTN invoice #19137.

## Files

```
index.html   structure
styles.css   PHG brand styling (Archivo + JetBrains Mono)
script.js    calculation + persistence
```
