import { useState } from "react";
import { useShaka, act, stockView, corporateNeeds, transferTotals, type State } from "../store";
import { CORPORATE, FORECAST, WASTE, RECIPES, ingredient, locName, person } from "../model";
import { eur, eur2, qtyU, dayLabel } from "../format";
import { Page, Card, Grid, Split, Stat, Table, Badge, Btn, Seg, Notice, RecLink, KV, Row, Field, inputStyle, num } from "../ui";
import { StatusBadge } from "../RecordDrawer";
import { tabOf } from "../nav";

export default function Stock() {
  const s = useShaka();
  const tab = tabOf(s, "Stock");
  if (tab === "Stock Levels") return <Levels s={s} />;
  if (tab === "Prep") return <Prep s={s} />;
  if (tab === "Transfers") return <Transfers s={s} />;
  if (tab === "Waste") return <WastePage />;
  return <Overview s={s} />;
}

function Overview({ s }: { s: State }) {
  const sv = stockView(s);
  const low = sv.filter(r => r.low);
  const tr = s.transfers.find(t => t.id === "TRF-1113")!;
  const steps = prepSteps();
  const done = steps.filter(x => s.prep.steps[x.id]).length;
  const wasteCost = WASTE.reduce((a, w) => a + w.cost, 0);
  return (
    <Page period="Physical stock · Thu 12 Nov 2026" title="Stock" sub="Quantities, reservations, movements between sites and recorded waste. Managers already run prep and ordering well; this makes the numbers visible.">
      <Grid min={170}>
        <Stat label="Lines below par" value={low.length} tone={low.length ? "warn" : "ok"} onClick={() => act.go("Stock", "Stock Levels")} />
        <Stat label="Pending transfers" value={s.transfers.filter(t => t.status !== "received").length} sub={"TRF-1113 " + tr.status} onClick={() => act.go("Stock", "Transfers")} />
        <Stat label="Friday prep" value={s.prep.completed ? "Complete" : done + " of " + steps.length + " steps"} sub="COR-1113, 48 bowls" onClick={() => act.go("Stock", "Prep")} />
        <Stat label="Waste, last 7 days" value={eur2(wasteCost)} sub="Low, mostly cooked rice" onClick={() => act.go("Stock", "Waste")} />
      </Grid>
      <Split left={
        <Card title="Below par" sub="Available after reservations for confirmed demand.">
          <Table rowKey={r => r.item + r.loc} rows={low} onRow={r => act.open("ingredient", r.item)} empty="Everything is at or above par." cols={[
            { key: "i", label: "Item", w: "minmax(140px,1.2fr)", render: r => ingredient(r.item)?.name }, { key: "l", label: "Site", w: "110px", render: r => locName(r.loc) },
            { key: "a", label: "Available", align: "right", w: "100px", render: r => qtyU(r.available, ingredient(r.item)?.unit ?? "") }, { key: "p", label: "Par", align: "right", w: "80px", render: r => qtyU(r.par, ingredient(r.item)?.unit ?? "") },
            { key: "in", label: "Incoming", align: "right", w: "100px", render: r => r.incoming ? qtyU(r.incoming, ingredient(r.item)?.unit ?? "") : "None" }]} />
        </Card>} right={
        <Card title="Friday transfer" extra={<StatusBadge s={tr.status} />} sub={"Baggot Street to Blackrock · " + tr.when}>
          <KV rows={[["Items", tr.items.map(i => qtyU(i.qty, ingredient(i.item)?.unit ?? "") + " " + ingredient(i.item)?.name.toLowerCase()).join(", ")], ["Carrying value", eur2(transferTotals(tr))], ["Prepares / transports / receives", [tr.prepares, tr.transports, tr.receives].map(p => person(p)?.name.split(" ")[0]).join(" / ")]]} />
          <Row style={{ marginTop: "12px" }}><Btn kind="primary" onClick={() => act.open("transfer", tr.id)}>Open transfer</Btn></Row>
        </Card>} />
    </Page>
  );
}

