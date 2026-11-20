/* Settings: a utility, not a workstream. Includes the optional commercial
   information screen (Scope & pricing) for the owner presentation. */
import { useState } from "react";
import { useFin, fin } from "../store";
import { OFFER, monthlyPayment, LOCS } from "../data";
import { finTab } from "../nav";
import { eur, eur2 } from "../../format";
import { Page, Card, Grid, Badge, Notice, Row, Btn, KV, Table } from "../../ui";

type Theme = { id: string; label: string; group: string; bg: string; surface: string; ink: string; accent: string };

const SYSTEMS = [
  { name: "Square", status: "Not connected (demo)", purpose: "Sales for both shops. One ingestion path: an authorised read-only feed if access and API tier allow, otherwise a scheduled or manual CSV import.", data: "Sales by day and shop, back to 1 April 2026" },
  { name: "Invoice inbox", status: "Demo inbox", purpose: "Supplier bills forwarded by email and receipt photos from managers. Suggested fields for recurring supplier formats; uncertain lines wait for review.", data: "Bills and receipts, up to 150 onboarding documents from the last 90 days" },
  { name: "Xero", status: "Export destination", purpose: "External accounting tool. Receives Xero-compatible CSV files after field mapping. No two-way sync, posting, VAT filing or bank feed.", data: "Reviewed invoices, expense categories, monthly summary" },
  { name: "Excel costing sheet", status: "Reference upload", purpose: "David's existing bowl costing sheet, kept as a reference beside ingredient spend. Not recalculated.", data: "One spreadsheet" },
];
const USERS = [
  { name: "David McParland", role: "Owner", can: "Review and approve invoices, edit categories, enter labour and other costs, export the pack" },
  { name: "Baggot Street manager", role: "Manager (demo identity)", can: "Capture receipts, view their shop's spend" },
  { name: "Blackrock manager", role: "Manager (demo identity)", can: "Capture receipts, view their shop's spend" },
];
const IN_SCOPE = [
  "Two permanent shops: Baggot Street and Blackrock",
  "One Square sales ingestion path (read-only feed if permitted, otherwise CSV import)",
  "One supplier invoice inbox with field suggestions for selected recurring supplier formats and human review of uncertain lines",
  "Ingredient spend for a curated list of up to 20 commonly purchased ingredients, from approved invoice lines",
  "Basic finance categories and location reporting, with gaps clearly flagged",
  "Accountant exports as Xero-compatible CSV, subject to field mapping",
  "Limited history: Square exports back to 1 April 2026 and up to 150 invoice documents from the last 90 days",
  "Owner plus up to two managers, with simple review and approval permissions",
  "Two planned review cycles and one handover session",
  "Built on the existing Pulse interface and components",
  "A read-only Home assistant that explains figures; it never changes them",
];
const OUT_SCOPE = [
  "Stock levels, reordering, purchase orders, transfers, waste and prep planning",
  "Recipe costing, live bowl margins, portions, yields and inventory-based COGS",
  "Rostering, payroll and staff payments",
  "Marketplace APIs, settlement reconciliation and delivery integrations",
  "Food truck, corporate events and a third site",
  "Autonomous agents, WhatsApp, automated decisions and multi-step approvals",
  "Forecasting, a mobile app, POS replacement and bank reconciliation",
  "Live Xero sync, payments, statutory accounts, VAT filing or guaranteed savings",
  "Additional historical invoice matching (a separately scoped change)",
];

