/* Accountant Pack: the month-end checklist and three CSV exports for the
   accountant. Xero is the intended destination, never a live connection. */
import { useFin, fin, packChecklist, packProgress, approvedInvoices, approvedLines, categoryRows, monthRow, counts } from "../store";
import { PACK_MONTH } from "../data";
import { finTab } from "../nav";
import { eur } from "../../format";
import { Page, Card, Grid, Badge, Notice, Row, Btn, KV, Table, Legend, num } from "../../ui";
import { Ring, Donut, StackBar, VIZ, kEur } from "../../viz";
import { catName } from "../data";

export default function Pack() {
  const s = useFin();
  const tab = finTab(s, "Pack");
  const p = packProgress(s);
  return (
    <Page period={PACK_MONTH.label + " · Illustrative demo data"} title="Accountant Pack"
      sub="Everything your accountant needs for the month, checked off in one place, then exported as CSV."
      actions={<><Badge tone="neutral">Demo data</Badge><Btn kind="primary" onClick={() => fin.setTab("Pack", "Exports")}>Go to exports</Btn></>}>
      <PackHeader />
      {tab === "Exports" ? <Exports /> : <Checklist />}
    </Page>
  );
}

function Checklist() {
  const s = useFin();
  const items = packChecklist(s);
  const open = items.filter(i => !i.done);
  return (
    <div className="shk-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "14px", alignItems: "start" }}>
      <Card title="Month-end checklist" sub="Ticks come from the data, not from clicking.">
        {items.map(i => (
          <div key={i.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 0", borderTop: "1px solid var(--border)" }}>
            <span aria-hidden style={{ width: "20px", height: "20px", flex: "none", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", background: i.done ? "var(--ok-soft)" : "var(--warn-soft)", color: i.done ? "var(--ok)" : "var(--warn)", marginTop: "1px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d={i.done ? "M5 12.5l4.2 4.2L19 7" : "M12 7v6 M12 17h.01"} /></svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--ink)" }}>{i.label}<span className="sr-only">{i.done ? " (done)" : " (open)"}</span></div>
              <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "3px", lineHeight: 1.5 }}>{i.detail}</div>
            </div>
            {i.go && <Btn small kind={i.done ? "quiet" : "ghost"} onClick={i.go}>{i.goLabel}</Btn>}
          </div>
        ))}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
        <Card title="Missing items" sub="What would make the pack incomplete.">
          {open.length ? open.map(i => <div key={i.id} style={{ fontSize: "12.5px", color: "var(--body)", padding: "7px 0", borderTop: "1px solid var(--border)" }}>{i.label}</div>)
            : <div style={{ fontSize: "12.5px", color: "var(--dim)" }}>Nothing missing.</div>}
        </Card>
        <PackContents />
        <Notice tone="neutral" title="You can export at any time.">Exports always contain the reviewed rows only. Anything still open is listed here, so your accountant knows what is coming.</Notice>
      </div>
    </div>
  );
}

