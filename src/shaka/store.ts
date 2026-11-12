/* Shaka Poké demo store: one shared, local, deterministic state.
   Pages subscribe with useShaka(); PulseLogic subscribes too, so badges, the
   Home rail and notifications move with every approval. Nothing leaves the browser. */
import { useSyncExternalStore } from "react";
import {
  INBOX_SEED, SETTLEMENTS_SEED, STOCK_SEED, TRANSFER_SEED, PO_SEED, INGREDIENTS, RECIPES, CORPORATE, ORDERS, SHIFTS, OVERHEADS,
  BACKFILL, PURCHASES, CHANNELS, LOCATIONS, SUPPLIERS, PEOPLE, ROSTER_PROPOSAL, STOCK_BRIDGE, recipeCost, ingredient, invoiceNet, supplierName, person,
  type Invoice, type Settlement, type StockRow, type Transfer, type PO, type LocId, type ChannelId,
} from "./model";
import { eur, eur2, words, stamp, downloadCSV, centsCSV, qtyU } from "./format";

export type Activity = { id: string; ts: number; actor: string; actorKind: "staff" | "agent" | "system"; loc: LocId | "ALL"; type: string; entity: string; entityKind: string; text: string; demoImport?: boolean };
export type TaskStatus = "Open" | "In progress" | "Done";
export type Task = { id: string; title: string; owner: string; due: string; dueSort: string; priority: "High" | "Medium" | "Low"; dept: string; status: TaskStatus; related: { kind: string; id: string; label: string }; story: string; auto?: string };
export type AgentRun = { id: string; ts: number; status: "ok" | "needs review"; summary: string; findings: string[] };
export type Drawer = { kind: string; id: string } | null;
export type Prep = { steps: Record<string, boolean>; overrides: Record<string, { qty: number; reason: string }>; forecastOverride: { value: number; reason: string } | null; dietaryReviewed: boolean; completed: boolean };

export type State = {
  inbox: Invoice[];
  settlements: Settlement[];
  settlementNotes: Record<string, string>;
  costChange: { status: "pending" | "approved" | "rejected"; decidedAt?: number };
  prices: Record<string, number>;
  stock: StockRow[];
  transfers: Transfer[];
  prep: Prep;
  pos: PO[];
  roster: { status: "proposed" | "approved" | "declined"; decidedAt?: number };
  tasks: Task[];
  activity: Activity[];
  runs: Record<string, AgentRun[]>;
  plan: { fixed: number; cm: number };
  backfillRequested: Record<string, boolean>;
  ui: { tabs: Record<string, string>; drawer: Drawer; toast: { text: string; n: number } | null };
};

const T = (iso: string) => Date.parse(iso + ":00Z"); // Dublin is UTC+0 in November

/* ── Seeds ────────────────────────────────────────────────────────────────── */
const ACTIVITY_SEED: Omit<Activity, "id">[] = [
  { ts: T("2026-11-10T06:00"), actor: "Square POS", actorKind: "system", loc: "ALL", type: "Import", entity: "October orders", entityKind: "orders", text: "Demo import: October sales and orders read from Square (simulated, read-only).", demoImport: true },
  { ts: T("2026-11-10T06:02"), actor: "Stream (name to confirm)", actorKind: "system", loc: "ALL", type: "Import", entity: "Marketplace orders", entityKind: "orders", text: "Demo import: marketplace order IDs mapped to Square references; duplicates skipped by original channel order ID.", demoImport: true },
  { ts: T("2026-11-10T09:20"), actor: "Finance Agent", actorKind: "agent", loc: "BLK", type: "Extraction", entity: "INV-CAT-7781", entityKind: "invoice", text: "Invoice extracted, awaiting review: tax field unreadable and site not stated." },
  { ts: T("2026-11-10T11:48"), actor: "Finance Agent", actorKind: "agent", loc: "BAG", type: "Duplicate", entity: "INV-GBP-115B", entityKind: "invoice", text: "Suspected duplicate of INV-GBP-115. Held out of payables until cleared." },
  { ts: T("2026-11-10T15:02"), actor: "Finance Agent", actorKind: "agent", loc: "BLK", type: "Extraction", entity: "RCT-TES-0419", entityKind: "invoice", text: "Receipt photo extracted, awaiting review: spinach quantity and unit unclear." },
  { ts: T("2026-11-10T16:40"), actor: "Aoife Byrne", actorKind: "staff", loc: "BAG", type: "Stock", entity: "WST-301", entityKind: "waste", text: "Logged 3.2 kg cooked rice overproduction at close." },
  { ts: T("2026-11-11T07:40"), actor: "Finance Agent", actorKind: "agent", loc: "BAG", type: "Extraction", entity: "INV-HFF-2231", entityKind: "invoice", text: "Invoice extracted, awaiting review: salmon line read as 1.2 box." },
  { ts: T("2026-11-11T08:12"), actor: "Finance Agent", actorKind: "agent", loc: "BAG", type: "Extraction", entity: "INV-AVO-118", entityKind: "invoice", text: "Green Basket Produce invoice extracted: 100 avocados at €1.32." },
  { ts: T("2026-11-11T08:14"), actor: "Ingredient Cost Agent", actorKind: "agent", loc: "ALL", type: "Cost alert", entity: "CC-AVO-118", entityKind: "costChange", text: "Avocado unit cost up from €1.10 to €1.32 (+20%). Salmon bowl ingredient cost would move €3.60 to €3.71. Awaiting approval." },
  { ts: T("2026-11-11T09:00"), actor: "Ingredient Cost Agent", actorKind: "agent", loc: "BAG", type: "Purchase draft", entity: "PO-2041", entityKind: "po", text: "Drafted PO-2041 for 120 avocados at the new price. Needs approval; nothing sent." },
  { ts: T("2026-11-11T10:05"), actor: "Finance Agent", actorKind: "agent", loc: "BAG", type: "Duplicate", entity: "INV-CAT-7779B", entityKind: "invoice", text: "Suspected duplicate of INV-CAT-7779 (paper copy scanned after PDF)." },
  { ts: T("2026-11-11T11:30"), actor: "Channel Margin Agent", actorKind: "agent", loc: "BAG", type: "Settlement gap", entity: "SET-DEL-1106", entityKind: "settlement", text: "Settlement gap detected: expected €1,260, bank receipt €1,134, difference €126. Marked Investigate, not classified as loss." },
  { ts: T("2026-11-11T14:10"), actor: "Conor Walsh", actorKind: "staff", loc: "BLK", type: "Purchasing", entity: "PO-2040", entityKind: "po", text: "Recorded partial delivery: spinach 7 kg of 10 kg." },
  { ts: T("2026-11-11T16:00"), actor: "Labour Watch", actorKind: "agent", loc: "BLK", type: "Roster scenario", entity: "RST-PROP-BLK-46", entityKind: "roster", text: "Optional Blackrock roster scenario: four low-demand hours, €64 a week at an illustrative €16/h. Manager approval required." },
  { ts: T("2026-11-12T06:00"), actor: "Square Teams", actorKind: "system", loc: "ALL", type: "Import", entity: "Week roster", entityKind: "roster", text: "Demo import: roster for 9 to 15 November read from Square Teams (simulated, read-only).", demoImport: true },
  { ts: T("2026-11-12T07:00"), actor: "Lunch Team", actorKind: "system", loc: "BAG", type: "Import", entity: "COR-1113", entityKind: "corporate", text: "Demo import: 48-bowl order for Harbour Office Team, Friday 12:15 at Baggot Street.", demoImport: true },
  { ts: T("2026-11-12T07:05"), actor: "Prep Planner", actorKind: "agent", loc: "BAG", type: "Prep plan", entity: "COR-1113", entityKind: "corporate", text: "Prep list drafted for COR-1113: 1.6 kg salmon and 8 avocados for the salmon bowls. Dietary note sent for manager review." },
  { ts: T("2026-11-12T07:30"), actor: "Stock Transfer Agent", actorKind: "agent", loc: "BAG", type: "Transfer", entity: "TRF-1113", entityKind: "transfer", text: "Proposed Friday transfer TRF-1113: 2 kg salmon and 3 kg pineapple salsa to Blackrock (€66 carrying value)." },
  { ts: T("2026-11-12T08:00"), actor: "Briefing", actorKind: "agent", loc: "ALL", type: "Briefing", entity: "Morning briefing", entityKind: "agent", text: "Morning briefing posted to Home." },
];

