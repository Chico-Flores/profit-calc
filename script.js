// ============================================================
// PHG Profit Calculator — script.js
// Live-recalculating monthly P&L. No build step, no dependencies.
//
// HOW TO UPDATE THE ROSTER:
//   1. Change the numbers in DEFAULTS below (counts, rates, hours)
//   2. Update the matching value="" attributes + roster date in index.html
//   3. Bump ROSTER_DATE and STORAGE_KEY
// ============================================================

const ROSTER_DATE = '2026-09-28';
const STORAGE_KEY = 'phg-profit-calc-v3'; // bump whenever DEFAULTS change so saved inputs don't mask them

// Average hours in a full-time month: 40 hrs × 52 weeks ÷ 12
const MONTH_HOURS = 173.33;

// ---------- Defaults (Sep 2026 roster) ----------
const DEFAULTS = {
  teams: {
    tjCloser: { count: 10, rate: 7.80, hours: MONTH_HOURS },
    tjDialer: { count: 2,  rate: 7.80, hours: MONTH_HOURS },
    ph4:      { count: 6,  rate: 4.00, hours: MONTH_HOURS },
    ph3:      { count: 25, rate: 3.00, hours: MONTH_HOURS },
    eg:       { count: 1,  rate: 4.00, hours: MONTH_HOURS },
  },
  adminCount: 3,
  // USTN per-seat pricing (invoice #19137, Sep 2026)
  localLineCost: 60,   // IP unit / extension — TJ closers + admin
  dialerLineCost: 100, // ACE dialer license — TJ dialers + Philippines + Egypt
  expenses: [
    { name: 'Local presence pool · Click to Dial', amount: 220 },
    { name: 'ACE predictive dialer platform',      amount: 1200 },
    { name: 'CAD call report',                     amount: 140 },
    { name: 'Recordings (10k min + 90-day archive)', amount: 70 },
    { name: 'DUNK groups (2)',                     amount: 200 },
    { name: 'Broadcast calls',                     amount: 1600 },
    { name: 'SimpliCity CRM',                      amount: 2000 },
    { name: 'IDI batching',                        amount: 5000 },
    { name: 'Admin payroll',                       amount: 12000 },
  ],
  mode: 'total',
  totalSales: 0,
  closerAvg: 0,
  dialerAvg: 0,
  remitPct: 20, reservePct: 5, feePct: 3,
  // Commission off by default — type rates in to model a plan
  closerCommRate: 0, closerCommFloor: 0,
  dialerCommRate: 0, dialerCommFloor: 0,
};

const TEAM_IDS = Object.keys(DEFAULTS.teams);
const $ = (id) => document.getElementById(id);

// ---------- Helpers ----------
function money(n, cents = false) {
  if (n === Infinity) return 'n/a';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0,
  }).format(n || 0);
}
function num(id) { const v = parseFloat($(id).value); return isNaN(v) ? 0 : Math.max(0, v); }
function int(id) { const v = parseInt($(id).value, 10); return isNaN(v) ? 0 : Math.max(0, v); }
function clampPct(v) { return Math.min(100, Math.max(0, v)); }

let pinned = null; // pinned scenario results for comparison

// ---------- Expense rows ----------
function addExpenseRow(name = '', amount = 0) {
  const row = document.createElement('div');
  row.className = 'expense-row';
  row.innerHTML = `
    <input type="text" class="exp-name" placeholder="Expense name">
    <input type="number" class="exp-amount" min="0" step="0.01">
    <button type="button" class="remove" title="Remove">×</button>`;
  row.querySelector('.exp-name').value = name;
  row.querySelector('.exp-amount').value = amount;
  row.querySelector('.remove').addEventListener('click', () => { row.remove(); recalc(); });
  row.querySelectorAll('input').forEach(i => i.addEventListener('input', recalc));
  $('expenseList').appendChild(row);
}
function readExpenses() {
  return Array.from(document.querySelectorAll('.expense-row')).map(r => ({
    name: r.querySelector('.exp-name').value,
    amount: Math.max(0, parseFloat(r.querySelector('.exp-amount').value) || 0),
  }));
}

