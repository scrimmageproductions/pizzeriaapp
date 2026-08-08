import { useState } from "react";
import { LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
import { useAppState } from "../../context/AppContext";
import { useTicker } from "../../utils/useTicker";
import OrderCard from "./OrderCard";
import { ORDER_STATUSES, STATUS_LABELS } from "../../data/mockData";

const ACTIVE_STATUSES = ORDER_STATUSES.filter((s) => s !== "completed");

const COLUMN_ACCENTS = {
  received: "border-t-gray-400",
  cooking: "border-t-[#F39C12]",
  ready: "border-t-[#00A651]",
};

export default function LiveOrderManagerSection() {
  const { orders } = useAppState();
  const now = useTicker(1000);
  const [showCompleted, setShowCompleted] = useState(false);

  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <LayoutGrid size={16} />
        Live view — updates instantly when you change an order's status.
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {ACTIVE_STATUSES.map((status) => {
          const columnOrders = orders.filter((o) => o.status === status);
          return (
            <div key={status} className={`rounded-2xl border-t-4 bg-gray-50/70 p-3 ${COLUMN_ACCENTS[status]}`}>
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-extrabold text-gray-700">{STATUS_LABELS[status]}</h3>
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
                  columnOrders.map((order) => <OrderCard key={order.id} order={order} now={now} />)
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
                <OrderCard key={order.id} order={order} now={now} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
