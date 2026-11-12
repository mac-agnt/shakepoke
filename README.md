# Shaka Poké · Powered by Pulse (demo)

A frontend-only operating platform demo for Shaka Poké (David McParland), built on the Pulse v5 Harbour template.
Every financial figure, employee, invoice and forecast is an illustrative demo assumption, not a claim about the client.
No backend, live integrations, credentials or real financial actions.

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
| Shared dataset (orders, purchases, timesheets, invoices, recipes, stock) | `src/shaka/model.ts` |
| Shared state, actions, selectors, activity log, Reset Demo | `src/shaka/store.ts` |
| Pages: Dashboard, Finance, Sales, Purchasing, Stock, Recipes, Team, Work, Activity, Settings, Records › Tables | `src/shaka/pages/` |
| One record drawer used everywhere | `src/shaka/RecordDrawer.tsx` |
| Home chat answers (read shared state) | `src/shaka/answers.ts` |
| Shell, Home chat, Agents, Records, Ontology (original Pulse views) | `src/views/` |
| Pulse state and behaviour | `src/logic/PulseLogic.js` |
| Navigation, agents, ontology labels | `src/logic/data.js` |

Read `CLAUDE.md` before customising: Agents stays under Home, Ontology stays first in Records, the Home centre stays clean.

## Updating from Claude Design

`npm run import-design` overwrites `src/views/`, `src/styles/` and `src/logic/`. Do not run it on this customised copy.
The source design file in `design/` is the original template and still contains template sample content; it is not bundled into the app.