function Levels({ s }: { s: State }) {
  const [loc, setLoc] = useState<"All" | "Baggot Street" | "Blackrock">("All");
  const rows = stockView(s).filter(r => loc === "All" || locName(r.loc) === loc);
  const u = (i: string) => ingredient(i)?.unit ?? "";
  return (
    <Page period="As recorded, Thu 12 Nov" title="Stock Levels" sub="Available = on hand minus reservations. Reservations never exceed what is physically there; any shortfall is shown separately. In-transit and incoming stock is not counted as on hand.">
      <Card extra={<Seg options={["All", "Baggot Street", "Blackrock"] as const} value={loc} onChange={setLoc} />} title="Items by site">
        <Table rowKey={r => r.item + r.loc} rows={rows} onRow={r => act.open("ingredient", r.item)} cols={[
          { key: "i", label: "Item", w: "minmax(160px,1.3fr)", render: r => <span style={{ color: "var(--ink)" }}>{ingredient(r.item)?.name}</span> }, { key: "l", label: "Site", w: "110px", render: r => locName(r.loc) },
          { key: "o", label: "On hand", align: "right", w: "90px", render: r => qtyU(r.onHand, u(r.item)) }, { key: "r", label: "Reserved", align: "right", w: "90px", render: r => r.reserved ? qtyU(r.reserved, u(r.item)) : "0" },
          { key: "t", label: "In transit", align: "right", w: "90px", render: r => r.inTransit || r.inTransitOut ? qtyU(r.inTransit || r.inTransitOut, u(r.item)) + (r.inTransitOut ? " out" : " in") : "0" },
          { key: "a", label: "Available", align: "right", w: "100px", render: r => <span style={{ color: r.low ? "var(--warn)" : "var(--ink)" }}>{qtyU(r.available, u(r.item))}</span> },
          { key: "p", label: "Par", align: "right", w: "70px", render: r => qtyU(r.par, u(r.item)) },
          { key: "f", label: "Flag", w: "130px", render: r => r.shortfall > 0 ? <Badge tone="bad">Short {qtyU(r.shortfall, u(r.item))}</Badge> : r.low ? <Badge tone="warn">Below par</Badge> : <Badge tone="ok">OK</Badge> }]} />
      </Card>
    </Page>
  );
}

function prepSteps() {
  return [
    { id: "dietary", label: "Manager reviews the dietary note", owner: "P-AOIFE" },
    { id: "rice", label: "Cook 7.2 kg sushi rice for corporate bowls", owner: "P-LUCAS" },
    { id: "proteins", label: "Portion proteins: 2.88 kg chicken, 1.6 kg salmon, 0.96 kg tofu", owner: "P-SOFIA" },
    { id: "veg", label: "Prep avocado (12), cucumber (10), spinach, edamame, salsa", owner: "P-SOFIA" },
    { id: "pack", label: "Assemble and pack 48 bowls, label by type", owner: "P-SOFIA" },
    { id: "dispatch", label: "Hand to dispatch for 12:15", owner: "P-AOIFE" },
  ];
}

