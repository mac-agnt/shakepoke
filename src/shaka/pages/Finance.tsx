import { useMemo, useState } from "react";
import { useShaka, act, pnl, expenses, inboxCounts, backfillCounts, avocado, cogsBridge, type State } from "../store";
import { BACKFILL, BANK_LINES, ORDERS, SHIFTS, OVERHEADS, PERIOD, invoiceNet, supplierName, locName, channelName, type LocId } from "../model";
import { eur, eur2, pct, dayLabel, monthLabel, downloadCSV, centsCSV } from "../format";
import { Page, Card, Grid, Split, Stat, Table, Badge, Btn, Seg, Notice, RecLink, Waterfall, HBars, Progress, Row, KV, eyebrow, num } from "../ui";
import { StatusBadge } from "../RecordDrawer";
import { tabOf } from "../nav";

export default function Finance() {
  const s = useShaka();
  const tab = tabOf(s, "Finance");
  if (tab === "Invoice Inbox") return <Inbox s={s} />;
  if (tab === "Reconciliation") return <Recon s={s} />;
  if (tab === "P&L") return <PnL />;
  if (tab === "Accountant Pack") return <Pack s={s} />;
  return <Overview s={s} />;
}

function Overview({ s }: { s: State }) {
  const p = pnl().ALL, c = inboxCounts(s), b = backfillCounts(), a = avocado(s);
  const set = s.settlements.find(x => x.id === "SET-DEL-1106")!;
  return (
    <Page period={"Financial reporting period: " + PERIOD.label + " · operational date Thu 12 Nov 2026"} title="Finance"
      sub="Pulse prepares, explains and reconciles. It does not replace statutory accounting, file returns or make payments."
      actions={<><Btn onClick={() => act.go("Finance", "Invoice Inbox")}>Review invoices</Btn><Btn kind="primary" onClick={() => act.go("Finance", "Accountant Pack")}>Accountant pack</Btn></>}>
      <Grid min={180}>
        <Stat label="October net sales" value={eur(p.sales)} sub="After refunds, net of tax" onClick={() => act.go("Finance", "P&L")} />
        <Stat label="October expenses" value={eur(expenses(p))} sub="Ingredients, labour, fees, other" onClick={() => act.go("Finance", "P&L")} />
        <Stat label="Estimated operating profit" value={eur(p.profit)} sub={pct(p.profit, p.sales) + " margin, not statutory profit"} tone="accent" onClick={() => act.go("Finance", "P&L")} />
        <Stat label="November invoices to review" value={c.exceptions} sub={c.ready + " of " + c.total + " ready"} tone={c.exceptions ? "warn" : "ok"} onClick={() => act.go("Finance", "Invoice Inbox")} />
        <Stat label="Backfill matched" value={pct(b.matched, b.total, 0)} sub={b.matched + " of " + b.total + " documents, Apr to Sep"} onClick={() => act.go("Finance", "Accountant Pack")} />
      </Grid>
      <Split left={
        <Card title="October, sales to estimated operating profit" sub="All locations. Each step is calculated from seeded order, timesheet and cost rows.">
          <Waterfall fmt={v => eur(v)} steps={[{ label: "Net sales", value: p.sales, total: true }, { label: "Ingredients", value: -p.cogs }, { label: "Labour", value: -p.labour }, { label: "Channel fees", value: -p.fees }, { label: "Other costs", value: -p.other }, { label: "Operating profit", value: p.profit, total: true }]} />
        </Card>} right={
        <Card title="November review workload" sub="Kept separate from the October actuals.">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <WorkRow label="Invoice inbox (FIN-112)" value={c.ready + " ready · " + c.review + " extraction review · " + c.duplicate + " duplicates"} tone={c.exceptions ? "warn" : "ok"} go={() => act.go("Finance", "Invoice Inbox")} />
            <WorkRow label="Avocado cost change CC-AVO-118" value={"€1.10 to €1.32, " + (a.status === "pending" ? "awaiting approval" : a.status)} tone={a.status === "pending" ? "warn" : "ok"} go={() => act.open("costChange", "CC-AVO-118")} />
            <WorkRow label="Deliveroo SET-DEL-1106" value={set.status === "investigate" ? eur(set.expected - (set.received ?? 0)) + " difference to investigate" : "Explained"} tone={set.status === "investigate" ? "bad" : "ok"} go={() => act.open("settlement", "SET-DEL-1106")} />
            <WorkRow label="Missing receipts (bank)" value={BANK_LINES.filter(l => l.status === "missing").length + " card payments without a receipt"} tone="warn" go={() => act.go("Finance", "Reconciliation")} />
            <WorkRow label="Historical backfill" value={b.missing + " missing receipts · " + b.ambiguous + " ambiguous"} tone="warn" go={() => act.go("Finance", "Accountant Pack")} />
          </div>
        </Card>} />
      <Notice tone="neutral" title="Reviewable estimated position.">Figures are demo assumptions. No debt, tax or depreciation is assumed; "estimated operating profit" is not statutory net profit. Xero remains the accounting destination; Pulse produces reviewed draft exports only.</Notice>
    </Page>
  );
}
function WorkRow({ label, value, tone, go }: { label: string; value: string; tone: "ok" | "warn" | "bad"; go: () => void }) {
  return (
    <button type="button" onClick={go} className="ix11" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-md,14px)", background: "var(--surface-faint)", cursor: "pointer", textAlign: "left", font: "inherit", color: "var(--ink)" }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "2px", flex: "none", background: tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : "var(--bad)" }} />
      <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: "13px" }}>{label}</span><span style={{ display: "block", fontSize: "12px", color: "var(--dim)", marginTop: "2px" }}>{value}</span></span>
      <span style={{ color: "var(--faint)" }}>›</span>
    </button>
  );
}

