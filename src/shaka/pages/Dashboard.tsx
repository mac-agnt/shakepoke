import { useState } from "react";
import { useShaka, act, pnl, channels, inboxCounts, attention, labourHours, type State } from "../store";
import { ORDERS, LOCATIONS, PERIOD, dow } from "../model";
import { eur, pct } from "../format";
import { Page, Card, Grid, Split, Stat, Btn, Notice, Waterfall, HBars, Columns, KV, Row, Badge, Field, inputStyle, num } from "../ui";
import { tabOf } from "../nav";

export default function Dashboard() {
  const s = useShaka();
  const tab = tabOf(s, "Dashboard");
  if (tab === "Locations") return <Locations />;
  if (tab === "Planning") return <Planning s={s} />;
  return <Owner s={s} />;
}

const weekOf = (d: string) => { const n = parseInt(d.slice(8), 10); return n <= 4 ? "1 to 4 Oct" : n <= 11 ? "5 to 11 Oct" : n <= 18 ? "12 to 18 Oct" : n <= 25 ? "19 to 25 Oct" : "26 to 31 Oct"; };

function Owner({ s }: { s: State }) {
  const P = pnl(), A = P.ALL;
  const weeks = ["1 to 4 Oct", "5 to 11 Oct", "12 to 18 Oct", "19 to 25 Oct", "26 to 31 Oct"].map(w => {
    const o = ORDERS.filter(x => weekOf(x.date) === w);
    return { label: w, values: [o.filter(x => x.loc === "BAG").reduce((a, x) => a + x.net, 0), o.filter(x => x.loc === "BLK").reduce((a, x) => a + x.net, 0)] };
  });
  const c = inboxCounts(s);
  const att = attention(s);
  return (
    <Page period={"Reporting period " + PERIOD.label + " · demo figures"} title="Owner view"
      sub="Where October landed and what is open this week. Sales visibility already exists in Square; Pulse adds costs, settlements and margin."
      actions={<Btn kind="primary" onClick={() => act.go("Finance", "P&L")}>Open full P&L</Btn>}>
      <Split left={
        <Card title="October, sales to estimated operating profit" sub="All locations. Not statutory net profit.">
          <Waterfall fmt={v => eur(v)} steps={[{ label: "Net sales", value: A.sales, total: true }, { label: "Ingredients", value: -A.cogs }, { label: "Labour", value: -A.labour }, { label: "Channel fees", value: -A.fees }, { label: "Other", value: -A.other }, { label: "Profit", value: A.profit, total: true }]} />
        </Card>} right={
        <Card title="Location comparison" sub="Estimated operating profit and margin, October.">
          <HBars fmt={v => eur(v)} rows={[
            { label: "Baggot Street", value: P.BAG.profit, note: pct(P.BAG.profit, P.BAG.sales), onClick: () => act.go("Dashboard", "Locations") },
            { label: "Blackrock", value: P.BLK.profit, note: pct(P.BLK.profit, P.BLK.sales), onClick: () => act.go("Dashboard", "Locations") },
            { label: "Food Truck (dormant)", value: P.TRK.profit, note: "n/a" }]} />
          <div style={{ marginTop: "14px", fontSize: "12px", color: "var(--dim)", lineHeight: 1.5 }}>Blackrock's October loss comes mainly from a higher fixed market rent against lower weekday sales, plus a 32% labour ratio.</div>
        </Card>} />
      <Split ratio="1.35fr 1fr" left={
        <Card title="Net sales by week" sub="October orders, by location.">
          <Columns fmt={v => eur(v)} series={[{ name: "Baggot Street", color: "var(--brand-2,#46C8F0)" }, { name: "Blackrock", color: "var(--brand,#0854A0)" }]} data={weeks} />
        </Card>} right={
        <Card title="Data completeness" sub="What the October figures are built from.">
          <KV rows={[["Sales orders", ORDERS.length.toLocaleString("en-IE") + " seeded rows, deduplicated"], ["Timesheets", (labourHours("BAG") + labourHours("BLK")) + " hours"], ["Other costs", "15 cost rows incl. truck"], ["Ingredient COGS", "Stock bridge: opening + purchases − closing"],
            ["November invoices", c.ready + " of " + c.total + " ready"], ["Historical backfill", "216 of 240 matched (90%)"]]} />
        </Card>} />
      <Card title="Top exceptions" sub="Click to open the record or page.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: "10px" }}>
          {att.map(x => (
            <button key={x.id} type="button" onClick={x.go} className="ixr" style={{ textAlign: "left", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--r-md,14px)", background: "var(--surface-faint)", cursor: "pointer", color: "var(--ink)", font: "inherit" }}>
              <Row gap={8}><Badge tone={x.tone}>{x.age}</Badge><span style={{ fontSize: "13px", fontWeight: 500 }}>{x.title}</span></Row>
              <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "5px" }}>{x.why}</div>
            </button>
          ))}
          {!att.length && <div style={{ fontSize: "13px", color: "var(--dim)" }}>Nothing open. Every exception has been handled.</div>}
        </div>
      </Card>
    </Page>
  );
}

