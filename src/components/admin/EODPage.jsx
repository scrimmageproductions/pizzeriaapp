import { useState } from "react";
import { Banknote, CheckCircle2, CreditCard, PiggyBank, Printer, Receipt } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { computeEODSummary, startOfToday } from "../../utils/eodMath";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";

export default function EODPage() {
  const { shop, orders, zReports } = useShopState();
  const { runZReport: dispatchZReport, addPrintEvent } = useShopActions();
  const [justClosed, setJustClosed] = useState(false);

  const periodStart = shop.lastZReportAt || startOfToday();
  const summary = computeEODSummary(orders, periodStart);

  const runZReport = () => {
    dispatchZReport(summary);
    addPrintEvent(
      `🖨️ Printing EOD Z-Report — Gross ${formatCurrency(summary.grossSales)}, Net ${formatCurrency(summary.netSales)}, ${summary.orderCount} orders...`
    );
    setJustClosed(true);
    setTimeout(() => setJustClosed(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <Receipt size={22} /> End of Day
        </h1>
        <p className="text-sm text-gray-500">
          Since {new Date(periodStart).toLocaleString()} — reconcile the register and print your Z-report.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9]">
              <PiggyBank size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(summary.grossSales)}</p>
              <p className="text-xs text-gray-500">Gross sales</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F39C12]/10 text-[#F39C12]">
              <Receipt size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(summary.taxCollected)}</p>
              <p className="text-xs text-gray-500">Taxes collected</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A651]/10 text-[#00A651]">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(summary.netSales)}</p>
              <p className="text-xs text-gray-500">Net sales</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Payment Breakdown" description={`${summary.orderCount} order${summary.orderCount === 1 ? "" : "s"} today`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Banknote size={16} className="text-[#00A651]" /> Cash
            </span>
            <span className="text-lg font-extrabold text-gray-900">{formatCurrency(summary.cashSales)}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CreditCard size={16} className="text-[#0EA5E9]" /> Credit / Card
            </span>
            <span className="text-lg font-extrabold text-gray-900">{formatCurrency(summary.creditSales)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-5">
          {justClosed ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#00A651]/10 py-4 text-sm font-bold text-[#00A651]">
              <CheckCircle2 size={18} /> Register closed — Z-report printed.
            </div>
          ) : (
            <Button size="lg" icon={Printer} className="w-full py-4 text-base" onClick={runZReport} disabled={summary.orderCount === 0}>
              Run Z-Report & Close Register
            </Button>
          )}
          {summary.orderCount === 0 && !justClosed && (
            <p className="mt-2 text-center text-xs text-gray-400">No paid orders in this period yet.</p>
          )}
        </div>
      </Card>

      {zReports?.length > 0 && (
        <Card title="Past Z-Reports">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <th className="pb-3 pr-4">Closed</th>
                  <th className="pb-3 pr-4 text-right">Orders</th>
                  <th className="pb-3 pr-4 text-right">Gross</th>
                  <th className="pb-3 pr-4 text-right">Tax</th>
                  <th className="pb-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {zReports.map((r, i) => (
                  <tr key={r.closedAt || i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-gray-700">{new Date(r.closedAt).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right text-gray-700">{r.orderCount}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-gray-900">{formatCurrency(r.grossSales)}</td>
                    <td className="py-3 pr-4 text-right text-gray-500">{formatCurrency(r.taxCollected)}</td>
                    <td className="py-3 text-right font-bold text-gray-900">{formatCurrency(r.netSales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
