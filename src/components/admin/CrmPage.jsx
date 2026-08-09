import { useState } from "react";
import { Database, Download, Settings2, Star, Users } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import AdjustPointsModal from "./AdjustPointsModal";
import LoyaltySettingsCard from "./LoyaltySettingsCard";

function toCsv(customers) {
  const header = ["Name", "Email", "Phone", "Total Orders", "Lifetime Value", "Loyalty Points", "Account Type"];
  const rows = customers.map((c) => [c.name, c.email, c.phone, c.totalOrders, c.lifetimeValue.toFixed(2), c.loyaltyPoints || 0, c.accountType || "guest"]);
  const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export default function CrmPage() {
  const { shop, customers } = useShopState();
  const { adjustCustomerPoints } = useShopActions();
  const [adjustingCustomer, setAdjustingCustomer] = useState(null);

  const sorted = [...customers].sort((a, b) => b.lifetimeValue - a.lifetimeValue);

  const handleExport = () => {
    const csv = toCsv(sorted);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${shop.slug}-customers.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Customer CRM</h1>
          <p className="text-sm text-gray-500">Every customer who's ever ordered — yours to keep, no matter what.</p>
        </div>
        <Button variant="primary" icon={Download} onClick={handleExport} disabled={customers.length === 0}>
          Export to CSV
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[#00A651]/30 bg-[#00A651]/5 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00A651] text-white">
          <Database size={18} />
        </span>
        <p className="text-sm font-semibold text-[#00713a]">
          This is your data — not a delivery app's. Export it any time, no strings attached.
        </p>
      </div>

      <Card>
        {customers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
            <Users size={28} />
            <p className="text-sm">No customers yet — they'll show up here after their first order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4 text-right">Total Orders</th>
                  <th className="pb-3 pr-4 text-right">Lifetime Value</th>
                  <th className="pb-3 pr-4 text-right">Loyalty Points</th>
                  <th className="pb-3 text-right">Adjust</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{c.phone}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          c.accountType === "registered" ? "bg-[#7C3AED]/10 text-[#7C3AED]" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {c.accountType === "registered" ? "Registered" : "Guest"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-gray-700">{c.totalOrders}</td>
                    <td className="py-3 pr-4 text-right font-bold text-gray-900">{formatCurrency(c.lifetimeValue)}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-[#E31837]">
                        <Star size={12} className="fill-current" /> {c.loyaltyPoints || 0}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setAdjustingCustomer(c)}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200"
                      >
                        <Settings2 size={12} /> Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <LoyaltySettingsCard />

      <AdjustPointsModal
        customer={adjustingCustomer}
        onClose={() => setAdjustingCustomer(null)}
        onSave={adjustCustomerPoints}
      />
    </div>
  );
}
