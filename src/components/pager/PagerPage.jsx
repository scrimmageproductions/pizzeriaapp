import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Bell, CheckCircle2, Flame, Gift, Loader2, Pizza, Sparkles, Users } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { useTicker } from "../../utils/useTicker";
import { getOrderTiming, sortOrdersByUrgency } from "../../utils/helpers";

const STEPS = [
  { label: "In Line", icon: Users },
  { label: "Cooking", icon: Flame },
  { label: "Ready at Window!", icon: Bell },
];

function LoyaltyUpsellCard({ phone, claimed, onClaimed }) {
  const { claimLoyaltyPoints } = useShopActions();
  const [password, setPassword] = useState("");

  const handleClaim = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    claimLoyaltyPoints(phone);
    onClaimed();
  };

  return (
    <div className="mt-5 rounded-3xl border border-[#F39C12]/30 bg-gradient-to-br from-[#F39C12]/15 to-[#E31837]/10 p-5">
      {claimed ? (
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00A651]/20 text-[#00A651]">
            <CheckCircle2 size={26} />
          </span>
          <p className="text-base font-extrabold text-white">Points secured!</p>
          <p className="text-sm text-white/60">Welcome to the club — see you again soon.</p>
        </div>
      ) : (
        <form onSubmit={handleClaim} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F39C12] text-white">
              <Gift size={16} />
            </span>
            <p className="text-base font-extrabold text-white">You just earned 42 Slice Points!</p>
          </div>
          <p className="text-sm text-white/60">
            Create a quick password to save your points and use them for free garlic knots on your next visit.
          </p>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-[#F39C12] focus:ring-2 focus:ring-[#F39C12]/30"
          />
          <button
            type="submit"
            disabled={!password.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F39C12] py-3 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles size={15} /> Claim My Points
          </button>
        </form>
      )}
    </div>
  );
}

export default function PagerPage() {
  const { orderId } = useParams();
  const { shop, orders, customers } = useShopState();
  const now = useTicker(1000); // polls the KDS-derived timing every second, same clock the KDS itself runs on
  const wasCompleted = useRef(false);

  const order = orders.find((o) => o.id === orderId);
  const [justClaimed, setJustClaimed] = useState(false);

  useEffect(() => {
    if (order?.completedAt && !wasCompleted.current) {
      wasCompleted.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([500, 250, 500]);
      }
    }
  }, [order?.completedAt]);

  if (!shop || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#121212] px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/40">
          <Pizza size={28} />
        </span>
        <h1 className="text-xl font-extrabold text-white">Order not found</h1>
        <p className="text-sm text-white/50">This pager link may have expired.</p>
      </div>
    );
  }

  const timing = getOrderTiming(order, now);
  const isCompleted = !!order.completedAt;

  const activeOrders = orders.filter((o) => !o.completedAt);
  const queueOrders = sortOrdersByUrgency(activeOrders, now).filter((o) => getOrderTiming(o, now).stageIndex < 2);
  const queuePosition = queueOrders.findIndex((o) => o.id === order.id) + 1;

  const guestCustomer = order.customerPhone ? customers.find((c) => c.phone === order.customerPhone) : null;
  const showLoyaltyUpsell = guestCustomer?.accountStatus === "guest" || justClaimed;

  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#00C853] px-6 py-10">
        <div className="mx-auto w-full max-w-sm text-center">
          <p className="text-7xl">🍕</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white">YOUR FOOD IS READY!</h1>
          <p className="mt-3 text-lg font-bold text-white/90">Please come to the window.</p>
          <p className="mt-8 text-sm font-semibold text-white/70">Order {order.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] px-4 py-8">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-white"
            style={{ backgroundColor: shop.primaryColor }}
          >
            {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <Pizza size={18} />}
          </span>
          <div>
            <p className="text-sm font-extrabold leading-tight text-white">{shop.name}</p>
            <p className="text-xs leading-tight text-white/40">Order {order.id}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone = i < timing.stageIndex;
              const isActive = i === timing.stageIndex;
              return (
                <div key={step.label} className="flex flex-1 flex-col items-center gap-2 text-center">
                  <div className="flex w-full items-center">
                    {i > 0 && (
                      <div
                        className={`h-0.5 flex-1 ${isDone || isActive ? "bg-[#E31837]" : "bg-white/10"}`}
                        style={{ marginRight: 0 }}
                      />
                    )}
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        isDone
                          ? "border-[#E31837] bg-[#E31837] text-white"
                          : isActive
                          ? "border-[#E31837] bg-[#E31837]/20 text-[#E31837] animate-pulse"
                          : "border-white/15 bg-transparent text-white/30"
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={20} /> : <Icon size={18} />}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 ${isDone ? "bg-[#E31837]" : "bg-white/10"}`} />
                    )}
                  </div>
                  <span className={`text-[11px] font-bold leading-tight ${isActive || isDone ? "text-white" : "text-white/30"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-black/30 p-5 text-center">
            {timing.stageIndex === 0 && (
              <>
                <p className="text-3xl font-black text-white">You are #{queuePosition || 1} in line</p>
                <p className="mt-2 text-sm text-white/50">Confirming your order with the kitchen…</p>
              </>
            )}
            {timing.stageIndex === 1 && (
              <>
                <Loader2 size={28} className="mx-auto animate-spin text-[#F39C12]" />
                <p className="mt-2 text-2xl font-black text-white">Your pizza is cooking!</p>
                <p className="mt-1 text-sm text-white/50">Sit tight, we'll buzz you the second it's ready.</p>
              </>
            )}
            {timing.stageIndex === 2 && (
              <>
                <Bell size={28} className="mx-auto text-[#00A651]" />
                <p className="mt-2 text-2xl font-black text-white">Ready at Window!</p>
                <p className="mt-1 text-sm text-white/50">Head to the counter — the kitchen is finishing you up.</p>
              </>
            )}
          </div>
        </div>

        {showLoyaltyUpsell && (
          <LoyaltyUpsellCard phone={order.customerPhone} claimed={justClaimed} onClaimed={() => setJustClaimed(true)} />
        )}
      </div>
    </div>
  );
}
