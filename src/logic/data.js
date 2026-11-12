/* Demo data and pure helpers for the Pulse prototype (Shaka Poké demo). Every figure is an illustrative demo assumption. */

const INK="var(--ink)", BODY="var(--body)", DIM="var(--dim)", FAINT="var(--faint)";
const LIME="var(--accent)", GREEN="var(--ok)", AMBER="var(--warn)", RED="var(--bad)", NEUTRAL="var(--neutral)";
const MONO="var(--mono)";

const ICONS = {
  navHome:"M12 3.2 3.6 9.1v10a1.5 1.5 0 0 0 1.5 1.5h13.8a1.5 1.5 0 0 0 1.5-1.5v-10L12 3.2Z M8.9 13.1h2l1-2.6 1.5 5 1.1-2.4h1.6",
  navAgents:"M12 2.4v2.3 M12 2.4a.9.9 0 1 0 0-.02 M8.2 6.5h7.6A2.2 2.2 0 0 1 18 8.7v5.1a2.2 2.2 0 0 1-2.2 2.2H8.2A2.2 2.2 0 0 1 6 13.8V8.7a2.2 2.2 0 0 1 2.2-2.2Z M9.9 10.6v1.4 M14.1 10.6v1.4 M6 10h-1.9 M18 10h1.9 M9.2 18.6h5.6 M9.2 21.2h5.6",
  navDash:"M4 5.6h7.2v5.1H4V5.6Z M13.6 5.6H20v8.6h-6.4V5.6Z M4 13.1h7.2v5.3H4v-5.3Z M13.6 16.6H20v1.8h-6.4v-1.8Z",
  navWork:"M9.4 4.4h5.2a1.4 1.4 0 0 1 1.4 1.4v1.1h2.4A1.6 1.6 0 0 1 20 8.5v9.1a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.6V8.5a1.6 1.6 0 0 1 1.6-1.6H8V5.8a1.4 1.4 0 0 1 1.4-1.4Z M8 6.9h8 M9.6 13.3l1.8 1.8 3.4-3.6",
  navRecords:"M12 3.6c3.9 0 7 1.1 7 2.5S15.9 8.6 12 8.6 5 7.5 5 6.1 8.1 3.6 12 3.6Z M5 6.1v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6.1 M5 11.8v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5.7",
  navActivity:"M4.6 4.6h14.8A1.6 1.6 0 0 1 21 6.2v11.6a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 17.8V6.2a1.6 1.6 0 0 1 1.6-1.6Z M6 12.4h2.2l1.5-4.1 2.3 8 1.9-5.4 1.2 1.5H18",
  navAdmin:"M12 2.9 5 5.6v5.9c0 4 2.8 7.1 7 8.6 4.2-1.5 7-4.6 7-8.6V5.6L12 2.9Z M12 8.6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z M8.8 16.3a3.6 3.6 0 0 1 6.4 0",
  helios:"M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4-.8L3 21l1.9-4.9A8.3 8.3 0 0 1 4 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z M8 12h1.6l1.2-2.6 1.6 5 1.4-2.4H16",
  inbox:"M3 13h4l1.5 3h7l1.5-3h4 M3 13l2.4-7A2 2 0 0 1 7.3 4.6h9.4a2 2 0 0 1 1.9 1.4L21 13v4.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13Z",
  work:"M6 4.6h12a1.6 1.6 0 0 1 1.6 1.6v12.2A1.6 1.6 0 0 1 18 20H6a1.6 1.6 0 0 1-1.6-1.6V6.2A1.6 1.6 0 0 1 6 4.6Z M8.4 10.4l1.9 1.9 3.9-3.9 M8.4 15.6h7.2",
  approvals:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  insights:"M4.5 19.5V13 M9.7 19.5V7.5 M14.9 19.5v-8 M20 19.5V5",
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  orgs:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5 M7.5 15.5h2.5",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  locations:"M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
  visits:"M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z M9 13.5l1.6 1.6 3.4-3.4",
  autos:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  agents:"M8.5 3.6h7A2.4 2.4 0 0 1 17.9 6v5.6a2.4 2.4 0 0 1-2.4 2.4h-7A2.4 2.4 0 0 1 6.1 11.6V6a2.4 2.4 0 0 1 2.4-2.4Z M9.6 8.2h.01 M14.4 8.2h.01 M12 14v2.6 M7.6 20.4h8.8 M12 16.6c-2.4 0-4.4 1.7-4.4 3.8h8.8c0-2.1-2-3.8-4.4-3.8Z",
  dash:"M4.4 4.4h6v6h-6v-6Z M13.6 4.4h6v3.6h-6V4.4Z M13.6 11.6h6v8h-6v-8Z M4.4 14h6v5.6h-6V14Z",
  files:"M5 7.2a1.8 1.8 0 0 1 1.8-1.8h3l1.8 2.2h5.6A1.8 1.8 0 0 1 19 9.4v7.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 16.8V7.2Z",
  pulseLine:"M2.5 12.5h3.6l2.1-6.4 3.2 12.2 2.6-8.4 1.8 2.6h5.7",
  records:"M6.4 3.6h7.4l4.2 4.2v12.6H6.4V3.6Z M13.4 3.8v4.2h4.2 M9 12.4h6 M9 16h4",
  tree:"M4.5 6h5 M4.5 12h5 M4.5 18h5 M12.5 6h7 M12.5 12h7 M12.5 18h7",
  graph:"M7 7.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M17.6 10.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M9.4 21.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M8.6 6.4l7.6 2.6 M15.8 11.4l-5.6 5.2",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0",
  navFinance:"M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4v-17Z M9 8h6 M9 11.5h6 M9 15h3.5",
  navSales:"M4 19.5h16 M5.5 15.5l4-4.5 3.2 2.8 5.8-6.6 M14.5 7.2h4v4",
  navPurchasing:"M3.5 5h2.2l2 10.2h10.1l1.8-7.4H7 M9.4 19.6a.9.9 0 1 0 0-.02 M16.6 19.6a.9.9 0 1 0 0-.02",
  navStock:"M12 3.6 19.6 7.6v8.8L12 20.4 4.4 16.4V7.6L12 3.6Z M4.4 7.6 12 11.6l7.6-4 M12 11.6v8.8",
  navRecipes:"M3.6 11.5h16.8a8.4 8.4 0 0 1-16.8 0Z M8 19.4h8 M9.2 8.4c.4-1.6 1.6-2.6 2.8-2.6s2.4 1 2.8 2.6 M12 5.8V3.6",
  navTeam:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2"
};

/* Ontology stays first and is never removed (PulseLogic enforces this too). */
const REC_SECTIONS = [
  {id:"ontology", label:"Ontology", blurb:"How every record connects: suppliers, invoices, ingredients, recipes, orders, channels and settlements."},
  {id:"files", label:"Files", blurb:"Supplier invoices, receipt photos, the recipe sheet and finance packs (demo documents)."},
  {id:"contacts", label:"Contacts", blurb:"Sample staff and supplier contacts. Names other than David are fictional; emails are mock labels."},
  {id:"tables", label:"Tables", blurb:"Every shared record type as a table, with the relationship paths the Ontology draws."}
];

const CONTACTS = [
  ["David McParland","Owner","david@shakapoke.ie (mock)","Shaka Poké","owner","#46C8F0"],
  ["Aoife Byrne","Baggot Street Manager","aoife@shakapoke.ie (mock)","Shaka Poké","staff","#A9E5FF"],
  ["Conor Walsh","Blackrock Manager","conor@shakapoke.ie (mock)","Shaka Poké","staff","#e6c78a"],
  ["Sofia Costa","Prep Lead","sofia@shakapoke.ie (mock)","Shaka Poké","staff","#7fd8a4"],
  ["Lucas Silva","Kitchen Team","lucas@shakapoke.ie (mock)","Shaka Poké","staff","#c8b4f0"],
  ["Emma Kelly","Front of House","emma@shakapoke.ie (mock)","Shaka Poké","staff","#f07a9d"],
  ["Niamh Doyle","Weekend Team","niamh@shakapoke.ie (mock)","Shaka Poké","staff","#e6c78a"],
  ["Jack Murphy","Events Team","jack@shakapoke.ie (mock)","Shaka Poké","staff","#9fd6f0"],
  ["Orders desk","Supplier contact","orders@caterway (mock label)","Caterway","supplier","#c8b4f0"],
  ["Sales desk","Supplier contact","sales@harbourfresh (mock label)","Harbour Fresh Fish","supplier","#9fd6f0"],
  ["Accounts","Supplier contact","accounts@greenbasket (mock label)","Green Basket Produce","supplier","#a8e0c0"]
];

