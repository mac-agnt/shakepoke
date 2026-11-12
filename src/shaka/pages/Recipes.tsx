import { useState } from "react";
import { useShaka, act, avocado, type State } from "../store";
import { RECIPES, INGREDIENTS, ORDERS, MENU, recipeCost, ingredient, type Recipe } from "../model";
import { eur, eur2, pctRaw, qtyU } from "../format";
import { Page, Card, Grid, Split, Stat, Table, Btn, Notice, RecLink, KV, Row, Badge, HBars, Field, inputStyle, num } from "../ui";
import { StatusBadge } from "../RecordDrawer";
import { tabOf } from "../nav";

const octPrices = () => Object.fromEntries(INGREDIENTS.map(i => [i.id, i.octCost])) as Record<string, number>;
const sold = (r: Recipe) => ORDERS.reduce((a, o) => a + o.lines.filter(l => l[0] === r.item).reduce((x, l) => x + l[1], 0), 0);

export default function Recipes() {
  const s = useShaka();
  const tab = tabOf(s, "Recipes");
  if (tab === "Recipes") return <List s={s} />;
  if (tab === "Cost Changes") return <Changes s={s} />;
  return <Overview s={s} />;
}

function Overview({ s }: { s: State }) {
  const a = avocado(s);
  const rows = RECIPES.map(r => { const c = recipeCost(r, s.prices); return { r, c, contrib: r.price - c, n: sold(r) }; });
  return (
    <Page period="Current November valuation · October volumes" title="Recipes" sub="Ingredient-to-bowl economics, replacing the Excel costing sheet. Ingredient contribution excludes labour, packaging and channel fees; it is not net profit.">
      <Grid min={170}>
        {rows.map(x => <Stat key={x.r.id} label={x.r.name} value={pctRaw(x.contrib / x.r.price)} sub={eur2(x.c) + " cost on " + eur2(x.r.price)} onClick={() => act.open("recipe", x.r.id)} />)}
      </Grid>
      <Split left={
        <Card title="Ingredient contribution per bowl" sub="Selling price minus current ingredient cost.">
          <HBars fmt={v => eur2(v)} rows={rows.map(x => ({ label: x.r.name, value: x.contrib, note: x.n.toLocaleString("en-IE") + " sold in Oct", onClick: () => act.open("recipe", x.r.id) }))} />
        </Card>} right={
        <Card title="Price-change exposure" extra={<StatusBadge s={a.status} />}>
          <div style={{ fontSize: "13px", lineHeight: 1.6 }}>Avocado {eur2(a.oldC)} to {eur2(a.newC)} (+{Math.round(a.pct * 100)}%) touches {a.affected.length} recipes. Each adds {eur2(a.perBowl)} per bowl.</div>
          <div style={{ marginTop: "10px" }}>{a.affected.map(r => <Row key={r.id} style={{ fontSize: "13px", padding: "4px 0" }}><RecLink kind="recipe" id={r.id}>{r.name}</RecLink><span style={{ flex: 1 }} /><span style={num}>{eur2(r.before)} to {eur2(r.after)}</span></Row>)}</div>
          <Row style={{ marginTop: "12px" }}><Btn kind="primary" onClick={() => act.go("Recipes", "Cost Changes")}>Review cost changes</Btn></Row>
        </Card>} />
    </Page>
  );
}

function List({ s }: { s: State }) {
  const [sel, setSel] = useState("RCP-SALMON");
  const r = RECIPES.find(x => x.id === sel)!;
  const oct = recipeCost(r, octPrices()), cur = recipeCost(r, s.prices);
  const [sim, setSim] = useState<Record<string, string>>({});
  const simCost = Math.round(r.lines.reduce((a, l) => a + (parseFloat(sim[l.ing] ?? "") || l.qty) * s.prices[l.ing], 0));
  return (
    <Page period="Recipe cards · stable versions for historical profitability" title="Recipe detail" sub="Version 1 has been effective since 1 April and values October. A new version is created only when a cost change is approved; October history keeps its version.">
      <Row gap={8}>{RECIPES.map(x => <Btn key={x.id} small kind={x.id === sel ? "primary" : "ghost"} onClick={() => { setSel(x.id); setSim({}); }}>{x.name}</Btn>)}</Row>
      <Split left={
        <Card title={r.name + " · " + r.id} extra={<Badge tone="info">v{cur !== oct ? 2 : 1} · effective {cur !== oct ? "12 Nov 2026" : r.effective}</Badge>}>
          <Table rowKey={l => l.ing} rows={r.lines} cols={[
            { key: "i", label: "Ingredient", w: "minmax(140px,1.3fr)", render: l => <RecLink kind="ingredient" id={l.ing}>{ingredient(l.ing)?.name}</RecLink> },
            { key: "q", label: "Per bowl", align: "right", w: "90px", render: l => qtyU(l.qty, ingredient(l.ing)?.unit ?? "") },
            { key: "o", label: "Oct unit", align: "right", w: "90px", render: l => eur2(ingredient(l.ing)!.octCost) },
            { key: "u", label: "Current unit", align: "right", w: "100px", render: l => <span style={{ color: s.prices[l.ing] !== ingredient(l.ing)!.octCost ? "var(--warn)" : "var(--body)" }}>{eur2(s.prices[l.ing])}</span> },
            { key: "c", label: "Cost", align: "right", w: "80px", render: l => eur2(Math.round(l.qty * s.prices[l.ing])) }]} footer={"Ingredient cost " + eur2(cur) + " · October valuation " + eur2(oct)} />
          <div style={{ marginTop: "12px" }}><KV rows={[["Net selling price", eur2(r.price)], ["Ingredient contribution", eur2(r.price - cur) + " · " + pctRaw((r.price - cur) / r.price)], ["Yield", r.yieldNote], ["October bowls sold", sold(r).toLocaleString("en-IE")]]} /></div>
        </Card>} right={
        <Card title="Portion editor (what-if)" sub="Try a portion change. It does not save; recipe changes go through a reviewed version.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(140px,100%),1fr))", gap: "10px" }}>
            {r.lines.map(l => <Field key={l.ing} label={ingredient(l.ing)!.name + " (" + ingredient(l.ing)!.unit + ")"}><input inputMode="decimal" value={sim[l.ing] ?? String(l.qty)} onChange={e => setSim({ ...sim, [l.ing]: e.target.value })} style={inputStyle} /></Field>)}
          </div>
          <div style={{ marginTop: "14px", fontSize: "13px" }}>What-if cost <b style={num}>{eur2(simCost)}</b> · contribution <b style={num}>{pctRaw((r.price - simCost) / r.price)}</b></div>
          <Row style={{ marginTop: "10px" }}><Btn small onClick={() => setSim({})}>Reset</Btn><Btn small onClick={() => act.toast("Excel import preview: 4 recipes mapped, units validated (simulated)")}>Excel import preview</Btn></Row>
        </Card>} />
    </Page>
  );
}

