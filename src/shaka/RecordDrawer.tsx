/* One detail drawer for every record. Home, Finance, Records, the Ontology and
   Activity all open the same views, so a record reads the same everywhere. */
import { useEffect, useState, type ReactNode } from "react";
import { useShaka, act, avocado, transferTotals, stockView, taskStatus, corporateNeeds, AGENTS } from "./store";
import {
  INBOX_SEED, ORDERS, INGREDIENTS, RECIPES, SUPPLIERS, PEOPLE, LOCATIONS, PURCHASES, CORPORATE, MENU, ROSTER_PROPOSAL, WASTE, BACKFILL, SHIFTS, OVERHEADS,
  ingredient, invoiceNet, supplierName, locName, channelName, person, recipeCost, type Invoice,
} from "./model";
import { eur, eur2, qtyU, pctRaw, dayLabel } from "./format";
import { Badge, Btn, Card, KV, RecLink, Table, Notice, Row, eyebrow, inputStyle, Field, Avatar, num, type Tone } from "./ui";

const STATUS_TONE: Record<string, Tone> = { ready: "ok", reviewed: "ok", exported: "accent", review: "warn", duplicate: "bad", archived: "neutral", matched: "ok", investigate: "bad", pending: "warn", resolved: "ok",
  scheduled: "info", dispatched: "warn", received: "ok", draft: "warn", ordered: "info", partial: "warn", approved: "ok", rejected: "neutral", declined: "neutral", proposed: "warn" };
const statusLabel = (s: string) => ({ ready: "Ready", reviewed: "Reviewed", exported: "Exported (draft)", review: "Extraction review", duplicate: "Suspected duplicate", archived: "Archived duplicate",
  matched: "Matched", investigate: "Investigate", pending: "Pending", resolved: "Explained", scheduled: "Scheduled", dispatched: "In transit", received: "Received", draft: "Draft", ordered: "Ordered",
  partial: "Partially received", approved: "Approved", rejected: "Declined", declined: "Declined", proposed: "Proposed" } as Record<string, string>)[s] ?? s;
export const StatusBadge = ({ s }: { s: string }) => <Badge tone={STATUS_TONE[s] ?? "neutral"}>{statusLabel(s)}</Badge>;

