import { useMemo, useState } from "react";
import { useShaka, act, avocado, cogsBridge, stockView, type State } from "../store";
import { PURCHASES, SUPPLIERS, INGREDIENTS, ingredient, supplierName, locName, invoiceNet } from "../model";
import { eur, eur2, qtyU, dayLabel } from "../format";
import { Page, Card, Grid, Split, Stat, Table, Badge, Btn, Seg, Notice, RecLink, Columns, KV, Row } from "../ui";
import { StatusBadge } from "../RecordDrawer";
import { tabOf } from "../nav";

export default function Purchasing() {
  const s = useShaka();
  const tab = tabOf(s, "Purchasing");
  if (tab === "Suppliers") return <Suppliers s={s} />;
  if (tab === "Purchase Orders") return <POs s={s} />;
  if (tab === "Ingredient Spend") return <Spend s={s} />;
  return <Overview s={s} />;
}

function Overview({ s }: { s: State }) {
  const a = avocado(s), b = cogsBridge();
  const open = s.pos.filter(p => p.status === "ordered" || p.status === "partial" || p.status === "draft");
  const low = stockView(s).filter(r => r.low);
  return (
    <Page period="Incoming goods · October purchases and November deliveries" title="Purchasing"
      sub="Four or five fresh-food deliveries a day, plus Tesco top-ups bought by staff. Purchasing owns suppliers and orders; Stock owns physical quantities.">
      <Grid min={170}>
        <Stat label="October purchases" value={eur(b.purchases)} sub="Not the same as consumed COGS" onClick={() => act.go("Purchasing", "Ingredient Spend")} />
        <Stat label="Open purchase orders" value={open.length} sub={s.pos.filter(p => p.status === "draft").length + " draft awaiting approval"} onClick={() => act.go("Purchasing", "Purchase Orders")} />
        <Stat label="Price alerts" value={a.status === "pending" ? 1 : 0} sub="Avocado +20%" tone={a.status === "pending" ? "warn" : "ok"} onClick={() => act.open("costChange", "CC-AVO-118")} />
        <Stat label="Lines below par" value={low.length} sub="Across both shops" tone={low.length ? "warn" : "ok"} onClick={() => act.go("Stock", "Stock Levels")} />
      </Grid>
      <Split left={
        <Card title="Upcoming and open deliveries">
          <Table rowKey={p => p.id} rows={s.pos.filter(p => p.status !== "received")} onRow={p => act.open("po", p.id)} cols={[
            { key: "id", label: "PO", w: "90px", render: p => p.id }, { key: "s", label: "Supplier", w: "minmax(150px,1fr)", render: p => supplierName(p.supplier) },
            { key: "l", label: "Site", w: "110px", render: p => locName(p.loc) }, { key: "d", label: "Due", w: "100px", render: p => p.due }, { key: "st", label: "Status", w: "150px", render: p => <StatusBadge s={p.status} /> }]} />
        </Card>} right={
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Card title="Missing goods">
            <div style={{ fontSize: "13px", lineHeight: 1.55 }}><RecLink kind="po" id="PO-2040" />: spinach 7 kg received of 10 kg at Blackrock. Balance promised Friday.</div>
          </Card>
          <Card title="Price alert" extra={<StatusBadge s={a.status} />}>
            <div style={{ fontSize: "13px", lineHeight: 1.55 }}>Avocado {eur2(a.oldC)} to {eur2(a.newC)} (+{Math.round(a.pct * 100)}%, +{eur2(a.per100)} per 100) on <RecLink kind="invoice" id="INV-AVO-118" />. Salmon bowl +{eur2(a.perBowl)}.</div>
            <Row style={{ marginTop: "10px" }}><Btn small kind="primary" onClick={() => act.open("costChange", "CC-AVO-118")}>Review cost change</Btn></Row>
          </Card>
        </div>} />
    </Page>
  );
}

