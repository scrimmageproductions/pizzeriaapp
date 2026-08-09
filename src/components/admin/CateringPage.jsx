import { useState } from "react";
import { CalendarClock, Mail, Minus, Plus, Send, ShoppingBag } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatClockTime, formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Toast from "../shared/Toast";
import { FormField, TextInput } from "../shared/FormField";

const TAX_RATE = 0.08;
const DEPOSIT_RATE = 0.5;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function formatEventAt(ms) {
  return new Date(ms).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function CateringPage() {
  const { shop, items, orders, scheduledOrders } = useShopState();
  const { addScheduledOrder } = useShopActions();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [ticket, setTicket] = useState([]);
  const [toast, setToast] = useState("");

  const addToTicket = (item) => {
    setTicket((prev) => {
      const existing = prev.find((t) => t.id === item.id);
      if (existing) return prev.map((t) => (t.id === item.id ? { ...t, qty: t.qty + 1 } : t));
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };
  const updateQty = (id, qty) =>
    setTicket((prev) => (qty <= 0 ? prev.filter((t) => t.id !== id) : prev.map((t) => (t.id === id ? { ...t, qty } : t))));

  const subtotal = ticket.reduce((sum, t) => sum + t.price * t.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const deposit = total * DEPOSIT_RATE;

  const eventAt = eventDateTime ? new Date(eventDateTime).getTime() : null;
  const canSend = customerName.trim() && customerEmail.trim() && eventAt && eventAt > Date.now() && ticket.length > 0;

  const handleSendInvoice = () => {
    if (!canSend) return;
    const order = {
      id: `DD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      eventAt,
      items: ticket.map((t) => ({ itemId: t.id, name: t.name, qty: t.qty, price: t.price })),
      total,
      depositAmount: deposit,
      createdAt: Date.now(),
    };
    addScheduledOrder(order);
    setToast(`Invoice sent to ${order.customerEmail} — ${formatCurrency(deposit)} deposit requested.`);
    setTimeout(() => setToast(""), 3200);
    setCustomerName("");
    setCustomerEmail("");
    setEventDateTime("");
    setTicket([]);
  };

  const upcoming = [...scheduledOrders].sort((a, b) => a.eventAt - b.eventAt);
  const inKitchen = orders.filter((o) => o.isCatering && !o.completedAt);

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast show={!!toast} message={toast} icon={Send} />

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">📅 Catering & Events</h1>
        <p className="text-sm text-gray-500">Big future orders, held off today's KDS until the kitchen actually needs to see them.</p>
      </div>

      <Card title="New Catering Quote" description="Build the invoice, then collect a 50% deposit to lock in the date." icon={CalendarClock}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Customer Name">
            <TextInput value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jordan's Office Party" />
          </FormField>
          <FormField label="Email">
            <TextInput type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="jordan@example.com" />
          </FormField>
          <FormField label="Event Date & Time" className="sm:col-span-2">
            <input
              type="datetime-local"
              value={eventDateTime}
              onChange={(e) => setEventDateTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#E31837] focus:ring-2 focus:ring-[#E31837]/20"
            />
          </FormField>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-gray-800">Menu Items</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => addToTicket(item)}
                className="flex flex-col items-start gap-0.5 rounded-xl border border-gray-200 p-3 text-left text-sm transition hover:border-[#E31837] hover:bg-[#E31837]/5"
              >
                <span className="font-bold text-gray-900">{item.name}</span>
                <span className="text-xs text-gray-400">{formatCurrency(item.price)}</span>
              </button>
            ))}
          </div>
        </div>

        {ticket.length > 0 && (
          <div className="mt-4 space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
            {ticket.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">{t.name}</span>
                <button
                  onClick={() => updateQty(t.id, t.qty - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:bg-gray-100"
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-sm font-bold">{t.qty}x</span>
                <button
                  onClick={() => updateQty(t.id, t.qty + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm hover:bg-gray-100"
                >
                  <Plus size={12} />
                </button>
                <span className="w-16 shrink-0 text-right text-sm font-bold text-gray-900">{formatCurrency(t.price * t.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm text-gray-500">
              <span>Subtotal + Tax</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>50% Deposit Due Today</span>
              <span>{formatCurrency(deposit)}</span>
            </div>
          </div>
        )}

        <Button
          size="lg"
          icon={Mail}
          className="mt-4 w-full py-3.5"
          style={{ backgroundColor: shop.primaryColor }}
          disabled={!canSend}
          onClick={handleSendInvoice}
        >
          Send Invoice & Collect 50% Deposit
        </Button>
        {ticket.length > 0 && !canSend && (
          <p className="mt-2 text-center text-xs font-semibold text-red-500">
            Fill in customer name, email, and a future event date to send the invoice.
          </p>
        )}
      </Card>

      {inKitchen.length > 0 && (
        <Card title="Currently in the Kitchen" description="Catering orders that have crossed the 2-hour mark." icon={ShoppingBag}>
          <div className="space-y-2">
            {inKitchen.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">{o.customerName}</p>
                  <p className="text-xs text-purple-600">Due at {formatClockTime(o.eventAt)}</p>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(o.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Upcoming Scheduled Orders" description="Held off the KDS until 2 hours before the event.">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
            <CalendarClock size={28} />
            <p className="text-sm">No catering orders on the books yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((o) => (
              <div key={o.id} className="rounded-xl border border-gray-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{o.customerName}</p>
                    <p className="text-xs text-gray-500">{o.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatEventAt(o.eventAt)}</p>
                    <p className="text-xs text-gray-400">Kitchen alert at {formatClockTime(o.eventAt - TWO_HOURS_MS)}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-gray-100 pt-2 text-xs text-gray-500">
                  <span>{o.items.map((it) => `${it.qty}x ${it.name}`).join(", ")}</span>
                  <span className="font-bold text-gray-700">
                    {formatCurrency(o.total)} total · {formatCurrency(o.depositAmount)} deposit collected
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
