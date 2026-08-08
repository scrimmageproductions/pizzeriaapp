import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import Button from "../shared/Button";

const TAX_RATE = 0.08;

export default function CartDrawer({ open, onClose, cart, onUpdateQty, onRemove, primaryColor, onCheckout }) {
  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

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
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
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
            </div>
          )}
        </div>

        {cart.length > 0 && (
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
              style={{ backgroundColor: primaryColor }}
              onClick={() => onCheckout({ subtotal, tax, total })}
            >
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
