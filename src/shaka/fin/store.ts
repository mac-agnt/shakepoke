/* One shared, local, deterministic store for the finance-first demo.
   Every page, the Home rail and the Home chat read the same state through the
   memoised selectors below, so approving one invoice moves every total at once.
   Nothing leaves the browser. */
import { useSyncExternalStore } from "react";
import {
  INVOICES_SEED, INGREDIENTS, CATEGORIES, LOCS, MONTHS, SALES, HIST_SPEND, LABOUR, OTHER, EXPECTED_BILLS, PACK_MONTH,
  lineTotal, invoiceTotal, supplierName, catName, locName, ingredient,
  type Invoice, type Line, type LocId, type CatId,
} from "./data";
import { downloadCSV, centsCSV } from "../format";

export type Activity = { id: string; ts: string; who: string; kind: "you" | "system"; text: string; ref?: string };
export type Scope = "ALL" | LocId;
export type State = {
  invoices: Invoice[];
  activity: Activity[];
  ui: {
    tabs: Record<string, string>;
    selected: string | null;
    ingFocus: string | null;
    month: string;
    loc: Scope;
    capture: boolean;
    toast: { text: string; n: number } | null;
  };
};

const ACT_SEED: Activity[] = [
  { id: "A4", ts: "Wed 11 Nov, 07:10", who: "Invoice inbox", kind: "system", text: "5 documents need a person: 2 unclear lines, 1 missing shop, 1 receipt category and 1 suspected duplicate." },
  { id: "A3", ts: "Thu 5 Nov, 18:40", who: "David", kind: "you", text: "Entered October labour and other expenses for Baggot Street and Blackrock." },
  { id: "A2", ts: "Wed 4 Nov, 09:15", who: "Invoice inbox", kind: "system", text: "24 October documents received. 19 matched known supplier formats and were reviewed." },
  { id: "A1", ts: "Tue 3 Nov, 07:00", who: "Square CSV import", kind: "system", text: "October sales imported for both shops from the Square export (demo import)." },
];

const clone = <X,>(x: X): X => JSON.parse(JSON.stringify(x));
const initial = (): State => ({
  invoices: clone(INVOICES_SEED),
  activity: clone(ACT_SEED),
  ui: { tabs: {}, selected: null, ingFocus: null, month: PACK_MONTH.ym, loc: "ALL", capture: false, toast: null },
});

let state: State = initial();
const subs = new Set<() => void>();
const set = (fn: (s: State) => State) => { state = fn(state); subs.forEach(f => f()); };
export const getFin = () => state;
export const subscribeFin = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export function useFin(): State { return useSyncExternalStore(subscribeFin, getFin, getFin); }

let navigate: ((page: string) => void) | null = null;
export const bindFinNavigator = (fn: (page: string) => void) => { navigate = fn; };

