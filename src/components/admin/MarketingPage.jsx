import { useState } from "react";
import { AlertTriangle, MessageSquareText, Rocket, Sparkles, TrendingUp } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import { DEFAULT_RECOVERED_SALES } from "../../data/loyalty";
import Card from "../shared/Card";
import Toggle from "../shared/Toggle";
import Button from "../shared/Button";
import Toast from "../shared/Toast";

const CAMPAIGN_BUMP = 100;

function buildSuggestions(ingredients) {
  const pepperoni = ingredients.find((i) => i.id === "pepperoni");
  const pepperoniLow = pepperoni && pepperoni.stock < pepperoni.threshold;

  return [
    {
      id: "expiring-sausage",
      title: "Expiring Inventory Promo",
      body: "Warning: You have 15 lbs of Italian Sausage nearing expiration in 3 days.",
      action: "Send a 15% off 'Meat Lovers Pizza' SMS blast to 120 customers to clear stock.",
      audience: 120,
      cta: "Send 15% Off Blast",
    },
    {
      id: "garlic-knots-upsell",
      title: "High-Margin Upsell",
      body: "Garlic Knots are your highest margin item and have excess stock.",
      action: "Automatically offer a 'Free Garlic Knots with any Large Pizza' to customers who haven't ordered in 30 days.",
      audience: 64,
      cta: "Launch Win-Back Offer",
    },
    {
      id: "pepperoni-low-stock",
      title: "Low-Stock Warning",
      body: pepperoniLow
        ? `Pepperoni is running low (${pepperoni.stock} ${pepperoni.unit} left, below your ${pepperoni.threshold} ${pepperoni.unit} threshold).`
        : "Pepperoni stock is currently healthy.",
      action: "Temporarily remove 'Double Pepperoni' promos from the storefront until the US Foods delivery arrives tomorrow.",
      audience: 0,
      cta: "Pause Pepperoni Promos",
      disabled: !pepperoniLow,
    },
  ];
}

export default function MarketingPage() {
  const { shop, ingredients } = useShopState();
  const { updateShop } = useShopActions();
  const [executedIds, setExecutedIds] = useState([]);
  const [toast, setToast] = useState(null);

  const recoveredSales = shop.recoveredSales ?? DEFAULT_RECOVERED_SALES;
  const suggestions = buildSuggestions(ingredients);

  const executeCampaign = (suggestion) => {
    setExecutedIds((prev) => [...prev, suggestion.id]);
    updateShop({ recoveredSales: recoveredSales + CAMPAIGN_BUMP });
    setToast(
      suggestion.audience > 0
        ? `Campaign launched! Messages sent to ${suggestion.audience} customers.`
        : "Campaign launched! Storefront promos updated."
    );
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Automated Marketing</h1>
        <p className="text-sm text-gray-500">Set-and-forget SMS automations that bring customers back — no marketing team required.</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#121212] p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#00A651]">
            <TrendingUp size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white/60">Recovered Sales This Month</p>
            <p className="text-4xl font-extrabold tracking-tight">{formatCurrency(recoveredSales)}</p>
            <p className="mt-1 text-sm text-white/50">Automations generated {formatCurrency(recoveredSales)} in recovered sales this month.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-transparent bg-gradient-to-br from-[#7C3AED]/[0.05] to-[#E31837]/[0.05] p-5 shadow-sm ring-2 ring-[#7C3AED]/20 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#E31837] text-white">
            <Sparkles size={18} />
          </span>
          <div>
            <h3 className="text-base font-bold text-gray-900">🧠 AI Promo Suggestions</h3>
            <p className="mt-0.5 text-sm text-gray-500">Your virtual marketing manager, cross-referencing live inventory against sales data.</p>
          </div>
        </div>

        <div className="space-y-3">
          {suggestions.map((s) => {
            const executed = executedIds.includes(s.id);
            return (
              <div key={s.id} className="rounded-xl border border-gray-200 bg-white/80 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E31837]/10 text-[#E31837]">
                    <AlertTriangle size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900">{s.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{s.body}</p>
                    <p className="mt-1.5 text-xs font-semibold text-gray-500">
                      <span className="text-gray-400">Action: </span>
                      {s.action}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    icon={executed ? undefined : Rocket}
                    disabled={executed || s.disabled}
                    onClick={() => executeCampaign(s)}
                    className="shrink-0"
                  >
                    {executed ? "✅ Executed" : s.disabled ? "Not needed" : "Execute Campaign 🚀"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
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
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
            <span className="font-mono">"Still craving that order from {shop.name}? Your cart's waiting — finish up
            here: deepdish.store/{shop.slug}"</span>
          </div>
        )}
      </Card>

      <Toast show={!!toast} message={toast || ""} icon={Rocket} />
    </div>
  );
}
