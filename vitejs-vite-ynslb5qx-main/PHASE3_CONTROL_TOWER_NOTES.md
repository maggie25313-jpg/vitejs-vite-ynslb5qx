# Control Tower — Phase 3 demo

This version changes **only the Control Tower tab**. Existing Inventory Health, Inbound/Delivery and Data Hub pages are retained.

## What's in the demo

- Eight headline KPI positions: Stock Held (GBP), Orders Despatched, Cost per Order, Warehouse DoT, Fill Rate, Delivery on Time, Damaged/Quarantine, Backorders.
- Stacked invoice charges over time: Storage, Pick & Pack, Shipping, Inbound, Other.
- Orders by channel: Shopify, Amazon, Bulk Upload, Other.
- Cost per order (fulfilment + shipping), with Domestic / International / By Country filtering, and illustrative cost per pick.
- Orders Despatched volume trend.
- Future-scope areas: Exceptions & reconciliation, B2B/kitting, Packaging, Customer Service.
- Client selector (existing global control), date presets 7/14/30/60 days, custom range up to 180 days, yesterday as maximum selectable day, sample CSV export.

## Data source / reliability

**No API integration is included.** All numbers on Control Tower are clearly labelled **demonstration data** and generated locally to show the layout and filter interactions. The sample rate cards in `src/ControlTower.tsx` are fictional and must not be used for real client billing.

Before launch, source charges from **Spike** with client-specific contracts/rate-card effective dates and, ideally, actual invoice line items / adjustments.

- Stock Value: current WMS inventory quantity × SKU cost, with clear exclusions and currency conversion policy.
- Orders Despatched: WMS event data, grouped by actual despatch date/time for this reporting trend.
- DoT: align the reporting cohort to **Expected Despatch** date (if this is the authoritative WMS cut-off assignment) and compare actual despatch against the operational deadline; include eligible orders that never despatched.
- Fill Rate: agree on order-line/units vs complete-order definition, partial shipments and backorders before implementing.
- Cost per Order: agreed actual fulfilment + shipping charges for the selected despatched orders divided by matching order count; confirm treatment of fuel/return surcharges, credits, tax and adjustments.
- Cost per Pick: needs actual picks/units and allocation logic. The demo assumes 1.6 picks per order for presentation purposes only.
- Destination cost: use actual shipping destination country, service and rate/cost, not static assumptions.
- Delivery On Time, Damaged/Quarantine and Backorders: placeholders/illustrative until data definition and sources are confirmed.

## Deployment

The project retains the existing Vite / React structure. Replace the files in the repository with the contents of this ZIP; keep `src/ControlTower.tsx` alongside `src/App.tsx`.

Run `npm ci` and `npm run build` in a normal development environment, then redeploy Vercel from GitHub. No new npm package dependencies were added.
