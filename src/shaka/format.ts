/* Formatting helpers. Money is integer cents throughout. */

export const eur = (cents: number, dp?: number) => {
  const d = dp ?? (Math.abs(cents) % 100 === 0 ? 0 : 2);
  const v = Math.abs(cents) / 100;
  const s = v.toLocaleString("en-IE", { minimumFractionDigits: d, maximumFractionDigits: d });
  return (cents < 0 ? "−€" : "€") + s;
};
export const eur2 = (cents: number) => eur(cents, 2);
export const pct = (num: number, den: number, dp = 1) => (den === 0 ? "n/a" : ((num / den) * 100).toFixed(dp) + "%");
export const pctRaw = (v: number, dp = 1) => (v * 100).toFixed(dp) + "%";
export const qty = (n: number, unit: string) => {
  const s = Number.isInteger(n) ? String(n) : n.toFixed(n < 1 ? 2 : 1).replace(/\.0$/, "");
  return s + (unit ? (unit === "each" ? "" : " " + unit) : "");
};
export const qtyU = (n: number, unit: string) => {
  const s = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "").replace(/\.0$/, "");
  return unit === "each" ? s + " each" : s + " " + unit;
};
const SMALL = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
export const words = (n: number) => (n >= 0 && n <= 10 ? SMALL[n] : String(n));
export const plural = (n: number, one: string, many?: string) => n + " " + (n === 1 ? one : many ?? one + "s");

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const dayLabel = (iso: string) => {
  const d = new Date(iso.slice(0, 10) + "T12:00:00Z");
  return DAY[d.getUTCDay()] + " " + d.getUTCDate() + " " + MON[d.getUTCMonth()];
};
export const monthLabel = (ym: string) => MON[parseInt(ym.slice(5, 7), 10) - 1] + " " + ym.slice(0, 4);

/* Time stamps in Europe/Dublin. */
export const stamp = (ts: number) => {
  try {
    const f = new Intl.DateTimeFormat("en-IE", { timeZone: "Europe/Dublin", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
    return f.format(new Date(ts)).replace(",", "");
  } catch {
    return new Date(ts).toISOString().slice(0, 16).replace("T", " ");
  }
};

/* CSV download of exactly the rows given. */
export function downloadCSV(filename: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const body = [header, ...rows].map(r => r.map(esc).join(",")).join("\n");
  try {
    const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch {
    /* the export is a demo convenience; a blocked download is not an error */
  }
  return body;
}
export const centsCSV = (c: number) => (c / 100).toFixed(2);
