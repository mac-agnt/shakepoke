/* Shaka Poké demo model.
   One deterministic dataset that every page reads from. All money is integer cents.
   Every figure here is an illustrative demo assumption, not a claim about the client. */

export type LocId = "BAG" | "BLK" | "TRK";
export type ChannelId = "instore" | "deliveroo" | "ubereats" | "justeat" | "lunchteam" | "feeder" | "tgtg" | "events";

/* ── Calendar ─────────────────────────────────────────────────────────────── */
export const PERIOD = { start: "2026-10-01", end: "2026-10-31", label: "October 2026", short: "Oct 2026" };
export const OPS_DATE = { iso: "2026-11-12", label: "Thursday 12 November 2026", short: "Thu 12 Nov" };
export const TOMORROW = { iso: "2026-11-13", label: "Friday 13 November 2026", short: "Fri 13 Nov" };
export const TZ = "Europe/Dublin";

/* ── Brand and organisation ───────────────────────────────────────────────── */
export const ORG = {
  tradingName: "Shaka Poké",
  legalName: "Legal entity: to confirm",
  website: "https://www.shakapoke.ie/",
  owner: "David McParland",
  ownerRole: "Owner/operator",
  logo: "https://www.shakapoke.ie/uploads/b/6021583832c9d09a99f4282dab4fb8adcce48b15208bfae87b08239b3d7cffd2/Shaka%20Poke_Final%20Logo%20White_1738514648.png",
  primary: "#0854A0",
  secondary: "#46C8F0",
  highlight: "#A9E5FF",
};

/* ── Locations ────────────────────────────────────────────────────────────── */
export type Location = { id: LocId; name: string; short: string; address: string; manager: string; kind: string; hours: string; note: string };
export const LOCATIONS: Location[] = [
  { id: "BAG", name: "Baggot Street", short: "Baggot", address: "110B Baggot Street Lower, Dublin", manager: "P-AOIFE", kind: "Shop",
    hours: "Mon to Fri, 11:30 to 15:30 (demo setting)", note: "Stronger revenue and profit location. Office lunch trade, corporate orders, fixed weekday routine." },
  { id: "BLK", name: "Blackrock", short: "Blackrock", address: "Blackrock Village Market, 19A Main Street, Blackrock, Co. Dublin", manager: "P-CONOR", kind: "Shop",
    hours: "Daily, 12:00 to 17:00 (demo setting)", note: "Stronger weekend trading and sharper winter seasonality. Flexible weekend cover." },
  { id: "TRK", name: "Food Truck", short: "Truck", address: "Seasonal, no fixed pitch", manager: "P-DAVID", kind: "Seasonal",
    hours: "Mostly inactive until next summer; private events only", note: "Dormant for the winter. Storage and insurance carried as a small fixed cost." },
];
export const locName = (id: string) => LOCATIONS.find(l => l.id === id)?.name ?? id;

/* ── People (all except David are fictional demo identities) ─────────────── */
export type Person = { id: string; name: string; role: string; dept: string; loc: LocId | "ALL"; email: string; initials: string; tint: string; access: string; demo: boolean };
export const PEOPLE: Person[] = [
  { id: "P-DAVID", name: "David McParland", role: "Owner", dept: "Management", loc: "ALL", email: "david@shakapoke.ie", initials: "DM", tint: "#46C8F0", access: "All access", demo: false },
  { id: "P-AOIFE", name: "Aoife Byrne", role: "Baggot Street Manager", dept: "Store Operations", loc: "BAG", email: "aoife@shakapoke.ie", initials: "AB", tint: "#A9E5FF", access: "Baggot Street only", demo: true },
  { id: "P-CONOR", name: "Conor Walsh", role: "Blackrock Manager", dept: "Store Operations", loc: "BLK", email: "conor@shakapoke.ie", initials: "CW", tint: "#f0c04b", access: "Blackrock only", demo: true },
  { id: "P-SOFIA", name: "Sofia Costa", role: "Prep Lead", dept: "Kitchen", loc: "BAG", email: "sofia@shakapoke.ie", initials: "SC", tint: "#7fd8a4", access: "Prep only", demo: true },
  { id: "P-LUCAS", name: "Lucas Silva", role: "Kitchen Team", dept: "Kitchen", loc: "BAG", email: "lucas@shakapoke.ie", initials: "LS", tint: "#c8b4f0", access: "Prep only", demo: true },
  { id: "P-EMMA", name: "Emma Kelly", role: "Front of House", dept: "Store Operations", loc: "BLK", email: "emma@shakapoke.ie", initials: "EK", tint: "#f07a9d", access: "Blackrock only", demo: true },
  { id: "P-NIAMH", name: "Niamh Doyle", role: "Weekend Team", dept: "Store Operations", loc: "BLK", email: "niamh@shakapoke.ie", initials: "ND", tint: "#e6c78a", access: "Blackrock only", demo: true },
  { id: "P-JACK", name: "Jack Murphy", role: "Events Team", dept: "Events", loc: "TRK", email: "jack@shakapoke.ie", initials: "JM", tint: "#9fd6f0", access: "Events only", demo: true },
];
export const person = (id: string) => PEOPLE.find(p => p.id === id);
export const DEPARTMENTS = ["Management", "Finance", "Store Operations", "Kitchen", "Events"];

/* ── Suppliers ────────────────────────────────────────────────────────────── */
export type Supplier = { id: string; name: string; prefix: string; category: string; contact: string; note: string; terms: string };
export const SUPPLIERS: Supplier[] = [
  { id: "SUP-CAT", name: "Caterway", prefix: "CAT", category: "Dry goods, proteins, drinks", contact: "orders@caterway (mock label)", note: "Name as rendered on the call; spelling unverified.", terms: "30 days (demo)" },
  { id: "SUP-HFF", name: "Harbour Fresh Fish", prefix: "HFF", category: "Fresh fish", contact: "sales@harbourfresh (mock label)", note: "Fictional demo supplier.", terms: "14 days (demo)" },
  { id: "SUP-GBP", name: "Green Basket Produce", prefix: "GBP", category: "Fruit and veg", contact: "accounts@greenbasket (mock label)", note: "Fictional demo supplier.", terms: "14 days (demo)" },
  { id: "SUP-TES", name: "Tesco", prefix: "TES", category: "Ad hoc top-up purchases", contact: "Card receipts captured by staff", note: "Staff buy missing ingredients; receipts are photographed.", terms: "Paid by card" },
];
export const supplierName = (id: string) => SUPPLIERS.find(s => s.id === id)?.name ?? id;

