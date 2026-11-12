import { useState } from "react";
import { useShaka, act, approvals, taskStatus, type State, type Task, type TaskStatus } from "../store";
import { PEOPLE, DEPARTMENTS, person } from "../model";
import { Page, Card, Table, Btn, Seg, Notice, RecLink, Row, Badge, Avatar, Field, inputStyle, Grid } from "../ui";
import { tabOf } from "../nav";
import { stamp } from "../format";

export default function Work() {
  const s = useShaka();
  const tab = tabOf(s, "Work");
  if (tab === "Approvals") return <Approvals s={s} />;
  if (tab === "Workflows") return <Workflows />;
  return <Tasks s={s} />;
}

const PRI: Record<string, "bad" | "warn" | "neutral"> = { High: "bad", Medium: "warn", Low: "neutral" };
function Tasks({ s }: { s: State }) {
  const [view, setView] = useState<"List" | "Board">("List");
  const [owner, setOwner] = useState("all");
  const [dept, setDept] = useState("all");
  const [st, setSt] = useState<"Open" | "Done" | "All">("Open");
  const [title, setTitle] = useState("");
  const [newOwner, setNewOwner] = useState("P-DAVID");
  const [newDept, setNewDept] = useState("Management");
  const [newPri, setNewPri] = useState<Task["priority"]>("Medium");
  const rows = s.tasks.map(t => ({ ...t, live: taskStatus(t, s) }))
    .filter(t => (owner === "all" || t.owner === owner) && (dept === "all" || t.dept === dept) && (st === "All" || (st === "Done" ? t.live === "Done" : t.live !== "Done")))
    .sort((a, b) => a.dueSort.localeCompare(b.dueSort));
  return (
    <Page period="Tasks across the six story threads and the backfill" title="Tasks" sub="Every task has an owner, due time, priority, department, status and the record it relates to. Story tasks close themselves when their record is resolved."
      actions={<Seg options={["List", "Board"] as const} value={view} onChange={setView} />}>
      <Card>
        <Row style={{ marginBottom: "12px" }}>
          <Seg options={["Open", "Done", "All"] as const} value={st} onChange={setSt} />
          <select aria-label="Owner" value={owner} onChange={e => setOwner(e.target.value)} style={{ ...inputStyle, width: "auto" }}><option value="all">Any owner</option>{PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <select aria-label="Department" value={dept} onChange={e => setDept(e.target.value)} style={{ ...inputStyle, width: "auto" }}><option value="all">Any department</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select>
        </Row>
        {view === "List" ? (
          <Table rowKey={t => t.id} rows={rows} onRow={t => act.open("task", t.id)} empty="No tasks match these filters." cols={[
            { key: "t", label: "Task", w: "minmax(240px,2fr)", render: t => <span style={{ color: t.live === "Done" ? "var(--dim)" : "var(--ink)", textDecoration: t.live === "Done" ? "line-through" : "none" }}>{t.title}</span> },
            { key: "o", label: "Owner", w: "150px", render: t => <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}><Avatar initials={person(t.owner)!.initials} tint={person(t.owner)!.tint} size={20} />{person(t.owner)?.name.split(" ")[0]}</span> },
            { key: "d", label: "Due", w: "130px", render: t => t.due }, { key: "p", label: "Priority", w: "90px", render: t => <Badge tone={PRI[t.priority]}>{t.priority}</Badge> },
            { key: "dp", label: "Department", w: "140px", render: t => t.dept }, { key: "s", label: "Status", w: "110px", render: t => <Badge tone={t.live === "Done" ? "ok" : t.live === "In progress" ? "info" : "neutral"}>{t.live}</Badge> },
            { key: "r", label: "Related", w: "150px", render: t => t.related.kind === "none" ? "None" : <RecLink kind={t.related.kind} id={t.related.id}>{t.related.label}</RecLink> }]} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: "12px" }}>
            {(["Open", "In progress", "Done"] as TaskStatus[]).map(col => (
              <div key={col} style={{ background: "var(--surface-faint)", border: "1px solid var(--border)", borderRadius: "var(--r-md,14px)", padding: "10px" }}>
                <Row style={{ padding: "2px 4px 8px" }}><span style={{ fontSize: "13px", fontWeight: 600, flex: 1 }}>{col}</span><Badge>{rows.filter(t => t.live === col).length}</Badge></Row>
                {rows.filter(t => t.live === col).map(t => (
                  <div key={t.id} style={{ padding: "10px 12px", marginBottom: "8px", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--surface-2)" }}>
                    <button type="button" onClick={() => act.open("task", t.id)} style={{ border: 0, background: "none", padding: 0, textAlign: "left", font: "inherit", color: "var(--ink)", cursor: "pointer", fontSize: "13px" }}>{t.title}</button>
                    <Row gap={6} style={{ marginTop: "6px" }}><Badge tone={PRI[t.priority]}>{t.priority}</Badge><span style={{ fontSize: "11.5px", color: "var(--dim)" }}>{person(t.owner)?.name.split(" ")[0]} · {t.due}</span></Row>
                    <Row gap={4} style={{ marginTop: "8px" }}>{(["Open", "In progress", "Done"] as TaskStatus[]).filter(x => x !== col).map(x => <Btn key={x} small kind="quiet" onClick={() => act.setTaskStatus(t.id, x)}>Move to {x}</Btn>)}</Row>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title="Add a task">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(170px,100%),1fr))", gap: "10px", alignItems: "end" }}>
          <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { act.addTask(title, newOwner, newDept, newPri); setTitle(""); } }} style={inputStyle} placeholder="What needs doing" /></Field>
          <Field label="Owner"><select value={newOwner} onChange={e => setNewOwner(e.target.value)} style={inputStyle}>{PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Department"><select value={newDept} onChange={e => setNewDept(e.target.value)} style={inputStyle}>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Priority"><select value={newPri} onChange={e => setNewPri(e.target.value as Task["priority"])} style={inputStyle}><option>High</option><option>Medium</option><option>Low</option></select></Field>
          <Btn kind="primary" onClick={() => { act.addTask(title, newOwner, newDept, newPri); setTitle(""); }} disabled={!title.trim()}>Add task</Btn>
        </div>
      </Card>
    </Page>
  );
}

function Approvals({ s }: { s: State }) {
  const all = approvals(s);
  const cats = ["All", "Invoice exception", "Cost update", "Purchase draft", "Roster proposal"] as const;
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  const [state, setState] = useState<"Pending" | "Decided">("Pending");
  const rows = all.filter(a => (cat === "All" || a.category === cat) && (state === "Pending" ? a.pending : !a.pending));
  const counts = Object.fromEntries(cats.map(c => [c, all.filter(a => (c === "All" || a.category === c) && (state === "Pending" ? a.pending : !a.pending)).length]));
  const decide = (a: (typeof all)[number]) => {
    if (a.kind === "invoice") act.open("invoice", a.recId);
    else if (a.kind === "costChange") act.approveCost();
    else if (a.kind === "po") act.approvePO(a.recId);
    else if (a.kind === "roster") act.decideRoster(true);
  };
  return (
    <Page period="Counted from live state" title="Approvals" sub="Five invoice exceptions, the avocado cost update, a purchase draft and an optional roster proposal. Counts come from the records, so a decision anywhere updates them everywhere.">
      <Row><Seg options={["Pending", "Decided"] as const} value={state} onChange={setState} counts={{ Pending: all.filter(a => a.pending).length, Decided: all.filter(a => !a.pending).length }} /><Seg options={cats} value={cat} onChange={setCat} counts={counts} /></Row>
      <Card>
        <Table rowKey={a => a.id} rows={rows} onRow={a => act.open(a.kind, a.recId)} empty={state === "Pending" ? "Nothing waiting. Every approval has been decided." : "No decisions yet."} cols={[
          { key: "c", label: "Category", w: "150px", render: a => <Badge tone={a.category === "Invoice exception" ? "warn" : a.category === "Roster proposal" ? "neutral" : "info"}>{a.category}</Badge> },
          { key: "t", label: "Request", w: "minmax(220px,1.6fr)", render: a => <span style={{ color: "var(--ink)" }}>{a.title}</span> },
          { key: "d", label: "Detail", w: "minmax(220px,1.8fr)", render: a => a.detail }, { key: "v", label: "Value", align: "right", w: "110px", render: a => a.value },
          { key: "ap", label: "Approver", w: "120px", render: a => person(a.approver)?.name.split(" ")[0] },
          { key: "x", label: "", w: "150px", render: a => a.pending ? <Btn small kind="primary" onClick={() => decide(a)}>{a.kind === "invoice" ? "Review" : a.kind === "roster" ? "Approve as Conor" : "Approve"}</Btn> : <Badge tone="ok">Decided</Badge> }]} />
      </Card>
      <Notice tone="neutral">Every decision is written to Activity with the person who made it. Permissions here are a UI simulation, not enforced security.</Notice>
    </Page>
  );
}

const WORKFLOWS = [
  { id: "WF-INV", agentId: "finance", name: "Invoice review", owner: "P-DAVID", agent: "Finance Agent", trigger: "Supplier PDF or receipt photo arrives", steps: ["Extract lines and confidence", "Map lines to ingredients", "Flag low confidence and duplicates", "David reviews and corrects", "Simulated Xero draft export"], gate: 3,
    runs: [["Thu 12 Nov 08:40", "24 documents, 5 held", "needs review"], ["Wed 11 Nov 08:15", "9 documents, 2 held", "needs review"], ["Tue 10 Nov 09:20", "7 documents, 2 held", "ok"]] },
  { id: "WF-SET", agentId: "channel", name: "Settlement check", owner: "P-DAVID", agent: "Channel Margin Agent", trigger: "Bank CSV or settlement file uploaded", steps: ["Read statement lines", "Calculate expected payout", "Match bank receipt", "Flag differences as Investigate", "David explains or follows up"], gate: 4,
    runs: [["Wed 11 Nov 11:30", "SET-DEL-1106 short €126", "needs review"], ["Thu 5 Nov 10:00", "SET-UBR-1105 matched", "ok"], ["Wed 4 Nov 10:00", "SET-JET-1104 matched", "ok"]] },
  { id: "WF-TRF", agentId: "transfer", name: "Friday transfer", owner: "P-AOIFE", agent: "Stock Transfer Agent", trigger: "Friday 07:30, surplus check", steps: ["Propose surplus items", "Check available quantity at origin", "Aoife dispatches", "David transports", "Conor confirms receipt"], gate: 2,
    runs: [["Thu 12 Nov 07:30", "TRF-1113 proposed, €66", "ok"], ["Fri 6 Nov 07:30", "TRF-1106 received in full", "ok"]] },
  { id: "WF-COR", agentId: "prep", name: "Corporate prep", owner: "P-SOFIA", agent: "Prep Planner", trigger: "Corporate order imported", steps: ["Read confirmed order", "Calculate ingredients from recipes", "Manager reviews dietary note", "Prep checklist", "Pack and dispatch"], gate: 2,
    runs: [["Thu 12 Nov 07:05", "COR-1113, 48 bowls planned", "needs review"], ["Wed 4 Nov 07:05", "LT order, 24 bowls", "ok"]] },
];
function Workflows() {
  const s = useShaka();
  return (
    <Page period="Simulated runs only" title="Workflows" sub="Four workflows behind the story threads, each with an owner, trigger, ordered steps and a human gate. Nothing here posts, pays or messages anyone.">
      <Grid min={420}>
        {WORKFLOWS.map(w => (
          <Card key={w.id} title={w.name} extra={<Badge tone="info">{w.agent}</Badge>} sub={"Owner " + person(w.owner)?.name + " · trigger: " + w.trigger}>
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {w.steps.map((st, i) => (
                <li key={st} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "6px 0", fontSize: "13px" }}>
                  <span style={{ width: "22px", height: "22px", flex: "none", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", background: i === w.gate ? "var(--warn-soft)" : "var(--surface-2)", color: i === w.gate ? "var(--warn)" : "var(--dim)", border: "1px solid var(--border)" }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{st}</span>{i === w.gate && <Badge tone="warn">Human gate</Badge>}
                </li>
              ))}
            </ol>
            <div style={{ marginTop: "10px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
              {(s.runs[w.agentId] ?? []).slice(0, 2).map(r => <Row key={r.id} style={{ fontSize: "12px", padding: "3px 0" }}><span style={{ width: "120px", color: "var(--faint)" }}>{stamp(r.ts)}</span><span style={{ flex: 1, color: "var(--body)" }}>{r.summary}</span><Badge tone={r.status === "ok" ? "ok" : "warn"}>{r.status}</Badge></Row>)}
              {w.runs.map(r => <Row key={r[0]} style={{ fontSize: "12px", padding: "3px 0" }}><span style={{ width: "120px", color: "var(--faint)" }}>{r[0]}</span><span style={{ flex: 1, color: "var(--body)" }}>{r[1]}</span><Badge tone={r[2] === "ok" ? "ok" : "warn"}>{r[2]}</Badge></Row>)}
            </div>
            <Row style={{ marginTop: "10px" }}><Btn small onClick={() => act.runAgent(w.agentId)}>Simulate run</Btn><Btn small kind="quiet" onClick={() => { act.setAgentFocus(w.agentId); act.go("Agents"); }}>Open agent</Btn></Row>
          </Card>
        ))}
      </Grid>
    </Page>
  );
}