const TASK_SEED: Task[] = [
  { id: "T-101", title: "Review five invoice exceptions (FIN-112)", owner: "P-DAVID", due: "Fri 13 Nov, 17:00", dueSort: "2026-11-13T17:00", priority: "High", dept: "Finance", status: "In progress", related: { kind: "inbox", id: "FIN-112", label: "FIN-112 invoice batch" }, story: "A", auto: "exceptions" },
  { id: "T-102", title: "Approve avocado cost update CC-AVO-118", owner: "P-DAVID", due: "Fri 13 Nov, 12:00", dueSort: "2026-11-13T12:00", priority: "Medium", dept: "Finance", status: "Open", related: { kind: "costChange", id: "CC-AVO-118", label: "CC-AVO-118" }, story: "B", auto: "cost" },
  { id: "T-103", title: "Check Deliveroo adjustment statement", owner: "P-DAVID", due: "Mon 16 Nov, 12:00", dueSort: "2026-11-16T12:00", priority: "Medium", dept: "Finance", status: "Open", related: { kind: "settlement", id: "SET-DEL-1106", label: "SET-DEL-1106" }, story: "C", auto: "settlement" },
  { id: "T-104", title: "Dispatch TRF-1113 to Blackrock", owner: "P-AOIFE", due: "Fri 13 Nov, 15:30", dueSort: "2026-11-13T15:30", priority: "High", dept: "Store Operations", status: "Open", related: { kind: "transfer", id: "TRF-1113", label: "TRF-1113" }, story: "D", auto: "dispatch" },
  { id: "T-105", title: "Receive TRF-1113 at Blackrock and confirm quantities", owner: "P-CONOR", due: "Fri 13 Nov, 16:30", dueSort: "2026-11-13T16:30", priority: "High", dept: "Store Operations", status: "Open", related: { kind: "transfer", id: "TRF-1113", label: "TRF-1113" }, story: "D", auto: "receive" },
  { id: "T-106", title: "Review optional Blackrock roster proposal", owner: "P-CONOR", due: "Mon 16 Nov, 10:00", dueSort: "2026-11-16T10:00", priority: "Low", dept: "Store Operations", status: "Open", related: { kind: "roster", id: "RST-PROP-BLK-46", label: "RST-PROP-BLK-46" }, story: "E", auto: "roster" },
  { id: "T-107", title: "Prep 48 bowls for COR-1113", owner: "P-SOFIA", due: "Fri 13 Nov, 11:30", dueSort: "2026-11-13T11:30", priority: "High", dept: "Kitchen", status: "Open", related: { kind: "corporate", id: "COR-1113", label: "COR-1113" }, story: "F", auto: "prep" },
  { id: "T-108", title: "Manager review of COR-1113 dietary note", owner: "P-AOIFE", due: "Fri 13 Nov, 10:00", dueSort: "2026-11-13T10:00", priority: "High", dept: "Kitchen", status: "Open", related: { kind: "corporate", id: "COR-1113", label: "COR-1113" }, story: "F", auto: "dietary" },
  { id: "T-109", title: "Resolve 24 backfill exceptions, April to September", owner: "P-DAVID", due: "Fri 27 Nov, 17:00", dueSort: "2026-11-27T17:00", priority: "Medium", dept: "Finance", status: "Open", related: { kind: "backfill", id: "BACKFILL", label: "Accountant pack" }, story: "Backfill" },
];

const prices0 = () => Object.fromEntries(INGREDIENTS.map(i => [i.id, i.octCost])) as Record<string, number>;
const clone = <X,>(x: X): X => JSON.parse(JSON.stringify(x));

function initial(): State {
  return {
    inbox: clone(INBOX_SEED),
    settlements: clone(SETTLEMENTS_SEED),
    settlementNotes: {},
    costChange: { status: "pending" },
    prices: prices0(),
    stock: clone(STOCK_SEED),
    transfers: clone(TRANSFER_SEED),
    prep: { steps: {}, overrides: {}, forecastOverride: null, dietaryReviewed: false, completed: false },
    pos: clone(PO_SEED),
    roster: { status: "proposed" },
    tasks: clone(TASK_SEED),
    activity: ACTIVITY_SEED.map((a, i) => ({ ...a, id: "ACT-" + (i + 1) })).sort((a, b) => b.ts - a.ts),
    runs: {},
    plan: { fixed: 1200000, cm: 0.35 },
    backfillRequested: {},
    ui: { tabs: {}, drawer: null, toast: null },
  };
}

/* ── Store core ───────────────────────────────────────────────────────────── */
let state: State = initial();
const subs = new Set<() => void>();
let actN = 1000;
const emit = () => subs.forEach(f => { try { f(); } catch { /* one bad subscriber must not stop the rest */ } });
const set = (fn: (s: State) => Partial<State>) => { state = { ...state, ...fn(state) }; emit(); };
export const getState = () => state;
export const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export function useShaka(): State { return useSyncExternalStore(subscribe, getState, getState); }

let navigator: ((page: string) => void) | null = null;
let agentSelector: ((id: string) => void) | null = null;
export const bindNavigator = (fn: (page: string) => void, selectAgent?: (id: string) => void) => { navigator = fn; agentSelector = selectAgent ?? null; };