/* ── Ingredients (unit costs in cents per base unit) ─────────────────────── */
export type Ingredient = { id: string; name: string; unit: string; supplier: string; octCost: number; stdCost: number; prepared?: boolean; perishable: boolean };
export const INGREDIENTS: Ingredient[] = [
  { id: "ING-SALMON", name: "Salmon", unit: "kg", supplier: "SUP-HFF", octCost: 2400, stdCost: 2400, perishable: true },
  { id: "ING-TUNA", name: "Tuna", unit: "kg", supplier: "SUP-HFF", octCost: 2800, stdCost: 2800, perishable: true },
  { id: "ING-CHICKEN", name: "Chicken thigh", unit: "kg", supplier: "SUP-CAT", octCost: 900, stdCost: 900, perishable: true },
  { id: "ING-TOFU", name: "Tofu", unit: "kg", supplier: "SUP-CAT", octCost: 600, stdCost: 600, perishable: true },
  { id: "ING-AVO", name: "Avocado", unit: "each", supplier: "SUP-GBP", octCost: 110, stdCost: 110, perishable: true },
  { id: "ING-RICE", name: "Sushi rice", unit: "kg", supplier: "SUP-CAT", octCost: 240, stdCost: 240, perishable: false },
  { id: "ING-SPINACH", name: "Spinach", unit: "kg", supplier: "SUP-GBP", octCost: 800, stdCost: 800, perishable: true },
  { id: "ING-EDAMAME", name: "Edamame", unit: "kg", supplier: "SUP-CAT", octCost: 500, stdCost: 500, perishable: false },
  { id: "ING-CUCUMBER", name: "Cucumber", unit: "each", supplier: "SUP-GBP", octCost: 40, stdCost: 40, perishable: true },
  { id: "ING-PINEAPPLE", name: "Pineapple", unit: "kg", supplier: "SUP-GBP", octCost: 280, stdCost: 280, perishable: true },
  { id: "ING-SALSA", name: "Pineapple salsa (prepared)", unit: "kg", supplier: "In-house prep", octCost: 600, stdCost: 600, prepared: true, perishable: true },
  { id: "ING-SHOYU", name: "Shoyu dressing", unit: "L", supplier: "SUP-CAT", octCost: 200, stdCost: 200, perishable: false },
  { id: "ING-DRINKS", name: "Soft drinks", unit: "case", supplier: "SUP-CAT", octCost: 1200, stdCost: 1200, perishable: false },
  { id: "ING-TOPUP", name: "Tesco top-ups (mixed)", unit: "receipt", supplier: "SUP-TES", octCost: 0, stdCost: 0, perishable: true },
];
export const ingredient = (id: string) => INGREDIENTS.find(i => i.id === id);

/* ── Recipes (version 1 effective 1 April 2026, avocado at €1.10) ────────── */
export type RecipeLine = { ing: string; qty: number };
export type Recipe = { id: string; name: string; price: number; lines: RecipeLine[]; yieldNote: string; effective: string; version: number; item: string };
export const RECIPES: Recipe[] = [
  { id: "RCP-SALMON", name: "Salmon bowl", price: 1200, item: "B-SALMON", version: 1, effective: "2026-04-01", yieldNote: "1 bowl, 0.10 kg salmon portion",
    lines: [{ ing: "ING-SALMON", qty: 0.10 }, { ing: "ING-AVO", qty: 0.5 }, { ing: "ING-RICE", qty: 0.15 }, { ing: "ING-EDAMAME", qty: 0.03 }, { ing: "ING-CUCUMBER", qty: 0.25 }, { ing: "ING-SHOYU", qty: 0.02 }] },
  { id: "RCP-CHICKEN", name: "Chicken bowl", price: 1200, item: "B-CHICKEN", version: 1, effective: "2026-04-01", yieldNote: "1 bowl, 0.12 kg chicken portion",
    lines: [{ ing: "ING-CHICKEN", qty: 0.12 }, { ing: "ING-RICE", qty: 0.15 }, { ing: "ING-EDAMAME", qty: 0.03 }, { ing: "ING-SPINACH", qty: 0.03 }, { ing: "ING-SALSA", qty: 0.05 }, { ing: "ING-CUCUMBER", qty: 0.25 }, { ing: "ING-SHOYU", qty: 0.02 }] },
  { id: "RCP-TOFU", name: "Tofu bowl", price: 1200, item: "B-TOFU", version: 1, effective: "2026-04-01", yieldNote: "1 bowl, 0.12 kg tofu portion",
    lines: [{ ing: "ING-TOFU", qty: 0.12 }, { ing: "ING-AVO", qty: 0.5 }, { ing: "ING-RICE", qty: 0.15 }, { ing: "ING-EDAMAME", qty: 0.03 }, { ing: "ING-SPINACH", qty: 0.03 }, { ing: "ING-SHOYU", qty: 0.02 }] },
  { id: "RCP-TUNA", name: "Tuna bowl", price: 1300, item: "B-TUNA", version: 1, effective: "2026-04-01", yieldNote: "1 bowl, 0.10 kg tuna portion",
    lines: [{ ing: "ING-TUNA", qty: 0.10 }, { ing: "ING-RICE", qty: 0.15 }, { ing: "ING-SALSA", qty: 0.05 }, { ing: "ING-CUCUMBER", qty: 0.25 }, { ing: "ING-SHOYU", qty: 0.02 }] },
];
export const recipe = (id: string) => RECIPES.find(r => r.id === id);
export const recipeCost = (r: Recipe, prices: Record<string, number>) =>
  Math.round(r.lines.reduce((s, l) => s + l.qty * (prices[l.ing] ?? ingredient(l.ing)?.octCost ?? 0), 0));

export const MENU: Record<string, { name: string; price: number; recipe?: string }> = {
  "B-SALMON": { name: "Salmon bowl", price: 1200, recipe: "RCP-SALMON" },
  "B-CHICKEN": { name: "Chicken bowl", price: 1200, recipe: "RCP-CHICKEN" },
  "B-TOFU": { name: "Tofu bowl", price: 1200, recipe: "RCP-TOFU" },
  "B-TUNA": { name: "Tuna bowl", price: 1300, recipe: "RCP-TUNA" },
  "D-DRINK": { name: "Soft drink", price: 250 },
  "S-MISO": { name: "Miso soup", price: 300 },
  "TGTG-BAG": { name: "Surplus bag", price: 400 },
};

/* ── Channels ─────────────────────────────────────────────────────────────── */
export type Channel = { id: ChannelId; name: string; group: string; feeRate: number; prefix: string; via: string; source: string };
export const CHANNELS: Channel[] = [
  { id: "instore", name: "In-store", group: "Direct in-store", feeRate: 0, prefix: "SQ", via: "Square POS", source: "Square POS" },
  { id: "deliveroo", name: "Deliveroo", group: "Delivery marketplaces", feeRate: 0.2, prefix: "DLV", via: "Stream (name to confirm) into Square", source: "Deliveroo settlement file" },
  { id: "ubereats", name: "Uber Eats", group: "Delivery marketplaces", feeRate: 0.2, prefix: "UBR", via: "Stream (name to confirm) into Square", source: "Uber Eats settlement file" },
  { id: "justeat", name: "Just Eat", group: "Delivery marketplaces", feeRate: 0.2, prefix: "JET", via: "Stream (name to confirm) into Square", source: "Just Eat settlement file" },
  { id: "lunchteam", name: "Lunch Team", group: "Corporate", feeRate: 0, prefix: "LT", via: "Sample import", source: "Lunch Team order export" },
  { id: "feeder", name: "Feeder", group: "Corporate", feeRate: 0, prefix: "FDR", via: "Sample import (vendor to confirm)", source: "Feeder order export" },
  { id: "tgtg", name: "Too Good To Go", group: "Surplus", feeRate: 0, prefix: "TGTG", via: "Sample feed", source: "Too Good To Go sample feed" },
  { id: "events", name: "Events", group: "Events", feeRate: 0, prefix: "EVT", via: "Manual", source: "Event invoices" },
];
export const channelName = (id: string) => CHANNELS.find(c => c.id === id)?.name ?? id;

