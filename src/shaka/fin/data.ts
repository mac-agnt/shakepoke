/* Shaka Poké finance-first demo: the one seeded dataset every view reads.
   All money is integer cents. Every figure is ILLUSTRATIVE DEMO DATA: none of it
   is David's real sales, costs or supplier pricing. */

export type LocId = "BAG" | "BLK";
export const LOCS: { id: LocId; name: string; short: string }[] = [
  { id: "BAG", name: "Baggot Street", short: "Baggot" },
  { id: "BLK", name: "Blackrock", short: "Blackrock" },
];
export const locName = (id: string) => LOCS.find(l => l.id === id)?.name ?? (id === "ALL" ? "Both shops" : id);

export const PACK_MONTH = { ym: "2026-10", label: "October 2026", short: "Oct", prev: "September" };
export const DEMO_TODAY = "Thursday 12 November 2026";

/* ── Expense categories (Xero account mapping is a suggestion, to confirm) ── */
export const CATEGORIES = [
  { id: "FISH", name: "Fish & seafood", account: "Cost of sales: food (to map)" },
  { id: "PROD", name: "Fresh produce", account: "Cost of sales: food (to map)" },
  { id: "POUL", name: "Poultry", account: "Cost of sales: food (to map)" },
  { id: "DRY", name: "Dry goods & sauces", account: "Cost of sales: food (to map)" },
  { id: "PACK", name: "Packaging", account: "Cost of sales: packaging (to map)" },
  { id: "CLEAN", name: "Cleaning & consumables", account: "Overheads: consumables (to map)" },
  { id: "REPAIR", name: "Repairs & maintenance", account: "Overheads: repairs (to map)" },
] as const;
export type CatId = (typeof CATEGORIES)[number]["id"];
export const catName = (id: string) => CATEGORIES.find(c => c.id === id)?.name ?? id;

/* ── Suppliers ────────────────────────────────────────────────────────────── */
export const SUPPLIERS = [
  { id: "HFF", name: "Harbour Fresh Fish", prefix: "INV-HFF", note: "Fish, weekly to Baggot Street and fortnightly to Blackrock." },
  { id: "GBP", name: "Green Basket Produce", prefix: "INV-GBP", note: "Fruit and vegetables, including avocados." },
  { id: "LPC", name: "Liffey Poultry Co.", prefix: "INV-LPC", note: "Chicken thigh, fortnightly." },
  { id: "CAT", name: "Caterway", prefix: "INV-CAT", note: "Rice, sauces, dry goods and packaging." },
  { id: "TES", name: "Tesco (staff receipt)", prefix: "RCT-TES", note: "Top-up shopping on a staff card." },
  { id: "LID", name: "Lidl (staff receipt)", prefix: "RCT-LID", note: "Top-up shopping on a staff card." },
  { id: "WOO", name: "Woodies (staff receipt)", prefix: "RCT-WOO", note: "Small repairs." },
];
export const supplierName = (id: string) => SUPPLIERS.find(s => s.id === id)?.name ?? id;

/* ── Curated ingredient catalogue (phase one covers up to 20) ─────────────── */
export type Ingredient = { id: string; name: string; unit: string; cat: CatId; prior: number };
/* prior = September average unit price from the onboarding invoice import (cents). */
export const INGREDIENTS: Ingredient[] = [
  { id: "AVO", name: "Avocado", unit: "each", cat: "PROD", prior: 110 },
  { id: "SAL", name: "Salmon fillet", unit: "kg", cat: "FISH", prior: 1890 },
  { id: "TUN", name: "Yellowfin tuna", unit: "kg", cat: "FISH", prior: 2650 },
  { id: "CHK", name: "Chicken thigh", unit: "kg", cat: "POUL", prior: 795 },
  { id: "TOF", name: "Tofu", unit: "kg", cat: "DRY", prior: 520 },
  { id: "RIC", name: "Sushi rice", unit: "kg", cat: "DRY", prior: 245 },
  { id: "EDA", name: "Edamame (frozen)", unit: "kg", cat: "DRY", prior: 610 },
  { id: "MAN", name: "Mango", unit: "each", cat: "PROD", prior: 95 },
  { id: "CUC", name: "Cucumber", unit: "each", cat: "PROD", prior: 62 },
  { id: "CAB", name: "Red cabbage", unit: "each", cat: "PROD", prior: 110 },
  { id: "SPO", name: "Spring onion", unit: "bunch", cat: "PROD", prior: 55 },
  { id: "PIN", name: "Pineapple", unit: "each", cat: "PROD", prior: 180 },
  { id: "SPI", name: "Baby spinach", unit: "kg", cat: "PROD", prior: 740 },
  { id: "SEA", name: "Seaweed salad", unit: "kg", cat: "DRY", prior: 1180 },
  { id: "SES", name: "Sesame seeds", unit: "kg", cat: "DRY", prior: 690 },
  { id: "SOY", name: "Soy sauce", unit: "L", cat: "DRY", prior: 410 },
  { id: "MAY", name: "Kewpie mayo", unit: "L", cat: "DRY", prior: 920 },
  { id: "NOR", name: "Nori (50 sheets)", unit: "pack", cat: "DRY", prior: 1150 },
];
export const ingredient = (id?: string) => INGREDIENTS.find(i => i.id === id);