export default function RecordDrawer() {
  const s = useShaka();
  const d = s.ui.drawer;
  useEffect(() => {
    if (!d) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") act.close(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [d]);
  if (!d) return null;
  const wide = d.kind === "invoice";
  let head: { kind: string; title: string; status?: ReactNode } = { kind: d.kind, title: d.id };
  let body: ReactNode = null;
  try {
    const r = render(d.kind, d.id);
    head = r.head; body = r.body;
  } catch {
    body = <Notice tone="warn">This record could not be shown.</Notice>;
  }
  return (
    <div onClick={() => act.close()} style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--scrim)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "flex-end" }}>
      <div className="shk-drawer" role="dialog" aria-modal="true" aria-label={head.title} onClick={e => e.stopPropagation()}
        style={{ width: wide ? "min(1040px,100%)" : "min(600px,100%)", height: "100%", display: "flex", flexDirection: "column", background: "var(--overlay)", borderLeft: "1px solid var(--border)", backdropFilter: "blur(20px)", boxShadow: "-30px 0 80px rgba(0,0,0,.5)", animation: "popIn .28s var(--ease) both", color: "var(--ink)", fontFamily: "var(--ui)" }}>
        <div style={{ flex: "none", display: "flex", alignItems: "flex-start", gap: "12px", padding: "20px 24px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Row gap={9}><span style={eyebrow}>{head.kind}</span>{head.status}<Badge tone="neutral">Demo data</Badge></Row>
            <div style={{ fontSize: "21px", fontWeight: 600, letterSpacing: "-.5px", marginTop: "8px" }}>{head.title}</div>
          </div>
          <button type="button" onClick={() => act.close()} aria-label="Close" className="ixm" style={{ flex: "none", width: "32px", height: "32px", border: "1px solid var(--border)", borderRadius: "var(--r-ctl,11px)", background: "none", color: "var(--dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12 M18 6 6 18" /></svg>
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 24px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>{body}</div>
      </div>
    </div>
  );

  function render(kind: string, id: string): { head: typeof head; body: ReactNode } {
    switch (kind) {
      case "invoice": { const inv = s.inbox.find(i => i.id === id); if (!inv) break; return { head: { kind: "Invoice document", title: inv.id + " · " + supplierName(inv.supplier), status: <StatusBadge s={inv.status} /> }, body: <InvoiceReview inv={inv} /> }; }
      case "ingredient": return ingredientView(id);
      case "recipe": return recipeView(id);
      case "costChange": return costView();
      case "order": return orderView(id);
      case "settlement": return settlementView(id);
      case "transfer": return transferView(id);
      case "supplier": return supplierView(id);
      case "person": return personView(id);
      case "location": return locationView(id);
      case "corporate": return corporateView();
      case "po": return poView(id);
      case "roster": return rosterView();
      case "waste": return wasteView(id);
      case "task": return taskView(id);
      case "channel": return channelView(id);
      case "agent": { const a = AGENTS.find(x => x.id === id); if (!a) break; return { head: { kind: "Agent", title: a.name }, body: <><div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--body)" }}>{a.purpose}</div><Btn kind="primary" onClick={() => { act.setAgentFocus(a.id); act.go("Agents"); }}>Open agent</Btn></> }; }
      case "inbox": return { head: { kind: "Invoice batch", title: "FIN-112 · November invoice inbox" }, body: <><Notice>Twenty-four current documents. Readiness and exception counts are calculated from the rows.</Notice><Btn kind="primary" onClick={() => act.go("Finance", "Invoice Inbox")}>Open Invoice Inbox</Btn></> };
      case "backfill": {
        const b = BACKFILL.find(x => x.id === id);
        if (b) return { head: { kind: "Backfill document", title: b.id, status: <StatusBadge s={b.status === "matched" ? "matched" : "investigate"} /> }, body: <><KV rows={[["Month", b.month], ["Supplier", supplierName(b.supplier)], ["Amount", eur2(b.amount)], ["Status", b.status], ["Note", b.note]]} />{b.status !== "matched" && <Btn onClick={() => act.requestReceipt(b.id)} disabled={!!s.backfillRequested[b.id]}>{s.backfillRequested[b.id] ? "Flagged for follow-up" : "Flag for evidence follow-up"}</Btn>}</> };
        return { head: { kind: "Historical backfill", title: "1 April to 30 September" }, body: <Btn kind="primary" onClick={() => act.go("Finance", "Accountant Pack")}>Open Accountant Pack</Btn> };
      }
    }
    return { head: { kind, title: id }, body: <Notice tone="warn">No detail view for this record.</Notice> };
  }

  function ingredientView(id: string) {
    const ing = ingredient(id)!;
    const lines = PURCHASES.filter(p => p.ing === id);
    const qty = lines.reduce((a, p) => a + p.qty, 0), spend = lines.reduce((a, p) => a + p.net, 0);
    const nov = s.inbox.filter(i => i.lines.some(l => l.ing === id));
    const used = RECIPES.filter(r => r.lines.some(l => l.ing === id));
    const stock = stockView(s).filter(r => r.item === id);
    return { head: { kind: "Ingredient", title: ing.name }, body: <>
      <KV rows={[["Unit", ing.unit], ["Supplier", ing.supplier.startsWith("SUP") ? <RecLink kind="supplier" id={ing.supplier}>{supplierName(ing.supplier)}</RecLink> : ing.supplier],
        ["October unit cost", ing.unit === "receipt" ? "Mixed receipts" : eur2(ing.octCost) + " / " + ing.unit], ["Current valuation", ing.unit === "receipt" ? "n/a" : eur2(s.prices[id]) + " / " + ing.unit + (id === "ING-AVO" && s.costChange.status !== "approved" ? " (update pending)" : "")],
        ["October purchases", lines.length ? qtyU(qty, ing.unit) + " · " + eur(spend) : "Prepared in-house"]]} />
      {id === "ING-AVO" && <Notice tone="warn" title="Price change.">INV-AVO-118 bills avocados at €1.32, up from €1.10 (+20%). <RecLink kind="costChange" id="CC-AVO-118">Review CC-AVO-118</RecLink></Notice>}
      {used.length > 0 && <Card title="Used in recipes" pad="14px 16px">{used.map(r => <Row key={r.id} style={{ padding: "5px 0" }}><RecLink kind="recipe" id={r.id}>{r.name}</RecLink><span style={{ color: "var(--dim)", fontSize: "12.5px" }}>{qtyU(r.lines.find(l => l.ing === id)!.qty, ing.unit)} per bowl</span></Row>)}</Card>}
      {stock.length > 0 && <Card title="Stock" pad="14px 16px">{stock.map(r => <Row key={r.loc} style={{ padding: "4px 0", fontSize: "13px" }}><span style={{ flex: 1 }}>{locName(r.loc)}</span><span style={num}>{qtyU(r.onHand, ing.unit)} on hand · {qtyU(r.available, ing.unit)} available</span></Row>)}</Card>}
      {nov.length > 0 && <Card title="November invoices" pad="14px 16px">{nov.map(i => <Row key={i.id} style={{ padding: "4px 0" }}><RecLink kind="invoice" id={i.id} /><StatusBadge s={i.status} /></Row>)}</Card>}
      {lines.length > 0 && <Table rowKey={r => r.id} pageSize={8} dense cols={[
        { key: "d", label: "Date", w: "90px", render: r => dayLabel(r.date) }, { key: "i", label: "Invoice", w: "120px", render: r => r.invoice },
        { key: "s", label: "Site", w: "90px", render: r => locName(r.loc) }, { key: "q", label: "Qty", align: "right", w: "80px", render: r => qtyU(r.qty, r.unit) },
        { key: "n", label: "Net", align: "right", w: "90px", render: r => eur2(r.net) }]} rows={lines} footer="October invoice lines" />}
    </> };
  }

  function recipeView(id: string) {
    const r = RECIPES.find(x => x.id === id)!;
    const a = avocado(s);
    const oct = recipeCost(r, Object.fromEntries(INGREDIENTS.map(i => [i.id, i.octCost])));
    const cur = recipeCost(r, s.prices);
    const pending = r.lines.some(l => l.ing === "ING-AVO") && s.costChange.status === "pending";
    return { head: { kind: "Recipe · version " + (cur !== oct ? 2 : 1), title: r.name + " · " + r.id }, body: <>
      <KV rows={[["Net selling price", eur2(r.price)], ["October valuation (v1, from 1 Apr)", eur2(oct)], ["Current November valuation", eur2(cur) + (cur !== oct ? " (v2, from 12 Nov)" : "")], ["Ingredient contribution", eur2(r.price - cur) + " · " + pctRaw((r.price - cur) / r.price)], ["Yield", r.yieldNote]]} />
      {pending && <Notice tone="warn" title="Pending cost change.">Approving CC-AVO-118 moves this recipe from {eur2(cur)} to {eur2(cur + Math.round(0.5 * a.delta))}.</Notice>}
      <Notice tone="neutral">Ingredient contribution excludes labour, packaging and channel fees. It is not net profit.</Notice>
      <Table rowKey={l => l.ing} cols={[
        { key: "i", label: "Ingredient", render: l => <RecLink kind="ingredient" id={l.ing}>{ingredient(l.ing)?.name}</RecLink> },
        { key: "q", label: "Qty", align: "right", w: "90px", render: l => qtyU(l.qty, ingredient(l.ing)?.unit ?? "") },
        { key: "u", label: "Unit cost", align: "right", w: "100px", render: l => eur2(s.prices[l.ing]) },
        { key: "c", label: "Cost", align: "right", w: "80px", render: l => eur2(Math.round(l.qty * s.prices[l.ing])) }]} rows={r.lines} footer={"Total " + eur2(cur)} />
    </> };
  }

  function costView() {
    const a = avocado(s);
    return { head: { kind: "Cost change", title: "CC-AVO-118 · Avocado", status: <StatusBadge s={a.status} /> }, body: <>
      <KV rows={[["Source invoice", <RecLink kind="invoice" id="INV-AVO-118" />], ["Supplier", <RecLink kind="supplier" id="SUP-GBP">Green Basket Produce</RecLink>], ["Invoice line", a.qty + " avocados at " + eur2(a.newC) + " = " + eur2(a.lineTotal) + " before any demo tax"],
        ["Previous unit cost", eur2(a.oldC)], ["New unit cost", eur2(a.newC) + " (+" + Math.round(a.pct * 100) + "%)"], ["Per 100 avocados", "+" + eur2(a.per100)], ["Salmon bowl", eur2(a.salmonBefore) + " to " + eur2(a.salmonAfter) + " (+" + eur2(a.perBowl) + ")"],
        ["Ingredient contribution", eur2(a.contribBefore) + " to " + eur2(a.contribAfter) + " · " + pctRaw(a.contribPctBefore) + " to " + pctRaw(a.contribPctAfter)]]} />
      <Card title="Affected recipes" pad="14px 16px">{a.affected.map(r => <Row key={r.id} style={{ padding: "5px 0", fontSize: "13px" }}><RecLink kind="recipe" id={r.id}>{r.name}</RecLink><span style={{ flex: 1 }} /><span style={num}>{eur2(r.before)} to {eur2(r.after)}</span></Row>)}</Card>
      <Notice tone="neutral">Excludes labour, packaging and channel fees; this is ingredient contribution, not net profit. Approval updates the current November recipe valuation only. October history is never rewritten.</Notice>
      {a.status === "pending" ? <Row><Btn kind="primary" onClick={() => act.approveCost()}>Approve cost update</Btn><Btn onClick={() => act.rejectCost()}>Decline</Btn></Row>
        : <Notice tone={a.status === "approved" ? "ok" : "neutral"}>{a.status === "approved" ? "Approved. Recipes now value avocado at €1.32 from 12 November." : "Declined. Recipes keep the €1.10 valuation."}</Notice>}
    </> };
  }

  function orderView(id: string) {
    const o = ORDERS.find(x => x.id === id)!;
    return { head: { kind: "Sales order", title: o.id + " · " + channelName(o.channel) }, body: <>
      <KV rows={[["Order date", dayLabel(o.date) + " " + o.time], ["Location", <RecLink kind="location" id={o.loc}>{locName(o.loc)}</RecLink>], ["Channel", <RecLink kind="channel" id={o.channel}>{channelName(o.channel)}</RecLink>],
        ["Square reference", o.squareRef], ["Original channel ID", o.sourceRef || "In-store, Square only"], ["Path", o.via], ["Net sales", eur2(o.net)], ["Channel fee (assumed)", eur2(o.fee)], ["Allocated ingredient cost", eur2(o.cogs)], ["Contribution after fees and ingredients", eur2(o.net - o.fee - o.cogs)]]} />
      <Table rowKey={l => l[0]} cols={[{ key: "i", label: "Item", render: l => MENU[l[0]].recipe ? <RecLink kind="recipe" id={MENU[l[0]].recipe!}>{MENU[l[0]].name}</RecLink> : MENU[l[0]].name },
        { key: "q", label: "Qty", align: "right", w: "70px", render: l => l[1] }, { key: "p", label: "Price", align: "right", w: "80px", render: l => eur2(MENU[l[0]].price) }, { key: "t", label: "Total", align: "right", w: "90px", render: l => eur2(MENU[l[0]].price * l[1]) }]} rows={o.lines} />
      <Notice tone="neutral">Deduplicated on the original channel order ID and the Stream to Square mapping, so this sale is counted once. Allocated ingredient cost spreads October's consumed ingredient cost across orders; it is not the theoretical recipe cost.</Notice>
    </> };
  }

  function settlementView(id: string) {
    const x = s.settlements.find(z => z.id === id)!;
    const gross = x.lines.reduce((a, l) => a + l.gross, 0), comm = x.lines.reduce((a, l) => a + l.commission, 0);
    const gap = x.received === null ? null : x.expected - x.received;
    return { head: { kind: "Settlement", title: x.id + " · " + channelName(x.channel), status: <StatusBadge s={x.status} /> }, body: <>
      <KV rows={[["Order period", x.period], ["Paid on", dayLabel(x.paidOn)], ["Expected payout", eur2(x.expected)], ["Bank receipt", x.received === null ? "Not yet received" : eur2(x.received)], ["Difference", gap === null ? "n/a" : eur2(gap)], ["Location", x.loc === "ALL" ? "Both shops" : locName(x.loc)]]} />
      <Notice tone={x.status === "investigate" ? "warn" : "neutral"}>{x.note} Settlement date and order dates differ: these are November cash movements and do not change the October P&L.</Notice>
      <Table rowKey={l => l.day} cols={[{ key: "d", label: "Statement line", render: l => l.day }, { key: "o", label: "Orders", align: "right", w: "70px", render: l => l.orders },
        { key: "g", label: "Gross", align: "right", w: "90px", render: l => eur2(l.gross) }, { key: "c", label: "Commission", align: "right", w: "100px", render: l => eur2(l.commission) }, { key: "n", label: "Net", align: "right", w: "90px", render: l => eur2(l.gross - l.commission + l.adjustments) }]}
        rows={x.lines} footer={"Gross " + eur2(gross) + " · commission " + eur2(comm) + " · expected " + eur2(x.expected)} />
      {x.id === "SET-DEL-1106" && <SettleActions id={x.id} />}
      {s.settlementNotes[x.id] && <Notice tone="ok" title="Explanation.">{s.settlementNotes[x.id]}</Notice>}
    </> };
  }

  function transferView(id: string) {
    const t = s.transfers.find(z => z.id === id)!;
    const sv = stockView(s);
    return { head: { kind: "Stock transfer", title: t.id + " · " + locName(t.from) + " to " + locName(t.to), status: <StatusBadge s={t.status} /> }, body: <>
      <KV rows={[["Scheduled", t.when], ["Prepares", person(t.prepares)?.name], ["Transports", person(t.transports)?.name + " (refrigerated van)"], ["Receives", person(t.receives)?.name], ["Carrying value", eur2(transferTotals(t))], ["Dispatched", t.dispatchedAt ?? "Not yet"], ["Received", t.receivedAt ?? "Not yet"]]} />
      <Table rowKey={i => i.item} cols={[{ key: "i", label: "Item", render: i => <RecLink kind="ingredient" id={i.item}>{ingredient(i.item)?.name}</RecLink> },
        { key: "q", label: "Qty", align: "right", w: "70px", render: i => qtyU(i.qty, ingredient(i.item)?.unit ?? "") }, { key: "v", label: "Value", align: "right", w: "80px", render: i => eur2(Math.round(i.qty * i.unitCost)) },
        { key: "o", label: locName(t.from), align: "right", w: "110px", render: i => qtyU(sv.find(r => r.item === i.item && r.loc === t.from)?.onHand ?? 0, ingredient(i.item)?.unit ?? "") },
        { key: "tr", label: "In transit", align: "right", w: "90px", render: i => qtyU(t.status === "dispatched" ? i.qty : 0, ingredient(i.item)?.unit ?? "") },
        { key: "d", label: locName(t.to), align: "right", w: "100px", render: i => qtyU(sv.find(r => r.item === i.item && r.loc === t.to)?.onHand ?? 0, ingredient(i.item)?.unit ?? "") }]} rows={t.items} />
      <Notice tone="neutral">{t.note}</Notice>
      {t.status === "scheduled" && <Btn kind="primary" onClick={() => act.dispatch(t.id)}>Dispatch from {locName(t.from)}</Btn>}
      {t.status === "dispatched" && <Btn kind="primary" onClick={() => act.receive(t.id)}>Confirm receipt at {locName(t.to)}</Btn>}
    </> };
  }

  function supplierView(id: string) {
    const sup = SUPPLIERS.find(x => x.id === id)!;
    const lines = PURCHASES.filter(p => p.supplier === id);
    const invs = Array.from(new Set(lines.map(l => l.invoice)));
    const nov = s.inbox.filter(i => i.supplier === id);
    return { head: { kind: "Supplier", title: sup.name }, body: <>
      <KV rows={[["Category", sup.category], ["Contact", sup.contact], ["Terms", sup.terms], ["October purchases", eur(lines.reduce((a, l) => a + l.net, 0)) + " across " + invs.length + " documents"], ["Last October delivery", lines.length ? dayLabel(lines[lines.length - 1].date) : "n/a"], ["Note", sup.note]]} />
      <Card title="November inbox" pad="14px 16px">{nov.length ? nov.map(i => <Row key={i.id} style={{ padding: "4px 0" }}><RecLink kind="invoice" id={i.id} /><span style={{ flex: 1 }} /><span style={num}>{eur2(invoiceNet(i))}</span><StatusBadge s={i.status} /></Row>) : <span style={{ fontSize: "12.5px", color: "var(--dim)" }}>None</span>}</Card>
      <Card title="Purchase orders" pad="14px 16px">{s.pos.filter(p => p.supplier === id).map(p => <Row key={p.id} style={{ padding: "4px 0" }}><RecLink kind="po" id={p.id} /><StatusBadge s={p.status} /></Row>)}{!s.pos.some(p => p.supplier === id) && <span style={{ fontSize: "12.5px", color: "var(--dim)" }}>None</span>}</Card>
    </> };
  }

  function personView(id: string) {
    const p = PEOPLE.find(x => x.id === id)!;
    const hrs = SHIFTS.filter(x => x.person === id).reduce((a, x) => a + x.hours, 0);
    return { head: { kind: p.demo ? "Sample user (fictional)" : "Owner", title: p.name }, body: <>
      <Row><Avatar initials={p.initials} tint={p.tint} size={40} /><div><div style={{ fontWeight: 600 }}>{p.role}</div><div style={{ fontSize: "12.5px", color: "var(--dim)" }}>{p.dept}</div></div></Row>
      <KV rows={[["Location", p.loc === "ALL" ? "All sites" : locName(p.loc)], ["Email", p.email + " (labelled mock record)"], ["Access (simulated)", p.access], ["October hours", hrs ? hrs + " h" : "Not on timesheets"]]} />
      <Card title="Open tasks" pad="14px 16px">{s.tasks.filter(t => t.owner === id).map(t => <Row key={t.id} style={{ padding: "4px 0" }}><RecLink kind="task" id={t.id}>{t.title}</RecLink><span style={{ flex: 1 }} /><Badge tone={taskStatus(t, s) === "Done" ? "ok" : "neutral"}>{taskStatus(t, s)}</Badge></Row>)}</Card>
    </> };
  }

  function locationView(id: string) {
    const l = LOCATIONS.find(x => x.id === id)!;
    const sales = ORDERS.filter(o => o.loc === id).reduce((a, o) => a + o.net, 0);
    return { head: { kind: "Location", title: l.name }, body: <>
      <KV rows={[["Address", l.address], ["Manager", <RecLink kind="person" id={l.manager}>{person(l.manager)?.name}</RecLink>], ["Trading", l.hours], ["October net sales", eur(sales)], ["Other operating costs", eur(OVERHEADS.filter(o => o.loc === id).reduce((a, o) => a + o.amount, 0))]]} />
      <Notice tone="neutral">{l.note}</Notice>
      <Btn onClick={() => act.go("Dashboard", "Locations")}>Open location comparison</Btn>
    </> };
  }

  function corporateView() {
    const n = corporateNeeds();
    return { head: { kind: "Corporate order", title: CORPORATE.id + " · " + CORPORATE.customer, status: <Badge tone="ok">Confirmed</Badge> }, body: <>
      <KV rows={[["When", "Fri 13 Nov, " + CORPORATE.time], ["Channel", "Lunch Team"], ["Location", "Baggot Street"], ["Bowls", CORPORATE.lines.map(([r, q]) => q + " " + RECIPES.find(x => x.id === r)?.name.replace(" bowl", "").toLowerCase()).join(" + ") + " = " + n.bowls],
        ["Net value", eur2(n.value) + " (demo €12 per bowl)"], ["Prep owner", person(CORPORATE.prepOwner)?.name], ["Dispatch owner", person(CORPORATE.dispatchOwner)?.name], ["Packaging", CORPORATE.packaging + " bowls"], ["Customer", CORPORATE.customerNote]]} />
      <Notice tone="warn" title="Dietary note.">{CORPORATE.dietary} {s.prep.dietaryReviewed ? "Reviewed by a manager." : ""}</Notice>
      <Card title="Ingredient requirements from recipes" pad="14px 16px">{Object.entries(n.need).map(([ing, q]) => <Row key={ing} style={{ padding: "3px 0", fontSize: "13px" }}><RecLink kind="ingredient" id={ing}>{ingredient(ing)?.name}</RecLink><span style={{ flex: 1 }} /><span style={num}>{qtyU(q, ingredient(ing)?.unit ?? "")}{n.bySalmon[ing] && (ing === "ING-SALMON" || ing === "ING-AVO") ? " (salmon bowls: " + qtyU(n.bySalmon[ing], ingredient(ing)?.unit ?? "") + ")" : ""}</span></Row>)}</Card>
      <Btn kind="primary" onClick={() => act.go("Stock", "Prep")}>Open prep checklist</Btn>
    </> };
  }

  function poView(id: string) {
    const p = s.pos.find(x => x.id === id)!;
    return { head: { kind: "Purchase order", title: p.id + " · " + supplierName(p.supplier), status: <StatusBadge s={p.status} /> }, body: <>
      <KV rows={[["Supplier", <RecLink kind="supplier" id={p.supplier}>{supplierName(p.supplier)}</RecLink>], ["Deliver to", locName(p.loc)], ["Due", p.due], ["Value", eur2(p.lines.reduce((a, l) => a + l.qty * l.unitCost, 0))]]} />
      <Table rowKey={l => l.ing} cols={[{ key: "i", label: "Item", render: l => <RecLink kind="ingredient" id={l.ing}>{ingredient(l.ing)?.name}</RecLink> }, { key: "o", label: "Ordered", align: "right", w: "90px", render: l => qtyU(l.qty, ingredient(l.ing)?.unit ?? "") },
        { key: "r", label: "Received", align: "right", w: "90px", render: l => qtyU(l.received, ingredient(l.ing)?.unit ?? "") }, { key: "c", label: "Unit cost", align: "right", w: "90px", render: l => eur2(l.unitCost) }]} rows={p.lines} />
      <Notice tone="neutral">{p.note}</Notice>
      {p.status === "draft" && <Btn kind="primary" onClick={() => act.approvePO(p.id)}>Approve draft (simulated)</Btn>}
      {(p.status === "ordered" || p.status === "partial") && <Btn onClick={() => act.receivePO(p.id)}>Record goods received</Btn>}
    </> };
  }

  function rosterView() {
    return { head: { kind: "Roster proposal", title: "Blackrock · four low-demand hours", status: <StatusBadge s={s.roster.status} /> }, body: <>
      <KV rows={[["Owner", "Conor Walsh (manager approval)"], ["Hours", ROSTER_PROPOSAL.hours + " h"], ["Loaded cost", eur2(ROSTER_PROPOSAL.rate) + "/h (illustrative)"], ["Potential weekly saving", eur(ROSTER_PROPOSAL.saving)]]} />
      {ROSTER_PROPOSAL.changes.map(c => <Card key={c.day} pad="12px 14px"><div style={{ fontSize: "13px" }}>{c.day}: {person(c.person)?.name}, {c.from} to {c.to} (−{c.cut} h)</div><div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "4px" }}>{c.why}</div></Card>)}
      <Notice tone="neutral">{ROSTER_PROPOSAL.caveats}</Notice>
      {s.roster.status === "proposed" ? <Row><Btn kind="primary" onClick={() => act.decideRoster(true)}>Approve as Conor</Btn><Btn onClick={() => act.decideRoster(false)}>Decline</Btn></Row> : <Notice tone="ok">Decision recorded: {s.roster.status}.</Notice>}
    </> };
  }

  function wasteView(id: string) {
    const w = WASTE.find(x => x.id === id)!;
    return { head: { kind: "Waste record", title: w.id + " · " + ingredient(w.item)?.name }, body: <KV rows={[["Date", dayLabel(w.date)], ["Site", locName(w.loc)], ["Quantity", qtyU(w.qty, ingredient(w.item)?.unit ?? "")], ["Reason", w.reason], ["Cost", eur2(w.cost)], ["Recovery", w.recovered]]} /> };
  }

  function taskView(id: string) {
    const t = s.tasks.find(x => x.id === id)!;
    const st = taskStatus(t, s);
    return { head: { kind: "Task", title: t.title, status: <Badge tone={st === "Done" ? "ok" : st === "In progress" ? "info" : "neutral"}>{st}</Badge> }, body: <>
      <KV rows={[["Owner", <RecLink kind="person" id={t.owner}>{person(t.owner)?.name}</RecLink>], ["Due", t.due], ["Priority", t.priority], ["Department", t.dept], ["Related record", t.related.kind === "none" ? "None" : <RecLink kind={t.related.kind} id={t.related.id}>{t.related.label}</RecLink>]]} />
      {t.auto && <Notice tone="neutral">Closes automatically when the related record is resolved.</Notice>}
      <Row>{(["Open", "In progress", "Done"] as const).map(x => <Btn key={x} kind={st === x ? "primary" : "ghost"} small onClick={() => act.setTaskStatus(t.id, x)}>{x}</Btn>)}</Row>
    </> };
  }

  function channelView(id: string) {
    const rows = ORDERS.filter(o => o.channel === id);
    const sales = rows.reduce((a, o) => a + o.net, 0), fees = rows.reduce((a, o) => a + o.fee, 0), cogs = rows.reduce((a, o) => a + o.cogs, 0);
    return { head: { kind: "Channel", title: channelName(id) }, body: <>
      <KV rows={[["October orders", rows.length.toLocaleString("en-IE")], ["Net sales", eur(sales)], ["Fees (assumed)", eur(fees)], ["Allocated ingredient cost", eur(cogs)], ["Contribution", eur(sales - fees - cogs)]]} />
      <Notice tone="neutral">Fee rates are demo assumptions, not verified commercial commission rates.</Notice>
      <Btn onClick={() => act.go("Sales", "Channels")}>Open channel economics</Btn>
    </> };
  }
}

function SettleActions({ id }: { id: string }) {
  const s = useShaka();
  const [note, setNote] = useState("");
  const x = s.settlements.find(z => z.id === id)!;
  const task = s.tasks.find(t => t.id === "T-103");
  if (x.status !== "investigate") return null;
  return (
    <Card title="Investigate" pad="14px 16px" sub="Never auto-creates a confirmed debt and never alters the P&L. Record what the Deliveroo adjustment statement shows.">
      <Row style={{ marginBottom: "10px" }}>{task && <><span style={{ fontSize: "12.5px", color: "var(--dim)" }}>Task:</span><RecLink kind="task" id={task.id}>{task.title}</RecLink></>}</Row>
      <Field label="What explains the difference?"><textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ ...inputStyle, height: "auto", padding: "8px 12px", resize: "vertical" }} placeholder="e.g. €126 refund adjustment on order DLV-… per statement" /></Field>
      <Row style={{ marginTop: "10px" }}><Btn kind="primary" onClick={() => act.explainSettlement(id, note)}>Mark explained</Btn></Row>
    </Card>
  );
}

