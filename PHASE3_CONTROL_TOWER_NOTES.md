# Control Tower – Phase 3 (v7)

## Current demonstration view

- Minimal copy: no descriptive subtitles beneath the page heading, KPI cards or chart headings; unnecessary notes removed.
- WMS-oriented example metrics remain active: Stock Held (GBP, based on SKU cost prices), Orders Despatched, Warehouse DoT, Fill Rate and Backorders.
- Order breakdowns remain active: CS Queries, Orders by Channel (including Shopify and eBay storefronts) and Orders Despatched by shipping service.
- Date filters: 7, 14, 30, 60 days and custom dates. Client access/filter behaviour unchanged.

## Deferred integration placeholders

Until the integrations are available, these display **pale amber panels, no figures**, rather than mock financial values:
- Cost per Order KPI
- Invoice Breakdown
- Per Order Breakdown
- Cost per Order (FF + Shipping) by country

Delivery on Time stays amber pending GECO; Damaged/Quarantine stays amber pending Stock Reclassification.

The CSV demo download does not export financial values for deferred Spike features.

## Deployment

Upload project contents to the repository root and leave Vercel Root Directory as `./`.