/* Illustrative October net sales split, euro. Rows reconcile to both channel and location totals. */
export const SALES_MATRIX: Record<ChannelId, Record<"BAG" | "BLK", number>> = {
  instore: { BAG: 30400, BLK: 17600 },
  deliveroo: { BAG: 7800, BLK: 4200 },
  ubereats: { BAG: 5200, BLK: 2800 },
  justeat: { BAG: 2600, BLK: 1400 },
  lunchteam: { BAG: 3600, BLK: 400 },
  feeder: { BAG: 2000, BLK: 1200 },
  tgtg: { BAG: 400, BLK: 400 },
  events: { BAG: 0, BLK: 0 },
};
export const COGS_RATE = 0.29; // October consumed ingredient cost as a share of net sales, allocated to orders

/* ── Deterministic RNG ────────────────────────────────────────────────────── */
export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Dates ────────────────────────────────────────────────────────────────── */
const OCT_DAYS: string[] = Array.from({ length: 31 }, (_, i) => "2026-10-" + String(i + 1).padStart(2, "0"));
export const dow = (iso: string) => new Date(iso + "T12:00:00Z").getUTCDay(); // 0 Sun
const BANK_HOLIDAY = "2026-10-26";
const tradingDays = (loc: "BAG" | "BLK") => loc === "BAG"
  ? OCT_DAYS.filter(d => dow(d) >= 1 && dow(d) <= 5 && d !== BANK_HOLIDAY)
  : OCT_DAYS.slice();
const dayWeight = (loc: "BAG" | "BLK", d: string) => {
  const w = dow(d);
  if (loc === "BAG") return w === 5 ? 0.8 : 1;
  return w === 0 || w === 6 ? 2.1 : w === 5 ? 1.2 : 0.8;
};

/* ── Orders ───────────────────────────────────────────────────────────────── */
export type Order = { id: string; date: string; time: string; loc: "BAG" | "BLK"; channel: ChannelId; net: number; fee: number; cogs: number;
  lines: [string, number][]; squareRef: string; sourceRef: string; via: string };

/* Exact final order: bowls at €12 plus drinks (€2.50) and miso (€3.00). */
function solveFinal(rem: number): [string, number][] {
  for (let n = Math.floor(rem / 1200); n >= 0; n--) {
    const r = rem - n * 1200;
    for (let d = 0; d * 300 <= r; d++) {
      const left = r - d * 300;
      if (left % 250 === 0) {
        const lines: [string, number][] = [];
        if (n) lines.push(["B-CHICKEN", n]);
        if (left) lines.push(["D-DRINK", left / 250]);
        if (d) lines.push(["S-MISO", d]);
        return lines;
      }
    }
  }
  return [["D-DRINK", Math.round(rem / 250)]];
}
const lineTotal = (lines: [string, number][]) => lines.reduce((s, [it, q]) => s + MENU[it].price * q, 0);
const BOWLS = ["B-SALMON", "B-CHICKEN", "B-TOFU", "B-TUNA"];

function buildOrders(): Order[] {
  const out: Order[] = [];
  const r = rng(20261031);
  let n = 10000;
  const pickBowl = () => { const x = r(); return x < 0.34 ? "B-CHICKEN" : x < 0.64 ? "B-SALMON" : x < 0.82 ? "B-TOFU" : "B-TUNA"; };
  for (const ch of CHANNELS) {
    for (const loc of ["BAG", "BLK"] as const) {
      const target = SALES_MATRIX[ch.id][loc] * 100;
      if (!target) continue;
      const days = tradingDays(loc);
      const weights = days.map(d => dayWeight(loc, d));
      const wsum = weights.reduce((a, b) => a + b, 0);
      const pickDay = () => { let x = r() * wsum; for (let i = 0; i < days.length; i++) { x -= weights[i]; if (x <= 0) return days[i]; } return days[days.length - 1]; };
      const cell: Order[] = [];
      let rem = target;
      const ticket = (): [string, number][] => {
        if (ch.id === "tgtg") return [["TGTG-BAG", 1]];
        if (ch.id === "lunchteam" || ch.id === "feeder") {
          const size = [6, 8, 10, 12, 15, 20][Math.floor(r() * 6)];
          return [[pickBowl(), Math.ceil(size / 2)], [pickBowl(), Math.floor(size / 2)]];
        }
        const lines: [string, number][] = [[pickBowl(), 1]];
        const x = r();
        if (ch.id === "instore") { if (x > 0.72) lines.push(["D-DRINK", 1]); else if (x > 0.62) lines.push([pickBowl(), 1]); else if (x > 0.56) lines.push(["S-MISO", 1]); }
        else { if (x > 0.45) lines.push([pickBowl(), 1]); if (r() > 0.5) lines.push(["D-DRINK", 1 + Math.floor(r() * 2)]); if (r() > 0.8) lines.push(["S-MISO", 1]); }
        return lines;
      };
      const floor = ch.id === "tgtg" ? 0 : ch.id === "lunchteam" || ch.id === "feeder" ? 3000 : 2000;
      while (true) {
        const lines = ticket();
        const amt = lineTotal(lines);
        if (rem - amt < floor) break;
        rem -= amt;
        cell.push(mkOrder(lines, amt));
        if (rem === 0) break;
      }
      if (rem > 0) { const lines = ch.id === "tgtg" ? [["TGTG-BAG", rem / 400] as [string, number]] : solveFinal(rem); cell.push(mkOrder(lines, lineTotal(lines))); }
      // fees and allocated ingredient cost, exact to the cent per cell
      const feeTarget = Math.round(target * ch.feeRate);
      const cogsTarget = Math.round(target * COGS_RATE);
      let feeAcc = 0, cogsAcc = 0;
      cell.forEach((o, i) => {
        const last = i === cell.length - 1;
        o.fee = last ? feeTarget - feeAcc : Math.round(o.net * ch.feeRate);
        o.cogs = last ? cogsTarget - cogsAcc : Math.round(o.net * COGS_RATE);
        feeAcc += o.fee; cogsAcc += o.cogs;
      });
      out.push(...cell);
      function mkOrder(lines: [string, number][], amt: number): Order {
        const date = pickDay();
        const hour = loc === "BAG" ? 11 + Math.floor(r() * 4) : 12 + Math.floor(r() * 5);
        const id = "ORD-" + (++n);
        return { id, date, time: String(hour).padStart(2, "0") + ":" + String(Math.floor(r() * 60)).padStart(2, "0"), loc, channel: ch.id, net: amt, fee: 0, cogs: 0, lines,
          squareRef: "SQ-" + (700000 + n * 7).toString(36).toUpperCase(),
          sourceRef: ch.id === "instore" ? "" : ch.prefix + "-" + (n * 13 % 99991).toString().padStart(5, "0"), via: ch.via };
      }
    }
  }
  out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time) || a.id.localeCompare(b.id));
  return out;
}
export const ORDERS: Order[] = buildOrders();

