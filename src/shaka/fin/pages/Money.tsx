/* Money & Reports: Square-derived sales, approved supplier spend and owner-entered
   costs, kept apart, giving an indicative management P&L. Missing inputs show a
   Data incomplete state rather than an invented number. */
import type { ReactNode } from "react";
import { useFin, fin, monthRow, monthSeries, categoryRows, type MonthRow, type Scope } from "../store";
import { MONTHS, LOCS, locName, PACK_MONTH } from "../data";
import { finTab } from "../nav";
import { eur, pct } from "../../format";
import { Page, Card, Grid, Badge, Notice, Row, Seg, Columns, HBars, Btn, Table, Waterfall, inputStyle, eyebrow, num } from "../../ui";
import { Kpi, Donut, LineChart, StackBar, Spark as SparkLine, VIZ, change, kEur } from "../../viz";

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
  const loc = s.ui.loc;
  const r = monthRow(s, ym, loc);
  const ser = monthSeries(s, loc);
  const i = ser.findIndex(x => x.ym === ym);
  const prev = i > 0 ? ser[i - 1] : null;
  const upto = ser.slice(0, i + 1);
  const vs = prev ? "vs " + prev.short : "";
  const share = (v: number | null) => (v === null || !r.sales ? "" : pct(v, r.sales, 0) + " of sales");
  const cats = categoryRows(s).map(c => ({ label: c.name, value: loc === "ALL" ? c.total : c[loc] })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  const bag = monthRow(s, ym, "BAG"), blk = monthRow(s, ym, "BLK");
  const split = (label: string, a: number | null, b: number | null, legend?: boolean) => (
    <div key={label} style={{ marginTop: "12px" }}>
      <div style={{ display: "flex", fontSize: "12px", marginBottom: "6px" }}><span style={{ flex: 1, color: "var(--dim)" }}>{label}</span><span style={{ ...num, color: "var(--ink)" }}>{a === null || b === null ? "Not provided" : eur(a + b)}</span></div>
      {a === null || b === null ? <div style={{ height: "12px", borderRadius: "6px", border: "1px dashed var(--border-strong)" }} />
        : <StackBar legend={!!legend} rows={[{ label: "Baggot Street", value: a, color: VIZ[0] }, { label: "Blackrock", value: b, color: VIZ[1] }]} fmt={eur} />}
    </div>
  );
  return (
    <>
      <Grid min={175}>
        <Kpi label="Sales" value={money(r.sales)} delta={change(r.sales, prev?.sales)} sub={vs ? "Square import · " + vs : "Square import"} spark={upto.map(x => x.sales)} />
        <Kpi label="Supplier spend" value={money(r.spend)} delta={change(r.spend, prev?.spend)} goodWhen="down" sub={share(r.spend) || "Approved invoices"} spark={upto.map(x => x.spend)} sparkColor={VIZ[1]} onClick={ym === PACK_MONTH.ym ? () => fin.go("Invoices", "All invoices") : undefined} />
        <Kpi label="Labour" value={money(r.labour)} delta={change(r.labour, prev?.labour)} goodWhen="down" sub={share(r.labour) || "Entered by the owner"} spark={upto.map(x => x.labour)} sparkColor={VIZ[2]} />
        <Kpi label="Other expenses" value={money(r.other)} delta={change(r.other, prev?.other)} goodWhen="down" sub={share(r.other) || "Rent, utilities, fees"} spark={upto.map(x => x.other)} sparkColor={VIZ[3]} />
        <Kpi label="Indicative operating profit" value={r.profit === null ? "Incomplete" : eur(r.profit)} tone={r.profit === null ? "bad" : undefined} delta={change(r.profit, prev?.profit)} sub={r.profit === null ? "Missing inputs" : share(r.profit).replace("of sales", "margin")} spark={upto.map(x => x.profit)} sparkColor="var(--ok)" />
      </Grid>
      <Status r={r} />
      <div className="shk-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: "14px", alignItems: "start" }}>
        <Card title={scopeLabel(loc) + ", " + (MONTHS.find(m => m.ym === ym)?.label ?? "")} sub={PNL_LABEL + "."} extra={statusBadge(r)}><Pnl r={r} /></Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
          {r.profit !== null ? (<>
            <Card title="From sales to profit" sub="Each cost taken off sales, left to right.">
              <Waterfall fmt={kEur} steps={[{ label: "Sales", value: r.sales!, total: true }, { label: "Suppliers", value: -r.spend! }, { label: "Labour", value: -r.labour! }, { label: "Other", value: -r.other! }, { label: "Profit", value: r.profit, total: true }]} />
            </Card>
            <Card title="Where each euro of sales went">
              <Donut fmt={eur} center={{ value: kEur(r.sales!), label: "sales" }} rows={[
                { label: "Supplier spend", value: r.spend!, color: VIZ[1] }, { label: "Labour", value: r.labour!, color: VIZ[2] },
                { label: "Other expenses", value: r.other!, color: VIZ[3] }, { label: "Indicative profit", value: Math.max(0, r.profit), color: "var(--ok)" }]} />
            </Card>
          </>) : (
            <Card title="Inputs for this month" sub="Profit appears once all four are in.">
              {[["Square sales", r.sales], ["Supplier invoices", r.spend], ["Labour", r.labour], ["Other expenses", r.other]].map(([k, v]) => (
                <div key={k as string} style={{ display: "flex", alignItems: "center", padding: "9px 0", borderTop: "1px solid var(--border)", fontSize: "13px" }}>
                  <span style={{ flex: 1 }}>{k as string}</span>{v === null ? <Badge tone="bad">Missing</Badge> : <Badge tone="ok">In</Badge>}
                </div>))}
            </Card>
          )}
        </div>
      </div>
      <Grid min={320}>
        {ym === PACK_MONTH.ym ? (
          <Card title="Supplier spend by category" sub="Approved October lines. Edit a category on any invoice and this moves.">
            <HBars rows={cats.map((c, k) => ({ ...c, color: VIZ[k % VIZ.length] }))} fmt={eur} />
          </Card>
        ) : (
          <Card title="Supplier spend by category" sub="Category detail is kept for the live month. Earlier months come from the onboarding import as totals.">
            <div style={{ fontSize: "12.5px", color: "var(--dim)" }}>Switch to {PACK_MONTH.label} to see the category split.</div>
            <Row style={{ marginTop: "10px" }}><Btn small onClick={() => fin.setMonth(PACK_MONTH.ym)}>Show {PACK_MONTH.label}</Btn></Row>
          </Card>
        )}
        <Card title="Shop split" sub="How each line divides between the two shops.">
          {split("Sales", bag.sales, blk.sales, true)}
          {split("Supplier spend", bag.spend, blk.spend)}
          {split("Labour", bag.labour, blk.labour)}
          {split("Other expenses", bag.other, blk.other)}
        </Card>
        <Card title="What this does not include" pad="16px 18px">
          <div style={{ fontSize: "12.5px", color: "var(--body)", lineHeight: 1.6 }}>No live POS feed, bank reconciliation, marketplace settlements or forecasts. Supplier spend is what was bought on reviewed invoices, not stock used. Your accountant confirms the statutory figures.</div>
        </Card>
      </Grid>
    </>
  );
}