const log = (a: Omit<Activity, "id" | "ts"> & { ts?: number }) => {
  const entry: Activity = { ...a, id: "ACT-" + (++actN), ts: a.ts ?? Date.now() };
  return entry;
};
const push = (s: State, ...entries: Activity[]) => [...entries, ...s.activity];
let toastN = 0;

/* ── Actions ──────────────────────────────────────────────────────────────── */
export const act = {
  reset() { state = initial(); emit(); act.toast("Demo reset to the starting dataset"); },
  setTab(page: string, tab: string) { set(s => ({ ui: { ...s.ui, tabs: { ...s.ui.tabs, [page]: tab } } })); },
  go(page: string, tab?: string) {
    if (tab) set(s => ({ ui: { ...s.ui, drawer: null, tabs: { ...s.ui.tabs, [page]: tab } } }));
    else set(s => ({ ui: { ...s.ui, drawer: null } }));
    navigator?.(page);
  },
  setAgentFocus(id: string) { agentSelector?.(id); },
  open(kind: string, id: string) { set(s => ({ ui: { ...s.ui, drawer: { kind, id } } })); },
  close() { set(s => ({ ui: { ...s.ui, drawer: null } })); },
  toast(text: string) {
    const n = ++toastN;
    set(s => ({ ui: { ...s.ui, toast: { text, n } } }));
    setTimeout(() => { if (state.ui.toast?.n === n) set(s => ({ ui: { ...s.ui, toast: null } })); }, 3200);
  },

  /* Story A: invoices */
  editLine(invId: string, lineId: string, patch: { qty?: number; unit?: string; unitCost?: number }) {
    set(s => ({ inbox: s.inbox.map(inv => inv.id !== invId ? inv : { ...inv, lines: inv.lines.map(l => l.id !== lineId ? l : { ...l, ...patch, conf: 1, flag: undefined }) }) }));
  },
  setInvoiceField(invId: string, patch: Partial<Invoice>) { set(s => ({ inbox: s.inbox.map(inv => inv.id === invId ? { ...inv, ...patch } : inv) })); },
  markReviewed(invId: string) {
    const inv = state.inbox.find(i => i.id === invId);
    if (!inv) return;
    set(s => ({
      inbox: s.inbox.map(i => i.id === invId ? { ...i, status: "reviewed", conf: 1, issue: undefined, lines: i.lines.map(l => ({ ...l, flag: undefined })) } : i),
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: inv.loc, type: "Review", entity: invId, entityKind: "invoice", text: "Corrected and marked reviewed. Ready for the accountant export (" + eur2(invoiceNet({ ...inv, lines: inv.lines })) + " net)." })),
    }));
    act.toast(invId + " marked reviewed");
  },
  confirmDuplicate(invId: string) {
    const inv = state.inbox.find(i => i.id === invId);
    if (!inv) return;
    set(s => ({
      inbox: s.inbox.map(i => i.id === invId ? { ...i, status: "archived" } : i),
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: inv.loc, type: "Duplicate cleared", entity: invId, entityKind: "invoice", text: "Confirmed duplicate of " + inv.dupOf + ". Archived; never becomes a payable." })),
    }));
    act.toast(invId + " archived as a duplicate");
  },
  notDuplicate(invId: string) {
    const inv = state.inbox.find(i => i.id === invId);
    if (!inv) return;
    set(s => ({
      inbox: s.inbox.map(i => i.id === invId ? { ...i, status: "reviewed", dupOf: undefined, issue: undefined } : i),
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: inv.loc, type: "Review", entity: invId, entityKind: "invoice", text: "Not a duplicate. Marked reviewed." })),
    }));
    act.toast(invId + " kept and marked reviewed");
  },
  exportReady() {
    const rows = state.inbox.filter(i => i.status === "ready" || i.status === "reviewed");
    if (!rows.length) { act.toast("Nothing ready to export"); return; }
    downloadCSV("shaka-poke-demo-xero-draft-nov-2026.csv", ["Document", "Supplier", "Date", "Site", "Line", "Ingredient", "Quantity", "Unit", "Unit cost EUR", "Net EUR", "Tax (draft)"],
      rows.flatMap(i => i.lines.map(l => [i.id, supplierName(i.supplier), i.date, i.loc, l.desc, ingredient(l.ing)?.name ?? l.ing, l.qty, l.unit, centsCSV(l.unitCost), centsCSV(Math.round(l.qty * l.unitCost)), i.taxField])));
    set(s => ({
      inbox: s.inbox.map(i => (i.status === "ready" || i.status === "reviewed") ? { ...i, status: "exported" } : i),
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: "ALL", type: "Export", entity: "Xero draft export", entityKind: "inbox", text: "Simulated export of " + rows.length + " reviewed documents to a Xero draft CSV. Nothing posted, filed or paid." })),
    }));
    act.toast(rows.length + " documents exported to a demo CSV");
  },

  /* Story B: avocado */
  approveCost() {
    if (state.costChange.status !== "pending") return;
    set(s => ({
      costChange: { status: "approved", decidedAt: Date.now() },
      prices: { ...s.prices, "ING-AVO": 132 },
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: "ALL", type: "Cost update approved", entity: "CC-AVO-118", entityKind: "costChange", text: "Avocado cost update approved. Current November recipe valuation: salmon bowl €3.71, tofu bowl €2.17. October history unchanged." })),
    }));
    act.toast("Cost update approved; November recipe valuation updated");
  },
  rejectCost() {
    if (state.costChange.status !== "pending") return;
    set(s => ({ costChange: { status: "rejected", decidedAt: Date.now() },
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: "ALL", type: "Cost update declined", entity: "CC-AVO-118", entityKind: "costChange", text: "Avocado cost update declined. Recipes stay at the €1.10 valuation until the next invoice." })) }));
    act.toast("Cost update declined");
  },

  /* Story C: settlement */
  explainSettlement(id: string, note: string) {
    if (!note.trim()) { act.toast("Add a note explaining the difference first"); return; }
    set(s => ({
      settlements: s.settlements.map(x => x.id === id ? { ...x, status: "resolved" } : x),
      settlementNotes: { ...s.settlementNotes, [id]: note.trim() },
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: "BAG", type: "Settlement reviewed", entity: id, entityKind: "settlement", text: "Difference explained: " + note.trim() + ". P&L unchanged; any adjustment is reviewed separately." })),
    }));
    act.toast(id + " marked explained");
  },

  /* Story D: transfer */
  dispatch(id: string) {
    const t = state.transfers.find(x => x.id === id);
    if (!t || t.status !== "scheduled") return;
    for (const it of t.items) {
      const row = state.stock.find(r => r.item === it.item && r.loc === t.from);
      if (!row || row.onHand < it.qty) { act.toast("Not enough " + (ingredient(it.item)?.name ?? it.item) + " at origin to dispatch"); return; }
    }
    set(s => ({
      stock: s.stock.map(r => { const it = t.items.find(i => i.item === r.item); return it && r.loc === t.from ? { ...r, onHand: +(r.onHand - it.qty).toFixed(3) } : r; }),
      transfers: s.transfers.map(x => x.id === id ? { ...x, status: "dispatched", dispatchedAt: stamp(Date.now()) } : x),
      activity: push(s, log({ actor: "Aoife Byrne", actorKind: "staff", loc: t.from, type: "Transfer dispatched", entity: id, entityKind: "transfer", text: "Dispatched to " + (LOCATIONS.find(l => l.id === t.to)?.name) + ": " + t.items.map(i => qtyU(i.qty, ingredient(i.item)?.unit ?? "") + " " + ingredient(i.item)?.name?.toLowerCase()).join(", ") + ". Now in transit with David." })),
    }));
    act.toast(id + " dispatched; stock now in transit");
  },
  receive(id: string) {
    const t = state.transfers.find(x => x.id === id);
    if (!t || t.status !== "dispatched") return;
    set(s => ({
      stock: s.stock.map(r => { const it = t.items.find(i => i.item === r.item); return it && r.loc === t.to ? { ...r, onHand: +(r.onHand + it.qty).toFixed(3) } : r; }),
      transfers: s.transfers.map(x => x.id === id ? { ...x, status: "received", receivedAt: stamp(Date.now()) } : x),
      activity: push(s, log({ actor: "Conor Walsh", actorKind: "staff", loc: t.to, type: "Transfer received", entity: id, entityKind: "transfer", text: "Received in full at " + (LOCATIONS.find(l => l.id === t.to)?.name) + ". In transit back to zero; group stock value unchanged." })),
    }));
    act.toast(id + " received at destination");
  },

  /* Story F: prep */
  toggleStep(step: string) { set(s => ({ prep: { ...s.prep, steps: { ...s.prep.steps, [step]: !s.prep.steps[step] } } })); },
  setOverride(ing: string, qty: number, reason: string) { set(s => ({ prep: { ...s.prep, overrides: { ...s.prep.overrides, [ing]: { qty, reason } } } })); },
  clearOverride(ing: string) { set(s => { const o = { ...s.prep.overrides }; delete o[ing]; return { prep: { ...s.prep, overrides: o } }; }); },
  setForecastOverride(value: number | null, reason: string) {
    if (value !== null && !reason.trim()) { act.toast("Give a reason for the manager override"); return; }
    set(s => ({ prep: { ...s.prep, forecastOverride: value === null ? null : { value, reason: reason.trim() } },
      activity: value === null ? s.activity : push(s, log({ actor: "Aoife Byrne", actorKind: "staff", loc: "BAG", type: "Forecast override", entity: "Friday walk-in forecast", entityKind: "prep", text: "Walk-in baseline overridden to " + value + " bowls: " + reason.trim() })) }));
  },
  reviewDietary() {
    set(s => ({ prep: { ...s.prep, dietaryReviewed: true },
      activity: push(s, log({ actor: "Aoife Byrne", actorKind: "staff", loc: "BAG", type: "Dietary review", entity: "COR-1113", entityKind: "corporate", text: "Manager reviewed the COR-1113 dietary note and confirmed handling with the customer." })) }));
  },
  completePrep() {
    if (!state.prep.dietaryReviewed) { act.toast("A manager must review the dietary note first"); return; }
    const needs = corporateNeeds().need;
    set(s => ({ prep: { ...s.prep, completed: true },
      // prepared bowls consume Baggot Street stock; never below zero
      stock: s.stock.map(r => r.loc === CORPORATE.loc && (s.prep.overrides[r.item]?.qty ?? needs[r.item]) ? { ...r, onHand: +Math.max(0, r.onHand - (s.prep.overrides[r.item]?.qty ?? needs[r.item])).toFixed(3) } : r),
      activity: push(s, log({ actor: "Sofia Costa", actorKind: "staff", loc: "BAG", type: "Prep completed", entity: "COR-1113", entityKind: "corporate", text: "Corporate prep completed: 48 bowls packed (24 chicken, 16 salmon, 8 tofu). Ingredients consumed from Baggot Street stock. Dispatch by Aoife for 12:15." })) }));
    act.toast("COR-1113 prep marked complete");
  },

  /* Purchasing */
  approvePO(id: string) {
    set(s => ({ pos: s.pos.map(p => p.id === id && p.status === "draft" ? { ...p, status: "ordered", note: "Approved by David. Simulated only: nothing was sent to the supplier." } : p),
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: "BAG", type: "Purchase approved", entity: id, entityKind: "po", text: "Purchase draft approved (simulated). No order sent from the demo." })) }));
    act.toast(id + " approved (simulated)");
  },
  receivePO(id: string) {
    const p = state.pos.find(x => x.id === id);
    if (!p) return;
    set(s => ({ pos: s.pos.map(x => x.id === id ? { ...x, status: "received", lines: x.lines.map(l => ({ ...l, received: l.qty })) } : x),
      stock: s.stock.map(r => { const l = p.lines.find(x => x.ing === r.item); return l && r.loc === p.loc ? { ...r, onHand: +(r.onHand + (l.qty - l.received)).toFixed(3) } : r; }),
      activity: push(s, log({ actor: p.loc === "BLK" ? "Conor Walsh" : "Aoife Byrne", actorKind: "staff", loc: p.loc, type: "Delivery received", entity: id, entityKind: "po", text: "Goods received against " + id + "; stock levels updated." })) }));
    act.toast(id + " received; stock updated");
  },

  /* Story E: roster */
  decideRoster(ok: boolean) {
    if (state.roster.status !== "proposed") return;
    set(s => ({ roster: { status: ok ? "approved" : "declined", decidedAt: Date.now() },
      activity: push(s, log({ actor: "Conor Walsh", actorKind: "staff", loc: "BLK", type: ok ? "Roster proposal approved" : "Roster proposal declined", entity: ROSTER_PROPOSAL.id, entityKind: "roster", text: ok
        ? "Manager approved the optional scenario for next week. Shifts must still be changed in Square Teams; no staff were notified from Pulse."
        : "Manager declined the optional scenario. Roster unchanged." })) }));
    act.toast(ok ? "Proposal approved; change shifts in Square Teams" : "Proposal declined");
  },

  /* Work */
  setTaskStatus(id: string, status: TaskStatus) {
    const t = state.tasks.find(x => x.id === id);
    set(s => ({ tasks: s.tasks.map(x => x.id === id ? { ...x, status } : x),
      activity: push(s, log({ actor: person(t?.owner ?? "")?.name ?? "David McParland", actorKind: "staff", loc: "ALL", type: "Task " + status.toLowerCase(), entity: id, entityKind: "task", text: (t?.title ?? id) + " set to " + status + "." })) }));
  },
  addTask(title: string, owner: string, dept: string, priority: Task["priority"]) {
    if (!title.trim()) return;
    const id = "T-" + (200 + state.tasks.length);
    set(s => ({ tasks: [{ id, title: title.trim(), owner, due: "No due date", dueSort: "9999", priority, dept, status: "Open", related: { kind: "none", id: "", label: "No related record" }, story: "Added" }, ...s.tasks],
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: "ALL", type: "Task created", entity: id, entityKind: "task", text: "Created task: " + title.trim() })) }));
    act.toast("Task " + id + " created");
  },
  requestReceipt(docId: string) {
    set(s => ({ backfillRequested: { ...s.backfillRequested, [docId]: true },
      activity: push(s, log({ actor: "David McParland", actorKind: "staff", loc: "ALL", type: "Evidence requested", entity: docId, entityKind: "backfill", text: "Flagged " + docId + " for evidence follow-up (no message sent from the demo)." })) }));
  },

  /* Agents */
  runAgent(id: string) {
    const f = agentFindings(id, state);
    const run: AgentRun = { id: "RUN-" + Date.now().toString(36).toUpperCase(), ts: Date.now(), status: f.needsReview ? "needs review" : "ok", summary: f.summary, findings: f.lines };
    const meta = AGENTS.find(a => a.id === id);
    set(s => ({ runs: { ...s.runs, [id]: [run, ...(s.runs[id] ?? [])] },
      activity: push(s, log({ actor: meta?.name ?? id, actorKind: "agent", loc: "ALL", type: "Simulated run", entity: run.id, entityKind: "agent", text: f.summary })) }));
    act.toast((meta?.name ?? id) + " ran (simulated)");
  },

  setPlan(fixed: number, cm: number) { set(() => ({ plan: { fixed: Math.max(0, fixed), cm: Math.min(0.95, Math.max(0.01, cm)) } })); },
};

