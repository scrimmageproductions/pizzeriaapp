import { useState } from "react";
import { Bike, ShoppingBag } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, TextInput } from "../shared/FormField";

export default function CheckoutModal({ open, onClose, totals, primaryColor, onPlaceOrder }) {
  const [customerName, setCustomerName] = useState("");
  const [fulfillment, setFulfillment] = useState("pickup");
  const [address, setAddress] = useState("");

  const canSubmit = customerName.trim() && (fulfillment === "pickup" || address.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onPlaceOrder({
      customerName: customerName.trim(),
      fulfillment,
      address: fulfillment === "delivery" ? address.trim() : null,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Checkout">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Your Name">
          <TextInput autoFocus value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Doe" />
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
