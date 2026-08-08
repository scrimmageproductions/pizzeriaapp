import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Keyboard, Zap } from "lucide-react";
import { useAppActions, useAppState } from "../../context/AppContext";
import { useTicker } from "../../utils/useTicker";
import { getOrderTiming, sortOrdersByPriority } from "../../utils/helpers";
import OrderCard from "./OrderCard";

export default function LiveOrderManagerSection() {
  const { orders } = useAppState();
  const { bumpOrder } = useAppActions();
  const now = useTicker(1000);
  const [showDispatched, setShowDispatched] = useState(false);

  const activeOrders = orders.filter((o) => o.dispatchedAt == null);
  const dispatchedOrders = orders.filter((o) => o.dispatchedAt != null);
  const sortedActive = sortOrdersByPriority(activeOrders, now);

  const inKitchen = sortedActive.filter((o) => getOrderTiming(o, now).stageIndex <= 1);
  const readyToBump = sortedActive.filter((o) => getOrderTiming(o, now).stageIndex === 2);

  // Spacebar / Enter bumps the single most urgent order — the zero-touch "bump bar" shortcut.
  useEffect(() => {
    const handler = (e) => {
      if (e.code !== "Space" && e.key !== "Enter") return;
      const target = e.target;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (isTyping) return;
      const topOrder = sortedActive[0];
      if (!topOrder) return;
      e.preventDefault();
      bumpOrder(topOrder.id);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sortedActive, bumpOrder]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
        <Zap size={16} className="text-[#F39C12]" />
        <span>
          Fully automated — orders accept, cook, and go ready on their own. Kitchen only needs to{" "}
          <strong>Bump</strong> a boxed order to dispatch it.
        </span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
          <Keyboard size={13} /> Space / Enter bumps the top order
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border-t-4 border-t-gray-400 bg-gray-50/70 p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-gray-700">In the Kitchen</h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-gray-500 shadow-sm">
              {inKitchen.length}
            </span>
          </div>
          <div className="space-y-3">
            {inKitchen.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                Nothing cooking right now
              </p>
            ) : (
              inKitchen.map((order) => <OrderCard key={order.id} order={order} now={now} />)
            )}
          </div>
        </div>

        <div className="rounded-2xl border-t-4 border-t-[#F39C12] bg-gray-50/70 p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-gray-700">Ready — Waiting to Bump</h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-gray-500 shadow-sm">
              {readyToBump.length}
            </span>
          </div>
          <div className="space-y-3">
            {readyToBump.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                No orders waiting
              </p>
            ) : (
              readyToBump.map((order) => <OrderCard key={order.id} order={order} now={now} />)
            )}
          </div>
        </div>
      </div>

      {dispatchedOrders.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <button
            onClick={() => setShowDispatched((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-bold text-gray-700"
          >
            <span>Dispatched Orders ({dispatchedOrders.length})</span>
            {showDispatched ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showDispatched && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dispatchedOrders.map((order) => (
                <OrderCard key={order.id} order={order} now={now} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