function Suppliers({ s }: { s: State }) {
  const rows = SUPPLIERS.map(x => {
    const lines = PURCHASES.filter(p => p.supplier === x.id);
    return { ...x, spend: lines.reduce((a, l) => a + l.net, 0), docs: new Set(lines.map(l => l.invoice)).size, last: lines.length ? lines[lines.length - 1].date : "", nov: s.inbox.filter(i => i.supplier === x.id).length };
  });
  return (
    <Page period="October 2026 spend · November documents" title="Suppliers" sub="Contacts are mock labels. Caterway is spelled as rendered on the call and is unverified; Harbour Fresh Fish and Green Basket Produce are fictional.">
      <Card>
        <Table rowKey={r => r.id} rows={rows} onRow={r => act.open("supplier", r.id)} cols={[
          { key: "n", label: "Supplier", w: "minmax(150px,1.2fr)", render: r => <span style={{ color: "var(--ink)" }}>{r.name}</span> }, { key: "c", label: "Category", w: "minmax(170px,1.3fr)", render: r => r.category },
          { key: "sp", label: "October spend", align: "right", w: "120px", render: r => eur(r.spend) }, { key: "d", label: "Documents", align: "right", w: "100px", render: r => r.docs },
          { key: "l", label: "Last delivery", w: "110px", render: r => r.last ? dayLabel(r.last) : "n/a" }, { key: "nv", label: "November inbox", align: "right", w: "120px", render: r => r.nov },
          { key: "ct", label: "Contact (mock)", w: "minmax(160px,1.2fr)", render: r => r.contact }]} footer={"Total " + eur(rows.reduce((a, r) => a + r.spend, 0))} />
      </Card>
    </Page>
  );
}

function POs({ s }: { s: State }) {
  const [f, setF] = useState<"All" | "Draft" | "Ordered" | "Partial" | "Received">("All");
  const rows = s.pos.filter(p => f === "All" || p.status === f.toLowerCase());
  return (
    <Page period="Draft, ordered, received" title="Purchase Orders" sub="Approvals are local and simulated: nothing is sent to a supplier from this demo.">
      <Card extra={<Seg options={["All", "Draft", "Ordered", "Partial", "Received"] as const} value={f} onChange={setF} />} title="Orders">
        <Table rowKey={p => p.id} rows={rows} onRow={p => act.open("po", p.id)} cols={[
          { key: "id", label: "PO", w: "90px", render: p => <span style={{ color: "var(--ink)" }}>{p.id}</span> }, { key: "s", label: "Supplier", w: "minmax(150px,1fr)", render: p => supplierName(p.supplier) },
          { key: "l", label: "Lines", w: "minmax(200px,1.6fr)", render: p => p.lines.map(l => qtyU(l.qty, ingredient(l.ing)?.unit ?? "") + " " + ingredient(l.ing)?.name.toLowerCase()).join(", ") },
          { key: "v", label: "Value", align: "right", w: "100px", render: p => eur2(p.lines.reduce((a, l) => a + l.qty * l.unitCost, 0)) }, { key: "d", label: "Due", w: "100px", render: p => p.due },
          { key: "st", label: "Status", w: "150px", render: p => <StatusBadge s={p.status} /> },
          { key: "a", label: "", w: "170px", render: p => p.status === "draft" ? <Btn small kind="primary" onClick={() => act.approvePO(p.id)}>Approve (simulated)</Btn> : p.status === "ordered" || p.status === "partial" ? <Btn small onClick={() => act.receivePO(p.id)}>Record received</Btn> : <span style={{ color: "var(--faint)" }}>Complete</span> }]} />
      </Card>
      <Notice tone="neutral">PO-2040 shows a partial delivery: spinach 7 of 10 kg. Recording the balance updates Blackrock's stock level.</Notice>
    </Page>
  );
}

