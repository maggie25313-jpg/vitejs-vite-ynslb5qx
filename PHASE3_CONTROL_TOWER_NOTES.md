# Control Tower — Phase 3 demo (v6)

This revision changes **only the Control Tower tab**. Inventory Health, Inbound/Delivery and Data Hub have not been edited.

## Updated dashboard

- Invoice breakdown categories (in display order): **Inbound, Pick & Pack, Storage, B2B, VAS, Shipping**. Six individual colour-key entries and a stacked chart. Kitting is illustrated as an optional component **inside VAS**; when toggled off, other VAS charges remain.
- **Per order breakdown** is now a doughnut/pie chart showing the directly attributable costs **Pick & Pack + Shipping**. The two cost amounts and header match the Cost per order KPI; Storage/Inbound/B2B/VAS stay invoice-only.
- **Orders by channel** is the renamed former Orders Despatched chart. It is a weekly stacked bar chart with example storefronts: Amazon Store 1, Shopify Stores 1–2, eBay Stores 1–3, TikTok Store 1 and Bulk upload. Grouped storefront legend displays channel totals and individual store counts.
- **Orders Despatched** is a new standalone weekly stacked bar chart split into **Evri International, Evri Domestic Standard and Evri Domestic 24hr**.
- **Cost per order (FF + Shipping) by country** is now a doughnut/pie chart with all six countries individually listed. The slices show **share of total allocated spend** (which is additive); the accompanying country legend shows **average cost per order** for each country. Averages themselves are not suitable pie slices.
- Full-width CS Queries panel, KPI cards, future GECO/stock-reclassification placeholders, date presets/custom range and CSV export remain available.
- All costs and counts are illustrative. Date filters, client selection and the kitting demo toggle dynamically update the charts and CSV.

## Data checks

- Store counts, service counts and orders despatched reconcile in every weekly bin and for the full selected period.
- The country cost allocation totals equal Pick & Pack + Shipping spend. The invoice-category total equals the sum of all six categories.
- Weeks are seven-day periods starting on the selected reporting start date, with a partial final period when needed.

## Production integration

Spike billing data, order-to-store mappings, shipping-service classification, and CS support metrics need production source connections. Kitting setting should be read from client configuration rather than the demo checkbox. DoT must use agreed expected despatch/operational deadline rules and include eligible, missed/undispatched orders.

## Deploy

This ZIP has project files at repository root (`src/`, `public/`, `package.json`). Upload into the root of the GitHub repository and keep Vercel Root Directory set to `./`.

Run `npm ci && npm run build` in an environment with npm registry access. No new dependencies are required (Recharts Pie is already included). The TypeScript source syntax and demonstration arithmetic were validated here; a complete build could not be performed in this container because the npm cache lacks required packages.
