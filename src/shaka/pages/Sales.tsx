import { useMemo, useState } from "react";
import { useShaka, act, pnl, channels, corporateNeeds, type State } from "../store";
import { ORDERS, CHANNELS, CORPORATE, EVENTS, RECIPES, PERIOD, FORECAST, MENU, locName, channelName, person, type ChannelId } from "../model";
import { eur, eur2, pct, dayLabel, downloadCSV, centsCSV } from "../format";
import { Page, Card, Grid, Split, Stat, Table, Badge, Btn, Seg, Notice, RecLink, HBars, KV, Row, Field, inputStyle } from "../ui";
import { tabOf } from "../nav";

export default function Sales() {
  const s = useShaka();
  const tab = tabOf(s, "Sales");
  if (tab === "Orders") return <Orders />;
  if (tab === "Channels") return <Channels />;
  if (tab === "Corporate & Events") return <Corporate s={s} />;
  return <Overview />;
}

function Overview() {
  const P = pnl(), ch = channels();
  const groups = Array.from(new Set(CHANNELS.map(c => c.group))).map(g => ({ g, v: ch.filter(c => c.group === g).reduce((a, c) => a + c.sales, 0) }));
  return (
    <Page period={"October 2026 · net sales after refunds, net of tax"} title="Sales"
      sub="Square already aggregates sales and location reporting. Pulse keeps one deduplicated order list and adds fees, settlements and ingredient contribution.">
      <Grid min={170}>
        <Stat label="Net sales" value={eur(P.ALL.sales)} sub={ORDERS.length.toLocaleString("en-IE") + " orders"} onClick={() => act.go("Sales", "Orders")} />
        <Stat label="Baggot Street" value={eur(P.BAG.sales)} sub={pct(P.BAG.sales, P.ALL.sales, 0) + " of sales"} />
        <Stat label="Blackrock" value={eur(P.BLK.sales)} sub={pct(P.BLK.sales, P.ALL.sales, 0) + " of sales"} />
        <Stat label="Average order" value={eur2(Math.round(P.ALL.sales / ORDERS.length))} />
        <Stat label="Channel fees" value={eur(P.ALL.fees)} sub="Assumed marketplace rates" onClick={() => act.go("Sales", "Channels")} />
      </Grid>
      <Split left={
        <Card title="By channel" sub="Illustrative split, not David's exact reported ratio.">
          <HBars fmt={v => eur(v)} rows={ch.filter(c => c.sales).map(c => ({ label: c.name, value: c.sales, note: pct(c.sales, P.ALL.sales, 0), onClick: () => act.open("channel", c.id) }))} />
        </Card>} right={
        <Card title="By channel group">
          <HBars fmt={v => eur(v)} rows={groups.filter(g => g.v).map(g => ({ label: g.g, value: g.v, note: pct(g.v, P.ALL.sales, 0) }))} />
          <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "14px", lineHeight: 1.5 }}>Direct in-store 60%, delivery marketplaces 30%, corporate 9%, surplus 1%. Events had no October sales.</div>
        </Card>} />
      <Notice tone="neutral" title="Net sales defined.">Order value after refunds and discounts, excluding tax. Marketplace orders arrive through Stream (name to confirm) into Square; each is counted once by its original channel order ID.</Notice>
    </Page>
  );
}

