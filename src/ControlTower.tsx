import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  CalendarDays,
  Clock3,
  MessageCircle,
  Package2,
  Percent,
  PoundSterling,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TowerClient = "startup" | "test" | "api";
type TowerPreset = "7" | "14" | "30" | "60";
type InvoicePart = "inbound" | "pickPack" | "storage" | "b2b" | "vas" | "shipping";


/**
 * Phase 3 demonstration data only.
 * Actual finance and per-order pricing must be sourced from Spike, with the
 * client's rate-card version and invoice adjustments applied on the backend.
 */
const demoClient: Record<TowerClient, {
  label: string;
  multiplier: number;
  stockValue: number;
  pickPack: number;
  packaging: number;
  shippingUK: number;
  shippingNL: number;
  shippingDE: number;
  shippingFR: number;
  shippingIE: number;
  shippingES: number;
  storageDaily: number;
  inboundPerOrder: number;
  kittingPerKittedOrder: number;
  b2bPerOrder: number;
  vasPerOrder: number;
}> = {
  startup: {
    label: "Startup Ltd", multiplier: 1, stockValue: 1500000,
    pickPack: 1.68, packaging: 0.23, shippingUK: 2.91, shippingNL: 5.52,
    shippingDE: 5.94, shippingFR: 6.12, shippingIE: 5.75, shippingES: 6.58,
    storageDaily: 88, inboundPerOrder: 0.31, kittingPerKittedOrder: 1.18, b2bPerOrder: 0.16, vasPerOrder: 0.08,
  },
  test: {
    label: "Test Account Ltd", multiplier: 0.78, stockValue: 1080000,
    pickPack: 1.82, packaging: 0.19, shippingUK: 3.10, shippingNL: 5.81,
    shippingDE: 6.13, shippingFR: 6.35, shippingIE: 6.01, shippingES: 6.91,
    storageDaily: 64, inboundPerOrder: 0.27, kittingPerKittedOrder: 1.36, b2bPerOrder: 0.18, vasPerOrder: 0.07,
  },
  api: {
    label: "API Test Ltd", multiplier: 1.26, stockValue: 1850000,
    pickPack: 1.53, packaging: 0.22, shippingUK: 2.76, shippingNL: 5.40,
    shippingDE: 5.75, shippingFR: 5.89, shippingIE: 5.61, shippingES: 6.39,
    storageDaily: 108, inboundPerOrder: 0.28, kittingPerKittedOrder: 1.09, b2bPerOrder: 0.15, vasPerOrder: 0.09,
  },
};

const financeColors: Record<InvoicePart, string> = {
  inbound: "#20b7a5",
  pickPack: "#4f46e5",
  storage: "#94a3b8",
  b2b: "#f59e0b",
  vas: "#a855f7",
  shipping: "#0ea5e9",
};
const countryShares = [0.64, 0.12, 0.08, 0.06, 0.055, 0.045];
const countryLabels = ["United Kingdom", "Netherlands", "Germany", "France", "Ireland", "Spain"];
const countryCodes = ["UK", "NL", "DE", "FR", "IE", "ES"];
const countryColors = ["#4f46e5", "#0ea5e9", "#2bb9a3", "#f59e0b", "#a855f7", "#64748b"];

// Separate storefronts within each channel. Each segment counts real orders
// in the illustration, not a separate channel total added on top.
const orderStores = [
  { key: "amazonStore1", channel: "Amazon", store: "Store 1", color: "#4f46e5", weight: 0.35 },
  { key: "shopifyStore1", channel: "Shopify", store: "Store 1", color: "#15803d", weight: 0.17 },
  { key: "shopifyStore2", channel: "Shopify", store: "Store 2", color: "#4ade80", weight: 0.12 },
  { key: "ebayStore1", channel: "eBay", store: "Store 1", color: "#0284c7", weight: 0.075 },
  { key: "ebayStore2", channel: "eBay", store: "Store 2", color: "#38bdf8", weight: 0.055 },
  { key: "ebayStore3", channel: "eBay", store: "Store 3", color: "#a5d8ff", weight: 0.04 },
  { key: "tiktokStore1", channel: "TikTok", store: "Store 1", color: "#f59e0b", weight: 0.11 },
  { key: "bulkUpload", channel: "Bulk upload", store: "Upload", color: "#94a3b8", weight: 0.08 },
] as const;
const orderServices = [
  { key: "evriInternational", label: "Evri International", color: "#7c3aed", weight: 0.19 },
  { key: "evriDomesticStandard", label: "Evri Domestic Standard", color: "#0ea5e9", weight: 0.45 },
  { key: "evriDomestic24hr", label: "Evri Domestic 24hr", color: "#2bb9a3", weight: 0.36 },
] as const;

