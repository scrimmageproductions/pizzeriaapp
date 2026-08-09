import { useNavigate } from "react-router-dom";
import { ArrowRight, Crown, MessageSquareText, Sparkles, TrendingUp } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Toggle from "../shared/Toggle";

const RECOVERED_SALES = 320;

export default function MarketingPage() {
  const { shop } = useShopState();
  const { updateShop } = useShopActions();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Automated Marketing</h1>
        <p className="text-sm text-gray-500 dark:text-white/40">Set-and-forget SMS automations that bring customers back — no marketing team required.</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#121212] p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#00A651]">
            <TrendingUp size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white/60">Recovered Sales This Month</p>
            <p className="text-4xl font-extrabold tracking-tight">{formatCurrency(RECOVERED_SALES)}</p>
            <p className="mt-1 text-sm text-white/50">Automations generated {formatCurrency(RECOVERED_SALES)} in recovered sales this month.</p>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E31837]/10 text-[#E31837]">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">🎨 Social Studio</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Turn any menu item into on-brand Instagram assets in one click.</p>
            </div>
          </div>
          <Button icon={ArrowRight} onClick={() => navigate("/admin/marketing/social")} className="w-full sm:w-auto">
            Open Social Studio
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5B700]/10 text-[#F5B700]">
              <Crown size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">👑 Subscription Engine</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Launch a VIP plan and turn one-time customers into recurring revenue.</p>
            </div>
          </div>
          <Button icon={ArrowRight} onClick={() => navigate("/admin/marketing/subscriptions")} className="w-full sm:w-auto">
            Open Subscriptions
          </Button>
        </div>
      </Card>

      <Card
        title="30-Day Win-Back SMS"
        description="If a customer hasn't ordered in 30 days, automatically text them a 10% off code."
        icon={MessageSquareText}
      >
        <Toggle
          checked={shop.winBackSmsEnabled}
          onChange={(val) => updateShop({ winBackSmsEnabled: val })}
          label={shop.winBackSmsEnabled ? "Active" : "Paused"}
          description={
            shop.winBackSmsEnabled
              ? "Running — lapsed customers get a friendly nudge and a discount code automatically."
              : "Turn this on to start winning back customers who've gone quiet."
          }
        />
        {shop.winBackSmsEnabled && (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
            <span className="font-mono">"Hey {"{"}first_name{"}"}, we miss you at {shop.name}! Here's 10% off your next
            order: WELCOME10. 🍕"</span>
          </div>
        )}
      </Card>

      <Card
        title="Abandoned Cart SMS"
        description="If a customer adds items but doesn't check out, text a reminder to finish their order."
        icon={Sparkles}
      >
        <Toggle
          checked={shop.abandonedCartSmsEnabled}
          onChange={(val) => updateShop({ abandonedCartSmsEnabled: val })}
          label={shop.abandonedCartSmsEnabled ? "Active" : "Paused"}
          description={
            shop.abandonedCartSmsEnabled
              ? "Running — customers who bail at checkout get a gentle reminder text."
              : "Turn this on to recover carts customers almost completed."
          }
        />
        {shop.abandonedCartSmsEnabled && (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
            <span className="font-mono">"Still craving that order from {shop.name}? Your cart's waiting — finish up
            here: deepdish.store/{shop.slug}"</span>
          </div>
        )}
      </Card>
    </div>
  );
}
