/* Home chat answers. Deterministic, read from shared state, each with links
   back into the records. No live model call; the tool label says what was read. */
import { getState, act, pnl, inboxCounts, avocado, attention, corporateNeeds, stockView, approvals, backfillCounts, labourHours } from "./store";
import { PURCHASES, CORPORATE, FORECAST, ingredient, RECIPES } from "./model";
import { eur, eur2, pct, qtyU, words } from "./format";

export type Answer = { tool: string; effect: "read" | "write"; text: string; cols?: string[]; rows?: string[][]; actions: { label: string; primary?: boolean; go?: () => void; ask?: string }[] };

export function shakaAnswer(q: string): Answer {
  const s = getState();
  const t = q.toLowerCase();
  if (/avocado|avo\b/.test(t)) {
    const a = avocado(s);
    const lines = PURCHASES.filter(p => p.ing === "ING-AVO");
    const weeks = [["1 to 4 Oct", 1, 4], ["5 to 11 Oct", 5, 11], ["12 to 18 Oct", 12, 18], ["19 to 25 Oct", 19, 25], ["26 to 31 Oct", 26, 31]] as const;
    const rows = weeks.map(([w, from, to]) => { const l = lines.filter(p => +p.date.slice(8) >= from && +p.date.slice(8) <= to); return [w, String(l.reduce((x, p) => x + p.qty, 0)), eur2(110), eur(l.reduce((x, p) => x + p.net, 0))]; });
    rows.push(["INV-AVO-118 (11 Nov)", String(a.qty), eur2(a.newC), eur2(a.lineTotal)]);
    return { tool: "ingredient_spend.read", effect: "read",
      text: "October avocado spend was " + eur(lines.reduce((x, p) => x + p.net, 0)) + " for " + lines.reduce((x, p) => x + p.qty, 0).toLocaleString("en-IE") + " avocados at " + eur2(a.oldC) + ". Green Basket Produce's latest invoice, INV-AVO-118, bills " + a.qty + " at " + eur2(a.newC) + ": up " + Math.round(a.pct * 100) + "%, or " + eur2(a.per100) + " more per hundred. Half an avocado goes in each salmon bowl, so its ingredient cost moves from " + eur2(a.salmonBefore) + " to " + eur2(a.salmonAfter) + ". That excludes labour, packaging and channel fees. " + (a.status === "pending" ? "The cost update is waiting for your approval." : "You " + a.status + " the cost update."),
      cols: ["Period", "Avocados", "Unit", "Spend"], rows,
      actions: [{ label: "Review CC-AVO-118", primary: true, go: () => act.open("costChange", "CC-AVO-118") }, { label: "Ingredient spend", go: () => act.go("Purchasing", "Ingredient Spend") }] };
  }
  if (/blackrock|why.*down|loss|losing/.test(t)) {
    const P = pnl();
    const B = P.BLK, G = P.BAG;
    return { tool: "pnl.by_location", effect: "read",
      text: "Blackrock lost an estimated " + eur(-B.profit) + " in October on " + eur(B.sales) + " of sales (" + pct(B.profit, B.sales) + "), against Baggot Street's " + eur(G.profit) + " profit (" + pct(G.profit, G.sales) + "). In this demo data the gap comes from two lines: other operating costs, mostly the market stall licence and rent, run at " + pct(B.other, B.sales, 0) + " of sales against " + pct(G.other, G.sales, 0) + " at Baggot, and labour runs at " + pct(B.labour, B.sales, 0) + " against " + pct(G.labour, G.sales, 0) + ". Weekend trade is strong; quieter weekdays and winter seasonality carry the fixed costs. Labour Watch has an optional four-hour scenario worth €64 a week, which on its own would not close the gap.",
      cols: ["Line", "Blackrock", "Baggot Street"], rows: [["Net sales", eur(B.sales), eur(G.sales)], ["Ingredients", eur(B.cogs), eur(G.cogs)], ["Labour", eur(B.labour) + " (" + labourHours("BLK") + " h)", eur(G.labour) + " (" + labourHours("BAG") + " h)"], ["Channel fees", eur(B.fees), eur(G.fees)], ["Other costs", eur(B.other), eur(G.other)], ["Est. operating profit", eur(B.profit), eur(G.profit)]],
      actions: [{ label: "Open location comparison", primary: true, go: () => act.go("Dashboard", "Locations") }, { label: "Labour scenario", go: () => act.go("Team", "Labour") }] };
  }
  if (/review|need.*(me|you)|attention|what.*(open|waiting)|approv/.test(t)) {
    const c = inboxCounts(s), ap = approvals(s).filter(a => a.pending);
    const att = attention(s);
    return { tool: "work.queue", effect: "read",
      text: att.length ? "There are " + words(att.length) + " things open. " + c.exceptions + " of the " + c.total + " invoices in FIN-112 need review (" + c.review + " extraction checks, " + c.duplicate + " suspected duplicates), and " + ap.length + " approvals are pending in total. Nothing is paid, posted or sent until you say yes." : "Nothing needs you right now. Every invoice exception, approval and story task has been handled.",
      cols: ["Item", "Why", "When"], rows: att.map(a => [a.title, a.why, a.age]),
      actions: [{ label: "Open approvals", primary: true, go: () => act.go("Work", "Approvals") }, { label: "Invoice inbox", go: () => act.go("Finance", "Invoice Inbox") }] };
  }
  if (/prep|tomorrow|bowl|corporate|lunch team|cor-1113/.test(t)) {
    const n = corporateNeeds();
    const sv = stockView(s).filter(r => r.loc === "BAG");
    const rows = Object.entries(n.need).map(([ing, q]) => [ingredient(ing)?.name ?? ing, qtyU(q, ingredient(ing)?.unit ?? ""), qtyU(sv.find(r => r.item === ing)?.onHand ?? 0, ingredient(ing)?.unit ?? "") + " on hand"]);
    return { tool: "prep.plan", effect: "read",
      text: "Tomorrow at " + CORPORATE.time + ", Harbour Office Team has " + n.bowls + " bowls booked through Lunch Team at Baggot Street: 24 chicken, 16 salmon and 8 tofu, " + eur2(n.value) + " net. From the recipes, the salmon bowls alone need " + n.bySalmon["ING-SALMON"] + " kg salmon and " + n.bySalmon["ING-AVO"] + " avocados. Sofia owns prep, Aoife dispatches, packaging is 48. Walk-in demand is a separate illustrative baseline of about " + (s.prep.forecastOverride?.value ?? FORECAST.walkIn) + " bowls. One guest note mentions an allergy, so a manager must review it before prep" + (s.prep.dietaryReviewed ? " (done)." : "."),
      cols: ["Ingredient", "For COR-1113", "Baggot stock"], rows,
      actions: [{ label: "Open prep checklist", primary: true, go: () => act.go("Stock", "Prep") }, { label: "Order record", go: () => act.open("corporate", CORPORATE.id) }] };
  }
  if (/deliveroo|settlement|payout|126/.test(t)) {
    const x = s.settlements.find(z => z.id === "SET-DEL-1106")!;
    return { tool: "settlements.match", effect: "read",
      text: "SET-DEL-1106 covers Deliveroo orders from 26 October to 1 November. The statement lines add up to an expected payout of " + eur2(x.expected) + "; the bank received " + eur2(x.received ?? 0) + " on 6 November, " + eur(x.expected - (x.received ?? 0)) + " short. It is marked Investigate: it could be a refund, promotion or fee adjustment, so it is not treated as lost revenue and the October P&L is unchanged.",
      actions: [{ label: "Open SET-DEL-1106", primary: true, go: () => act.open("settlement", "SET-DEL-1106") }, { label: "Reconciliation", go: () => act.go("Finance", "Reconciliation") }] };
  }
  if (/transfer|van|friday.*salmon|salsa/.test(t)) {
    const tr = s.transfers.find(z => z.id === "TRF-1113")!;
    return { tool: "transfers.read", effect: "read", text: "TRF-1113 moves 2 kg salmon and 3 kg pineapple salsa from Baggot Street to Blackrock on Friday at 15:30, a €66 carrying value. Aoife prepares it, you drive it in the van, Conor receives it. Status: " + tr.status + ". It is a stock movement, not a purchase or a sale.",
      actions: [{ label: "Open transfer", primary: true, go: () => act.open("transfer", "TRF-1113") }] };
  }
  if (/profit|p&l|pnl|october|margin|sales/.test(t)) {
    const P = pnl(), A = P.ALL;
    return { tool: "pnl.summary", effect: "read", text: "October net sales were " + eur(A.sales) + ". After " + eur(A.cogs) + " ingredients, " + eur(A.labour) + " labour, " + eur(A.fees) + " channel fees and " + eur(A.other) + " other costs, estimated operating profit is " + eur(A.profit) + " (" + pct(A.profit, A.sales) + "). That is not statutory net profit: no debt, tax or depreciation is assumed.",
      cols: ["Location", "Sales", "Profit", "Margin"], rows: [["Baggot Street", eur(P.BAG.sales), eur(P.BAG.profit), pct(P.BAG.profit, P.BAG.sales)], ["Blackrock", eur(P.BLK.sales), eur(P.BLK.profit), pct(P.BLK.profit, P.BLK.sales)], ["Food Truck", eur(0), eur(P.TRK.profit), "n/a"]],
      actions: [{ label: "Open P&L", primary: true, go: () => act.go("Finance", "P&L") }] };
  }
  if (/backfill|accountant|year.end|xero|vat|tax/.test(t)) {
    const b = backfillCounts();
    return { tool: "accountant_pack.read", effect: "read", text: b.matched + " of " + b.total + " historical documents from 1 April are matched (" + pct(b.matched, b.total, 0) + "). " + b.missing + " bank lines have no receipt and " + b.ambiguous + " costs cannot be allocated to a site yet. Tax figures stay draft until your accountant confirms treatment; Pulse prepares a Xero draft export and never files or pays.",
      actions: [{ label: "Accountant pack", primary: true, go: () => act.go("Finance", "Accountant Pack") }] };
  }
  const recipesTxt = RECIPES.map(r => r.name.toLowerCase()).join(", ");
  return { tool: "search.records", effect: "read", text: "I can answer from the shared Shaka Poké records: invoices, ingredient costs, recipes (" + recipesTxt + "), sales by channel, settlements, stock, transfers, prep and labour. Try one of these.",
    actions: [{ label: "Show my avocado spend", ask: "Show my avocado spend" }, { label: "Why is Blackrock down?", ask: "Why is Blackrock down?" }, { label: "What needs reviewing?", ask: "What needs reviewing?" }, { label: "Prepare tomorrow's bowls", ask: "Prepare tomorrow's bowls" }] };
}