export default function Settings({ themes, theme, setTheme }: { themes: Theme[]; theme: string; setTheme: (id: string) => void }) {
  const s = useFin();
  const tab = finTab(s, "Settings");
  const [motion, setMotion] = useState(false);

  if (tab === "Users") return (
    <Page period="Settings" title="Users" sub="The owner and up to two managers. Permissions here are a demo simulation, not enforced access control.">
      <Card pad="14px"><Table rowKey={u => u.name} rows={USERS} cols={[
        { key: "n", label: "Person", w: "minmax(170px,1fr)", render: u => u.name },
        { key: "r", label: "Role", w: "minmax(160px,.9fr)", render: u => u.role },
        { key: "c", label: "Can", w: "minmax(260px,2fr)", render: u => <span style={{ whiteSpace: "normal" }}>{u.can}</span> }]} /></Card>
    </Page>
  );
  if (tab === "Systems") return (
    <Page period="Settings" title="Systems" sub="Where each figure comes from. Nothing in this demo is connected to a live system.">
      <Grid min={300}>{SYSTEMS.map(x => (
        <Card key={x.name} title={x.name} extra={<Badge tone="neutral">{x.status}</Badge>} sub={x.purpose}>
          <KV rows={[["Data", x.data]]} />
        </Card>))}</Grid>
    </Page>
  );
  if (tab === "Scope & pricing") return <Commercial />;
  if (tab === "Experience") return (
    <Page period="Settings" title="Experience" sub="Theme, motion and demo controls.">
      <Card title="Theme">
        <Grid min={150}>{themes.map(t => (
          <button key={t.id} type="button" onClick={() => setTheme(t.id)} style={{ textAlign: "left", padding: "10px", borderRadius: "14px", border: "1.5px solid " + (theme === t.id ? "var(--accent)" : "var(--chip-border)"), background: "var(--chip)", cursor: "pointer", color: "var(--ink)", font: "inherit" }}>
            <div style={{ position: "relative", height: "56px", borderRadius: "10px", background: t.bg, overflow: "hidden", border: "1px solid rgba(127,127,127,.2)" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "22%", background: t.surface }} /><div style={{ position: "absolute", left: "30%", top: "58%", width: "10px", height: "10px", borderRadius: "3px", background: t.accent }} />
            </div>
            <div style={{ fontSize: "12.5px", marginTop: "7px" }}>{t.label}</div>
          </button>))}</Grid>
      </Card>
      <Grid min={300}>
        <Card title="Accessibility"><label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px" }}><input type="checkbox" checked={motion} onChange={() => { setMotion(!motion); document.documentElement.toggleAttribute("data-reduce-motion", !motion); }} style={{ accentColor: "var(--accent)" }} />Reduce motion in this session</label></Card>
        <Card title="Demo controls" sub="For a repeatable presentation."><Row><Btn kind="danger" onClick={() => fin.reset()}>Reset demo data</Btn></Row></Card>
      </Grid>
    </Page>
  );
  return (
    <Page period="Settings" title="Organisation" sub="Trading identity and the shops in phase one.">
      <Grid min={300}>
        <Card title="Identity"><KV rows={[["Trading name", "Shaka Poké"], ["Legal entity", "To confirm"], ["Owner", "David McParland"], ["Currency and timezone", "EUR · Europe/Dublin"], ["Accounting tool", "Xero (export destination)"]]} /></Card>
        <Card title="Shops">
          {LOCS.map(l => <div key={l.id} style={{ padding: "8px 0", borderTop: "1px solid var(--border)", fontSize: "13px" }}><Row gap={8}><span style={{ fontWeight: 600 }}>{l.name}</span><Badge>Phase one</Badge></Row></div>)}
          <div style={{ fontSize: "12px", color: "var(--faint)", marginTop: "10px" }}>The seasonal food truck is outside phase one.</div>
        </Card>
      </Grid>
      <Notice tone="neutral" title="Illustrative demo data.">Every figure in this workspace is a demo assumption, not David's real sales, costs or supplier pricing.</Notice>
    </Page>
  );
}

function Commercial() {
  const ex = monthlyPayment(OFFER.price), inc = monthlyPayment(Math.round(OFFER.price * (1 + OFFER.vatRate)));
  return (
    <Page period="Optional commercial information · for the owner presentation" title="Scope & pricing" sub="What the proposed implementation covers, and what it does not. The production build is subject to an approved PRD.">
      <Grid min={260}>
        <Card title="Proposed implementation"><div style={{ fontSize: "28px", fontWeight: 600, letterSpacing: "-.7px" }}>{eur(OFFER.price)} <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--dim)" }}>+ VAT</span></div><div style={{ fontSize: "12px", color: "var(--faint)", marginTop: "6px" }}>Fixed price for the phase-one scope below.</div></Card>
        <Card title="Financing illustration" sub={OFFER.months + " months at " + (OFFER.apr * 100).toFixed(1) + "% a year"}>
          <KV rows={[["If VAT is financed", eur2(inc) + " a month"], ["Ex-VAT amount only", eur2(ex) + " a month"], ["Target", "Below " + eur(OFFER.cap) + " a month"]]} />
          <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "10px", lineHeight: 1.5 }}>Illustrative only. Subject to a lender quotation and to confirmation that VAT can be financed.</div>
        </Card>
      </Grid>
      <Grid min={340}>
        <Card title="Included in phase one">{IN_SCOPE.map(x => <div key={x} style={{ fontSize: "12.5px", color: "var(--body)", padding: "7px 0", borderTop: "1px solid var(--border)", lineHeight: 1.5 }}>{x}</div>)}</Card>
        <Card title="Not included">{OUT_SCOPE.map(x => <div key={x} style={{ fontSize: "12.5px", color: "var(--dim)", padding: "7px 0", borderTop: "1px solid var(--border)", lineHeight: 1.5 }}>{x}</div>)}</Card>
      </Grid>
    </Page>
  );
}
