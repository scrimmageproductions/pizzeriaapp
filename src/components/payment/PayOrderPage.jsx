import { useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Loader2, Pizza, ShieldCheck } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Button from "../shared/Button";

export default function PayOrderPage() {
  const { orderId } = useParams();
  const { shop, orders } = useShopState();
  const { markOrderPaid } = useShopActions();
  const [processing, setProcessing] = useState(false);

  const order = orders.find((o) => o.id === orderId);

  if (!shop || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8F9FA] px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-200 text-gray-400">
          <Pizza size={28} />
        </span>
        <h1 className="text-xl font-extrabold text-gray-900">Order not found</h1>
        <p className="text-sm text-gray-500">This payment link may have expired.</p>
      </div>
    );
  }

  const paid = !!order.paidAt;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      markOrderPaid(order.id);
      setProcessing(false);
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
        {paid ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
              <CheckCircle2 size={32} />
            </span>
            <h1 className="mt-4 text-xl font-extrabold text-gray-900">Payment Successful</h1>
            <p className="mt-1 text-sm text-gray-500">Order {order.id} is paid in full. Show this screen to the cashier.</p>
            <p className="mt-4 text-3xl font-extrabold text-gray-900">{formatCurrency(order.total)}</p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Order {order.id}</p>
            <p className="mt-2 text-4xl font-extrabold text-gray-900">{formatCurrency(order.total)}</p>
            <div className="mt-4 space-y-1.5 text-left">
              {order.items.map((it) => (
                <div key={it.itemId} className="flex justify-between text-sm text-gray-500">
                  <span>
                    {it.qty}× {it.name}
                  </span>
                  <span>{formatCurrency(it.qty * it.price)}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="mt-6 w-full py-3.5"
              style={{ backgroundColor: shop.primaryColor }}
              onClick={handlePay}
              disabled={processing}
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Processing…
                </span>
              ) : (
                "Pay with Apple Pay / Google Pay"
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
