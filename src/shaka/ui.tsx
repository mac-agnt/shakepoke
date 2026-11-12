/* Shared building blocks for the Shaka Poké pages, drawn with the Pulse theme
   tokens (surfaces, borders, radii, accent) so they sit inside the existing app. */
import { Fragment, useState, type CSSProperties, type ReactNode } from "react";
import { act } from "./store";

export type Tone = "ok" | "warn" | "bad" | "info" | "neutral" | "accent";
const TONE: Record<Tone, [string, string]> = {
  ok: ["var(--ok)", "var(--ok-soft)"],
  warn: ["var(--warn)", "var(--warn-soft)"],
  bad: ["var(--bad)", "var(--bad-soft)"],
  info: ["var(--brand-2,#46C8F0)", "rgba(70,200,240,.12)"],
  neutral: ["var(--dim)", "var(--track)"],
  accent: ["var(--accent)", "var(--accent-soft)"],
};

export const card: CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--card-r,18px)",
  backdropFilter: "blur(20px) saturate(1.3)", boxShadow: "var(--card-shadow)", minWidth: 0,
};
export const eyebrow: CSSProperties = { fontFamily: "var(--mono)", fontSize: "9.5px", letterSpacing: ".13em", color: "var(--faint)", textTransform: "uppercase" };
export const num: CSSProperties = { fontVariantNumeric: "tabular-nums" };