/* ── Selectors ────────────────────────────────────────────────────────────── */
export type PnlRow = { sales: number; cogs: number; labour: number; fees: number; other: number; profit: number };
const zero = (): PnlRow => ({ sales: 0, cogs: 0, labour: 0, fees: 0, other: 0, profit: 0 });
let _pnl: Record<string, PnlRow> | null = null;
export function pnl(): Record<"BAG" | "BLK" | "TRK" | "ALL", PnlRow> {
  if (_pnl) return _pnl as Record<"BAG" | "BLK" | "TRK" | "ALL", PnlRow>;
  const out: Record<string, PnlRow> = { BAG: zero(), BLK: zero(), TRK: zero(), ALL: zero() };
  for (const o of ORDERS) { out[o.loc].sales += o.net; out[o.loc].cogs += o.cogs; out[o.loc].fees += o.fee; }
  for (const sh of SHIFTS) out[sh.loc].labour += sh.cost;
  for (const oh of OVERHEADS) out[oh.loc].other += oh.amount;
  for (const k of ["BAG", "BLK", "TRK"]) {
    const r = out[k];
    r.profit = r.sales - r.cogs - r.labour - r.fees - r.other;
    (Object.keys(r) as (keyof PnlRow)[]).forEach(f => { out.ALL[f] += r[f]; });
  }
  _pnl = out;
  return out as Record<"BAG" | "BLK" | "TRK" | "ALL", PnlRow>;
}
export const expenses = (r: PnlRow) => r.cogs + r.labour + r.fees + r.other;