/* ── Labour (October timesheets, loaded cost €16/h, illustrative) ─────────── */
export const LOADED_RATE = 1600;
export type Shift = { id: string; date: string; loc: LocId; person: string; hours: number; cost: number };
function buildShifts(): Shift[] {
  const r = rng(4417);
  const out: Shift[] = [];
  const plan: [LocId, number, string[]][] = [
    ["BAG", 910, ["P-AOIFE", "P-SOFIA", "P-LUCAS"]],
    ["BLK", 560, ["P-CONOR", "P-EMMA", "P-NIAMH"]],
  ];
  let n = 0;
  for (const [loc, hours, staff] of plan) {
    const days = tradingDays(loc as "BAG" | "BLK");
    const weights = days.map(d => dayWeight(loc as "BAG" | "BLK", d));
    const ws = weights.reduce((a, b) => a + b, 0);
    let remHalf = hours * 2; // half-hour units
    days.forEach((d, i) => {
      const last = i === days.length - 1;
      const dayHalf = last ? remHalf : Math.round((hours * 2 * weights[i]) / ws);
      remHalf -= dayHalf;
      // split across staff in half-hours
      let left = dayHalf;
      staff.forEach((p, k) => {
        if (loc === "BLK" && p === "P-NIAMH" && !(dow(d) === 0 || dow(d) === 6)) return;
        const isLast = k === staff.length - 1 || (loc === "BLK" && k === 1 && !(dow(d) === 0 || dow(d) === 6));
        const share = isLast ? left : Math.min(left, Math.round(dayHalf * (0.38 + r() * 0.06)));
        left -= share;
        if (share > 0) out.push({ id: "SH-" + (++n), date: d, loc, person: p, hours: share / 2, cost: (share / 2) * LOADED_RATE });
      });
    });
  }
  return out;
}
export const SHIFTS: Shift[] = buildShifts();

/* ── Other operating costs (packaging and occupancy included here, once) ─── */
export type Overhead = { id: string; loc: LocId; category: string; payee: string; amount: number; source: string };
export const OVERHEADS: Overhead[] = [
  { id: "OH-B1", loc: "BAG", category: "Rent and service charge", payee: "Landlord (demo)", amount: 520000, source: "Bank statement" },
  { id: "OH-B2", loc: "BAG", category: "Packaging", payee: "Caterway", amount: 186000, source: "Supplier invoices" },
  { id: "OH-B3", loc: "BAG", category: "Utilities", payee: "Energy supplier (demo)", amount: 112000, source: "Bank statement" },
  { id: "OH-B4", loc: "BAG", category: "Card processing", payee: "Square", amount: 92000, source: "Square payout reports" },
  { id: "OH-B5", loc: "BAG", category: "Cleaning and waste", payee: "Contractor (demo)", amount: 64000, source: "Supplier invoices" },
  { id: "OH-B6", loc: "BAG", category: "Software and systems", payee: "Square, Xero, Squid", amount: 34000, source: "Bank statement" },
  { id: "OH-B7", loc: "BAG", category: "Insurance and sundries", payee: "Various (demo)", amount: 32000, source: "Bank statement" },
  { id: "OH-K1", loc: "BLK", category: "Market stall licence and rent", payee: "Blackrock Market (demo)", amount: 560000, source: "Bank statement" },
  { id: "OH-K2", loc: "BLK", category: "Packaging", payee: "Caterway", amount: 124000, source: "Supplier invoices" },
  { id: "OH-K3", loc: "BLK", category: "Utilities", payee: "Energy supplier (demo)", amount: 148000, source: "Bank statement" },
  { id: "OH-K4", loc: "BLK", category: "Card processing", payee: "Square", amount: 54000, source: "Square payout reports" },
  { id: "OH-K5", loc: "BLK", category: "Cleaning and waste", payee: "Contractor (demo)", amount: 66000, source: "Supplier invoices" },
  { id: "OH-K6", loc: "BLK", category: "Software and systems", payee: "Square, Xero, Squid", amount: 34000, source: "Bank statement" },
  { id: "OH-K7", loc: "BLK", category: "Insurance and sundries", payee: "Various (demo)", amount: 42000, source: "Bank statement" },
  { id: "OH-T1", loc: "TRK", category: "Truck storage and insurance", payee: "Various (demo)", amount: 20000, source: "Bank statement" },
];

/* ── October purchases (purchases are not consumed COGS) ─────────────────── */
export const PURCHASE_PLAN: [string, number, string, number][] = [
  // ingredient, total qty, supplier, deliveries
  ["ING-SALMON", 260, "SUP-HFF", 26], ["ING-TUNA", 110, "SUP-HFF", 22], ["ING-CHICKEN", 300, "SUP-CAT", 18],
  ["ING-TOFU", 140, "SUP-CAT", 14], ["ING-AVO", 2400, "SUP-GBP", 24], ["ING-RICE", 1000, "SUP-CAT", 10],
  ["ING-SPINACH", 90, "SUP-GBP", 18], ["ING-EDAMAME", 160, "SUP-CAT", 8], ["ING-CUCUMBER", 1200, "SUP-GBP", 20],
  ["ING-PINEAPPLE", 300, "SUP-GBP", 15], ["ING-SHOYU", 400, "SUP-CAT", 8], ["ING-DRINKS", 100, "SUP-CAT", 8],
];
export const STOCK_BRIDGE = { opening: 310000, closing: 354000 }; // COGS = opening + purchases − closing
export type PurchaseLine = { id: string; invoice: string; date: string; supplier: string; loc: "BAG" | "BLK"; ing: string; qty: number; unit: string; unitCost: number; net: number };
function buildPurchases(): PurchaseLine[] {
  const r = rng(9011);
  const out: PurchaseLine[] = [];
  const supplyDays = OCT_DAYS.filter(d => dow(d) !== 0);
  let n = 0;
  const inv: Record<string, string> = {};
  let invN = 2100;
  const invoiceFor = (sup: string, date: string, loc: string) => {
    const k = sup + date + loc;
    if (!inv[k]) inv[k] = "INV-" + SUPPLIERS.find(s => s.id === sup)!.prefix + "-" + (++invN);
    return inv[k];
  };
  for (const [ing, qty, sup, deliveries] of PURCHASE_PLAN) {
    const meta = ingredient(ing)!;
    let left = qty;
    for (let i = 0; i < deliveries; i++) {
      const last = i === deliveries - 1;
      const q = last ? left : Math.max(1, Math.min(left - (deliveries - i - 1), Math.round((qty / deliveries) * (0.75 + r() * 0.5))));
      left -= q;
      const date = supplyDays[Math.floor((i / deliveries) * supplyDays.length + r() * 2) % supplyDays.length];
      const loc: "BAG" | "BLK" = r() < 0.65 ? "BAG" : "BLK";
      out.push({ id: "PL-" + (++n), invoice: invoiceFor(sup, date, loc), date, supplier: sup, loc, ing, qty: q, unit: meta.unit, unitCost: meta.octCost, net: q * meta.octCost });
    }
  }
  // Tesco ad hoc receipts, €900 in total
  let tes = 90000;
  const tesDays = OCT_DAYS.filter(d => dow(d) !== 0);
  for (let i = 0; i < 24; i++) {
    const last = i === 23;
    const amt = last ? tes : Math.round(((tes / (24 - i)) * (0.7 + r() * 0.6)) / 100) * 100;
    tes -= amt;
    const date = tesDays[Math.floor(r() * tesDays.length)];
    const loc: "BAG" | "BLK" = r() < 0.55 ? "BAG" : "BLK";
    out.push({ id: "PL-" + (++n), invoice: "RCT-TES-" + (300 + i), date, supplier: "SUP-TES", loc, ing: "ING-TOPUP", qty: 1, unit: "receipt", unitCost: amt, net: amt });
  }
  out.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  return out;
}
export const PURCHASES: PurchaseLine[] = buildPurchases();

