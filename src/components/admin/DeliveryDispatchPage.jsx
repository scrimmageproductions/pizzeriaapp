import { useState } from "react";
import { Bike, ChevronDown, ChevronUp, MapPin, Navigation, User } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { useTicker } from "../../utils/useTicker";
import { formatCurrency, getOrderTiming } from "../../utils/helpers";
import { MOCK_DRIVERS } from "../../data/drivers";
import DeliveryMap from "./DeliveryMap";
import Button from "../shared/Button";
import { Select } from "../shared/FormField";

function DeliveryTicket({ order, selected, onSelect, children }) {
  return (
    <button
      onClick={() => onSelect(order.id)}
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected
          ? "border-[#E31837] bg-[#E31837]/5 ring-1 ring-[#E31837]/30"
          : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-[#151515] dark:hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-gray-900 dark:text-white">{order.id}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-white/40">
            <User size={11} /> {order.customerName}
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
      </div>
      <p className="mt-2 flex items-start gap-1 text-xs text-gray-500 dark:text-white/40">
        <MapPin size={12} className="mt-0.5 shrink-0" /> {order.address}
      </p>
      <div className="mt-1.5 space-y-0.5">
        {order.items.map((it) => (
          <p key={it.itemId} className="truncate text-xs text-gray-500 dark:text-white/40">
            {it.qty}× {it.name}
          </p>
        ))}
      </div>
      <div onClick={(e) => e.stopPropagation()} className="mt-3">
        {children}
      </div>
    </button>
  );
}

export default function DeliveryDispatchPage() {
  const { shop, orders } = useShopState();
  const { assignDriver, completeOrder } = useShopActions();
  const now = useTicker(2000);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showDelivered, setShowDelivered] = useState(false);

  const allDelivery = orders.filter((o) => o.fulfillment === "delivery");
  const activeDelivery = allDelivery.filter((o) => !o.completedAt);
  const readyDelivery = activeDelivery.filter((o) => getOrderTiming(o, now).stageIndex === 2);
  const unassigned = readyDelivery.filter((o) => !o.assignedDriver);
  const outForDelivery = readyDelivery.filter((o) => o.assignedDriver);
  const stillCooking = activeDelivery.length - readyDelivery.length;
  const delivered = allDelivery.filter((o) => o.completedAt);

  const mapOrders = readyDelivery;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Delivery Dispatch</h1>
        <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-white/40">
          <Bike size={15} /> Assign a driver the moment an order's ready — no delivery-app middleman required.
        </p>
      </div>

      <div className="h-80 overflow-hidden rounded-2xl border border-gray-200 shadow-sm sm:h-[420px] dark:border-white/10 dark:shadow-none">
        <DeliveryMap shop={shop} orders={mapOrders} selectedOrderId={selectedOrderId} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border-t-4 border-t-[#F39C12] bg-gray-50/70 p-3 dark:bg-white/[0.03]">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-gray-700 dark:text-white/70">Ready — Needs a Driver</h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-gray-500 shadow-sm dark:bg-white/10 dark:text-white/60 dark:shadow-none">
              {unassigned.length}
            </span>
          </div>
          <div className="space-y-3">
            {unassigned.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-white/10 dark:text-white/30">
                No orders waiting on a driver
              </p>
            ) : (
              unassigned.map((order) => (
                <DeliveryTicket key={order.id} order={order} selected={order.id === selectedOrderId} onSelect={setSelectedOrderId}>
                  <Select
                    defaultValue=""
                    onChange={(e) => e.target.value && assignDriver(order.id, e.target.value)}
                    className="text-xs"
                  >
                    <option value="" disabled>
                      Assign to…
                    </option>
                    {MOCK_DRIVERS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </DeliveryTicket>
              ))
            )}
            {stillCooking > 0 && (
              <p className="pt-1 text-center text-[11px] text-gray-400 dark:text-white/30">
                +{stillCooking} more delivery order{stillCooking === 1 ? "" : "s"} still cooking
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border-t-4 border-t-[#00A651] bg-gray-50/70 p-3 dark:bg-white/[0.03]">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-gray-700 dark:text-white/70">Out for Delivery</h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-gray-500 shadow-sm dark:bg-white/10 dark:text-white/60 dark:shadow-none">
              {outForDelivery.length}
            </span>
          </div>
          <div className="space-y-3">
            {outForDelivery.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-white/10 dark:text-white/30">
                No drivers on the road right now
              </p>
            ) : (
              outForDelivery.map((order) => (
                <DeliveryTicket key={order.id} order={order} selected={order.id === selectedOrderId} onSelect={setSelectedOrderId}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-[#00A651]/10 px-2.5 py-1 text-xs font-bold text-[#00A651]">
                      <Navigation size={12} /> {order.assignedDriver}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => completeOrder(order.id)}>
                      Mark Delivered
                    </Button>
                  </div>
                </DeliveryTicket>
              ))
            )}
          </div>
        </div>
      </div>

      {delivered.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#141414]">
          <button
            onClick={() => setShowDelivered((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-bold text-gray-700 dark:text-white/70"
          >
            <span>Delivered ({delivered.length})</span>
            {showDelivered ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showDelivered && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {delivered.map((order) => (
                <div key={order.id} className="rounded-xl border border-gray-100 p-3 dark:border-white/10">
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">{order.id}</p>
                  <p className="text-xs text-gray-500 dark:text-white/40">{order.customerName}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-400 dark:text-white/30">Delivered by {order.assignedDriver || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