const FILE_TREE = [
  {type:"folder", id:"f-sup", name:"Supplier invoices", depth:0},
  {type:"file", id:"fl-1", name:"INV-AVO-118, Green Basket Produce.pdf", depth:1, parent:"f-sup", indexed:true,
   path:"Supplier invoices / Green Basket Produce", title:"INV-AVO-118, Green Basket Produce",
   facts:[["TYPE","PDF · 1 page (demo)"],["RECEIVED","11 Nov 2026"],["INDEXED","Yes"],["OWNER","David McParland"]],
   body:["One line: 100 avocados at €1.32, €132 before any demo tax. October deliveries were billed at €1.10.",
     "The Ingredient Cost Agent raised CC-AVO-118 from this line. Approving it updates the November recipe valuation only."],
   links:[["Green Basket Produce","supplier"],["Avocado","ingredient"],["CC-AVO-118","cost change"]]},
  {type:"file", id:"fl-2", name:"INV-HFF-2231, Harbour Fresh Fish.pdf", depth:1, parent:"f-sup", indexed:true,
   path:"Supplier invoices / Harbour Fresh Fish", title:"INV-HFF-2231, Harbour Fresh Fish",
   facts:[["TYPE","PDF · 1 page (demo)"],["RECEIVED","11 Nov 2026"],["INDEXED","Yes"],["OWNER","David McParland"]],
   body:["Salmon line extracted as 1.2 box; the delivery note says 12 kg. Held for review in FIN-112.",
     "Correcting the quantity and unit, then marking reviewed, moves it into the ready count."],
   links:[["Harbour Fresh Fish","supplier"],["Salmon","ingredient"],["FIN-112","invoice batch"]]},
  {type:"folder", id:"f-rcp", name:"Recipes", depth:0},
  {type:"file", id:"fl-3", name:"Bowl costing sheet (Excel import preview).xlsx", depth:1, parent:"f-rcp", indexed:false,
   path:"Recipes / Costing", title:"Bowl costing sheet",
   facts:[["TYPE","XLSX · demo preview"],["VERSION","1 April 2026"],["INDEXED","Mapped, not indexed"],["OWNER","David McParland"]],
   body:["The spreadsheet that bowl costing lived in. Four recipes were mapped to ingredient units in the import preview.",
     "Recipe versions in Pulse keep October valued at version 1, whatever changes later."],
   links:[["Salmon bowl","recipe"],["Chicken bowl","recipe"]]},
  {type:"folder", id:"f-fin", name:"Finance", depth:0},
  {type:"file", id:"fl-4", name:"October P&L by location (demo).csv", depth:1, parent:"f-fin", indexed:true,
   path:"Finance / Management packs", title:"October P&L by location",
   facts:[["TYPE","CSV · generated"],["PERIOD","1 to 31 Oct 2026"],["INDEXED","Yes"],["OWNER","David McParland"]],
   body:["Net sales €80,000, expenses €72,400, estimated operating profit €7,600 across Baggot Street, Blackrock and the dormant truck.",
     "Estimated operating profit, not statutory net profit: no debt, tax or depreciation assumptions."],
   links:[["Baggot Street","location"],["Blackrock","location"]]},
  {type:"file", id:"fl-5", name:"Backfill April to September (demo).csv", depth:1, parent:"f-fin", indexed:false,
   path:"Finance / Accountant pack", title:"Backfill April to September",
   facts:[["TYPE","CSV · generated"],["DOCUMENTS","240"],["INDEXED","Not indexed"],["OWNER","David McParland"]],
   body:["216 of 240 historical documents matched, 18 missing receipts and 6 ambiguous allocations.",
     "Tax treatment stays draft until the accountant confirms it."],
   links:[["Accountant pack","finance"]]},
  {type:"folder", id:"f-ops", name:"Operations", depth:0},
  {type:"file", id:"fl-6", name:"TRF-1113 transfer sheet.pdf", depth:1, parent:"f-ops", indexed:true,
   path:"Operations / Transfers", title:"TRF-1113 transfer sheet",
   facts:[["TYPE","PDF · generated"],["SCHEDULED","Fri 13 Nov 15:30"],["INDEXED","Yes"],["OWNER","Aoife Byrne"]],
   body:["2 kg salmon and 3 kg pineapple salsa from Baggot Street to Blackrock, €66 carrying value.",
     "Replaces the WhatsApp hand-off locally. Pulse does not read or send WhatsApp messages."],
   links:[["Baggot Street","location"],["Blackrock","location"]]}
];

const ONTO_NODES = [
  ["Ingredient","entity",500,300,1,"The unit of cost: every invoice line and every recipe line resolves to one."],
  ["Supplier","entity",300,190,1,"Who sells it. Caterway, Harbour Fresh Fish, Green Basket Produce, Tesco top-ups."],
  ["Recipe","entity",700,190,1,"Versioned bowls. October keeps its version when costs change."],
  ["Staff","entity",250,430,1,"Sample team members, scoped to a site by role."],
  ["Order","entity",690,430,1,"One deduplicated row per sale, with Square and original channel IDs."],
  ["Settlement","ledger",850,320,0,"Marketplace payouts matched to bank receipts."],
  ["Invoice","ledger",390,95,0,"Supplier documents in the inbox, extracted line by line."],
  ["Invoice line","ledger",620,95,0,"Quantity, unit and price, mapped to an ingredient."],
  ["Channel","module",860,470,0,"In-store, marketplaces, corporate and surplus."],
  ["Transfer","entity",140,300,0,"Stock moved between sites; never a purchase or a sale."],
  ["supplies","predicate",395,240,0,"Supplier → Ingredient."],
  ["used in","predicate",605,240,0,"Ingredient → Recipe."],
  ["works at","predicate",360,370,0,"Staff → Location."],
  ["sold as","predicate",600,370,0,"Recipe → Order line."],
  ["moves","predicate",140,372,0,"Transfer → stock items."]
];

const ONTO_EDGES = [
  [500,300,300,190],[500,300,700,190],[500,300,250,430],[500,300,690,430],
  [500,300,850,320],[500,300,390,95],[500,300,620,95],[500,300,140,300],
  [300,190,250,430],[700,190,860,470],[690,430,850,320],[690,430,860,470],
  [300,190,140,300],[390,95,620,95]
];


const REC_TEMPLATES = [
  ["Field sheet","Records","Labelled fields in a grid — the default for a person, organisation or location.",
   "M5 5.5h14v13H5v-13Z M5 10h14 M12 10v8.5","grid"],
  ["Contact card","Records","A portrait, key fields and every linked record in one compact panel.",
   "M12 11.5a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z M5.5 19c.8-3 3.3-4.7 6.5-4.7s5.7 1.7 6.5 4.7","card"],
  ["Directory","Records","A sortable table of many records at once, built for lists.",
   "M4.5 6.5h15 M4.5 12h15 M4.5 17.5h15 M4.5 6.5h.01 M4.5 12h.01 M4.5 17.5h.01","rows"],
  ["Timeline","Case work","Ordered events with who did what and when. Good for a case or a claim.",
   "M12 3.5v17 M12 7.5h6 M12 13h-6 M12 18h6","timeline"],
  ["Kanban board","Case work","Cards in columns by status. For anything that moves through stages.",
   "M5 5h4.5v14H5V5Z M9.75 5h4.5v9h-4.5V5Z M14.5 5H19v6h-4.5V5Z","kanban"],
  ["Checklist","Case work","Ticked steps in order, with an owner and a due date on each.",
   "M5 6.5h2l1.4 1.4L11 5.5 M5 12.5h2l1.4 1.4 2.6-2.4 M5 18.5h2l1.4 1.4 2.6-2.4 M15 6.5h4 M15 12.5h4 M15 18.5h4","checklist"],
  ["Ledger","Finance","Rows and running totals. For anything with amounts and dates.",
   "M4 6h16 M4 12h16 M4 18h16 M9 3.5v17","ledger"],
  ["Invoice","Finance","Line items, totals and a status — built to be sent, not just stored.",
   "M7 3.5h10v17H7v-17Z M9.5 8h5 M9.5 11.5h5 M9.5 15h3","invoice"],
  ["Document","Notes","Long-form text with linked records pulled out down the side.",
   "M7 3.5h7l5 5v12H7v-17Z M14 3.7v5h5 M10 13h6 M10 16.5h4","document"],
  ["Gallery","Notes","A wall of images and files with a caption on each — for a site or a job.",
   "M4.5 6h6v6h-6V6Z M13.5 6h6v6h-6V6Z M4.5 14h6v4h-6v-4Z M13.5 14h6v4h-6v-4Z","gallery"],
  ["Map & locations","Ops","A pinboard of places, with the record's fields beside each pin.",
   "M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z","map"],
  ["Schedule","Ops","A calendar of bookings against this record, with recurring rules.",
   "M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z","schedule"]
];
const REC_TEMPLATE_CATS = ["All","Records","Case work","Finance","Notes","Ops"];