// ---------- Phone line auto-fill ----------
// Each seat gets ONE line: TJ closers + admin on the $60 local line,
// everyone else (TJ dialers, Philippines, Egypt) on the $100 dialer line.
function autoLines() {
  const closers = int('tjCloserCount');
  const agents  = TEAM_IDS.reduce((s, t) => s + int(t + 'Count'), 0);
  const admin   = int('adminCount');
  const local = $('localLineCount'), dialer = $('dialerLineCount');
  if (local.dataset.auto === 'true')  local.value  = closers + admin;
  if (dialer.dataset.auto === 'true') dialer.value = agents - closers;
}

// Smallest x ≥ 0 where f(x) ≥ 0 (f is increasing). Infinity if it never gets there
// — e.g. commission eats more of each dollar than the business keeps.
function solve(f) {
  if (f(0) >= 0) return 0;
  let hi = 1000;
  while (f(hi) < 0) { hi *= 2; if (hi > 1e10) return Infinity; }
  let lo = 0;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (f(mid) >= 0) hi = mid; else lo = mid; }
  return hi;
}

// ---------- Core calculation ----------
function compute() {
  const t = {};
  let tjPayroll = 0, osPayroll = 0, agents = 0;
  TEAM_IDS.forEach(id => {
    const count = int(id + 'Count'), rate = num(id + 'Rate'), hours = num(id + 'Hours');
    const cost = count * rate * hours;
    t[id] = { count, rate, hours, cost };
    agents += count;
    if (id.startsWith('tj')) tjPayroll += cost; else osPayroll += cost;
  });

  const closers = t.tjCloser.count;
  const dialers = agents - closers;

  // Collections
  const mode = document.querySelector('.seg-btn.active').dataset.mode;
  let closerAvg, dialerAvg, gross;
  if (mode === 'avg') {
    closerAvg = num('closerAvg'); dialerAvg = num('dialerAvg');
    gross = closerAvg * closers + dialerAvg * dialers;
  } else {
    gross = num('totalSales');
    // Split evenly per head when only a total is known
    closerAvg = agents ? gross / agents : 0;
    dialerAvg = agents ? gross / agents : 0;
  }

  // Deductions
  const remitPct = clampPct(num('remitPct')), reservePct = clampPct(num('reservePct')), feePct = clampPct(num('feePct'));
  const netRate = Math.max(0, (100 - remitPct - reservePct - feePct) / 100);
  const remitAmt = gross * remitPct / 100;
  const feesAmt  = gross * (reservePct + feePct) / 100;
  const netRev   = gross * netRate;

  // Commission (flat approximation)
  const cRate = num('closerCommRate') / 100, cFloor = num('closerCommFloor');
  const dRate = num('dialerCommRate') / 100, dFloor = num('dialerCommFloor');
  const commAt = (cAvg, dAvg) =>
    (cAvg > cFloor ? (cAvg - cFloor) * cRate * closers : 0) +
    (dAvg > dFloor ? (dAvg - dFloor) * dRate * dialers : 0);
  const commission = commAt(closerAvg, dialerAvg);

  // Phone + overhead
  const phone = num('localLineCost') * int('localLineCount') + num('dialerLineCost') * int('dialerLineCount');
  const overhead = readExpenses().reduce((s, e) => s + e.amount, 0);

  const expenses = tjPayroll + osPayroll + commission + phone + overhead;
  const profit = netRev - expenses;
  const margin = netRev ? profit / netRev * 100 : 0;

  // Break-even includes commission. Commission grows with sales, so solve
  // numerically: find the smallest gross where net revenue covers everything.
  const fixed = tjPayroll + osPayroll + phone + overhead;
  // Averages as a function of gross, keeping the current closer/dialer mix
  const cShare = mode === 'avg' && gross > 0 ? closerAvg / gross : (agents ? 1 / agents : 0);
  const dShare = mode === 'avg' && gross > 0 ? dialerAvg / gross : (agents ? 1 / agents : 0);
  const splitAt = mode === 'avg' && gross === 0
    ? (g) => [closers ? g / (closers + dialers) : 0, dialers ? g / (closers + dialers) : 0]
    : (g) => [g * cShare, g * dShare];
  const breakEven = solve(g => g * netRate - fixed - commAt(...splitAt(g)));
  // Closer avg needed to break even, holding the dialer avg where it is
  const beCloser = closers
    ? solve(c => (c * closers + dialerAvg * dialers) * netRate - fixed - commAt(c, dialerAvg)) : 0;

  return {
    t, agents, closers, dialers, gross, closerAvg, dialerAvg,
    remitAmt, feesAmt, netRev, netRate, tjPayroll, osPayroll, commission, phone, overhead,
    expenses, profit, margin, breakEven, fixed,
    costPerAgent: agents ? expenses / agents : 0,
    revPerAgent:  agents ? netRev / agents : 0,
    // Per-agent target: in avg mode, what each closer needs given the dialer avg; otherwise an even split
    beCloserAvg:  mode === 'avg' ? beCloser : (agents && isFinite(breakEven) ? breakEven / agents : Infinity),
    mode,
  };
}

