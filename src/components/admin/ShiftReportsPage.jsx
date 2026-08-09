import { FileText } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";

export default function ShiftReportsPage() {
  const { shiftReports } = useShopState();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <FileText size={22} /> Shift Reports
        </h1>
        <p className="text-sm text-gray-500">Every driver cashout, approved and archived automatically.</p>
      </div>

      <Card>
        {shiftReports.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
            <FileText size={28} />
            <p className="text-sm">No shifts closed out yet — they'll show up here after a driver clocks out.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <th className="pb-3 pr-4">Driver</th>
                  <th className="pb-3 pr-4">Shift Ended</th>
                  <th className="pb-3 pr-4 text-right">Deliveries</th>
                  <th className="pb-3 pr-4 text-right">Mileage Fee</th>
                  <th className="pb-3 pr-4 text-right">Card Tips</th>
                  <th className="pb-3 pr-4 text-right">Cash Collected</th>
                  <th className="pb-3 text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {shiftReports.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-gray-900">{r.driverName}</td>
                    <td className="py-3 pr-4 text-gray-500">{new Date(r.approvedAt).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right text-gray-700">{r.deliveries}</td>
                    <td className="py-3 pr-4 text-right text-gray-700">{formatCurrency(r.mileageFee)}</td>
                    <td className="py-3 pr-4 text-right text-gray-700">{formatCurrency(r.tips)}</td>
                    <td className="py-3 pr-4 text-right text-gray-700">-{formatCurrency(r.cashCollected)}</td>
                    <td className={`py-3 text-right font-extrabold ${r.netPayout < 0 ? "text-red-600" : "text-[#00A651]"}`}>
                      {r.netPayout < 0 ? `Driver owes ${formatCurrency(Math.abs(r.netPayout))}` : `Store owes ${formatCurrency(r.netPayout)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
