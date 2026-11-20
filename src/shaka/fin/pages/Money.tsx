/* Money & Reports: Square-derived sales, approved supplier spend and owner-entered
   costs, kept apart, giving an indicative management P&L. Missing inputs show a
   Data incomplete state rather than an invented number. */
import type { ReactNode } from "react";
import { useFin, fin, monthRow, monthSeries, categoryRows, type MonthRow, type Scope } from "../store";
import { MONTHS, LOCS, locName, PACK_MONTH } from "../data";
import { finTab } from "../nav";
import { eur, pct } from "../../format";
import { Page, Card, Grid, Badge, Notice, Row, Seg, Columns, HBars, Btn, Table, inputStyle, eyebrow, num } from "../../ui";

const SCOPES: Scope[] = ["ALL", "BAG", "BLK"];
const scopeLabel = (s: Scope) => (s === "ALL" ? "Both shops" : locName(s));
const money = (v: number | null) => (v === null ? <span style={{ color: "var(--faint)" }}>Not provided</span> : eur(v));
const statusBadge = (r: MonthRow) => <Badge tone={r.status === "complete" ? "ok" : r.status === "provisional" ? "warn" : "bad"}>{r.status === "incomplete" ? "Data incomplete" : r.status === "provisional" ? "Provisional" : "All inputs in"}</Badge>;
export const PNL_LABEL = "Indicative management P&L, not an accountant-verified statement";

export default function Money() {
  const s = useFin();
  const tab = finTab(s, "Money");
  const mo = MONTHS.find(m => m.ym === s.ui.month) ?? MONTHS[MONTHS.length - 1];
  return (
    <Page period={mo.label + " · Illustrative demo data"} title="Money & Reports" sub="Sales, spending and an indicative operating profit for each shop, month by month."
      actions={<>
        <select aria-label="Month" value={mo.ym} onChange={e => fin.setMonth(e.target.value)} style={{ ...inputStyle, width: "170px" }}>
          {MONTHS.slice().reverse().map(m => <option key={m.ym} value={m.ym}>{m.label}</option>)}
        </select>
        {tab !== "Locations" && <Seg options={SCOPES.map(scopeLabel)} value={scopeLabel(s.ui.loc)} onChange={v => fin.setLoc(SCOPES.find(x => scopeLabel(x) === v) ?? "ALL")} />}
      </>}>
      {tab === "Locations" ? <Locations ym={mo.ym} /> : tab === "Trends" ? <Trends /> : <Overview ym={mo.ym} />}
    </Page>
  );
}

function Status({ r }: { r: MonthRow }) {
  if (r.status === "incomplete") return <Notice tone="bad" title="Data incomplete.">{r.missing.join(". ")}. No profit is shown for this view until every input is in.</Notice>;
  if (r.status === "provisional") return <Notice tone="warn" title="Provisional." action={<Btn small onClick={() => fin.go("Invoices", "Needs review")}>Review invoices</Btn>}>{r.pendingCount} {r.pendingCount === 1 ? "invoice is" : "invoices are"} still to review{r.pendingValue ? ", about " + eur(r.pendingValue) + " not yet counted in spend" : ""}. {PNL_LABEL}.</Notice>;
  return <Notice tone="ok" title="All inputs in.">{PNL_LABEL}.</Notice>;
}