function Exports() {
  const s = useFin();
  const c = counts(s);
  const oct = monthRow(s, PACK_MONTH.ym, "ALL");
  const cats = categoryRows(s).filter(x => x.total > 0).length;
  const file = (k: string) => "ShakaPoke-DEMO-" + PACK_MONTH.ym + "-" + k + ".csv";
  const ex = (title: string, sub: string, name: string, facts: [string, string][], run: () => void) => (
    <Card key={name} title={title} sub={sub}>
      <KV rows={[["File", name], ...facts]} />
      <Row style={{ marginTop: "14px" }}><Btn kind="primary" onClick={run}>Download CSV</Btn></Row>
    </Card>
  );
  return (
    <>
      {c.attention > 0 && <Notice tone="warn" title="Some documents are still open." action={<Btn small onClick={() => fin.go("Invoices", "Needs review")}>Review</Btn>}>{c.attention} {c.attention === 1 ? "document is" : "documents are"} not reviewed, so {c.attention === 1 ? "it is" : "they are"} left out of these files.</Notice>}
      <Grid min={300}>
        {ex("Reviewed invoices", "One row per approved invoice line, with supplier, date, shop and category.", file("reviewed-invoices"), [["Rows", approvedLines(s).length + " lines from " + approvedInvoices(s).length + " invoices"]], fin.exportInvoices)}
        {ex("Expense categories", "Approved spend by category and shop, with a suggested account to map.", file("expense-categories"), [["Rows", cats + " categories plus a total"]], fin.exportCategories)}
        {ex("Monthly management summary", "Sales, spending and indicative operating profit for both shops.", file("management-summary"), [["Status", oct.statusLabel], ["Indicative profit", oct.profit === null ? "Data incomplete" : eur(oct.profit)]], fin.exportSummary)}
      </Grid>
      <Grid min={320}>
        <Card title="Expense categories by shop" sub="What the category file will contain.">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {categoryRows(s).filter(x => x.total > 0).sort((a, b) => b.total - a.total).map(x => (
              <div key={x.id}>
                <div style={{ display: "flex", fontSize: "12px", marginBottom: "5px" }}><span style={{ flex: 1, color: "var(--body)" }}>{catName(x.id)}</span><span style={{ ...num, color: "var(--ink)" }}>{eur(x.total)}</span></div>
                <StackBar height={8} legend={false} rows={[{ label: "Baggot Street", value: x.BAG, color: VIZ[0] }, { label: "Blackrock", value: x.BLK, color: VIZ[1] }]} fmt={eur} />
              </div>))}
          </div>
          <Legend items={[{ name: "Baggot Street", color: VIZ[0] }, { name: "Blackrock", color: VIZ[1] }]} />
        </Card>
        <Card pad="14px" title="Pack history" sub="Months sent to the accountant from this workspace.">
          <Table rowKey={r => r.m} rows={[
            { m: "October 2026", when: "Not sent yet", files: "3 files ready", st: oct.status },
            { m: "September 2026", when: "7 Oct 2026, by David", files: "3 CSV files", st: "complete" as const }]} dense
            cols={[
              { key: "m", label: "Month", w: "minmax(120px,1fr)", render: r => r.m },
              { key: "w", label: "Exported", w: "minmax(140px,1fr)", render: r => r.when },
              { key: "f", label: "Files", w: "110px", render: r => r.files },
              { key: "s", label: "Status", w: "120px", render: r => r.m.startsWith("Sept") ? <Badge tone="ok">Sent</Badge> : <Badge tone={r.st === "complete" ? "ok" : "warn"}>{r.st === "complete" ? "Ready" : "Provisional"}</Badge> }]} />
        </Card>
      </Grid>
      <Card title="Xero" sub="External accounting tool · intended export destination" extra={<Badge tone="neutral">Not connected</Badge>}>
        <div style={{ fontSize: "13px", color: "var(--body)", lineHeight: 1.6, maxWidth: "80ch" }}>
          The CSV files are shaped for import into Xero once the account codes are mapped with your accountant. Nothing is posted to Xero, filed with Revenue or paid from here: no journals, no VAT returns, no bank feed.
        </div>
        <div style={{ ...num, fontSize: "11.5px", color: "var(--faint)", marginTop: "10px" }}>Every exported filename includes DEMO and contains only the current demo rows.</div>
      </Card>
    </>
  );
}

function PackHeader() {
  const s = useFin();
  const p = packProgress(s);
  const items = packChecklist(s);
  const inv = approvedInvoices(s), lines = approvedLines(s);
  const c = counts(s);
  const total = lines.reduce((a, r) => a + Math.round(r.line.qty * r.line.unitPrice), 0);
  const fact = (k: string, v: string, sub: string) => (
    <div key={k} style={{ minWidth: 0 }}>
      <div style={{ fontSize: "11.5px", color: "var(--dim)" }}>{k}</div>
      <div style={{ ...num, fontSize: "20px", fontWeight: 600, letterSpacing: "-.5px", marginTop: "4px" }}>{v}</div>
      <div style={{ fontSize: "11px", color: "var(--faint)", marginTop: "2px" }}>{sub}</div>
    </div>
  );
  return (
    <Card pad="18px 20px">
      <div style={{ display: "flex", gap: "22px", alignItems: "center", flexWrap: "wrap" }}>
        <Ring value={p.done / p.total} tone={p.done === p.total ? "ok" : "accent"} label={p.done + "/" + p.total} caption="done" />
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>{p.done === p.total ? "Ready to send" : p.total - p.done + " still open before the pack is complete"}</div>
          <div style={{ display: "flex", gap: "4px", marginTop: "10px" }}>
            {items.map(i => <span key={i.id} title={i.label} style={{ flex: 1, height: "6px", borderRadius: "3px", background: i.done ? "var(--ok)" : "var(--warn)", opacity: i.done ? 0.9 : 0.75 }} />)}
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "6px" }}>One segment per checklist item</div>
        </div>
        <div style={{ flex: "2 1 420px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: "14px" }}>
          {fact("Reviewed invoices", String(inv.length), lines.length + " lines")}
          {fact("Approved spend", kEur(total), "Both shops")}
          {fact("Staff receipts", String(c.receipts), c.receiptsOpen ? c.receiptsOpen + " open" : "All filed")}
          {fact("Still open", String(c.attention), c.attention ? "Left out of exports" : "Nothing left out")}
        </div>
      </div>
    </Card>
  );
}

function PackContents() {
  const s = useFin();
  const cats = categoryRows(s).filter(x => x.total > 0).sort((a, b) => b.total - a.total);
  const total = cats.reduce((a, x) => a + x.total, 0);
  return (
    <Card title="What is in the pack" sub="Approved spend by expense category, as it will export.">
      <Donut size={128} fmt={eur} center={{ value: kEur(total), label: "approved" }} rows={cats.map((x, k) => ({ label: x.name, value: x.total, color: VIZ[k % VIZ.length] }))} />
    </Card>
  );
}