export type ChannelRow = { id: ChannelId; name: string; group: string; orders: number; sales: number; fees: number; cogs: number; contribution: number; feeRate: number };
let _ch: ChannelRow[] | null = null;
export function channels(loc?: "BAG" | "BLK"): ChannelRow[] {
  if (!loc && _ch) return _ch;
  const rows = CHANNELS.map(c => ({ id: c.id, name: c.name, group: c.group, orders: 0, sales: 0, fees: 0, cogs: 0, contribution: 0, feeRate: c.feeRate }));
  for (const o of ORDERS) {
    if (loc && o.loc !== loc) continue;
    const r = rows.find(x => x.id === o.channel)!;
    r.orders++; r.sales += o.net; r.fees += o.fee; r.cogs += o.cogs;
  }
  rows.forEach(r => { r.contribution = r.sales - r.fees - r.cogs; });
  if (!loc) _ch = rows;
  return rows;
}
export const labourHours = (loc: LocId) => SHIFTS.filter(s => s.loc === loc).reduce((a, s) => a + s.hours, 0);
export const purchasesTotal = () => PURCHASES.reduce((a, p) => a + p.net, 0);
export const cogsBridge = () => ({ opening: STOCK_BRIDGE.opening, purchases: purchasesTotal(), closing: STOCK_BRIDGE.closing, cogs: STOCK_BRIDGE.opening + purchasesTotal() - STOCK_BRIDGE.closing });

export function inboxCounts(s: State) {
  const by = (st: string) => s.inbox.filter(i => i.status === st).length;
  const ready = by("ready") + by("reviewed");
  const review = by("review"), duplicate = by("duplicate"), archived = by("archived"), exported = by("exported");
  return { total: s.inbox.length, ready, review, duplicate, exceptions: review + duplicate, archived, exported, readyOrExported: ready + exported };
}
export function backfillCounts() {
  const c = { total: BACKFILL.length, matched: 0, missing: 0, ambiguous: 0 };
  BACKFILL.forEach(b => { c[b.status]++; });
  return c;
}

/* Avocado facts, derived from the invoice and the recipe, never typed in twice. */
export function avocado(s: State) {
  const inv = s.inbox.find(i => i.id === "INV-AVO-118")!;
  const line = inv.lines[0];
  const oldC = ingredient("ING-AVO")!.octCost, newC = line.unitCost;
  const salmon = RECIPES.find(r => r.id === "RCP-SALMON")!;
  const oldPrices = { ...s.prices, "ING-AVO": oldC }, newPrices = { ...s.prices, "ING-AVO": newC };
  const before = recipeCost(salmon, oldPrices), after = recipeCost(salmon, newPrices);
  const affected = RECIPES.filter(r => r.lines.some(l => l.ing === "ING-AVO")).map(r => ({ id: r.id, name: r.name, before: recipeCost(r, oldPrices), after: recipeCost(r, newPrices), price: r.price }));
  return { invoice: inv, qty: line.qty, oldC, newC, delta: newC - oldC, pct: (newC - oldC) / oldC, per100: (newC - oldC) * 100, lineTotal: Math.round(line.qty * newC),
    salmonBefore: before, salmonAfter: after, perBowl: after - before, price: salmon.price,
    contribBefore: salmon.price - before, contribAfter: salmon.price - after,
    contribPctBefore: (salmon.price - before) / salmon.price, contribPctAfter: (salmon.price - after) / salmon.price, affected, status: s.costChange.status };
}

