/* Ingredient Costs: what was bought, from approved supplier invoice lines.
   Purchased, not consumed. No stock, recipe or margin engine. */
import { useFin, fin, ingredientRows, priceAlerts, approvedLines, type IngRow, type Scope } from "../store";
import { SUPPLIERS, locName, lineTotal } from "../data";
import { finTab } from "../nav";
import { eur, eur2 } from "../../format";
import { Page, Card, Table, Btn, Badge, Notice, Row, Seg, HBars, Split, KV, eyebrow, num } from "../../ui";

const SCOPES: Scope[] = ["ALL", "BAG", "BLK"];
const scopeLabel = (s: Scope) => (s === "ALL" ? "Both shops" : locName(s));
const unitPrice = (c: number, unit: string) => eur2(c) + (unit === "each" ? " each" : " / " + unit);
export const changeBadge = (v: number | null) => v === null ? <Badge tone="neutral">No October lines</Badge>
  : Math.abs(v) < 0.005 ? <Badge tone="neutral">No change</Badge>
  : <Badge tone={v > 0.05 ? "warn" : v > 0 ? "neutral" : "ok"}>{(v > 0 ? "+" : "") + (v * 100).toFixed(Math.abs(v * 100) >= 10 ? 0 : 1) + "%"}</Badge>;

export default function Ingredients() {
  const s = useFin();
  const tab = finTab(s, "Ingredients");
  return (
    <Page period="October 2026 · Illustrative demo data" title="Ingredient Costs"
      sub="Spend on the core ingredient list, from approved supplier invoice lines. This shows what was bought, not what was used in bowls."
      actions={<Badge tone="neutral">Demo data</Badge>}>
      {tab === "Price changes" ? <Changes /> : tab === "Recipe sheet" ? <RecipeSheet /> : <Spend />}
    </Page>
  );
}

function Spend() {
  const s = useFin();
  const loc = s.ui.loc;
  const rows = ingredientRows(s);
  const focus = rows.find(r => r.id === s.ui.ingFocus) ?? null;
  const val = (r: IngRow) => (loc === "ALL" ? { qty: r.qty, spend: r.spend } : r[loc]);
  const total = rows.reduce((a, r) => a + val(r).spend, 0);
  const lines = approvedLines(s).filter(r => loc === "ALL" || r.inv.loc === loc);
  const bySup = SUPPLIERS.map(sp => ({ label: sp.name, value: lines.filter(r => r.inv.supplier === sp.id && r.line.ing).reduce((a, r) => a + lineTotal(r.line), 0) })).filter(x => x.value > 0).sort((a, b) => b.value - a.value);
  return (
    <>
      <Row>
        <Seg options={SCOPES.map(scopeLabel)} value={scopeLabel(loc)} onChange={v => fin.setLoc(SCOPES.find(x => scopeLabel(x) === v) ?? "ALL")} />
        <span style={{ fontSize: "12.5px", color: "var(--dim)" }}>{rows.length} ingredients tracked · <span style={num}>{eur(total)}</span> approved in October</span>
      </Row>
      <Split ratio={focus ? "minmax(0,1.25fr) minmax(0,1fr)" : "minmax(0,1.6fr) minmax(0,.8fr)"}
        left={
          <Card pad="14px" title="Spend by ingredient" sub="Click an ingredient for the invoice lines behind it.">
            <Table<IngRow> rowKey={r => r.id} rows={rows.slice().sort((a, b) => val(b).spend - val(a).spend)} onRow={r => fin.focusIngredient(focus?.id === r.id ? null : r.id, false)} dense
              cols={[
                { key: "n", label: "Ingredient", w: "minmax(140px,1.4fr)", render: r => <span style={{ color: focus?.id === r.id ? "var(--accent)" : "var(--ink)", fontWeight: focus?.id === r.id ? 600 : 500 }}>{r.name}</span> },
                { key: "q", label: "Units bought", w: "110px", align: "right", render: r => val(r).qty.toLocaleString("en-IE") + " " + (r.unit === "each" ? "" : r.unit) },
                { key: "s", label: "Approved spend", w: "120px", align: "right", render: r => eur(val(r).spend) },
                ...(focus ? [] : [{ key: "p", label: "Sept price", w: "110px", align: "right" as const, render: (r: IngRow) => eur2(r.prior) }, { key: "o", label: "Oct price", w: "100px", align: "right" as const, render: (r: IngRow) => r.price === null ? "n/a" : eur2(r.price) }]),
                { key: "c", label: "Change", w: "110px", render: r => changeBadge(r.change) },
              ]} />
          </Card>}
        right={focus ? <Evidence r={focus} /> : (
          <Card title="By supplier" sub={"Ingredient lines only, " + scopeLabel(loc).toLowerCase() + "."}>
            <HBars rows={bySup} fmt={eur} />
            <div style={{ marginTop: "14px" }}><Notice tone="neutral">Purchased ingredients from approved invoices. Stock on hand, waste and recipe usage are not tracked in phase one.</Notice></div>
          </Card>)} />
    </>
  );
}

