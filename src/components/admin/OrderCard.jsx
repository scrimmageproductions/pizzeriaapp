import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Bike, CalendarClock, Check, CheckCircle2, Clock, Crown, MapPin, ShoppingBag, Store, User } from "lucide-react";
import { useShopActions } from "../../context/ShopContext";
import { useSound } from "../../utils/useSound";
import Button from "../shared/Button";
import ProgressRing from "../shared/ProgressRing";
import { formatClockTime, formatCountdown, formatCurrency, getOrderTiming } from "../../utils/helpers";

const SWIPE_THRESHOLD = 150;
const SWIPE_RANGE = 220; // how far the ticket can be dragged before hitting the constraint's soft edge

export default function OrderCard({ order, now, accentColor }) {
  const { completeOrder } = useShopActions();
  const { playTick } = useSound();
  const timing = getOrderTiming(order, now);
  const { stageIndex, prepProgress, secondsUntilReady } = timing;

  const x = useMotionValue(0);
  const revealOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const revealScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.6, 1]);

  // Swiping stands in for the "Complete Order" button, so it only applies where that action is
  // valid — a pickup order the kitchen is done with. Delivery still routes through Dispatch.
  const canSwipe = order.fulfillment === "pickup" && !order.completedAt;

  const handleComplete = () => {
    playTick();
    completeOrder(order.id);
  };

  const handleDragEnd = (_event, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      animate(x, 420, { duration: 0.25, ease: "easeIn" }).then(handleComplete);
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 32 });
    }
  };

  return (
    <motion.div layout exit={{ opacity: 0, x: 120, transition: { duration: 0.2 } }} className="relative">
      {canSwipe && (
        <motion.div
          style={{ opacity: revealOpacity }}
          className="absolute inset-0 flex items-center justify-start rounded-2xl bg-[#00A651] pl-6"
        >
          <motion.span style={{ scale: revealScale }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
            <Check size={20} strokeWidth={3} />
          </motion.span>
        </motion.div>
      )}

      <motion.div
        drag={canSwipe ? "x" : false}
        dragConstraints={{ left: 0, right: SWIPE_RANGE }}
        dragElastic={{ left: 0, right: 0.15 }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`relative touch-pan-y rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#151515] dark:shadow-none ${
          order.isCatering ? "border-purple-300 ring-1 ring-purple-200 dark:border-purple-500/40 dark:ring-purple-500/20" : "border-gray-200"
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
            <p className="text-sm font-extrabold text-gray-900 dark:text-white">{order.id}</p>
            <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-white/40">
              <User size={11} /> {order.customerName}
              {order.isSubscriberOrder && <Crown size={12} className="text-[#F5B700]" />}
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-white/40">
            {order.fulfillment === "delivery" ? <Bike size={13} /> : <ShoppingBag size={13} />}
            {order.fulfillment === "delivery" ? "Delivery" : "Pickup"}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3 border-y border-dashed border-gray-100 py-3 dark:border-white/10">
          {stageIndex < 2 ? (
            <ProgressRing progress={stageIndex === 0 ? 0 : prepProgress} size={48} strokeWidth={5} color={accentColor}>
              <Clock size={15} className="text-gray-500 dark:text-white/40" />
            </ProgressRing>
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
              <CheckCircle2 size={22} />
            </span>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            {order.items.map((it) => (
              <div key={it.itemId} className="flex justify-between text-xs text-gray-600 dark:text-white/60">
                <span className="truncate">
                  {it.qty}× {it.name}
                </span>
                <span className="shrink-0 font-medium text-gray-800 dark:text-white/80">{formatCurrency(it.qty * it.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {order.address && (
          <p className="mt-3 flex items-center gap-1 text-xs text-gray-500 dark:text-white/40">
            <MapPin size={12} /> {order.address}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-white/5">
          <span className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-white/80">
            <Clock size={14} />
            {stageIndex === 0 ? "Confirming…" : stageIndex === 1 ? formatCountdown(secondsUntilReady) : "Ready now"}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
        </div>

        {stageIndex === 2 && !order.completedAt && order.fulfillment === "pickup" && (
          <>
            <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={handleComplete}>
              Complete Order
            </Button>
            <p className="mt-1.5 text-center text-[10px] font-semibold text-gray-300 dark:text-white/20">or swipe the ticket right →</p>
          </>
        )}
        {stageIndex === 2 && !order.completedAt && order.fulfillment === "delivery" && (
          <p className="mt-3 text-center text-xs font-semibold text-[#F39C12]">Ready — assign a driver in Delivery Dispatch</p>
        )}
        {order.completedAt && (
          <p className="mt-3 text-center text-xs font-semibold text-gray-400 dark:text-white/30">Completed — order closed out</p>
        )}
      </motion.div>
    </motion.div>
  );
}
