import { useState } from "react";
import { X, Minus, Plus, Trash2, Tag, ShoppingBag, Bike, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import Button from "../shared/Button";
import { TextInput } from "../shared/FormField";

export default function CartDrawer({
  open,
  onClose,
  cart,
  onUpdateQty,
  onRemove,
  config,
  coupons,
  onPlaceOrder,
}) {
  const [fulfillment, setFulfillment] = useState("pickup");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [promoError, setPromoError] = useState("");

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const discount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? subtotal * (appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, subtotal)
    : 0;
  const total = Math.max(0, subtotal - discount);

  const applyPromo = () => {
    const match = coupons.find((c) => c.code === promoInput.trim().toUpperCase() && c.active);
    if (match) {
      setAppliedCoupon(match);
      setPromoError("");
    } else {
      setAppliedCoupon(null);
      setPromoError("Invalid or inactive code");
    }
  };

  const canPlaceOrder =
    cart.length > 0 && customerName.trim() && (fulfillment === "pickup" || address.trim());

  const handlePlaceOrder = () => {
    if (!canPlaceOrder) return;
    onPlaceOrder({
      customerName: customerName.trim(),
      fulfillment,
      address: fulfillment === "delivery" ? address.trim() : null,
      total,
    });
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <ShoppingBag size={18} /> Your Order
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
              <ShoppingBag size={32} />
              <p className="text-sm">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold">{item.qty}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <TextInput
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFulfillment("pickup")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-2 text-xs font-bold transition ${
                      fulfillment === "pickup"
                        ? "border-[#E31837] bg-[#E31837]/5 text-[#E31837]"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <ShoppingBag size={14} /> Pickup
                  </button>
                  <button
                    onClick={() => config.deliveryEnabled && setFulfillment("delivery")}
                    disabled={!config.deliveryEnabled}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      fulfillment === "delivery"
                        ? "border-[#E31837] bg-[#E31837]/5 text-[#E31837]"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <Bike size={14} /> Delivery
                  </button>
                </div>

                {fulfillment === "delivery" && (
                  <TextInput
                    placeholder="Delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                )}

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <TextInput
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline" onClick={applyPromo} disabled={!promoInput.trim()}>
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="flex items-center gap-1 text-xs font-semibold text-[#00A651]">
                    <CheckCircle2 size={13} /> {appliedCoupon.code} applied
                  </p>
                )}
                {promoError && <p className="text-xs font-semibold text-red-500">{promoError}</p>}
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="space-y-2 border-t border-gray-100 px-5 py-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm font-semibold text-[#00A651]">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button
              variant="primary"
              className="mt-2 w-full"
              size="lg"
              disabled={!canPlaceOrder}
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
            {!canPlaceOrder && (
              <p className="text-center text-xs text-gray-400">
                {!customerName.trim()
                  ? "Enter your name to continue"
                  : fulfillment === "delivery" && !address.trim()
                  ? "Enter a delivery address to continue"
                  : ""}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
