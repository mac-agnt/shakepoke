import { useState } from "react";
import { useShaka, act, AGENTS } from "../store";
import { ORG, PEOPLE, LOCATIONS, INTEGRATIONS, DEPARTMENTS, locName } from "../model";
import { Page, Card, Grid, Table, Btn, Notice, KV, Row, Badge, Avatar } from "../ui";
import { tabOf } from "../nav";

type Theme = { id: string; label: string; group: string; bg: string; surface: string; ink: string; accent: string };
export default function Settings({ themes, theme, setTheme }: { themes: Theme[]; theme: string; setTheme: (id: string) => void }) {
  const s = useShaka();
  const tab = tabOf(s, "Settings");
  const [agentsPaused, setAgentsPaused] = useState(false);
  const [rules, setRules] = useState<Record<string, boolean>>({ invoices: true, cost: true, po: true, roster: true, export: true });
  const [ai, setAi] = useState<Record<string, boolean>>({ sources: true, review: true, uncertainty: true, memory: false });
  const [density, setDensity] = useState<"Comfortable" | "Compact">("Comfortable");
  const [motion, setMotion] = useState(false);

  if (tab === "Teams") return (
    <Page period="Settings" title="Teams" sub="Departments and who belongs to them. All names except David are fictional demo identities.">
      <Grid min={260}>{DEPARTMENTS.map(d => <Card key={d} title={d} extra={<Badge>{PEOPLE.filter(p => p.dept === d).length}</Badge>}>
        {PEOPLE.filter(p => p.dept === d).map(p => <Row key={p.id} style={{ padding: "5px 0", fontSize: "13px" }}><Avatar initials={p.initials} tint={p.tint} size={22} /><button type="button" onClick={() => act.open("person", p.id)} style={{ border: 0, background: "none", padding: 0, font: "inherit", color: "var(--ink)", cursor: "pointer" }}>{p.name}</button><span style={{ color: "var(--dim)", fontSize: "12px" }}>{p.role}</span></Row>)}
        {!PEOPLE.some(p => p.dept === d) && <div style={{ fontSize: "12.5px", color: "var(--dim)" }}>David covers Finance today; no separate finance staff in the demo.</div>}
      </Card>)}</Grid>
    </Page>
  );
  if (tab === "Permissions") return (
    <Page period="Settings" title="Permissions" sub="Scoped access by role. This is a UI simulation for the demo, not claimed security enforcement.">
      <Notice tone="warn">Permissions shown here are simulated. Authentication and real access control are unchanged.</Notice>
      <Card><Table rowKey={p => p.id} rows={PEOPLE} cols={[
        { key: "n", label: "Person", w: "minmax(160px,1.2fr)", render: p => p.name }, { key: "r", label: "Role", w: "minmax(150px,1.2fr)", render: p => p.role },
        { key: "a", label: "Access scope", w: "160px", render: p => <Badge tone={p.access === "All access" ? "accent" : p.access === "Prep only" ? "neutral" : "info"}>{p.access}</Badge> },
        { key: "f", label: "Finance", w: "90px", render: p => p.id === "P-DAVID" ? "Full" : "None" }, { key: "s", label: "Stock and prep", w: "120px", render: p => p.dept === "Events" ? "View" : "Own site" },
        { key: "ap", label: "Approve", w: "minmax(150px,1fr)", render: p => p.id === "P-DAVID" ? "Invoices, costs, purchases" : p.role.includes("Manager") ? "Roster for own site" : "None" }]} /></Card>
    </Page>
  );
  if (tab === "Systems") return (
    <Page period="Settings" title="Systems and data ownership" sub="Every source shows its purpose, direction and demo status. There are no live connections in this demo.">
      <Grid min={320}>{INTEGRATIONS.map(i => (
        <Card key={i.id} title={i.name} extra={<Badge tone={/not connected|evaluation|context/i.test(i.status) ? "neutral" : "info"}>{i.status}</Badge>} sub={i.purpose}>
          <KV rows={[["Direction", i.direction], ["Last import", i.last], ["Source owner", i.owner]]} />
          {i.confirm && <div style={{ marginTop: "10px" }}><Notice tone="warn" title="To confirm.">{i.confirm}</Notice></div>}
        </Card>))}</Grid>
    </Page>
  );
  if (tab === "Governance") return (
    <Page period="Settings" title="Governance" sub="Approval rules and the audit trail. Every decision is written to Activity with the person who made it.">
      <Card title="Approval rules" sub="Toggle to see the rule; enforcement stays simulated.">
        {([["invoices", "Invoice exceptions and duplicates need David before export"], ["cost", "Recipe cost updates need David; October history is never rewritten"], ["po", "Purchase drafts need approval; nothing is sent to suppliers from Pulse"], ["roster", "Roster proposals need the site manager; Pulse never changes shifts or notifies staff"], ["export", "Accountant exports are drafts; no posting, filing or payment"]] as const).map(([k, label]) => (
          <label key={k} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "9px 0", borderTop: "1px solid var(--border)", fontSize: "13px" }}><input type="checkbox" checked={rules[k]} onChange={() => setRules({ ...rules, [k]: !rules[k] })} style={{ accentColor: "var(--accent)" }} />{label}</label>))}
      </Card>
      <Card title="Audit" extra={<Btn small onClick={() => act.go("Activity", "All")}>Open Activity</Btn>}><div style={{ fontSize: "13px", color: "var(--body)" }}>{s.activity.length} events recorded this session. Entries cannot be edited from the interface.</div></Card>
      <Card title="Demo controls" sub="For repeatable presentations.">
        <Row><Btn kind="danger" onClick={() => act.reset()}>Reset demo to the starting dataset</Btn></Row>
      </Card>
    </Page>
  );
  if (tab === "AI Controls") return (
    <Page period="Settings" title="AI controls" sub="What agents can see and when a person must decide. All agent runs are simulated.">
      <Card title="Global" extra={<Btn small kind={agentsPaused ? "primary" : "ghost"} onClick={() => { setAgentsPaused(!agentsPaused); act.toast(agentsPaused ? "Agents resumed (simulated)" : "All agents paused (simulated)"); }}>{agentsPaused ? "Resume agents" : "Pause every agent"}</Btn>}>
        {([["sources", "Show input sources and evidence links on every finding"], ["review", "Human review required for every change to a record"], ["uncertainty", "Show uncertainty notes next to forecasts and extractions"], ["memory", "Allow agents to keep notes between sessions"]] as const).map(([k, label]) => (
          <label key={k} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "9px 0", borderTop: "1px solid var(--border)", fontSize: "13px" }}><input type="checkbox" checked={ai[k]} onChange={() => setAi({ ...ai, [k]: !ai[k] })} style={{ accentColor: "var(--accent)" }} />{label}</label>))}
      </Card>
      <Card title="Agents and their gates"><Table rowKey={a => a.id} rows={AGENTS} cols={[{ key: "n", label: "Agent", w: "180px", render: a => a.name }, { key: "s", label: "Sources", w: "minmax(200px,1.4fr)", render: a => a.sources.join(", ") }, { key: "g", label: "Human gate", w: "minmax(220px,1.6fr)", render: a => a.gates[0] }]} /></Card>
    </Page>
  );
  if (tab === "Experience") return (
    <Page period="Settings" title="Experience" sub="Theme, density and accessibility. The default dark theme uses the Shaka Poké blues; the light theme uses the primary #0854A0.">
      <Card title="Theme">
        <Grid min={150}>{themes.map(t => (
          <button key={t.id} type="button" onClick={() => setTheme(t.id)} style={{ textAlign: "left", padding: "10px", borderRadius: "14px", border: "1.5px solid " + (theme === t.id ? "var(--accent)" : "var(--chip-border)"), background: "var(--chip)", cursor: "pointer", color: "var(--ink)", font: "inherit" }}>
            <div style={{ position: "relative", height: "56px", borderRadius: "10px", background: t.bg, overflow: "hidden", border: "1px solid rgba(127,127,127,.2)" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "22%", background: t.surface }} /><div style={{ position: "absolute", left: "30%", top: "58%", width: "10px", height: "10px", borderRadius: "3px", background: t.accent }} />
            </div>
            <div style={{ fontSize: "12.5px", marginTop: "7px" }}>{t.label}</div>
          </button>))}</Grid>
      </Card>
      <Grid min={300}>
        <Card title="Density"><Row>{(["Comfortable", "Compact"] as const).map(d => <Btn key={d} small kind={density === d ? "primary" : "ghost"} onClick={() => { setDensity(d); document.documentElement.style.fontSize = d === "Compact" ? "15px" : ""; }}>{d}</Btn>)}</Row></Card>
        <Card title="Accessibility"><label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px" }}><input type="checkbox" checked={motion} onChange={() => { setMotion(!motion); document.documentElement.toggleAttribute("data-reduce-motion", !motion); }} style={{ accentColor: "var(--accent)" }} />Reduce motion in this session</label><div style={{ fontSize: "12px", color: "var(--faint)", marginTop: "8px" }}>The system setting for reduced motion is always respected.</div></Card>
      </Grid>
    </Page>
  );
  return (
    <Page period="Settings" title="Organisation" sub="Trading identity and sites. The legal entity is not established for the current operating company, so none is asserted.">
      <Grid min={300}>
        <Card title="Identity">
          <KV rows={[["Trading name", ORG.tradingName], ["Legal entity", "To confirm"], ["Company number", "Not recorded"], ["Website", ORG.website], ["Owner", ORG.owner + " (" + ORG.ownerRole + ")"], ["Currency and timezone", "EUR · Europe/Dublin"], ["Brand colours", "#0854A0 primary · #46C8F0 secondary · #A9E5FF highlight"]]} />
        </Card>
        <Card title="Sites">
          {LOCATIONS.map(l => <div key={l.id} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}><Row gap={8}><button type="button" onClick={() => act.open("location", l.id)} style={{ border: 0, background: "none", padding: 0, font: "inherit", color: "var(--ink)", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>{l.name}</button><Badge>{l.kind}</Badge></Row><div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "3px" }}>{l.address} · {l.hours}</div></div>)}
          <div style={{ fontSize: "12px", color: "var(--faint)", marginTop: "10px" }}>A possible third location is confidential and exploratory; it is modelled only as a scenario in Dashboard › Planning.</div>
        </Card>
      </Grid>
      <Notice tone="neutral" title="Demo data.">Every financial figure, employee, invoice and forecast in this workspace is an illustrative demo assumption, not a claim about the client. {locName("BAG")} hours follow the call's Monday to Friday model.</Notice>
    </Page>
  );
}
