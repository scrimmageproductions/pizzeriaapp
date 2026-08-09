import { Bike, CalendarClock, CheckCircle2, Clock, Crown, MapPin, ShoppingBag, Store, User } from "lucide-react";
import { useShopActions } from "../../context/ShopContext";
import Button from "../shared/Button";
import ProgressRing from "../shared/ProgressRing";
import { formatClockTime, formatCountdown, formatCurrency, getOrderTiming } from "../../utils/helpers";

export default function OrderCard({ order, now, accentColor }) {
  const { completeOrder } = useShopActions();
  const timing = getOrderTiming(order, now);
  const { stageIndex, prepProgress, secondsUntilReady } = timing;

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        order.isCatering ? "border-purple-300 ring-1 ring-purple-200" : "border-gray-200"
      }`}
    >
      {order.isCatering && (
        <div className="mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-2 py-2 text-center text-xs font-extrabold uppercase tracking-wide text-white">
          <CalendarClock size={13} /> Catering — Due at {formatClockTime(order.eventAt)}
        </div>
      )}
      {order.brandName && (
        <div
          className="mb-3 flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-center text-xs font-extrabold uppercase tracking-wide text-white"
          style={{ backgroundColor: order.brandColor || "#E31837" }}
        >
          <Store size={13} /> {order.brandName}
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-gray-900">{order.id}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <User size={11} /> {order.customerName}
            {order.isSubscriberOrder && <Crown size={12} className="text-[#F5B700]" />}
          </p>
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          {order.fulfillment === "delivery" ? <Bike size={13} /> : <ShoppingBag size={13} />}
          {order.fulfillment === "delivery" ? "Delivery" : "Pickup"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 border-y border-dashed border-gray-100 py-3">
        {stageIndex < 2 ? (
          <ProgressRing progress={stageIndex === 0 ? 0 : prepProgress} size={48} strokeWidth={5} color={accentColor}>
            <Clock size={15} className="text-gray-500" />
          </ProgressRing>
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
            <CheckCircle2 size={22} />
          </span>
        )}
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

      {order.address && (
        <p className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} /> {order.address}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
          <Clock size={14} />
          {stageIndex === 0 ? "Confirming…" : stageIndex === 1 ? formatCountdown(secondsUntilReady) : "Ready now"}
        </span>
        <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</span>
      </div>

      {stageIndex === 2 && !order.completedAt && order.fulfillment === "pickup" && (
        <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => completeOrder(order.id)}>
          Complete Order
        </Button>
      )}
      {stageIndex === 2 && !order.completedAt && order.fulfillment === "delivery" && (
        <p className="mt-3 text-center text-xs font-semibold text-[#F39C12]">Ready — assign a driver in Delivery Dispatch</p>
      )}
      {order.completedAt && (
        <p className="mt-3 text-center text-xs font-semibold text-gray-400">Completed — order closed out</p>
      )}
    </div>
  );
}
