/* Home assistant: deterministic demo answers, read from the same store as every
   page. No model call. Each answer says it is a demo example and links to evidence. */
import { getFin, fin, avocado, counts, monthRow, pending, packChecklist, packProgress, spendTotals, correctedTotal } from "./store";
import { PACK_MONTH, supplierName, locName, lineTotal } from "./data";
import { eur, eur2, pct } from "../format";

export type Answer = { tool: string; effect: "read" | "write"; text: string; cols?: string[]; rows?: string[][]; actions: { label: string; primary?: boolean; go?: () => void; ask?: string }[] };

const DEMO = "Demo example answer from illustrative data.";
const dShort = (iso: string) => +iso.slice(8) + " Oct";

export const SUGGESTED = [
  "How much did we spend on avocados last month?",
  "What needs my approval?",
  "Compare Baggot Street and Blackrock",
  "Prepare my accountant pack",
];

export function finAnswer(q: string): Answer {
  const s = getFin();
  const t = q.toLowerCase();

  if (/avocado|avo\b/.test(t)) {
    const a = avocado(s);
    const invs = new Set(a.lines.map(r => r.inv.id)).size;
    const change = a.change === null ? "" : ", up " + Math.round(a.change * 100) + "% from " + eur2(a.prior) + " in September";
    const pend = a.pendingQty ? " One more invoice, " + a.pendingInv.join(", ") + " (" + a.pendingQty + " avocados), is waiting for review and is not counted yet." : " Every October avocado invoice is now reviewed and counted.";
    return {
      tool: "Demo example · approved invoice lines", effect: "read",
      text: "In October you approved " + eur2(a.spend) + " of avocado spend: " + a.qty.toLocaleString("en-IE") + " avocados across " + invs + " Green Basket Produce invoices. Baggot Street " + eur2(a.BAG.spend) + " (" + a.BAG.qty.toLocaleString("en-IE") + "), Blackrock " + eur2(a.BLK.spend) + " (" + a.BLK.qty.toLocaleString("en-IE") + "). You paid " + eur2(a.price ?? 0) + " each" + change + "." + pend + " This is what was bought, not what went into bowls. " + DEMO,
      cols: ["Invoice", "Date", "Shop", "Avocados", "Spend"],
      rows: a.lines.map(r => [r.inv.id, dShort(r.inv.date), locName(r.inv.loc ?? ""), String(r.line.qty), eur2(lineTotal(r.line))]),
      actions: [
        { label: "Open avocado costs", primary: true, go: () => fin.focusIngredient("AVO") },
        ...(a.pendingInv.length ? [{ label: "Review " + a.pendingInv[0], go: () => fin.openInvoice(a.pendingInv[0]) }] : []),
      ],
    };
  }

  if (/approv|need.*(me|my|check)|review|attention|waiting|to do|todo/.test(t)) {
    const open = s.invoices.filter(i => i.status === "attention");
    if (!open.length) return { tool: "Demo example · invoice inbox", effect: "read", text: "Nothing needs your approval. All 24 October documents are reviewed or excluded, so the accountant pack is ready to export. " + DEMO,
      actions: [{ label: "Open Accountant Pack", primary: true, go: () => fin.go("Pack", "Exports") }] };
    return {
      tool: "Demo example · invoice inbox", effect: "read",
      text: open.length + (open.length === 1 ? " document needs" : " documents need") + " you before the October pack is ready. " + counts(s).reviewed + " of 24 are already reviewed. Nothing is paid, posted or sent from here; approving only moves a bill into your reports. " + DEMO,
      cols: ["Document", "Supplier", "Why", "Value"],
      rows: open.map(i => [i.id, supplierName(i.supplier), i.issue === "line" ? "Unclear line" : i.issue === "location" ? "Shop not stated" : i.issue === "category" ? "Pick a category" : "Possible duplicate", eur(correctedTotal(i))]),
      actions: [{ label: "Review invoices", primary: true, go: () => fin.go("Invoices", "Needs review") }, { label: "Accountant Pack", go: () => fin.go("Pack", "Checklist") }],
    };
  }

  if (/compare|baggot|blackrock|location|shop|site/.test(t)) {
    const b = monthRow(s, PACK_MONTH.ym, "BAG"), k = monthRow(s, PACK_MONTH.ym, "BLK");
    const f = (v: number | null) => (v === null ? "not provided" : eur(v));
    return {
      tool: "Demo example · October management figures", effect: "read",
      text: "In October Baggot Street took " + f(b.sales) + " and Blackrock " + f(k.sales) + ", " + f((b.sales ?? 0) + (k.sales ?? 0)) + " together. After approved supplier spend, labour and other costs, the indicative operating profit is " + f(b.profit) + " at Baggot Street (" + pct(b.profit ?? 0, b.sales ?? 1) + " of sales) and " + f(k.profit) + " at Blackrock (" + pct(k.profit ?? 0, k.sales ?? 1) + "). " + (pending(s).ALL.count ? "It is provisional: " + pending(s).ALL.count + " invoices are still to review. " : "") + "This is a management estimate, not an accountant-verified statement. " + DEMO,
      cols: ["Line", "Baggot Street", "Blackrock"],
      rows: [["Sales (Square)", f(b.sales), f(k.sales)], ["Approved supplier spend", f(b.spend), f(k.spend)], ["Labour (entered)", f(b.labour), f(k.labour)], ["Other expenses (entered)", f(b.other), f(k.other)], ["Indicative operating profit", f(b.profit), f(k.profit)]],
      actions: [{ label: "Open Money & Reports", primary: true, go: () => fin.go("Money", "Locations") }],
    };
  }

  if (/accountant|pack|xero|export|month.?end|csv/.test(t)) {
    const p = packProgress(s), list = packChecklist(s).filter(i => !i.done);
    return {
      tool: "Demo example · accountant pack checklist", effect: "read",
      text: "The October pack is " + p.done + " of " + p.total + " done. " + (list.length ? "Still open: " + list.map(i => i.label.toLowerCase()).join("; ") + ". " : "") + "When you are ready, export the reviewed invoices, the expense categories and the management summary as CSV files for your accountant. They are Xero-compatible once the fields are mapped; nothing is posted to Xero from here. " + DEMO,
      actions: [{ label: "Open Accountant Pack", primary: true, go: () => fin.go("Pack", "Checklist") }, ...(counts(s).attention ? [{ label: "Review invoices", go: () => fin.go("Invoices", "Needs review") }] : [])],
    };
  }

  if (/profit|p&l|pnl|money|sales|spend|cost|october|month/.test(t)) {
    const a = monthRow(s, PACK_MONTH.ym, "ALL");
    return {
      tool: "Demo example · October management figures", effect: "read",
      text: "October sales were " + eur(a.sales ?? 0) + " across both shops. Approved supplier spend is " + eur(spendTotals(s).ALL) + ", labour " + eur(a.labour ?? 0) + " and other expenses " + eur(a.other ?? 0) + ", leaving an indicative operating profit of " + eur(a.profit ?? 0) + ". " + a.statusLabel + ". " + DEMO,
      actions: [{ label: "Open Money & Reports", primary: true, go: () => fin.go("Money", "Overview") }],
    };
  }

  return {
    tool: "Demo example · scope", effect: "read",
    text: "In this demo I answer a small set of questions from the invoice, ingredient and monthly figures you see on the other pages. In the live product this stays a read-only helper: it explains your numbers and never changes them. Try one of these.",
    actions: SUGGESTED.map(x => ({ label: x, ask: x })),
  };
}
