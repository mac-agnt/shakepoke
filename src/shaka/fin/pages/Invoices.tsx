/* Invoices: one inbox for supplier bills and staff receipts, with a split
   review panel. Approving here updates Ingredient Costs, Money & Reports, the
   Accountant Pack and the Home answers through the shared store. */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useFin, fin, counts, spendTotals, correctedTotal } from "../store";
import { CATEGORIES, LOCS, supplierName, locName, catName, invoiceTotal, lineTotal, type Invoice, type CatId, type LocId } from "../data";
import { finTab } from "../nav";
import { eur, eur2 } from "../../format";
import { Page, Card, Table, Btn, Badge, Notice, Row, Stat, Grid, inputStyle, eyebrow, num, type Tone } from "../../ui";

const ISSUE: Record<string, string> = { line: "Unclear line", location: "Shop not stated", category: "Pick a category", duplicate: "Possible duplicate" };
export const statusBadge = (i: Invoice) => i.status === "approved" ? <Badge tone="ok">Reviewed</Badge> : i.status === "excluded" ? <Badge tone="neutral">Excluded duplicate</Badge> : <Badge tone="warn">{ISSUE[i.issue ?? "line"]}</Badge>;
const dLabel = (iso: string) => { const d = new Date(iso + "T12:00:00Z"); return d.getUTCDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()] + " " + d.getUTCFullYear(); };

