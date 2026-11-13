# Control Tower — Phase 3 demo

This version changes **only the Control Tower tab**. Existing Inventory Health, Inbound/Delivery and Data Hub pages are retained.

## What's in the demo

- Eight headline KPI positions: Stock Held (GBP), Orders Despatched, Cost per Order, Warehouse DoT, Fill Rate, Delivery on Time, Damaged/Quarantine, Backorders.
- Stacked invoice charges over time: Storage, Pick & Pack, Shipping, Inbound, Kitting (when enabled), Other.
- Kitting enabled/disabled checkbox next to the invoice chart is a demo-only substitute for a future client setting. It updates invoice totals, the chart and the per-order breakdown.
- A ranked, visual **Per order breakdown** replaces Orders by Channel. It shows Shipping, Pick & Pack, Storage, Inbound, Kitting and Other cost per order, highest to lowest, with a weighted stacked bar and illustrative cost per pick.
- Storage / Inbound / Kitting averages are recalculated from period charges and order volumes as date filters change (7 / 14 / 30 / 60 days or custom).
- Cost per order (fulfilment + shipping) by **all** countries, without domestic/international chart filter; illustrative UK and International summary cards remain.
- Orders Despatched volume trend.
- The bottom **Additional operational insights** and **Spike billing integration** information panels, plus the bottom concept disclaimer, have been removed from the Control Tower layout.
- Delivery on Time and Damaged/Quarantine KPI cards use an amber background and display no data while their integrations remain pending.
- Client selector (existing global control), date presets 7/14/30/60 days, custom range up to 180 days, yesterday as maximum selectable day, sample CSV export.

## Data source / reliability

**No API integration is included.** All numbers on Control Tower are clearly labelled **demonstration data** and generated locally to show the layout and filter interactions. The sample rate cards in `src/ControlTower.tsx` are fictional and must not be used for real client billing.

Before launch, source charges from **Spike** with client-specific contracts/rate-card effective dates and, ideally, actual invoice line items / adjustments.

- Stock Value: current WMS inventory quantity × SKU cost, with clear exclusions and currency conversion policy.
- Orders Despatched: WMS event data, grouped by actual despatch date/time for this reporting trend.
- DoT: align the reporting cohort to **Expected Despatch** date (if this is the authoritative WMS cut-off assignment) and compare actual despatch against the operational deadline; include eligible orders that never despatched.
- Fill Rate: agree on order-line/units vs complete-order definition, partial shipments and backorders before implementing.
- Cost per Order KPI: agreed actual fulfilment + shipping charges for the selected despatched orders divided by matching order count; confirm treatment of fuel/return surcharges, credits, tax and adjustments.
- Per-order breakdown: category charges (including storage/inbound/kitting) divided by period despatched orders; this is an illustrative allocation model and needs agreement on true Spike charge allocation and timing. The all-in breakdown total is distinct from the FF + shipping-only KPI.
- Cost per Pick: needs actual picks/units and allocation logic. The demo assumes 1.6 picks per order for presentation purposes only.
- Destination cost: use actual shipping destination country, service and rate/cost, not static assumptions.
- Delivery on Time: no data until **GECO** integration and agreed carrier SLA definitions are available.
- Damaged/Quarantine: no data until the separate **stock reclassification** work is implemented.
- Backorders: illustrative until data definition and sources are confirmed.

## Deployment

The project retains the existing Vite / React structure. Replace the files in the repository with the contents of this ZIP; keep `src/ControlTower.tsx` alongside `src/App.tsx`.

Run `npm ci` and `npm run build` in a normal development environment, then redeploy Vercel from GitHub. No new npm package dependencies were added.