/* ---- admin hub: sample users (fictional except David) ---- */
const PEOPLE = [
  ["David McParland","Owner","david@shakapoke.ie (mock)","All sites","active","Admin","Today"],
  ["Aoife Byrne","Baggot Street Manager","aoife@shakapoke.ie (mock)","Baggot Street","active","Manager","Today"],
  ["Conor Walsh","Blackrock Manager","conor@shakapoke.ie (mock)","Blackrock","active","Manager","Today"],
  ["Sofia Costa","Prep Lead","sofia@shakapoke.ie (mock)","Baggot Street","active","Standard","Today"],
  ["Lucas Silva","Kitchen Team","lucas@shakapoke.ie (mock)","Baggot Street","active","Standard","Yesterday"],
  ["Emma Kelly","Front of House","emma@shakapoke.ie (mock)","Blackrock","active","Standard","Today"]
];
const ROLE_LEVELS = ["Admin","Manager","Standard","External"];
const PERM_KEYS = [["view","View records"],["edit","Edit records"],["approve","Approve decisions"]];
const GRANT_DEFS = [
  ["view","View records","Read anything in scope"],
  ["edit","Edit records","Create and change records"],
  ["approve","Approve decisions","Say yes to parked work"],
  ["pay","Release payments","Never available in this demo"],
  ["export","Export data","Download and share out"],
  ["agents","Manage agents","Create and grant agents"],
  ["settings","Change settings","Integrations and roles"],
  ["audit","Read the audit log","Every action, everyone"]
];
const ROLE_SCOPES = ["All sites","Their site","Prep only"];
const DEFAULT_PERMS = {Admin:{view:true,edit:true,approve:true}, Manager:{view:true,edit:true,approve:true},
  Standard:{view:true,edit:true,approve:false}, External:{view:true,edit:false,approve:false}};
const INTEGRATIONS = [
  {name:"Square POS", blurb:"Sales and order source. Demo import, simulated and read-only.", tint:"#46C8F0", status:"demo import", statusKind:"warn",
   glyph:"M5 5h14v14H5V5Z M9 9h6v6H9V9Z", lastSync:"12 Nov 06:00 (simulated)", usage:"October orders", auth:"Not connected", scopes:["Read"]},
  {name:"Square Teams", blurb:"Shifts and rosters. Demo import, simulated and read-only.", tint:"#A9E5FF", status:"demo import", statusKind:"warn",
   glyph:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4", lastSync:"12 Nov 06:00 (simulated)", usage:"Week roster", auth:"Not connected", scopes:["Read"]},
  {name:"Xero", blurb:"Accounting destination. Reviewed draft exports only; nothing is posted.", tint:"#13b5ea", status:"draft export", statusKind:"off",
   glyph:"M4.5 12a7.5 7.5 0 0 1 12.8-5.3 M19.5 12a7.5 7.5 0 0 1-12.8 5.3", lastSync:"No posting", usage:"Draft CSV", auth:"Not connected", scopes:[]},
  {name:"WhatsApp", blurb:"Current transfer coordination, shown for context. Not connected; no chats read or sent.", tint:"#25d366", status:"not connected", statusKind:"off",
   glyph:"M4 19.5 5.3 15A7.7 7.7 0 1 1 8.6 18.2L4 19.5Z", lastSync:"Never", usage:"None", auth:"None", scopes:[]}
];


/* Background catalogue. Each entry is pure CSS so a tile is the real thing at
   thumbnail size, not a picture of it. */
const BG_DEFS = [
  {id:"bloom", name:"Bloom", cat:"Signature",
   css:"background:radial-gradient(60% 48% at 50% 34%, var(--accent-faint), transparent 72%), radial-gradient(44% 38% at 16% 84%, rgba(255,255,255,.05), transparent 70%)",
   thumb:"background:radial-gradient(62% 58% at 46% 34%, var(--accent-soft), transparent 74%), radial-gradient(50% 46% at 82% 84%, rgba(255,255,255,.08), transparent 72%), var(--surface-2)"},
  {id:"mist", name:"Mist", cat:"Signature",
   css:"background:radial-gradient(52% 44% at 24% 22%, rgba(255,255,255,.07), transparent 70%), radial-gradient(56% 46% at 80% 76%, rgba(255,255,255,.05), transparent 72%)",
   thumb:"background:radial-gradient(58% 52% at 24% 22%, rgba(255,255,255,.16), transparent 72%), radial-gradient(60% 54% at 82% 78%, rgba(255,255,255,.10), transparent 74%), var(--surface-2)"},
  {id:"grid", name:"Grid", cat:"Signature",
   css:"background-image:linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px);background-size:56px 56px;mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%);-webkit-mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%)",
   thumb:"background-color:var(--surface-2);background-image:linear-gradient(var(--border-strong) 1px, transparent 1px),linear-gradient(90deg, var(--border-strong) 1px, transparent 1px);background-size:14px 14px"},
  {id:"none", name:"None", cat:"Signature", css:"", thumb:"background:var(--surface-2)"},

  {id:"aurora", name:"Aurora", cat:"Gradient",
   css:"background:radial-gradient(70% 52% at 18% 8%, var(--bloom-a), transparent 66%), radial-gradient(64% 48% at 84% 22%, var(--bloom-b), transparent 68%), radial-gradient(70% 60% at 50% 104%, var(--bloom-c), transparent 70%);filter:blur(24px)",
   thumb:"background:radial-gradient(72% 60% at 16% 6%, var(--bloom-a), transparent 68%), radial-gradient(66% 54% at 86% 24%, var(--bloom-b), transparent 70%), radial-gradient(74% 66% at 50% 108%, var(--bloom-c), transparent 72%), var(--surface-2)"},
  {id:"horizon", name:"Horizon", cat:"Gradient",
   css:"background:linear-gradient(180deg, transparent 0%, var(--accent-faint) 58%, transparent 100%), radial-gradient(90% 40% at 50% 72%, var(--accent-soft), transparent 70%)",
   thumb:"background:linear-gradient(180deg, var(--surface-2) 0%, var(--accent-faint) 58%, var(--surface-2) 100%), radial-gradient(90% 44% at 50% 74%, var(--accent-soft), transparent 70%)"},
  {id:"dusk", name:"Dusk", cat:"Gradient",
   css:"background:linear-gradient(200deg, var(--bloom-c) -10%, transparent 46%), linear-gradient(20deg, var(--bloom-b) -10%, transparent 52%);opacity:.5",
   thumb:"background:linear-gradient(200deg, var(--bloom-c) -12%, transparent 48%), linear-gradient(20deg, var(--bloom-b) -12%, transparent 54%), var(--surface-2)"},
  {id:"ember", name:"Ember", cat:"Gradient",
   css:"background:radial-gradient(60% 70% at 84% 96%, var(--bloom-a), transparent 64%), radial-gradient(50% 60% at 10% 96%, var(--bloom-c), transparent 66%)",
   thumb:"background:radial-gradient(64% 76% at 84% 100%, var(--bloom-a), transparent 66%), radial-gradient(54% 66% at 8% 100%, var(--bloom-c), transparent 68%), var(--surface-2)"},

  {id:"mesh", name:"Mesh", cat:"Abstract",
   css:"background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:22px 22px;mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%);-webkit-mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%)",
   thumb:"background-color:var(--surface-2);background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:8px 8px"},
  {id:"contour", name:"Contour", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 30% 110%, transparent 0 22px, var(--border) 22px 23px);mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%);-webkit-mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%)",
   thumb:"background:repeating-radial-gradient(circle at 26% 116%, var(--surface-2) 0 9px, var(--border-strong) 9px 10px)"},
  {id:"weave", name:"Weave", cat:"Abstract",
   css:"background:repeating-linear-gradient(48deg, transparent 0 16px, var(--border) 16px 17px), repeating-linear-gradient(-48deg, transparent 0 16px, var(--border) 16px 17px);opacity:.7",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(48deg, transparent 0 7px, var(--border-strong) 7px 8px), repeating-linear-gradient(-48deg, transparent 0 7px, var(--border-strong) 7px 8px)"},
  {id:"halo", name:"Halo", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 50% 50%, transparent 0 46px, var(--accent-line) 46px 47px);mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%);-webkit-mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%)",
   thumb:"background:repeating-radial-gradient(circle at 50% 50%, var(--surface-2) 0 11px, var(--accent-line) 11px 12px)"},
  {id:"drift", name:"Drift", cat:"Abstract",
   css:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%);filter:blur(30px);opacity:.6",
   thumb:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%), var(--surface-2)"},
  {id:"scan", name:"Scanlines", cat:"Abstract",
   css:"background:repeating-linear-gradient(0deg, var(--border) 0 1px, transparent 1px 7px);mask-image:linear-gradient(180deg, #000, transparent 88%);-webkit-mask-image:linear-gradient(180deg, #000, transparent 88%)",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(0deg, var(--border-strong) 0 1px, transparent 1px 5px)"}
];

