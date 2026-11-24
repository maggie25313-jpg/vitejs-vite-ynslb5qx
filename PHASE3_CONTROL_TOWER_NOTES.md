# Control Tower – Phase 3 (v9)

## Integration preview switches

Four unchecked demo switches appear beneath the date filters:

- **Spike integration done**: unlocks the Cost per Order KPI, Invoice Breakdown stacked bars (Inbound, Pick & Pack, Storage, B2B, VAS, Shipping), Per Order Breakdown doughnut, and Cost per Order by Country doughnut. The Invoice panel retains the demo Kitting enabled checkbox, affecting VAS charges. Costs update with the client and reporting period. Unchecking Spike restores all corresponding yellow placeholders with no figures.
- **GECO integration done**: replaces the yellow Delivery on Time KPI with an illustrative delivery percentage for the selected period. Unchecking restores the placeholder.
- **Stock reclassification done**: replaces the yellow Damaged / Quarantine KPI with a demonstration stock unit count; a hover tooltip shows illustrative stock value. Unchecking restores the placeholder.

The checkboxes **simulate completion for UI previews only**; no live integrations are connected, and they start unchecked on page load. The exported demo CSV respects the switches and excludes unavailable figures.

CS integration done is a fourth demo switch. When checked, CS Queries displays a ranked five-category sample breakdown with percentages, counts and an export; when unchecked, it remains a yellow No Data placeholder. No real CS ticket feed is connected. Existing Inventory, Inbound/Delivery, Data Hub, client selector, and date filter functionality are unchanged.

## Deployment

Upload ZIP contents directly to the GitHub repository root, retaining the Vercel root directory `./`.


## v10 change: chart percentages
- Orders by channel stacked-bar tooltips now show counts and percentages of the hovered week’s total orders. Individual stores and channel summary tiles show counts and percentages of all orders in the selected reporting range.
- Orders Despatched by service stacked-bar tooltips now show counts and percentages of the hovered week’s total orders. The service summary cards show counts and percentages of all orders in the selected reporting range.
- All percentages respond to date/client filters and use one decimal place.

## v10 addition: CS integration demo toggle
- Added an unchecked **CS integration done** checkbox. When enabled, the CS Queries panel presents date/client-responsive sample cases for Delivery enquiries, Undelivered parcels, Returns/RTS, Lost in network, and Damaged deliveries. Exported demo CSV includes these only when enabled.
