import { Database, Download, Users } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";

function toCsv(customers) {
  const header = ["Name", "Email", "Phone", "Total Orders", "Lifetime Value"];
  const rows = customers.map((c) => [c.name, c.email, c.phone, c.totalOrders, c.lifetimeValue.toFixed(2)]);
  const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export default function CrmPage() {
  const { shop, customers } = useShopState();

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
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Customer CRM</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">Every customer who's ever ordered — yours to keep, no matter what.</p>
        </div>
        <Button variant="primary" icon={Download} onClick={handleExport} disabled={customers.length === 0}>
          Export to CSV
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[#00A651]/30 bg-[#00A651]/5 p-4 dark:bg-[#00A651]/10">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00A651] text-white">
          <Database size={18} />
        </span>
        <p className="text-sm font-semibold text-[#00713a] dark:text-[#4ADE80]">
          This is your data — not a delivery app's. Export it any time, no strings attached.
        </p>
      </div>

      <Card>
        {customers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400 dark:text-white/30">
            <Users size={28} />
            <p className="text-sm">No customers yet — they'll show up here after their first order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400 dark:border-white/10 dark:text-white/30">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4 text-right">Total Orders</th>
                  <th className="pb-3 text-right">Lifetime Value</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 dark:border-white/5">
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">{c.name}</td>
                    <td className="py-3 pr-4 text-gray-500 dark:text-white/40">{c.email}</td>
                    <td className="py-3 pr-4 text-gray-500 dark:text-white/40">{c.phone}</td>
                    <td className="py-3 pr-4 text-right text-gray-700 dark:text-white/60">{c.totalOrders}</td>
                    <td className="py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(c.lifetimeValue)}</td>
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