/* ── November invoice inbox (separate from October P&L) ──────────────────── */
export type InvLine = { id: string; desc: string; ing: string; qty: number; unit: string; unitCost: number; conf: number; flag?: string; expectQty?: number; expectUnit?: string };
export type InvStatus = "ready" | "review" | "duplicate" | "reviewed" | "archived" | "exported";
export type Invoice = { id: string; supplier: string; date: string; loc: "BAG" | "BLK"; status: InvStatus; source: string; conf: number; taxField: string;
  dupOf?: string; issue?: string; lines: InvLine[]; received: string };
const L = (id: string, desc: string, ing: string, qty: number, unit: string, unitCost: number, conf = 0.97, extra: Partial<InvLine> = {}): InvLine => ({ id, desc, ing, qty, unit, unitCost, conf, ...extra });
export const INBOX_SEED: Invoice[] = [
  { id: "INV-AVO-118", supplier: "SUP-GBP", date: "2026-11-11", loc: "BAG", status: "ready", source: "Supplier PDF (email)", conf: 0.98, taxField: "Draft: to confirm", received: "11 Nov 08:12",
    lines: [L("a1", "Avocado, Hass, ripe", "ING-AVO", 100, "each", 132, 0.99)] },
  { id: "INV-HFF-2231", supplier: "SUP-HFF", date: "2026-11-11", loc: "BAG", status: "review", source: "Supplier PDF (email)", conf: 0.62, taxField: "Draft: to confirm", received: "11 Nov 07:40",
    issue: "Quantity and unit unclear on line 1: read as 1.2 box, delivery note says 12 kg.",
    lines: [L("h1", "Salmon fillet, skin off", "ING-SALMON", 1.2, "box", 2400, 0.48, { flag: "Unit not recognised", expectQty: 12, expectUnit: "kg" }), L("h2", "Tuna loin, sashimi grade", "ING-TUNA", 5, "kg", 2800, 0.95)] },
  { id: "RCT-TES-0419", supplier: "SUP-TES", date: "2026-11-10", loc: "BLK", status: "review", source: "Staff receipt photo", conf: 0.58, taxField: "Draft: to confirm", received: "10 Nov 15:02",
    issue: "Receipt photo is blurred: spinach quantity read as 2 bag, likely 1 kg.",
    lines: [L("t1", "Baby spinach", "ING-SPINACH", 2, "bag", 800, 0.51, { flag: "Unit not recognised", expectQty: 1, expectUnit: "kg" }), L("t2", "Limes and coriander", "ING-TOPUP", 1, "receipt", 640, 0.9)] },
  { id: "INV-CAT-7781", supplier: "SUP-CAT", date: "2026-11-10", loc: "BLK", status: "review", source: "Supplier PDF (email)", conf: 0.66, taxField: "Unreadable", received: "10 Nov 09:20",
    issue: "Tax field unreadable and site not stated. Check the delivery address.",
    lines: [L("c1", "Sushi rice 20 kg sack", "ING-RICE", 40, "kg", 240, 0.92), L("c2", "Edamame, shelled", "ING-EDAMAME", 10, "kg", 500, 0.9)] },
  { id: "INV-GBP-115B", supplier: "SUP-GBP", date: "2026-11-09", loc: "BAG", status: "duplicate", dupOf: "INV-GBP-115", source: "Forwarded email", conf: 0.97, taxField: "Draft: to confirm", received: "10 Nov 11:48",
    issue: "Same supplier, date, total and line items as INV-GBP-115, received twice.",
    lines: [L("d1", "Spinach", "ING-SPINACH", 4, "kg", 800), L("d2", "Cucumber", "ING-CUCUMBER", 40, "each", 40)] },
  { id: "INV-CAT-7779B", supplier: "SUP-CAT", date: "2026-11-09", loc: "BAG", status: "duplicate", dupOf: "INV-CAT-7779", source: "Scanned paper copy", conf: 0.95, taxField: "Draft: to confirm", received: "11 Nov 10:05",
    issue: "Paper copy scanned after the PDF arrived. Totals match INV-CAT-7779.",
    lines: [L("e1", "Chicken thigh", "ING-CHICKEN", 15, "kg", 900), L("e2", "Shoyu dressing", "ING-SHOYU", 20, "L", 200)] },
];
// 18 more ready documents so the inbox holds 24
(function addReady() {
  const r = rng(1112);
  const pool: [string, string, string, number][] = [
    ["SUP-HFF", "ING-SALMON", "Salmon fillet", 8], ["SUP-HFF", "ING-TUNA", "Tuna loin", 4], ["SUP-CAT", "ING-CHICKEN", "Chicken thigh", 12],
    ["SUP-CAT", "ING-TOFU", "Tofu block", 6], ["SUP-GBP", "ING-CUCUMBER", "Cucumber", 40], ["SUP-GBP", "ING-PINEAPPLE", "Pineapple", 10],
    ["SUP-CAT", "ING-RICE", "Sushi rice", 40], ["SUP-GBP", "ING-SPINACH", "Spinach", 4], ["SUP-CAT", "ING-DRINKS", "Soft drinks", 4],
  ];
  const dates = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12"];
  for (let i = 0; i < 18; i++) {
    const [sup, ing, desc, base] = pool[i % pool.length];
    const meta = ingredient(ing)!;
    const qty = Math.max(1, Math.round(base * (0.8 + r() * 0.5)));
    const id = (sup === "SUP-TES" ? "RCT-" : "INV-") + SUPPLIERS.find(s => s.id === sup)!.prefix + "-" + (sup === "SUP-HFF" ? 2232 + i : sup === "SUP-CAT" ? 7782 + i : 116 + i);
    const unitCost = ing === "ING-AVO" ? 132 : meta.octCost;
    INBOX_SEED.push({ id, supplier: sup, date: dates[i % 4], loc: i % 3 === 2 ? "BLK" : "BAG", status: "ready", source: i % 4 === 3 ? "Supplier portal download" : "Supplier PDF (email)",
      conf: 0.93 + r() * 0.06, taxField: "Draft: to confirm", received: dates[i % 4].slice(8) + " Nov " + String(7 + (i % 5)).padStart(2, "0") + ":" + String(10 + i).padStart(2, "0"),
      lines: [L("r" + i, desc, ing, qty, meta.unit, unitCost, 0.95 + r() * 0.04)] });
  }
})();
export const invoiceNet = (inv: Invoice) => inv.lines.reduce((s, l) => s + Math.round(l.qty * l.unitCost), 0);

