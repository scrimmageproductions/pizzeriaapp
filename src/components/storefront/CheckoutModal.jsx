import { useState } from "react";
import { Bike, CreditCard, ShoppingBag } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, TextInput } from "../shared/FormField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutModal({ open, onClose, totals, primaryColor, onPlaceOrder }) {
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState("pickup");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const canSubmit =
    customerName.trim() &&
    EMAIL_RE.test(email.trim()) &&
    phone.trim().length >= 7 &&
    (fulfillment === "pickup" || address.trim()) &&
    cardNumber.replace(/\s/g, "").length >= 12 &&
    cardExpiry.trim() &&
    cardCvc.trim().length >= 3;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onPlaceOrder({
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      fulfillment,
      address: fulfillment === "delivery" ? address.trim() : null,
    });
  };

  const formatCardNumber = (value) =>
    value
      .replace(/[^0-9]/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  return (
    <Modal open={open} onClose={onClose} title="Checkout">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Your Name">
          <TextInput autoFocus value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Doe" />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email">
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
          </FormField>
          <FormField label="Phone">
            <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
          </FormField>
        </div>

        <FormField label="Order Type">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-2.5 text-sm font-bold transition ${
                fulfillment === "pickup" ? "text-white" : "border-gray-200 text-gray-500"
              }`}
              style={fulfillment === "pickup" ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
            >
              <ShoppingBag size={15} /> Pickup
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-2.5 text-sm font-bold transition ${
                fulfillment === "delivery" ? "text-white" : "border-gray-200 text-gray-500"
              }`}
              style={fulfillment === "delivery" ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
            >
              <Bike size={15} /> Delivery
            </button>
          </div>
        </FormField>

        {fulfillment === "delivery" && (
          <FormField label="Delivery Address">
            <TextInput value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Apt 4B" />
          </FormField>
        )}

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
            <CreditCard size={13} /> Payment
          </p>
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
              <TextInput
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
              />
            </FormField>
            <FormField label="CVC">
              <TextInput value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} placeholder="123" maxLength={4} inputMode="numeric" />
            </FormField>
          </div>
        </div>

        <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax (8%)</span>
            <span>{formatCurrency(totals.tax)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" style={{ backgroundColor: primaryColor }} disabled={!canSubmit}>
          Place Order
        </Button>
      </form>
    </Modal>
  );
}