const INBOX_FILTERS = ["All", "Needs review", "Duplicates", "Ready", "Exported", "Archived"] as const;
function Inbox({ s }: { s: State }) {
  const [f, setF] = useState<(typeof INBOX_FILTERS)[number]>("All");
  const c = inboxCounts(s);
  const rows = s.inbox.filter(i => f === "All" ? true : f === "Needs review" ? i.status === "review" : f === "Duplicates" ? i.status === "duplicate" : f === "Ready" ? i.status === "ready" || i.status === "reviewed" : f === "Exported" ? i.status === "exported" : i.status === "archived")
    .slice().sort((a, b) => rank(a.status) - rank(b.status) || b.date.localeCompare(a.date));
  return (
    <Page period="November 2026 inbox · FIN-112 · not part of October actuals" title="Invoice Inbox"
      sub="Supplier PDFs and staff receipt photos, extracted line by line. Low-confidence lines and suspected duplicates are held for David. A duplicate is never a payable until cleared."
      actions={<><Btn onClick={() => act.open("invoice", s.inbox.find(i => i.status === "review")?.id ?? s.inbox[0].id)} disabled={!c.review}>Review next</Btn>
        <Btn kind="primary" onClick={() => act.exportReady()} disabled={!c.ready}>Export {c.ready} reviewed to Xero draft (simulated)</Btn></>}>
      <Grid min={150}>
        <Stat label="Documents" value={c.total} />
        <Stat label="Ready" value={c.ready} tone="ok" onClick={() => setF("Ready")} />
        <Stat label="Extraction review" value={c.review} tone={c.review ? "warn" : "ok"} onClick={() => setF("Needs review")} />
        <Stat label="Suspected duplicates" value={c.duplicate} tone={c.duplicate ? "bad" : "ok"} onClick={() => setF("Duplicates")} />
        <Stat label="Exported (draft)" value={c.exported} onClick={() => setF("Exported")} />
      </Grid>
      <Card title="Documents" extra={<Seg options={INBOX_FILTERS} value={f} onChange={setF} counts={{ All: c.total, "Needs review": c.review, Duplicates: c.duplicate, Ready: c.ready, Exported: c.exported, Archived: c.archived }} />}>
        <Table rowKey={r => r.id} rows={rows} onRow={r => act.open("invoice", r.id)} empty="No documents in this view."
          cols={[
            { key: "id", label: "Document", w: "130px", render: r => <span style={{ color: "var(--ink)" }}>{r.id}</span> },
            { key: "sup", label: "Supplier", w: "minmax(150px,1.2fr)", render: r => supplierName(r.supplier) },
            { key: "src", label: "Source", w: "minmax(140px,1fr)", render: r => r.source },
            { key: "site", label: "Site", w: "110px", render: r => locName(r.loc) },
            { key: "date", label: "Date", w: "100px", render: r => dayLabel(r.date) },
            { key: "conf", label: "Confidence", align: "right", w: "100px", render: r => <span style={{ color: r.conf < 0.8 ? "var(--warn)" : "var(--body)" }}>{Math.round(r.conf * 100)}%</span> },
            { key: "tax", label: "Tax field", w: "130px", render: r => r.taxField },
            { key: "net", label: "Net", align: "right", w: "100px", render: r => eur2(invoiceNet(r)) },
            { key: "st", label: "Status", w: "150px", render: r => <StatusBadge s={r.status} /> },
          ]} footer="Click a document to see the source preview beside the extracted lines" />
      </Card>
    </Page>
  );
}
const rank = (st: string) => ({ review: 0, duplicate: 1, ready: 2, reviewed: 3, exported: 4, archived: 5 } as Record<string, number>)[st] ?? 9;