/* ── Historical backfill, 1 April to 30 September ────────────────────────── */
export type BackfillDoc = { id: string; month: string; supplier: string; amount: number; status: "matched" | "missing" | "ambiguous"; note: string };
function buildBackfill(): BackfillDoc[] {
  const r = rng(240);
  const months = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];
  const out: BackfillDoc[] = [];
  const missingIdx = new Set<number>(), ambIdx = new Set<number>();
  while (missingIdx.size < 18) missingIdx.add(Math.floor(r() * 240));
  while (ambIdx.size < 6) { const k = Math.floor(r() * 240); if (!missingIdx.has(k)) ambIdx.add(k); }
  for (let i = 0; i < 240; i++) {
    const sup = SUPPLIERS[Math.floor(r() * SUPPLIERS.length)];
    const status = missingIdx.has(i) ? "missing" : ambIdx.has(i) ? "ambiguous" : "matched";
    out.push({ id: "BF-" + String(i + 1).padStart(3, "0"), month: months[Math.floor(i / 40)], supplier: sup.id,
      amount: (sup.id === "SUP-TES" ? 1500 + Math.round(r() * 60) * 100 : 9000 + Math.round(r() * 400) * 100),
      status, note: status === "missing" ? "Bank debit with no receipt or invoice found" : status === "ambiguous" ? "Cannot tell which site this cost belongs to" : "Matched to bank line" });
  }
  return out;
}
export const BACKFILL: BackfillDoc[] = buildBackfill();

/* ── Settlements and bank lines (November cash; not October P&L) ─────────── */
export type SettlementLine = { day: string; orders: number; gross: number; commission: number; adjustments: number };
export type Settlement = { id: string; channel: ChannelId; loc: "BAG" | "BLK" | "ALL"; period: string; paidOn: string; expected: number; received: number | null; status: "matched" | "investigate" | "pending" | "resolved"; lines: SettlementLine[]; note: string };
export const SETTLEMENTS_SEED: Settlement[] = [
  { id: "SET-DEL-1106", channel: "deliveroo", loc: "BAG", period: "Orders 26 Oct to 1 Nov", paidOn: "2026-11-06", expected: 126000, received: 113400, status: "investigate",
    note: "Bank receipt is €126 below the payout expected from the statement lines. Possible adjustment (refund, promotion or fee change). Not proven lost revenue.",
    lines: [
      { day: "Mon 26 Oct", orders: 6, gross: 13500, commission: 2700, adjustments: 0 },
      { day: "Tue 27 Oct", orders: 14, gross: 31500, commission: 6300, adjustments: 0 },
      { day: "Wed 28 Oct", orders: 13, gross: 29000, commission: 5800, adjustments: 0 },
      { day: "Thu 29 Oct", orders: 15, gross: 33500, commission: 6700, adjustments: 0 },
      { day: "Fri 30 Oct", orders: 12, gross: 27000, commission: 5400, adjustments: 0 },
      { day: "Sat 31 Oct", orders: 4, gross: 9500, commission: 1900, adjustments: 0 },
      { day: "Sun 1 Nov", orders: 4, gross: 13500, commission: 2700, adjustments: 0 },
    ] },
  { id: "SET-UBR-1105", channel: "ubereats", loc: "ALL", period: "Orders 26 Oct to 1 Nov", paidOn: "2026-11-05", expected: 104000, received: 104000, status: "matched", note: "Matched to bank receipt.",
    lines: [{ day: "Week total", orders: 52, gross: 130000, commission: 26000, adjustments: 0 }] },
  { id: "SET-JET-1104", channel: "justeat", loc: "ALL", period: "Orders 26 Oct to 1 Nov", paidOn: "2026-11-04", expected: 52000, received: 52000, status: "matched", note: "Matched to bank receipt.",
    lines: [{ day: "Week total", orders: 26, gross: 65000, commission: 13000, adjustments: 0 }] },
  { id: "SET-SQ-1109", channel: "instore", loc: "ALL", period: "Card takings 2 to 8 Nov", paidOn: "2026-11-09", expected: 1086000, received: 1086000, status: "matched", note: "Square card payout matched. Processing fees sit in other operating costs.",
    lines: [{ day: "Week total", orders: 812, gross: 1086000, commission: 0, adjustments: 0 }] },
  { id: "SET-LT-1102", channel: "lunchteam", loc: "BAG", period: "October corporate orders", paidOn: "2026-11-02", expected: 400000, received: null, status: "pending", note: "Lunch Team remittance expected; no bank receipt yet.",
    lines: [{ day: "October", orders: 31, gross: 400000, commission: 0, adjustments: 0 }] },
];
export type BankLine = { id: string; date: string; desc: string; amount: number; match: string; status: "matched" | "missing" | "investigate" | "pending" };
export const BANK_LINES: BankLine[] = [
  { id: "BNK-501", date: "2026-11-04", desc: "JUST EAT PAYOUT", amount: 52000, match: "SET-JET-1104", status: "matched" },
  { id: "BNK-502", date: "2026-11-05", desc: "UBER EATS PAYOUT", amount: 104000, match: "SET-UBR-1105", status: "matched" },
  { id: "BNK-503", date: "2026-11-06", desc: "DELIVEROO PAYOUT", amount: 113400, match: "SET-DEL-1106", status: "investigate" },
  { id: "BNK-504", date: "2026-11-09", desc: "SQUARE PAYOUT", amount: 1086000, match: "SET-SQ-1109", status: "matched" },
  { id: "BNK-505", date: "2026-11-09", desc: "CARD TESCO BLACKROCK", amount: -2380, match: "", status: "missing" },
  { id: "BNK-506", date: "2026-11-10", desc: "CARD TESCO BAGGOT ST", amount: -1645, match: "", status: "missing" },
  { id: "BNK-507", date: "2026-11-10", desc: "CARD TESCO BLACKROCK", amount: -2240, match: "RCT-TES-0419", status: "matched" },
  { id: "BNK-508", date: "2026-11-11", desc: "HARBOUR FRESH FISH", amount: -64200, match: "October statement", status: "matched" },
];

