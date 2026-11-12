import type { State } from "./store";

/* Sub-tabs per page. The top bar renders these through PulseLogic's contextNav. */
export const PAGE_TABS: Record<string, string[]> = {
  Dashboard: ["Owner", "Locations", "Planning"],
  Finance: ["Overview", "Invoice Inbox", "Reconciliation", "P&L", "Accountant Pack"],
  Sales: ["Overview", "Orders", "Channels", "Corporate & Events"],
  Purchasing: ["Overview", "Suppliers", "Purchase Orders", "Ingredient Spend"],
  Stock: ["Overview", "Stock Levels", "Prep", "Transfers", "Waste"],
  Recipes: ["Overview", "Recipes", "Cost Changes"],
  Team: ["Overview", "Roster", "Labour"],
  Work: ["Tasks", "Approvals", "Workflows"],
  Activity: ["All", "Staff", "Agents", "System"],
  Settings: ["Organisation", "Teams", "Permissions", "Systems", "Governance", "AI Controls", "Experience"],
};
export const SHAKA_PAGES = ["Dashboard", "Finance", "Sales", "Purchasing", "Stock", "Recipes", "Team", "Work", "Activity", "Settings"];
export const tabOf = (s: State, page: string) => s.ui.tabs[page] ?? (PAGE_TABS[page] ?? [""])[0];
