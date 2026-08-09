import { useState } from "react";
import { ChevronDown, ChevronUp, LayoutGrid, LogOut, UserRound } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { useTicker } from "../../utils/useTicker";
import { belongsToLocation, getOrderTiming, sortOrdersByUrgency } from "../../utils/helpers";
import { useDynamicWaitTime } from "../../utils/useDynamicWaitTime";
import OrderCard from "./OrderCard";
import WaitTimeBanner from "./WaitTimeBanner";
import PinLockScreen from "../shared/PinLockScreen";

const COLUMNS = [
  { stageIndex: 0, label: "Order Received", accent: "border-t-gray-400" },
  { stageIndex: 1, label: "Prepping", accent: "border-t-[#F39C12]" },
  { stageIndex: 2, label: "Ready", accent: "border-t-[#00A651]" },
];

export default function OrderKDSPage() {
  const { shop, orders, clockedInUser } = useShopState();
  const { updateShop, clockOutUser } = useShopActions();
  const now = useTicker(1000);
  const [showCompleted, setShowCompleted] = useState(false);
  const waitTime = useDynamicWaitTime();

  if (!clockedInUser) return <PinLockScreen primaryColor={shop.primaryColor} title="Clock In" subtitle="Enter your PIN to access the Kitchen Display" />;

  const locationOrders = orders.filter((o) => belongsToLocation(o, shop.activeLocationId));
  const activeOrders = locationOrders.filter((o) => !o.completedAt);
  const completedOrders = locationOrders.filter((o) => o.completedAt);
  const sorted = sortOrdersByUrgency(activeOrders, now);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Order KDS</h1>
          <p className="flex items-center gap-1.5 text-sm text-gray-500">
            <LayoutGrid size={15} /> Orders accept and cook automatically off your {shop.prepMinutes}-minute prep time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600">
            <UserRound size={13} /> {clockedInUser.name} · {clockedInUser.role}
          </span>
          <button
            onClick={clockOutUser}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200"
          >
            <LogOut size={14} /> Clock Out
          </button>
        </div>
      </div>

      <WaitTimeBanner
        waitTime={waitTime}
        overrideActive={shop.waitTimeOverrideActive}
        onToggleOverride={() => updateShop({ waitTimeOverrideActive: !shop.waitTimeOverrideActive })}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const columnOrders = sorted.filter((o) => getOrderTiming(o, now).stageIndex === col.stageIndex);
          return (
            <div key={col.label} className={`rounded-2xl border-t-4 bg-gray-50/70 p-3 ${col.accent}`}>
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-extrabold text-gray-700">{col.label}</h3>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-gray-500 shadow-sm">
                  {columnOrders.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnOrders.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                    No orders here
                  </p>
                ) : (
                  columnOrders.map((order) => <OrderCard key={order.id} order={order} now={now} accentColor={shop.primaryColor} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {completedOrders.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-bold text-gray-700"
          >
            <span>Completed Orders ({completedOrders.length})</span>
            {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showCompleted && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} now={now} accentColor={shop.primaryColor} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