function Changes({ s }: { s: State }) {
  const a = avocado(s);
  return (
    <Page period="Reviewable cost updates" title="Cost Changes" sub="Each change links back to the supplier invoice that caused it. Approving updates the current November valuation and never rewrites October.">
      <Card title="CC-AVO-118 · Avocado" extra={<StatusBadge s={a.status} />} sub={<>Source <RecLink kind="invoice" id="INV-AVO-118" /> from <RecLink kind="supplier" id="SUP-GBP">Green Basket Produce</RecLink>: 100 avocados at €1.32 = {eur2(a.lineTotal)} before any demo tax.</>}>
        <Grid min={160}>
          <Stat label="Old unit price" value={eur2(a.oldC)} />
          <Stat label="New unit price" value={eur2(a.newC)} tone="warn" />
          <Stat label="Change" value={"+" + Math.round(a.pct * 100) + "%"} sub={"+" + eur2(a.per100) + " per 100"} />
          <Stat label="Salmon bowl" value={eur2(a.salmonAfter)} sub={"from " + eur2(a.salmonBefore) + " (+" + eur2(a.perBowl) + ")"} />
          <Stat label="Salmon ingredient contribution" value={pctRaw(a.contribPctAfter)} sub={eur2(a.contribAfter) + ", was " + eur2(a.contribBefore) + " (" + pctRaw(a.contribPctBefore) + ")"} />
        </Grid>
        <div style={{ marginTop: "14px" }}>
          <Table rowKey={r => r.id} rows={a.affected} onRow={r => act.open("recipe", r.id)} cols={[
            { key: "n", label: "Affected recipe", w: "minmax(150px,1.2fr)", render: r => r.name }, { key: "b", label: "Cost before", align: "right", w: "110px", render: r => eur2(r.before) },
            { key: "a", label: "Cost after", align: "right", w: "110px", render: r => eur2(r.after) }, { key: "d", label: "Change", align: "right", w: "90px", render: r => "+" + eur2(r.after - r.before) },
            { key: "c", label: "Contribution after", align: "right", w: "140px", render: r => eur2(r.price - r.after) + " · " + pctRaw((r.price - r.after) / r.price) }]} />
        </div>
        <div style={{ marginTop: "12px" }}><Notice tone="neutral">Excludes labour, packaging and channel fees. This is ingredient contribution, not net profit.</Notice></div>
        <Row style={{ marginTop: "12px" }}>
          {a.status === "pending" ? <><Btn kind="primary" onClick={() => act.approveCost()}>Approve cost update</Btn><Btn onClick={() => act.rejectCost()}>Decline</Btn></> : <Badge tone={a.status === "approved" ? "ok" : "neutral"}>{a.status === "approved" ? "Approved: recipes valued at €1.32 from 12 Nov" : "Declined"}</Badge>}
          <Btn kind="quiet" onClick={() => act.open("ingredient", "ING-AVO")}>Avocado history</Btn>
        </Row>
      </Card>
      <Card title="Earlier changes" sub="No other ingredient changed price in the October and November demo data."><div style={{ fontSize: "12.5px", color: "var(--dim)" }}>Version 1 of all four recipes has been in force since {RECIPES[0].effective}. Menu prices: {Object.values(MENU).filter(m => m.recipe).map(m => m.name + " " + eur(m.price)).join(", ")}.</div></Card>
    </Page>
  );
}
