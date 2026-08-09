import { forwardRef, useImperativeHandle, useState } from "react";
import { CheckCircle2, CreditCard, Minus, Plus, ShoppingCart, Trash2, Truck, X } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Button from "../shared/Button";
import Toast from "../shared/Toast";

const TAX_RATE = 0.08;

/**
 * The floating cart button + slide-out drawer + one-click checkout, shared by both the standard
 * Hardware & Supplies store and the Custom Brand Studio so additions from either page land in the
 * same cart and checkout flow. Exposes `openCart()` via ref so a page can pop the drawer open the
 * moment something's added.
 */
const SupplyCartWidget = forwardRef(function SupplyCartWidget(_props, ref) {
  const { shop, merchantCart } = useShopState();
  const { updateMerchantCartQty, removeFromMerchantCart, checkoutMerchantCart } = useShopActions();

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState("");

  useImperativeHandle(ref, () => ({ openCart: () => setCartOpen(true) }));

  const subtotal = merchantCart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const cartCount = merchantCart.reduce((sum, c) => sum + c.qty, 0);

  const placeOrder = () => {
    checkoutMerchantCart(total);
    setCheckoutOpen(false);
    setCartOpen(false);
    setToast("Order confirmed! Your supplies are on the way.");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <>
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-700"
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E31837] px-1 text-[11px] font-bold text-white">
            {cartCount}
          </span>
        )}
      </button>

      {cartOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setCartOpen(false)} />}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <ShoppingCart size={18} /> Your Order
          </h3>
          <button onClick={() => setCartOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {merchantCart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
              <ShoppingCart size={32} />
              <p className="text-sm">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {merchantCart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.price)} each {item.subscription && "· Subscribed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateMerchantCartQty(item.productId, item.qty - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold">{item.qty}</span>
                    <button
                      onClick={() => updateMerchantCartQty(item.productId, item.qty + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button onClick={() => removeFromMerchantCart(item.productId)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {merchantCart.length > 0 && (
          <div className="space-y-2 border-t border-gray-100 px-5 py-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (8%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button
              size="lg"
              className="mt-2 w-full"
              onClick={() => {
                setCartOpen(false);
                setCheckoutOpen(true);
              }}
            >
              Checkout
            </Button>
          </div>
        )}
      </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCheckoutOpen(false)} />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-base font-extrabold text-gray-900">Confirm Order</h3>
              <button onClick={() => setCheckoutOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <Truck size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-500">Shipping to</p>
                  <p className="font-bold text-gray-900">{shop.name}</p>
                  <p className="text-gray-600">{shop.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <CreditCard size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-500">Billing to</p>
                  <p className="font-bold text-gray-900">Visa ending in {shop.billing?.cardLast4 || "4242"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-3">
                <span className="text-base font-extrabold text-gray-900">Total</span>
                <span className="text-2xl font-black text-gray-900">{formatCurrency(total)}</span>
              </div>
              <Button size="lg" className="w-full py-4 text-base" onClick={placeOrder}>
                Place Order
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast show={!!toast} message={toast} icon={CheckCircle2} />
    </>
  );
});

export default SupplyCartWidget;