function Locations() {
  const [sel, setSel] = useState<"BAG" | "BLK" | "TRK">("BLK");
  const P = pnl();
  const l = LOCATIONS.find(x => x.id === sel)!;
  const r = P[sel];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const byDow = sel === "TRK" ? [] : days.map((d, i) => ({ label: d, values: [ORDERS.filter(o => o.loc === sel && dow(o.date) === (i + 1) % 7).reduce((a, o) => a + o.net, 0)] }));
  const ch = sel === "TRK" ? [] : channels(sel).filter(x => x.sales);
  return (
    <Page period={"October 2026 · trading hours are demo settings"} title="Locations" sub="Two shops and a seasonal truck. The call's Monday to Friday Baggot Street model is used here; public listings may show other hours."
      actions={<Row gap={6}>{LOCATIONS.map(x => <Btn key={x.id} small kind={sel === x.id ? "primary" : "ghost"} onClick={() => setSel(x.id as "BAG" | "BLK" | "TRK")}>{x.name}</Btn>)}</Row>}>
      <Grid min={260}>
        {LOCATIONS.map(x => {
          const q = P[x.id];
          return (
            <button key={x.id} type="button" onClick={() => setSel(x.id as "BAG" | "BLK" | "TRK")} className="ixr" style={{ textAlign: "left", padding: "16px 18px", borderRadius: "var(--card-r,18px)", border: "1px solid " + (sel === x.id ? "var(--accent)" : "var(--border)"), background: "var(--surface)", cursor: "pointer", color: "var(--ink)", font: "inherit" }}>
              <Row gap={8}><span style={{ fontSize: "15px", fontWeight: 600 }}>{x.name}</span><Badge tone={x.id === "TRK" ? "neutral" : "info"}>{x.kind}</Badge></Row>
              <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "4px" }}>{x.address}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginTop: "14px" }}>
                <Mini k="Net sales" v={eur(q.sales)} /><Mini k="Profit" v={eur(q.profit)} neg={q.profit < 0} /><Mini k="Margin" v={x.id === "TRK" ? "n/a" : pct(q.profit, q.sales)} neg={q.profit < 0} />
              </div>
            </button>
          );
        })}
      </Grid>
      <Split left={
        <Card title={l.name + " · cost ratios"} sub={l.note}>
          <KV rows={[["Trading", l.hours], ["Net sales", eur(r.sales)], ["Ingredient COGS", eur(r.cogs) + " · " + pct(r.cogs, r.sales)], ["Labour", eur(r.labour) + " · " + pct(r.labour, r.sales, 0) + (sel !== "TRK" ? " (" + labourHours(sel) + " h at €16)" : "")],
            ["Channel fees", eur(r.fees) + " · " + pct(r.fees, r.sales)], ["Other operating costs", eur(r.other) + " · " + pct(r.other, r.sales)], ["Estimated operating profit", <span style={{ color: r.profit < 0 ? "var(--bad)" : "var(--ink)", fontWeight: 600 }}>{eur(r.profit)} · {sel === "TRK" ? "n/a" : pct(r.profit, r.sales)}</span>]]} />
          <Row style={{ marginTop: "14px" }}><Btn small onClick={() => act.open("location", sel)}>Location record</Btn><Btn small onClick={() => act.go("Team", "Labour")}>Labour detail</Btn></Row>
        </Card>} right={
        sel === "TRK" ? <Card title="Seasonal truck"><Notice tone="neutral">Mostly inactive until next summer, except private events. €200 dormant storage and insurance cost in October, no sales. One unconfirmed private-event enquiry sits in Sales and is excluded from booked revenue.</Notice><div style={{ marginTop: "12px" }}><Btn onClick={() => act.go("Sales", "Corporate & Events")}>Events timeline</Btn></div></Card> :
        <Card title="Sales by weekday" sub={sel === "BLK" ? "Weekend trade carries Blackrock." : "Weekday office lunch trade; closed weekends and the 26 Oct bank holiday."}>
          <Columns fmt={v => eur(v)} series={[{ name: "Net sales", color: sel === "BAG" ? "var(--brand-2,#46C8F0)" : "var(--brand,#0854A0)" }]} data={byDow} height={130} />
          <div style={{ marginTop: "14px" }}><HBars fmt={v => eur(v)} rows={ch.map(c => ({ label: c.name, value: c.sales, note: pct(c.sales, r.sales, 0) }))} /></div>
        </Card>} />
      <Notice tone="neutral" title="Seasonality.">Blackrock has sharper winter seasonality than Baggot Street. Weather and events are manual annotations only; there are no live feeds in this demo.</Notice>
    </Page>
  );
}
const Mini = ({ k, v, neg }: { k: string; v: string; neg?: boolean }) => <div><div style={{ fontSize: "11px", color: "var(--faint)" }}>{k}</div><div style={{ ...num, fontSize: "15px", fontWeight: 600, marginTop: "3px", color: neg ? "var(--bad)" : "var(--ink)" }}>{v}</div></div>;