/* ── Stock (Thursday 12 November, before Friday's transfer) ──────────────── */
export type StockRow = { item: string; loc: LocId; onHand: number; par: number };
export const STOCK_SEED: StockRow[] = [
  { item: "ING-SALMON", loc: "BAG", onHand: 6, par: 5 }, { item: "ING-SALMON", loc: "BLK", onHand: 1, par: 3 },
  { item: "ING-SALSA", loc: "BAG", onHand: 8, par: 4 }, { item: "ING-SALSA", loc: "BLK", onHand: 2, par: 3 },
  { item: "ING-TUNA", loc: "BAG", onHand: 3, par: 2 }, { item: "ING-TUNA", loc: "BLK", onHand: 1.5, par: 1.5 },
  { item: "ING-CHICKEN", loc: "BAG", onHand: 5, par: 4 }, { item: "ING-CHICKEN", loc: "BLK", onHand: 3, par: 3 },
  { item: "ING-TOFU", loc: "BAG", onHand: 2, par: 2 }, { item: "ING-TOFU", loc: "BLK", onHand: 1.5, par: 1.5 },
  { item: "ING-AVO", loc: "BAG", onHand: 40, par: 30 }, { item: "ING-AVO", loc: "BLK", onHand: 14, par: 20 },
  { item: "ING-RICE", loc: "BAG", onHand: 30, par: 20 }, { item: "ING-RICE", loc: "BLK", onHand: 18, par: 15 },
  { item: "ING-SPINACH", loc: "BAG", onHand: 2, par: 2 }, { item: "ING-SPINACH", loc: "BLK", onHand: 0.8, par: 1.5 },
  { item: "ING-EDAMAME", loc: "BAG", onHand: 6, par: 4 }, { item: "ING-EDAMAME", loc: "BLK", onHand: 4, par: 3 },
  { item: "ING-CUCUMBER", loc: "BAG", onHand: 30, par: 20 }, { item: "ING-CUCUMBER", loc: "BLK", onHand: 12, par: 15 },
  { item: "ING-SHOYU", loc: "BAG", onHand: 8, par: 5 }, { item: "ING-SHOYU", loc: "BLK", onHand: 5, par: 4 },
];

/* ── Corporate order and prep ─────────────────────────────────────────────── */
export const CORPORATE = {
  id: "COR-1113", customer: "Harbour Office Team", customerNote: "Fictional corporate end customer", channel: "lunchteam" as ChannelId, loc: "BAG" as LocId,
  date: TOMORROW.iso, time: "12:15", lines: [["RCP-CHICKEN", 24], ["RCP-SALMON", 16], ["RCP-TOFU", 8]] as [string, number][], unitPrice: 1200,
  prepOwner: "P-SOFIA", dispatchOwner: "P-AOIFE", packaging: 48, dietary: "Two guests flagged a sesame allergy in the order note. Manager review required before prep; do not assume dietary safety.",
};
export const FORECAST = { loc: "BAG" as LocId, date: TOMORROW.iso, walkIn: 140, low: 118, high: 160, quality: "Illustrative baseline from four Fridays of demo sales. Medium data quality, not a guaranteed accuracy." };

/* ── Transfers ────────────────────────────────────────────────────────────── */
export type Transfer = { id: string; from: LocId; to: LocId; when: string; status: "scheduled" | "dispatched" | "received"; items: { item: string; qty: number; unitCost: number }[];
  prepares: string; transports: string; receives: string; dispatchedAt?: string; receivedAt?: string; note: string };
export const TRANSFER_SEED: Transfer[] = [
  { id: "TRF-1113", from: "BAG", to: "BLK", when: "Fri 13 Nov, 15:30", status: "scheduled", prepares: "P-AOIFE", transports: "P-DAVID", receives: "P-CONOR",
    items: [{ item: "ING-SALMON", qty: 2, unitCost: 2400 }, { item: "ING-SALSA", qty: 3, unitCost: 600 }],
    note: "Friday surplus moved in David's refrigerated van. A transfer moves stock between sites; it is not a purchase and not revenue." },
  { id: "TRF-1106", from: "BAG", to: "BLK", when: "Fri 6 Nov, 15:30", status: "received", prepares: "P-AOIFE", transports: "P-DAVID", receives: "P-CONOR",
    items: [{ item: "ING-SALMON", qty: 1.5, unitCost: 2400 }, { item: "ING-CHICKEN", qty: 2, unitCost: 900 }], dispatchedAt: "Fri 6 Nov 15:34", receivedAt: "Fri 6 Nov 16:20",
    note: "Previous Friday transfer, received in full." },
];

/* ── Waste (low except rice) ──────────────────────────────────────────────── */
export type Waste = { id: string; date: string; loc: LocId; item: string; qty: number; reason: string; cost: number; recovered: string };
export const WASTE: Waste[] = [
  { id: "WST-301", date: "2026-11-06", loc: "BAG", item: "ING-RICE", qty: 3.2, reason: "Cooked rice overproduction at close", cost: 768, recovered: "None" },
  { id: "WST-302", date: "2026-11-07", loc: "BLK", item: "ING-RICE", qty: 2.6, reason: "Cooked rice overproduction at close", cost: 624, recovered: "None" },
  { id: "WST-303", date: "2026-11-09", loc: "BAG", item: "ING-RICE", qty: 2.1, reason: "Cooked rice overproduction at close", cost: 504, recovered: "6 surplus bags sold on Too Good To Go (counted as sales, not waste)" },
  { id: "WST-304", date: "2026-11-10", loc: "BLK", item: "ING-SPINACH", qty: 0.4, reason: "Wilted on delivery", cost: 320, recovered: "Credit requested from supplier" },
  { id: "WST-305", date: "2026-11-11", loc: "BAG", item: "ING-SALSA", qty: 0.3, reason: "Past prep date", cost: 180, recovered: "None" },
];

/* ── Purchase orders ──────────────────────────────────────────────────────── */
export type PO = { id: string; supplier: string; loc: LocId; status: "draft" | "ordered" | "partial" | "received"; due: string; lines: { ing: string; qty: number; received: number; unitCost: number }[]; note: string };
export const PO_SEED: PO[] = [
  { id: "PO-2041", supplier: "SUP-GBP", loc: "BAG", status: "draft", due: "Mon 16 Nov", note: "Drafted by the Ingredient Cost Agent at the new avocado price. Needs approval; nothing is sent to the supplier from this demo.",
    lines: [{ ing: "ING-AVO", qty: 120, received: 0, unitCost: 132 }, { ing: "ING-CUCUMBER", qty: 40, received: 0, unitCost: 40 }] },
  { id: "PO-2042", supplier: "SUP-CAT", loc: "BAG", status: "ordered", due: "Fri 13 Nov", note: "Weekly dry goods.", lines: [{ ing: "ING-RICE", qty: 100, received: 0, unitCost: 240 }, { ing: "ING-EDAMAME", qty: 20, received: 0, unitCost: 500 }] },
  { id: "PO-2040", supplier: "SUP-GBP", loc: "BLK", status: "partial", due: "Wed 11 Nov", note: "Spinach short-delivered: 7 kg of 10 kg. Balance promised Friday.", lines: [{ ing: "ING-SPINACH", qty: 10, received: 7, unitCost: 800 }, { ing: "ING-PINEAPPLE", qty: 12, received: 12, unitCost: 280 }] },
  { id: "PO-2039", supplier: "SUP-HFF", loc: "BAG", status: "received", due: "Tue 10 Nov", note: "Received in full.", lines: [{ ing: "ING-SALMON", qty: 8, received: 8, unitCost: 2400 }, { ing: "ING-TUNA", qty: 4, received: 4, unitCost: 2800 }] },
];

