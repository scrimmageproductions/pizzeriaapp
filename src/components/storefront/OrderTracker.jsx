import { ClipboardCheck, Flame, Bike, ShoppingBag, PartyPopper, ArrowLeft, Clock } from "lucide-react";
import { useAppState } from "../../context/AppContext";
import { useTicker } from "../../utils/useTicker";
import { estimateCompletion, formatCurrency, STATUS_STEP_INDEX } from "../../utils/helpers";
import Button from "../shared/Button";

function buildStages(fulfillment) {
  return [
    { key: "received", label: "Order Received", icon: ClipboardCheck },
    { key: "cooking", label: "Prepping & Baking", icon: Flame },
    {
      key: "ready",
      label: fulfillment === "delivery" ? "Out for Delivery" : "Ready for Pickup",
      icon: fulfillment === "delivery" ? Bike : ShoppingBag,
    },
    { key: "completed", label: "Enjoy!", icon: PartyPopper },
  ];
}

export default function OrderTracker({ order: orderProp, config, onNewOrder, onBackToAdmin }) {
  const { orders } = useAppState();
  const now = useTicker(1000);

  // Always read the freshest copy from global state so admin updates reflect instantly.
  const order = orders.find((o) => o.id === orderProp.id) || orderProp;

  const stages = buildStages(order.fulfillment);
  const currentIndex = STATUS_STEP_INDEX[order.status];
  const completionTs = estimateCompletion(order);
  const minutesLeft = completionTs ? Math.max(0, Math.ceil((completionTs - now) / 60000)) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA]">
      <div className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          {onBackToAdmin ? (
            <button
              onClick={onBackToAdmin}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft size={14} /> Admin
            </button>
          ) : (
            <span />
          )}
          <span className="text-sm font-extrabold text-gray-900">{config.name}</span>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Order {order.id}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {order.status === "completed" ? "Bon Appétit! 🎉" : "Your pizza is on its way to perfection"}
          </h1>

          {order.status !== "completed" && (
            <div
              className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: config.primaryColor }}
            >
              <Clock size={15} />
              {order.status === "received"
                ? `Estimated completion in ${minutesLeft} min`
                : order.status === "cooking"
                ? `Ready in about ${minutesLeft} min`
                : order.fulfillment === "delivery"
                ? `Arriving in about ${minutesLeft} min`
                : "Ready now — come on by!"}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative mt-10">
          <div className="absolute inset-x-[12.5%] top-6 h-1.5 rounded-full bg-gray-200" />
          <div
            className="absolute left-[12.5%] top-6 h-1.5 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(currentIndex / (stages.length - 1)) * 75}%`,
              backgroundColor: config.primaryColor,
            }}
          />
          <div className="relative grid grid-cols-4">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const done = i < currentIndex;
              const active = i === currentIndex;
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

        {/* Order summary */}
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
            {order.fulfillment === "delivery" ? `Delivering to ${order.address}` : "Pickup in-store"} ·{" "}
            {order.customerName}
          </div>
        </div>

        {order.status === "completed" && (
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
