/* Records › Tables: every shared record type as a table, plus the relationship
   paths the Ontology draws. Rows open the same drawer used everywhere else. */
import { useMemo, useState } from "react";
import { useShaka, act, transferTotals } from "../store";
import { LOCATIONS, PEOPLE, SUPPLIERS, INGREDIENTS, RECIPES, ORDERS, CORPORATE, SHIFTS, PURCHASES, invoiceNet, supplierName, locName, channelName, person, recipeCost } from "../model";
import { eur, eur2, dayLabel, qtyU } from "../format";
import { Card, Table, Badge, Row, inputStyle, eyebrow, type Col } from "../ui";
import { StatusBadge } from "../RecordDrawer";

export const ENTITIES = ["Locations", "Staff", "Suppliers", "Ingredients", "Recipes", "Sales orders", "Invoice documents", "Settlements", "Transfers", "Corporate customers"] as const;
export type Entity = (typeof ENTITIES)[number];

export default function RecordsTables() {
  const s = useShaka();
  const ent = (s.ui.tabs["RecordsEntity"] as Entity) ?? "Invoice documents";
  const [q, setQ] = useState("");
  const firstSalmon = useMemo(() => ORDERS.find(o => o.channel === "deliveroo" && o.loc === "BAG" && o.lines.some(l => l[0] === "B-SALMON")), []);
  const sofiaShift = SHIFTS.find(x => x.person === "P-SOFIA");
  const match = (t: string) => !q || t.toLowerCase().includes(q.toLowerCase());
  let table: JSX.Element;
  switch (ent) {
    case "Locations": table = <T rows={LOCATIONS.filter(l => match(l.name + l.address))} k="location" id={l => l.id} cols={[{ key: "n", label: "Location", render: l => l.name }, { key: "a", label: "Address", w: "minmax(220px,2fr)", render: l => l.address }, { key: "m", label: "Manager", render: l => person(l.manager)?.name }, { key: "h", label: "Trading (demo)", w: "minmax(200px,1.6fr)", render: l => l.hours }]} />; break;
    case "Staff": table = <T rows={PEOPLE.filter(p => match(p.name + p.role))} k="person" id={p => p.id} cols={[{ key: "n", label: "Name", render: p => p.name }, { key: "r", label: "Role", render: p => p.role }, { key: "d", label: "Department", render: p => p.dept }, { key: "l", label: "Site", render: p => p.loc === "ALL" ? "All" : locName(p.loc) }, { key: "x", label: "Identity", render: p => p.demo ? <Badge>Fictional sample</Badge> : <Badge tone="info">Owner</Badge> }]} />; break;
    case "Suppliers": table = <T rows={SUPPLIERS.filter(x => match(x.name))} k="supplier" id={x => x.id} cols={[{ key: "n", label: "Supplier", render: x => x.name }, { key: "c", label: "Category", w: "minmax(180px,1.4fr)", render: x => x.category }, { key: "s", label: "October spend", align: "right", render: x => eur(PURCHASES.filter(p => p.supplier === x.id).reduce((a, p) => a + p.net, 0)) }, { key: "no", label: "Note", w: "minmax(200px,2fr)", render: x => x.note }]} />; break;
    case "Ingredients": table = <T rows={INGREDIENTS.filter(i => match(i.name))} k="ingredient" id={i => i.id} cols={[{ key: "n", label: "Ingredient", render: i => i.name }, { key: "u", label: "Unit", render: i => i.unit }, { key: "s", label: "Supplier", render: i => i.supplier.startsWith("SUP") ? supplierName(i.supplier) : i.supplier }, { key: "o", label: "Oct cost", align: "right", render: i => i.unit === "receipt" ? "Mixed" : eur2(i.octCost) }, { key: "c", label: "Current", align: "right", render: i => i.unit === "receipt" ? "Mixed" : eur2(s.prices[i.id]) }]} />; break;
    case "Recipes": table = <T rows={RECIPES.filter(r => match(r.name))} k="recipe" id={r => r.id} cols={[{ key: "n", label: "Recipe", render: r => r.name }, { key: "i", label: "ID", render: r => r.id }, { key: "p", label: "Price", align: "right", render: r => eur2(r.price) }, { key: "c", label: "Current cost", align: "right", render: r => eur2(recipeCost(r, s.prices)) }, { key: "e", label: "Effective", render: r => r.effective }]} />; break;
    case "Sales orders": table = <T page rows={ORDERS.filter(o => match(o.id + o.sourceRef + o.squareRef))} k="order" id={o => o.id} cols={[{ key: "n", label: "Order", render: o => o.id }, { key: "d", label: "Date", render: o => dayLabel(o.date) }, { key: "l", label: "Location", render: o => locName(o.loc) }, { key: "c", label: "Channel", render: o => channelName(o.channel) }, { key: "sq", label: "Square ref", render: o => o.squareRef }, { key: "v", label: "Net", align: "right", render: o => eur2(o.net) }]} />; break;
    case "Invoice documents": table = <T rows={s.inbox.filter(i => match(i.id + supplierName(i.supplier)))} k="invoice" id={i => i.id} cols={[{ key: "n", label: "Document", render: i => i.id }, { key: "s", label: "Supplier", render: i => supplierName(i.supplier) }, { key: "d", label: "Date", render: i => dayLabel(i.date) }, { key: "v", label: "Net", align: "right", render: i => eur2(invoiceNet(i)) }, { key: "st", label: "Status", render: i => <StatusBadge s={i.status} /> }]} />; break;
    case "Settlements": table = <T rows={s.settlements.filter(x => match(x.id))} k="settlement" id={x => x.id} cols={[{ key: "n", label: "Settlement", render: x => x.id }, { key: "c", label: "Channel", render: x => channelName(x.channel) }, { key: "e", label: "Expected", align: "right", render: x => eur2(x.expected) }, { key: "r", label: "Received", align: "right", render: x => x.received === null ? "n/a" : eur2(x.received) }, { key: "st", label: "Status", render: x => <StatusBadge s={x.status} /> }]} />; break;
    case "Transfers": table = <T rows={s.transfers.filter(x => match(x.id))} k="transfer" id={x => x.id} cols={[{ key: "n", label: "Transfer", render: x => x.id }, { key: "r", label: "Route", render: x => locName(x.from) + " to " + locName(x.to) }, { key: "w", label: "When", render: x => x.when }, { key: "v", label: "Value", align: "right", render: x => eur2(transferTotals(x)) }, { key: "st", label: "Status", render: x => <StatusBadge s={x.status} /> }]} />; break;
    default: table = <T rows={[CORPORATE]} k="corporate" id={c => c.id} cols={[{ key: "c", label: "Customer", render: c => c.customer }, { key: "n", label: "Note", w: "minmax(200px,1.5fr)", render: c => c.customerNote }, { key: "ch", label: "Channel", render: () => "Lunch Team" }, { key: "o", label: "Open order", render: c => c.id + ", Fri 12:15, 48 bowls" }]} />;
  }
  const paths: { title: string; steps: [string, string, string][] }[] = [
    { title: "Purchase to settlement", steps: [["supplier", "SUP-GBP", "Green Basket Produce"], ["invoice", "INV-AVO-118", "INV-AVO-118"], ["invoice", "INV-AVO-118", "Line: 100 avocados"], ["ingredient", "ING-AVO", "Avocado"], ["recipe", "RCP-SALMON", "Salmon bowl"], ["order", firstSalmon?.id ?? "", "Order line: salmon bowl"], ["order", firstSalmon?.id ?? "", firstSalmon?.id ?? ""], ["channel", "deliveroo", "Deliveroo · Baggot Street"], ["settlement", "SET-DEL-1106", "SET-DEL-1106"]] },
    { title: "People to place", steps: [["person", "P-SOFIA", "Sofia Costa"], ["person", "P-SOFIA", "Shift " + (sofiaShift ? dayLabel(sofiaShift.date) : "")], ["location", "BAG", "Baggot Street"]] },
    { title: "Stock movement", steps: [["transfer", "TRF-1113", "TRF-1113"], ["location", "BAG", "Origin: Baggot Street"], ["location", "BLK", "Destination: Blackrock"], ["ingredient", "ING-SALMON", "Salmon " + qtyU(2, "kg")], ["ingredient", "ING-SALSA", "Pineapple salsa " + qtyU(3, "kg")]] },
  ];
  return (
    <div className="shk-page" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "18px 22px 26px", maxWidth: "1440px", margin: "0 auto" }}>
      <Card title="Relationship paths" sub="The same chains the Ontology draws. Every step opens the shared record.">
        {paths.map(p => (
          <div key={p.title} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
            <div style={{ ...eyebrow, marginBottom: "7px" }}>{p.title}</div>
            <Row gap={6}>
              {p.steps.map(([k, id, label], i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  {i > 0 && <span style={{ color: "var(--faint)" }}>→</span>}
                  <button type="button" onClick={() => act.open(k, id)} className="ixa" style={{ height: "28px", padding: "0 11px", borderRadius: "999px", border: "1px solid var(--chip-border)", background: "var(--chip)", color: "var(--body)", fontSize: "12px", cursor: "pointer", font: "inherit", whiteSpace: "nowrap" }}>{label}</button>
                </span>
              ))}
            </Row>
          </div>
        ))}
      </Card>
      <Card title={ent} extra={<Row gap={8}>
        <select aria-label="Record type" value={ent} onChange={e => act.setTab("RecordsEntity", e.target.value)} style={{ ...inputStyle, width: "auto" }}>{ENTITIES.map(x => <option key={x}>{x}</option>)}</select>
        <input aria-label="Filter" placeholder="Filter" value={q} onChange={e => setQ(e.target.value)} style={{ ...inputStyle, width: "180px" }} /></Row>}>
        {table}
      </Card>
    </div>
  );
}

function T<R>({ rows, cols, k, id, page }: { rows: R[]; cols: Col<R>[]; k: string; id: (r: R) => string; page?: boolean }) {
  return <Table rowKey={id} rows={rows} cols={cols} onRow={r => act.open(k, id(r))} pageSize={page ? 15 : 0} footer={rows.length.toLocaleString("en-IE") + " records · demo data"} />;
}
