# Control Tower — Phase 3 demo (v4)

This update changes **only the Control Tower tab**. Inventory Health, Inbound/Delivery, and Data Hub remain unchanged.

## Included in this version

- Eight headline KPIs. **Cost per order** is fulfilment (pick & pack) + shipping only.
- **Per order breakdown** now contains only those two directly attributable charges, ranked highest first. Its two displayed amounts add up exactly to the Cost per order KPI, to the penny.
- A new **CS Queries** panel underneath Per order breakdown, with illustrative counts for delivery enquiries, undelivered parcels, returns/RTS, lost-in-network, and damaged-delivery queries. Counts follow the selected date range and client.
- Stacked **Orders despatched** chart segmented by Amazon, Shopify, eBay, TikTok, and Bulk upload. Every period's channel counts sum to its order total; the chart also shows a clearly aligned channel colour key.
- Stacked **Invoice breakdown** continues to show Storage, Pick & Pack, Shipping, Inbound, Kitting, and Other as total invoice charges (not per-order allocations). Its colour key now appears underneath in neat, aligned cells with corresponding category totals. Kitting disappears from the chart **and its colour key** when unchecked.
- Kitting toggle is a demo-only proxy for future client settings. Kitting changes invoice totals, but correctly does **not** affect Cost per order, because kitting is no longer included in that metric.
- **Cost per order by country** displays all example countries separately: United Kingdom, Netherlands, Germany, France, Ireland and Spain. There is no combined Other category or domestic/international filter.
- Delivery on Time and Damaged/Quarantine remain yellow placeholders with no values pending GECO and stock reclassification respectively.
- Existing date presets (7, 14, 30, 60 days), custom date filtering, client selector and CSV export retained. The CSV now includes the CS breakdown and despatched channel splits.

## Important production notes

**No real data or Spike billing integration is included.** Illustrative figures and rates are generated locally. Reconcile costs with client-specific Spike rates and actual invoice lines before production.

- Storage, inbound, kitting and other costs are invoice-category charges but **not** part of the per-order fulfilment + shipping breakdown.
- CS queries are synthetic in this demo. Live ticket/issue source, deduplication and definitions must be agreed.
- Channel data is synthetic. Production should map WMS order source/channel fields.
- DoT should use the agreed Expected Despatch/operational deadline policy and must include missed/undispatched eligible orders.
- Cost-per-country must use actual destination countries rather than a generic "Other" grouping.

## Deploying

This ZIP is **root-flat**, matching the repository root layout shown in GitHub. Upload the project files directly into the repository root (including `src` and `public`). In Vercel, leave Root Directory at `./`.

Run `npm ci` and `npm run build` in your normal environment, then redeploy Vercel. No new npm dependencies were introduced. The TypeScript syntax was validated, but a full npm/Vite build was not possible in this environment.