function Prep({ s }: { s: State }) {
  const n = corporateNeeds();
  const steps = prepSteps();
  const sv = stockView(s).filter(r => r.loc === "BAG");
  const [fv, setFv] = useState(String(s.prep.forecastOverride?.value ?? FORECAST.walkIn));
  const [fr, setFr] = useState(s.prep.forecastOverride?.reason ?? "");
  const walk = s.prep.forecastOverride?.value ?? FORECAST.walkIn;
  const incomingBlk = s.transfers.filter(t => t.status !== "received" && t.to === "BLK");
  const allDone = steps.every(x => x.id === "dietary" ? s.prep.dietaryReviewed : s.prep.steps[x.id]);
  return (
    <Page period={"Prep for Friday 13 November · Baggot Street"} title="Prep"
      sub="Confirmed corporate demand is planned from recipes. The walk-in baseline is a separate, illustrative forecast that managers can override with a reason.">
      <Grid min={220}>
        <Card title="Confirmed demand" extra={<Badge tone="ok">Committed</Badge>}>
          <div style={{ ...num, fontSize: "26px", fontWeight: 600 }}>{n.bowls} bowls</div>
          <div style={{ fontSize: "12.5px", color: "var(--dim)", marginTop: "4px" }}><RecLink kind="corporate" id={CORPORATE.id} /> · 24 chicken + 16 salmon + 8 tofu · 12:15 · {eur2(n.value)}</div>
          <div style={{ fontSize: "12px", color: "var(--faint)", marginTop: "6px" }}>Friday is generally quieter, but this order stays committed.</div>
        </Card>
        <Card title="Walk-in baseline" extra={<Badge tone="neutral">Illustrative</Badge>}>
          <div style={{ ...num, fontSize: "26px", fontWeight: 600 }}>{walk} bowls{s.prep.forecastOverride && <span style={{ fontSize: "12px", color: "var(--warn)", fontWeight: 500 }}> override</span>}</div>
          <div style={{ fontSize: "12px", color: "var(--faint)", marginTop: "6px", lineHeight: 1.45 }}>Range {FORECAST.low} to {FORECAST.high}. {FORECAST.quality}</div>
        </Card>
        <Card title="Manager override">
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "8px" }}>
            <Field label="Bowls"><input inputMode="numeric" value={fv} onChange={e => setFv(e.target.value)} style={inputStyle} /></Field>
            <Field label="Reason"><input value={fr} onChange={e => setFr(e.target.value)} placeholder="e.g. rain forecast" style={inputStyle} /></Field>
          </div>
          <Row style={{ marginTop: "8px" }}><Btn small kind="primary" onClick={() => { const v = parseInt(fv, 10); if (!isNaN(v)) act.setForecastOverride(v, fr); }}>Apply override</Btn>{s.prep.forecastOverride && <Btn small onClick={() => { act.setForecastOverride(null, ""); setFv(String(FORECAST.walkIn)); setFr(""); }}>Clear</Btn>}</Row>
        </Card>
      </Grid>
      <Split left={
        <Card title="Corporate requirements from recipes" sub="Quantities for COR-1113 only. Edit a line to hold extra safety stock; the reason is kept.">
          <Table rowKey={r => r.ing} rows={Object.entries(n.need).map(([ing, q]) => ({ ing, q }))} dense cols={[
            { key: "i", label: "Ingredient", w: "minmax(140px,1.2fr)", render: r => <RecLink kind="ingredient" id={r.ing}>{ingredient(r.ing)?.name}</RecLink> },
            { key: "q", label: "Needed", align: "right", w: "110px", render: r => qtyU(r.q, ingredient(r.ing)?.unit ?? "") + (r.ing === "ING-SALMON" || r.ing === "ING-AVO" ? " *" : "") },
            { key: "o", label: "Plan (override)", align: "right", w: "minmax(130px,auto)", render: r => <OverrideCell ing={r.ing} base={r.q} s={s} /> },
            { key: "a", label: "Available now", align: "right", w: "110px", render: r => { const st = sv.find(x => x.item === r.ing); return st ? qtyU(st.onHand, ingredient(r.ing)?.unit ?? "") + " on hand" : "n/a"; } }]}
            footer={"* Salmon bowls alone need " + n.bySalmon["ING-SALMON"] + " kg salmon and " + n.bySalmon["ING-AVO"] + " avocados; tofu bowls add 4 avocados."} />
          {incomingBlk.length > 0 && <div style={{ marginTop: "12px" }}><Notice tone="info" title="Blackrock projected arrival.">{incomingBlk.map(t => t.id + ": " + t.items.map(i => qtyU(i.qty, ingredient(i.item)?.unit ?? "") + " " + ingredient(i.item)?.name.toLowerCase()).join(", ") + " (" + t.status + ")").join("; ")}. Shown as incoming for Blackrock's prep; not counted as on hand until received.</Notice></div>}
        </Card>} right={
        <Card title="Prep checklist" extra={s.prep.completed ? <Badge tone="ok">Complete</Badge> : <Badge tone="warn">Owner: Sofia Costa</Badge>} sub={"Packaging " + CORPORATE.packaging + " · dispatch owner Aoife Byrne"}>
          <Notice tone="warn" title="Dietary note.">{CORPORATE.dietary}</Notice>
          <div style={{ marginTop: "10px" }}>
            {steps.map(x => {
              const on = x.id === "dietary" ? s.prep.dietaryReviewed : !!s.prep.steps[x.id];
              return (
                <label key={x.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "9px 0", borderTop: "1px solid var(--border)", cursor: s.prep.completed ? "default" : "pointer" }}>
                  <input type="checkbox" checked={on} disabled={s.prep.completed || (x.id === "dietary" && on)} onChange={() => x.id === "dietary" ? act.reviewDietary() : act.toggleStep(x.id)} style={{ marginTop: "3px", accentColor: "var(--accent)" }} />
                  <span style={{ fontSize: "13px", textDecoration: on ? "line-through" : "none", color: on ? "var(--dim)" : "var(--ink)" }}>{x.label}<span style={{ display: "block", fontSize: "11.5px", color: "var(--faint)", textDecoration: "none" }}>{person(x.owner)?.name}{x.id === "dietary" ? " · manager only" : ""}</span></span>
                </label>
              );
            })}
          </div>
          <Row style={{ marginTop: "10px" }}><Btn kind="primary" disabled={s.prep.completed || !allDone} title={!allDone ? "Tick every step first" : undefined} onClick={() => act.completePrep()}>{s.prep.completed ? "Prep completed" : "Mark prep complete"}</Btn></Row>
        </Card>} />
      <Card title="Recipe basis" sub="Portions used for the requirements above.">
        <Grid min={220}>{RECIPES.filter(r => CORPORATE.lines.some(l => l[0] === r.id)).map(r => <div key={r.id} style={{ fontSize: "12.5px", lineHeight: 1.6 }}><RecLink kind="recipe" id={r.id}>{r.name}</RecLink><div style={{ color: "var(--dim)" }}>{r.lines.map(l => qtyU(l.qty, ingredient(l.ing)?.unit ?? "") + " " + ingredient(l.ing)?.name.toLowerCase()).join(", ")}</div></div>)}</Grid>
      </Card>
    </Page>
  );
}
function OverrideCell({ ing, base, s }: { ing: string; base: number; s: State }) {
  const o = s.prep.overrides[ing];
  const [v, setV] = useState(String(o?.qty ?? base));
  const [why, setWhy] = useState(o?.reason ?? "");
  const [editing, setEditing] = useState(false);
  if (!editing) return (
    <button type="button" onClick={e => { e.stopPropagation(); setEditing(true); }} title={o ? "Override: " + o.reason : "Click to override"} style={{ border: 0, background: "none", padding: 0, font: "inherit", cursor: "pointer", color: o ? "var(--warn)" : "var(--body)", textDecoration: "underline dotted" }}>
      {qtyU(o?.qty ?? base, ingredient(ing)?.unit ?? "")}
    </button>
  );
  const save = () => { const q = parseFloat(v); if (isNaN(q) || q < 0) return; if (!why.trim()) { act.toast("Override needs a reason"); return; } act.setOverride(ing, q, why.trim()); setEditing(false); };
  return (
    <span style={{ display: "inline-flex", gap: "4px" }} onClick={e => e.stopPropagation()}>
      <input aria-label="Override quantity" value={v} onChange={e => setV(e.target.value)} style={{ ...inputStyle, width: "56px", height: "28px", padding: "0 6px" }} />
      <input aria-label="Reason" placeholder="Reason" value={why} onChange={e => setWhy(e.target.value)} onKeyDown={e => { if (e.key === "Enter") save(); }} style={{ ...inputStyle, width: "90px", height: "28px", padding: "0 6px" }} />
      <button type="button" onClick={save} style={{ ...inputStyle, width: "auto", height: "28px", padding: "0 8px", cursor: "pointer" }}>Save</button>
      {o && <button type="button" onClick={() => { act.clearOverride(ing); setV(String(base)); setWhy(""); setEditing(false); }} style={{ ...inputStyle, width: "auto", height: "28px", padding: "0 8px", cursor: "pointer" }}>Reset</button>}
    </span>
  );
}

