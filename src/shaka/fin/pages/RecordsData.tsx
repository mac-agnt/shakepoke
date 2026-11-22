/* Records › Tables: the underlying searchable data. Records › Activity: the
   audit trail of reviews, corrections and exports. Rows drill into the page
   that owns the record. */
import { useState } from "react";
import { useFin, fin, ingredientRows, approvedLines, monthRow, correctedTotal, type LineRow, type IngRow, type Activity } from "../store";
import { SUPPLIERS, MONTHS, LOCS, supplierName, locName, catName, invoiceTotal, lineTotal, type Invoice } from "../data";
import { statusBadge } from "./Invoices";
import { eur, eur2 } from "../../format";
import { Page, Card, Table, Seg, Badge, inputStyle, Row, Grid, Stat } from "../../ui";

const KINDS = ["Invoices", "Invoice lines", "Ingredients", "Suppliers", "Monthly figures"] as const;
type Kind = (typeof KINDS)[number];

export default function RecordsData() {
  const s = useFin();
  const kind = (KINDS as readonly string[]).includes(s.ui.tabs.RecordsData ?? "") ? (s.ui.tabs.RecordsData as Kind) : "Invoices";
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const has = (txt: string) => !ql || txt.toLowerCase().includes(ql);

  const months = MONTHS.flatMap(m => LOCS.map(l => ({ ...monthRow(s, m.ym, l.id), label: m.label })));
  const counts: Record<Kind, number> = { "Invoices": s.invoices.length, "Invoice lines": approvedLines(s).length, "Ingredients": ingredientRows(s).length, "Suppliers": SUPPLIERS.length, "Monthly figures": months.length };

  return (
    <Page title="Tables" sub="Every record behind the pages, searchable. Click a row to open it where it lives." actions={<Badge tone="neutral">Demo data</Badge>}>
      <Row>
        <Seg options={KINDS} value={kind} onChange={k => fin.setTab("RecordsData", k)} counts={counts} />
        <input aria-label="Search records" value={q} onChange={e => setQ(e.target.value)} placeholder="Search" style={{ ...inputStyle, width: "220px" }} />
      </Row>
      <Card pad="14px">
        {kind === "Invoices" && <Table<Invoice> rowKey={i => i.id} pageSize={12} rows={s.invoices.filter(i => has(i.id + " " + supplierName(i.supplier) + " " + locName(i.loc ?? "")))} onRow={i => fin.openInvoice(i.id)} dense cols={[
          { key: "i", label: "Document", w: "minmax(130px,1fr)", render: i => i.id }, { key: "k", label: "Type", w: "100px", render: i => i.kind === "receipt" ? "Receipt" : "Bill" },
          { key: "s", label: "Supplier", w: "minmax(150px,1.2fr)", render: i => supplierName(i.supplier) }, { key: "d", label: "Date", w: "100px", render: i => i.date },
          { key: "l", label: "Shop", w: "120px", render: i => locName(i.loc ?? "") || "Not stated" }, { key: "a", label: "Amount", w: "100px", align: "right", render: i => eur2(i.status === "attention" ? correctedTotal(i) : invoiceTotal(i)) },
          { key: "st", label: "Status", w: "150px", render: statusBadge }]} />}
        {kind === "Invoice lines" && <Table<LineRow> rowKey={r => r.line.id} pageSize={14} rows={approvedLines(s).filter(r => has(r.inv.id + " " + r.line.desc + " " + catName(r.line.cat)))} onRow={r => fin.openInvoice(r.inv.id)} dense cols={[
          { key: "i", label: "Invoice", w: "minmax(120px,1fr)", render: r => r.inv.id }, { key: "d", label: "Item", w: "minmax(160px,1.4fr)", render: r => r.line.desc },
          { key: "q", label: "Qty", w: "90px", align: "right", render: r => r.line.qty + " " + r.line.unit }, { key: "u", label: "Unit price", w: "90px", align: "right", render: r => eur2(r.line.unitPrice) },
          { key: "t", label: "Total", w: "90px", align: "right", render: r => eur2(lineTotal(r.line)) }, { key: "c", label: "Category", w: "minmax(140px,1fr)", render: r => catName(r.line.cat) },
          { key: "l", label: "Shop", w: "110px", render: r => locName(r.inv.loc ?? "") }]} />}
        {kind === "Ingredients" && <Table<IngRow> rowKey={r => r.id} rows={ingredientRows(s).filter(r => has(r.name))} onRow={r => fin.focusIngredient(r.id)} dense cols={[
          { key: "n", label: "Ingredient", w: "minmax(150px,1.2fr)", render: r => r.name }, { key: "u", label: "Unit", w: "70px", render: r => r.unit },
          { key: "q", label: "Bought in Oct", w: "110px", align: "right", render: r => r.qty.toLocaleString("en-IE") }, { key: "s", label: "Approved spend", w: "120px", align: "right", render: r => eur(r.spend) },
          { key: "p", label: "Sept price", w: "100px", align: "right", render: r => eur2(r.prior) }, { key: "o", label: "Oct price", w: "100px", align: "right", render: r => r.price === null ? "n/a" : eur2(r.price) }]} />}
        {kind === "Suppliers" && <Table rowKey={x => x.id} rows={SUPPLIERS.filter(x => has(x.name + " " + x.note))} dense onRow={() => fin.go("Invoices", "All invoices")} cols={[
          { key: "n", label: "Supplier", w: "minmax(170px,1fr)", render: x => x.name }, { key: "d", label: "Documents in October", w: "150px", align: "right", render: x => String(s.invoices.filter(i => i.supplier === x.id).length) },
          { key: "t", label: "Approved spend", w: "130px", align: "right", render: x => eur(approvedLines(s).filter(r => r.inv.supplier === x.id).reduce((a, r) => a + lineTotal(r.line), 0)) },
          { key: "o", label: "Note", w: "minmax(220px,1.6fr)", render: x => x.note }]} />}
        {kind === "Monthly figures" && <Table rowKey={r => r.ym + r.loc} rows={months.filter(r => has(r.label + " " + locName(r.loc)))} dense onRow={r => { fin.setMonth(r.ym); fin.setLoc(r.loc); fin.go("Money", "Overview"); }} cols={[
          { key: "m", label: "Month", w: "minmax(130px,1fr)", render: r => r.label }, { key: "l", label: "Shop", w: "120px", render: r => locName(r.loc) },
          { key: "s", label: "Sales", w: "100px", align: "right", render: r => r.sales === null ? "n/a" : eur(r.sales) }, { key: "sp", label: "Supplier spend", w: "120px", align: "right", render: r => r.spend === null ? "n/a" : eur(r.spend) },
          { key: "lb", label: "Labour", w: "100px", align: "right", render: r => r.labour === null ? "n/a" : eur(r.labour) }, { key: "o", label: "Other", w: "100px", align: "right", render: r => r.other === null ? "n/a" : eur(r.other) },
          { key: "st", label: "Status", w: "150px", render: r => <Badge tone={r.status === "complete" ? "ok" : r.status === "provisional" ? "warn" : "bad"}>{r.status === "incomplete" ? "Data incomplete" : r.status === "provisional" ? "Provisional" : "All inputs in"}</Badge> }]} />}
      </Card>
    </Page>
  );
}

