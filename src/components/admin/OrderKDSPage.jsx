import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, LayoutGrid } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import { useTicker } from "../../utils/useTicker";
import { useSound } from "../../utils/useSound";
import { getOrderTiming, sortOrdersByUrgency } from "../../utils/helpers";
import OrderCard from "./OrderCard";
import KdsEmptyState from "./KdsEmptyState";
import InboxToast from "./InboxToast";

const COLUMNS = [
  { stageIndex: 0, label: "Order Received", accent: "border-t-gray-400 dark:border-t-white/20" },
  { stageIndex: 1, label: "Prepping", accent: "border-t-[#F39C12]" },
  { stageIndex: 2, label: "Ready", accent: "border-t-[#00A651]" },
];

export default function OrderKDSPage() {
  const { shop, orders } = useShopState();
  const now = useTicker(1000);
  const { playChime } = useSound();
  const [showCompleted, setShowCompleted] = useState(false);
  const prevOrderCount = useRef(null);

  const activeOrders = orders.filter((o) => !o.completedAt);
  const completedOrders = orders.filter((o) => o.completedAt);
  const sorted = sortOrdersByUrgency(activeOrders, now);

  // A soft double-tone chime whenever a new order lands, so kitchen staff don't have to keep
  // staring at the screen — skips the very first render so the seeded/persisted orders don't chime.
  useEffect(() => {
    if (prevOrderCount.current !== null && orders.length > prevOrderCount.current) {
      playChime();
    }
    prevOrderCount.current = orders.length;
  }, [orders.length, playChime]);

  return (
    <div className="space-y-6 animate-fade-in">
      <InboxToast />
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Order KDS</h1>
        <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-white/40">
          <LayoutGrid size={15} /> Orders accept and cook automatically off your {shop.prepMinutes}-minute prep time.
        </p>
      </div>

      {activeOrders.length === 0 ? (
        <KdsEmptyState />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const columnOrders = sorted.filter((o) => getOrderTiming(o, now).stageIndex === col.stageIndex);
            return (
              <div key={col.label} className={`rounded-2xl border-t-4 bg-gray-50/70 p-3 dark:bg-white/[0.03] ${col.accent}`}>
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-sm font-extrabold text-gray-700 dark:text-white/70">{col.label}</h3>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-gray-500 shadow-sm dark:bg-white/10 dark:text-white/60 dark:shadow-none">
                    {columnOrders.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {columnOrders.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-white/10 dark:text-white/30">
                      No orders here
                    </p>
                  ) : (
                    <AnimatePresence initial={false}>
                      {columnOrders.map((order) => (
                        <OrderCard key={order.id} order={order} now={now} accentColor={shop.primaryColor} />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completedOrders.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#141414]">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-bold text-gray-700 dark:text-white/70"
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