const ratio = (v: number | null, sales: number | null) => (v === null || !sales ? 0 : Math.round((v / sales) * 1000));

function Locations({ ym }: { ym: string }) {
  const s = useFin();
  const all = monthRow(s, ym, "ALL");
  const bag = monthRow(s, ym, "BAG"), blk = monthRow(s, ym, "BLK");
  const sBag = monthSeries(s, "BAG"), sBlk = monthSeries(s, "BLK");
  const tile = (title: string, r: MonthRow, series: (number | null)[], color: string, onOpen: () => void) => (
    <Card key={title} title={title} extra={statusBadge(r)}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "14px" }}>
        <div style={{ flex: "none" }}>
          <div style={{ ...num, fontSize: "26px", fontWeight: 600, letterSpacing: "-.7px" }}>{money(r.sales)}</div>
          <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "2px" }}>Sales from the Square import</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}><Spark7 values={series} color={color} /></div>
      </div>
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
        {LOCS.map((l, k) => tile(l.name, monthRow(s, ym, l.id), (l.id === "BAG" ? sBag : sBlk).map(x => x.sales), VIZ[k], () => { fin.setLoc(l.id); fin.setTab("Money", "Overview"); }))}
        {tile("Both shops", all, monthSeries(s, "ALL").map(x => x.sales), "var(--ok)", () => { fin.setLoc("ALL"); fin.setTab("Money", "Overview"); })}
      </Grid>
      <Grid min={320}>
        <Card title="Cost ratios by shop" sub="Each cost as a share of that shop's sales. Lower is better, except margin.">
          <Columns height={160} fmt={v => (v / 10).toFixed(1) + "%"} series={[{ name: "Baggot Street", color: VIZ[0] }, { name: "Blackrock", color: VIZ[1] }]}
            data={[["Suppliers", "spend"], ["Labour", "labour"], ["Other", "other"], ["Margin", "profit"]].map(([label, k]) => ({ label, values: [ratio(bag[k as "spend"], bag.sales), ratio(blk[k as "spend"], blk.sales)] }))} />
        </Card>
        <Card title="Share of sales" sub={MONTHS.find(m => m.ym === ym)?.label}>
          <Donut fmt={eur} center={{ value: all.sales === null ? "n/a" : kEur(all.sales), label: "both shops" }} rows={[{ label: "Baggot Street", value: bag.sales ?? 0, color: VIZ[0] }, { label: "Blackrock", value: blk.sales ?? 0, color: VIZ[1] }]} />
        </Card>
        <Card title="Sales by shop over time" sub="April to October 2026.">
          <LineChart height={170} labels={sBag.map(x => x.short)} fmt={kEur} series={[{ name: "Baggot Street", color: VIZ[0], values: sBag.map(x => x.sales) }, { name: "Blackrock", color: VIZ[1], values: sBlk.map(x => x.sales) }]} />
        </Card>
      </Grid>
      <div style={{ fontSize: "11.5px", color: "var(--faint)" }}>Food truck, events and any future site are outside phase one and are not included. {PNL_LABEL}.</div>
    </>
  );
}
const Spark7 = ({ values, color }: { values: (number | null)[]; color: string }) => <div style={{ height: "44px" }}><SparkLine values={values} color={color} /></div>;