const RECON_FILTERS = ["All", "Investigate", "Missing receipt", "Matched", "Pending"] as const;
function Recon({ s }: { s: State }) {
  const [f, setF] = useState<(typeof RECON_FILTERS)[number]>("All");
  const bank = BANK_LINES.map(l => l.match === "SET-DEL-1106" ? { ...l, status: s.settlements.find(x => x.id === "SET-DEL-1106")!.status === "resolved" ? "matched" as const : "investigate" as const } : l);
  const shown = bank.filter(l => f === "All" ? true : f === "Investigate" ? l.status === "investigate" : f === "Missing receipt" ? l.status === "missing" : f === "Matched" ? l.status === "matched" : l.status === "pending");
  return (
    <Page period="November cash · settlement date is not order date" title="Reconciliation"
      sub="Marketplace payouts matched to bank receipts, and bank lines matched to receipts. Differences are flagged for review; nothing is booked as a debt or written into the P&L automatically.">
      <Card title="Payout matching" sub="Expected payout from the settlement statement against the bank receipt.">
        <Table rowKey={r => r.id} rows={s.settlements} onRow={r => act.open("settlement", r.id)} cols={[
          { key: "id", label: "Settlement", w: "130px", render: r => <span style={{ color: "var(--ink)" }}>{r.id}</span> },
          { key: "ch", label: "Channel", w: "120px", render: r => channelName(r.channel) },
          { key: "per", label: "Order period", w: "minmax(170px,1.3fr)", render: r => r.period },
          { key: "paid", label: "Paid", w: "100px", render: r => dayLabel(r.paidOn) },
          { key: "exp", label: "Expected", align: "right", w: "110px", render: r => eur2(r.expected) },
          { key: "rec", label: "Bank receipt", align: "right", w: "120px", render: r => r.received === null ? "Not received" : eur2(r.received) },
          { key: "gap", label: "Difference", align: "right", w: "110px", render: r => r.received === null ? "n/a" : <span style={{ color: r.expected - r.received ? "var(--bad)" : "var(--body)" }}>{eur2(r.expected - r.received)}</span> },
          { key: "st", label: "Status", w: "120px", render: r => <StatusBadge s={r.status} /> },
        ]} />
      </Card>
      <Card title="Bank lines" extra={<Seg options={RECON_FILTERS} value={f} onChange={setF} counts={{ All: bank.length, Investigate: bank.filter(l => l.status === "investigate").length, "Missing receipt": bank.filter(l => l.status === "missing").length, Matched: bank.filter(l => l.status === "matched").length, Pending: bank.filter(l => l.status === "pending").length }} />}
        sub="Demo bank CSV (bank and provider unconfirmed).">
        <Table rowKey={r => r.id} rows={shown} onRow={r => r.match.startsWith("SET") ? act.open("settlement", r.match) : r.match.startsWith("RCT") ? act.open("invoice", r.match) : undefined}
          cols={[{ key: "d", label: "Date", w: "100px", render: r => dayLabel(r.date) }, { key: "desc", label: "Description", w: "minmax(180px,1.5fr)", render: r => r.desc },
            { key: "amt", label: "Amount", align: "right", w: "110px", render: r => eur2(r.amount) }, { key: "m", label: "Matched to", w: "minmax(140px,1fr)", render: r => r.match || "No receipt found" },
            { key: "s", label: "Status", w: "140px", render: r => r.status === "missing" ? <Badge tone="warn">Missing receipt</Badge> : <StatusBadge s={r.status} /> }]} />
      </Card>
    </Page>
  );
}