let seq = 100;
const now = () => {
  try {
    return new Intl.DateTimeFormat("en-IE", { timeZone: "Europe/Dublin", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(",", "") + " (this session)";
  } catch { return "This session"; }
};
const log = (s: State, text: string, ref?: string): State => ({ ...s, activity: [{ id: "A" + ++seq, ts: now(), who: "David", kind: "you", text, ref }, ...s.activity] });
const patchInv = (s: State, id: string, fn: (i: Invoice) => Invoice): State => ({ ...s, invoices: s.invoices.map(i => (i.id === id ? fn(i) : i)) });
const ui = (s: State, p: Partial<State["ui"]>): State => ({ ...s, ui: { ...s.ui, ...p } });
let toastN = 0;
const toast = (s: State, text: string): State => {
  const n = ++toastN;
  setTimeout(() => { if (state.ui.toast?.n === n) set(st => ui(st, { toast: null })); }, 3200);
  return ui(s, { toast: { text, n } });
};
const eurS = (c: number) => "€" + (c / 100).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fin = {
  go(page: string, tab?: string) {
    if (tab) set(s => ui(s, { tabs: { ...s.ui.tabs, [page]: tab } }));
    navigate?.(page);
  },
  setTab(page: string, tab: string) { set(s => ui(s, { tabs: { ...s.ui.tabs, [page]: tab } })); },
  select(id: string | null) { set(s => ui(s, { selected: id })); },
  openInvoice(id: string) {
    const inv = state.invoices.find(i => i.id === id);
    set(s => ui(s, { selected: id, tabs: { ...s.ui.tabs, Invoices: inv?.status === "attention" ? "Needs review" : inv?.kind === "receipt" ? "Staff receipts" : "All invoices" } }));
    navigate?.("Invoices");
  },
  focusIngredient(id: string | null, go = true) {
    set(s => ui(s, { ingFocus: id, tabs: { ...s.ui.tabs, Ingredients: "Spend" } }));
    if (go) navigate?.("Ingredients");
  },
  setMonth(ym: string) { set(s => ui(s, { month: ym })); },
  setLoc(loc: Scope) { set(s => ui(s, { loc })); },
  openCapture(on: boolean) { set(s => ui(s, { capture: on })); },
  toast(text: string) { set(s => toast(s, text)); },

  /* Apply the suggested correction on every flagged line, then approve. */
  approveCorrected(id: string) {
    set(s => {
      const inv = s.invoices.find(i => i.id === id);
      if (!inv || inv.status !== "attention") return s;
      const fixed = inv.lines.filter(l => l.suggest).map(l => l.desc + " " + l.qty + " " + l.unit + " → " + l.suggest!.qty + " " + l.suggest!.unit).join("; ");
      let n = patchInv(s, id, i => ({ ...i, status: "approved", lines: i.lines.map(l => (l.suggest ? { ...l, qty: l.suggest.qty, unit: l.suggest.unit, issue: undefined, suggest: undefined } : l)) }));
      n = log(n, "Approved corrected line on " + id + " (" + fixed + ").", id);
      return toast(n, id + " approved. Totals updated everywhere.");
    });
  },
  setLocation(id: string, loc: LocId) {
    set(s => patchInv(s, id, i => ({ ...i, loc })));
  },
  approve(id: string) {
    set(s => {
      const inv = s.invoices.find(i => i.id === id);
      const loc = inv?.loc ?? inv?.suggestLoc;
      if (!inv || inv.status !== "attention" || !loc) return s;
      let n = patchInv(s, id, i => ({ ...i, status: "approved", loc }));
      n = log(n, "Approved " + id + " for " + locName(loc) + (inv.issue === "category" ? ", filed under " + catName(inv.lines[0].cat) : "") + ".", id);
      return toast(n, id + " approved. Totals updated everywhere.");
    });
  },
  excludeDuplicate(id: string) {
    set(s => {
      let n = patchInv(s, id, i => ({ ...i, status: "excluded" }));
      n = log(n, "Excluded " + id + " as a duplicate of " + (s.invoices.find(i => i.id === id)?.duplicateOf ?? "an approved invoice") + ". It stays on record but out of every total.", id);
      return toast(n, id + " excluded as a duplicate.");
    });
  },
  setLineCategory(id: string, lineId: string, cat: CatId) {
    set(s => {
      const inv = s.invoices.find(i => i.id === id);
      const line = inv?.lines.find(l => l.id === lineId);
      if (!inv || !line || line.cat === cat) return s;
      let n = patchInv(s, id, i => ({ ...i, lines: i.lines.map(l => (l.id === lineId ? { ...l, cat } : l)) }));
      n = log(n, "Changed " + line.desc + " on " + id + " from " + catName(line.cat) + " to " + catName(cat) + ".", id);
      return inv.status === "approved" ? toast(n, "Category updated. Expense totals moved.") : n;
    });
  },
  reset() {
    state = initial();
    state = toast(state, "Demo reset to the starting data.");
    subs.forEach(f => f());
  },

  exportInvoices() {
    const s = state;
    const rows = approvedLines(s).map(r => [supplierName(r.inv.supplier), r.inv.id, r.inv.date, locName(r.inv.loc ?? ""), r.line.desc, r.line.qty, r.line.unit, centsCSV(r.line.unitPrice), centsCSV(lineTotal(r.line)), catName(r.line.cat), accountOf(r.line.cat), r.inv.source]);
    downloadCSV("ShakaPoke-DEMO-" + PACK_MONTH.ym + "-reviewed-invoices.csv",
      ["Supplier", "Invoice number", "Invoice date", "Location", "Description", "Quantity", "Unit", "Unit amount (EUR)", "Line amount (EUR)", "Category", "Suggested account (to map)", "Source"], rows);
    set(st => toast(log(st, "Exported " + approvedInvoices(st).length + " reviewed invoices (" + rows.length + " lines) to CSV."), "Downloaded reviewed invoices (demo CSV)."));
  },
  exportCategories() {
    const rows = categoryRows(state).map(c => [c.name, c.account, centsCSV(c.BAG), centsCSV(c.BLK), centsCSV(c.total)]);
    const t = spendTotals(state);
    rows.push(["Total approved supplier spend", "", centsCSV(t.BAG), centsCSV(t.BLK), centsCSV(t.ALL)]);
    downloadCSV("ShakaPoke-DEMO-" + PACK_MONTH.ym + "-expense-categories.csv", ["Category", "Suggested account (to map)", "Baggot Street (EUR)", "Blackrock (EUR)", "Total (EUR)"], rows);
    set(st => toast(log(st, "Exported October expense categories to CSV."), "Downloaded expense categories (demo CSV)."));
  },
  exportSummary() {
    const s = state;
    const b = monthRow(s, PACK_MONTH.ym, "BAG"), k = monthRow(s, PACK_MONTH.ym, "BLK"), a = monthRow(s, PACK_MONTH.ym, "ALL");
    const c = (v: number | null) => (v === null ? "not provided" : centsCSV(v));
    const p = pending(s);
    const rows: (string | number)[][] = [
      ["Sales", c(b.sales), c(k.sales), c(a.sales), "Square CSV import"],
      ["Approved supplier spend", c(b.spend), c(k.spend), c(a.spend), "Reviewed invoices in the inbox"],
      ["Labour", c(b.labour), c(k.labour), c(a.labour), "Entered by the owner"],
      ["Other expenses", c(b.other), c(k.other), c(a.other), "Entered by the owner (rent, utilities, card fees, insurance)"],
      ["Indicative operating profit", c(b.profit), c(k.profit), c(a.profit), "Sales minus the three cost lines above"],
      ["Invoices awaiting review", String(p.BAG.count), String(p.BLK.count), String(p.ALL.count), "Excluded from spend: " + centsCSV(p.ALL.value) + " EUR"],
      ["Status", b.statusLabel, k.statusLabel, a.statusLabel, "Indicative management P&L, not an accountant-verified statement. Illustrative demo data."],
    ];
    downloadCSV("ShakaPoke-DEMO-" + PACK_MONTH.ym + "-management-summary.csv", ["Line", "Baggot Street (EUR)", "Blackrock (EUR)", "Both shops (EUR)", "Basis"], rows);
    set(st => toast(log(st, "Downloaded the October management summary (CSV)."), "Downloaded management summary (demo CSV)."));
  },
};

/* ── Memoised selectors (keyed on the invoices array) ─────────────────────── */
function memo<R>(fn: (inv: Invoice[]) => R) {
  let key: Invoice[] | null = null, val: R;
  return (s: State): R => { if (s.invoices !== key) { key = s.invoices; val = fn(key); } return val; };
}
export const accountOf = (cat: string) => CATEGORIES.find(c => c.id === cat)?.account ?? "";

export const approvedInvoices = memo(inv => inv.filter(i => i.status === "approved"));
export type LineRow = { inv: Invoice; line: Line };
export const approvedLines = memo(inv => inv.filter(i => i.status === "approved").flatMap(i => i.lines.map(line => ({ inv: i, line }))));

export const counts = memo(inv => ({
  total: inv.length,
  reviewed: inv.filter(i => i.status === "approved").length,
  attention: inv.filter(i => i.status === "attention").length,
  excluded: inv.filter(i => i.status === "excluded").length,
  receipts: inv.filter(i => i.kind === "receipt").length,
  receiptsOpen: inv.filter(i => i.kind === "receipt" && i.status === "attention").length,
  suppliersOpen: inv.filter(i => i.kind === "supplier" && i.status === "attention").length,
}));

const sumBy = (rows: LineRow[], loc: Scope) => rows.filter(r => loc === "ALL" || r.inv.loc === loc).reduce((a, r) => a + lineTotal(r.line), 0);
export const spendTotals = memo(inv => {
  const rows = inv.filter(i => i.status === "approved").flatMap(i => i.lines.map(line => ({ inv: i, line })));
  return { BAG: sumBy(rows, "BAG"), BLK: sumBy(rows, "BLK"), ALL: sumBy(rows, "ALL") };
});
export const pending = memo(inv => {
  const open = inv.filter(i => i.status === "attention");
  /* A pending duplicate would double count, so its value is not shown as missing spend. */
  const val = (l: Scope) => open.filter(i => i.issue !== "duplicate" && (l === "ALL" || (i.loc ?? i.suggestLoc) === l)).reduce((a, i) => a + correctedTotal(i), 0);
  const cnt = (l: Scope) => open.filter(i => l === "ALL" || (i.loc ?? i.suggestLoc) === l).length;
  return { BAG: { count: cnt("BAG"), value: val("BAG") }, BLK: { count: cnt("BLK"), value: val("BLK") }, ALL: { count: open.length, value: val("ALL") } };
});
/* What an invoice is worth once its suggested correction is applied. */
export const correctedTotal = (i: Invoice) => i.lines.reduce((a, l) => a + Math.round((l.suggest ? l.suggest.qty : l.qty) * l.unitPrice), 0);

export const categoryRows = memo(inv => {
  const rows = inv.filter(i => i.status === "approved").flatMap(i => i.lines.map(line => ({ inv: i, line })));
  return CATEGORIES.map(c => {
    const r = rows.filter(x => x.line.cat === c.id);
    return { id: c.id, name: c.name, account: c.account, BAG: sumBy(r, "BAG"), BLK: sumBy(r, "BLK"), total: sumBy(r, "ALL") };
  });
});

export type IngRow = { id: string; name: string; unit: string; qty: number; spend: number; price: number | null; prior: number; change: number | null;
  BAG: { qty: number; spend: number }; BLK: { qty: number; spend: number }; lines: LineRow[]; pendingQty: number; pendingInv: string[] };
export const ingredientRows = memo(inv => {
  const rows = inv.filter(i => i.status === "approved").flatMap(i => i.lines.map(line => ({ inv: i, line })));
  return INGREDIENTS.map((g): IngRow => {
    const lines = rows.filter(r => r.line.ing === g.id).sort((a, b) => a.inv.date.localeCompare(b.inv.date));
    const qty = lines.reduce((a, r) => a + r.line.qty, 0), spend = lines.reduce((a, r) => a + lineTotal(r.line), 0);
    const part = (l: LocId) => { const x = lines.filter(r => r.inv.loc === l); return { qty: x.reduce((a, r) => a + r.line.qty, 0), spend: x.reduce((a, r) => a + lineTotal(r.line), 0) }; };
    const price = qty ? Math.round(spend / qty) : null;
    const open = inv.filter(i => i.status === "attention" && i.issue !== "duplicate" && i.lines.some(l => l.ing === g.id));
    return { id: g.id, name: g.name, unit: g.unit, qty, spend, price, prior: g.prior, change: price === null ? null : (price - g.prior) / g.prior,
      BAG: part("BAG"), BLK: part("BLK"), lines, pendingQty: open.reduce((a, i) => a + i.lines.filter(l => l.ing === g.id).reduce((b, l) => b + (l.suggest ? l.suggest.qty : l.qty), 0), 0), pendingInv: open.map(i => i.id) };
  });
});
export const avocado = (s: State) => ingredientRows(s).find(r => r.id === "AVO")!;
/* Ingredients whose October price moved 5% or more against September. */
export const priceAlerts = (s: State) => ingredientRows(s).filter(r => r.change !== null && Math.abs(r.change) >= 0.05).sort((a, b) => Math.abs(b.change!) - Math.abs(a.change!));

/* ── Money & Reports ──────────────────────────────────────────────────────── */
export type MonthRow = { ym: string; loc: Scope; sales: number | null; spend: number | null; labour: number | null; other: number | null; profit: number | null;
  missing: string[]; pendingCount: number; pendingValue: number; status: "complete" | "provisional" | "incomplete"; statusLabel: string };
const pick = (src: Record<string, Record<LocId, number | null>>, ym: string, loc: Scope): number | null => {
  const r = src[ym]; if (!r) return null;
  if (loc !== "ALL") return r[loc];
  return r.BAG === null || r.BLK === null ? null : r.BAG + r.BLK;
};
export function monthRow(s: State, ym: string, loc: Scope): MonthRow {
  const live = ym === PACK_MONTH.ym;
  const sales = pick(SALES, ym, loc);
  const spend = live ? spendTotals(s)[loc] : pick(HIST_SPEND, ym, loc);
  const labour = pick(LABOUR, ym, loc), other = pick(OTHER, ym, loc);
  const missing: string[] = [];
  if (sales === null) missing.push("Square sales not imported");
  if (spend === null) missing.push("Supplier invoices before August were not part of the onboarding import");
  if (labour === null) missing.push("Labour cost not entered");
  if (other === null) missing.push("Other expenses not entered");
  const p = live ? pending(s)[loc] : { count: 0, value: 0 };
  const profit = missing.length ? null : sales! - spend! - labour! - other!;
  const status = missing.length ? "incomplete" : p.count ? "provisional" : "complete";
  const statusLabel = status === "incomplete" ? "Data incomplete" : status === "provisional" ? "Provisional: " + p.count + (p.count === 1 ? " invoice" : " invoices") + " awaiting review" : "All inputs in";
  return { ym, loc, sales, spend, labour, other, profit, missing, pendingCount: p.count, pendingValue: p.value, status, statusLabel };
}
export const monthSeries = (s: State, loc: Scope) => MONTHS.map(mo => ({ ...monthRow(s, mo.ym, loc), short: mo.short, label: mo.label }));

/* ── Accountant Pack ──────────────────────────────────────────────────────── */
export type CheckItem = { id: string; label: string; detail: string; done: boolean; go?: () => void; goLabel?: string };
export function packChecklist(s: State): CheckItem[] {
  const c = counts(s);
  const supplierTotal = s.invoices.filter(i => i.kind === "supplier").length;
  const receiptTotal = c.receipts;
  const missingBills = EXPECTED_BILLS;
  return [
    { id: "sales", label: "Square sales imported", detail: "October CSV import for Baggot Street and Blackrock (demo import, 3 Nov).", done: true, go: () => fin.go("Money", "Overview"), goLabel: "View" },
    { id: "bills", label: "Supplier bills reviewed", detail: (supplierTotal - c.suppliersOpen) + " of " + supplierTotal + " reviewed" + (c.suppliersOpen ? ", " + c.suppliersOpen + " need a decision." : "."), done: c.suppliersOpen === 0, go: () => fin.go("Invoices", c.suppliersOpen ? "Needs review" : "All invoices"), goLabel: c.suppliersOpen ? "Review" : "View" },
    { id: "receipts", label: "Staff receipts reviewed", detail: (receiptTotal - c.receiptsOpen) + " of " + receiptTotal + " reviewed" + (c.receiptsOpen ? ", " + c.receiptsOpen + " needs a category." : "."), done: c.receiptsOpen === 0, go: () => fin.go("Invoices", "Staff receipts"), goLabel: c.receiptsOpen ? "Review" : "View" },
    { id: "labour", label: "Labour entered for both shops", detail: "Entered by David on 5 Nov.", done: true },
    { id: "other", label: "Other expenses entered", detail: "Rent, utilities, card fees and insurance for both shops.", done: true },
    ...missingBills.map(b => ({ id: b.id, label: "Expected bill: " + b.label, detail: "Not received yet. Forward it to the invoice inbox when it arrives; the pack notes it as missing until then.", done: false })),
  ];
}
export const packProgress = (s: State) => { const l = packChecklist(s); return { done: l.filter(i => i.done).length, total: l.length }; };

/* ── Home briefing: today's three actions ─────────────────────────────────── */
export type BriefItem = { id: string; title: string; why: string; tone: "warn" | "accent" | "ok"; go: () => void };
export function brief(s: State): BriefItem[] {
  const c = counts(s), a = avocado(s), oct = monthRow(s, PACK_MONTH.ym, "ALL");
  const pct = a.change === null ? "" : Math.round(a.change * 100) + "%";
  return [
    c.attention
      ? { id: "inv", title: c.attention + (c.attention === 1 ? " invoice needs" : " supplier invoices need") + " checking", why: "Before the October accountant pack can go out.", tone: "warn", go: () => fin.go("Invoices", "Needs review") }
      : { id: "inv", title: "Every October invoice is checked", why: "The accountant pack is ready to export.", tone: "ok", go: () => fin.go("Pack", "Checklist") },
    { id: "avo", title: "Avocado price rose " + pct, why: eurS(a.prior) + " to " + eurS(a.price ?? 0) + " each from Green Basket Produce.", tone: "accent", go: () => fin.focusIngredient("AVO") },
    { id: "money", title: "Your October money summary is ready", why: oct.status === "complete" ? "Indicative P&L for both shops, all inputs in." : "Indicative P&L for both shops. " + oct.pendingCount + " invoices still to review.", tone: "accent", go: () => fin.go("Money", "Overview") },
  ];
}

/* ── Search across the demo records ───────────────────────────────────────── */
export function searchFin(q: string) {
  const t = q.toLowerCase().trim();
  if (!t) return [];
  const out: { kind: string; id: string; label: string; sub: string; go: () => void }[] = [];
  state.invoices.forEach(i => { if ((i.id + " " + supplierName(i.supplier) + " " + i.lines.map(l => l.desc).join(" ")).toLowerCase().includes(t)) out.push({ kind: "invoice", id: i.id, label: i.id, sub: supplierName(i.supplier) + " · " + eurS(invoiceTotal(i)), go: () => fin.openInvoice(i.id) }); });
  INGREDIENTS.forEach(g => { if (g.name.toLowerCase().includes(t)) out.push({ kind: "ingredient", id: g.id, label: g.name, sub: "Ingredient costs", go: () => fin.focusIngredient(g.id) }); });
  LOCS.forEach(l => { if (l.name.toLowerCase().includes(t)) out.push({ kind: "location", id: l.id, label: l.name, sub: "Money & Reports", go: () => { fin.setLoc(l.id); fin.go("Money", "Overview"); } }); });
  return out.slice(0, 8);
}

export { ingredient, catName, locName, supplierName, invoiceTotal, lineTotal, MONTHS, PACK_MONTH };
