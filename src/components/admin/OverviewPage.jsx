import { useState } from "react";
import { Link2, TrendingUp, Copy, Check, ExternalLink, LayoutGrid, Users, PiggyBank, Ban, Palette, Database, Sparkles, Ticket } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import { DEFAULT_CONVERSION_METRICS } from "../../data/loyalty";
import Card from "../shared/Card";
import Button from "../shared/Button";

const COMMISSION_RATE = 0.15;

const PILLARS = [
  { icon: Ban, label: "0% Commissions", description: "Flat $99/month. Every order is 100% yours." },
  { icon: Palette, label: "100% White-Labeled", description: "No DeepDish branding, anywhere your customers look." },
  { icon: Database, label: "You Own the Data", description: "Every customer record is exportable, always." },
];

export default function OverviewPage() {
  const { shop, orders, customers } = useShopState();
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/${shop.slug}`;
  const activeOrderCount = orders.filter((o) => !o.completedAt).length;
  const totalSales = shop.mockSalesBaseline + orders.reduce((sum, o) => sum + o.total, 0);
  const commissionSaved = totalSales * COMMISSION_RATE;
  const conversionMetrics = shop.conversionMetrics || DEFAULT_CONVERSION_METRICS;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      // clipboard API unavailable — the URL is still visible to copy manually.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title={`Welcome back, ${shop.name}`} description="Here's your live ordering site." icon={Link2}>
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center">
          <p className="flex-1 truncate font-mono text-sm text-gray-700">{publicUrl}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ExternalLink}
              onClick={() => window.open(`/${shop.slug}`, "_blank", "noopener,noreferrer")}
            >
              Visit Site
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9]">
              <TrendingUp size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalSales)}</p>
              <p className="text-xs text-gray-500">Total sales this month</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F39C12]/10 text-[#F39C12]">
              <LayoutGrid size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{activeOrderCount}</p>
              <p className="text-xs text-gray-500">Active orders</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A651]/10 text-[#00A651]">
              <Users size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{customers.length}</p>
              <p className="text-xs text-gray-500">Customers in your CRM</p>
            </div>
          </div>
        </Card>
      </div>

      {/* The moat, front and center */}
      <div className="overflow-hidden rounded-2xl bg-[#121212] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E31837]">
              <PiggyBank size={26} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white/60">Commission Saved this Month</p>
              <p className="text-4xl font-extrabold tracking-tight">{formatCurrency(commissionSaved)}</p>
            </div>
          </div>
          <p className="max-w-xs text-sm text-white/50">
            That's what a 15% delivery-app commission would have taken from{" "}
            <strong className="text-white/80">{formatCurrency(totalSales)}</strong> in sales. With DeepDish, it stays
            in your pocket.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-[#7C3AED]/[0.05] to-[#E31837]/[0.05] p-6 shadow-sm ring-2 ring-[#7C3AED]/20 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#E31837] text-white">
              <Ticket size={26} />
            </span>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                <Sparkles size={13} className="text-[#7C3AED]" /> Customers Converted from 3rd-Party Apps
              </p>
              <p className="text-4xl font-extrabold tracking-tight text-gray-900">{conversionMetrics.customersConverted}</p>
              <p className="mt-1 text-sm text-gray-500">used code DIRECT15 this month</p>
            </div>
          </div>
          <p className="max-w-xs text-sm text-gray-500">
            Estimated Commission Saved:{" "}
            <strong className="text-gray-900">{formatCurrency(conversionMetrics.commissionSaved)}</strong> — every Box
            Topper coupon that gets redeemed is a customer DoorDash won't take a cut of again.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.label}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E31837]/10 text-[#E31837]">
                <Icon size={18} />
              </span>
              <p className="mt-3 text-sm font-bold text-gray-900">{p.label}</p>
              <p className="mt-1 text-xs text-gray-500">{p.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