export default function Invoices() {
  const s = useFin();
  const tab = finTab(s, "Invoices");
  const c = counts(s);
  const [q, setQ] = useState("");
  const sel = s.invoices.find(i => i.id === s.ui.selected) ?? null;

  const base = tab === "Needs review" ? s.invoices.filter(i => i.status === "attention")
    : tab === "Staff receipts" ? s.invoices.filter(i => i.kind === "receipt")
    : s.invoices;
  const ql = q.trim().toLowerCase();
  const rows = base.filter(i => !ql || (i.id + " " + supplierName(i.supplier) + " " + locName(i.loc ?? "") + " " + i.lines.map(l => l.desc).join(" ")).toLowerCase().includes(ql))
    .slice().sort((a, b) => (a.status === "attention" ? 0 : 1) - (b.status === "attention" ? 0 : 1) || b.date.localeCompare(a.date));

  return (
    <Page period="October 2026 · Illustrative demo data" title="Invoices"
      sub="Supplier bills and staff receipts land in one inbox. Field suggestions are checked by a person before anything reaches your reports."
      actions={<><Badge tone="neutral">Demo data</Badge><Btn kind="primary" onClick={() => fin.openCapture(true)}>Capture invoice</Btn></>}>
      <Grid min={190}>
        <Stat label="Reviewed" value={c.reviewed + " of " + c.total} sub="Counted in your reports" onClick={() => fin.setTab("Invoices", "All invoices")} />
        <Stat label="Need your attention" value={String(c.attention)} tone={c.attention ? "warn" : "ok"} sub={c.attention ? "Not counted until reviewed" : "Inbox clear"} onClick={() => fin.setTab("Invoices", "Needs review")} />
        <Stat label="Approved spend, October" value={eur(spendTotals(s).ALL)} sub="Both shops, reviewed lines only" onClick={() => fin.go("Money", "Overview")} />
      </Grid>

      <div className="shk-split" style={{ display: "grid", gridTemplateColumns: sel ? "minmax(0,1fr) minmax(0,1.2fr)" : "minmax(0,1fr)", gap: "14px", alignItems: "start" }}>
        <Card pad="14px" title={tab} sub={tab === "Needs review" ? c.attention ? c.attention + (c.attention === 1 ? " document" : " documents") + " could not be read with confidence. Each needs one decision." : "Every October document is reviewed." : tab === "Staff receipts" ? "Receipt photos from the shop managers' cards." : "Every October document in the inbox."}
          extra={<input aria-label="Search invoices" value={q} onChange={e => setQ(e.target.value)} placeholder="Search supplier, number, item" style={{ ...inputStyle, width: "220px", height: "32px" }} />}>
          <Table<Invoice> rowKey={i => i.id} rows={rows} onRow={i => fin.select(i.id)} dense
            empty={tab === "Needs review" ? "Nothing needs you. Every October document is reviewed." : "No documents match."}
            cols={[
              { key: "id", label: "Document", w: sel ? "minmax(150px,1.4fr)" : "minmax(130px,1.1fr)", render: i => <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}><span style={{ color: sel?.id === i.id ? "var(--accent)" : "var(--ink)", fontWeight: sel?.id === i.id ? 600 : 500 }}>{i.id}</span>{sel && <span style={{ fontSize: "11.5px", color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis" }}>{supplierName(i.supplier)}</span>}</span> },
              ...(sel ? [] : [{ key: "sup", label: "Supplier", w: "minmax(140px,1.3fr)", render: (i: Invoice) => supplierName(i.supplier) }]),
              ...(sel ? [] : [{ key: "date", label: "Date", w: "100px", render: (i: Invoice) => dLabel(i.date).replace(" 2026", "") }, { key: "loc", label: "Shop", w: "120px", render: (i: Invoice) => i.loc ? locName(i.loc) : <span style={{ color: "var(--warn)" }}>Not stated</span> }]),
              { key: "amt", label: "Amount", w: "100px", align: "right" as const, render: i => eur2(i.status === "attention" ? correctedTotal(i) : invoiceTotal(i)) },
              { key: "st", label: "Status", w: sel ? "130px" : "150px", render: statusBadge },
            ]} />
        </Card>
        {sel && <Detail inv={sel} />}
      </div>
      {s.ui.capture && <Capture />}
    </Page>
  );
}

function Detail({ inv }: { inv: Invoice }) {
  const s = useFin();
  const dup = inv.duplicateOf ? s.invoices.find(i => i.id === inv.duplicateOf) : null;
  const total = inv.status === "attention" ? correctedTotal(inv) : invoiceTotal(inv);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const r = ref.current?.getBoundingClientRect(); if (r && (r.top > window.innerHeight - 120 || r.top < 0)) ref.current?.scrollIntoView({ block: "start", behavior: "smooth" }); }, [inv.id]);
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0, scrollMarginTop: "16px", animation: "riseIn .3s var(--ease) both" }}>
      <Card pad="16px 18px" title={<Row gap={8}>{inv.id}{statusBadge(inv)}</Row>} sub={supplierName(inv.supplier) + " · " + inv.source}
        extra={<Btn small kind="quiet" onClick={() => fin.select(null)}>Close</Btn>}>
        {inv.status === "attention" && <div style={{ marginBottom: "14px" }}><Notice tone="warn" title={ISSUE[inv.issue ?? "line"] + "."}>{inv.issueText}</Notice></div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "10px 16px", marginBottom: "14px" }}>
          <Fact k="Supplier" v={supplierName(inv.supplier)} />
          <Fact k="Date" v={dLabel(inv.date)} />
          <Fact k="Shop" v={inv.status === "attention" && inv.issue === "location"
            ? <select aria-label="Shop" value={inv.loc ?? inv.suggestLoc ?? ""} onChange={e => fin.setLocation(inv.id, e.target.value as LocId)} style={{ ...inputStyle, height: "30px" }}>{LOCS.map(l => <option key={l.id} value={l.id}>{l.name}{l.id === inv.suggestLoc ? " (suggested)" : ""}</option>)}</select>
            : inv.loc ? locName(inv.loc) : "Not stated"} />
          <Fact k="Amount" v={<span style={num}>{eur2(total)}</span>} />
          <Fact k={inv.kind === "receipt" ? "Captured by" : "Source"} v={inv.capturedBy ?? (inv.source.startsWith("Forwarded") ? "Invoice inbox" : "Scan")} />
        </div>
        <div style={{ ...eyebrow, marginBottom: "8px" }}>Lines</div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md,14px)", overflow: "hidden" }}>
          {inv.lines.map((l, i) => (
            <div key={l.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(70px,.7fr) minmax(150px,1fr) 84px", gap: "10px", alignItems: "center", padding: "9px 12px", borderTop: i ? "1px solid var(--border)" : 0, background: l.issue ? "var(--warn-soft)" : "none", fontSize: "12.5px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.desc}</div>
                {l.issue && <div style={{ color: "var(--warn)", fontSize: "11.5px", marginTop: "3px", lineHeight: 1.4 }}>{l.issue}{l.suggest && <> Suggested: <b>{l.suggest.qty} {l.suggest.unit}</b>.</>}</div>}
              </div>
              <div style={{ ...num, color: "var(--body)" }}>{l.qty} {l.unit} × {eur2(l.unitPrice)}</div>
              <select aria-label={"Category for " + l.desc} value={l.cat} disabled={inv.status === "excluded"} onChange={e => fin.setLineCategory(inv.id, l.id, e.target.value as CatId)} style={{ ...inputStyle, height: "30px", fontSize: "12px" }}>
                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <div style={{ ...num, textAlign: "right", color: "var(--ink)" }}>{eur2(lineTotal(l))}</div>
            </div>
          ))}
        </div>
        {inv.status === "attention" && (
          <Row style={{ marginTop: "14px" }}>
            {inv.issue === "line" && <><Btn kind="primary" onClick={() => fin.approveCorrected(inv.id)}>Approve corrected line</Btn><span style={{ fontSize: "12px", color: "var(--dim)" }}>Applies the suggestion, then counts this bill.</span></>}
            {inv.issue === "location" && <Btn kind="primary" onClick={() => fin.approve(inv.id)}>Approve for {locName(inv.loc ?? inv.suggestLoc ?? "")}</Btn>}
            {inv.issue === "category" && <Btn kind="primary" onClick={() => fin.approve(inv.id)}>Approve as {catName(inv.lines[0].cat)}</Btn>}
            {inv.issue === "duplicate" && <><Btn kind="primary" onClick={() => fin.excludeDuplicate(inv.id)}>Exclude duplicate</Btn>{dup && <Btn onClick={() => fin.select(dup.id)}>Compare with {dup.id}</Btn>}</>}
          </Row>
        )}
        {inv.status === "approved" && <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--dim)" }}>Reviewed and counted. Changing a category moves the expense totals and the export straight away.</div>}
        {inv.status === "excluded" && <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--dim)" }}>Kept on record, left out of every total and export.</div>}
      </Card>
      <Preview inv={inv} />
    </div>
  );
}

