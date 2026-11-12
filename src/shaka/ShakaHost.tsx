/* Page switch for the Shaka Poké pages, plus the global drawer and toast. */
import { useShaka } from "./store";
import RecordDrawer from "./RecordDrawer";
import Dashboard from "./pages/Dashboard";
import Finance from "./pages/Finance";
import Sales from "./pages/Sales";
import Purchasing from "./pages/Purchasing";
import Stock from "./pages/Stock";
import Recipes from "./pages/Recipes";
import Team from "./pages/Team";
import Work from "./pages/Work";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";

export function ShakaPage({ v }: { v: any }) {
  switch (v.page) {
    case "Dashboard": return <Dashboard />;
    case "Finance": return <Finance />;
    case "Sales": return <Sales />;
    case "Purchasing": return <Purchasing />;
    case "Stock": return <Stock />;
    case "Recipes": return <Recipes />;
    case "Team": return <Team />;
    case "Work": return <Work />;
    case "Activity": return <Activity />;
    case "Settings": return <Settings themes={v.themeList} theme={v.theme} setTheme={v.setTheme} />;
  }
  return null;
}

export function ShakaOverlays() {
  const s = useShaka();
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
