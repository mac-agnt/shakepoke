/* Dashboard visuals for the Shaka Poké pages: sparklines, KPI tiles, donuts,
   line charts, stacked bars, a month heatmap, a progress ring and a coverage
   grid. Plain SVG and CSS drawn with the theme tokens, no chart library. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { card, num, type Tone } from "./ui";

/* Categorical series colours. Slot 1 follows the theme accent. */
export const VIZ = ["var(--accent)", "var(--viz-2)", "var(--viz-3)", "var(--viz-4)", "var(--viz-5)", "var(--viz-6)", "var(--viz-7)"];

const TONE_C: Record<Tone, string> = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)", info: "var(--viz-2)", neutral: "var(--dim)", accent: "var(--accent)" };

/* ── Sparkline ────────────────────────────────────────────────────────────── */
export function Spark({ values, color = "var(--accent)", h = 34, area = true }: { values: (number | null)[]; color?: string; h?: number; area?: boolean }) {
  const pts = values.map((v, i) => ({ v, i })).filter((p): p is { v: number; i: number } => p.v !== null);
  if (pts.length < 2) return <div style={{ height: h + "px" }} />;
  const lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v)), span = hi - lo || 1;
  const W = 100, n = values.length - 1 || 1;
  const xy = pts.map(p => [(p.i / n) * W, 3 + (1 - (p.v - lo) / span) * (h - 6)] as const);
  const line = xy.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2)).join(" ");
  const last = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" width="100%" height={h} aria-hidden style={{ display: "block", overflow: "visible" }}>
      {area && <path d={line + ` L${last[0]} ${h} L${xy[0][0]} ${h} Z`} fill={color} opacity={0.12} />}
      <path d={line} fill="none" stroke={color} strokeWidth={1.8} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ── KPI tile: value, change against last period, sparkline ───────────────── */
