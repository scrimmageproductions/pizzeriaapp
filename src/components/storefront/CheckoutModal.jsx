import { useEffect, useState } from "react";
import { Bike, CreditCard, ShoppingBag } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, TextInput } from "../shared/FormField";
import RedeemRewardsPanel from "./RedeemRewardsPanel";

export default function CheckoutModal({
  open,
  onClose,
  totals,
  primaryColor,
  onPlaceOrder,
  customers,
  redemptionCatalog,
  pointsPerDollar,
  cart,
  onRedeem,
  activeCustomer,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState("pickup");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Auto-fill for a recognized, logged-in customer so they can check out in two clicks.
  useEffect(() => {
    if (!open) return;
    if (activeCustomer) {
      const [f, ...rest] = (activeCustomer.name || "").split(" ");
      setFirstName(f || "");
      setLastName(rest.join(" "));
      setPhone(activeCustomer.phone || "");
      if (activeCustomer.lastAddress) setAddress(activeCustomer.lastAddress);
    }
  }, [open, activeCustomer]);

  const matchedCustomer = activeCustomer || customers.find((c) => c.phone && phone.trim() && c.phone === phone.trim());

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    phone.trim().length >= 7 &&
    (fulfillment === "pickup" || address.trim()) &&
    cardNumber.replace(/\s/g, "").length >= 12 &&
    cardExpiry.trim() &&
    cardCvc.trim().length >= 3;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onPlaceOrder({
      customerName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: "",
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

  const pointsWouldEarn = Math.floor(totals.total * (pointsPerDollar || 1));

  return (
    <Modal open={open} onClose={onClose} title="Checkout">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name">
            <TextInput autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
          </FormField>
          <FormField label="Last Name">
            <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
          </FormField>
        </div>

        <FormField label="Phone Number">
          <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
        </FormField>

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

        {matchedCustomer && (
          <RedeemRewardsPanel customer={matchedCustomer} redemptionCatalog={redemptionCatalog} cart={cart} onRedeem={onRedeem} primaryColor={primaryColor} />
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

        <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED]/10 to-[#E31837]/10 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-lg">🎁</span>
          <p className="text-xs font-bold text-gray-800">
            You could earn <span className="text-[#E31837]">{pointsWouldEarn} Slice Points</span> on this order! Create an account after
            checkout to save them for free Garlic Knots.
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full" style={{ backgroundColor: primaryColor }} disabled={!canSubmit}>
          Place Order
        </Button>
      </form>
    </Modal>
  );
}
