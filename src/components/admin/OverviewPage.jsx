import { useState } from "react";
import { Link2, ShoppingBag, Copy, Check, ExternalLink, LayoutGrid, CircleDot } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import Card from "../shared/Card";
import Button from "../shared/Button";

export default function OverviewPage() {
  const { shop, items, orders } = useShopState();
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/${shop.slug}`;
  const activeOrderCount = orders.filter((o) => !o.completedAt).length;

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
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E31837]/10 text-[#E31837]">
              <ShoppingBag size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{items.length}</p>
              <p className="text-xs text-gray-500">Menu items</p>
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
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                shop.acceptingOrders ? "bg-[#00A651]/10 text-[#00A651]" : "bg-gray-100 text-gray-400"
              }`}
            >
              <CircleDot size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{shop.acceptingOrders ? "Open" : "Paused"}</p>
              <p className="text-xs text-gray-500">Accepting orders</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
