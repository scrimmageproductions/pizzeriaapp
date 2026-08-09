import { Gift, Star } from "lucide-react";

/** Shown wherever a known customer's loyalty points are visible — the cart (logged-in users) and
 * checkout (guests who've been recognized by phone number) — so redemption works from either. */
export default function RedeemRewardsPanel({ customer, redemptionCatalog, cart, onRedeem, primaryColor }) {
  if (!customer) return null;

  const points = customer.loyaltyPoints || 0;
  const redeemedIds = new Set(cart.filter((c) => c.isReward).map((c) => c.rewardId));
  const available = (redemptionCatalog || []).filter((r) => !redeemedIds.has(r.id));

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#E31837]/30 bg-[#E31837]/[0.03] p-4">
      <p className="flex items-center gap-1.5 text-sm font-extrabold text-gray-900">
        <Star size={15} className="fill-[#E31837] text-[#E31837]" /> You have {points} Slice Points! 🍕
      </p>
      {available.length > 0 ? (
        <div className="mt-3 space-y-2">
          {available.map((r) => {
            const affordable = points >= r.pointsCost;
            return (
              <button
                key={r.id}
                type="button"
                disabled={!affordable}
                onClick={() => onRedeem(customer, r)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition ${
                  affordable
                    ? "border-[#E31837]/40 bg-white text-gray-900 hover:bg-[#E31837]/5 active:scale-[0.99]"
                    : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Gift size={14} style={{ color: affordable ? primaryColor : undefined }} />
                  Redeem {r.name}
                </span>
                <span className="shrink-0 text-xs">{r.pointsCost} pts</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-500">All available rewards are already in your cart.</p>
      )}
    </div>
  );
}
