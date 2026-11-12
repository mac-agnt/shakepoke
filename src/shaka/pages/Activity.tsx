import { useState } from "react";
import { useShaka, act, type Activity } from "../store";
import { LOCATIONS } from "../model";
import { stamp } from "../format";
import { Page, Card, Table, Seg, Row, Badge, inputStyle, Btn } from "../ui";
import { tabOf } from "../nav";
import { downloadCSV } from "../format";

const KIND_LABEL: Record<string, string> = { invoice: "Invoice", costChange: "Cost change", settlement: "Settlement", transfer: "Transfer", corporate: "Corporate order", po: "Purchase order", roster: "Roster", task: "Task", agent: "Agent run", orders: "Orders", waste: "Waste", inbox: "Invoice inbox", prep: "Prep", backfill: "Backfill" };
const OPENABLE = new Set(["invoice", "costChange", "settlement", "transfer", "corporate", "po", "roster", "task", "waste", "backfill"]);

export default function ActivityPage() {
  const s = useShaka();
  const tab = tabOf(s, "Activity");
  const [loc, setLoc] = useState<string>("all");
  const [kind, setKind] = useState<string>("all");
  const [q, setQ] = useState("");
  const actorKind = tab === "Staff" ? "staff" : tab === "Agents" ? "agent" : tab === "System" ? "system" : null;
  const rows = s.activity.filter(a => (!actorKind || a.actorKind === actorKind) && (loc === "all" || a.loc === loc || a.loc === "ALL") && (kind === "all" || a.entityKind === kind)
    && (!q || (a.text + a.entity + a.actor).toLowerCase().includes(q.toLowerCase())));
  const kinds = Array.from(new Set(s.activity.map(a => a.entityKind)));
  return (
    <Page period="Company-wide event feed · Europe/Dublin" title="Activity" sub="Staff, agent and simulated system actions, newest first. Read-only imports say Demo import; nothing here implies a live connection."
      actions={<Btn onClick={() => downloadCSV("shaka-poke-demo-activity.csv", ["When", "Actor", "Type", "Location", "Record", "What happened"], rows.map(a => [stamp(a.ts), a.actor, a.type, a.loc, a.entity, a.text]))}>Download {rows.length} events</Btn>}>
      <Card>
        <Row style={{ marginBottom: "12px" }}>
          <Seg options={["All", "Staff", "Agents", "System"] as const} value={tab as "All"} onChange={v => act.setTab("Activity", v)} counts={{ All: s.activity.length, Staff: s.activity.filter(a => a.actorKind === "staff").length, Agents: s.activity.filter(a => a.actorKind === "agent").length, System: s.activity.filter(a => a.actorKind === "system").length }} />
          <select aria-label="Location" value={loc} onChange={e => setLoc(e.target.value)} style={{ ...inputStyle, width: "auto" }}><option value="all">All locations</option>{LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
          <select aria-label="Record type" value={kind} onChange={e => setKind(e.target.value)} style={{ ...inputStyle, width: "auto" }}><option value="all">All record types</option>{kinds.map(k => <option key={k} value={k}>{KIND_LABEL[k] ?? k}</option>)}</select>
          <input aria-label="Search activity" placeholder="Search events" value={q} onChange={e => setQ(e.target.value)} style={{ ...inputStyle, width: "min(240px,100%)" }} />
        </Row>
        <Table rowKey={(a: Activity) => a.id} rows={rows} pageSize={20} onRow={a => OPENABLE.has(a.entityKind) ? act.open(a.entityKind === "backfill" ? "backfill" : a.entityKind, a.entity) : a.entityKind === "agent" ? act.go("Agents") : undefined}
          empty="No events match these filters." cols={[
            { key: "w", label: "When", w: "130px", render: a => stamp(a.ts) },
            { key: "a", label: "Actor", w: "170px", render: a => <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}><Badge tone={a.actorKind === "agent" ? "info" : a.actorKind === "system" ? "neutral" : "accent"}>{a.actorKind === "agent" ? "Agent" : a.actorKind === "system" ? "System" : "Staff"}</Badge>{a.actor}</span> },
            { key: "t", label: "Type", w: "150px", render: a => a.demoImport ? <span>{a.type} <Badge tone="neutral">Demo import</Badge></span> : a.type },
            { key: "e", label: "Record", w: "140px", render: a => <span style={{ color: OPENABLE.has(a.entityKind) ? "var(--accent)" : "var(--body)" }}>{a.entity}</span> },
            { key: "l", label: "Location", w: "110px", render: a => a.loc === "ALL" ? "All" : LOCATIONS.find(l => l.id === a.loc)?.short },
            { key: "x", label: "What happened", w: "minmax(300px,3fr)", render: a => <span title={a.text}>{a.text}</span> }]} />
      </Card>
    </Page>
  );
}