type Cat = "sales" | "cogs" | "labour" | "fees" | "other";
function PnL() {
  const [loc, setLoc] = useState<"All" | "Baggot Street" | "Blackrock" | "Food Truck">("All");
  const [cat, setCat] = useState<Cat | null>(null);
  const P = pnl();
  const cols: { k: LocId | "ALL"; label: string }[] = [{ k: "BAG", label: "Baggot Street" }, { k: "BLK", label: "Blackrock" }, { k: "TRK", label: "Food Truck" }, { k: "ALL", label: "Total" }];
  const shown = loc === "All" ? cols : cols.filter(c => c.label === loc);
  const lines: { key: Cat | "profit" | "margin"; label: string }[] = [{ key: "sales", label: "Net sales" }, { key: "cogs", label: "Ingredient COGS" }, { key: "labour", label: "Labour" }, { key: "fees", label: "Channel fees" }, { key: "other", label: "Other operating costs" }, { key: "profit", label: "Estimated operating profit" }, { key: "margin", label: "Margin" }];
  const locFilter = loc === "All" ? null : cols.find(c => c.label === loc)!.k;
  const bridge = cogsBridge();
  return (
    <Page period={"Period " + PERIOD.start + " to " + PERIOD.end + " · EUR, net of tax"} title="Profit and loss by location"
      sub="Revenue is after refunds and is not reduced again. Packaging and occupancy sit once, in other operating costs. Margins are calculated from the rows, not typed."
      actions={<><Seg options={["All", "Baggot Street", "Blackrock", "Food Truck"] as const} value={loc} onChange={setLoc} /><Btn onClick={() => downloadCSV("shaka-poke-demo-pnl-oct-2026.csv", ["Line", ...cols.map(c => c.label)], lines.map(l => [l.label, ...cols.map(c => l.key === "margin" ? (P[c.k].sales ? ((P[c.k].profit / P[c.k].sales) * 100).toFixed(1) + "%" : "n/a") : centsCSV(P[c.k][l.key as Cat | "profit"]))]))}>Download CSV</Btn></>}>
      <Notice tone="info" title="Completeness.">All October sales orders, timesheets and cost rows for both shops and the truck are in this seed. No debt, tax or depreciation assumptions. This is an estimated operating position for management, not statutory accounts.</Notice>
      <Card pad="6px 8px">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", minWidth: "560px" }}>
            <thead><tr><th style={{ ...eyebrow, textAlign: "left", padding: "12px" }}>Line</th>{shown.map(c => <th key={c.k} style={{ ...eyebrow, textAlign: "right", padding: "12px" }}>{c.label}</th>)}</tr></thead>
            <tbody>
              {lines.map(l => {
                const strong = l.key === "profit" || l.key === "sales";
                return (
                  <tr key={l.key} onClick={l.key !== "profit" && l.key !== "margin" ? () => setCat(cat === l.key ? null : (l.key as Cat)) : undefined} className={l.key !== "profit" && l.key !== "margin" ? "ix11" : undefined}
                    style={{ borderTop: "1px solid var(--border)", cursor: l.key !== "profit" && l.key !== "margin" ? "pointer" : "default", background: cat === l.key ? "var(--surface-2)" : "transparent" }}>
                    <td style={{ padding: "11px 12px", fontWeight: strong ? 600 : 400 }}>{l.label}{l.key !== "profit" && l.key !== "margin" && <span style={{ color: "var(--faint)", fontSize: "11px" }}> · drill down</span>}</td>
                    {shown.map(c => {
                      const r = P[c.k];
                      const v = l.key === "margin" ? (c.k === "TRK" ? "n/a" : pct(r.profit, r.sales)) : l.key === "sales" || l.key === "profit" ? eur(r[l.key]) : eur(-r[l.key as Cat]);
                      const neg = l.key === "profit" && r.profit < 0;
                      return <td key={c.k} style={{ ...num, padding: "11px 12px", textAlign: "right", fontWeight: strong ? 600 : 400, color: neg ? "var(--bad)" : l.key === "sales" || l.key === "profit" || l.key === "margin" ? "var(--ink)" : "var(--body)" }}>{v}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {cat && <Drill cat={cat} loc={locFilter} />}
      <Split ratio="1fr 1fr" left={
        <Card title="Ingredient COGS is consumption, not purchases" sub="October purchases differ from consumed cost by the stock movement.">
          <KV rows={[["Opening stock (1 Oct)", eur(bridge.opening)], ["Purchases", <button type="button" onClick={() => act.go("Purchasing", "Ingredient Spend")} style={{ border: 0, background: "none", padding: 0, color: "var(--accent)", cursor: "pointer", font: "inherit" }}>{eur(bridge.purchases)}</button>], ["Closing stock (31 Oct)", "−" + eur(bridge.closing)], ["Ingredient COGS", <b>{eur(bridge.cogs)}</b>]]} />
        </Card>} right={
        <Card title="Location comparison" sub="Including the truck's dormant cost.">
          <HBars fmt={v => eur(v)} rows={[{ label: "Baggot Street", value: P.BAG.profit, note: pct(P.BAG.profit, P.BAG.sales) }, { label: "Blackrock", value: P.BLK.profit, note: pct(P.BLK.profit, P.BLK.sales) }, { label: "Food Truck (dormant)", value: P.TRK.profit, note: "n/a" }]} />
        </Card>} />
    </Page>
  );
}

function Drill({ cat, loc }: { cat: Cat; loc: LocId | "ALL" | null }) {
  const inLoc = (l: string) => !loc || loc === "ALL" || l === loc;
  const title = { sales: "Net sales", cogs: "Ingredient COGS (allocated to orders)", labour: "Labour (timesheets × €16/h loaded)", fees: "Channel fees (assumed rates)", other: "Other operating costs" }[cat];
  if (cat === "other") {
    const rows = OVERHEADS.filter(o => inLoc(o.loc));
    return <Card title={title} sub="Source links show where each cost comes from."><Table rowKey={r => r.id} rows={rows} cols={[{ key: "l", label: "Location", w: "130px", render: r => locName(r.loc) }, { key: "c", label: "Category", w: "minmax(180px,1.4fr)", render: r => r.category }, { key: "p", label: "Payee", w: "minmax(140px,1fr)", render: r => r.payee }, { key: "s", label: "Source", w: "150px", render: r => r.source }, { key: "a", label: "Amount", align: "right", w: "110px", render: r => eur(r.amount) }]} footer={"Total " + eur(rows.reduce((a, r) => a + r.amount, 0))} /></Card>;
  }
  if (cat === "labour") {
    const rows = SHIFTS.filter(x => inLoc(x.loc));
    return <Card title={title}><Table rowKey={r => r.id} rows={rows} pageSize={12} cols={[{ key: "d", label: "Date", w: "100px", render: r => dayLabel(r.date) }, { key: "l", label: "Location", w: "120px", render: r => locName(r.loc) }, { key: "p", label: "Person", w: "minmax(140px,1fr)", render: r => <RecLink kind="person" id={r.person} /> }, { key: "h", label: "Hours", align: "right", w: "80px", render: r => r.hours }, { key: "c", label: "Cost", align: "right", w: "100px", render: r => eur(r.cost) }]} footer={"Total " + eur(rows.reduce((a, r) => a + r.cost, 0)) + " · " + rows.reduce((a, r) => a + r.hours, 0) + " h"} /></Card>;
  }
  const rows = ORDERS.filter(o => inLoc(o.loc));
  const val = (o: (typeof ORDERS)[number]) => cat === "sales" ? o.net : cat === "cogs" ? o.cogs : o.fee;
  const shown = cat === "fees" ? rows.filter(o => o.fee > 0) : rows;
  return <Card title={title} sub={cat === "cogs" ? "October consumed ingredient cost, allocated to each order. Theoretical recipe cost lives in Recipes." : "Every seeded October order is here; page through the full set."}>
    <Table rowKey={r => r.id} rows={shown} pageSize={12} onRow={r => act.open("order", r.id)} cols={[{ key: "id", label: "Order", w: "110px", render: r => r.id }, { key: "d", label: "Date", w: "100px", render: r => dayLabel(r.date) }, { key: "l", label: "Location", w: "120px", render: r => locName(r.loc) }, { key: "c", label: "Channel", w: "minmax(120px,1fr)", render: r => channelName(r.channel) }, { key: "v", label: "Amount", align: "right", w: "100px", render: r => eur2(val(r)) }]}
      footer={"Total " + eur(shown.reduce((a, r) => a + val(r), 0))} />
  </Card>;
}

function Pack({ s }: { s: State }) {
  const b = backfillCounts();
  const [f, setF] = useState<"Unresolved" | "Missing receipt" | "Ambiguous" | "Matched" | "All">("Unresolved");
  const rows = BACKFILL.filter(x => f === "All" ? true : f === "Unresolved" ? x.status !== "matched" : f === "Missing receipt" ? x.status === "missing" : f === "Ambiguous" ? x.status === "ambiguous" : x.status === "matched");
  const months = useMemo(() => Array.from(new Set(BACKFILL.map(x => x.month))).map(m => { const r = BACKFILL.filter(x => x.month === m); return { m, total: r.length, matched: r.filter(x => x.status === "matched").length }; }), []);
  const c = inboxCounts(s);
  const P = pnl();
  const checklist: [string, boolean, string][] = [
    ["October P&L by location prepared", true, "Estimated operating profit " + eur(P.ALL.profit)],
    ["November inbox exceptions cleared", c.exceptions === 0, c.exceptions + " remaining"],
    ["Reviewed November documents exported as Xero draft", c.exported > 0, c.exported + " exported (simulated)"],
    ["Backfill matched from 1 April", b.matched === b.total, b.matched + " of " + b.total],
    ["Missing receipts chased", false, b.missing + " historical, " + BANK_LINES.filter(l => l.status === "missing").length + " November"],
    ["Ambiguous allocations resolved", false, b.ambiguous + " documents"],
    ["Tax treatment confirmed by accountant", false, "Draft and configurable; no statutory treatment inferred"],
  ];
  const exportRows = () => downloadCSV("shaka-poke-demo-backfill-" + f.toLowerCase().replace(/ /g, "-") + ".csv", ["Document", "Month", "Supplier", "Amount EUR", "Status", "Note"], rows.map(x => [x.id, x.month, supplierName(x.supplier), centsCSV(x.amount), x.status, x.note]));
  return (
    <Page period="Backfill 1 April to 30 September 2026 · year-end handover" title="Accountant Pack"
      sub="Evidence-backed backfill and a handover checklist. Tax figures stay draft and configurable. There is no filing or submission button."
      actions={<Btn kind="primary" onClick={exportRows}>Download {rows.length} rows as CSV</Btn>}>
      <Grid min={170}>
        <Stat label="Historical documents" value={b.total} />
        <Stat label="Matched" value={b.matched} sub={pct(b.matched, b.total, 0)} tone="ok" onClick={() => setF("Matched")} />
        <Stat label="Missing receipts" value={b.missing} tone="warn" onClick={() => setF("Missing receipt")} />
        <Stat label="Ambiguous allocations" value={b.ambiguous} tone="warn" onClick={() => setF("Ambiguous")} />
      </Grid>
      <Split left={
        <Card title="Unresolved evidence" extra={<Seg options={["Unresolved", "Missing receipt", "Ambiguous", "Matched", "All"] as const} value={f} onChange={setF} />}>
          <Table rowKey={r => r.id} rows={rows} pageSize={10} onRow={r => act.open("backfill", r.id)} cols={[
            { key: "id", label: "Document", w: "90px", render: r => r.id }, { key: "m", label: "Month", w: "100px", render: r => monthLabel(r.month) },
            { key: "s", label: "Supplier", w: "minmax(130px,1fr)", render: r => supplierName(r.supplier) }, { key: "a", label: "Amount", align: "right", w: "100px", render: r => eur2(r.amount) },
            { key: "st", label: "Status", w: "150px", render: r => r.status === "matched" ? <Badge tone="ok">Matched</Badge> : <Badge tone="warn">{r.status === "missing" ? "Missing receipt" : "Ambiguous"}{s.backfillRequested[r.id] ? " · flagged" : ""}</Badge> }]} />
          <div style={{ marginTop: "12px" }}>
            <div style={eyebrow}>CSV preview (first 3 rows of this view)</div>
            <pre style={{ margin: "8px 0 0", padding: "10px 12px", borderRadius: "10px", background: "var(--surface-faint)", border: "1px solid var(--border)", fontSize: "11.5px", color: "var(--body)", overflowX: "auto" }}>
{"Document,Month,Supplier,Amount EUR,Status\n" + rows.slice(0, 3).map(x => [x.id, x.month, supplierName(x.supplier), centsCSV(x.amount), x.status].join(",")).join("\n")}
            </pre>
          </div>
        </Card>} right={
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Card title="Backfill progress by month">
            {months.map(m => <div key={m.m} style={{ marginBottom: "10px" }}><Row style={{ fontSize: "12.5px", marginBottom: "5px" }}><span style={{ flex: 1 }}>{monthLabel(m.m)}</span><span style={num}>{m.matched}/{m.total}</span></Row><Progress value={m.matched / m.total} tone={m.matched === m.total ? "ok" : "accent"} /></div>)}
          </Card>
          <Card title="Handover checklist">
            {checklist.map(([t, ok, note]) => (
              <Row key={t} gap={10} wrap={false} style={{ padding: "7px 0", borderTop: "1px solid var(--border)", alignItems: "flex-start" }}>
                <span aria-hidden style={{ width: "16px", height: "16px", flex: "none", borderRadius: "5px", border: "1.5px solid " + (ok ? "var(--ok)" : "var(--border-strong)"), background: ok ? "var(--ok)" : "none", color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", marginTop: "2px" }}>{ok ? "✓" : ""}</span>
                <span style={{ fontSize: "13px" }}>{t}<span style={{ display: "block", fontSize: "11.5px", color: "var(--faint)" }}>{note}</span></span>
              </Row>
            ))}
          </Card>
        </div>} />
    </Page>
  );
}