// ---------- Render ----------
function render(r) {
  TEAM_IDS.forEach(id => { $(id + 'Cost').textContent = money(r.t[id].cost); });

  const p = $('profit');
  p.textContent = money(r.profit);
  p.classList.toggle('pos', r.profit > 0);
  p.classList.toggle('neg', r.profit < 0);
  $('marginLine').textContent = r.gross ? `${r.margin.toFixed(1)}% margin on net revenue` : 'no collections entered';

  // Break-even bar: break-even sits at 2/3 of the track; collected fills relative to it
  const ratio = r.breakEven ? r.gross / r.breakEven : 0;
  const fillPct = Math.min(100, ratio * 66.6);
  $('beFill').style.width = fillPct + '%';
  $('beCollected').textContent = money(r.gross);
  $('breakEven').textContent = money(r.breakEven);
  const gap = r.gross - r.breakEven;
  $('beNote').textContent = r.breakEven === Infinity
    ? 'Commission rates are higher than what the business keeps per dollar — this never breaks even.'
    : !r.gross
    ? 'Enter collections to see where you land.'
    : gap >= 0
      ? `${money(gap)} above break-even (${(ratio * 100).toFixed(0)}% of target).`
      : `${money(-gap)} short of break-even — that's ${r.closers ? money(r.mode === 'avg' ? r.beCloserAvg - r.closerAvg : -gap / r.closers) + ' more per closer' : 'the gap'}.`;

  $('grossCollected').textContent = money(r.gross);
  $('remitAmt').textContent = money(r.remitAmt);
  $('feesAmt').textContent = money(r.feesAmt);
  $('netRevenue').textContent = money(r.netRev);
  $('tjPayroll').textContent = money(r.tjPayroll);
  $('osPayroll').textContent = money(r.osPayroll);
  $('commission').textContent = money(r.commission);
  $('phoneCost').textContent = money(r.phone);
  $('overheadCost').textContent = money(r.overhead);
  $('totalExpenses').textContent = money(r.expenses);
  $('totalAgents').textContent = r.agents;
  $('beCloserAvg').textContent = money(r.beCloserAvg);
  $('beCloserAvgLabel').textContent = r.mode === 'avg' ? 'Closer avg needed to break even' : 'Per-agent avg needed to break even';
  $('costPerAgent').textContent = money(r.costPerAgent);
  $('revPerAgent').textContent = money(r.revPerAgent);
  $('netRateDisplay').textContent = (r.netRate * 100).toFixed(1) + '%';

  const pd = $('pinDelta');
  if (pinned) {
    const d = r.profit - pinned.profit;
    pd.hidden = false;
    pd.textContent = `${d >= 0 ? '+' : '−'}${money(Math.abs(d))} vs pinned`;
    pd.className = 'pin-delta ' + (d > 0 ? 'pos' : d < 0 ? 'neg' : '');
  } else pd.hidden = true;
}

function recalc() {
  autoLines();
  const r = compute();
  render(r);
  save();
  return r;
}