const THEMES = [
  {id:"dark", label:"Dark", group:"Dark", bg:"#0b0c0b", surface:"#1a1c19", ink:"#f2f3ef", accent:"#c8f04b"},
  {id:"indigo", label:"Indigo", group:"Dark", bg:"#0a0b13", surface:"#1a1b26", ink:"#f0f1fa", accent:"#8b93ff"},
  {id:"slate", label:"Slate", group:"Dark", bg:"#100e0c", surface:"#211c17", ink:"#f4f0ea", accent:"#e8a14a"},
  {id:"plum", label:"Plum", group:"Dark", bg:"#100a10", surface:"#20151f", ink:"#f6eef4", accent:"#f077b0"},
  {id:"ember", label:"Ember", group:"Dark", bg:"#0b0b0b", surface:"#1c1714", ink:"#f7f3ef", accent:"#f4561a"},
  {id:"harbour", label:"Shaka (default)", group:"Dark", bg:"#0b0e10", surface:"#13171a", ink:"#f3f5f4", accent:"#46C8F0"},
  {id:"cargo", label:"Cargo", group:"Dark", bg:"#0a0a0a", surface:"#1a1c1a", ink:"#f2f5f2", accent:"#4ade80"},
  {id:"ocean", label:"Ocean", group:"Dark", bg:"#080e12", surface:"#141f25", ink:"#eaf4f8", accent:"#4fd4d0"},
  {id:"graphite", label:"Graphite", group:"Dark", bg:"#111112", surface:"#212124", ink:"#f4f4f5", accent:"#f4f4f5"},
  {id:"light", label:"Shaka light", group:"Light", bg:"#f4f6f8", surface:"#ffffff", ink:"#16181c", accent:"#0854A0"},
  {id:"warm", label:"Warm paper", group:"Light", bg:"#faf5ec", surface:"#fffdf9", ink:"#2a2016", accent:"#c9683f"},
  {id:"mist", label:"Mist", group:"Light", bg:"#eef1f4", surface:"#ffffff", ink:"#141e20", accent:"#0e9f6e"},
  {id:"sand", label:"Sand", group:"Light", bg:"#f6f1e6", surface:"#fffdf7", ink:"#221d12", accent:"#7d5fd6"}
];

const ADMIN_ICONS = {
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  structure:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5",
  shield:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  agent:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5",
  flow:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  plug:"M9 3.5v5 M15 3.5v5 M6.5 8.5h11v3a5.5 5.5 0 0 1-11 0v-3Z M12 17v3.5",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  lock:"M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5Z M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3",
  audit:"M8 3.5h8l3.5 3.5v13a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 6 3.5h2Z M9 12h6 M9 16h4",
  brand:"M12 3.5 14.6 9l6.4.6-4.8 4.2 1.4 6.2-5.6-3.3-5.6 3.3 1.4-6.2L3 9.6 9.4 9 12 3.5Z",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0",
  data:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"
};