export function Kpi({ label, value, delta, goodWhen = "up", sub, spark, sparkColor, onClick, tone }: {
  label: string; value: ReactNode; delta?: number | null; goodWhen?: "up" | "down"; sub?: ReactNode; spark?: (number | null)[]; sparkColor?: string; onClick?: () => void; tone?: Tone;
}) {
  const good = delta == null || Math.abs(delta) < 0.0005 ? null : (delta > 0) === (goodWhen === "up");
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className={onClick ? "ixr" : undefined}
      style={{ ...card, textAlign: "left", padding: "14px 16px 12px", cursor: onClick ? "pointer" : "default", color: "var(--ink)", font: "inherit", display: "flex", flexDirection: "column", gap: "4px", minHeight: "118px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: "11.5px", color: "var(--dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        {delta != null && (
          <span style={{ ...num, fontSize: "11px", fontWeight: 600, padding: "2px 7px", borderRadius: "20px", color: good === null ? "var(--dim)" : good ? "var(--ok)" : "var(--bad)", background: good === null ? "var(--track)" : good ? "var(--ok-soft)" : "var(--bad-soft)" }}>
            {(delta > 0 ? "+" : delta < 0 ? "−" : "") + Math.abs(delta * 100).toFixed(Math.abs(delta) >= 0.1 ? 0 : 1) + "%"}
          </span>
        )}
      </div>
      <div style={{ ...num, fontSize: "22px", fontWeight: 600, letterSpacing: "-.6px", color: tone ? TONE_C[tone] : "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      {sub && <div style={{ fontSize: "11.5px", color: "var(--faint)", lineHeight: 1.35 }}>{sub}</div>}
      {spark && <div style={{ marginTop: "auto", paddingTop: "6px" }}><Spark values={spark} color={sparkColor} h={28} /></div>}
    </button>
  );
}

/* ── Donut with legend ───────────────────────────────────────────────────── */
export function Donut({ rows, fmt, center, size = 148, legend = true }: {
  rows: { label: string; value: number; color?: string; onClick?: () => void }[]; fmt: (v: number) => string; center?: { value: string; label: string }; size?: number; legend?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const data = rows.filter(r => r.value > 0);
  const total = data.reduce((a, r) => a + r.value, 0) || 1;
  const R = 42, C = 2 * Math.PI * R;
  let acc = 0;
  const h = hover !== null ? data[hover] : null;
  return (
    <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: size + "px", height: size + "px", flex: "none" }}>
        <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: "rotate(-90deg)" }} role="img" aria-label={data.map(r => r.label + " " + fmt(r.value)).join(", ")}>
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--track)" strokeWidth="11" />
          {data.map((r, i) => {
            const len = (r.value / total) * C, gap = data.length > 1 ? Math.min(1.6, len * 0.3) : 0;
            const el = <circle key={r.label} cx="50" cy="50" r={R} fill="none" stroke={r.color ?? VIZ[i % VIZ.length]} strokeWidth={hover === i ? 13 : 11}
              strokeDasharray={`${Math.max(0, len - gap)} ${C}`} strokeDashoffset={-acc} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={r.onClick}
              style={{ cursor: r.onClick ? "pointer" : "default", transition: "stroke-width .2s var(--ease)", animation: "fadeIn .6s var(--ease) " + i * 70 + "ms both" }} />;
            acc += len; return el;
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", pointerEvents: "none", padding: "0 22px" }}>
          <div style={{ ...num, fontSize: size > 130 ? "17px" : "14px", fontWeight: 600, letterSpacing: "-.4px" }}>{h ? Math.round((h.value / total) * 100) + "%" : center?.value}</div>
          <div style={{ fontSize: "10.5px", color: "var(--faint)", marginTop: "2px", lineHeight: 1.25 }}>{h ? h.label : center?.label}</div>
        </div>
      </div>
      {legend && (
        <div style={{ flex: "1 1 180px", minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          {data.map((r, i) => (
            <div key={r.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={r.onClick}
              style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: r.onClick ? "pointer" : "default", opacity: hover === null || hover === i ? 1 : 0.55, transition: "opacity .2s var(--ease)" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "3px", flex: "none", background: r.color ?? VIZ[i % VIZ.length] }} />
              <span style={{ flex: 1, minWidth: 0, color: "var(--body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
              <span style={{ ...num, color: "var(--faint)", fontSize: "11px" }}>{Math.round((r.value / total) * 100)}%</span>
              <span style={{ ...num, color: "var(--ink)", minWidth: "62px", textAlign: "right" }}>{fmt(r.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Line chart: several series over shared labels; null leaves a gap ─────── */
export function LineChart({ labels, series, fmt, height = 190, area }: {
  labels: string[]; series: { name: string; color: string; values: (number | null)[]; dashed?: boolean }[]; fmt: (v: number) => string; height?: number; area?: boolean;
}) {
  const [hi, setHi] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(160, Math.round(el.clientWidth))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const all = series.flatMap(s => s.values.filter((v): v is number => v !== null));
  const rawMax = Math.max(1, ...all), rawMin = Math.min(0, ...all);
  const step = niceStep((rawMax - rawMin) / 4);
  const max = Math.ceil(rawMax / step) * step, min = Math.floor(rawMin / step) * step;
  const ticks: number[] = []; for (let t = min; t <= max + step / 2; t += step) ticks.push(t);
  const H = height, padL = 52, padR = 12, padT = 10, padB = 24;
  const x = (i: number) => padL + (labels.length > 1 ? (i / (labels.length - 1)) * (W - padL - padR) : (W - padL - padR) / 2);
  const y = (v: number) => padT + (1 - (v - min) / (max - min || 1)) * (H - padT - padB);
  const path = (vals: (number | null)[]) => {
    let d = "", pen = false;
    vals.forEach((v, i) => { if (v === null) { pen = false; return; } d += (pen ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1) + " "; pen = true; });
    return d;
  };
  return (
    <div>
      <div ref={box} style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block", overflow: "visible" }} onMouseLeave={() => setHi(null)}>
          {ticks.map(t => (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeDasharray={t === 0 ? undefined : "3 4"} />
              <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10.5" fill="var(--faint)" style={num}>{fmt(t)}</text>
            </g>
          ))}
          {labels.map((l, i) => <text key={l + i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10.5" fill={hi === i ? "var(--ink)" : "var(--faint)"}>{l}</text>)}
          {hi !== null && <line x1={x(hi)} x2={x(hi)} y1={padT} y2={H - padB} stroke="var(--border-strong)" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
          {series.map((s, si) => {
            const d = path(s.values);
            const idx = s.values.map((v, i) => (v === null ? -1 : i)).filter(i => i >= 0);
            return (
              <g key={s.name}>
                {area && si === 0 && idx.length > 1 && <path d={d + `L${x(idx[idx.length - 1])} ${y(Math.max(min, 0))} L${x(idx[0])} ${y(Math.max(min, 0))} Z`} fill={s.color} opacity={0.1} />}
                <path d={d} fill="none" stroke={s.color} strokeWidth={2.2} strokeDasharray={s.dashed ? "5 5" : undefined} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" style={{ animation: "fadeIn .6s var(--ease) both" }} />
                {s.values.map((v, i) => v === null ? null : <circle key={i} cx={x(i)} cy={y(v)} r={hi === i ? 4.5 : 2.8} fill="var(--bg)" stroke={s.color} strokeWidth={2} vectorEffect="non-scaling-stroke" />)}
              </g>
            );
          })}
          {labels.map((_, i) => <rect key={"h" + i} x={x(i) - (W - padL - padR) / Math.max(1, labels.length - 1) / 2} y={0} width={(W - padL - padR) / Math.max(1, labels.length - 1)} height={H} fill="transparent" onMouseEnter={() => setHi(i)} />)}
        </svg>
        {hi !== null && (
          <div style={{ position: "absolute", top: 0, left: `clamp(0px, calc(${(x(hi) / W) * 100}% - 80px), calc(100% - 170px))`, width: "170px", pointerEvents: "none", ...card, background: "var(--tooltip,var(--overlay,var(--bg)))", padding: "8px 10px", fontSize: "11.5px", zIndex: 2 }}>
            <div style={{ fontWeight: 600, marginBottom: "4px" }}>{labels[hi]}</div>
            {series.map(s => (
              <div key={s.name} style={{ display: "flex", gap: "6px", alignItems: "center", padding: "1px 0" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color }} />
                <span style={{ flex: 1, color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                <span style={num}>{s.values[hi] === null ? "n/a" : fmt(s.values[hi]!)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "8px" }}>
        {series.map(s => <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--dim)" }}><span style={{ width: "14px", height: "3px", borderRadius: "2px", background: s.color }} />{s.name}</span>)}
      </div>
    </div>
  );
}
function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

/* ── Stacked horizontal bar with legend ───────────────────────────────────── */
export function StackBar({ rows, fmt, height = 12, legend = true }: { rows: { label: string; value: number; color?: string }[]; fmt: (v: number) => string; height?: number; legend?: boolean }) {
  const total = rows.reduce((a, r) => a + Math.max(0, r.value), 0) || 1;
  return (
    <div>
      <div style={{ display: "flex", height: height + "px", borderRadius: "6px", overflow: "hidden", gap: "2px", background: "var(--track)" }}>
        {rows.filter(r => r.value > 0).map((r, i) => (
          <div key={r.label} title={r.label + ": " + fmt(r.value)} style={{ width: (r.value / total) * 100 + "%", background: r.color ?? VIZ[i % VIZ.length], transformOrigin: "left", animation: "growX .6s var(--ease) " + i * 60 + "ms both" }} />
        ))}
      </div>
      {legend && (
        <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", marginTop: "8px" }}>
          {rows.map((r, i) => (
            <span key={r.label} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--dim)" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: r.color ?? VIZ[i % VIZ.length] }} />{r.label}
              <span style={{ ...num, color: "var(--ink)" }}>{fmt(r.value)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Month heatmap: one cell per day, Monday first ────────────────────────── */
export function MonthHeat({ year, month, values, fmt, unit }: { year: number; month: number; values: Record<number, number>; fmt: (v: number) => string; unit: string }) {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const max = Math.max(1, ...Object.values(values));
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px" }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} style={{ fontSize: "10px", color: "var(--faint)", textAlign: "center", paddingBottom: "2px" }}>{d}</div>)}
        {cells.map((d, i) => {
          const v = d ? values[d] ?? 0 : 0;
          const a = v ? 0.25 + 0.75 * (v / max) : 0;
          return (
            <div key={i} title={d ? d + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1] + ": " + (v ? fmt(v) : "nothing") : undefined}
              style={{ aspectRatio: "1.7", borderRadius: "5px", position: "relative", background: d ? (v ? "var(--accent)" : "var(--track)") : "transparent", opacity: d ? (v ? a : 1) : 1, animation: d ? "fadeIn .5s var(--ease) " + i * 8 + "ms both" : undefined }}>
              {d && <span style={{ position: "absolute", top: "3px", left: "5px", fontSize: "9.5px", color: v && a > 0.6 ? "var(--on-accent)" : "var(--faint)", ...num }}>{d}</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", fontSize: "11px", color: "var(--faint)" }}>
        <span>Fewer {unit}</span>
        {[0.25, 0.5, 0.75, 1].map(a => <span key={a} style={{ width: "12px", height: "10px", borderRadius: "3px", background: "var(--accent)", opacity: a }} />)}
        <span>More</span>
      </div>
    </div>
  );
}

/* ── Progress ring ───────────────────────────────────────────────────────── */
export function Ring({ value, size = 92, tone = "accent", label, caption }: { value: number; size?: number; tone?: Tone; label: ReactNode; caption?: string }) {
  const R = 40, C = 2 * Math.PI * R, v = Math.max(0, Math.min(1, value));
  return (
    <div style={{ position: "relative", width: size + "px", height: size + "px", flex: "none" }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--track)" strokeWidth="9" />
        <circle cx="50" cy="50" r={R} fill="none" stroke={TONE_C[tone]} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${v * C} ${C}`} style={{ transition: "stroke-dasharray .6s var(--ease)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...num, fontSize: size > 80 ? "18px" : "14px", fontWeight: 600, letterSpacing: "-.4px" }}>{label}</div>
        {caption && <div style={{ fontSize: "10px", color: "var(--faint)" }}>{caption}</div>}
      </div>
    </div>
  );
}

/* ── Coverage grid: which inputs exist for which period ──────────────────── */
export type Cover = "ok" | "warn" | "bad";
export function Coverage({ cols, rows }: { cols: string[]; rows: { label: string; cells: { state: Cover; note: string }[] }[] }) {
  const bg: Record<Cover, string> = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--track)" };
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `minmax(130px,1.2fr) repeat(${cols.length},minmax(34px,1fr))`, gap: "5px", alignItems: "center", minWidth: "420px" }}>
        <span />
        {cols.map(c => <span key={c} style={{ fontSize: "10.5px", color: "var(--faint)", textAlign: "center" }}>{c}</span>)}
        {rows.map(r => [
          <span key={r.label} style={{ fontSize: "12px", color: "var(--body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>,
          ...r.cells.map((c, i) => <span key={r.label + i} title={cols[i] + ": " + c.note} style={{ height: "22px", borderRadius: "6px", background: bg[c.state], opacity: c.state === "bad" ? 1 : 0.85, border: c.state === "bad" ? "1px dashed var(--border-strong)" : "none" }} />),
        ])}
      </div>
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "10px", fontSize: "11px", color: "var(--faint)" }}>
        {(["ok", "warn", "bad"] as Cover[]).map(k => <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "10px", borderRadius: "3px", background: bg[k], border: k === "bad" ? "1px dashed var(--border-strong)" : "none" }} />{k === "ok" ? "In" : k === "warn" ? "Provisional" : "Missing"}</span>)}
      </div>
    </div>
  );
}

/* Change between two numbers as a fraction, or null if either is missing. */
export const change = (cur: number | null | undefined, prev: number | null | undefined) => (cur == null || prev == null || prev === 0 ? null : (cur - prev) / Math.abs(prev));

/* Compact euro for axes and tight tiles: €52k, €1.4k, €640. Input is cents. */
export const kEur = (c: number) => {
  const e = c / 100, a = Math.abs(e);
  if (a >= 1000) return (e < 0 ? "−€" : "€") + (a / 1000).toFixed(a >= 10000 || a % 1000 === 0 ? 0 : 1) + "k";
  return (e < 0 ? "−€" : "€") + Math.round(a);
};
