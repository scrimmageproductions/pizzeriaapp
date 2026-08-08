import { Bike, Clock, MapPin, Package, ShoppingBag, User, Zap } from "lucide-react";
import { useAppActions } from "../../context/AppContext";
import Button from "../shared/Button";
import ProgressRing from "../shared/ProgressRing";
import { formatCountdown, formatCurrency, getOrderTiming } from "../../utils/helpers";

export default function OrderCard({ order, now }) {
  const { bumpOrder, addRushDelay } = useAppActions();
  const timing = getOrderTiming(order, now);
  const { stageIndex, isReady, prepProgress, stage2Progress, secondsUntilReady, secondsUntilDelivery } = timing;

  const ringProgress = stageIndex === 1 ? prepProgress : stageIndex === 0 ? 0 : stage2Progress;
  const ringColor = stageIndex === 2 && !timing.bumped ? "#F39C12" : "#E31837";

  const kitchenLabel =
    stageIndex === 0
      ? "Accepting…"
      : stageIndex === 1
      ? "In the Oven"
      : stageIndex === 2
      ? "Ready — box me!"
      : "Dispatched";

  const timerText =
    stageIndex <= 1
      ? formatCountdown(secondsUntilReady)
      : stageIndex === 2 && order.fulfillment === "delivery" && timing.bumped
      ? formatCountdown(secondsUntilDelivery)
      : "—";

  const waitingToBump = stageIndex === 2 && !timing.bumped;

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
        waitingToBump ? "border-[#F39C12] ring-2 ring-[#F39C12]/30" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-gray-900">{order.id}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <User size={11} /> {order.customerName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              waitingToBump ? "animate-pulse-ring bg-[#F39C12]/10 text-[#F39C12] ring-1 ring-[#F39C12]/30" : "bg-gray-100 text-gray-600"
            }`}
          >
            {kitchenLabel}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 border-y border-dashed border-gray-100 py-3">
        <ProgressRing progress={ringProgress} size={52} strokeWidth={5} color={ringColor}>
          {stageIndex <= 1 ? (
            <Clock size={16} className="text-gray-500" />
          ) : timing.bumped ? (
            <Package size={16} className="text-[#00A651]" />
          ) : (
            <Zap size={16} className="text-[#F39C12]" />
          )}
        </ProgressRing>
        <div className="min-w-0 flex-1 space-y-1">
          {order.items.map((it) => (
            <div key={it.itemId} className="flex justify-between text-xs text-gray-600">
              <span className="truncate">
                {it.qty}× {it.name}
              </span>
              <span className="shrink-0 font-medium text-gray-800">{formatCurrency(it.qty * it.price)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          {order.fulfillment === "delivery" ? <Bike size={13} /> : <ShoppingBag size={13} />}
          {order.fulfillment === "delivery" ? "Delivery" : "Pickup"}
        </span>
        {order.address && (
          <span className="flex items-center gap-1 truncate">
            <MapPin size={12} /> {order.address}
          </span>
        )}
      </div>

      <div className={`mt-3 flex items-center justify-between rounded-xl px-3 py-2 ${waitingToBump ? "bg-orange-50" : "bg-gray-50"}`}>
        <span className={`flex items-center gap-1.5 text-sm font-bold ${waitingToBump ? "text-[#F39C12]" : "text-gray-700"}`}>
          <Clock size={14} />
          {waitingToBump
            ? order.fulfillment === "delivery"
              ? "Ready to dispatch"
              : "Ready for pickup"
            : timerText}
        </span>
        {order.delaySeconds > 0 && (
          <span className="text-[10px] font-semibold text-gray-400">+{order.delaySeconds / 60}m rush</span>
        )}
      </div>

      {timing.bumped ? (
        <p className="mt-3 text-center text-xs font-semibold text-gray-400">
          Dispatched {order.fulfillment === "delivery" ? "to driver" : "to customer"} · off the kitchen's plate
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => addRushDelay(order.id, 300)}>
            +5 Min Rush Delay
          </Button>
          <Button
            variant={waitingToBump ? "secondary" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => bumpOrder(order.id)}
          >
            Bump
          </Button>
        </div>
      )}
    </div>
  );
}