/* ── Roster (week of 9 to 15 November, read-only Square Teams demo import) ─ */
export type RosterShift = { id: string; day: string; loc: LocId; person: string; start: string; end: string; hours: number; fixed?: boolean };
export const ROSTER: RosterShift[] = (() => {
  const days = ["Mon 9", "Tue 10", "Wed 11", "Thu 12", "Fri 13", "Sat 14", "Sun 15"];
  const out: RosterShift[] = [];
  let n = 0;
  const add = (day: string, loc: LocId, person: string, start: string, end: string, fixed = false) => {
    const h = (parseInt(end) * 60 + parseInt(end.slice(3)) - parseInt(start) * 60 - parseInt(start.slice(3))) / 60;
    out.push({ id: "RS-" + (++n), day, loc, person, start, end, hours: h, fixed });
  };
  days.slice(0, 5).forEach(d => {
    add(d, "BAG", "P-AOIFE", "09:00", "16:30", true); add(d, "BAG", "P-SOFIA", "07:30", "14:30", true); add(d, "BAG", "P-LUCAS", "10:00", "15:30", true);
  });
  days.forEach((d, i) => {
    const weekend = i >= 5;
    add(d, "BLK", "P-CONOR", "11:00", "17:30");
    if (weekend) { add(d, "BLK", "P-NIAMH", "11:00", "18:00"); add(d, "BLK", "P-EMMA", "11:30", "17:30"); }
    else add(d, "BLK", "P-EMMA", "12:00", "17:00");
  });
  return out;
})();
export const ROSTER_PROPOSAL = {
  id: "RST-PROP-BLK-46", loc: "BLK" as LocId, owner: "P-CONOR", hours: 4, rate: LOADED_RATE, saving: 4 * LOADED_RATE,
  changes: [
    { day: "Tue 10", person: "P-EMMA", from: "12:00 to 17:00", to: "12:00 to 15:00", cut: 2, why: "Last two hours averaged 3 orders in four demo Tuesdays." },
    { day: "Wed 11", person: "P-EMMA", from: "12:00 to 17:00", to: "12:00 to 15:00", cut: 2, why: "Last two hours averaged 4 orders in four demo Wednesdays." },
  ],
  caveats: "Optional, discretionary scenario for next week. Weekend cover and Baggot Street's fixed routine are untouched. Saving €64 a week does not on its own fix Blackrock's October result. No shifts are changed and no staff are notified from Pulse.",
};

/* ── Corporate and events timeline ────────────────────────────────────────── */
export const EVENTS = [
  { id: "EVT-0612", date: "Jun 2026", title: "Summer festival weekend (truck)", status: "Completed", value: "Recorded before the reporting period", note: "Demo history entry" },
  { id: "EVT-0718", date: "Jul 2026", title: "Private corporate summer party (truck)", status: "Completed", value: "Recorded before the reporting period", note: "Demo history entry" },
  { id: "EVT-0829", date: "Aug 2026", title: "Private wedding catering (truck)", status: "Completed", value: "Recorded before the reporting period", note: "Demo history entry" },
  { id: "ENQ-1204", date: "Fri 4 Dec 2026", title: "Office Christmas lunch, about 60 bowls (enquiry)", status: "Unconfirmed", value: "Excluded from booked revenue", note: "Fictional private-event enquiry, not confirmed" },
  { id: "EVT-2027", date: "Apr 2027", title: "Truck season planning", status: "Planned", value: "None", note: "Truck mostly inactive until next summer" },
];

/* ── Systems and data ownership ───────────────────────────────────────────── */
export type Integration = { id: string; name: string; purpose: string; direction: string; status: string; last: string; owner: string; confirm: string; source: string };
export const INTEGRATIONS: Integration[] = [
  { id: "square", name: "Square POS", purpose: "Sales and order source, location reporting", direction: "Read into Pulse", status: "Demo import (simulated, read-only)", last: "12 Nov 06:00 (simulated)", owner: "David McParland", confirm: "", source: "Square" },
  { id: "square-teams", name: "Square Teams", purpose: "Shifts and rosters", direction: "Read into Pulse", status: "Demo import (simulated, read-only)", last: "12 Nov 06:00 (simulated)", owner: "Store managers", confirm: "", source: "Square" },
  { id: "square-mkt", name: "Square Marketing", purpose: "Existing email tool, unchanged", direction: "None", status: "Shown for context only", last: "Not imported", owner: "David McParland", confirm: "", source: "Square" },
  { id: "stream", name: "Stream (name to confirm)", purpose: "Delivery-order intermediary feeding marketplace orders into Square", direction: "Read into Pulse", status: "Demo import (simulated)", last: "12 Nov 06:00 (simulated)", owner: "David McParland", confirm: "Exact vendor identity unverified. Dedupe on original channel order ID plus the Stream and Square mapping, so a sale is never counted three times.", source: "Stream" },
  { id: "marketplaces", name: "Deliveroo, Uber Eats, Just Eat", purpose: "Channel settlement files for fees and payouts", direction: "File upload into Pulse", status: "Demo files (simulated)", last: "6 Nov (simulated)", owner: "David McParland", confirm: "API access not assumed.", source: "Marketplaces" },
  { id: "lunchteam", name: "Lunch Team and Feeder", purpose: "Corporate order sample import", direction: "Read into Pulse", status: "Sample import (simulated)", last: "12 Nov 07:00 (simulated)", owner: "Aoife Byrne", confirm: "Feeder spelling from the call transcript; vendor to confirm. Not a promised native connector.", source: "Corporate" },
  { id: "tgtg", name: "Too Good To Go", purpose: "Surplus-sale sample feed", direction: "Read into Pulse", status: "Sample feed (simulated)", last: "11 Nov (simulated)", owner: "Store managers", confirm: "Confirm whether these sales already appear in Square before aggregation.", source: "TGTG" },
  { id: "xero", name: "Xero", purpose: "Accounting destination: reviewed draft export for the accountant", direction: "Draft export out of Pulse", status: "Simulated draft export only", last: "No posting", owner: "David McParland", confirm: "Pulse never posts, files or pays.", source: "Xero" },
  { id: "excel", name: "Excel recipe sheet", purpose: "Recipe import preview with mapped ingredient units", direction: "File upload into Pulse", status: "Preview (simulated)", last: "Imported 1 Apr version", owner: "David McParland", confirm: "", source: "Excel" },
  { id: "bank", name: "Bank statements", purpose: "CSV upload for matching", direction: "File upload into Pulse", status: "Demo CSV (simulated)", last: "11 Nov (simulated)", owner: "David McParland", confirm: "Bank and provider unconfirmed.", source: "Bank" },
  { id: "docs", name: "Supplier PDFs and receipt photos", purpose: "Inbox preview and extraction", direction: "Upload into Pulse", status: "Mock extraction (no external OCR)", last: "12 Nov 08:40 (simulated)", owner: "David McParland", confirm: "", source: "Documents" },
  { id: "whatsapp", name: "WhatsApp", purpose: "Current stock-transfer coordination (context only)", direction: "None", status: "Not connected", last: "Never", owner: "Store managers", confirm: "Pulse does not read chats or send messages. The transfer queue replaces the process locally.", source: "WhatsApp" },
  { id: "squid", name: "Squid", purpose: "Loyalty system, retained", direction: "None", status: "Sample status only", last: "Not imported", owner: "David McParland", confirm: "", source: "Squid" },
  { id: "nari", name: "Nari AI", purpose: "Competitor being considered", direction: "None", status: "Alternative under evaluation, not connected", last: "Never", owner: "David McParland", confirm: "No savings claims carried over.", source: "Nari" },
];