function PnlLine({ label, source, value, strong, onClick }: { label: string; source: string; value: ReactNode; strong?: boolean; onClick?: () => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "2px 14px", padding: "12px 0", borderTop: "1px solid var(--border)", alignItems: "baseline" }}>
      <span style={{ fontSize: strong ? "14px" : "13.5px", fontWeight: strong ? 600 : 500, color: "var(--ink)" }}>{onClick ? <button type="button" onClick={onClick} className="ixt" style={{ border: 0, background: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer", textDecoration: "underline", textDecorationColor: "var(--accent-line)", textUnderlineOffset: "3px" }}>{label}</button> : label}</span>
      <span style={{ ...num, fontSize: strong ? "20px" : "15px", fontWeight: strong ? 600 : 500, letterSpacing: strong ? "-.4px" : 0, color: "var(--ink)", textAlign: "right" }}>{value}</span>
      <span style={{ fontSize: "11.5px", color: "var(--faint)" }}>{source}</span>
    </div>
  );
}

function Pnl({ r }: { r: MonthRow }) {
  const live = r.ym === PACK_MONTH.ym;
  const costs = [r.spend, r.labour, r.other].every(v => v !== null) ? r.spend! + r.labour! + r.other! : null;
  return (
    <>
      <div style={{ ...eyebrow, marginTop: "4px" }}>Revenue</div>
      <PnlLine label="Sales" source="Square sales export, imported as CSV" value={money(r.sales)} />
      <div style={{ ...eyebrow, marginTop: "14px" }}>Spending</div>
      <PnlLine label="Approved supplier spend" source={live ? "Reviewed invoices in the inbox (live)" : r.spend === null ? "Not in the 90-day onboarding import" : "Onboarding import of supplier invoices"} value={money(r.spend)} onClick={live ? () => fin.go("Invoices", "All invoices") : undefined} />
      <PnlLine label="Labour" source="Entered by the owner" value={money(r.labour)} />
      <PnlLine label="Other expenses" source="Entered by the owner: rent, utilities, card fees, insurance" value={money(r.other)} />
      <PnlLine label="Total spending" source="Sum of the three lines above" value={money(costs)} />
      <div style={{ height: "6px" }} />
      <PnlLine strong label="Indicative operating profit" source={r.profit === null ? "Data incomplete" : pct(r.profit, r.sales ?? 1) + " of sales · before tax, depreciation and financing"} value={r.profit === null ? <span style={{ color: "var(--bad)", fontSize: "14px" }}>Data incomplete</span> : eur(r.profit)} />
    </>
  );
}

function Overview({ ym }: { ym: string }) {
  const s = useFin();
  const r = monthRow(s, ym, s.ui.loc);
  const cats = categoryRows(s).map(c => ({ label: c.name, value: s.ui.loc === "ALL" ? c.total : c[s.ui.loc] })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  return (
    <>
      <Status r={r} />
      <div className="shk-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr)", gap: "14px", alignItems: "start" }}>
        <Card title={scopeLabel(s.ui.loc) + ", " + (MONTHS.find(m => m.ym === ym)?.label ?? "")} sub={PNL_LABEL + "."} extra={statusBadge(r)}><Pnl r={r} /></Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
          {ym === PACK_MONTH.ym ? (
            <Card title="Supplier spend by category" sub="Approved October lines. Edit a category on any invoice and this moves.">
              <HBars rows={cats} fmt={eur} />
            </Card>
          ) : (
            <Card title="Supplier spend by category" sub="Category detail is kept for the live month. Earlier months come from the onboarding import as totals.">
              <div style={{ fontSize: "12.5px", color: "var(--dim)" }}>Switch to {PACK_MONTH.label} to see the category split.</div>
              <Row style={{ marginTop: "10px" }}><Btn small onClick={() => fin.setMonth(PACK_MONTH.ym)}>Show {PACK_MONTH.label}</Btn></Row>
            </Card>
          )}
          <Card title="What this does not include" pad="16px 18px">
            <div style={{ fontSize: "12.5px", color: "var(--body)", lineHeight: 1.6 }}>No live POS feed, bank reconciliation, marketplace settlements or forecasts. Supplier spend is what was bought on reviewed invoices, not stock used. Your accountant confirms the statutory figures.</div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Locations({ ym }: { ym: string }) {
  const s = useFin();
  const all = monthRow(s, ym, "ALL");
  const tile = (title: string, r: MonthRow, onOpen: () => void) => (
    <Card key={title} title={title} extra={statusBadge(r)}>
      <div style={{ ...num, fontSize: "26px", fontWeight: 600, letterSpacing: "-.7px" }}>{money(r.sales)}</div>
      <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "2px" }}>Sales from the Square import</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: "7px", marginTop: "14px", fontSize: "12.5px" }}>
        <span style={{ color: "var(--dim)" }}>Approved supplier spend</span><span style={num}>{money(r.spend)}</span>
        <span style={{ color: "var(--dim)" }}>Labour (entered)</span><span style={num}>{money(r.labour)}</span>
        <span style={{ color: "var(--dim)" }}>Other expenses (entered)</span><span style={num}>{money(r.other)}</span>
        <span style={{ color: "var(--ink)", fontWeight: 600, paddingTop: "6px", borderTop: "1px solid var(--border)" }}>Indicative operating profit</span>
        <span style={{ ...num, fontWeight: 600, paddingTop: "6px", borderTop: "1px solid var(--border)", color: r.profit === null ? "var(--bad)" : "var(--ink)" }}>{r.profit === null ? "Data incomplete" : eur(r.profit) + " · " + pct(r.profit, r.sales ?? 1, 0)}</span>
      </div>
      <Row style={{ marginTop: "14px" }}><Btn small onClick={onOpen}>Open P&L</Btn></Row>
    </Card>
  );
  return (
    <>
      <Status r={all} />
      <Grid min={280}>
        {LOCS.map(l => tile(l.name, monthRow(s, ym, l.id), () => { fin.setLoc(l.id); fin.setTab("Money", "Overview"); }))}
        {tile("Both shops", all, () => { fin.setLoc("ALL"); fin.setTab("Money", "Overview"); })}
      </Grid>
      <div style={{ fontSize: "11.5px", color: "var(--faint)" }}>Food truck, events and any future site are outside phase one and are not included. {PNL_LABEL}.</div>
    </>
  );
}