/* Corporate order requirements from recipes. */
export function corporateNeeds() {
  const need: Record<string, number> = {};
  const bySalmon: Record<string, number> = {};
  CORPORATE.lines.forEach(([rid, n]) => {
    const r = RECIPES.find(x => x.id === rid)!;
    r.lines.forEach(l => {
      need[l.ing] = +((need[l.ing] ?? 0) + l.qty * n).toFixed(3);
      if (rid === "RCP-SALMON") bySalmon[l.ing] = +((bySalmon[l.ing] ?? 0) + l.qty * n).toFixed(3);
    });
  });
  const bowls = CORPORATE.lines.reduce((a, [, n]) => a + n, 0);
  return { need, bySalmon, bowls, value: bowls * CORPORATE.unitPrice };
}

/* Stock view: reservations for confirmed demand, in-transit and projected arrivals. */
export function stockView(s: State) {
  const needs = corporateNeeds().need;
  return s.stock.map(r => {
    const reservedWanted = r.loc === CORPORATE.loc && !s.prep.completed ? (s.prep.overrides[r.item]?.qty ?? needs[r.item] ?? 0) : 0;
    const reserved = Math.min(reservedWanted, r.onHand); // never reserve stock that is not there
    const shortfall = +(reservedWanted - reserved).toFixed(3);
    const inTransitOut = s.transfers.filter(t => t.status === "dispatched" && t.from === r.loc).reduce((a, t) => a + (t.items.find(i => i.item === r.item)?.qty ?? 0), 0);
    const incoming = s.transfers.filter(t => t.status !== "received" && t.to === r.loc).reduce((a, t) => a + (t.items.find(i => i.item === r.item)?.qty ?? 0), 0);
    const inTransit = s.transfers.filter(t => t.status === "dispatched" && t.to === r.loc).reduce((a, t) => a + (t.items.find(i => i.item === r.item)?.qty ?? 0), 0);
    return { ...r, reserved: +reserved.toFixed(3), shortfall, available: +(r.onHand - reserved).toFixed(3), inTransit, inTransitOut, incoming, low: r.onHand - reserved < r.par };
  });
}
export function transferTotals(t: Transfer) { return t.items.reduce((a, i) => a + Math.round(i.qty * i.unitCost), 0); }

/* Approvals: counted from live state by category. */
export type Approval = { id: string; category: "Invoice exception" | "Cost update" | "Purchase draft" | "Roster proposal"; title: string; detail: string; approver: string; pending: boolean; kind: string; recId: string; value: string };
export function approvals(s: State): Approval[] {
  const out: Approval[] = [];
  const flagged = new Set(INBOX_SEED.filter(x => x.status === "review" || x.status === "duplicate").map(x => x.id));
  s.inbox.filter(i => flagged.has(i.id)).forEach(i => {
    out.push({ id: "AP-" + i.id, category: "Invoice exception", title: (INBOX_SEED.find(x => x.id === i.id)?.status === "duplicate" ? "Suspected duplicate " : "Extraction review ") + i.id,
      detail: i.issue ?? (i.status === "archived" ? "Archived as duplicate" : "Reviewed"), approver: "P-DAVID", pending: i.status === "review" || i.status === "duplicate", kind: "invoice", recId: i.id, value: eur2(invoiceNet(i)) });
  });
  const a = avocado(s);
  out.push({ id: "AP-CC-AVO-118", category: "Cost update", title: "Avocado cost update CC-AVO-118", detail: "€1.10 to €1.32 (+20%). Salmon bowl " + eur2(a.salmonBefore) + " to " + eur2(a.salmonAfter) + ".", approver: "P-DAVID", pending: s.costChange.status === "pending", kind: "costChange", recId: "CC-AVO-118", value: "+" + eur2(a.perBowl) + "/bowl" });
  const po = s.pos.find(p => p.id === "PO-2041")!;
  out.push({ id: "AP-PO-2041", category: "Purchase draft", title: "Purchase draft PO-2041, Green Basket Produce", detail: po.lines.map(l => qtyU(l.qty, ingredient(l.ing)?.unit ?? "") + " " + ingredient(l.ing)?.name).join(", "), approver: "P-DAVID", pending: po.status === "draft", kind: "po", recId: "PO-2041", value: eur2(po.lines.reduce((x, l) => x + l.qty * l.unitCost, 0)) });
  out.push({ id: "AP-" + ROSTER_PROPOSAL.id, category: "Roster proposal", title: "Optional Blackrock roster scenario", detail: "Remove four low-demand hours next week. Manager decision.", approver: "P-CONOR", pending: s.roster.status === "proposed", kind: "roster", recId: ROSTER_PROPOSAL.id, value: eur(ROSTER_PROPOSAL.saving) + "/week" });
  return out;
}

/* Task status that follows the record it belongs to. */
export function taskStatus(t: Task, s: State): TaskStatus {
  const c = inboxCounts(s);
  const tr = s.transfers.find(x => x.id === "TRF-1113")!;
  const auto: Record<string, boolean> = {
    exceptions: c.exceptions === 0, cost: s.costChange.status !== "pending", settlement: s.settlements.find(x => x.id === "SET-DEL-1106")?.status === "resolved",
    dispatch: tr.status !== "scheduled", receive: tr.status === "received", roster: s.roster.status !== "proposed", prep: s.prep.completed, dietary: s.prep.dietaryReviewed,
  };
  if (t.auto && auto[t.auto]) return "Done";
  return t.status;
}
export function openTasks(s: State) { return s.tasks.filter(t => taskStatus(t, s) !== "Done"); }

