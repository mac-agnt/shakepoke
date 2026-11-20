/* The six primary areas and their top-bar tabs, plus where retired pages go. */
import type { State } from "./store";

export const FIN_TABS: Record<string, string[]> = {
  Invoices: ["Needs review", "All invoices", "Staff receipts"],
  Ingredients: ["Spend", "Price changes", "Recipe sheet"],
  Money: ["Overview", "Locations", "Trends"],
  Pack: ["Checklist", "Exports"],
  Settings: ["Organisation", "Users", "Systems", "Scope & pricing", "Experience"],
};
export const PAGE_LABEL: Record<string, string> = {
  Home: "Home", Invoices: "Invoices", Ingredients: "Ingredient Costs", Money: "Money & Reports", Pack: "Accountant Pack", Records: "Records", Settings: "Settings",
};
export const finTab = (s: State, page: string) => s.ui.tabs[page] ?? (FIN_TABS[page] ?? [""])[0];

/* Retired workstreams from the earlier, larger scope. Their code stays in the
   repo, but they are not navigable: some land on the nearest retained area,
   the rest show a short "not in the initial rollout" page. */
export const LEGACY_REDIRECT: Record<string, { page: string; tab?: string; rec?: string }> = {
  Dashboard: { page: "Money", tab: "Overview" },
  Finance: { page: "Invoices", tab: "Needs review" },
  Sales: { page: "Money", tab: "Overview" },
  Purchasing: { page: "Ingredients", tab: "Spend" },
  Activity: { page: "Records", rec: "tables" },
};
export const NOT_INCLUDED: Record<string, { label: string; why: string; nearest: string }> = {
  Stock: { label: "Stock", why: "Stock levels, transfers, waste and prep planning are run well by the shop managers today, so they are not part of phase one.", nearest: "Ingredients" },
  Recipes: { label: "Recipes", why: "Full recipe costing and live bowl margins are outside phase one. Ingredient Costs shows what was bought, from approved invoices.", nearest: "Ingredients" },
  Team: { label: "Team", why: "Rostering, payroll and labour optimisation are outside phase one. Labour cost is entered by the owner each month.", nearest: "Money" },
  Work: { label: "Work", why: "Task boards and multi-step approvals are outside phase one. The only approvals are basic invoice reviews.", nearest: "Invoices" },
  Agents: { label: "Agents", why: "Autonomous agents are not part of this offer. The Home assistant is a read-only helper that explains your figures.", nearest: "Home" },
};
export const ALL_PAGES = ["Home", "Invoices", "Ingredients", "Money", "Pack", "Records", "Settings"];

/* Hash routes, so every area and retired page has a stable deep link. */
export const SLUG: Record<string, string> = {
  Home: "home", Invoices: "invoices", Ingredients: "ingredient-costs", Money: "money", Pack: "accountant-pack", Records: "records", Settings: "settings",
  Dashboard: "dashboard", Finance: "finance", Sales: "sales", Purchasing: "purchasing", Activity: "activity", Stock: "stock", Recipes: "recipes", Team: "team", Work: "work", Agents: "agents",
};
export const pageFromSlug = (slug: string) => Object.keys(SLUG).find(k => SLUG[k] === slug.toLowerCase()) ?? null;
