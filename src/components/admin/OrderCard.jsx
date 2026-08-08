import { Bike, Clock, MapPin, Minus, Plus, ShoppingBag, User } from "lucide-react";
import { useAppActions } from "../../context/AppContext";
import Button from "../shared/Button";
import { formatCountdown, formatCurrency, secondsRemaining } from "../../utils/helpers";
import { ORDER_STATUSES, STATUS_LABELS } from "../../data/mockData";

const STATUS_STYLES = {
  received: { bg: "bg-gray-100", text: "text-gray-600", ring: "ring-gray-200" },
  cooking: { bg: "bg-[#F39C12]/10", text: "text-[#F39C12]", ring: "ring-[#F39C12]/30" },
  ready: { bg: "bg-[#00A651]/10", text: "text-[#00A651]", ring: "ring-[#00A651]/30" },
  completed: { bg: "bg-gray-100", text: "text-gray-400", ring: "ring-gray-200" },
};

const NEXT_ACTION_LABEL = {
  received: "Accept Order",
  cooking: "Mark In the Oven Done →",
  ready: "Complete Order",
};

function nextStatus(current) {
  const idx = ORDER_STATUSES.indexOf(current);
  return ORDER_STATUSES[Math.min(idx + 1, ORDER_STATUSES.length - 1)];
}

export default function OrderCard({ order, now }) {
  const { updateOrderStatus, adjustOrderTime } = useAppActions();

  const remainingSeconds = secondsRemaining(order, now);
  const isOverdue = remainingSeconds === 0 && order.status === "cooking";
  const style = STATUS_STYLES[order.status];
  const isFinal = order.status === "completed";

  const readyLabel =
    order.status === "received"
      ? "Waiting to start"
      : order.status === "cooking"
      ? isOverdue
        ? "Should be ready!"
        : formatCountdown(remainingSeconds)
      : order.status === "ready"
      ? order.fulfillment === "delivery"
        ? "Out for delivery"
        : "Ready for pickup"
      : "Completed";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-gray-900">{order.id}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <User size={11} /> {order.customerName}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${style.bg} ${style.text} ${style.ring}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mt-3 space-y-1 border-y border-dashed border-gray-100 py-3">
        {order.items.map((it) => (
          <div key={it.itemId} className="flex justify-between text-xs text-gray-600">
            <span>
              {it.qty}× {it.name}
            </span>
            <span className="font-medium text-gray-800">{formatCurrency(it.qty * it.price)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-1 text-xs font-bold text-gray-900">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
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

      <div
        className={`mt-3 flex items-center justify-between rounded-xl px-3 py-2 ${
          isOverdue ? "bg-red-50" : "bg-gray-50"
        }`}
      >
        <span className={`flex items-center gap-1.5 text-sm font-bold ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
          <Clock size={14} />
          {readyLabel}
        </span>
        {!isFinal && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustOrderTime(order.id, -5)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:text-[#E31837]"
              title="-5 minutes"
            >
              <Minus size={12} />
            </button>
            <span className="text-[10px] font-semibold text-gray-400">5m</span>
            <button
              onClick={() => adjustOrderTime(order.id, 5)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:text-[#00A651]"
              title="+5 minutes"
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>

      {!isFinal && (
        <Button
          variant={order.status === "ready" ? "secondary" : "primary"}
          className="mt-3 w-full"
          onClick={() => updateOrderStatus(order.id, nextStatus(order.status))}
        >
          {NEXT_ACTION_LABEL[order.status]}
        </Button>
      )}
    </div>
  );
}