type StoreKey = typeof orderStores[number]["key"];
type ServiceKey = typeof orderServices[number]["key"];
type SamplePeriod = {
  label: string;
  orders: number;
  days: number;
  total: number;
} & Record<InvoicePart | StoreKey | ServiceKey, number>;

const invoicePartLabels: Record<InvoicePart, string> = {
  inbound: "Inbound",
  pickPack: "Pick & Pack",
  storage: "Storage",
  b2b: "B2B",
  vas: "VAS",
  shipping: "Shipping",
};
const invoiceParts: InvoicePart[] = ["inbound", "pickPack", "storage", "b2b", "vas", "shipping"];

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 });
const GBP0 = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("en-GB");
const money = (amount: number) => GBP.format(amount);
const count = (amount: number) => NUM.format(Math.round(amount));
const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dateFromISO = (value: string) => new Date(`${value}T12:00:00`);
const offsetDate = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const friendlyDate = (date: Date) => date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const diffDaysInclusive = (from: string, to: string) => {
  const parse = (value: string) => value.split("-").map(Number);
  const [fy, fm, fd] = parse(from);
  const [ty, tm, td] = parse(to);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000) + 1;
};

function createSample(client: TowerClient, startDate: Date, dayCount: number, kittingEnabled: boolean) {
  const rates = demoClient[client];
  // Use real seven-day bins for despatch charts; final partial week is allowed.
  const periodCount = Math.max(1, Math.ceil(dayCount / 7));
  const periods: SamplePeriod[] = [];
  const blendedShipping = (
    rates.shippingUK * countryShares[0] + rates.shippingNL * countryShares[1]
    + rates.shippingDE * countryShares[2] + rates.shippingFR * countryShares[3]
    + rates.shippingIE * countryShares[4] + rates.shippingES * countryShares[5]
  );

  for (let index = 0; index < periodCount; index++) {
    const daysUsed = index * 7;
    const days = Math.min(7, dayCount - daysUsed);
    const from = offsetDate(startDate, daysUsed);
    const until = offsetDate(from, days - 1);
    const period = {
      label: days === 1 ? friendlyDate(from) : `${friendlyDate(from)}–${friendlyDate(until)}`,
      days, orders: 0, total: 0,
      inbound: 0, pickPack: 0, storage: 0, b2b: 0, vas: 0, shipping: 0,
      amazonStore1: 0, shopifyStore1: 0, shopifyStore2: 0,
      ebayStore1: 0, ebayStore2: 0, ebayStore3: 0,
      tiktokStore1: 0, bulkUpload: 0,
      evriInternational: 0, evriDomesticStandard: 0, evriDomestic24hr: 0,
    } as SamplePeriod;

    for (let d = 0; d < days; d++) {
      const date = offsetDate(from, d);
      const ordinal = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
      const dayOfWeek = date.getDay();
      const weekdayWeight = dayOfWeek === 0 ? 0.73 : dayOfWeek === 6 ? 0.84 : dayOfWeek === 1 ? 1.12 : 1;
      const volumeWeight = 0.99 + 0.085 * Math.sin(ordinal / 5.3 + rates.multiplier) + 0.055 * Math.cos(ordinal / 13.1);
      const orders = Math.max(0, Math.round(166 * rates.multiplier * weekdayWeight * volumeWeight));
      const dailyStorage = rates.storageDaily * (1 + 0.16 * Math.sin(ordinal / 12.3 + rates.multiplier));
      const dailyPickPack = orders * (rates.pickPack + rates.packaging) * (1 + 0.028 * Math.sin(ordinal / 8.2));
      const dailyShipping = orders * blendedShipping * (1 + 0.025 * Math.cos(ordinal / 9.7 + rates.multiplier));
      const dailyInbound = orders * rates.inboundPerOrder * (1 + 0.32 * Math.sin(ordinal / 7.9 + 0.3 * rates.multiplier));
      const dailyB2B = orders * rates.b2bPerOrder * (1 + 0.10 * Math.sin(ordinal / 10.4));
      const kittingShare = Math.max(0.02, 0.18 + 0.075 * Math.sin(ordinal / 6.8 + rates.multiplier));
      // Kitting is one component of VAS; when disabled, other VAS activity remains.
      const dailyVAS = orders * rates.vasPerOrder + (kittingEnabled ? Math.round(orders * kittingShare) * rates.kittingPerKittedOrder : 0);
      period.orders += orders;

      // Allocate each order exactly once among the example storefronts.
      const weights = orderStores.map((store, i) => store.weight * (1 + 0.11 * Math.sin(ordinal / (5 + i * 2) + i)));
      const weightTotal = weights.reduce((a, b) => a + b, 0);
      let used = 0;
      orderStores.forEach((store, i) => {
        const n = i === orderStores.length - 1 ? orders - used : Math.round(orders * weights[i] / weightTotal);
        period[store.key] += n;
        used += n;
      });

      // An independent complete allocation of the same orders by carrier service.
      const svcWeights = orderServices.map((service, i) => service.weight * (1 + 0.08 * Math.cos(ordinal / (7 + i * 3) + i)));
      const svcWeightTotal = svcWeights.reduce((a, b) => a + b, 0);
      used = 0;
      orderServices.forEach((service, i) => {
        const n = i === orderServices.length - 1 ? orders - used : Math.round(orders * svcWeights[i] / svcWeightTotal);
        period[service.key] += n;
        used += n;
      });

      period.inbound += dailyInbound;
      period.pickPack += dailyPickPack;
      period.storage += dailyStorage;
      period.b2b += dailyB2B;
      period.vas += dailyVAS;
      period.shipping += dailyShipping;
    }
    for (const key of invoiceParts) {
      period[key] = +period[key].toFixed(2);
      period.total += period[key];
    }
    period.total = +period.total.toFixed(2);
    periods.push(period);
  }

  const orders = periods.reduce((sum, p) => sum + p.orders, 0);
  const allocate = (shares: number[]) => {
    let allocated = 0;
    return shares.map((share, i) => {
      const n = i === shares.length - 1 ? orders - allocated : Math.round(orders * share);
      allocated += n;
      return n;
    });
  };
  const expenses = invoiceParts.reduce((acc, key) => {
    acc[key] = periods.reduce((sum, p) => sum + p[key], 0);
    return acc;
  }, {} as Record<InvoicePart, number>);
  const totalCharges = invoiceParts.reduce((sum, key) => sum + expenses[key], 0);
  const totalFFShipping = expenses.pickPack + expenses.shipping;
  const avgPickPack = orders ? expenses.pickPack / orders : 0;
  const avgShipping = orders ? expenses.shipping / orders : 0;
  const countryRates = [rates.shippingUK, rates.shippingNL, rates.shippingDE, rates.shippingFR, rates.shippingIE, rates.shippingES];
  const countryVolumes = allocate(countryShares);
  const weightedRateTotal = countryVolumes.reduce((sum, n, i) => sum + n * countryRates[i], 0);
  // Country slices represent total spend (additive), not raw averages (non-additive).
  // For each slice, show that country's actual allocated average per order.
  const countries = countryVolumes.map((n, i) => {
    const pickPackTotal = orders ? expenses.pickPack * n / orders : 0;
    const shippingTotal = weightedRateTotal ? expenses.shipping * n * countryRates[i] / weightedRateTotal : 0;
    const totalCost = pickPackTotal + shippingTotal;
    return {
      country: countryLabels[i], code: countryCodes[i], color: countryColors[i],
      orders: n, totalCost,
      avgCost: n ? totalCost / n : 0,
    };
  });
  const breakdown = (["shipping", "pickPack"] as const).map(key => ({
    key, label: invoicePartLabels[key], amount: expenses[key],
    perOrder: orders ? expenses[key] / orders : 0,
    color: financeColors[key],
  })).sort((a, b) => b.perOrder - a.perOrder);
  const costPerOrder = orders ? totalFFShipping / orders : 0;
  const displayedCostPence = Math.round(costPerOrder * 100);
  const pickPackPence = Math.round(avgPickPack * 100);
  const perOrderDisplay = breakdown.map(item => ({
    ...item,
    displayValue: item.key === "pickPack" ? pickPackPence / 100 : (displayedCostPence - pickPackPence) / 100,
  }));
  const channelTotals = orderStores.map(store => ({
    ...store,
    total: periods.reduce((sum, period) => sum + period[store.key], 0),
  }));
  const serviceTotals = orderServices.map(service => ({
    ...service,
    total: periods.reduce((sum, period) => sum + period[service.key], 0),
  }));
  const dotOnTime = Math.min(orders, Math.round(orders * (0.975 + 0.002 * Math.sin(dayCount / 7 + rates.multiplier))));
  const fillRate = 98.3 - (client === "test" ? 0.65 : client === "api" ? -0.22 : 0);

  return {
    periods, orders, countries, expenses, totalCharges, totalFFShipping,
    breakdown: perOrderDisplay, costPerOrder,
    costPerPick: rates.pickPack / 1.6, // Demo assumption: 1.6 picks per order
    pickPackPerOrder: avgPickPack,
    shippingPerOrder: avgShipping,
    channelTotals, serviceTotals,
    stockValue: rates.stockValue, onTime: dotOnTime,
    dot: orders ? dotOnTime / orders * 100 : 0,
    fillRate, backorders: Math.max(0, Math.round(orders * (100 - fillRate) / 100)),
    rates,
  };
}

