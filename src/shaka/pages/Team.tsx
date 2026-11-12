import { Fragment, useState } from "react";
import { useShaka, act, pnl, labourHours, type State } from "../store";
import { PEOPLE, ROSTER, ROSTER_PROPOSAL, LOADED_RATE, SHIFTS, locName, person } from "../model";
import { eur, eur2, pct } from "../format";
import { Page, Card, Grid, Split, Stat, Table, Btn, Seg, Notice, RecLink, KV, Row, Badge, Avatar, HBars, num } from "../ui";
import { StatusBadge } from "../RecordDrawer";
import { tabOf } from "../nav";

export default function Team() {
  const s = useShaka();
  const tab = tabOf(s, "Team");
  if (tab === "Roster") return <Roster s={s} />;
  if (tab === "Labour") return <Labour s={s} />;
  return <Overview />;
}

const today = "Thu 12";
function Overview() {
  const on = ROSTER.filter(r => r.day === today);
  const cost = on.reduce((a, r) => a + r.hours * LOADED_RATE, 0);
  return (
    <Page period="Thu 12 Nov · Square Teams demo import" title="Team"
      sub="Eight sample users, not a confirmed headcount. Managers already handle rostering, prep and ordering well; Pulse shows the cost picture without replacing them.">
      <Grid min={170}>
        <Stat label="On shift today" value={on.length} sub={new Set(on.map(r => r.loc)).size + " sites"} />
        <Stat label="Hours today" value={on.reduce((a, r) => a + r.hours, 0) + " h"} />
        <Stat label="Loaded cost today" value={eur(cost)} sub="At an illustrative €16/h" />
        <Stat label="October hours" value={(labourHours("BAG") + labourHours("BLK")) + " h"} onClick={() => act.go("Team", "Labour")} />
      </Grid>
      <Split left={
        <Card title="Directory" sub="All names except David are fictional demo identities. Email addresses are labelled mock records.">
          <Table rowKey={p => p.id} rows={PEOPLE} onRow={p => act.open("person", p.id)} cols={[
            { key: "n", label: "Name", w: "minmax(170px,1.3fr)", render: p => <span style={{ display: "inline-flex", alignItems: "center", gap: "9px" }}><Avatar initials={p.initials} tint={p.tint} />{p.name}</span> },
            { key: "r", label: "Role", w: "minmax(150px,1.2fr)", render: p => p.role }, { key: "d", label: "Department", w: "140px", render: p => p.dept },
            { key: "l", label: "Site", w: "120px", render: p => p.loc === "ALL" ? "All sites" : locName(p.loc) }, { key: "e", label: "Email (mock)", w: "minmax(160px,1.1fr)", render: p => p.email }]} />
        </Card>} right={
        <Card title="Today's coverage" sub="Read-only from Square Teams (simulated).">
          {(["BAG", "BLK"] as const).map(l => (
            <div key={l} style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "var(--dim)", marginBottom: "6px" }}>{locName(l)}</div>
              {on.filter(r => r.loc === l).map(r => <Row key={r.id} style={{ padding: "5px 0", fontSize: "13px" }}><Avatar initials={person(r.person)!.initials} tint={person(r.person)!.tint} size={22} /><span style={{ flex: 1 }}>{person(r.person)?.name}</span><span style={{ ...num, color: "var(--dim)" }}>{r.start} to {r.end}</span></Row>)}
            </div>
          ))}
          <div style={{ fontSize: "12px", color: "var(--faint)" }}>Truck: no shifts until the season or a private event.</div>
        </Card>} />
    </Page>
  );
}

