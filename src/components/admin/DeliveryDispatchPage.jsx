import { useState } from "react";
import { Bike, ChevronDown, ChevronUp, Clock, MapPin, Navigation, User, Users } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { useTicker } from "../../utils/useTicker";
import { formatCurrency, getOrderTiming } from "../../utils/helpers";
import DeliveryMap from "./DeliveryMap";
import Button from "../shared/Button";
import { Select } from "../shared/FormField";

const STATUS_META = {
  OFF_CLOCK: { label: "Off Clock", dot: "bg-gray-300", text: "text-gray-400" },
  IN_STORE: { label: "In Store", dot: "bg-[#F39C12]", text: "text-[#F39C12]" },
  ON_ROAD: { label: "On Road", dot: "bg-[#00A651]", text: "text-[#00A651]" },
};

function elapsedMinutes(since, now) {
  return Math.max(0, Math.round((now - since) / 60000));
}

function DeliveryTicket({ order, selected, onSelect, children }) {
  return (
    <button
      onClick={() => onSelect(order.id)}
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected ? "border-[#E31837] bg-[#E31837]/5 ring-1 ring-[#E31837]/30" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-gray-900">{order.id}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <User size={11} /> {order.customerName}
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-gray-900">{formatCurrency(order.total)}</span>
      </div>
      <p className="mt-2 flex items-start gap-1 text-xs text-gray-500">
        <MapPin size={12} className="mt-0.5 shrink-0" /> {order.address}
      </p>
      <div className="mt-1.5 space-y-0.5">
        {order.items.map((it) => (
          <p key={it.itemId} className="truncate text-xs text-gray-500">
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

function DriverRoster({ drivers, orders, now }) {
  const inStoreOrder = [...drivers].filter((d) => d.status === "IN_STORE").sort((a, b) => (a.inStoreSince || 0) - (b.inStoreSince || 0));
  const nextUpId = inStoreOrder[0]?.id;

  const statusLine = (driver) => {
    if (driver.status === "ON_ROAD") {
      const activeOrder = orders.find((o) => o.assignedDriverId === driver.id && !o.completedAt);
      const mins = activeOrder ? elapsedMinutes(activeOrder.dispatchedAt || now, now) : 0;
      return `On Road (${mins} min${mins === 1 ? "" : "s"})`;
    }
    if (driver.status === "IN_STORE") {
      const mins = elapsedMinutes(driver.inStoreSince || now, now);
      return `In Store (${mins} min${mins === 1 ? "" : "s"})${driver.id === nextUpId ? " — Next Up" : ""}`;
    }
    return "Off Clock";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-extrabold text-gray-700">
        <Users size={15} /> Driver Roster
      </h3>
      {drivers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400">
          No drivers hired yet — add one in Team & Drivers.
        </p>
      ) : (
        <div className="space-y-2">
          {drivers.map((d) => {
            const meta = STATUS_META[d.status] || STATUS_META.OFF_CLOCK;
            return (
              <div key={d.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                <span className="text-sm font-bold text-gray-900">{d.name}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${meta.text}`}>
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  {statusLine(d)}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
        <Clock size={11} /> Auto-Dispatch assigns ready orders to the longest-waiting in-store driver.
      </p>
    </div>
  );
}

export default function DeliveryDispatchPage() {
  const { shop, orders, drivers } = useShopState();
  const { assignDriver, markOrderDelivered } = useShopActions();
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

  const inStoreDrivers = drivers.filter((d) => d.status === "IN_STORE");

  const mapOrders = readyDelivery;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Delivery Dispatch</h1>
        <p className="flex items-center gap-1.5 text-sm text-gray-500">
          <Bike size={15} /> Auto-Dispatch hands off ready orders the moment a driver's in-store — no delivery-app middleman required.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="h-80 overflow-hidden rounded-2xl border border-gray-200 shadow-sm sm:h-[420px]">
          <DeliveryMap shop={shop} orders={mapOrders} selectedOrderId={selectedOrderId} />
        </div>
        <DriverRoster drivers={drivers} orders={orders} now={now} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border-t-4 border-t-[#F39C12] bg-gray-50/70 p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-gray-700">Waiting for Driver</h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-gray-500 shadow-sm">
              {unassigned.length}
            </span>
          </div>
          <div className="space-y-3">
            {unassigned.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                No orders waiting on a driver
              </p>
            ) : (
              unassigned.map((order) => (
                <DeliveryTicket key={order.id} order={order} selected={order.id === selectedOrderId} onSelect={setSelectedOrderId}>
                  {inStoreDrivers.length > 0 ? (
                    <Select defaultValue="" onChange={(e) => e.target.value && assignDriver(order.id, e.target.value)} className="text-xs">
                      <option value="" disabled>
                        Override auto-assign…
                      </option>
                      {inStoreDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <p className="text-center text-[11px] font-semibold text-gray-400">
                      No in-store drivers — will assign the moment one punches in
                    </p>
                  )}
                </DeliveryTicket>
              ))
            )}
            {stillCooking > 0 && (
              <p className="pt-1 text-center text-[11px] text-gray-400">
                +{stillCooking} more delivery order{stillCooking === 1 ? "" : "s"} still cooking
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border-t-4 border-t-[#00A651] bg-gray-50/70 p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-gray-700">Out for Delivery</h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-gray-500 shadow-sm">
              {outForDelivery.length}
            </span>
          </div>
          <div className="space-y-3">
            {outForDelivery.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                No drivers on the road right now
              </p>
            ) : (
              outForDelivery.map((order) => (
                <DeliveryTicket key={order.id} order={order} selected={order.id === selectedOrderId} onSelect={setSelectedOrderId}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-[#00A651]/10 px-2.5 py-1 text-xs font-bold text-[#00A651]">
                      <Navigation size={12} /> {order.assignedDriver}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => markOrderDelivered(order.id)}>
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
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <button
            onClick={() => setShowDelivered((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-bold text-gray-700"
          >
            <span>Delivered ({delivered.length})</span>
            {showDelivered ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showDelivered && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {delivered.map((order) => (
                <div key={order.id} className="rounded-xl border border-gray-100 p-3">
                  <p className="text-sm font-extrabold text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customerName}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-400">Delivered by {order.assignedDriver || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