function Planning({ s }: { s: State }) {
  const { fixed, cm } = s.plan;
  const [f, setF] = useState(String(fixed / 100));
  const [m, setM] = useState(String(Math.round(cm * 1000) / 10));
  const be = cm > 0 ? fixed / cm : 0;
  const P = pnl();
  return (
    <Page period="Confidential · proposed, not approved" title="Planning: third location scenario"
      sub="An exploratory break-even model for a possible third site. No address, lease or site cost evidence exists; every input is an assumption you can change.">
      <Notice tone="warn" title="Confidential scenario.">Not a committed opening. Shown to David only in this demo.</Notice>
      <Split left={
        <Card title="Assumptions" sub="Edit and the break-even updates immediately.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))", gap: "12px" }}>
            <Field label="Assumed fixed cost per month (EUR)" help="Rent, base labour, utilities, insurance: costs that do not move with sales.">
              <input inputMode="decimal" value={f} onChange={e => { setF(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v)) act.setPlan(Math.round(v * 100), cm); }} style={inputStyle} />
            </Field>
            <Field label="Contribution margin (%)" help="Share of each euro of sales left after variable costs: ingredients, channel fees, packaging.">
              <input inputMode="decimal" value={m} onChange={e => { setM(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) act.setPlan(fixed, v / 100); }} style={inputStyle} />
            </Field>
          </div>
          <Row style={{ marginTop: "12px" }}><Btn small onClick={() => { act.setPlan(1200000, 0.35); setF("12000"); setM("35"); }}>Reset to €12,000 and 35%</Btn></Row>
        </Card>} right={
        <Card title="Break-even sales">
          <div style={{ ...num, fontSize: "34px", fontWeight: 600, letterSpacing: "-1px" }}>{"€" + (be / 100).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span style={{ fontSize: "14px", color: "var(--dim)", fontWeight: 400 }}> / month</span></div>
          <div style={{ fontSize: "12.5px", color: "var(--dim)", marginTop: "8px" }}>Fixed cost {eur(fixed)} ÷ contribution margin {(cm * 100).toFixed(1)}%</div>
          <div style={{ marginTop: "16px" }}><HBars fmt={v => eur(v)} rows={[{ label: "Third site break-even (scenario)", value: Math.round(be) }, { label: "Baggot Street October sales (actual demo)", value: P.BAG.sales }, { label: "Blackrock October sales (actual demo)", value: P.BLK.sales }]} /></div>
        </Card>} />
      <Card title="Definitions">
        <KV rows={[["Fixed costs", "Costs that stay the same whatever the sales: rent, minimum staffing, insurance, systems."], ["Variable costs", "Costs that move with each bowl sold: ingredients, packaging, marketplace commission."], ["Contribution margin", "Sales minus variable costs, as a share of sales."], ["Break-even", "Monthly sales where contribution exactly covers fixed costs."]]} />
      </Card>
    </Page>
  );
}