function Transfers({ s }: { s: State }) {
  const cols: { st: "scheduled" | "dispatched" | "received"; label: string }[] = [{ st: "scheduled", label: "Scheduled" }, { st: "dispatched", label: "In transit" }, { st: "received", label: "Received" }];
  const tr = s.transfers.find(t => t.id === "TRF-1113")!;
  const sv = stockView(s);
  const u = (i: string) => ingredient(i)?.unit ?? "";
  const totalValue = tr.items.reduce((a, i) => a + Math.round(i.qty * i.unitCost), 0);
  return (
    <Page period="Cross-site movements" title="Transfers" sub="Replaces the WhatsApp coordination locally. A transfer moves stock between sites; it never creates a purchase or revenue. Pulse does not read or send WhatsApp messages.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: "14px" }}>
        {cols.map(c => (
          <Card key={c.st} title={c.label} extra={<Badge tone="neutral">{s.transfers.filter(t => t.status === c.st).length}</Badge>} pad="14px 16px">
            {s.transfers.filter(t => t.status === c.st).map(t => (
              <button key={t.id} type="button" onClick={() => act.open("transfer", t.id)} className="ixr" style={{ width: "100%", textAlign: "left", padding: "12px 14px", marginTop: "8px", border: "1px solid var(--border)", borderRadius: "var(--r-md,14px)", background: "var(--surface-2)", cursor: "pointer", color: "var(--ink)", font: "inherit" }}>
                <Row gap={8}><span style={{ fontWeight: 600, fontSize: "13px" }}>{t.id}</span><span style={{ fontSize: "12px", color: "var(--dim)" }}>{t.when}</span></Row>
                <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "4px" }}>{locName(t.from)} to {locName(t.to)} · {eur2(transferTotals(t))}</div>
                <div style={{ fontSize: "12px", color: "var(--body)", marginTop: "4px" }}>{t.items.map(i => qtyU(i.qty, u(i.item)) + " " + ingredient(i.item)?.name.toLowerCase()).join(", ")}</div>
              </button>
            ))}
            {!s.transfers.some(t => t.status === c.st) && <div style={{ fontSize: "12.5px", color: "var(--faint)", padding: "10px 0" }}>None</div>}
          </Card>
        ))}
      </div>
      <Card title="TRF-1113 conservation check" extra={<StatusBadge s={tr.status} />} sub="Origin + in transit + destination stays constant for every item; group stock value is unchanged.">
        <Table rowKey={r => r.item} rows={tr.items} cols={[
          { key: "i", label: "Item", w: "minmax(150px,1.2fr)", render: r => ingredient(r.item)?.name }, { key: "q", label: "Transfer", align: "right", w: "90px", render: r => qtyU(r.qty, u(r.item)) },
          { key: "o", label: "Baggot on hand", align: "right", w: "120px", render: r => qtyU(sv.find(x => x.item === r.item && x.loc === "BAG")!.onHand, u(r.item)) },
          { key: "t", label: "In transit", align: "right", w: "100px", render: r => qtyU(tr.status === "dispatched" ? r.qty : 0, u(r.item)) },
          { key: "d", label: "Blackrock on hand", align: "right", w: "130px", render: r => qtyU(sv.find(x => x.item === r.item && x.loc === "BLK")!.onHand, u(r.item)) },
          { key: "g", label: "Group total", align: "right", w: "110px", render: r => qtyU(+(sv.find(x => x.item === r.item && x.loc === "BAG")!.onHand + sv.find(x => x.item === r.item && x.loc === "BLK")!.onHand + (tr.status === "dispatched" ? r.qty : 0)).toFixed(3), u(r.item)) }]}
          footer={"Carrying value " + eur2(totalValue) + " (salmon €24/kg, salsa €6/kg)"} />
        <Row style={{ marginTop: "12px" }}>
          {tr.status === "scheduled" && <Btn kind="primary" onClick={() => act.dispatch(tr.id)}>Dispatch as Aoife</Btn>}
          {tr.status === "dispatched" && <Btn kind="primary" onClick={() => act.receive(tr.id)}>Confirm receipt as Conor</Btn>}
          {tr.status === "received" && <Badge tone="ok">Received; transit back to zero</Badge>}
        </Row>
      </Card>
    </Page>
  );
}