/* October unit prices billed (cents). */
const P: Record<string, number> = {
  AVO: 132, SAL: 1940, TUN: 2650, CHK: 760, TOF: 520, RIC: 245, EDA: 640, MAN: 105, CUC: 62, CAB: 110, SPO: 55, PIN: 180, SPI: 790,
  SEA: 1180, SES: 690, SOY: 410, MAY: 980, NOR: 1150,
};

/* ── Invoices ─────────────────────────────────────────────────────────────── */
export type Line = {
  id: string; desc: string; ing?: string; cat: CatId; qty: number; unit: string; unitPrice: number;
  /* An extraction the reviewer must check, and the suggested correction. */
  issue?: string; suggest?: { qty: number; unit: string };
};
export type Issue = "line" | "location" | "category" | "duplicate";
export type InvStatus = "approved" | "attention" | "excluded";
export type Invoice = {
  id: string; kind: "supplier" | "receipt"; supplier: string; date: string; loc: LocId | null; status: InvStatus;
  source: string; file: string; lines: Line[];
  issue?: Issue; issueText?: string; suggestLoc?: LocId; duplicateOf?: string; capturedBy?: string;
};

let n = 0;
const L = (ing: string, qty: number, extra?: Partial<Line>): Line => {
  const i = ingredient(ing)!;
  return { id: "L" + ++n, desc: i.name, ing, cat: i.cat, qty, unit: i.unit, unitPrice: P[ing], ...extra };
};
const X = (desc: string, cat: CatId, qty: number, unit: string, unitPrice: number): Line => ({ id: "L" + ++n, desc, cat, qty, unit, unitPrice });
const EMAIL = "Forwarded to the invoice inbox (demo)";
const PHOTO = "Staff receipt photo (demo)";

const gbpBag = (): Line[] => [L("AVO", 360), L("MAN", 60), L("CUC", 80), L("CAB", 20), L("SPO", 40), L("PIN", 30), L("SPI", 6)];
const gbpBlk = (): Line[] => [L("AVO", 180), L("MAN", 30), L("CUC", 40), L("CAB", 10), L("SPO", 20), L("PIN", 14)];
const hffBag = (): Line[] => [L("SAL", 52), L("TUN", 15)];
const catBag = (): Line[] => [L("RIC", 200), L("EDA", 30), L("TOF", 40), L("SEA", 20), L("SES", 5), L("SOY", 20), L("MAY", 20), L("NOR", 6), X("Bowls and lids, 750 ml", "PACK", 1200, "each", 38)];

