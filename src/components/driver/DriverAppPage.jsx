import { useParams } from "react-router-dom";
import { CheckCircle2, MapPin, MessageCircle, Navigation, Pizza, User } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";

export default function DriverAppPage() {
  const { token } = useParams();
  const { shop, drivers, orders } = useShopState();
  const { markOrderDelivered } = useShopActions();

  const driver = drivers.find((d) => d.authToken === token);

  if (!shop || !driver) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-gray-950 px-6 text-center text-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Pizza size={24} />
        </span>
        <p className="text-lg font-bold">Invalid or expired driver link</p>
        <p className="text-sm text-white/50">Ask the owner to generate a new one from Team & Drivers.</p>
      </div>
    );
  }

  const myOrders = orders
    .filter((o) => o.assignedDriverId === driver.id && !o.completedAt)
    .sort((a, b) => (a.dispatchedAt || 0) - (b.dispatchedAt || 0));

  return (
    <div className="min-h-screen bg-gray-950 pb-10 text-white">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-gray-950/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <p className="text-lg font-extrabold">Hi, {driver.name.split(" ")[0]} 👋</p>
            <p className="text-xs text-white/50">{shop.name} · {myOrders.length} active delivery{myOrders.length === 1 ? "" : "ies"}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A651]/20 text-[#00A651]">
            <Navigation size={18} />
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-4 py-5">
        {myOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 py-16 text-center text-white/40">
            <CheckCircle2 size={28} />
            <p className="text-sm">No deliveries assigned right now.</p>
          </div>
        ) : (
          myOrders.map((order) => {
            const cashOwed = order.paymentMethod === "cash";
            const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(order.address || "")}`;
            const smsHref = order.customerPhone
              ? `sms:${order.customerPhone}?body=${encodeURIComponent("DeepDish Delivery: I'm 2 minutes away!")}`
              : null;

            return (
              <div key={order.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-lg font-extrabold">{order.id}</p>
                  {cashOwed && (
                    <span className="rounded-full bg-[#F39C12]/20 px-2.5 py-1 text-xs font-extrabold text-[#F39C12]">
                      Collect {formatCurrency(order.total)}
                    </span>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-white/80">
                  <User size={14} className="shrink-0" /> {order.customerName}
                </p>
                <p className="mt-1 flex items-start gap-1.5 text-sm text-white/60">
                  <MapPin size={14} className="mt-0.5 shrink-0" /> {order.address}
                </p>
                <p className="mt-2 text-sm font-bold text-white">{formatCurrency(order.total)} total</p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-3.5 text-sm font-bold hover:bg-white/20"
                  >
                    🗺️ Navigate
                  </a>
                  {smsHref ? (
                    <a
                      href={smsHref}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-3.5 text-sm font-bold hover:bg-white/20"
                    >
                      <MessageCircle size={15} /> Text
                    </a>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5 rounded-xl bg-white/5 py-3.5 text-sm font-bold text-white/30">
                      No phone on file
                    </span>
                  )}
                </div>

                <button
                  onClick={() => markOrderDelivered(order.id)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A651] py-5 text-base font-extrabold shadow-lg active:scale-[0.98]"
                >
                  <CheckCircle2 size={20} /> Mark Delivered
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