const DAYS = ["Mon 9", "Tue 10", "Wed 11", "Thu 12", "Fri 13", "Sat 14", "Sun 15"];
function Roster({ s }: { s: State }) {
  const [view, setView] = useState<"Week" | "Day">("Week");
  const [day, setDay] = useState(today);
  const [overlay, setOverlay] = useState(true);
  const [loc, setLoc] = useState<"Baggot Street" | "Blackrock">("Blackrock");
  const L = loc === "Baggot Street" ? "BAG" : "BLK";
  const staff = Array.from(new Set(ROSTER.filter(r => r.loc === L).map(r => r.person)));
  const change = (d: string, p: string) => overlay && L === "BLK" && s.roster.status !== "declined" ? ROSTER_PROPOSAL.changes.find(c => c.day === d && c.person === p) : undefined;
  const days = view === "Week" ? DAYS : [day];
  return (
    <Page period="Week of 9 to 15 November · read-only import" title="Roster"
      sub="The schedule comes from Square Teams and cannot be edited here. The local proposal overlay is clearly separate and only a manager can approve it; shifts are still changed in Square Teams."
      actions={<><Seg options={["Baggot Street", "Blackrock"] as const} value={loc} onChange={setLoc} /><Seg options={["Week", "Day"] as const} value={view} onChange={setView} /></>}>
      <Row>
        {view === "Day" && <Seg options={DAYS} value={day} onChange={setDay} />}
        <label style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "12.5px", color: "var(--body)" }}><input type="checkbox" checked={overlay} onChange={() => setOverlay(!overlay)} style={{ accentColor: "var(--accent)" }} />Show local proposal overlay</label>
        {L === "BAG" && <Badge tone="neutral">Fixed weekday routine; no proposals</Badge>}
      </Row>
      <Card pad="6px 8px">
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `160px repeat(${days.length},minmax(110px,1fr))`, minWidth: view === "Week" ? "900px" : "320px" }}>
            <div />
            {days.map(d => <div key={d} style={{ padding: "10px 8px", fontSize: "11px", color: d === today ? "var(--accent)" : "var(--faint)", fontWeight: d === today ? 600 : 500 }}>{d} Nov</div>)}
            {staff.map(p => (
              <Fragment key={p}>
                <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}><Avatar initials={person(p)!.initials} tint={person(p)!.tint} size={22} />{person(p)?.name.split(" ")[0]}</div>
                {days.map(d => {
                  const sh = ROSTER.find(r => r.loc === L && r.day === d && r.person === p);
                  const c = sh ? change(d, p) : undefined;
                  return (
                    <div key={p + d} style={{ padding: "6px", borderTop: "1px solid var(--border)" }}>
                      {sh && <div style={{ padding: "6px 8px", borderRadius: "10px", background: sh.fixed ? "var(--surface-2)" : "var(--accent-faint)", border: "1px solid " + (sh.fixed ? "var(--border)" : "var(--accent-line)"), fontSize: "11.5px" }}>
                        <div style={num}>{sh.start} to {sh.end}</div>
                        {c && <div style={{ marginTop: "4px", padding: "3px 6px", borderRadius: "6px", border: "1px dashed var(--warn)", color: "var(--warn)", fontSize: "11px" }}>Proposal: {c.to} (−{c.cut} h){s.roster.status === "approved" ? " · approved" : ""}</div>}
                      </div>}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </Card>
      <Card title="Proposal" extra={<StatusBadge s={s.roster.status} />} sub="Optional, discretionary, manager approval required.">
        <div style={{ fontSize: "13px", lineHeight: 1.6 }}>{ROSTER_PROPOSAL.changes.map(c => c.day + ": " + person(c.person)?.name + " " + c.from + " to " + c.to).join(" · ")}. Four hours at {eur2(LOADED_RATE)}/h = {eur(ROSTER_PROPOSAL.saving)} potential weekly saving.</div>
        <Row style={{ marginTop: "10px" }}><Btn kind="primary" onClick={() => act.open("roster", ROSTER_PROPOSAL.id)}>Open proposal</Btn></Row>
      </Card>
    </Page>
  );
}

function Labour({ s }: { s: State }) {
  const P = pnl();
  const rows = (["BAG", "BLK"] as const).map(l => ({ l, h: labourHours(l), c: P[l].labour, sales: P[l].sales }));
  const byPerson = PEOPLE.filter(p => SHIFTS.some(x => x.person === p.id)).map(p => ({ p, h: SHIFTS.filter(x => x.person === p.id).reduce((a, x) => a + x.hours, 0) }));
  return (
    <Page period="October actuals · November scenario" title="Labour" sub="Hours × loaded cost from October timesheets. Actuals and the forward-looking scenario are kept apart. No payroll is run from Pulse.">
      <Grid min={200}>
        {rows.map(r => <Stat key={r.l} label={locName(r.l) + " labour ratio"} value={pct(r.c, r.sales, 0)} sub={eur(r.c) + " / " + eur(r.sales) + " · " + r.h + " h"} tone={r.l === "BLK" ? "warn" : undefined} />)}
        <Stat label="Combined" value={pct(P.ALL.labour, P.ALL.sales, 1)} sub={eur(P.ALL.labour) + " · loaded €16/h illustrative"} />
      </Grid>
      <Split left={
        <Card title="October actual hours by person" sub="From timesheet rows; drill into Finance > P&L > Labour for every shift.">
          <HBars fmt={v => v + " h"} rows={byPerson.map(x => ({ label: x.p.name + " · " + locName(x.p.loc as "BAG"), value: x.h, onClick: () => act.open("person", x.p.id) }))} />
        </Card>} right={
        <Card title="November scenario: Blackrock" extra={<StatusBadge s={s.roster.status} />}>
          <KV rows={[["Hours removed", ROSTER_PROPOSAL.hours + " low-demand hours"], ["Loaded cost", eur2(LOADED_RATE) + "/h (illustrative)"], ["Potential saving", eur(ROSTER_PROPOSAL.saving) + " a week"], ["Approver", <RecLink kind="person" id="P-CONOR">Conor Walsh</RecLink>]]} />
          <div style={{ marginTop: "12px" }}><Notice tone="neutral">{ROSTER_PROPOSAL.caveats}</Notice></div>
          <Row style={{ marginTop: "12px" }}>{s.roster.status === "proposed" ? <><Btn kind="primary" onClick={() => act.decideRoster(true)}>Approve as Conor</Btn><Btn onClick={() => act.decideRoster(false)}>Decline</Btn></> : <Badge tone="ok">Decision recorded</Badge>}</Row>
        </Card>} />
    </Page>
  );
}