function Evidence({ r }: { r: IngRow }) {
  return (
    <Card title={<Row gap={8}>{r.name}{changeBadge(r.change)}</Row>} sub="Evidence: every approved October invoice line for this ingredient." extra={<Btn small kind="quiet" onClick={() => fin.focusIngredient(null, false)}>Close</Btn>}>
      <KV rows={[
        ["September price", unitPrice(r.prior, r.unit) + " (onboarding import)"],
        ["October price", r.price === null ? "No approved lines" : unitPrice(r.price, r.unit)],
        ["Bought in October", r.qty.toLocaleString("en-IE") + " " + r.unit + " · " + eur2(r.spend)],
      ]} />
      <div style={{ ...eyebrow, margin: "16px 0 8px" }}>By shop</div>
      <HBars rows={[{ label: "Baggot Street", value: r.BAG.spend, note: r.BAG.qty + " " + r.unit }, { label: "Blackrock", value: r.BLK.spend, note: r.BLK.qty + " " + r.unit }]} fmt={eur2} />
      <div style={{ ...eyebrow, margin: "16px 0 8px" }}>Source invoice lines</div>
      <Table rowKey={x => x.line.id} rows={r.lines} dense onRow={x => fin.openInvoice(x.inv.id)} empty="No approved lines yet."
        cols={[
          { key: "i", label: "Invoice", w: "minmax(110px,1fr)", render: x => <span style={{ color: "var(--accent)" }}>{x.inv.id}</span> },
          { key: "d", label: "Date", w: "76px", render: x => +x.inv.date.slice(8) + " Oct" },
          { key: "l", label: "Shop", w: "minmax(90px,.9fr)", render: x => locName(x.inv.loc ?? "") },
          { key: "q", label: "Qty", w: "64px", align: "right", render: x => String(x.line.qty) },
          { key: "s", label: "Spend", w: "84px", align: "right", render: x => eur2(lineTotal(x.line)) },
        ]} />
      {r.pendingQty > 0 && <div style={{ marginTop: "12px" }}><Notice tone="warn" title="Not counted yet." action={<Btn small onClick={() => fin.openInvoice(r.pendingInv[0])}>Review {r.pendingInv[0]}</Btn>}>{r.pendingQty} {r.unit === "each" ? "" : r.unit + " of "}{r.name.toLowerCase()} on {r.pendingInv.join(", ")} waits for review.</Notice></div>}
    </Card>
  );
}

function Changes() {
  const s = useFin();
  const alerts = priceAlerts(s);
  const rows = ingredientRows(s);
  return (
    <Split ratio="minmax(0,1.2fr) minmax(0,1fr)"
      left={<Card title="Price changes of 5% or more" sub="October average price paid against September, from approved lines.">
        {alerts.map(a => (
          <button key={a.id} type="button" onClick={() => fin.focusIngredient(a.id)} className="ix11"
            style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "4px 14px", width: "100%", textAlign: "left", padding: "12px 4px", border: 0, borderTop: "1px solid var(--border)", background: "none", color: "var(--ink)", font: "inherit", cursor: "pointer" }}>
            <span style={{ fontSize: "13.5px", fontWeight: 500 }}>{a.name}</span>
            <span>{changeBadge(a.change)}</span>
            <span style={{ ...num, fontSize: "12px", color: "var(--dim)" }}>{unitPrice(a.prior, a.unit)} in September → {unitPrice(a.price ?? 0, a.unit)} in October</span>
            <span style={{ ...num, fontSize: "12px", color: "var(--dim)", textAlign: "right" }}>{eur(Math.round((a.price! - a.prior) * a.qty))} extra on {a.qty.toLocaleString("en-IE")} {a.unit}</span>
          </button>
        ))}
      </Card>}
      right={<Card title="September to October" sub="Unit price paid, every tracked ingredient.">
        <HBars rows={rows.filter(r => r.change !== null).sort((a, b) => b.change! - a.change!).map(r => ({ label: r.name, value: Math.abs(Math.round(r.change! * 1000) / 10), note: r.change! > 0.0005 ? "up" : r.change! < -0.0005 ? "down" : "flat", color: r.change! > 0.05 ? "var(--warn)" : r.change! < 0 ? "var(--ok)" : "var(--accent)", onClick: () => fin.focusIngredient(r.id) }))}
          fmt={v => v.toFixed(1) + "%"} />
      </Card>} />
  );
}

function RecipeSheet() {
  return (
    <Split ratio="minmax(0,1fr) minmax(0,1fr)"
      left={<Card title="Bowl costing sheet.xlsx" sub="Uploaded reference from David's existing Excel file (demo)." extra={<Badge tone="neutral">Reference only</Badge>}>
        <KV rows={[["Uploaded", "2 Nov 2026 by David"], ["Rows", "4 bowls, 14 ingredient rows"], ["Used for", "Looking up portion sizes while reading ingredient spend"]]} />
        <div style={{ marginTop: "14px" }}><Notice tone="neutral" title="Not a recipe engine.">Phase one does not recalculate bowl costs, margins, portions or stock from this sheet. It stays your spreadsheet; this page just keeps it next to the spend figures.</Notice></div>
      </Card>}
      right={<Card title="Preview, as uploaded" sub="First rows of the sheet, unchanged.">
        <Table rowKey={r => r[0]} rows={[["Salmon bowl", "Salmon 120 g, avocado ½, rice 180 g"], ["Chicken bowl", "Chicken 140 g, edamame 40 g, rice 180 g"], ["Tuna bowl", "Tuna 110 g, mango 60 g, rice 180 g"], ["Tofu bowl", "Tofu 130 g, cabbage 40 g, rice 180 g"]]} dense
          cols={[{ key: "b", label: "Bowl", w: "120px", render: r => r[0] }, { key: "x", label: "Main rows", w: "minmax(200px,1fr)", render: r => r[1] }]} />
      </Card>} />
  );
}