export function Page({ title, sub, period, actions, children }: { title: string; sub?: ReactNode; period?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="shk-page" style={{ padding: "22px 28px 40px", maxWidth: "1440px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px", animation: "riseIn .35s var(--ease) both" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          {period && <div style={eyebrow}>{period}</div>}
          <h1 style={{ margin: period ? "6px 0 0" : 0, fontSize: "26px", fontWeight: 600, letterSpacing: "-.7px", lineHeight: 1.15 }}>{title}</h1>
          {sub && <div style={{ fontSize: "13px", color: "var(--dim)", marginTop: "6px", maxWidth: "80ch", lineHeight: 1.5 }}>{sub}</div>}
        </div>
        {actions && <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, extra, children, pad = "18px 20px", style, sub }: { title?: ReactNode; extra?: ReactNode; children?: ReactNode; pad?: string; style?: CSSProperties; sub?: ReactNode }) {
  return (
    <section style={{ ...card, padding: pad, ...style }}>
      {(title || extra) && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            {title && <div style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-.2px" }}>{title}</div>}
            {sub && <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "3px", lineHeight: 1.45 }}>{sub}</div>}
          </div>
          {extra}
        </div>
      )}
      {children}
    </section>
  );
}

export function Grid({ min = 260, gap = 14, children, style }: { min?: number; gap?: number; children: ReactNode; style?: CSSProperties }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(min(${min}px,100%),1fr))`, gap: gap + "px", ...style }}>{children}</div>;
}
export function Split({ left, right, ratio = "1.35fr 1fr", children }: { left?: ReactNode; right?: ReactNode; ratio?: string; children?: ReactNode }) {
  return <div className="shk-split" style={{ display: "grid", gridTemplateColumns: ratio, gap: "14px", alignItems: "start" }}>{left}{right}{children}</div>;
}

export function Stat({ label, value, sub, tone, onClick }: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} className={onClick ? "ixr" : undefined}
      style={{ ...card, textAlign: "left", padding: "14px 16px", cursor: onClick ? "pointer" : "default", color: "var(--ink)", font: "inherit", transition: "transform .2s var(--ease),border-color .2s var(--ease)" }}>
      <div style={{ fontSize: "11.5px", color: "var(--dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      <div style={{ ...num, fontSize: "22px", fontWeight: 600, letterSpacing: "-.6px", marginTop: "6px", color: tone ? TONE[tone][0] : "var(--ink)" }}>{value}</div>
      {sub && <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "4px", lineHeight: 1.4 }}>{sub}</div>}
    </button>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const [c, b] = TONE[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", padding: "0 9px", borderRadius: "999px", background: b, color: c, fontSize: "11px", fontWeight: 500, whiteSpace: "nowrap" }}>{children}</span>;
}
export const DemoTag = () => <Badge tone="neutral">Demo data</Badge>;

export function Btn({ kind = "ghost", onClick, children, disabled, small, title, type }: { kind?: "primary" | "ghost" | "danger" | "quiet"; onClick?: () => void; children: ReactNode; disabled?: boolean; small?: boolean; title?: string; type?: "button" | "submit" }) {
  const base: CSSProperties = { height: small ? "30px" : "34px", padding: small ? "0 12px" : "0 16px", borderRadius: "var(--r-ctl,10px)", fontSize: small ? "12px" : "13px", fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "7px", opacity: disabled ? 0.5 : 1, font: "inherit",
    transition: "transform .18s var(--ease),border-color .2s var(--ease),background .2s var(--ease)" };
  const look: CSSProperties = kind === "primary" ? { background: "var(--accent-fill,var(--accent))", color: "var(--on-accent)", border: "1px solid var(--accent)", boxShadow: "var(--accent-glow,none)" }
    : kind === "danger" ? { background: "var(--bad-soft)", color: "var(--bad)", border: "1px solid var(--bad-soft)" }
    : kind === "quiet" ? { background: "none", color: "var(--dim)", border: "1px solid transparent" }
    : { background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--border)" };
  return <button type={type ?? "button"} title={title} disabled={disabled} onClick={onClick} className={disabled ? undefined : kind === "primary" ? "ixp" : "ixg"} style={{ ...base, ...look, fontSize: small ? "12px" : "13px" }}>{children}</button>;
}

export function Seg<T extends string>({ options, value, onChange, counts }: { options: readonly T[] | T[]; value: T; onChange: (v: T) => void; counts?: Partial<Record<T, number | string>> }) {
  return (
    <div role="tablist" style={{ display: "inline-flex", flexWrap: "wrap", gap: "4px", padding: "3px", background: "var(--surface-faint)", border: "1px solid var(--border)", borderRadius: "var(--r-ctl,10px)" }}>
      {options.map(o => {
        const on = o === value;
        return (
          <button key={o} type="button" role="tab" aria-selected={on} onClick={() => onChange(o)}
            style={{ height: "28px", padding: "0 12px", border: 0, borderRadius: "var(--r-ctl,9px)", cursor: "pointer", fontSize: "12.5px", whiteSpace: "nowrap", font: "inherit",
              background: on ? "var(--pill-bg)" : "none", color: on ? "var(--pill-ink)" : "var(--dim)", fontWeight: on ? 600 : 500, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {o}
            {counts && counts[o] !== undefined && <span style={{ ...num, fontSize: "10.5px", padding: "1px 6px", borderRadius: "999px", background: on ? "var(--accent-soft)" : "var(--track)", color: on ? "var(--accent)" : "var(--faint)" }}>{counts[o]}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Notice({ tone = "info", title, children, action }: { tone?: Tone; title?: ReactNode; children: ReactNode; action?: ReactNode }) {
  const [c, b] = TONE[tone];
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 16px", borderRadius: "var(--r-md,14px)", background: b, border: "1px solid " + b, flexWrap: "wrap" }}>
      <span aria-hidden style={{ width: "7px", height: "7px", borderRadius: "2px", background: c, marginTop: "6px", flex: "none" }} />
      <div style={{ flex: "1 1 300px", minWidth: 0, fontSize: "12.5px", lineHeight: 1.55, color: "var(--body)" }}>
        {title && <span style={{ color: "var(--ink)", fontWeight: 600 }}>{title} </span>}{children}
      </div>
      {action}
    </div>
  );
}

export function RecLink({ kind, id, children }: { kind: string; id: string; children?: ReactNode }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); act.open(kind, id); }} className="ixt"
      style={{ border: 0, background: "none", padding: 0, color: "var(--accent)", cursor: "pointer", font: "inherit", fontSize: "inherit", textDecoration: "underline", textDecorationColor: "var(--accent-line)", textUnderlineOffset: "3px" }}>
      {children ?? id}
    </button>
  );
}
export function Chip({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="ixa" style={{ height: "28px", padding: "0 11px", borderRadius: "999px", border: "1px solid var(--chip-border)", background: "var(--chip)", color: "var(--body)", fontSize: "12px", cursor: onClick ? "pointer" : "default", font: "inherit", whiteSpace: "nowrap" }}>{children}</button>
  );
}

/* ── Table with paging ────────────────────────────────────────────────────── */
export type Col<R> = { key: string; label: string; align?: "left" | "right"; w?: string; render: (r: R) => ReactNode; csv?: (r: R) => string | number };
export function Table<R>({ cols, rows, onRow, empty = "Nothing here yet.", pageSize = 0, rowKey, dense, footer }: { cols: Col<R>[]; rows: R[]; onRow?: (r: R) => void; empty?: string; pageSize?: number; rowKey: (r: R) => string; dense?: boolean; footer?: ReactNode }) {
  const [page, setPage] = useState(0);
  const pages = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
  const p = Math.min(page, pages - 1);
  const shown = pageSize ? rows.slice(p * pageSize, p * pageSize + pageSize) : rows;
  const tpl = cols.map(c => c.w ?? "minmax(90px,1fr)").join(" ");
  const pad = dense ? "8px 12px" : "11px 14px";
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md,14px)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "max-content", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: tpl, background: "var(--surface-faint)" }}>
            {cols.map(c => <div key={c.key} style={{ ...eyebrow, padding: pad, textAlign: c.align ?? "left", whiteSpace: "nowrap" }}>{c.label}</div>)}
          </div>
          {shown.map(r => (
            <div key={rowKey(r)} onClick={onRow ? () => onRow(r) : undefined} className={onRow ? "ix11" : undefined} role={onRow ? "button" : undefined} tabIndex={onRow ? 0 : undefined}
              onKeyDown={onRow ? (e) => { if (e.key === "Enter") onRow(r); } : undefined}
              style={{ display: "grid", gridTemplateColumns: tpl, borderTop: "1px solid var(--border)", cursor: onRow ? "pointer" : "default", transition: "background .18s var(--ease)" }}>
              {cols.map(c => <div key={c.key} style={{ ...num, padding: pad, fontSize: "13px", color: "var(--body)", textAlign: c.align ?? "left", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.render(r)}</div>)}
            </div>
          ))}
          {!rows.length && <div style={{ padding: "28px 16px", textAlign: "center", fontSize: "12.5px", color: "var(--dim)", borderTop: "1px solid var(--border)" }}>{empty}</div>}
        </div>
      </div>
      {(pageSize > 0 && rows.length > pageSize) || footer ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)", flexWrap: "wrap" }}>
          <span style={{ flex: "1 1 auto", fontSize: "12px", color: "var(--faint)" }}>
            {footer ?? null}
            {pageSize > 0 && rows.length > pageSize && <> {footer ? " · " : ""}Rows {p * pageSize + 1} to {Math.min(rows.length, (p + 1) * pageSize)} of {rows.length.toLocaleString("en-IE")}</>}
          </span>
          {pageSize > 0 && rows.length > pageSize && (
            <span style={{ display: "flex", gap: "6px" }}>
              <Btn small onClick={() => setPage(0)} disabled={p === 0}>First</Btn>
              <Btn small onClick={() => setPage(p - 1)} disabled={p === 0}>Previous</Btn>
              <Btn small onClick={() => setPage(p + 1)} disabled={p >= pages - 1}>Next</Btn>
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ── Simple charts ────────────────────────────────────────────────────────── */
export function HBars({ rows, fmt, max }: { rows: { label: string; value: number; color?: string; note?: string; onClick?: () => void }[]; fmt: (v: number) => string; max?: number }) {
  const m = max ?? Math.max(1, ...rows.map(r => Math.abs(r.value)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
      {rows.map(r => (
        <div key={r.label} onClick={r.onClick} style={{ cursor: r.onClick ? "pointer" : "default" }}>
          <div style={{ display: "flex", gap: "8px", fontSize: "12.5px", alignItems: "baseline" }}>
            <span style={{ flex: 1, minWidth: 0, color: "var(--body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
            {r.note && <span style={{ fontSize: "11px", color: "var(--faint)" }}>{r.note}</span>}
            <span style={{ ...num, color: r.value < 0 ? "var(--bad)" : "var(--ink)", fontWeight: 500 }}>{fmt(r.value)}</span>
          </div>
          <div style={{ height: "6px", borderRadius: "4px", marginTop: "5px", overflow: "hidden" }}>
            <div style={{ height: "6px", width: Math.max(1.5, (Math.abs(r.value) / m) * 100) + "%", borderRadius: "4px", background: r.value < 0 ? "var(--bad)" : r.color ?? "var(--accent)", transformOrigin: "left", animation: "growX .6s var(--ease) both" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Columns({ data, series, fmt, height = 150 }: { data: { label: string; values: number[] }[]; series: { name: string; color: string }[]; fmt: (v: number) => string; height?: number }) {
  const m = Math.max(1, ...data.flatMap(d => d.values.map(Math.abs)));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: height + "px", padding: "0 2px" }}>
        {data.map(d => (
          <div key={d.label} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "3px", height: "100%" }} title={d.label + ": " + d.values.map((v, i) => series[i].name + " " + fmt(v)).join(", ")}>
            {d.values.map((v, i) => (
              <div key={i} style={{ flex: "1 1 0", maxWidth: "26px", height: Math.max(2, (Math.abs(v) / m) * 100) + "%", background: v < 0 ? "var(--bad)" : series[i].color, borderRadius: "6px 6px 2px 2px", transformOrigin: "bottom", animation: "growY .6s var(--ease) both" }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px", marginTop: "8px", padding: "0 2px" }}>
        {data.map(d => <div key={d.label} style={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: "11px", color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</div>)}
      </div>
      <Legend items={series} />
    </div>
  );
}
export function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "10px" }}>
      {items.map(s => <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--dim)" }}><span style={{ width: "9px", height: "9px", borderRadius: "3px", background: s.color }} />{s.name}</span>)}
    </div>
  );
}

/* Waterfall: sales down to estimated operating profit. */
export function Waterfall({ steps, fmt }: { steps: { label: string; value: number; total?: boolean }[]; fmt: (v: number) => string }) {
  const start = steps[0].value;
  let run = 0;
  const bars = steps.map(s => {
    if (s.total) { const b = { ...s, from: 0, to: s.value }; run = s.value; return b; }
    const from = run, to = run + s.value; run = to; return { ...s, from, to };
  });
  const max = Math.max(start, ...bars.map(b => Math.max(b.from, b.to)));
  const min = Math.min(0, ...bars.map(b => Math.min(b.from, b.to)));
  const span = max - min || 1;
  const H = 170;
  const y = (v: number) => ((max - v) / span) * H;
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: "8px" }}>
      {bars.map((b, i) => {
        const top = y(Math.max(b.from, b.to)), h = Math.max(2, Math.abs(y(b.from) - y(b.to)));
        const color = b.total ? (b.value < 0 ? "var(--bad)" : "var(--accent)") : b.value < 0 ? "var(--neutral)" : "var(--ok)";
        return (
          <div key={b.label} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ ...num, fontSize: "11px", color: b.value < 0 && !b.total ? "var(--dim)" : "var(--ink)", whiteSpace: "nowrap", marginBottom: "4px" }}>{fmt(b.value)}</div>
            <div style={{ position: "relative", width: "100%", height: H + "px" }}>
              <div style={{ position: "absolute", left: "12%", right: "12%", top: top + "px", height: h + "px", background: color, borderRadius: "5px", animation: "fadeIn .5s var(--ease) " + i * 60 + "ms both" }} />
            </div>
            <div style={{ fontSize: "11px", color: "var(--faint)", marginTop: "6px", textAlign: "center", lineHeight: 1.3 }}>{b.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function KV({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(110px,auto) 1fr", columnGap: "14px", rowGap: "8px", fontSize: "13px" }}>
      {rows.map(([k, v], i) => (<Fragment key={i}><div style={{ color: "var(--dim)" }}>{k}</div><div style={{ color: "var(--ink)", minWidth: 0, ...num }}>{v}</div></Fragment>))}
    </div>
  );
}

export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
      <span style={{ fontSize: "12px", color: "var(--dim)", fontWeight: 500 }}>{label}</span>
      {children}
      {help && <span style={{ fontSize: "11.5px", color: "var(--faint)", lineHeight: 1.4 }}>{help}</span>}
    </label>
  );
}
export const inputStyle: CSSProperties = { height: "34px", padding: "0 12px", borderRadius: "var(--r-sm,10px)", border: "1px solid var(--border-strong)", background: "var(--surface-2)", color: "var(--ink)", font: "inherit", fontSize: "13px", outline: "none", minWidth: 0, width: "100%" };

export function Progress({ value, tone = "accent" }: { value: number; tone?: Tone }) {
  return (
    <div style={{ height: "8px", borderRadius: "6px", background: "var(--track)", overflow: "hidden" }}>
      <div style={{ height: "8px", width: Math.min(100, Math.max(0, value * 100)) + "%", background: TONE[tone][0], borderRadius: "6px", transition: "width .5s var(--ease)" }} />
    </div>
  );
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div style={{ padding: "26px 16px", textAlign: "center" }}><div style={{ fontSize: "13.5px", fontWeight: 500 }}>{title}</div>{children && <div style={{ fontSize: "12.5px", color: "var(--dim)", marginTop: "6px" }}>{children}</div>}</div>;
}
export function Row({ children, gap = 10, wrap = true, style }: { children: ReactNode; gap?: number; wrap?: boolean; style?: CSSProperties }) {
  return <div style={{ display: "flex", alignItems: "center", gap: gap + "px", flexWrap: wrap ? "wrap" : "nowrap", ...style }}>{children}</div>;
}
export function Avatar({ initials, tint, size = 26 }: { initials: string; tint: string; size?: number }) {
  return <span style={{ width: size + "px", height: size + "px", flex: "none", borderRadius: "999px", background: tint, color: "#06121f", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size < 28 ? "9.5px" : "11px", fontWeight: 600 }}>{initials}</span>;
}