export const INVOICES_SEED: Invoice[] = [
  /* Caterway */
  { id: "INV-CAT-7769", kind: "supplier", supplier: "CAT", date: "2026-10-02", loc: "BAG", status: "approved", source: EMAIL, file: "INV-CAT-7769.pdf", lines: catBag() },
  { id: "INV-CAT-7781", kind: "supplier", supplier: "CAT", date: "2026-10-09", loc: null, status: "attention", source: EMAIL, file: "INV-CAT-7781.pdf",
    issue: "location", issueText: "No delivery address on the invoice, so the shop is unknown. Suggested: Blackrock (delivery note signed by the Blackrock manager).", suggestLoc: "BLK",
    lines: [L("RIC", 160), L("EDA", 24), L("TOF", 30), L("SEA", 16), L("SOY", 15), L("MAY", 15), L("NOR", 4), X("Bowls and lids, 750 ml", "PACK", 900, "each", 38)] },
  { id: "INV-CAT-7794", kind: "supplier", supplier: "CAT", date: "2026-10-16", loc: "BAG", status: "approved", source: EMAIL, file: "INV-CAT-7794.pdf", lines: [...catBag(), X("Blue roll and sanitiser", "CLEAN", 1, "case", 6450)] },
  /* Harbour Fresh Fish */
  { id: "INV-HFF-2190", kind: "supplier", supplier: "HFF", date: "2026-10-05", loc: "BAG", status: "approved", source: EMAIL, file: "INV-HFF-2190.pdf", lines: hffBag() },
  { id: "INV-HFF-2201", kind: "supplier", supplier: "HFF", date: "2026-10-12", loc: "BAG", status: "approved", source: EMAIL, file: "INV-HFF-2201.pdf", lines: hffBag() },
  { id: "INV-HFF-2202", kind: "supplier", supplier: "HFF", date: "2026-10-12", loc: "BLK", status: "approved", source: EMAIL, file: "INV-HFF-2202.pdf", lines: [L("SAL", 48), L("TUN", 12)] },
  { id: "INV-HFF-2215", kind: "supplier", supplier: "HFF", date: "2026-10-19", loc: "BAG", status: "approved", source: EMAIL, file: "INV-HFF-2215.pdf", lines: hffBag() },
  { id: "INV-HFF-2231", kind: "supplier", supplier: "HFF", date: "2026-10-26", loc: "BAG", status: "attention", source: EMAIL, file: "INV-HFF-2231.pdf",
    issue: "line", issueText: "Salmon quantity read as 1.2 box. The delivery note and price suggest 52 kg.",
    lines: [L("SAL", 1.2, { unit: "box", unitPrice: 1940, issue: "Read as 1.2 box at €19.40. Price matches per kg, not per box.", suggest: { qty: 52, unit: "kg" } }), L("TUN", 15)] },
  { id: "INV-HFF-2232", kind: "supplier", supplier: "HFF", date: "2026-10-26", loc: "BLK", status: "approved", source: EMAIL, file: "INV-HFF-2232.pdf", lines: [L("SAL", 48), L("TUN", 12)] },
  /* Green Basket Produce */
  { id: "INV-GBP-1021", kind: "supplier", supplier: "GBP", date: "2026-10-06", loc: "BAG", status: "approved", source: EMAIL, file: "INV-GBP-1021.pdf", lines: gbpBag() },
  { id: "INV-GBP-1022", kind: "supplier", supplier: "GBP", date: "2026-10-07", loc: "BLK", status: "approved", source: EMAIL, file: "INV-GBP-1022.pdf", lines: gbpBlk() },
  { id: "INV-GBP-1030", kind: "supplier", supplier: "GBP", date: "2026-10-13", loc: "BAG", status: "approved", source: EMAIL, file: "INV-GBP-1030.pdf", lines: gbpBag() },
  { id: "INV-GBP-1031", kind: "supplier", supplier: "GBP", date: "2026-10-14", loc: "BLK", status: "approved", source: EMAIL, file: "INV-GBP-1031.pdf", lines: gbpBlk() },
  { id: "INV-GBP-1039", kind: "supplier", supplier: "GBP", date: "2026-10-20", loc: "BAG", status: "approved", source: EMAIL, file: "INV-GBP-1039.pdf", lines: gbpBag() },
  { id: "INV-GBP-1039B", kind: "supplier", supplier: "GBP", date: "2026-10-20", loc: "BAG", status: "attention", source: "Paper copy scanned on 22 Oct (demo)", file: "INV-GBP-1039 (scan).jpg",
    issue: "duplicate", issueText: "Same supplier, date, invoice number and total as INV-GBP-1039, which is already approved. Likely the paper copy of the emailed PDF.", duplicateOf: "INV-GBP-1039",
    lines: gbpBag() },
  { id: "INV-GBP-1046", kind: "supplier", supplier: "GBP", date: "2026-10-27", loc: "BAG", status: "approved", source: EMAIL, file: "INV-GBP-1046.pdf", lines: gbpBag() },
  { id: "INV-GBP-1047", kind: "supplier", supplier: "GBP", date: "2026-10-28", loc: "BLK", status: "attention", source: EMAIL, file: "INV-GBP-1047.pdf",
    issue: "line", issueText: "Avocado quantity read as 18 box. At €1.32 a unit, the line total on the invoice (€237.60) matches 180 avocados.",
    lines: [L("AVO", 18, { unit: "box", issue: "Read as 18 box at €1.32. The printed line total €237.60 fits 180 each.", suggest: { qty: 180, unit: "each" } }), L("MAN", 30), L("CUC", 40), L("CAB", 10), L("SPO", 20), L("PIN", 14)] },
  /* Liffey Poultry */
  { id: "INV-LPC-0418", kind: "supplier", supplier: "LPC", date: "2026-10-08", loc: "BAG", status: "approved", source: EMAIL, file: "INV-LPC-0418.pdf", lines: [L("CHK", 140)] },
  { id: "INV-LPC-0421", kind: "supplier", supplier: "LPC", date: "2026-10-15", loc: "BLK", status: "approved", source: EMAIL, file: "INV-LPC-0421.pdf", lines: [L("CHK", 70)] },
  { id: "INV-LPC-0426", kind: "supplier", supplier: "LPC", date: "2026-10-22", loc: "BAG", status: "approved", source: EMAIL, file: "INV-LPC-0426.pdf", lines: [L("CHK", 140)] },
  { id: "INV-LPC-0429", kind: "supplier", supplier: "LPC", date: "2026-10-29", loc: "BLK", status: "approved", source: EMAIL, file: "INV-LPC-0429.pdf", lines: [L("CHK", 70)] },
  /* Staff receipts */
  { id: "RCT-LID-0388", kind: "receipt", supplier: "LID", date: "2026-10-10", loc: "BAG", status: "approved", source: PHOTO, file: "Receipt photo, Lidl.jpg", capturedBy: "Baggot Street manager",
    lines: [X("Limes and coriander top-up", "PROD", 1, "receipt", 2860)] },
  { id: "RCT-TES-0419", kind: "receipt", supplier: "TES", date: "2026-10-17", loc: "BLK", status: "attention", source: PHOTO, file: "Receipt photo, Tesco.jpg", capturedBy: "Blackrock manager",
    issue: "category", issueText: "Mixed basket: the receipt shows spinach and bin bags. Pick the category it should be filed under.",
    lines: [X("Baby spinach 2 x 200 g, bin bags", "PROD", 1, "receipt", 1185)] },
  { id: "RCT-WOO-0102", kind: "receipt", supplier: "WOO", date: "2026-10-21", loc: "BLK", status: "approved", source: PHOTO, file: "Receipt photo, Woodies.jpg", capturedBy: "Blackrock manager",
    lines: [X("Fridge door hinge and screws", "REPAIR", 1, "receipt", 3495)] },
];