/* What needs attention: Home rail, notifications and the Briefing agent all read this. */
export function attention(s: State) {
  const c = inboxCounts(s), a = avocado(s);
  const set = s.settlements.find(x => x.id === "SET-DEL-1106")!;
  const tr = s.transfers.find(x => x.id === "TRF-1113")!;
  const out: { id: string; title: string; why: string; tone: "warn" | "bad" | "ok" | "info"; go: () => void; age: string }[] = [];
  if (c.exceptions) out.push({ id: "fin", title: c.exceptions + " invoices need review", why: c.review + " extraction reviews, " + c.duplicate + " suspected duplicates (FIN-112)", tone: "warn", go: () => act.go("Finance", "Invoice Inbox"), age: "11 Nov" });
  if (a.status === "pending") out.push({ id: "avo", title: "Avocado up " + Math.round(a.pct * 100) + "%, salmon bowl +" + eur2(a.perBowl), why: "CC-AVO-118 waiting for approval. Ingredient cost only.", tone: "warn", go: () => act.go("Recipes", "Cost Changes"), age: "11 Nov" });
  if (set.status === "investigate") out.push({ id: "set", title: "Deliveroo payout " + eur(set.expected - (set.received ?? 0)) + " short", why: "SET-DEL-1106 to investigate. Not classified as loss.", tone: "bad", go: () => act.go("Finance", "Reconciliation"), age: "6 Nov" });
  if (!s.prep.completed) out.push({ id: "cor", title: "48-bowl corporate order, Fri 12:15", why: "COR-1113 Harbour Office Team via Lunch Team. Prep owner Sofia.", tone: "info", go: () => act.go("Stock", "Prep"), age: "Fri" });
  if (tr.status !== "received") out.push({ id: "trf", title: "Friday transfer to Blackrock, " + eur(transferTotals(tr)), why: "TRF-1113 " + tr.status + ". 2 kg salmon, 3 kg pineapple salsa.", tone: "info", go: () => act.go("Stock", "Transfers"), age: "Fri" });
  if (s.roster.status === "proposed") out.push({ id: "rst", title: "Optional Blackrock roster scenario", why: "Four hours, " + eur(ROSTER_PROPOSAL.saving) + " a week. Manager decision.", tone: "info", go: () => act.go("Team", "Labour"), age: "11 Nov" });
  return out;
}

export function briefingText(s: State) {
  const c = inboxCounts(s), a = avocado(s);
  const set = s.settlements.find(x => x.id === "SET-DEL-1106")!;
  const parts: string[] = [];
  parts.push(c.total + " invoices are in the inbox: " + c.ready + " ready" + (c.exported ? ", " + c.exported + " exported" : "") + " and " + words(c.exceptions) + (c.exceptions === 1 ? " needs" : " need") + " review.");
  parts.push("Avocado cost is up " + Math.round(a.pct * 100) + "%, adding " + eur2(a.perBowl) + " to the salmon bowl" + (a.status === "approved" ? " (approved into November costing)." : "."));
  parts.push(set.status === "investigate" ? "Deliveroo settlement SET-DEL-1106 has a " + eur(set.expected - (set.received ?? 0)) + " difference to investigate." : "Deliveroo settlement SET-DEL-1106 has been explained.");
  const n = corporateNeeds();
  parts.push(s.prep.completed ? "Tomorrow's " + n.bowls + "-bowl corporate order is prepped." : "Tomorrow's " + n.bowls + "-bowl corporate order is due at " + CORPORATE.time + ".");
  return parts.join(" ");
}

/* ── Agents ───────────────────────────────────────────────────────────────── */
export type AgentMeta = { id: string; name: string; shape: string; tint: string; purpose: string; sources: string[]; gates: string[]; links: { kind: string; id: string; label: string }[]; uncertainty: string; lastRun: string };
export const AGENTS: AgentMeta[] = [
  { id: "briefing", name: "Briefing", shape: "crown-pebble", tint: "#16233a", purpose: "Owner summary each morning with deep links to whatever needs a decision.",
    sources: ["Invoice inbox", "Cost changes", "Settlements", "Corporate orders", "Transfers"], gates: ["Read-only. Never changes a record."],
    links: [{ kind: "inbox", id: "FIN-112", label: "FIN-112" }, { kind: "costChange", id: "CC-AVO-118", label: "CC-AVO-118" }, { kind: "settlement", id: "SET-DEL-1106", label: "SET-DEL-1106" }, { kind: "corporate", id: "COR-1113", label: "COR-1113" }],
    uncertainty: "Summarises other agents' findings; inherits their uncertainty.", lastRun: "Thu 12 Nov 08:00 (simulated)" },
  { id: "ops", name: "Ops Watchdog", shape: "shield", tint: "#2b1b1e", purpose: "Watches incomplete prep, delayed deliveries, low stock and transfer exceptions.",
    sources: ["Stock levels", "Purchase orders", "Prep checklist", "Transfers"], gates: ["Raises tasks only; a manager decides."],
    links: [{ kind: "po", id: "PO-2040", label: "PO-2040" }, { kind: "transfer", id: "TRF-1113", label: "TRF-1113" }],
    uncertainty: "Stock counts are as recorded; physical counts may differ.", lastRun: "Thu 12 Nov 07:45 (simulated)" },
  { id: "finance", name: "Finance Agent", shape: "executive-capsule", tint: "#1b2430", purpose: "Invoice extraction, duplicate suggestions, reconciliation and the draft accountant pack. Never files or pays.",
    sources: ["Supplier PDFs", "Receipt photos", "Bank CSV", "Settlement files"], gates: ["Every extraction is reviewed by David.", "Exports are drafts; no posting, filing or payment."],
    links: [{ kind: "inbox", id: "FIN-112", label: "FIN-112" }, { kind: "backfill", id: "BACKFILL", label: "Backfill" }],
    uncertainty: "Mock extraction with per-line confidence; low-confidence lines are always held for review.", lastRun: "Thu 12 Nov 08:40 (simulated)" },
  { id: "ingredient", name: "Ingredient Cost Agent", shape: "control-cube", tint: "#16241f", purpose: "Normalises invoice quantities, spots price changes and recalculates affected recipe versions after approval.",
    sources: ["Invoice lines", "Ingredient master", "Recipe versions"], gates: ["Recipe valuations change only after David approves."],
    links: [{ kind: "invoice", id: "INV-AVO-118", label: "INV-AVO-118" }, { kind: "recipe", id: "RCP-SALMON", label: "RCP-SALMON" }, { kind: "costChange", id: "CC-AVO-118", label: "CC-AVO-118" }],
    uncertainty: "Uses the latest invoice price; a single delivery may not represent the month.", lastRun: "Wed 11 Nov 08:14 (simulated)" },
  { id: "channel", name: "Channel Margin Agent", shape: "rim-capsule", tint: "#241b2e", purpose: "Fees, contribution and settlement exceptions per channel, without counting imported orders twice.",
    sources: ["Square orders", "Stream mapping", "Marketplace settlement files", "Bank CSV"], gates: ["Flags differences; never books a debt or changes P&L."],
    links: [{ kind: "settlement", id: "SET-DEL-1106", label: "SET-DEL-1106" }],
    uncertainty: "Fee rates are demo assumptions, not verified commercial terms.", lastRun: "Wed 11 Nov 11:30 (simulated)" },
  { id: "prep", name: "Prep Planner", shape: "low-dome", tint: "#2a2118", purpose: "Confirmed corporate demand plus an illustrative walk-in baseline, with manager-controlled safety stock and overrides.",
    sources: ["Corporate orders", "Recipes", "Demo sales history"], gates: ["Managers own prep quantities and overrides.", "Dietary notes go to a manager."],
    links: [{ kind: "corporate", id: "COR-1113", label: "COR-1113" }],
    uncertainty: "Walk-in baseline is illustrative with medium data quality. No guaranteed accuracy.", lastRun: "Thu 12 Nov 07:05 (simulated)" },
  { id: "transfer", name: "Stock Transfer Agent", shape: "offset-pebble", tint: "#191c1f", purpose: "Proposes cross-site movements, checks available quantities and tracks acknowledgements.",
    sources: ["Stock levels", "Prep plans", "Transfer log"], gates: ["Managers dispatch and receive; the agent only proposes."],
    links: [{ kind: "transfer", id: "TRF-1113", label: "TRF-1113" }],
    uncertainty: "Surplus estimate depends on Friday's actual trade.", lastRun: "Thu 12 Nov 07:30 (simulated)" },
  { id: "labour", name: "Labour Watch", shape: "glass-visor", tint: "#1b2430", purpose: "Sales to labour ratios and explainable optional shift scenarios. Manager approval mandatory.",
    sources: ["Square Teams roster", "October timesheets", "Square sales"], gates: ["Never removes shifts or notifies staff.", "Manager approval required."],
    links: [{ kind: "roster", id: "RST-PROP-BLK-46", label: "RST-PROP-BLK-46" }],
    uncertainty: "Loaded cost of €16/h is illustrative; quiet-hour demand from four demo weeks.", lastRun: "Wed 11 Nov 16:00 (simulated)" },
];

