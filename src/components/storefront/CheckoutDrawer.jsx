import { useEffect, useState } from "react";
import { ArrowLeft, Bike, Clock, CreditCard, Loader2, Minus, Plus, ShoppingBag, Trash2, Users, Utensils, X } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import Button from "../shared/Button";
import { FormField, TextArea, TextInput } from "../shared/FormField";

const TAX_RATE = 0.08;
const DELIVERY_FEE = 4.99;

// If the cart has a pizza but nothing from Sides/Drinks, surface one frictionless upsell —
// preferring garlic knots by name, then any available side, then any available drink.
function findUpsell(items, cart) {
  const hasPizza = cart.some((c) => c.category === "Pizzas");
  const hasSideOrDrink = cart.some((c) => c.category === "Sides" || c.category === "Drinks");
  if (!hasPizza || hasSideOrDrink) return null;
  const available = (i) => i.isAvailable !== false;
  return (
    items.find((i) => i.category === "Sides" && /garlic/i.test(i.name) && available(i)) ||
    items.find((i) => i.category === "Sides" && available(i)) ||
    items.find((i) => i.category === "Drinks" && available(i)) ||
    null
  );
}

export default function CheckoutDrawer({
  open,
  onClose,
  cart,
  items,
  onUpdateQty,
  onRemove,
  onAddUpsell,
  primaryColor,
  isDineIn,
  tableNumber,
  estimatedWaitMinutes,
  onPlaceOrder,
  onSplitBill,
}) {
  const [step, setStep] = useState("cart"); // 'cart' | 'fulfillment'
  const [fulfillmentType, setFulfillmentType] = useState("pickup"); // 'pickup' | 'delivery'
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [processing, setProcessing] = useState(false);

  // Every fresh open starts back at the cart view — closing mid-checkout and reopening shouldn't
  // strand the customer on a payment form they can't see items from.
  useEffect(() => {
    if (open) setStep("cart");
  }, [open]);

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const isDelivery = !isDineIn && fulfillmentType === "delivery";
  const deliveryFee = isDelivery ? DELIVERY_FEE : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + deliveryFee;

  const upsell = findUpsell(items, cart);

  const isPhoneValid = phone.trim().length >= 7;
  const isAddressValid = isDineIn || fulfillmentType === "pickup" || address.trim();
  const canSubmitBase = !!(customerName.trim() && isPhoneValid && isAddressValid);
  // Apple Pay skips manual card entry entirely (that's the point) — only the standard card form
  // requires those fields filled in.
  const canPayCard = canSubmitBase && cardNumber.replace(/\s/g, "").length >= 12 && cardExpiry.trim() && cardCvc.trim().length >= 3;
  const canSplit = isDineIn && customerName.trim() && isPhoneValid;

  const formatCardNumber = (value) =>
    value
      .replace(/[^0-9]/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const buildFields = () => ({
    customerName: customerName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    fulfillment: isDineIn ? "dine-in" : fulfillmentType,
    address: isDelivery ? address.trim() : null,
    deliveryInstructions: isDelivery ? deliveryInstructions.trim() : "",
    deliveryFee,
    totals: { subtotal, tax, deliveryFee, total },
  });

  const submitOrder = () => {
    if (processing) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPlaceOrder(buildFields());
    }, 900); // mock payment processing delay
  };

  const handleApplePay = () => canSubmitBase && submitOrder();
  const handleCardPay = () => canPayCard && submitOrder();

  const handleSplit = () => {
    if (!canSplit) return;
    onSplitBill(buildFields());
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
          {step === "cart" ? (
            <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
              <ShoppingBag size={18} /> Your Order
            </h3>
          ) : (
            <button onClick={() => setStep("cart")} className="flex items-center gap-1.5 text-base font-extrabold text-gray-900">
              <ArrowLeft size={16} /> Checkout
            </button>
          )}
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "cart" ? (
            cart.length === 0 ? (
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
            )
          ) : (
            <div className="space-y-4">
              {isDineIn ? (
                <div className="flex items-center gap-2 rounded-xl border-2 border-[#F39C12]/40 bg-[#F39C12]/10 px-4 py-3 text-sm font-bold text-[#B8860B]">
                  <Utensils size={16} /> Dine-In · Table {tableNumber}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1 rounded-full border-2 border-gray-200 p-1">
                  <button
                    onClick={() => setFulfillmentType("delivery")}
                    className={`flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold transition ${
                      fulfillmentType === "delivery" ? "text-white" : "text-gray-500"
                    }`}
                    style={fulfillmentType === "delivery" ? { backgroundColor: primaryColor } : undefined}
                  >
                    <Bike size={15} /> Delivery
                  </button>
                  <button
                    onClick={() => setFulfillmentType("pickup")}
                    className={`flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold transition ${
                      fulfillmentType === "pickup" ? "text-white" : "text-gray-500"
                    }`}
                    style={fulfillmentType === "pickup" ? { backgroundColor: primaryColor } : undefined}
                  >
                    <ShoppingBag size={15} /> Pickup
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Name">
                  <TextInput autoFocus value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Doe" />
                </FormField>
                <FormField label="Phone">
                  <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
                </FormField>
              </div>

              <FormField label="Email (Optional)">
                <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
              </FormField>

              {isDelivery ? (
                <>
                  <FormField label="Full Address">
                    <TextInput value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Apt 4B" />
                  </FormField>
                  <FormField label="Delivery Instructions">
                    <TextArea
                      rows={2}
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Gate code, leave at door, etc."
                    />
                  </FormField>
                </>
              ) : (
                !isDineIn && (
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Expected Ready Time: {estimatedWaitMinutes} minutes</span>
                  </div>
                )
              )}

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <CreditCard size={13} /> Payment
                </p>
                <button
                  type="button"
                  onClick={handleApplePay}
                  disabled={!canSubmitBase || processing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-bold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  🍎 Pay
                </button>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-300">
                  <span className="h-px flex-1 bg-gray-100" /> or pay with card <span className="h-px flex-1 bg-gray-100" />
                </div>
                <FormField label="Card Number">
                  <TextInput
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Expiry">
                    <TextInput value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} />
                  </FormField>
                  <FormField label="CVC">
                    <TextInput value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} placeholder="123" maxLength={4} inputMode="numeric" />
                  </FormField>
                </div>
              </div>
            </div>
          )}
        </div>

        {step === "cart" && cart.length > 0 && (
          <div className="space-y-2 border-t border-gray-100 px-5 py-4">
            {upsell && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">People also added</p>
                  <p className="truncate text-sm font-semibold text-gray-800">
                    🧄 {upsell.name} — {formatCurrency(upsell.price)}
                  </p>
                </div>
                <button
                  onClick={() => onAddUpsell(upsell)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  + Add to Cart
                </button>
              </div>
            )}
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
              <span>{formatCurrency(subtotal + tax)}</span>
            </div>
            <Button size="lg" className="mt-2 w-full" style={{ backgroundColor: primaryColor }} onClick={() => setStep("fulfillment")}>
              Proceed to Checkout →
            </Button>
          </div>
        )}

        {step === "fulfillment" && (
          <div className="space-y-2 border-t border-gray-100 px-5 py-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {isDelivery && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (8%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button size="lg" className="mt-2 w-full" style={{ backgroundColor: primaryColor }} disabled={!canPayCard || processing} onClick={handleCardPay}>
              {processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Processing…
                </span>
              ) : (
                `Pay ${formatCurrency(total)}`
              )}
            </Button>
            {isDineIn && (
              <button
                type="button"
                onClick={handleSplit}
                disabled={!canSplit}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-gray-200 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Users size={15} /> Split the Bill
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
