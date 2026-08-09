import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Pizza, ShieldCheck, Users } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Button from "../shared/Button";

export default function SplitPayPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { shop, orders } = useShopState();
  const { paySplitPortion } = useShopActions();
  const [processing, setProcessing] = useState(false);
  const [justPaid, setJustPaid] = useState(false);

  const order = orders.find((o) => o.id === orderId);

  if (!shop || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8F9FA] px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-200 text-gray-400">
          <Pizza size={28} />
        </span>
        <h1 className="text-xl font-extrabold text-gray-900">Split unavailable</h1>
        <p className="text-sm text-gray-500">This split-bill link may have expired.</p>
      </div>
    );
  }

  const collected = order.splitPaidTotal || 0;
  const remaining = Math.max(0, order.total - collected);
  const requested = Number(searchParams.get("amount")) || remaining;
  const amount = Math.min(Math.max(requested, 0.01), Math.max(remaining, 0.01));
  const settled = !!order.paidAt || remaining <= 0.005;
  const showPaidState = settled || justPaid;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      paySplitPortion(order.id, amount);
      setProcessing(false);
      setJustPaid(true);
    }, 1400);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8F9FA] px-6 py-10">
      <div className="flex items-center gap-2">
        <div
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-white"
          style={{ backgroundColor: shop.primaryColor }}
        >
          {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <Pizza size={18} />}
        </div>
        <span className="text-sm font-extrabold text-gray-900">{shop.name}</span>
      </div>

      <div className="mt-10 w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-xl">
        {showPaidState ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
              <CheckCircle2 size={32} />
            </span>
            <h1 className="mt-4 text-xl font-extrabold text-gray-900">{justPaid ? "Your Share Is Paid!" : "Bill Already Settled"}</h1>
            <p className="mt-1 text-sm text-gray-500">Order {order.id} — thanks for splitting the bill.</p>
            <p className="mt-4 text-3xl font-extrabold text-gray-900">{formatCurrency(order.total)}</p>
            <p className="mt-1 text-xs font-semibold text-[#00A651]">Fully collected from the table</p>
          </>
        ) : (
          <>
            <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
              <Users size={13} /> Splitting Order {order.id}
            </p>
            <p className="mt-2 text-4xl font-extrabold text-gray-900">{formatCurrency(amount)}</p>
            <p className="mt-1 text-xs text-gray-400">Your share of the {formatCurrency(order.total)} bill</p>

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#00A651] transition-all"
                  style={{ width: `${Math.min(100, (collected / order.total) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-gray-500">
                {formatCurrency(collected)} of {formatCurrency(order.total)} collected
              </p>
            </div>

            <Button size="lg" className="mt-6 w-full py-3.5" style={{ backgroundColor: shop.primaryColor }} onClick={handlePay} disabled={processing}>
              {processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Processing…
                </span>
              ) : (
                `Pay My Share — ${formatCurrency(amount)}`
              )}
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck size={13} /> Secure mock checkout — no card reader needed.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