/* Invoice review: document preview beside the extracted lines. */
function InvoiceReview({ inv }: { inv: Invoice }) {
  const s = useShaka();
  const editable = inv.status === "review" || inv.status === "ready";
  const total = invoiceNet(inv);
  const c = { ready: s.inbox.filter(i => i.status === "ready" || i.status === "reviewed").length, exc: s.inbox.filter(i => i.status === "review" || i.status === "duplicate").length };
  return (
    <>
      <Row gap={8}><Badge tone="ok">{c.ready} ready</Badge><Badge tone={c.exc ? "warn" : "ok"}>{c.exc} exceptions</Badge><span style={{ fontSize: "12px", color: "var(--faint)" }}>FIN-112 · {s.inbox.length} documents</span></Row>
      {inv.issue && <Notice tone={inv.status === "duplicate" ? "bad" : "warn"} title={inv.status === "duplicate" ? "Suspected duplicate of " + inv.dupOf + "." : "Needs review."}>{inv.issue}</Notice>}
      <div className="shk-drawer-body" style={{ display: "grid", gridTemplateColumns: "minmax(260px,.9fr) 1.3fr", gap: "16px", alignItems: "start" }}>
        <div style={{ background: "#f6f7f4", color: "#1d2124", borderRadius: "12px", padding: "20px 20px 26px", fontFamily: "var(--ui)", boxShadow: "0 10px 30px rgba(0,0,0,.3)", filter: inv.source.includes("photo") ? "blur(.3px) contrast(.95)" : "none" }} aria-label="Document preview (mock)">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
            <div><div style={{ fontWeight: 700, fontSize: "15px" }}>{supplierName(inv.supplier)}</div><div style={{ fontSize: "11px", color: "#5d646a" }}>{inv.source} · mock preview</div></div>
            <div style={{ textAlign: "right", fontSize: "11px", color: "#5d646a" }}><div style={{ fontWeight: 600, color: "#1d2124" }}>{inv.id}</div>{dayLabel(inv.date)}</div>
          </div>
          <div style={{ fontSize: "11px", color: "#5d646a", marginTop: "12px" }}>Deliver to: Shaka Poké, {locName(inv.loc)}</div>
          <div style={{ marginTop: "14px", borderTop: "1px solid #d5d8d2" }}>
            {(INBOX_ORIGINAL[inv.id] ?? inv.lines).map(l => (
              <div key={l.id} style={{ display: "flex", gap: "8px", fontSize: "12px", padding: "7px 0", borderBottom: "1px solid #e4e6e1" }}>
                <span style={{ flex: 1 }}>{l.desc}</span><span>{l.qty} {l.unit}</span><span style={{ width: "62px", textAlign: "right" }}>{eur2(l.unitCost)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "12px", fontWeight: 600 }}><span>Net</span><span>{eur2((INBOX_ORIGINAL[inv.id] ?? inv.lines).reduce((a, l) => a + Math.round(l.qty * l.unitCost), 0))}</span></div>
          <div style={{ fontSize: "10.5px", color: "#5d646a", marginTop: "6px" }}>Tax: {inv.taxField === "Unreadable" ? "▒▒▒▒" : "as printed (not interpreted)"}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
          <div style={{ ...eyebrow }}>Extracted lines · confidence {Math.round(inv.conf * 100)}%</div>
          {inv.lines.map(l => (
            <div key={l.id} style={{ padding: "12px 14px", border: "1px solid " + (l.flag ? "var(--warn)" : "var(--border)"), borderRadius: "var(--r-md,14px)", background: "var(--surface)" }}>
              <Row gap={8}><span style={{ flex: 1, minWidth: 0, fontSize: "13px", fontWeight: 500 }}>{l.desc}</span><Badge tone={l.conf < 0.8 ? "warn" : "ok"}>{Math.round(l.conf * 100)}%</Badge></Row>
              <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "4px" }}>Mapped to <RecLink kind="ingredient" id={l.ing}>{ingredient(l.ing)?.name}</RecLink>{l.flag ? " · " + l.flag : ""}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px", marginTop: "10px" }}>
                <Field label="Quantity"><input aria-label="Quantity" type="number" step="0.1" min="0" disabled={!editable} value={l.qty} onChange={e => act.editLine(inv.id, l.id, { qty: Math.max(0, parseFloat(e.target.value) || 0) })} style={inputStyle} /></Field>
                <Field label="Unit"><select aria-label="Unit" disabled={!editable} value={l.unit} onChange={e => act.editLine(inv.id, l.id, { unit: e.target.value })} style={inputStyle}>{Array.from(new Set([l.unit, "kg", "each", "L", "case", "receipt", "box", "bag"])).map(u => <option key={u} value={u}>{u}</option>)}</select></Field>
                <Field label="Line net"><div style={{ ...inputStyle, display: "flex", alignItems: "center", border: "1px solid var(--border)", background: "none" }}>{eur2(Math.round(l.qty * l.unitCost))}</div></Field>
              </div>
              {l.expectQty !== undefined && editable && l.flag && <div style={{ marginTop: "8px" }}><Btn small onClick={() => act.editLine(inv.id, l.id, { qty: l.expectQty!, unit: l.expectUnit! })}>Use delivery note value: {l.expectQty} {l.expectUnit}</Btn></div>}
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "8px" }}>
            <Field label="Site"><select disabled={!editable} value={inv.loc} onChange={e => act.setInvoiceField(inv.id, { loc: e.target.value as "BAG" | "BLK" })} style={inputStyle}><option value="BAG">Baggot Street</option><option value="BLK">Blackrock</option></select></Field>
            <Field label="Tax field (draft, configurable)" help="No statutory treatment is inferred."><input disabled={!editable} value={inv.taxField} onChange={e => act.setInvoiceField(inv.id, { taxField: e.target.value })} style={inputStyle} /></Field>
          </div>
          <Row style={{ justifyContent: "space-between" }}><span style={{ fontSize: "13px", color: "var(--dim)" }}>Extracted net</span><span style={{ ...num, fontSize: "18px", fontWeight: 600 }}>{eur2(total)}</span></Row>
          <Row>
            {inv.status === "review" && <Btn kind="primary" disabled={inv.lines.some(l => !!l.flag)} title={inv.lines.some(l => !!l.flag) ? "Correct flagged lines first" : undefined} onClick={() => act.markReviewed(inv.id)}>Mark reviewed</Btn>}
            {inv.status === "duplicate" && <><Btn kind="primary" onClick={() => act.confirmDuplicate(inv.id)}>Confirm duplicate and archive</Btn><Btn onClick={() => act.notDuplicate(inv.id)}>Not a duplicate</Btn></>}
            {inv.status === "ready" && <Btn kind="primary" onClick={() => act.markReviewed(inv.id)}>Mark reviewed</Btn>}
            {inv.id === "INV-AVO-118" && <Btn onClick={() => act.open("costChange", "CC-AVO-118")}>Open cost change</Btn>}
            <Btn kind="quiet" onClick={() => act.close()}>Close</Btn>
          </Row>
          <Notice tone="neutral">Reviewing never pays or posts anything. Export to the accountant is a separate, simulated step in the Invoice Inbox.</Notice>
        </div>
      </div>
    </>
  );
}
const INBOX_ORIGINAL: Record<string, Invoice["lines"]> = Object.fromEntries(INBOX_SEED.map(i => [i.id, i.lines]));
