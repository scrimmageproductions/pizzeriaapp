import { useEffect, useState } from "react";
import { ClipboardCheck, Flame, Bike, ShoppingBag, PartyPopper, Clock, ChefHat } from "lucide-react";
import { useAppState } from "../../context/AppContext";
import { useTicker } from "../../utils/useTicker";
import { formatClockTime, formatCountdown, formatCurrency, getOrderTiming } from "../../utils/helpers";
import Button from "../shared/Button";
import DeliveryMapCard from "./DeliveryMapCard";

function buildStages(fulfillment) {
  return [
    { key: "received", label: "Order Received", icon: ClipboardCheck },
    { key: "cooking", label: "Prepping & Baking", icon: Flame },
    {
      key: "ready",
      label: fulfillment === "delivery" ? "Out for Delivery" : "Ready for Pickup",
      icon: fulfillment === "delivery" ? Bike : ShoppingBag,
    },
    { key: "done", label: "Enjoy!", icon: PartyPopper },
  ];
}

export default function OrderTracker({ order: orderProp, config, onNewOrder }) {
  const { orders } = useAppState();
  const now = useTicker(1000);

  // Always read the freshest copy from global state so admin actions reflect instantly.
  const order = orders.find((o) => o.id === orderProp.id) || orderProp;
  const timing = getOrderTiming(order, now);
  const { stageIndex, overall } = timing;

  const [showDelayBanner, setShowDelayBanner] = useState(false);
  useEffect(() => {
    if (!order.lastDelayAt) return;
    setShowDelayBanner(true);
    const timer = setTimeout(() => setShowDelayBanner(false), 6000);
    return () => clearTimeout(timer);
  }, [order.lastDelayAt]);

  const stages = buildStages(order.fulfillment);

  const etaText =
    stageIndex === 0
      ? "Confirming your order…"
      : stageIndex === 1
      ? `Estimated ready by ${formatClockTime(timing.readyAt)}`
      : stageIndex === 2
      ? order.fulfillment === "delivery"
        ? `Estimated arrival: ${formatClockTime(timing.deliveryAt)}`
        : "Ready now — come on by!"
      : "Enjoy your meal!";

  const countdownText =
    stageIndex === 1
      ? `Ready in ${formatCountdown(timing.secondsUntilReady)}`
      : stageIndex === 2 && order.fulfillment === "delivery" && timing.bumped
      ? `Arriving in ${formatCountdown(timing.secondsUntilDelivery)}`
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA]">
      <div className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-extrabold text-gray-900">{config.name}</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {showDelayBanner && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#F39C12]/30 bg-[#F39C12]/10 p-4 animate-fade-in">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F39C12] text-white">
              <ChefHat size={16} />
            </span>
            <p className="text-sm font-semibold text-[#a5670c]">
              Chef added a few extra minutes to make sure your crust is perfectly crisp!
            </p>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Order {order.id}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {stageIndex === 3 ? "Bon Appétit! 🎉" : "Your pizza is on its way to perfection"}
          </h1>

          {stageIndex !== 3 && (
            <div
              className="mx-auto mt-4 inline-flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-sm sm:flex-row sm:gap-2"
              style={{ backgroundColor: config.primaryColor }}
            >
              <span className="flex items-center gap-2">
                <Clock size={15} />
                {etaText}
              </span>
              {countdownText && (
                <span className="text-xs font-semibold opacity-90 sm:before:mr-1.5 sm:before:content-['·']">
                  {countdownText}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative mt-10">
          <div className="absolute inset-x-[12.5%] top-6 h-1.5 rounded-full bg-gray-200" />
          <div
            className="absolute left-[12.5%] top-6 h-1.5 rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${(overall / (stages.length - 1)) * 75}%`,
              backgroundColor: config.primaryColor,
            }}
          />
          <div className="relative grid grid-cols-4">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const done = i < stageIndex;
              const active = i === stageIndex;
              return (
                <div key={stage.key} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-md transition-all duration-500 ${
                      active ? "animate-pulse-ring scale-110" : ""
                    }`}
                    style={{
                      backgroundColor: done || active ? config.primaryColor : "#e5e7eb",
                      color: done || active ? "white" : "#9ca3af",
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={`w-full text-center text-[11px] font-bold leading-tight sm:text-xs ${
                      done || active ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {order.fulfillment === "delivery" && stageIndex === 2 && (
          <DeliveryMapCard progress={timing.stage2Progress} dispatched={timing.bumped} primaryColor={config.primaryColor} />
        )}

        {/* Order summary */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
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
            {order.fulfillment === "delivery" ? `Delivering to ${order.address}` : "Pickup in-store"} ·{" "}
            {order.customerName}
          </div>
        </div>

        {stageIndex === 3 && (
          <div className="mt-6 text-center">
            <Button variant="primary" onClick={onNewOrder}>
              Start a New Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
