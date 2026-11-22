/* Settings: a utility, not a workstream. */
import { useState } from "react";
import { useFin, fin } from "../store";
import { LOCS } from "../data";
import { finTab } from "../nav";
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
