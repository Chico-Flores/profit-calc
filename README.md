# PHG Profit Calculator

Monthly P&L, break-even, and what-if tool for Powerhouze Group. Static site — no build step, no dependencies. Open `index.html` or deploy to Render / Vercel / GitHub Pages as-is.

## What it does

- **Team** — headcount, $/hr and hours/month per group (TJ closers, TJ dialers, PH $4 tier, PH $3 tier, Egypt, admin seats). Payroll shows per card.
- **Phone lines** — seat counts auto-fill from headcount (local = TJ closers + admin; dialer = all agents + admin). Type over to override, "re-link" to go back to auto.
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
break-even        = (payroll + phone lines + overhead) ÷ net rate
```

## Updating the roster

1. Edit `DEFAULTS` at the top of `script.js` (counts, rates, hours, overhead rows).
2. Edit the initials list in `index.html` under `#rosterBox`.
3. Bump `ROSTER_DATE` in `script.js` and the "Roster as of" text in `index.html`.

**Current defaults (Aug 21, 2026):** 9 TJ closers + 3 TJ dialers @ $7.80/hr · 6 PH @ $4 · 17 PH @ $3 · 1 Egypt @ $4 · 3 admin seats · 160 hrs/mo.

## Files

```
index.html   structure
styles.css   PHG brand styling (Archivo + JetBrains Mono)
script.js    calculation + persistence
```