const ADMIN_CARDS = [
  {id:"people", group:"ORGANISATION", title:"People & access", icon:"people", tint:"#46C8F0",
   blurb:"Sample users for the demo. Not a confirmed headcount.",
   tags:["8 sample users","5 departments","2 shops"], footer:"Names other than David are fictional", action:"Open Team",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Sample users","8"],["Departments","Management, Finance, Store Operations, Kitchen, Events"],["Sites","Baggot Street · Blackrock · Food Truck"]]},
  {id:"teams", group:"ORGANISATION", title:"Roles & permissions", icon:"shield", tint:"var(--accent)",
   blurb:"Simulated scopes: David all access, managers their site, kitchen prep only.",
   tags:["3 scopes","UI simulation"], listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Owner","All access"],["Store managers","Own site"],["Kitchen","Prep only"]]},
  {id:"agents", group:"CONTROL", title:"Agents & AI controls", icon:"agent", tint:"var(--accent)",
   blurb:"Every agent run is simulated and every change waits for a person.",
   tags:["8 agents","Simulated"], listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Human review for record changes","", true],["Show sources on findings","", true]]},
  {id:"integrations", group:"SYSTEMS", title:"Systems", icon:"plug", tint:"#46C8F0",
   blurb:"Demo imports and draft exports only. No live connections.",
   tags:["Square","Stream (to confirm)","Xero draft"], listLabel:"SOURCES",
   rows:[["Square POS","demo import"],["Square Teams","demo import"],["Xero","draft export"],["WhatsApp","not connected"]]},
  {id:"audit", group:"GOVERNANCE", title:"Audit log", icon:"audit", tint:"#9d8cf5",
   blurb:"Every decision is written to Activity with the person who made it.",
   tags:["Session log"], listLabel:"WHAT IS RECORDED",
   rows:[["Invoice reviews",""],["Cost approvals",""],["Transfers",""],["Agent runs",""]]},
  {id:"appearance", group:"EXPERIENCE", title:"Appearance & themes", icon:"brand", tint:"#46C8F0",
   blurb:"Pick a light or dark theme for how Pulse looks to you.",
   tags:["Shaka blues"], listLabel:"THEMES", rows:[]}
];

const ADMIN_GROUPS = [
  ["ORGANISATION", "repeat(3,1fr)"],
  ["CONTROL", "repeat(3,1fr)"],
  ["SYSTEMS", "repeat(3,1fr)"],
  ["GOVERNANCE", "repeat(3,1fr)"],
  ["EXPERIENCE", "repeat(3,1fr)"]
];


/* ---- activity feeds (legacy stream view; the Activity page reads the shared store) ---- */
const SRC_TINT = {Square:"#46C8F0", Pulse:"var(--accent)", Agent:"var(--accent)", Documents:"#A9E5FF", Bank:"#8fa6ff"};
const SRC_ABBR = {Square:"SQ", Pulse:"PL", Agent:"AI", Documents:"DC", Bank:"BK"};

const DATA_EVENTS = [
  ["Demo import: October orders","October sales read from Square (simulated, read-only).","Square POS","Both shops","Square","completed"],
  ["Invoice extracted","INV-AVO-118: 100 avocados at €1.32.","Finance Agent","Green Basket Produce","Documents","completed"],
  ["Demo import: roster","Week of 9 to 15 November from Square Teams (simulated).","Square Teams","Both shops","Square","completed"]
];
const PEOPLE_EVENTS = [
  ["Aoife logged waste","3.2 kg cooked rice overproduction at close.","Aoife Byrne","Baggot Street","Pulse","completed"],
  ["Conor recorded a partial delivery","Spinach 7 kg of 10 kg on PO-2040.","Conor Walsh","Blackrock","Pulse","completed"]
];
const AI_EVENTS = [
  ["Settlement gap detected","SET-DEL-1106 expected €1,260, received €1,134. Investigate.","Channel Margin Agent","Deliveroo","Agent","awaiting"],
  ["Cost alert raised","Avocado +20%: salmon bowl €3.60 to €3.71.","Ingredient Cost Agent","Recipes","Agent","awaiting"],
  ["Prep plan drafted","COR-1113: 48 bowls, dietary note sent for review.","Prep Planner","Baggot Street","Agent","working"]
];

const STREAM_DEFS = [
  {id:"data", title:"New data", sub:"Demo imports and documents", pool:DATA_EVENTS, every:9000000,
   tint:"#46C8F0", icon:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9"},
  {id:"people", title:"Staff activity", sub:"Decisions people made", pool:PEOPLE_EVENTS, every:9000000,
   tint:"#f0c04b", icon:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9"},
  {id:"ai", title:"Agent activity", sub:"Simulated agent runs", pool:AI_EVENTS, every:9000000,
   tint:"var(--accent)", icon:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5"}
];


const NAV = [
  {label:"Home", icon:"helios", page:"Home"},
  {label:"Agents", icon:"navAgents", page:"Agents"},
  {label:"Dashboard", icon:"navDash", page:"Dashboard"},
  {label:"Finance", icon:"navFinance", page:"Finance", dot:true},
  {label:"Sales", icon:"navSales", page:"Sales"},
  {label:"Purchasing", icon:"navPurchasing", page:"Purchasing"},
  {label:"Stock", icon:"navStock", page:"Stock"},
  {label:"Recipes", icon:"navRecipes", page:"Recipes"},
  {label:"Team", icon:"navTeam", page:"Team"},
  {label:"Work", icon:"navWork", page:"Work", dot:true},
  {label:"Records", icon:"navRecords", page:"Records"},
  {label:"Activity", icon:"pulseLine", page:"Activity"}
];

/* Inbox items, keyed to the attention ids the shared store produces. */
const ITEMS = {
  fin:{kind:"Approval", importance:"high", icon:ICONS.approvals, age:"11 Nov", title:"Invoice exceptions in FIN-112",
    why:"Extraction reviews and suspected duplicates held for David.", detail:"Nothing is paid or posted from Pulse.",
    actionLabel:"Review", secondaryLabel:"Later", group:"Approvals", fields:[{k:"Batch",v:"FIN-112"}], history:[{when:"11 Nov",text:"Finance Agent held 5 documents"}]},
  avo:{kind:"Approval", importance:"normal", icon:ICONS.insights, age:"11 Nov", title:"Avocado cost update CC-AVO-118",
    why:"€1.10 to €1.32 (+20%). Salmon bowl €3.60 to €3.71.", detail:"Ingredient contribution only; excludes labour, packaging and fees.",
    actionLabel:"Review", secondaryLabel:"Later", group:"Approvals", fields:[{k:"Invoice",v:"INV-AVO-118"}], history:[{when:"11 Nov",text:"Ingredient Cost Agent raised the change"}]},
  set:{kind:"Alert", importance:"high", icon:ICONS.health, age:"6 Nov", title:"Deliveroo payout €126 short",
    why:"SET-DEL-1106 under investigation; not classified as loss.", detail:"Check the Deliveroo adjustment statement.",
    actionLabel:"Open", secondaryLabel:"Later", group:"Alerts", fields:[{k:"Settlement",v:"SET-DEL-1106"}], history:[{when:"11 Nov",text:"Channel Margin Agent flagged the gap"}]},
  cor:{kind:"Task", importance:"high", icon:ICONS.work, age:"Fri", title:"48-bowl corporate order, Friday 12:15",
    why:"COR-1113 via Lunch Team at Baggot Street.", detail:"Prep owner Sofia, dispatch Aoife.",
    actionLabel:"Open prep", secondaryLabel:"Later", group:"Work", fields:[{k:"Order",v:"COR-1113"}], history:[{when:"12 Nov",text:"Imported from Lunch Team (demo)"}]},
  trf:{kind:"Task", importance:"normal", icon:ICONS.work, age:"Fri", title:"Friday transfer to Blackrock",
    why:"TRF-1113: 2 kg salmon, 3 kg pineapple salsa, €66.", detail:"Aoife prepares, David transports, Conor receives.",
    actionLabel:"Open", secondaryLabel:"Later", group:"Work", fields:[{k:"Transfer",v:"TRF-1113"}], history:[{when:"12 Nov",text:"Proposed by Stock Transfer Agent"}]},
  rst:{kind:"Approval", importance:"normal", icon:ICONS.teams, age:"11 Nov", title:"Optional Blackrock roster scenario",
    why:"Four hours, €64 a week. Manager decision.", detail:"No shifts changed and no staff notified from Pulse.",
    actionLabel:"Open", secondaryLabel:"Later", group:"Approvals", fields:[{k:"Proposal",v:"RST-PROP-BLK-46"}], history:[{when:"11 Nov",text:"Labour Watch proposed the scenario"}]}
};
const ORDER = ["fin","avo","set","cor","trf","rst"];

const ANSWERS = {
  fallback:{tool:"search.records", effect:"read",
    text:"I answer from the shared Shaka Poké demo records: invoices, ingredient costs, recipes, channels, settlements, stock, prep and labour.",
    actions:[["Show my avocado spend",0]]}
};


// Turns a plain-English filter name into a full dashboard area — the "primitive
// vibe-coding" bit: no real backend, just a seeded generator so the same phrase
// always produces the same numbers, with direction and vocabulary nudged by
// keywords in the text (expansion/growth trends up, risk/issue trends down, a
// region/cost/people/ops/customer word picks which metrics show).
function synthesizeCustomArea(name){
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  let seed = 0;
  for (let i = 0; i < trimmed.length; i++) seed = (seed * 31 + trimmed.charCodeAt(i)) >>> 0;
  const rnd = (n) => (((seed >>> (n % 24)) ^ (seed << ((n * 7) % 13))) >>> 0) % 997 / 997;
  const low = trimmed.toLowerCase();
  const has = (...words) => words.some(w => low.indexOf(w) > -1);
  const growth = has("expansion","growth","launch","scale","pilot","new site","open","opening","grow");
  const risk = has("risk","issue","delay","problem","complaint","fault","incident","churn","decline");
  const dir = risk ? -1 : (growth ? 1 : (rnd(2) > 0.45 ? 1 : -1));

  let vocab = "generic";
  if (has("scotland","ireland","wales","england","region","dublin","belfast","cork","galway","london","glasgow","edinburgh"))
    vocab = "region";
  else if (has("cost","spend","budget","saving","margin")) vocab = "cost";
  else if (has("staff","hiring","team","recruit","headcount")) vocab = "people";
  else if (has("supplier","stock","inventory","warehouse","fleet")) vocab = "ops";
  else if (has("customer","client","retention","account")) vocab = "customer";

  const V = {
    region:   {labels:["New enquiries","Orders won","Revenue","Site coverage"], unit:"EUR — 30 DAYS"},
    cost:     {labels:["Spend","Cost per job","Savings found","Budget used"], unit:"EUR — 30 DAYS"},
    people:   {labels:["Headcount","Open roles","Time to hire","Retention"], unit:"PEOPLE"},
    ops:      {labels:["Stock cover","Lead time","Stockouts","Reorders raised"], unit:"DAYS"},
    customer: {labels:["Active accounts","Repeat rate","Churn","NPS"], unit:"ACCOUNTS"},
    generic:  {labels:["Volume","Rate","Cost","Coverage"], unit:"ACTIVITY — 30 DAYS"}
  }[vocab];

  const months = ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
  let v0 = 40 + Math.floor(rnd(1) * 220);
  const chart = months.map((m, i) => {
    v0 = Math.max(8, Math.round(v0 * (1 + dir * (0.03 + rnd(i + 3) * 0.07))));
    return [m, v0, String(v0)];
  });
  const metrics = V.labels.map((label, i) => {
    const val = 20 + Math.floor(rnd(i + 5) * 400);
    const pct = 2 + Math.round(rnd(i + 9) * 18);
    const up = dir > 0 ? rnd(i + 12) > 0.25 : rnd(i + 12) > 0.7;
    const bars = [0,1,2,3,4,5,6,7,8].map(k => 0.3 + rnd(i * 3 + k) * 0.7);
    return [label, i === 1 ? pct + "%" : String(val), (up ? "+" : "\u2212") + pct + (i === 1 ? "pt" : "%"), up ? "up" : "down", "vs last month", bars];
  });
  const capName = trimmed.replace(/\b\w/g, c => c.toUpperCase());
  const split = [
    [capName + " \u2014 direct", String(Math.round(v0 * 0.5)), "48%", 1],
    ["Existing pipeline", String(Math.round(v0 * 0.3)), "31%", 0],
    ["Everything else", String(Math.round(v0 * 0.2)), "21%", 0]
  ];
  const table = [1,2,3].map(w => [capName + " \u2014 week " + w, String(20 + Math.floor(rnd(20 + w) * 200)),
    (dir > 0 ? "+" : "\u2212") + (3 + Math.floor(rnd(23 + w) * 14)) + "%", "Auto-tagged from records mentioning \u201c" + low + "\u201d"]);
  table.push(["Everything else", String(20 + Math.floor(rnd(30) * 200)), "\u2014", "Baseline"]);
  return {
    id: trimmed, label: capName, color: "var(--accent)", owner: "CUSTOM FILTER",
    description: "Generated from \u201c" + trimmed + "\u201d \u2014 a plain-English filter, not a registered metric set. Refine it and Pulse will tighten this up.",
    kind: "columns", chartTitle: capName + " over time", chartUnit: V.unit,
    chart, splitTitle: "Where \u201c" + low + "\u201d shows up", split,
    tableCols: ["Item","Value","Change","Note"], table,
    metrics, legend: [capName, "Pipeline", "Other"]
  };
}

function pickAnswer(q){
  return ANSWERS.fallback;
}


const ORGS = [
  ["Caterway","Supplier","Dry goods, proteins, drinks","—","active"],
  ["Harbour Fresh Fish","Supplier","Fresh fish (fictional)","—","active"],
  ["Green Basket Produce","Supplier","Fruit and veg (fictional)","—","active"],
  ["Harbour Office Team","Corporate customer","Fictional, via Lunch Team","—","active"]
];
const TEAMS = [
  ["Management","1 member","David McParland","all access"],
  ["Store Operations","4 members","Aoife Byrne, Conor Walsh","own site"],
  ["Kitchen","2 members","Sofia Costa","prep only"],
  ["Events","1 member","Jack Murphy","events only"]
];
const LOCATIONS = [
  ["Baggot Street","110B Baggot Street Lower, Dublin","Sample staff","active"],
  ["Blackrock","Blackrock Village Market, 19A Main Street, Blackrock, Co. Dublin","Sample staff","active"],
  ["Food Truck","Seasonal","Events only","dormant"]
];

const AGENT_DEFS = [
  {id:"briefing", name:"Briefing", shape:"crown-pebble", tint:"#16233a", state:"complete", role:"Owner summary each morning with deep links",
   when:"08:00", preview:"five invoices need review; avocado is up 20%.",
   thread:[
     {kind:"stamp", text:"Thursday 12 November, 08:00"},
     {kind:"routine", text:"Ran routine", routine:"Morning briefing (simulated)"},
     {kind:"agent", text:"BRIEFING_PLACEHOLDER"},
     {kind:"agent", text:"each item links to its record. nothing is paid, posted or sent until you say yes."}
   ]},
  {id:"ops", name:"Ops Watchdog", shape:"shield", tint:"#2b1b1e", state:"attention", role:"Incomplete prep, delayed deliveries, low stock and transfer exceptions",
   when:"07:45", preview:"spinach short on PO-2040; Blackrock salmon below par.",
   thread:[
     {kind:"stamp", text:"Thursday 07:45"},
     {kind:"agent", text:"PO-2040 delivered 7 kg of 10 kg spinach to Blackrock. Blackrock salmon is below par until Friday's transfer arrives; I have not counted the transfer as on hand."}
   ]},
  {id:"finance", name:"Finance Agent", shape:"executive-capsule", tint:"#1b2430", state:"waiting", role:"Invoice extraction, duplicates, reconciliation and the draft accountant pack. Never files or pays",
   when:"08:40", preview:"24 documents: 19 ready, 5 held for you.",
   thread:[
     {kind:"stamp", text:"Thursday 08:40"},
     {kind:"agent", text:"FIN-112 has 24 documents. 19 extracted cleanly. I held three for review (a salmon line read as 1.2 box, a blurred Tesco receipt, an unreadable tax field) and two suspected duplicates. nothing becomes a payable until you clear it."}
   ]},
  {id:"ingredient", name:"Ingredient Cost Agent", shape:"control-cube", tint:"#16241f", state:"waiting", role:"Normalises quantities, spots price changes, recalculates recipes after approval",
   when:"Wed", preview:"avocado €1.10 to €1.32, salmon bowl +€0.11.",
   thread:[
     {kind:"stamp", text:"Wednesday 08:14"},
     {kind:"agent", text:"INV-AVO-118 bills 100 avocados at €1.32, up from €1.10. that's +€22 per hundred and +€0.11 on the salmon bowl (€3.60 to €3.71). the tofu bowl moves the same. I'll only revalue recipes after you approve CC-AVO-118; October stays as it was."}
   ]},
  {id:"channel", name:"Channel Margin Agent", shape:"rim-capsule", tint:"#241b2e", state:"attention", role:"Fees, contribution and settlement exceptions without double counting",
   when:"Wed", preview:"Deliveroo payout €126 below the statement.",
   thread:[
     {kind:"stamp", text:"Wednesday 11:30"},
     {kind:"agent", text:"SET-DEL-1106: the statement lines add up to €1,260, the bank got €1,134. I've marked it Investigate. it could be an adjustment, so I haven't booked a loss or touched the P&L."}
   ]},
  {id:"prep", name:"Prep Planner", shape:"low-dome", tint:"#2a2118", state:"working", role:"Confirmed demand plus an illustrative baseline, with manager overrides",
   when:"07:05", preview:"COR-1113 needs 1.6 kg salmon and 8 avocados for the salmon bowls.",
   thread:[
     {kind:"stamp", text:"Thursday 07:05"},
     {kind:"agent", text:"COR-1113 is 48 bowls for 12:15 tomorrow: 24 chicken, 16 salmon, 8 tofu. the salmon bowls need 1.6 kg salmon and 8 avocados. walk-in is a separate baseline of about 140 bowls, illustrative only. one dietary note needs a manager before prep."}
   ]},
  {id:"transfer", name:"Stock Transfer Agent", shape:"offset-pebble", tint:"#191c1f", state:"working", role:"Proposes cross-site movements and tracks acknowledgements",
   when:"07:30", preview:"TRF-1113: 2 kg salmon, 3 kg salsa to Blackrock.",
   thread:[
     {kind:"stamp", text:"Thursday 07:30"},
     {kind:"agent", text:"proposed TRF-1113 for Friday 15:30: 2 kg salmon and 3 kg pineapple salsa from Baggot Street to Blackrock, €66 at cost. Aoife dispatches, you drive, Conor confirms receipt."}
   ]},
  {id:"labour", name:"Labour Watch", shape:"glass-visor", tint:"#1b2430", state:"waiting", role:"Sales to labour ratios and optional, explainable shift scenarios",
   when:"Wed", preview:"Blackrock 32% labour vs Baggot 28%.",
   thread:[
     {kind:"stamp", text:"Wednesday 16:00"},
     {kind:"agent", text:"October labour ran at 32% of sales in Blackrock and 28% at Baggot Street. there's an optional scenario: four quiet weekday hours, about €64 a week. Conor decides, and I never change shifts or message anyone."}
   ]}
];

const KPI_DEFS = {
  sales:{label:"Net sales", value:"€80,000", delta:"October", dir:"up", hint:"demo"},
  profit:{label:"Est. operating profit", value:"€7,600", delta:"9.5%", dir:"up", hint:"margin"}
};


const ASPECT_DEFS = [
  {id:"sales", label:"Sales", color:"var(--accent)", owner:"DAVID MCPARLAND", description:"October net sales by location (demo).",
   kind:"columns", chartTitle:"Net sales", chartUnit:"EUR",
   chart:[["Baggot",52,"€52k"],["Blackrock",28,"€28k"]],
   splitTitle:"By location", split:[["Baggot Street","€52,000","65%",1],["Blackrock","€28,000","35%",0]],
   tableCols:["Location","Sales","Profit","Margin"], table:[["Baggot Street","€52,000","€8,840","17.0%"],["Blackrock","€28,000","−€1,040","−3.7%"]],
   metrics:[["Net sales","€80,000","Oct","up","demo",[.5,.6,.7,.8,1]]]}
];


const FILTER_GROUPS = [
  {title:"AREA", items:["Sales","Development","Marketing","Operations","Finance","Support"]},
  {title:"SPINE", items:["Location","Team","Person","Organisation","Module"]},
  {title:"TIME", items:["This week","This month","This quarter","Year to date"]}
];

const OPS_DEFS = [
  {id:"o1", name:"Invoice review", kind:"automation", owner:"Finance Agent", ownerKind:"agent", initials:"FA",
   trigger:"Document arrives", triggerKind:"event", next:"Event-based", last:"5 held for review", status:"approval", rate:79, on:true,
   what:"Extracts supplier invoices and receipts, flags low confidence and duplicates.", why:"40 to 50 hours a month of manual admin.", saved:"0 hours (demo)",
   steps:[["Trigger","Document arrives"],["Find","Lines and ingredients"],["Approval","David reviews","gate"]], runs:[["Thu 08:40","1m","partial","19 of 24","€0.00"]]},
  {id:"o2", name:"Settlement check", kind:"automation", owner:"Channel Margin Agent", ownerKind:"agent", initials:"CM",
   trigger:"Bank CSV uploaded", triggerKind:"event", next:"Event-based", last:"1 to investigate", status:"approval", rate:80, on:true,
   what:"Matches marketplace payouts to bank receipts.", why:"Sales are not cash.", saved:"0 hours (demo)",
   steps:[["Trigger","Bank CSV"],["Check","Expected vs received"],["Approval","David explains","gate"]], runs:[["Wed 11:30","4s","partial","1 gap","€0.00"]]},
  {id:"o3", name:"Friday transfer", kind:"routine", owner:"Stock Transfer Agent", ownerKind:"agent", initials:"ST",
   trigger:"Fri, 07:30", triggerKind:"schedule", next:"Fri 07:30", last:"TRF-1113 proposed", status:"healthy", rate:100, on:true,
   what:"Proposes surplus moves from Baggot Street to Blackrock.", why:"Replaces WhatsApp coordination.", saved:"0 hours (demo)",
   steps:[["Trigger","Friday"],["Check","Available stock"],["Approval","Managers dispatch and receive","gate"]], runs:[["Thu 07:30","2s","ok","1 transfer","€0.00"]]},
  {id:"o4", name:"Corporate prep", kind:"routine", owner:"Prep Planner", ownerKind:"agent", initials:"PP",
   trigger:"Corporate order imported", triggerKind:"event", next:"Event-based", last:"COR-1113 planned", status:"approval", rate:100, on:true,
   what:"Turns confirmed orders into ingredient requirements.", why:"Peak lunch depends on advance prep.", saved:"0 hours (demo)",
   steps:[["Trigger","Order imported"],["Find","Recipe quantities"],["Approval","Manager reviews dietary note","gate"]], runs:[["Thu 07:05","2s","ok","48 bowls","€0.00"]]},
  {id:"o5", name:"Morning briefing", kind:"routine", owner:"Briefing", ownerKind:"agent", initials:"BR",
   trigger:"Weekdays, 08:00", triggerKind:"schedule", next:"Tomorrow", last:"Posted 08:00", status:"healthy", rate:100, on:true,
   what:"Owner summary with deep links.", why:"One place to start the day.", saved:"0 hours (demo)",
   steps:[["Trigger","08:00"],["Find","Open items"],["Send","Post to Home"]], runs:[["Thu 08:00","3s","ok","1 briefing","€0.00"]]},
  {id:"o6", name:"Backfill matcher", kind:"task", owner:"Finance Agent", ownerKind:"agent", initials:"FA",
   trigger:"Nightly", triggerKind:"schedule", next:"Tonight", last:"216 of 240 matched", status:"healthy", rate:90, on:true,
   what:"Matches April to September documents to bank lines.", why:"Accountant-ready year end.", saved:"0 hours (demo)",
   steps:[["Trigger","Nightly"],["Check","Match documents to bank"],["Approval","David resolves gaps","gate"]], runs:[["Wed 02:00","40s","ok","216 matched","€0.00"]]}
];


const OPS_FILTERS = [
  ["all","All"], ["routine","Agent routines"], ["automation","Automations"],
  ["report","Scheduled reports"], ["task","Recurring tasks"], ["approval","Needs approval"], ["failed","Failed"]
];

const WORK_SECTIONS = [
  {id:"tasks", label:"Tasks", blurb:"Story tasks and backfill review.", views:["All tasks","Due tasks","Review","Done"], filters:[]},
  {id:"approvals", label:"Approvals", blurb:"Counted from live state.", views:["Awaiting you","Awaiting others","Decided"], filters:[]},
  {id:"workflows", label:"Workflows", blurb:"Simulated workflow runs.", views:[], filters:[]}
];

const WORK_TASKS = [
  {id:"w1", title:"Review five invoice exceptions (FIN-112)", status:"In progress", priority:"High", who:"DM",
   due:"Fri 17:00", late:false, client:"FIN-112", day:"Fri", mins:"30 mins", view:"Due tasks"}
];

const WORKFLOWS = [
  {name:"Invoice review", state:"live", trigger:"event · document received",
   actions:[["extract.lines","read"],["inbox.hold","write"]], lastRun:"Thu 08:40",
   result:"5 held", resultKind:"warn", runSummary:"simulated", runs:["ok","ok","partial"]}
];

const SCHEDULES = [
  {id:"s1", name:"Morning briefing", cadence:"Weekdays · 08:00", next:"Tomorrow 08:00", owner:"Briefing", on:true, day:1},
  {id:"s2", name:"Friday transfer", cadence:"Fridays · 07:30", next:"Fri 07:30", owner:"Stock Transfer Agent", on:true, day:4}
];

const WIDGET_DEFS = [["kpi","October health"],["inbox","Needs your attention"],["work","Upcoming work"],["visits","Coming up"],["activity","Activity"]];
const WORK_WIDGETS = [
  {id:"queue", label:"Open tasks", value:"9", hint:"across the team", icon:"work", queue:"mine"},
  {id:"late", label:"Due Friday", value:"6", hint:"before the weekend", icon:"health", queue:"overdue"},
  {id:"unassigned", label:"Unassigned", value:"0", hint:"every task has an owner", icon:"teams", queue:"unassigned"},
  {id:"week", label:"Next 7 days", value:"9", hint:"due this week", icon:"visits", queue:"upcoming"}
];


const PERSONALITIES = ["Straight-talking","Warm","Formal","Dry"];
const ANSWER_STYLES = ["Short answers","Show the working","Ask before acting"];
/* Every context source and every registered tool the agent could be granted. */
const CONTEXT_DEFS = [
  ["Invoices","records","Supplier documents and extracted lines"],
  ["Ingredients","records","Units, prices and suppliers"],
  ["Recipes","records","Versioned bowls and costs"],
  ["Orders","records","Deduplicated sales by channel"],
  ["Settlements","money","Payouts and bank matches"],
  ["Stock","work","On hand, reservations, transfers"],
  ["Prep","work","Corporate orders and checklists"],
  ["Roster","work","Square Teams demo import"],
  ["Activity log","system","Every event, agent and human"]
];
const CONTEXT_SOURCES = CONTEXT_DEFS.map(c => c[0]);
const SKILL_DEFS = [
  ["Search records","read"],["Summarise activity","read"],["Read invoices","read"],["Read stock","read"],
  ["Draft task","write"],["Propose cost update","write"],["Propose transfer","write"],
  ["Export draft CSV","external"]
];
const TRAIN_PHASES = [
  ["Reading the shared records","demo dataset"],
  ["Learning how this business words things","bowl, prep, transfer"],
  ["Reading the recipe versions","4 recipes"],
  ["Writing its own system prompt","simulated"]
];
const BRIEF_QUESTIONS = [
  {title:"What should it cover?", sub:"Pick as many as you like.",
   options:[["Invoices","What needs review"],["Costs","Ingredient price changes"],["Cash","Settlements and gaps"],["Prep","Tomorrow's confirmed orders"],["Something else","Tell me in the next message"]]},
  {title:"When should it land?", sub:"One is enough to start.",
   options:[["Weekdays 08:00","Before lunch prep"],["Only when something changes","Event-driven"],["On demand","When you ask"]]}
];


const STATE_LABELS = {working:"working", thinking:"thinking", waiting:"waiting on you",
  complete:"up to date", attention:"needs you", idle:"idle"};

const FACE_SHAPES = [
  ["crown-pebble","Pebble"],["executive-capsule","Executive"],["shield","Shield"],
  ["glass-visor","Visor"],["control-cube","Control cube"],["low-dome","Low dome"],
  ["offset-pebble","Offset pebble"],["rim-capsule","Capsule"],["wide-eyed","Wide-eyed"],
  ["precision-brow","Precision brow"],["tall-unit","Tall unit"],["soft-asymmetric","Soft asymmetric"]
];
/* Shell colours only, deliberately desaturated so none of them reads as a
   state. Each is a pair: the deep shell for light themes and its pale partner
   for dark ones (the eyes take the other). The status light carries the state. */
const FACE_TINTS = [
  ["#191c1f","Graphite","#e3e6e8"],["#1b2430","Slate","#d3dde9"],["#241b2e","Aubergine","#ddd4ea"],
  ["#2a2118","Bronze","#eadccb"],["#16241f","Pine","#d1e4da"],["#2b1b1e","Oxblood","#eed5d7"]
];

const CLUSTERS = [
  ["Suppliers & invoices", "#46C8F0", 0.00, 0.62, 46],
  ["Ingredients",          "#A9E5FF", 0.90, 0.70, 52],
  ["Recipes",              "#7fd8a4", 1.75, 0.66, 58],
  ["Orders",               "#f0c04b", 2.55, 0.72, 44],
  ["Channels & settlements","#f0567f", 3.35, 0.60, 38],
  ["Locations & stock",    "#5fe0a8", 4.15, 0.70, 40],
  ["Staff & shifts",       "#f0803a", 4.95, 0.64, 30],
  ["Transfers",            "#5f7cf0", 5.65, 0.72, 34]
];


function mulberry(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Hub-and-spoke clusters around a dense phyllotaxis core, in unit space
   (-1..1 on both axes) so the layout is resolution independent. */
const _hexCache = {};
function hexRGB(hex){
  if (_hexCache[hex]) return _hexCache[hex];
  const h = hex.replace("#", "");
  const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  _hexCache[hex] = v;
  return v;
}


function buildGraph(){
  const rnd = mulberry(20260902);
  const nodes = [], edges = [], adj = [];
  const add = (x, y, z, r, cluster, kind) => {
    nodes.push({x, y, z, r, cluster, kind}); adj.push([]); return nodes.length - 1;
  };
  const link = (a, b) => {
    const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y, dz = nodes[a].z - nodes[b].z;
    const w = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.004;
    const id = edges.length;
    edges.push({a, b, w});
    adj[a].push([b, w, id]); adj[b].push([a, w, id]);
  };

  // the core is a filled sphere on a Fibonacci lattice, not a disc
  const CORE = 880, coreIds = [];
  for (let i = 0; i < CORE; i++){
    const t = (i + 0.5) / CORE;
    const phi = Math.acos(1 - 2 * t);
    const theta = i * 2.39996;
    const shell = 0.16 + 0.28 * Math.pow(rnd(), 0.5);
    const grade = rnd();
    coreIds.push(add(
      Math.sin(phi) * Math.cos(theta) * shell * 1.04,
      Math.cos(phi) * shell * 0.96,
      Math.sin(phi) * Math.sin(theta) * shell,
      grade < 0.06 ? 3.4 + rnd() * 1.4 : grade < 0.3 ? 2.1 + rnd() * 0.7 : 1.0 + rnd() * 0.8, 0, "core"));
  }
  // lattice neighbours plus a mesh of chords, so the sphere reads as a volume
  for (let i = 1; i < coreIds.length; i++){
    link(coreIds[i], coreIds[i - 1]);
    if (i >= 13) link(coreIds[i], coreIds[i - 13]);
    if (i >= 21 && i % 2 === 0) link(coreIds[i], coreIds[i - 21]);
    if (i >= 34 && i % 3 === 0) link(coreIds[i], coreIds[i - 34]);
    if (i >= 55 && i % 4 === 0) link(coreIds[i], coreIds[i - 55]);
    if (i >= 89 && i % 5 === 0) link(coreIds[i], coreIds[i - 89]);
    if (i % 6 === 0) link(coreIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // a mid shell between the nucleus and the lobes: the layer that makes it
  // read as a network rather than a ball with satellites
  const MID = 560, midIds = [];
  for (let i = 0; i < MID; i++){
    const t = (i + 0.5) / MID;
    const phi = Math.acos(1 - 2 * t), theta = i * 2.39996 + 0.7;
    const d = 0.52 + 0.16 * Math.pow(rnd(), 0.6);
    const g2 = rnd();
    midIds.push(add(
      Math.sin(phi) * Math.cos(theta) * d * 1.02,
      Math.cos(phi) * d * 0.96,
      Math.sin(phi) * Math.sin(theta) * d,
      g2 < 0.05 ? 2.6 + rnd() * 1.0 : g2 < 0.3 ? 1.6 + rnd() * 0.6 : 0.8 + rnd() * 0.7, 0, "core"));
  }
  for (let i = 0; i < midIds.length; i++){
    if (i >= 1) link(midIds[i], midIds[i - 1]);
    if (i >= 17) link(midIds[i], midIds[i - 17]);
    if (i >= 29 && i % 2 === 0) link(midIds[i], midIds[i - 29]);
    // radial spokes tying the shell to the nucleus
    if (i % 2 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
    if (i % 9 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // clusters ride a sphere: each hub gets its own latitude as well as longitude
  const hubs = [], clusterLeaves = [];
  const onSphere = (lon, lat, d0) => { const d = d0 * 1.22;
    return [Math.cos(lat) * Math.cos(lon) * d * 1.02, Math.sin(lat) * d * 0.96, Math.cos(lat) * Math.sin(lon) * d]; };
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist, leaves] = c;
    const lat = (ci % 2 ? 1 : -1) * (0.26 + rnd() * 0.5);
    const wob = 1.06 + rnd() * 0.16;
    const hp = onSphere(ang, lat, dist * wob);
    const hub = add(hp[0], hp[1], hp[2], 5.4, ci, "hub");
    hubs.push(hub);
    const mine = [];
    clusterLeaves.push(mine);
    for (let k = 0; k < 3; k++) link(hub, coreIds[Math.floor(rnd() * coreIds.length)]);
    for (let k = 0; k < 5; k++) link(hub, midIds[Math.floor(rnd() * midIds.length)]);

    const subs = 5 + Math.floor(rnd() * 4);
    const subIds = [];
    for (let s = 0; s < subs; s++){
      const sa = ang + (rnd() - 0.5) * 0.52, sl = lat + (rnd() - 0.5) * 0.3;
      const sd = dist + 0.08 + rnd() * 0.18;
      const sp = onSphere(sa, sl, sd);
      const sub = add(sp[0], sp[1], sp[2], 3.2, ci, "sub");
      subIds.push(sub);
      link(sub, hub);
      if (s > 0 && rnd() < 0.7) link(sub, subIds[s - 1]);
      const fan = Math.floor((leaves * 7.4) / subs);
      const spread = 0.17 + rnd() * 0.2;
      let prev = -1;
      for (let l = 0; l < fan; l++){
        const la = sa + (rnd() - 0.5) * spread * 2 + (rnd() - 0.5) * 0.06;
        const ll = sl + (rnd() - 0.5) * spread * 1.1;
        const ld = sd + 0.03 + Math.pow(rnd(), 0.8) * 0.17;
        const lp = onSphere(la, ll, ld);
        const lg = rnd();
        const leaf = add(lp[0], lp[1], lp[2],
          lg < 0.08 ? 2.8 + rnd() * 1.2 : lg < 0.34 ? 1.8 + rnd() * 0.6 : 1.0 + rnd() * 0.7, ci, "leaf");
        link(leaf, sub);
        mine.push(leaf);
        if (rnd() < 0.14) link(leaf, hub);
        if (prev >= 0 && rnd() < 0.34) link(leaf, prev);
        if (rnd() < 0.16) link(leaf, midIds[Math.floor(rnd() * midIds.length)]);
        prev = leaf;
      }
    }
  });
  // far satellites hanging off the outer leaves
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist] = c;
    for (let s = 0; s < 7; s++){
      const sa = ang + (rnd() - 0.5) * 1.5, sl = (rnd() - 0.5) * 1.3;
      const sd = dist + 0.42 + rnd() * 0.22;
      const ap = onSphere(sa, sl, sd);
      const anchor = add(ap[0], ap[1], ap[2], 2.4, ci, "sub");
      link(anchor, hubs[ci]);
      const n = 14 + Math.floor(rnd() * 18);
      for (let l = 0; l < n; l++){
        const la = sa + (rnd() - 0.5) * 0.9, ll = sl + (rnd() - 0.5) * 0.7;
        const ld = sd + 0.02 + Math.pow(rnd(), 0.8) * 0.18;
        const p = onSphere(la, ll, ld);
        const leaf = add(p[0], p[1], p[2], 0.8 + rnd() * 0.9, ci, "leaf");
        link(leaf, anchor);
        clusterLeaves[ci].push(leaf);
      }
    }
  });

  // two hub rings and long chords across the sphere
  hubs.forEach((h, i) => {
    link(h, hubs[(i + 1) % hubs.length]);
    link(h, hubs[(i + 2) % hubs.length]);
    if (i % 3 === 0) link(h, hubs[(i + 4) % hubs.length]);
  });
  // neighbouring clusters share records, so their leaves cross-link
  for (let ci = 0; ci < clusterLeaves.length; ci++){
    const a = clusterLeaves[ci], b = clusterLeaves[(ci + 1) % clusterLeaves.length];
    const n = 26 + Math.floor(rnd() * 16);
    for (let k = 0; k < n; k++){
      link(a[Math.floor(rnd() * a.length)], b[Math.floor(rnd() * b.length)]);
    }
    // and a good number reach right across to the far side
    for (let k = 0; k < 12; k++){
      const far = clusterLeaves[(ci + 3) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
    for (let k = 0; k < 8; k++){
      const far = clusterLeaves[(ci + 4) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
  }

  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
  for (const n of nodes){
    if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y;
    if (n.z < minZ) minZ = n.z; if (n.z > maxZ) maxZ = n.z;
  }
  const bounds = {minX, maxX, minY, maxY, cx:(minX + maxX) / 2, cy:(minY + maxY) / 2,
    cz:(minZ + maxZ) / 2, w:maxX - minX, h:maxY - minY, d:maxZ - minZ,
    radius: Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 2,
    reach: nodes.reduce((m, n) => Math.max(m, Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z)), 0)};
  return {nodes, edges, adj, hubs, coreIds, bounds};
}

export {
  INK,
  BODY,
  DIM,
  FAINT,
  LIME,
  GREEN,
  AMBER,
  RED,
  NEUTRAL,
  MONO,
  ICONS,
  REC_SECTIONS,
  CONTACTS,
  FILE_TREE,
  ONTO_NODES,
  ONTO_EDGES,
  REC_TEMPLATES,
  REC_TEMPLATE_CATS,
  PEOPLE,
  ROLE_LEVELS,
  PERM_KEYS,
  GRANT_DEFS,
  ROLE_SCOPES,
  DEFAULT_PERMS,
  INTEGRATIONS,
  BG_DEFS,
  THEMES,
  ADMIN_ICONS,
  ADMIN_CARDS,
  ADMIN_GROUPS,
  SRC_TINT,
  SRC_ABBR,
  DATA_EVENTS,
  PEOPLE_EVENTS,
  AI_EVENTS,
  STREAM_DEFS,
  NAV,
  ITEMS,
  ORDER,
  ANSWERS,
  synthesizeCustomArea,
  pickAnswer,
  ORGS,
  TEAMS,
  LOCATIONS,
  AGENT_DEFS,
  KPI_DEFS,
  ASPECT_DEFS,
  FILTER_GROUPS,
  OPS_DEFS,
  OPS_FILTERS,
  WORK_SECTIONS,
  WORK_TASKS,
  WORKFLOWS,
  SCHEDULES,
  WIDGET_DEFS,
  WORK_WIDGETS,
  PERSONALITIES,
  ANSWER_STYLES,
  CONTEXT_DEFS,
  CONTEXT_SOURCES,
  SKILL_DEFS,
  TRAIN_PHASES,
  BRIEF_QUESTIONS,
  STATE_LABELS,
  FACE_SHAPES,
  FACE_TINTS,
  CLUSTERS,
  mulberry,
  _hexCache,
  hexRGB,
  buildGraph
};
