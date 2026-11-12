/* Right-hand detail for the selected agent: purpose, sources, gates, linked
   records, live findings from shared state and the simulated run history. */
import { useShaka, act, AGENTS, agentFindings } from "./store";
import { stamp } from "./format";
import { Badge, Btn, RecLink, Row, eyebrow } from "./ui";

export default function AgentPanel({ id }: { id: string }) {
  const s = useShaka();
  const a = AGENTS.find(x => x.id === id);
  if (!a) return null;
  const f = agentFindings(id, s);
  const runs = s.runs[id] ?? [];
  const sec = (t: string) => <div style={{ ...eyebrow, marginTop: "16px", marginBottom: "7px" }}>{t}</div>;
  return (
    <aside className="shk-page" style={{ width: "340px", flex: "none", minHeight: 0, overflowY: "auto", borderLeft: "1px solid var(--border)", padding: "16px 18px 24px" }}>
      <Row gap={8}><span style={{ fontSize: "15px", fontWeight: 600 }}>{a.name}</span><Badge tone="neutral">Simulated</Badge>{f.needsReview && <Badge tone="warn">Needs review</Badge>}</Row>
      <div style={{ fontSize: "12.5px", color: "var(--body)", lineHeight: 1.55, marginTop: "6px" }}>{a.purpose}</div>
      <Row style={{ marginTop: "12px" }}><Btn kind="primary" small onClick={() => act.runAgent(a.id)}>Run now (simulated)</Btn></Row>
      {sec("Current findings")}
      <div style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.55 }}>{f.summary}</div>
      <ul style={{ margin: "6px 0 0", paddingLeft: "18px", fontSize: "12.5px", color: "var(--body)", lineHeight: 1.6 }}>{f.lines.map(l => <li key={l}>{l}</li>)}</ul>
      {sec("Input sources")}
      <Row gap={6}>{a.sources.map(x => <Badge key={x} tone="info">{x}</Badge>)}</Row>
      {sec("Evidence and linked records")}
      <Row gap={10}>{a.links.map(l => <RecLink key={l.id} kind={l.kind} id={l.id}>{l.label}</RecLink>)}</Row>
      {sec("Human approval gates")}
      {a.gates.map(g => <div key={g} style={{ fontSize: "12.5px", color: "var(--body)", padding: "3px 0" }}>{g}</div>)}
      {sec("Uncertainty")}
      <div style={{ fontSize: "12.5px", color: "var(--dim)", lineHeight: 1.5 }}>{a.uncertainty}</div>
      {sec("Run history")}
      {runs.map(r => (
        <div key={r.id} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
          <Row gap={8}><span style={{ fontSize: "11.5px", color: "var(--faint)" }}>{stamp(r.ts)}</span><Badge tone={r.status === "ok" ? "ok" : "warn"}>{r.status}</Badge></Row>
          <div style={{ fontSize: "12.5px", color: "var(--body)", marginTop: "4px" }}>{r.summary}</div>
        </div>
      ))}
      <div style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: "11.5px", color: "var(--faint)" }}>{a.lastRun}</span>
        <div style={{ fontSize: "12.5px", color: "var(--dim)", marginTop: "4px" }}>Seeded run from the demo dataset.</div>
      </div>
    </aside>
  );
}