const Fact = ({ k, v }: { k: string; v: ReactNode }) => (
  <div style={{ minWidth: 0 }}><div style={{ fontSize: "11.5px", color: "var(--dim)" }}>{k}</div><div style={{ fontSize: "13px", color: "var(--ink)", marginTop: "4px" }}>{v}</div></div>
);

/* A document-style preview of the source file, drawn from the same fields. */
function Preview({ inv }: { inv: Invoice }) {
  const paper: CSSProperties = { background: "#f6f7f9", color: "#1d2733", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 18px 40px rgba(0,0,0,.28)", fontSize: "11.5px", lineHeight: 1.5, fontFamily: "var(--ui)" };
  const receipt = inv.kind === "receipt";
  return (
    <Card pad="14px 16px" title="Source document" sub={inv.file + " · demo rendering of the original"} extra={<Badge tone="info">Source</Badge>}>
      <div style={{ ...paper, maxWidth: receipt ? "300px" : "none", margin: receipt ? "0 auto" : 0, fontFamily: receipt ? "var(--mono)" : "var(--ui)" }} aria-label={"Preview of " + inv.file}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div><div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-.2px" }}>{supplierName(inv.supplier).replace(" (staff receipt)", "")}</div><div style={{ color: "#5a6675" }}>{receipt ? "Till receipt" : "Tax invoice"}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontWeight: 600 }}>{inv.id.replace(/B$/, "")}</div><div style={{ color: "#5a6675" }}>{dLabel(inv.date)}</div></div>
        </div>
        {!receipt && <div style={{ marginTop: "12px", color: "#5a6675" }}>Bill to: Shaka Poké{inv.loc && inv.issue !== "location" ? ", " + locName(inv.loc) : inv.issue === "location" ? " (no delivery address)" : ""}</div>}
        <div style={{ marginTop: "12px", borderTop: "1px solid #d5dae1" }}>
          {inv.lines.map(l => (
            <div key={l.id} style={{ display: "flex", gap: "10px", padding: "5px 0", borderBottom: "1px solid #e6e9ee", background: l.issue ? "rgba(240,180,40,.18)" : "none" }}>
              <span style={{ flex: 1, minWidth: 0 }}>{l.desc}</span>
              <span style={{ ...num, width: "70px", textAlign: "right" }}>{l.suggest ? l.suggest.qty : l.qty}</span>
              <span style={{ ...num, width: "62px", textAlign: "right" }}>{eur2(l.unitPrice)}</span>
              <span style={{ ...num, width: "78px", textAlign: "right" }}>{eur2(Math.round((l.suggest ? l.suggest.qty : l.qty) * l.unitPrice))}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "14px", marginTop: "10px", fontWeight: 700 }}><span>Total</span><span style={num}>{eur2(correctedTotal(inv))}</span></div>
        <div style={{ marginTop: "12px", color: "#7a8592", fontSize: "10.5px" }}>Illustrative demo document. Not a real supplier invoice.</div>
      </div>
    </Card>
  );
}

/* Simulated capture: shows what would happen; nothing is uploaded or stored. */
function Capture() {
  const [step, setStep] = useState<"pick" | "reading" | "done">("pick");
  const [name, setName] = useState("");
  const close = () => fin.openCapture(false);
  useEffect(() => {
    if (step !== "reading") return;
    const t = setTimeout(() => setStep("done"), 1300);
    return () => clearTimeout(t);
  }, [step]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  const start = (n: string) => { setName(n); setStep("reading"); };
  const tone: Tone = "info";
  return (
    <div role="dialog" aria-modal="true" aria-label="Capture invoice" onClick={close} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(4,10,20,.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", animation: "fadeIn .2s var(--ease) both" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(520px,100%)", background: "var(--surface-solid,var(--surface))", border: "1px solid var(--border-strong)", borderRadius: "var(--card-r,18px)", backdropFilter: "blur(24px) saturate(1.3)", boxShadow: "0 30px 80px rgba(0,0,0,.45)", padding: "20px 22px", animation: "riseIn .3s var(--ease) both" }}>
        <Row><div style={{ flex: 1, fontSize: "16px", fontWeight: 600 }}>Capture invoice</div><Badge tone="neutral">Demo only</Badge></Row>
        {step === "pick" && <>
          <div style={{ fontSize: "13px", color: "var(--dim)", marginTop: "8px", lineHeight: 1.55 }}>In the live product, bills arrive by email forward or a photo from a manager's phone. Pick a sample to see the flow. Nothing is uploaded.</div>
          <div style={{ display: "grid", gap: "8px", marginTop: "14px" }}>
            <Btn onClick={() => start("Sample supplier PDF")}>Use a sample supplier PDF</Btn>
            <Btn onClick={() => start("Sample receipt photo")}>Use a sample receipt photo</Btn>
            <label className="ixg" style={{ height: "34px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--r-ctl,10px)", border: "1px dashed var(--border-strong)", fontSize: "13px", color: "var(--dim)", cursor: "pointer" }}>
              Choose a file from this computer (stays on your device)
              <input type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) start(f.name); }} />
            </label>
          </div>
        </>}
        {step === "reading" && <div style={{ padding: "26px 0 10px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "var(--ink)" }}>Reading {name}…</div>
          <div style={{ height: "6px", borderRadius: "4px", background: "var(--track)", overflow: "hidden", marginTop: "14px" }}><div style={{ height: "6px", background: "var(--accent)", transformOrigin: "left", animation: "growX 1.2s var(--ease) both" }} /></div>
          <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "10px" }}>Simulated. No file leaves this browser.</div>
        </div>}
        {step === "done" && <>
          <div style={{ marginTop: "14px" }}><Notice tone={tone} title="Demo outcome.">In the live product, “{name}” would join the inbox with suggested supplier, date, shop and lines for recurring supplier formats. Any line it is unsure of waits for your review before it counts. In this demo nothing was read, stored or added, and the 24 October documents are unchanged.</Notice></div>
          <Row style={{ marginTop: "14px", justifyContent: "flex-end" }}><Btn onClick={() => setStep("pick")}>Try another</Btn><Btn kind="primary" onClick={close}>Done</Btn></Row>
        </>}
        {step === "pick" && <Row style={{ marginTop: "14px", justifyContent: "flex-end" }}><Btn kind="quiet" onClick={close}>Cancel</Btn></Row>}
      </div>
    </div>
  );
}