function Trends() {
  const s = useFin();
  const bag = monthSeries(s, "BAG"), blk = monthSeries(s, "BLK"), all = monthSeries(s, s.ui.loc);
  return (
    <>
      <Grid min={340}>
        <Card title="Sales by shop" sub="Square import, April to October 2026.">
          <Columns data={bag.map((b, i) => ({ label: b.short, values: [b.sales ?? 0, blk[i].sales ?? 0] }))} series={[{ name: "Baggot Street", color: "var(--accent)" }, { name: "Blackrock", color: "var(--brand-3,#A9E5FF)" }]} fmt={eur} />
        </Card>
        <Card title={"Indicative operating profit, " + scopeLabel(s.ui.loc).toLowerCase()} sub="Only months with every input. April to July lack supplier invoices and labour.">
          <Columns data={all.map(r => ({ label: r.short, values: [r.profit ?? 0] }))} series={[{ name: "Indicative operating profit (0 = data incomplete)", color: "var(--ok)" }]} fmt={eur} />
        </Card>
      </Grid>
      <Card pad="14px" title="Month by month" sub={scopeLabel(s.ui.loc) + ". Click a month to open its P&L."}>
        <Table<MonthRow & { label: string }> rowKey={r => r.ym} rows={all.slice().reverse()} dense onRow={r => { fin.setMonth(r.ym); fin.setTab("Money", "Overview"); }}
          cols={[
            { key: "m", label: "Month", w: "minmax(120px,1fr)", render: r => r.label },
            { key: "s", label: "Sales", w: "110px", align: "right", render: r => money(r.sales) },
            { key: "sp", label: "Supplier spend", w: "120px", align: "right", render: r => money(r.spend) },
            { key: "l", label: "Labour", w: "110px", align: "right", render: r => money(r.labour) },
            { key: "o", label: "Other", w: "110px", align: "right", render: r => money(r.other) },
            { key: "p", label: "Indicative profit", w: "130px", align: "right", render: r => r.profit === null ? <span style={{ color: "var(--bad)" }}>Incomplete</span> : eur(r.profit) },
            { key: "st", label: "Status", w: "150px", render: statusBadge },
          ]} />
      </Card>
    </>
  );
}
