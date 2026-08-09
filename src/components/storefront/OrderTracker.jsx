import { useState } from "react";
import { Bike, CheckCircle2, ClipboardCheck, Clock, CookingPot, Flame, Lock, PartyPopper, ShoppingBag, Star } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { useTicker } from "../../utils/useTicker";
import { clamp, formatClockTime, formatCountdown, formatCurrency, getOrderTiming } from "../../utils/helpers";
import { FONT_OPTIONS } from "../../data/brand";
import Button from "../shared/Button";

function buildStages(fulfillment, dispatched) {
  const readyLabel = fulfillment === "delivery" ? (dispatched ? "Out for Delivery" : "Ready") : "Ready";
  return [
    { key: "received", label: "Order Received", icon: ClipboardCheck },
    { key: "prepping", label: "Prepping", icon: Flame },
    { key: "baking", label: "Baking", icon: CookingPot },
    { key: "ready", label: readyLabel, icon: fulfillment === "delivery" ? Bike : ShoppingBag },
  ];
}

/**
 * The KDS engine only tracks 3 stages (Received/Prepping/Ready) — the customer-facing tracker
 * splits the single "Prepping" window into two visual checkpoints (Prepping, then Baking) so it
 * reads as a richer 4-step journey, without the admin board needing to know about it.
 */
function getVisualStage(timing) {
  if (timing.stageIndex === 0) return { index: 0, overall: 0 };
  if (timing.stageIndex === 1) {
    const overall = 1 + clamp(timing.prepProgress, 0, 1) * 2; // slides 1 -> 3 across the whole prep window
    return { index: timing.prepProgress < 0.5 ? 1 : 2, overall };
  }
  return { index: 3, overall: 3 };
}

export default function OrderTracker({ order: orderProp, shop, onNewOrder }) {
  const { orders, customers } = useShopState();
  const { registerCustomerAccount } = useShopActions();
  const now = useTicker(1000);
  const [password, setPassword] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const order = orders.find((o) => o.id === orderProp.id) || orderProp;
  const timing = getOrderTiming(order, now);
  const visual = getVisualStage(timing);
  const dispatched = !!order.assignedDriver;
  const stages = buildStages(order.fulfillment, dispatched);
  const done = !!order.completedAt;
  const fontFamily = FONT_OPTIONS.find((f) => f.id === shop.font)?.family;

  const matchedCustomer = customers.find((c) => c.phone && order.customerPhone && c.phone === order.customerPhone);
  const pointsEarned = Math.floor(order.total * (shop.loyalty?.pointsPerDollar ?? 1));
  const isGuest = matchedCustomer && matchedCustomer.accountType !== "registered";

  const saveAccount = (e) => {
    e.preventDefault();
    if (!password.trim() || !matchedCustomer) return;
    registerCustomerAccount(matchedCustomer.id);
    setJustSaved(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA]" style={{ fontFamily }}>
      <div className="border-b border-gray-100 bg-white px-4 py-4 text-center">
        <span className="text-sm font-extrabold text-gray-900">{shop.name}</span>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {pointsEarned > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#E31837] p-5 text-white shadow-lg">
            <p className="flex items-center gap-2 text-sm font-extrabold">
              <PartyPopper size={18} /> Order Confirmed! You just unlocked {pointsEarned} points.
            </p>

            {isGuest && !justSaved && (
              <form onSubmit={saveAccount} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-lg border border-white/30 bg-white/10 py-2.5 pl-9 pr-3 text-sm font-semibold text-white placeholder-white/60 outline-none focus:border-white/60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!password.trim()}
                  className="shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-extrabold text-[#E31837] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save My Points
                </button>
              </form>
            )}

            {justSaved && (
              <p className="mt-3 flex items-center gap-1.5 text-sm font-bold">
                <CheckCircle2 size={16} /> Account saved — welcome back next time!
              </p>
            )}

            {!isGuest && !justSaved && matchedCustomer && (
              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-white/90">
                <Star size={14} className="fill-white" /> {matchedCustomer.loyaltyPoints} total Slice Points on your account.
              </p>
            )}
          </div>
        )}

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Order {order.id}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {done ? "Enjoy your meal! 🎉" : "Your order is being made with love"}
          </h1>

          {!done && (
            <div
              className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: shop.primaryColor }}
            >
              <Clock size={15} />
              {timing.stageIndex === 0
                ? "Confirming your order…"
                : timing.stageIndex === 1
                ? `Ready by ${formatClockTime(timing.readyAt)} · ${formatCountdown(timing.secondsUntilReady)} left`
                : order.fulfillment === "delivery"
                ? dispatched
                  ? `${order.assignedDriver} is on the way!`
                  : "Finding you a driver…"
                : order.fulfillment === "dine-in"
                ? "Ready now — coming right to your table!"
                : "Ready now — come on by!"}
            </div>
          )}
        </div>

        <div className="relative mt-10">
          <div className="absolute inset-x-[12.5%] top-6 h-1.5 rounded-full bg-gray-200" />
          <div
            className="absolute left-[12.5%] top-6 h-1.5 rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${(visual.overall / (stages.length - 1)) * 75}%`,
              backgroundColor: shop.primaryColor,
            }}
          />
          <div className="relative grid grid-cols-4">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const isDone = i < visual.index || done;
              const active = i === visual.index && !done;
              return (
                <div key={stage.key} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-md transition-all duration-500 ${
                      active ? "animate-pulse-ring scale-110" : ""
                    }`}
                    style={{
                      backgroundColor: isDone || active ? shop.primaryColor : "#e5e7eb",
                      color: isDone || active ? "white" : "#9ca3af",
                    }}
                  >
                    {done && i === stages.length - 1 ? <PartyPopper size={20} /> : <Icon size={18} />}
                  </div>
                  <span className={`w-full text-center text-[11px] font-bold leading-tight sm:text-xs ${isDone || active ? "text-gray-900" : "text-gray-400"}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-extrabold text-gray-900">Order Summary</h3>
          <div className="space-y-1.5">
            {order.items.map((it) => (
              <div key={it.itemId} className="flex justify-between text-sm text-gray-600">
                <span>
                  {it.qty}× {it.name}
                </span>
                <span className="font-medium text-gray-800">{formatCurrency(it.qty * it.price)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-dashed border-gray-100 pt-3 text-sm font-extrabold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {order.fulfillment === "delivery"
              ? `Delivering to ${order.address}`
              : order.fulfillment === "dine-in"
              ? order.address
              : "Pickup in-store"}{" "}
            · {order.customerName}
          </div>
        </div>

        {done && (
          <div className="mt-6 text-center">
            <Button style={{ backgroundColor: shop.primaryColor }} onClick={onNewOrder}>
              Start a New Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