export const lineTotal = (l: Line) => Math.round(l.qty * l.unitPrice);
export const invoiceTotal = (inv: Invoice) => inv.lines.reduce((a, l) => a + lineTotal(l), 0);

/* Bills David expects every month. A missing one shows on the Accountant Pack. */
export const EXPECTED_BILLS = [
  { id: "EXP-PANDA", label: "Waste collection, Baggot Street", supplier: "Panda (expected monthly)", loc: "BAG" as LocId },
];

/* ── Monthly figures for Money & Reports ──────────────────────────────────── */
export const MONTHS = [
  { ym: "2026-04", label: "April 2026", short: "Apr" },
  { ym: "2026-05", label: "May 2026", short: "May" },
  { ym: "2026-06", label: "June 2026", short: "Jun" },
  { ym: "2026-07", label: "July 2026", short: "Jul" },
  { ym: "2026-08", label: "August 2026", short: "Aug" },
  { ym: "2026-09", label: "September 2026", short: "Sep" },
  { ym: "2026-10", label: "October 2026", short: "Oct" },
];
type ByLoc = Record<LocId, number | null>;
const m = (bag: number | null, blk: number | null): ByLoc => ({ BAG: bag === null ? null : bag * 100, BLK: blk === null ? null : blk * 100 });

/* Square sales: one CSV import path, history back to 1 April 2026. */
export const SALES: Record<string, ByLoc> = {
  "2026-04": m(44800, 21400), "2026-05": m(47900, 25600), "2026-06": m(49300, 29800), "2026-07": m(46200, 33100),
  "2026-08": m(41600, 34200), "2026-09": m(50700, 27300), "2026-10": m(52000, 28000),
};
/* Approved supplier spend before October: onboarding import of the most recent 90 days of invoices.
   October is never stored here; it is summed live from the invoice inbox. */
export const HIST_SPEND: Record<string, ByLoc> = {
  "2026-04": m(null, null), "2026-05": m(null, null), "2026-06": m(null, null), "2026-07": m(null, null),
  "2026-08": m(13200, 7900), "2026-09": m(14400, 6900),
};
/* Owner-entered labour cost (gross pay plus employer costs). */
export const LABOUR: Record<string, ByLoc> = {
  "2026-04": m(null, null), "2026-05": m(null, null), "2026-06": m(null, null), "2026-07": m(null, null),
  "2026-08": m(17100, 12800), "2026-09": m(17600, 11500), "2026-10": m(17900, 11300),
};
/* Owner-entered other expenses: rent, utilities, card fees, insurance. */
export const OTHER: Record<string, ByLoc> = {
  "2026-04": m(null, null), "2026-05": m(null, null), "2026-06": m(null, null), "2026-07": m(null, null),
  "2026-08": m(9600, 6300), "2026-09": m(9700, 6300), "2026-10": m(9800, 6400),
};