export function agentFindings(id: string, s: State): { summary: string; lines: string[]; needsReview: boolean } {
  const c = inboxCounts(s), a = avocado(s), p = pnl();
  const set = s.settlements.find(x => x.id === "SET-DEL-1106")!;
  const tr = s.transfers.find(x => x.id === "TRF-1113")!;
  const sv = stockView(s);
  switch (id) {
    case "briefing": return { summary: briefingText(s), lines: attention(s).map(x => x.title), needsReview: attention(s).length > 0 };
    case "finance": return { summary: c.total + " documents: " + c.ready + " ready, " + c.review + " extraction reviews, " + c.duplicate + " suspected duplicates.",
      lines: s.inbox.filter(i => i.status === "review" || i.status === "duplicate").map(i => i.id + ": " + (i.issue ?? "")).concat(["Backfill: " + backfillCounts().matched + " of " + backfillCounts().total + " historical documents matched."]), needsReview: c.exceptions > 0 };
    case "ingredient": return { summary: "Avocado " + eur2(a.oldC) + " to " + eur2(a.newC) + " (+" + Math.round(a.pct * 100) + "%). " + a.affected.length + " recipes affected, salmon bowl +" + eur2(a.perBowl) + ".",
      lines: a.affected.map(r => r.name + ": " + eur2(r.before) + " to " + eur2(r.after)).concat([a.status === "approved" ? "Approved: November valuation updated." : "Awaiting approval."]), needsReview: a.status === "pending" };
    case "channel": {
      const ch = channels();
      return { summary: set.status === "investigate" ? "SET-DEL-1106 short by " + eur(set.expected - (set.received ?? 0)) + "; other settlements matched." : "All recent settlements matched or explained.",
        lines: ch.filter(x => x.sales).map(x => x.name + ": " + eur(x.sales) + " sales, " + eur(x.fees) + " fees, " + eur(x.contribution) + " contribution"), needsReview: set.status === "investigate" };
    }
    case "prep": { const n = corporateNeeds(); return { summary: "COR-1113: " + n.bowls + " bowls. Salmon " + n.need["ING-SALMON"] + " kg, avocados " + n.need["ING-AVO"] + " (" + n.bySalmon["ING-AVO"] + " for salmon bowls).",
      lines: ["Walk-in baseline " + (s.prep.forecastOverride?.value ?? 140) + " bowls (illustrative).", s.prep.dietaryReviewed ? "Dietary note reviewed by a manager." : "Dietary note awaiting manager review.", s.prep.completed ? "Prep complete." : "Prep not yet complete."], needsReview: !s.prep.dietaryReviewed } }
    case "transfer": return { summary: "TRF-1113 " + tr.status + ": " + eur(transferTotals(tr)) + " carrying value.", lines: tr.items.map(i => qtyU(i.qty, ingredient(i.item)?.unit ?? "") + " " + ingredient(i.item)?.name), needsReview: tr.status !== "received" };
    case "ops": { const low = sv.filter(r => r.low); return { summary: low.length + " stock lines below par; PO-2040 spinach short by 3 kg.", lines: low.slice(0, 6).map(r => (ingredient(r.item)?.name ?? r.item) + " at " + LOCATIONS.find(l => l.id === r.loc)?.short + ": " + r.available + " available, par " + r.par), needsReview: low.length > 0 } }
    case "labour": return { summary: "October labour: Baggot " + Math.round((p.BAG.labour / p.BAG.sales) * 100) + "%, Blackrock " + Math.round((p.BLK.labour / p.BLK.sales) * 100) + "% of sales.",
      lines: ["Optional scenario: 4 hours, " + eur(ROSTER_PROPOSAL.saving) + " a week. " + (s.roster.status === "proposed" ? "Awaiting Conor." : "Decided: " + s.roster.status + "."), "Never removes shifts or notifies staff."], needsReview: s.roster.status === "proposed" };
  }
  return { summary: "No findings.", lines: [], needsReview: false };
}

/* Search across records for the command palette. */
export function searchRecords(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return [] as { kind: string; id: string; label: string; sub: string }[];
  const hits: { kind: string; id: string; label: string; sub: string }[] = [];
  const add = (kind: string, id: string, label: string, sub: string) => { if ((id + " " + label + " " + sub).toLowerCase().includes(s)) hits.push({ kind, id, label, sub }); };
  state.inbox.forEach(i => add("invoice", i.id, i.id, supplierName(i.supplier) + " · " + i.status));
  INGREDIENTS.forEach(i => add("ingredient", i.id, i.name, "Ingredient · " + i.unit));
  RECIPES.forEach(r => add("recipe", r.id, r.name, r.id));
  state.settlements.forEach(x => add("settlement", x.id, x.id, x.period));
  state.transfers.forEach(x => add("transfer", x.id, x.id, x.when));
  state.pos.forEach(x => add("po", x.id, x.id, supplierName(x.supplier)));
  LOCATIONS.forEach(l => add("location", l.id, l.name, l.address));
  add("corporate", CORPORATE.id, CORPORATE.id, CORPORATE.customer + " · 48 bowls");
  add("costChange", "CC-AVO-118", "CC-AVO-118", "Avocado cost change");
  SUPPLIERS.forEach(x => add("supplier", x.id, x.name, x.category));
  PEOPLE.forEach(x => add("person", x.id, x.name, x.role));
  return hits.slice(0, 8);
}
