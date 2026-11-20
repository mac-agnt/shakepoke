/* Page switch for the Shaka Poké finance-first pages, plus the toast.
   Retired pages from the earlier scope stay in the repo (src/shaka/pages) but
   are not routed: PulseLogic resolves them to a retained area or NotIncluded. */
import { useFin } from "./fin/store";
import RecordDrawer from "./RecordDrawer";
import Invoices from "./fin/pages/Invoices";
import Ingredients from "./fin/pages/Ingredients";
import Money from "./fin/pages/Money";
import Pack from "./fin/pages/Pack";
import Settings from "./fin/pages/Settings";
import NotIncluded from "./fin/pages/NotIncluded";

export function ShakaPage({ v }: { v: any }) {
  switch (v.page) {
    case "Invoices": return <Invoices />;
    case "Ingredients": return <Ingredients />;
    case "Money": return <Money />;
    case "Pack": return <Pack />;
    case "Settings": return <Settings themes={v.themeList} theme={v.theme} setTheme={v.setTheme} />;
    case "NotIncluded": return <NotIncluded from={v.legacyFrom} />;
  }
  return null;
}

export function ShakaOverlays() {
  const s = useFin();
  return (
    <>
      <RecordDrawer />
      {s.ui.toast && (
        <div role="status" aria-live="polite" key={s.ui.toast.n} style={{ position: "fixed", left: "50%", bottom: "28px", zIndex: 95, transform: "translateX(-50%)", padding: "11px 18px", borderRadius: "999px", background: "var(--tooltip)", color: "var(--tooltip-ink)", border: "1px solid var(--border-strong)", boxShadow: "0 16px 40px rgba(0,0,0,.4)", fontSize: "13px", fontFamily: "var(--ui)", animation: "toastIn .3s var(--ease) both", maxWidth: "min(560px,90vw)" }}>
          {s.ui.toast.text}
        </div>
      )}
    </>
  );
}