// ---------- Persistence ----------
function save() {
  const state = { mode: compute().mode, expenses: readExpenses(), fields: {} };
  document.querySelectorAll('input[id]').forEach(i => { state.fields[i.id] = i.value; });
  state.auto = { local: $('localLineCount').dataset.auto, dialer: $('dialerLineCount').dataset.auto };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) {}
  if (!s) return false;
  Object.entries(s.fields || {}).forEach(([id, v]) => { if ($(id)) $(id).value = v; });
  $('expenseList').innerHTML = '';
  (s.expenses || DEFAULTS.expenses).forEach(e => addExpenseRow(e.name, e.amount));
  if (s.auto) { $('localLineCount').dataset.auto = s.auto.local; $('dialerLineCount').dataset.auto = s.auto.dialer; }
  setMode(s.mode || 'total');
  return true;
}
function applyDefaults() {
  TEAM_IDS.forEach(id => {
    const d = DEFAULTS.teams[id];
    $(id + 'Count').value = d.count; $(id + 'Rate').value = d.rate.toFixed(2); $(id + 'Hours').value = d.hours;
  });
  $('adminCount').value = DEFAULTS.adminCount;
  $('localLineCost').value = DEFAULTS.localLineCost;
  $('dialerLineCost').value = DEFAULTS.dialerLineCost;
  $('localLineCount').dataset.auto = 'true';
  $('dialerLineCount').dataset.auto = 'true';
  $('expenseList').innerHTML = '';
  DEFAULTS.expenses.forEach(e => addExpenseRow(e.name, e.amount));
  ['totalSales','closerAvg','dialerAvg','remitPct','reservePct','feePct',
   'closerCommRate','closerCommFloor','dialerCommRate','dialerCommFloor'].forEach(id => { $(id).value = DEFAULTS[id]; });
  setMode(DEFAULTS.mode);
}

// ---------- Mode switch ----------
function setMode(mode) {
  document.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  $('modeTotal').hidden = mode !== 'total';
  $('modeAvg').hidden = mode !== 'avg';
}

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
}

// ---------- Copy summary ----------
function summaryText(r) {
  const lines = [
    `PHG Profit Calculator — roster ${ROSTER_DATE}`,
    `Agents: ${r.agents} (${r.closers} closers, ${r.dialers} dialers)`,
    `Gross collected: ${money(r.gross)}`,
    `Net revenue (${(r.netRate*100).toFixed(0)}%): ${money(r.netRev)}`,
    `Tijuana payroll: ${money(r.tjPayroll)}`,
    `Overseas payroll: ${money(r.osPayroll)}`,
    `Commission: ${money(r.commission)}`,
    `Phone lines: ${money(r.phone)}`,
    `Overhead: ${money(r.overhead)}`,
    `Total expenses: ${money(r.expenses)}`,
    `Break-even: ${money(r.breakEven)}`,
    `Profit / loss: ${money(r.profit)} (${r.margin.toFixed(1)}% margin)`,
  ];
  if (pinned) lines.push(`vs pinned: ${r.profit - pinned.profit >= 0 ? '+' : ''}${money(r.profit - pinned.profit)}`);
  return lines.join('\n');
}

// ---------- Wire up ----------
document.addEventListener('DOMContentLoaded', () => {
  if (!load()) applyDefaults();

  // Steppers
  document.querySelectorAll('.step').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      input.value = Math.max(0, (parseInt(input.value, 10) || 0) + parseInt(btn.dataset.step, 10));
      recalc();
    });
  });

  // Any input recalcs
  document.querySelectorAll('input').forEach(i => i.addEventListener('input', recalc));

  // Manual override of auto line counts
  ['localLineCount', 'dialerLineCount'].forEach(id => {
    $(id).addEventListener('input', () => { $(id).dataset.auto = 'false'; recalc(); });
  });
  $('relinkLines').addEventListener('click', () => {
    $('localLineCount').dataset.auto = 'true'; $('dialerLineCount').dataset.auto = 'true';
    recalc(); toast('Phone lines re-linked to headcount');
  });

  // Mode
  document.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => { setMode(b.dataset.mode); recalc(); }));

  // Expenses
  $('addExpenseBtn').addEventListener('click', () => { addExpenseRow(); recalc(); $('expenseList').lastElementChild.querySelector('input').focus(); });

  // Pin / copy / reset
  $('pinBtn').addEventListener('click', () => {
    const r = compute();
    if (pinned) { pinned = null; $('pinBtn').textContent = 'Pin scenario'; toast('Pin cleared'); }
    else { pinned = r; $('pinBtn').textContent = 'Unpin'; toast(`Pinned ${money(r.profit)} as baseline`); }
    recalc();
  });
  $('copyBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(summaryText(compute())); toast('Summary copied'); }
    catch (e) { toast('Copy failed — select the ledger manually'); }
  });
  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset everything to the Sep 2026 defaults?')) return;
    pinned = null; $('pinBtn').textContent = 'Pin scenario';
    applyDefaults(); recalc(); toast('Reset to defaults');
  });

  recalc();
});