const WHO = ["Everyone", "You", "System"] as const;
type Who = (typeof WHO)[number];

export function RecordsActivity() {
  const s = useFin();
  const who = (WHO as readonly string[]).includes(s.ui.tabs.RecordsActivity ?? "") ? (s.ui.tabs.RecordsActivity as Who) : "Everyone";
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const mine = s.activity.filter(a => a.kind === "you").length;
  const rows = s.activity.filter(a => (who === "Everyone" || (who === "You") === (a.kind === "you")) && (!ql || (a.who + " " + a.text + " " + (a.ref ?? "")).toLowerCase().includes(ql)));
  return (
    <Page title="Activity" sub="Every review, correction and export, newest first. Click a row to open the document it touched." actions={<Badge tone="neutral">Demo data</Badge>}>
      <Grid min={190}>
        <Stat label="Events logged" value={String(s.activity.length)} sub="Since onboarding" />
        <Stat label="Your actions" value={String(mine)} sub="Reviews, corrections, exports" onClick={() => fin.setTab("RecordsActivity", "You")} />
        <Stat label="System events" value={String(s.activity.length - mine)} sub="Imports and suggestions" onClick={() => fin.setTab("RecordsActivity", "System")} />
      </Grid>
      <Row>
        <Seg options={WHO} value={who} onChange={k => fin.setTab("RecordsActivity", k)} />
        <input aria-label="Search activity" value={q} onChange={e => setQ(e.target.value)} placeholder="Search" style={{ ...inputStyle, width: "220px" }} />
      </Row>
      <Card pad="14px">
        <Table<Activity> rowKey={a => a.id} rows={rows} dense pageSize={14} empty="No activity matches." onRow={a => (a.ref ? fin.openInvoice(a.ref) : undefined)} cols={[
          { key: "t", label: "When", w: "190px", render: a => a.ts },
          { key: "w", label: "Who", w: "150px", render: a => <Badge tone={a.kind === "you" ? "accent" : "neutral"}>{a.who}</Badge> },
          { key: "x", label: "What happened", w: "minmax(280px,3fr)", render: a => <span style={{ whiteSpace: "normal" }}>{a.text}</span> },
          { key: "r", label: "Document", w: "140px", render: a => a.ref ?? "" }]} />
      </Card>
    </Page>
  );
}