function Trends() {
  const s = useFin();
  const bag = monthSeries(s, "BAG"), blk = monthSeries(s, "BLK"), all = monthSeries(s, s.ui.loc);
  const both = monthSeries(s, "ALL");
  const margin = (r: MonthRow) => (r.profit === null || !r.sales ? null : Math.round((r.profit / r.sales) * 1000) / 10);
  const full = all.filter(r => r.spend !== null && r.labour !== null);
  const keep = both.map((r, k) => (margin(r) === null ? -1 : k)).filter(k => k >= 0);
  return (
    <>
      <Card title="Sales by shop" sub="Square import, April to October 2026. Hover a month for the figures.">
        <LineChart height={220} area labels={bag.map(b => b.short)} fmt={kEur} series={[
          { name: "Both shops", color: "var(--ok)", values: both.map(x => x.sales) },
          { name: "Baggot Street", color: VIZ[0], values: bag.map(x => x.sales) },
          { name: "Blackrock", color: VIZ[1], values: blk.map(x => x.sales) }]} />
      </Card>
      <Grid min={340}>
        <Card title="Operating margin by shop" sub="Indicative profit as a share of sales, for months with every input in.">
          <LineChart height={180} labels={keep.map(k => bag[k].short)} fmt={v => v.toFixed(0) + "%"} series={[
            { name: "Baggot Street", color: VIZ[0], values: keep.map(k => margin(bag[k])) }, { name: "Blackrock", color: VIZ[1], values: keep.map(k => margin(blk[k])) }, { name: "Both shops", color: "var(--ok)", values: keep.map(k => margin(both[k])), dashed: true }]} />
        </Card>
        <Card title={"Costs and profit, " + scopeLabel(s.ui.loc).toLowerCase()} sub="Months with supplier invoices and labour in.">
          <Columns height={160} fmt={eur} data={full.map(r => ({ label: r.short, values: [r.spend ?? 0, r.labour ?? 0, r.other ?? 0, r.profit ?? 0] }))}
            series={[{ name: "Suppliers", color: VIZ[1] }, { name: "Labour", color: VIZ[2] }, { name: "Other", color: VIZ[3] }, { name: "Profit", color: "var(--ok)" }]} />
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
