import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  CalendarDays,
  CircleHelp,
  Clock3,
  FileSpreadsheet,
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
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TowerClient = "startup" | "test" | "api";
type TowerPreset = "7" | "14" | "30" | "60";
type InvoicePart = "storage" | "pickPack" | "shipping" | "inbound" | "other";

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
  shippingOther: number;
  storageDaily: number;
  inboundPerOrder: number;
  otherPerOrder: number;
}> = {
  startup: {
    label: "Startup Ltd", multiplier: 1, stockValue: 1500000,
    pickPack: 1.68, packaging: 0.23, shippingUK: 2.91, shippingNL: 5.52,
    shippingDE: 5.94, shippingFR: 6.12, shippingOther: 7.38,
    storageDaily: 88, inboundPerOrder: 0.31, otherPerOrder: 0.14,
  },
  test: {
    label: "Test Account Ltd", multiplier: 0.78, stockValue: 1080000,
    pickPack: 1.82, packaging: 0.19, shippingUK: 3.10, shippingNL: 5.81,
    shippingDE: 6.13, shippingFR: 6.35, shippingOther: 7.68,
    storageDaily: 64, inboundPerOrder: 0.27, otherPerOrder: 0.18,
  },
  api: {
    label: "API Test Ltd", multiplier: 1.26, stockValue: 1850000,
    pickPack: 1.53, packaging: 0.22, shippingUK: 2.76, shippingNL: 5.40,
    shippingDE: 5.75, shippingFR: 5.89, shippingOther: 7.12,
    storageDaily: 108, inboundPerOrder: 0.28, otherPerOrder: 0.16,
  },
};

const financeColors: Record<InvoicePart, string> = {
  storage: "#9ca3af",
  pickPack: "#4f46e5",
  shipping: "#0ea5e9",
  inbound: "#2bb9a3",
  other: "#f59e0b",
};
const channelColors = ["#4f46e5", "#38bdf8", "#2dd4bf", "#cbd5e1"];
const channelShares = [0.38, 0.3, 0.16, 0.16];
const countryShares = [0.71, 0.12, 0.08, 0.06, 0.03];
const countryLabels = ["United Kingdom", "Netherlands", "Germany", "France", "Other"];
const countryCodes = ["UK", "NL", "DE", "FR", "Other"];
const invoicePartLabels: Record<InvoicePart, string> = {
  storage: "Storage", pickPack: "Pick & pack", shipping: "Shipping", inbound: "Inbound", other: "Other",
};

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