function Orders() {
  const [loc, setLoc] = useState<"All" | "Baggot Street" | "Blackrock">("All");
  const [ch, setCh] = useState<ChannelId | "all">("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => ORDERS.filter(o => (loc === "All" || locName(o.loc) === loc) && (ch === "all" || o.channel === ch) && (!q || (o.id + o.squareRef + o.sourceRef).toLowerCase().includes(q.toLowerCase()))).slice().reverse(), [loc, ch, q]);
  const total = rows.reduce((a, o) => a + o.net, 0);
  return (
    <Page period="October 2026 · every seeded order" title="Orders"
      sub="Filterable order rows with the original channel ID, the Square reference and line items. Rows reconcile to the location and channel totals."
      actions={<Btn onClick={() => downloadCSV("shaka-poke-demo-orders-oct-2026.csv", ["Order", "Date", "Time", "Location", "Channel", "Square ref", "Original ID", "Net EUR", "Fee EUR", "Allocated ingredients EUR"], rows.map(o => [o.id, o.date, o.time, locName(o.loc), channelName(o.channel), o.squareRef, o.sourceRef, centsCSV(o.net), centsCSV(o.fee), centsCSV(o.cogs)]))}>Download {rows.length.toLocaleString("en-IE")} rows</Btn>}>
      <Card>
        <Row style={{ marginBottom: "12px" }}>
          <Seg options={["All", "Baggot Street", "Blackrock"] as const} value={loc} onChange={setLoc} />
          <select aria-label="Channel" value={ch} onChange={e => setCh(e.target.value as ChannelId | "all")} style={{ ...inputStyle, width: "auto" }}><option value="all">All channels</option>{CHANNELS.filter(c => c.id !== "events").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <input aria-label="Search orders" placeholder="Search order, Square or channel ID" value={q} onChange={e => setQ(e.target.value)} style={{ ...inputStyle, width: "min(280px,100%)" }} />
        </Row>
        <Table rowKey={o => o.id} rows={rows} pageSize={15} onRow={o => act.open("order", o.id)} empty="No orders match."
          cols={[{ key: "id", label: "Order", w: "100px", render: o => <span style={{ color: "var(--ink)" }}>{o.id}</span> }, { key: "d", label: "Date", w: "120px", render: o => dayLabel(o.date) + " " + o.time },
            { key: "l", label: "Location", w: "120px", render: o => locName(o.loc) }, { key: "c", label: "Channel", w: "110px", render: o => channelName(o.channel) },
            { key: "sq", label: "Square ref", w: "100px", render: o => o.squareRef }, { key: "src", label: "Original ID", w: "110px", render: o => o.sourceRef || "None" },
            { key: "it", label: "Items", w: "minmax(180px,1.5fr)", render: o => o.lines.map(([it, n]) => n + " × " + MENU[it].name).join(", ") },
            { key: "n", label: "Net", align: "right", w: "90px", render: o => eur2(o.net) }]}
          footer={rows.length.toLocaleString("en-IE") + " orders · " + eur(total) + " net"} />
      </Card>
    </Page>
  );
}

function Channels() {
  const ch = channels().filter(c => c.sales || c.id === "events");
  const tot = ch.reduce((a, c) => ({ sales: a.sales + c.sales, fees: a.fees + c.fees, cogs: a.cogs + c.cogs, contribution: a.contribution + c.contribution }), { sales: 0, fees: 0, cogs: 0, contribution: 0 });
  return (
    <Page period="October 2026 · order date basis" title="Channel economics"
      sub="Net sales, then channel fees, then allocated ingredient cost. Order date drives these figures; settlement date drives cash in Reconciliation.">
      <Notice tone="warn" title="Assumptions.">Deliveroo, Uber Eats and Just Eat fees use an assumed 20% of net sales (€2,400, €1,600 and €800). Other channels are assumed at €0. These are not verified commercial commission rates.</Notice>
      <Card>
        <Table rowKey={c => c.id} rows={ch} onRow={c => act.open("channel", c.id)} cols={[
          { key: "n", label: "Channel", w: "minmax(140px,1.2fr)", render: c => <span style={{ color: "var(--ink)" }}>{c.name}</span> }, { key: "g", label: "Group", w: "150px", render: c => c.group },
          { key: "o", label: "Orders", align: "right", w: "80px", render: c => c.orders.toLocaleString("en-IE") }, { key: "s", label: "Net sales", align: "right", w: "110px", render: c => eur(c.sales) },
          { key: "r", label: "Fee rate", align: "right", w: "90px", render: c => c.feeRate ? Math.round(c.feeRate * 100) + "%" : "€0" }, { key: "f", label: "Fees", align: "right", w: "100px", render: c => eur(c.fees) },
          { key: "c", label: "Ingredients", align: "right", w: "110px", render: c => eur(c.cogs) }, { key: "x", label: "Contribution", align: "right", w: "120px", render: c => eur(c.contribution) },
          { key: "p", label: "Contribution %", align: "right", w: "120px", render: c => c.sales ? pct(c.contribution, c.sales) : "n/a" }]}
          footer={"Totals: " + eur(tot.sales) + " sales · " + eur(tot.fees) + " fees · " + eur(tot.cogs) + " ingredients · " + eur(tot.contribution) + " contribution"} />
      </Card>
      <Grid min={300}>
        <Card title="Deduplication" sub="How the same sale is kept from being counted three times.">
          <KV rows={[["Source of truth", "Square order list"], ["Marketplace path", "Marketplace to Stream (name to confirm) to Square"], ["Match key", "Original channel order ID plus Stream and Square mapping"], ["Result", "One order row, one Square reference, one original ID"]]} />
        </Card>
        <Card title="Cash timing">
          <div style={{ fontSize: "13px", color: "var(--body)", lineHeight: 1.6 }}>Marketplace payouts land days after the order. The Deliveroo statement for 26 Oct to 1 Nov paid on 6 Nov and is short by €126; it is under investigation, not booked as a loss.</div>
          <div style={{ marginTop: "12px" }}><Btn onClick={() => act.open("settlement", "SET-DEL-1106")}>Open SET-DEL-1106</Btn></div>
        </Card>
      </Grid>
    </Page>
  );
}

function Corporate({ s }: { s: State }) {
  const n = corporateNeeds();
  const lt = channels().find(c => c.id === "lunchteam")!, fd = channels().find(c => c.id === "feeder")!;
  return (
    <Page period={"Booked corporate demand · " + PERIOD.label + " actuals and November bookings"} title="Corporate & Events"
      sub="Confirmed corporate orders are separated from forecast walk-in demand. Enquiries are excluded from booked revenue until confirmed.">
      <Grid min={170}>
        <Stat label="Lunch Team, October" value={eur(lt.sales)} sub={lt.orders + " orders"} />
        <Stat label="Feeder, October" value={eur(fd.sales)} sub={fd.orders + " orders (vendor to confirm)"} />
        <Stat label="Booked for Friday" value={n.bowls + " bowls"} sub={eur2(n.value) + " net"} tone="accent" onClick={() => act.open("corporate", CORPORATE.id)} />
        <Stat label="Walk-in baseline, Friday" value={(s.prep.forecastOverride?.value ?? FORECAST.walkIn) + " bowls"} sub="Illustrative forecast, separate" onClick={() => act.go("Stock", "Prep")} />
      </Grid>
      <Split left={
        <Card title={"Confirmed: " + CORPORATE.id} extra={<Badge tone="ok">Confirmed</Badge>} sub={CORPORATE.customer + " (fictional) via Lunch Team · Baggot Street · Fri 13 Nov " + CORPORATE.time}>
          <Table rowKey={l => l[0]} rows={CORPORATE.lines} cols={[{ key: "r", label: "Bowl", render: l => <RecLink kind="recipe" id={l[0]}>{RECIPES.find(r => r.id === l[0])?.name}</RecLink> }, { key: "q", label: "Qty", align: "right", w: "70px", render: l => l[1] }, { key: "p", label: "Net price", align: "right", w: "100px", render: () => eur2(CORPORATE.unitPrice) }, { key: "t", label: "Total", align: "right", w: "100px", render: l => eur2(l[1] * CORPORATE.unitPrice) }]}
            footer={n.bowls + " bowls · " + eur2(n.value) + " net"} />
          <KV rows={[["Prep owner", person(CORPORATE.prepOwner)?.name], ["Dispatch owner", person(CORPORATE.dispatchOwner)?.name], ["Packaging", CORPORATE.packaging + " bowls"], ["Prep status", s.prep.completed ? "Complete" : "Not yet complete"]]} />
          <Row style={{ marginTop: "12px" }}><Btn kind="primary" onClick={() => act.go("Stock", "Prep")}>Open prep checklist</Btn><Btn onClick={() => act.open("corporate", CORPORATE.id)}>Order record</Btn></Row>
          <div style={{ marginTop: "12px" }}><Notice tone="warn" title="Dietary note.">Requires manager review; Pulse does not judge dietary safety.</Notice></div>
        </Card>} right={
        <Card title="Seasonal events timeline" sub="Truck and private events. Demo history entries are labelled.">
          {EVENTS.map(e => (
            <div key={e.id} style={{ display: "flex", gap: "12px", padding: "10px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ width: "92px", flex: "none", fontSize: "12px", color: "var(--dim)" }}>{e.date}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Row gap={8}><span style={{ fontSize: "13px" }}>{e.title}</span><Badge tone={e.status === "Unconfirmed" ? "warn" : e.status === "Completed" ? "neutral" : "info"}>{e.status}</Badge></Row>
                <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "3px" }}>{e.value} · {e.note}</div>
              </div>
            </div>
          ))}
          <EnquiryNote />
        </Card>} />
    </Page>
  );
}
function EnquiryNote() {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <div style={{ marginTop: "12px" }}>
      <Field label="Note on the unconfirmed enquiry (local only)"><input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. waiting on headcount" style={inputStyle} /></Field>
      <Row style={{ marginTop: "8px" }}><Btn small onClick={() => { if (note.trim()) { setSaved(note.trim()); setNote(""); act.toast("Note saved on ENQ-1204"); } }}>Save note</Btn>{saved && <span style={{ fontSize: "12px", color: "var(--dim)" }}>Saved: {saved}</span>}</Row>
    </div>
  );
}