function TowerKpi({
  label, value, icon: Icon, future = false, tooltip,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  future?: boolean;
  tooltip: string;
}) {
  return (
    <div className={`group relative flex min-h-[110px] flex-col justify-between border border-l-[3px] px-4 py-3.5 shadow-[0_7px_20px_rgba(31,51,78,0.07)] ${future ? "border-amber-200 border-l-amber-500 bg-amber-50" : "border-slate-200 border-l-blue-600 bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`max-w-[205px] text-[10px] font-bold uppercase leading-4 tracking-[0.06em] ${future ? "text-amber-800" : "text-indigo-500"}`}>{label}</div>
        <Icon className={`h-6 w-6 shrink-0 ${future ? "text-amber-400" : "text-slate-300"}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-[25px] font-semibold leading-none tracking-tight ${future ? "text-amber-800" : "text-slate-900"}`}>{value}</span>
        {future && <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">No data</span>}
      </div>
      <span className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-64 border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600 shadow-lg group-hover:block group-focus-within:block">
        {tooltip}
      </span>
    </div>
  );
}

function TowerPanel({
  title, right, children, className = "", future = false,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  future?: boolean;
}) {
  return (
    <section className={`min-w-0 border shadow-[0_6px_18px_rgba(31,51,78,0.05)] ${future ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"} ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-5 pb-3 pt-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function SpikePending({ minHeight = 270 }: { minHeight?: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center" style={{ minHeight }}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-amber-100/60">
        <PoundSterling className="h-7 w-7 text-amber-400" />
      </div>
      <div className="text-2xl font-semibold leading-none text-amber-700">—</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">No data</div>
    </div>
  );
}

function CSPending() {
  return (
    <div className="flex min-h-[138px] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-amber-100/60">
        <MessageCircle className="h-7 w-7 text-amber-400" />
      </div>
      <div className="text-2xl font-semibold leading-none text-amber-700">—</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">No data</div>
    </div>
  );
}

function exportCsv(rows: (string | number)[][], filename: string) {
  const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ControlTower({ client }: { client: TowerClient }) {
  const today = new Date();
  const yesterdayISO = isoDate(offsetDate(today, -1));
  const oldestISO = isoDate(offsetDate(today, -180));
  const [preset, setPreset] = useState<TowerPreset>("30");
  const [isCustom, setIsCustom] = useState(false);
  const [from, setFrom] = useState(isoDate(offsetDate(today, -30)));
  const [to, setTo] = useState(yesterdayISO);

  const rangeValid = !isCustom || Boolean(
    from && to && from <= to && from >= oldestISO && to <= yesterdayISO
      && diffDaysInclusive(from, to) <= 180
  );
  const end = isCustom && rangeValid ? to : yesterdayISO;
  const start = isCustom && rangeValid ? from : isoDate(offsetDate(dateFromISO(end), 1 - Number(preset)));
  const dayCount = isCustom && rangeValid ? diffDaysInclusive(start, end) : Number(preset);
  const data = useMemo(() => createSample(client, dateFromISO(start), dayCount, false), [client, start, dayCount]);
  const filenamePrefix = `Control_Tower_DEMO_${client}_${start}_to_${end}`;

  const exportSnapshot = () => {
    const rows: (string | number)[][] = [
      ["CONTROL TOWER — DEMONSTRATION DATA", ""],
      ["Client", demoClient[client].label],
      ["Period from", start],
      ["Period to", end],
      ["Metric", "Value"],
      ["Stock held GBP (snapshot example)", data.stockValue],
      ["Orders despatched", data.orders],
      ["Warehouse DoT, %", data.dot.toFixed(2)],
      ["Fill rate, %", data.fillRate.toFixed(2)],
      ["Backorders", data.backorders],
      ["Financial metrics", "Unavailable until Spike integration"],
      ["CS Queries", "Unavailable until CS data integration"],
      [],
      ["Period", "Orders", ...orderStores.map(st => `${st.channel} ${st.store}`), ...orderServices.map(s => s.label)],
      ...data.periods.map(p => [p.label, p.orders, ...orderStores.map(st => p[st.key]), ...orderServices.map(s => p[s.key])]),
    ];
    exportCsv(rows, `${filenamePrefix}.csv`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Control Tower</h2>
            <span className="border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Phase 3</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={exportSnapshot} disabled={!rangeValid}
            className="inline-flex items-center gap-2 border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
            <ArrowDownToLine className="h-4 w-4" /> Export demo CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <label className="flex min-w-[170px] flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:flex-none">
          Date
          <select value={preset} disabled={isCustom} onChange={e => setPreset(e.target.value as TowerPreset)}
            className="h-10 min-w-[170px] border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
          </select>
        </label>
        <label className="flex h-10 cursor-pointer items-center gap-2 self-end whitespace-nowrap text-xs font-medium text-slate-700">
          <input type="checkbox" checked={isCustom} onChange={e => setIsCustom(e.target.checked)}
            className="h-4 w-4 accent-blue-600" /> Custom range
        </label>
        {isCustom && (
          <>
            <label className="flex min-w-[135px] flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:flex-none">
              Date from
              <input type="date" value={from} min={oldestISO} max={yesterdayISO} onChange={e => setFrom(e.target.value)}
                className="h-10 border border-slate-200 bg-slate-50 px-2 text-sm font-medium normal-case text-slate-900" />
            </label>
            <label className="flex min-w-[135px] flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:flex-none">
              Date to
              <input type="date" value={to} min={oldestISO} max={yesterdayISO} onChange={e => setTo(e.target.value)}
                className="h-10 border border-slate-200 bg-slate-50 px-2 text-sm font-medium normal-case text-slate-900" />
            </label>
          </>
        )}
        <div className="ml-auto flex items-center gap-1.5 self-end pb-2 text-xs text-slate-500">
          <CalendarDays className="h-4 w-4" />
          {friendlyDate(dateFromISO(start))} – {friendlyDate(dateFromISO(end))}
          <span className="text-slate-400">({dayCount} days)</span>
        </div>
        {!rangeValid && <div className="w-full text-xs font-medium text-rose-600" role="alert">Choose a valid range ending before today, up to 180 days.</div>}
      </div>


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <TowerKpi label="Stock held (GBP)" value={GBP0.format(data.stockValue)} icon={Warehouse}
          tooltip="Snapshot of stock held at cost value in GBP. Date filters do not change this illustrative current-stock figure." />
        <TowerKpi label="Orders despatched" value={count(data.orders)} icon={Package2}
          tooltip="Demonstration count of orders despatched during the selected reporting period." />
        <TowerKpi label="Cost per order" value="—" icon={PoundSterling} future
          tooltip="Requires Spike billing integration for client-specific pick & pack and shipping costs." />
        <TowerKpi label="Warehouse DoT (overall)" value={`${data.dot.toFixed(2)}%`} icon={Clock3}
          tooltip="Illustrative DoT. Live calculation should use Expected Despatch to determine due day and check actual despatch against the agreed operational deadline." />
        <TowerKpi label="Fill rate" value={`${data.fillRate.toFixed(2)}%`} icon={Percent}
          tooltip="Illustrative order fill rate. Final definition should be confirmed with Operations, including partial shipments and backorders." />
        <TowerKpi label="Delivery on time" value="—" icon={Truck} future
          tooltip="No data yet. Delivery on time will be added when GECO integration is available and carrier delivery targets are agreed." />
        <TowerKpi label="Damaged / quarantine" value="—" icon={AlertTriangle} future
          tooltip="No data yet. Damaged and quarantine stock reporting will follow the separate stock reclassification task." />
        <TowerKpi label="Backorders" value={count(data.backorders)} icon={ShoppingCart}
          tooltip="Demonstration only. Live backorder count requires agreed WMS status rules and eligibility criteria." />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
        <TowerPanel title="Invoice breakdown" future className="h-full xl:col-span-8"
          right={<span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Spike pending</span>}>
          <SpikePending minHeight={295} />
        </TowerPanel>
        <TowerPanel title="Per order breakdown" future className="h-full xl:col-span-4"
          right={<span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Spike pending</span>}>
          <SpikePending minHeight={295} />
        </TowerPanel>
      </div>

      <TowerPanel title="CS Queries" future
        right={<span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">CS integration pending</span>}>
        <CSPending />
      </TowerPanel>

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
        <TowerPanel title="Cost per order (FF + Shipping)" future className="h-full xl:col-span-5"
          right={<span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Spike pending</span>}>
          <SpikePending minHeight={480} />
        </TowerPanel>

        <TowerPanel title="Orders by channel" className="h-full xl:col-span-7"
          right={<span className="text-sm font-semibold tabular-nums text-slate-800">{count(data.orders)} total</span>}>
          <div className="h-[300px] min-w-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.periods} margin={{ left: 0, right: 8, top: 10, bottom: 12 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" interval={0}
                  angle={data.periods.length > 6 ? -27 : 0} textAnchor={data.periods.length > 6 ? "end" : "middle"}
                  height={data.periods.length > 6 ? 55 : 35} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" width={46} />
                <Tooltip formatter={(value: number, name: string) => [count(Number(value)), name]}
                  contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0" }} />
                {orderStores.map((store, index) => (
                  <Bar key={store.key} dataKey={store.key} name={`${store.channel} · ${store.store}`}
                    stackId="stores" fill={store.color}
                    radius={index === orderStores.length - 1 ? [3, 3, 0, 0] : undefined} maxBarSize={54} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-3">
            {["Amazon", "Shopify", "eBay", "TikTok", "Bulk upload"].map(channel => {
              const stores = data.channelTotals.filter(s => s.channel === channel);
              return (
                <div key={channel} className="border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-800">
                    <span>{channel}</span><span className="tabular-nums">{count(stores.reduce((sum, s) => sum + s.total, 0))}</span>
                  </div>
                  {stores.map(store => (
                    <div key={store.key} className="flex items-center gap-2 py-0.5 text-[11px] text-slate-600">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: store.color }} />
                      <span className="min-w-0 flex-1">{store.store}</span>
                      <span className="font-medium tabular-nums">{count(store.total)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </TowerPanel>
      </div>

      <TowerPanel title="Orders Despatched"
        right={<span className="text-sm font-semibold tabular-nums text-slate-800">{count(data.orders)} total despatched</span>}>
        <div className="h-[300px] min-w-0 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.periods} margin={{ left: 0, right: 15, top: 10, bottom: 15 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" interval={0}
                angle={data.periods.length > 9 ? -25 : 0} textAnchor={data.periods.length > 9 ? "end" : "middle"}
                height={data.periods.length > 9 ? 55 : 35} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" width={45} />
              <Tooltip formatter={(value: number, name: string) => [count(Number(value)), name]}
                contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0" }} />
              {orderServices.map((service, index) => (
                <Bar key={service.key} dataKey={service.key} name={service.label}
                  stackId="services" fill={service.color}
                  radius={index === orderServices.length - 1 ? [3, 3, 0, 0] : undefined} maxBarSize={70} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
          {data.serviceTotals.map(service => (
            <div key={service.key} className="flex items-center gap-3 border border-slate-100 bg-slate-50/80 px-3 py-3 text-xs">
              <span className="h-3.5 w-3.5 shrink-0 rounded-[2px]" style={{ backgroundColor: service.color }} />
              <span className="min-w-0 flex-1 font-medium text-slate-700">{service.label}</span>
              <span className="text-sm font-semibold tabular-nums text-slate-900">{count(service.total)}</span>
            </div>
          ))}
        </div>
      </TowerPanel>

    </div>
  );
}
