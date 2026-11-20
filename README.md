# Shaka Poké · Powered by Pulse (finance-first demo)

A frontend-only demo of the €21,500 + VAT finance-first phase one for Shaka Poké (David McParland):
process bills, see where the money goes, understand ingredient spend and prepare an accountant-ready pack.
Every figure is illustrative demo data, not a claim about the client. No backend, live integrations, OCR,
credentials or real financial actions.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run build
```

## Where things live

| Area | Where |
| --- | --- |
| Seeded dataset: 24 October invoices, 18 ingredients, monthly sales and costs, pricing | `src/shaka/fin/data.ts` |
| Shared state, actions, memoised selectors, CSV exports, Reset | `src/shaka/fin/store.ts` |
| Six areas, top-bar tabs, hash routes, retired-page redirects | `src/shaka/fin/nav.ts` |
| Pages: Invoices, Ingredient Costs, Money & Reports, Accountant Pack, Settings, Records › Tables | `src/shaka/fin/pages/` |
| Home chat answers (deterministic, read shared state) | `src/shaka/fin/answers.ts` |
| Shell, Home chat, Records, Ontology (original Pulse views) | `src/views/` |
| Pulse state and behaviour | `src/logic/PulseLogic.js` |
| Rail, ontology labels, files, contacts | `src/logic/data.js` |

Pages from the earlier, larger scope (`src/shaka/pages/`, `src/shaka/store.ts`, `src/shaka/model.ts`) stay in the repo
but are not routed. Visiting `#/dashboard`, `#/finance`, `#/sales`, `#/purchasing` or `#/activity` redirects to the nearest
retained area; `#/stock`, `#/recipes`, `#/team`, `#/work` and `#/agents` show a short "not included in the initial rollout" page.

Read `CLAUDE.md` before customising: Home first in the rail, Ontology first in Records, the Home centre stays clean.

## Updating from Claude Design

`npm run import-design` overwrites `src/views/`, `src/styles/` and `src/logic/`. Do not run it on this customised copy.
The source design file in `design/` is the original template and still contains template sample content; it is not bundled into the app.