function WastePage() {
  const total = WASTE.reduce((a, w) => a + w.cost, 0);
  const rice = WASTE.filter(w => w.item === "ING-RICE");
  return (
    <Page period="Last 7 days" title="Waste" sub="Waste is low except cooked rice. Surplus sold through Too Good To Go is recorded as sales, not as waste, and is not counted twice.">
      <Grid min={170}>
        <Stat label="Recorded waste" value={eur2(total)} sub={WASTE.length + " records"} />
        <Stat label="Cooked rice" value={qtyU(+rice.reduce((a, w) => a + w.qty, 0).toFixed(1), "kg")} sub={eur2(rice.reduce((a, w) => a + w.cost, 0)) + ", the main source"} tone="warn" />
        <Stat label="Recovered via Too Good To Go" value="6 bags" sub="Counted in sales, not here" />
      </Grid>
      <Card>
        <Table rowKey={w => w.id} rows={WASTE} onRow={w => act.open("waste", w.id)} cols={[
          { key: "d", label: "Date", w: "100px", render: w => dayLabel(w.date) }, { key: "l", label: "Site", w: "110px", render: w => locName(w.loc) },
          { key: "i", label: "Item", w: "minmax(140px,1fr)", render: w => ingredient(w.item)?.name }, { key: "q", label: "Qty", align: "right", w: "80px", render: w => qtyU(w.qty, ingredient(w.item)?.unit ?? "") },
          { key: "r", label: "Reason", w: "minmax(180px,1.4fr)", render: w => w.reason }, { key: "c", label: "Cost", align: "right", w: "80px", render: w => eur2(w.cost) },
          { key: "rc", label: "Recovery", w: "minmax(200px,1.6fr)", render: w => w.recovered }]} footer={"Total " + eur(total)} />
      </Card>
    </Page>
  );
}
