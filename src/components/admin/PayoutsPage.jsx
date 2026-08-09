import { Banknote, CheckCircle2, Clock3, Landmark, ShieldCheck } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";

const LEDGER = [
  { date: "Aug 8, 2026", gross: 1500.0, platformFee: 0, ccFee: 48.0, net: 1452.0, status: "In Transit" },
  { date: "Aug 5, 2026", gross: 2140.75, platformFee: 0, ccFee: 68.5, net: 2072.25, status: "Cleared" },
  { date: "Aug 1, 2026", gross: 1890.4, platformFee: 0, ccFee: 60.5, net: 1829.9, status: "Cleared" },
  { date: "Jul 29, 2026", gross: 2310.1, platformFee: 0, ccFee: 74.0, net: 2236.1, status: "Cleared" },
  { date: "Jul 25, 2026", gross: 1675.2, platformFee: 0, ccFee: 53.6, net: 1621.6, status: "Cleared" },
];

export default function PayoutsPage() {
  const { shop } = useShopState();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">🏦 Bank & Payouts</h1>
        <p className="text-sm text-gray-500">Exactly when your money lands — for every POS and online order.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A651]/10 text-[#00A651]">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-gray-900">Connected Account: {shop.name} (Active)</p>
            <p className="text-xs text-gray-500">Payouts powered by Stripe Connect · bank ••••4821</p>
          </div>
        </div>
        <Button variant="outline" icon={Landmark}>
          Update Bank Details
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#121212] p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#00A651]">
            <Banknote size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white/60">Next Payout</p>
            <p className="text-4xl font-extrabold tracking-tight">{formatCurrency(1452.0)}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
              <Clock3 size={13} /> Expected arrival: Tomorrow by 8:00 AM
            </p>
          </div>
        </div>
      </div>

      <Card title="Transfer Ledger" description="Historical batch transfers from card processing to your bank account.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4 text-right">Gross Processing</th>
                <th className="pb-3 pr-4 text-right">Platform Fees</th>
                <th className="pb-3 pr-4 text-right">CC Processing Fees</th>
                <th className="pb-3 pr-4 text-right">Net Payout</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {LEDGER.map((row) => (
                <tr key={row.date} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 font-semibold text-gray-900">{row.date}</td>
                  <td className="py-3 pr-4 text-right text-gray-600">{formatCurrency(row.gross)}</td>
                  <td className="py-3 pr-4 text-right font-bold text-[#00A651]">{formatCurrency(row.platformFee)}</td>
                  <td className="py-3 pr-4 text-right text-gray-600">-{formatCurrency(row.ccFee)}</td>
                  <td className="py-3 pr-4 text-right font-bold text-gray-900">{formatCurrency(row.net)}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        row.status === "Cleared" ? "bg-[#00A651]/10 text-[#00A651]" : "bg-[#F39C12]/10 text-[#F39C12]"
                      }`}
                    >
                      {row.status === "Cleared" && <CheckCircle2 size={11} />}
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Platform Fees are $0.00 on every payout — DeepDish never takes a cut of your sales.
        </p>
      </Card>
    </div>
  );
}