function createSample(client: TowerClient, startDate: Date, dayCount: number) {
  const rates = demoClient[client];
  const periodCount = dayCount <= 14 ? Math.min(dayCount, 7) : Math.min(12, Math.ceil(dayCount / 7));
  const basePerPeriod = Math.floor(dayCount / periodCount);
  const extraDays = dayCount % periodCount;
  const periods: {
    label: string;
    orders: number;
    days: number;
    storage: number;
    pickPack: number;
    shipping: number;
    inbound: number;
    other: number;
    total: number;
  }[] = [];
  let daysUsed = 0;
  const blendedShipping = (
    rates.shippingUK * countryShares[0] + rates.shippingNL * countryShares[1]
    + rates.shippingDE * countryShares[2] + rates.shippingFR * countryShares[3]
    + rates.shippingOther * countryShares[4]
  );

  for (let index = 0; index < periodCount; index++) {
    const days = basePerPeriod + (index < extraDays ? 1 : 0);
    const from = offsetDate(startDate, daysUsed);
    const until = offsetDate(from, days - 1);
    const noise = 0.96 + 0.09 * Math.sin(1.73 * (index + 1)) + 0.034 * Math.cos(index * 2.61);
    const orders = Math.max(0, Math.round(166 * rates.multiplier * days * noise));
    daysUsed += days;
    const storage = +(days * rates.storageDaily).toFixed(2);
    const pickPack = +(orders * (rates.pickPack + rates.packaging)).toFixed(2);
    const shipping = +(orders * blendedShipping).toFixed(2);
    const inbound = +(orders * rates.inboundPerOrder).toFixed(2);
    const other = +(orders * rates.otherPerOrder).toFixed(2);
    periods.push({
      label: days === 1 ? friendlyDate(from) : `${friendlyDate(from)}–${friendlyDate(until)}`,
      orders, days, storage, pickPack, shipping, inbound, other,
      total: storage + pickPack + shipping + inbound + other,
    });
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
  const channels = allocate(channelShares).map((n, i) => ({
    name: ["Shopify", "Amazon", "Bulk upload", "Other"][i],
    orders: n, share: orders ? 100 * n / orders : 0,
  }));
  const countsByCountry = allocate(countryShares);
  const countryRates = [rates.shippingUK, rates.shippingNL, rates.shippingDE, rates.shippingFR, rates.shippingOther];
  const countries = countsByCountry.map((n, i) => ({
    country: countryLabels[i], code: countryCodes[i], orders: n,
    type: i === 0 ? "Domestic" : "International",
    fulfilment: rates.pickPack + rates.packaging,
    shipping: countryRates[i],
    avgCost: rates.pickPack + rates.packaging + countryRates[i],
  }));
  const expenses = (Object.keys(invoicePartLabels) as InvoicePart[]).reduce((acc, key) => {
    acc[key] = periods.reduce((sum, p) => sum + p[key], 0);
    return acc;
  }, {} as Record<InvoicePart, number>);
  const totalCharges = Object.values(expenses).reduce((a, b) => a + b, 0);
  const totalFFShipping = expenses.pickPack + expenses.shipping;
  const domestic = countries[0];
  const intCount = orders - domestic.orders;
  const intCost = countries.slice(1).reduce((sum, c) => sum + c.avgCost * c.orders, 0);
  const dotOnTime = Math.round(orders * (0.975 + 0.002 * Math.sin(dayCount / 7 + rates.multiplier)));
  const fillRate = 98.3 - (client === "test" ? 0.65 : client === "api" ? -0.22 : 0);

  return {
    periods, orders, channels, countries, expenses, totalCharges, totalFFShipping,
    costPerOrder: orders ? totalFFShipping / orders : 0,
    costPerPick: rates.pickPack / 1.6, // Demonstration assumption: 1.6 picks per order
    pickPackPerOrder: rates.pickPack + rates.packaging,
    shippingPerOrder: orders ? expenses.shipping / orders : 0,
    domesticCost: domestic.avgCost, internationalCost: intCount ? intCost / intCount : 0,
    stockValue: rates.stockValue, onTime: dotOnTime,
    dot: orders ? dotOnTime / orders * 100 : 0,
    fillRate, backorders: Math.max(0, Math.round(orders * (100 - fillRate) / 100)),
    rates,
  };
}

function TowerKpi({
  label, value, detail, icon: Icon, future = false, tooltip,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  future?: boolean;
  tooltip: string;
}) {
  return (
    <div className={`group relative flex min-h-[132px] flex-col justify-between border border-l-[3px] px-4 py-3.5 shadow-[0_7px_20px_rgba(31,51,78,0.07)] ${future ? "border-amber-200 border-l-amber-500 bg-amber-50" : "border-slate-200 border-l-blue-600 bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`max-w-[205px] text-[10px] font-bold uppercase leading-4 tracking-[0.06em] ${future ? "text-amber-800" : "text-indigo-500"}`}>{label}</div>
        <Icon className={`h-6 w-6 shrink-0 ${future ? "text-amber-400" : "text-slate-300"}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-[25px] font-semibold leading-none tracking-tight ${future ? "text-amber-800" : "text-slate-900"}`}>{value}</span>
        {future && <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">No data</span>}
      </div>
      <div className={`mt-2 text-xs leading-4 ${future ? "text-amber-800" : "text-slate-500"}`}>{detail}</div>
      <span className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-64 border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600 shadow-lg group-hover:block group-focus-within:block">
        {tooltip}
      </span>
    </div>
  );
}

function TowerPanel({
  title, detail, right, children, className = "",
}: {
  title: string;
  detail?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 border border-slate-200 bg-white shadow-[0_6px_18px_rgba(31,51,78,0.05)] ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-5 pb-3 pt-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DemoTag() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800">
      <CircleHelp className="h-3.5 w-3.5" /> Demonstration data
    </span>
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
  const [countryGroup, setCountryGroup] = useState<"all" | "domestic" | "international">("all");

  const rangeValid = !isCustom || Boolean(
    from && to && from <= to && from >= oldestISO && to <= yesterdayISO
      && diffDaysInclusive(from, to) <= 180
  );
  const end = isCustom && rangeValid ? to : yesterdayISO;
  const start = isCustom && rangeValid ? from : isoDate(offsetDate(dateFromISO(end), 1 - Number(preset)));
  const dayCount = isCustom && rangeValid ? diffDaysInclusive(start, end) : Number(preset);
  const data = useMemo(() => createSample(client, dateFromISO(start), dayCount), [client, start, dayCount]);
  const countryRows = data.countries.filter(c => countryGroup === "all" || c.type.toLowerCase() === countryGroup);
  const filenamePrefix = `Control_Tower_DEMO_${client}_${start}_to_${end}`;

  const exportSnapshot = () => {
    const rows: (string | number)[][] = [
      ["CONTROL TOWER — DEMONSTRATION DATA (NOT SPIKE BILLING)", ""],
      ["Client", demoClient[client].label],
      ["Period from", start],
      ["Period to", end],
      ["Metric", "Value"],
      ["Stock held GBP (live snapshot illustration)", data.stockValue],
      ["Orders despatched", data.orders],
      ["Average cost per order (pick & pack + shipping), GBP", data.costPerOrder.toFixed(2)],
      ["Warehouse DoT, %", data.dot.toFixed(2)],
      ["Fill rate, %", data.fillRate.toFixed(2)],
      ["Backorders", data.backorders],
      ["Storage cost, GBP", data.expenses.storage.toFixed(2)],
      ["Pick & pack cost, GBP", data.expenses.pickPack.toFixed(2)],
      ["Shipping cost, GBP", data.expenses.shipping.toFixed(2)],
      ["Inbound cost, GBP", data.expenses.inbound.toFixed(2)],
      ["Other cost, GBP", data.expenses.other.toFixed(2)],
      ["Total illustrative invoice cost, GBP", data.totalCharges.toFixed(2)],
      [],
      ["Orders by channel", "Orders", "Share %"],
      ...data.channels.map(c => [c.name, c.orders, c.share.toFixed(1)]),
      [],
      ["Country", "Orders", "Average FF + shipping per order (GBP)"],
      ...data.countries.map(c => [c.country, c.orders, c.avgCost.toFixed(2)]),
      [],
      ["Period", "Orders", "Storage GBP", "Pick & pack GBP", "Shipping GBP", "Inbound GBP", "Other GBP", "Total GBP"],
      ...data.periods.map(p => [p.label, p.orders, p.storage, p.pickPack, p.shipping, p.inbound, p.other, p.total]),
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
          <p className="mt-1 text-sm text-slate-500">A single view of costs, orders and fulfilment performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DemoTag />
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

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span><strong className="font-semibold text-slate-700">Client:</strong> {data.rates.label} <span className="px-1 text-slate-300">•</span> All costs are illustrative until Spike is connected</span>
        <span>Stock value is a current snapshot; other metrics use the selected period</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <TowerKpi label="Stock held (GBP)" value={GBP0.format(data.stockValue)} detail="Current inventory cost value" icon={Warehouse}
          tooltip="Snapshot of stock held at cost value in GBP. Date filters do not change this illustrative current-stock figure." />
        <TowerKpi label="Orders despatched" value={count(data.orders)} detail="Orders in selected period" icon={Package2}
          tooltip="Demonstration count of orders despatched during the selected reporting period." />
        <TowerKpi label="Cost per order" value={money(data.costPerOrder)} detail="Avg. pick & pack + shipping" icon={PoundSterling}
          tooltip="Illustrative average using client-specific demo rates. Real amounts require actual Spike invoice items, contract rates and adjustments. Storage and inbound excluded." />
        <TowerKpi label="Warehouse DoT (overall)" value={`${data.dot.toFixed(2)}%`} detail={`${count(data.onTime)} of ${count(data.orders)} on time`} icon={Clock3}
          tooltip="Illustrative DoT. Live calculation should use Expected Despatch to determine due day and check actual despatch against the agreed operational deadline." />
        <TowerKpi label="Fill rate" value={`${data.fillRate.toFixed(2)}%`} detail="Orders fulfilled without shortfall" icon={Percent}
          tooltip="Illustrative order fill rate. Final definition should be confirmed with Operations, including partial shipments and backorders." />
        <TowerKpi label="Delivery on time" value="—" detail="GECO integration planned" icon={Truck} future
          tooltip="No data yet. Delivery on time will be added when GECO integration is available and carrier delivery targets are agreed." />
        <TowerKpi label="Damaged / quarantine" value="—" detail="Stock reclassification planned" icon={AlertTriangle} future
          tooltip="No data yet. Damaged and quarantine stock reporting will follow the separate stock reclassification task." />
        <TowerKpi label="Backorders" value={count(data.backorders)} detail="Illustrative outstanding orders" icon={ShoppingCart}
          tooltip="Demonstration only. Live backorder count requires agreed WMS status rules and eligibility criteria." />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <TowerPanel title="Invoice breakdown" detail="Illustrative charges by billing category over time" className="xl:col-span-7"
          right={<div className="text-right"><div className="text-[10px] uppercase tracking-wide text-slate-400">Total charges</div><div className="text-lg font-semibold text-slate-900">{GBP0.format(data.totalCharges)}</div></div>}>
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
            {(Object.keys(invoicePartLabels) as InvoicePart[]).map(part => (
              <span key={part} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="h-2.5 w-2.5" style={{ background: financeColors[part] }} />{invoicePartLabels[part]}
              </span>
            ))}
          </div>
          <div className="h-[280px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.periods} margin={{ top: 8, right: 8, bottom: 15, left: 7 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" interval={0} angle={data.periods.length > 7 ? -30 : 0} textAnchor={data.periods.length > 7 ? "end" : "middle"} height={data.periods.length > 7 ? 56 : 34} />
                <YAxis tickFormatter={v => `£${Math.round(Number(v)/1000)}k`} tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" width={45} />
                <Tooltip formatter={(value: number, name: string) => [money(Number(value)), invoicePartLabels[name as InvoicePart] || name]}
                  contentStyle={{ background: "white", border: "1px solid #e2e8f0", fontSize: 12 }} />
                {(Object.keys(invoicePartLabels) as InvoicePart[]).map((part, index) => (
                  <Bar key={part} dataKey={part} stackId="invoice" fill={financeColors[part]} radius={index === 4 ? [3, 3, 0, 0] : undefined} maxBarSize={56} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            <span>Includes storage, pick & pack, shipping, inbound and other charges</span>
            <span>Spike connection pending</span>
          </div>
        </TowerPanel>

        <TowerPanel title="Orders by channel" detail="Share of despatched orders by source" className="xl:col-span-5"
          right={<span className="text-xs font-semibold text-slate-500">{count(data.orders)} orders</span>}>
          <div className="relative h-[255px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.channels} dataKey="orders" nameKey="name" cx="50%" cy="50%" innerRadius="58%" outerRadius="84%" paddingAngle={2} strokeWidth={0}>
                  {data.channels.map((item, index) => <Cell key={item.name} fill={channelColors[index]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => [count(Number(value)), "Orders"]} contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-semibold text-slate-900">{count(data.orders)}</div>
              <div className="text-[11px] uppercase tracking-wide text-slate-400">Orders</div>
            </div>
          </div>
          <div className="space-y-2">
            {data.channels.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5" style={{ background: channelColors[index] }} />{item.name}</div>
                <div className="font-medium text-slate-800">{count(item.orders)} <span className="ml-1.5 font-normal text-slate-400">{item.share.toFixed(1)}%</span></div>
              </div>
            ))}
          </div>
        </TowerPanel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <TowerPanel title="Cost per order (FF + shipping)" detail="Domestic, international and country-level comparisons" className="xl:col-span-7"
          right={<DemoTag />}>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Domestic · UK</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{money(data.domesticCost)}</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Per despatched order</div>
            </div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">International · avg</div>
              <div className="mt-1 text-xl font-semibold text-slate-900">{money(data.internationalCost)}</div>
              <div className="mt-0.5 text-[11px] text-slate-500">Per despatched order</div>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-2" aria-label="Filter cost chart by destination">
            {(["all", "domestic", "international"] as const).map(group => (
              <button key={group} type="button" onClick={() => setCountryGroup(group)}
                className={`border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${countryGroup === group ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                {group === "all" ? "All countries" : group}
              </button>
            ))}
          </div>
          <div className="h-[215px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryRows} layout="vertical" margin={{ left: 20, right: 24, top: 2, bottom: 4 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `£${v}`} tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
                <YAxis dataKey="country" type="category" width={105} tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
                <Tooltip formatter={(value: number) => [money(Number(value)), "Avg. cost / order"]} contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="avgCost" fill="#4f46e5" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
            <div><div className="text-[10px] uppercase tracking-wide text-slate-400">Pick & pack / order</div><div className="mt-1 text-sm font-semibold text-slate-800">{money(data.pickPackPerOrder)}</div></div>
            <div><div className="text-[10px] uppercase tracking-wide text-slate-400">Cost per pick</div><div className="mt-1 text-sm font-semibold text-slate-800">{money(data.costPerPick)}</div></div>
            <div><div className="text-[10px] uppercase tracking-wide text-slate-400">Shipping / order</div><div className="mt-1 text-sm font-semibold text-slate-800">{money(data.shippingPerOrder)}</div></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Example client rates; cost per pick assumes 1.6 picks/order. Storage and inbound are excluded from cost per order.</div>
        </TowerPanel>

        <TowerPanel title="Orders despatched" detail="Volume trend across the selected period" className="xl:col-span-5"
          right={<span className="text-xs font-semibold text-slate-500">{count(data.orders)} total</span>}>
          <div className="h-[345px] min-w-0 pt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.periods} margin={{ left: 0, right: 10, top: 10, bottom: 20 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" interval={0} angle={data.periods.length > 7 ? -30 : 0} textAnchor={data.periods.length > 7 ? "end" : "middle"} height={data.periods.length > 7 ? 55 : 35} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" width={45} />
                <Tooltip formatter={(value: number) => [count(Number(value)), "Orders"]} contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={55} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500">Grouping changes automatically for short and long date ranges.</div>
        </TowerPanel>
      </div>

      <div className="pb-3 text-[11px] text-slate-400">Phase 3 concept · Sample data for initial layout review only. No live Spike or WMS feeds are connected to this Control Tower mock-up.</div>
    </div>
  );
}