function Spend({ s }: { s: State }) {
  const [sel, setSel] = useState("ING-AVO");
  const rows = useMemo(() => INGREDIENTS.filter(i => !i.prepared).map(i => {
    const lines = PURCHASES.filter(p => p.ing === i.id);
    const q = lines.reduce((a, l) => a + l.qty, 0), net = lines.reduce((a, l) => a + l.net, 0);
    return { ...i, q, net, per: q ? Math.round(net / q) : 0, nov: s.inbox.filter(x => x.lines.some(l => l.ing === i.id)).length };
  }).sort((a, b) => b.net - a.net), [s.inbox]);
  const ing = ingredient(sel)!;
  const weeks = [["1 to 4 Oct", 1, 4], ["5 to 11 Oct", 5, 11], ["12 to 18 Oct", 12, 18], ["19 to 25 Oct", 19, 25], ["26 to 31 Oct", 26, 31]] as const;
  const series = weeks.map(([label, a, b]) => ({ label, values: [PURCHASES.filter(p => p.ing === sel && +p.date.slice(8) >= a && +p.date.slice(8) <= b).reduce((x, p) => x + p.net, 0)] }));
  const novLines = s.inbox.flatMap(i => i.lines.filter(l => l.ing === sel).map(l => ({ inv: i, l })));
  const novNet = novLines.reduce((a, x) => a + Math.round(x.l.qty * x.l.unitCost), 0);
  const a = avocado(s);
  return (
    <Page period="October purchases · quantity-normalised" title="Ingredient Spend"
      sub="Spend per ingredient, not just per supplier. Unit costs are normalised to €/kg, €/L or €/unit. Purchases are what was bought; consumed COGS is what was used.">
      <Notice tone="neutral" title="Tax.">Prices are shown net. No zero-tax assumption is inferred from net prices; tax fields stay draft until the accountant confirms treatment.</Notice>
      <Split ratio="1.25fr 1fr" left={
        <Card title="October spend by ingredient" sub="Click a row to chart it.">
          <Table rowKey={r => r.id} rows={rows} onRow={r => setSel(r.id)} cols={[
            { key: "n", label: "Ingredient", w: "minmax(150px,1.3fr)", render: r => <span style={{ color: r.id === sel ? "var(--accent)" : "var(--ink)" }}>{r.name}</span> },
            { key: "s", label: "Supplier", w: "minmax(130px,1fr)", render: r => supplierName(r.supplier) }, { key: "q", label: "Quantity", align: "right", w: "100px", render: r => r.unit === "receipt" ? r.q + " receipts" : qtyU(r.q, r.unit) },
            { key: "p", label: "Unit cost", align: "right", w: "110px", render: r => r.unit === "receipt" ? "Mixed" : eur2(r.per) + "/" + r.unit }, { key: "t", label: "Spend", align: "right", w: "100px", render: r => eur(r.net) }]}
            footer={"Total " + eur(rows.reduce((x, r) => x + r.net, 0)) + " purchases; consumed COGS was " + eur(cogsBridge().cogs)} />
        </Card>} right={
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Card title={ing.name + " · October weekly spend"} extra={<Btn small onClick={() => act.open("ingredient", sel)}>Ingredient record</Btn>}>
            <Columns fmt={v => eur(v)} series={[{ name: ing.name + " purchases", color: "var(--brand-2,#46C8F0)" }]} data={series} height={120} />
          </Card>
          <Card title={"November documents for " + ing.name.toLowerCase()} sub={novLines.length ? eur2(novNet) + " net across " + novLines.length + " lines" : "None yet"}>
            {novLines.map(({ inv, l }) => <Row key={inv.id + l.id} style={{ padding: "5px 0", fontSize: "13px" }}><RecLink kind="invoice" id={inv.id} /><span style={{ flex: 1, color: "var(--dim)" }}>{qtyU(l.qty, l.unit)} at {eur2(l.unitCost)}</span><StatusBadge s={inv.status} /></Row>)}
          </Card>
          {sel === "ING-AVO" && <Card title="Avocado unit cost">
            <KV rows={[["October", eur2(a.oldC) + " each (" + rows.find(r => r.id === "ING-AVO")?.q + " bought)"], ["INV-AVO-118, 11 Nov", eur2(a.newC) + " each (+" + Math.round(a.pct * 100) + "%)"], ["100 avocados", eur2(a.lineTotal) + " vs " + eur2(a.oldC * 100) + " (+" + eur2(a.per100) + ")"], ["Inbox document total", eur2(invoiceNet(a.invoice))]]} />
          </Card>}
        </div>} />
      <Badge tone="neutral">Purchases {eur(cogsBridge().purchases)} · COGS {eur(cogsBridge().cogs)} · difference is stock movement</Badge>
    </Page>
  );
}
