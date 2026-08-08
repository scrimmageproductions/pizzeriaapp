import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Bike, Camera, Minus, PhoneCall, Pizza, Plus, ShoppingBag, Trash2, UserRound, X } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { CATEGORIES } from "../../data/menuScan";
import { formatCurrency, jitterLatLng } from "../../utils/helpers";
import { TextInput } from "../shared/FormField";
import PosPaymentModal from "./PosPaymentModal";
import PaperTicketModal from "./PaperTicketModal";

const TAX_RATE = 0.08;

const CATEGORY_STYLES = {
  Pizzas: "bg-red-500 hover:bg-red-600",
  Sides: "bg-emerald-500 hover:bg-emerald-600",
  Drinks: "bg-sky-500 hover:bg-sky-600",
  Desserts: "bg-violet-500 hover:bg-violet-600",
};
const FALLBACK_STYLE = "bg-gray-500 hover:bg-gray-600";

export default function PosPage() {
  const { shop, items, orders } = useShopState();
  const { addOrder, upsertCustomer, markOrderPaid } = useShopActions();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [ticket, setTicket] = useState([]);
  const [orderType, setOrderType] = useState("walkin"); // 'walkin' | 'phone'
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fulfillment, setFulfillment] = useState("pickup");
  const [address, setAddress] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paperTicket, setPaperTicket] = useState(null); // { imageUrl, total } | null
  const [scanOpen, setScanOpen] = useState(false);

  if (!shop) return <Navigate to="/onboarding" replace />;

  const addToTicket = (item) => {
    if (paperTicket) return; // photographed ticket already carries its own total — no digital items to add
    setTicket((prev) => {
      const existing = prev.find((t) => t.id === item.id);
      if (existing) return prev.map((t) => (t.id === item.id ? { ...t, qty: t.qty + 1 } : t));
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };
  const updateQty = (id, qty) =>
    setTicket((prev) => (qty <= 0 ? prev.filter((t) => t.id !== id) : prev.map((t) => (t.id === id ? { ...t, qty } : t))));

  const subtotal = ticket.reduce((sum, t) => sum + t.price * t.qty, 0);
  const tax = paperTicket ? 0 : subtotal * TAX_RATE;
  const total = paperTicket ? paperTicket.total : subtotal + tax;

  const isPhoneValid = orderType === "walkin" || (customerName.trim() && customerPhone.trim());
  const isDeliveryValid = orderType === "walkin" || fulfillment === "pickup" || address.trim();
  const canCharge = (ticket.length > 0 || !!paperTicket) && isPhoneValid && isDeliveryValid;

  const resetTicket = () => {
    setTicket([]);
    setOrderType("walkin");
    setCustomerName("");
    setCustomerPhone("");
    setFulfillment("pickup");
    setAddress("");
    setPaymentOpen(false);
    setPaperTicket(null);
  };

  const buildOrder = (paymentMethod, paid) => {
    const orderFulfillment = orderType === "walkin" ? "pickup" : fulfillment;
    const destination = orderFulfillment === "delivery" ? jitterLatLng(shop.lat, shop.lng) : { lat: null, lng: null };
    return {
      id: `DD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderType === "walkin" ? "Walk-in Guest" : customerName.trim(),
      customerEmail: "",
      customerPhone: orderType === "phone" ? customerPhone.trim() : "",
      fulfillment: orderFulfillment,
      address: orderFulfillment === "delivery" ? address.trim() : null,
      items: paperTicket ? [] : ticket.map((t) => ({ itemId: t.id, name: t.name, qty: t.qty, price: t.price })),
      ticketImageUrl: paperTicket?.imageUrl || null,
      total,
      createdAt: Date.now(),
      prepMinutes: shop.prepMinutes,
      completedAt: null,
      source: paperTicket ? "pos-paper" : "pos",
      paymentMethod,
      paidAt: paid ? Date.now() : null,
      assignedDriver: null,
      dispatchedAt: null,
      lat: destination.lat,
      lng: destination.lng,
    };
  };

  const commitOrder = (order) => {
    addOrder(order);
    if (orderType === "phone") {
      upsertCustomer({ name: order.customerName, email: "", phone: order.customerPhone, orderTotal: order.total });
    }
  };

  const handleCashCharge = (tendered) => {
    void tendered; // change-due is purely a UI readout in the modal, not persisted on the order
    commitOrder(buildOrder("cash", true));
  };

  const handleQrCharge = () => {
    const order = buildOrder("qr", false);
    commitOrder(order);
    return order;
  };

  const handleCardCharge = (paymentMethod) => {
    commitOrder(buildOrder(paymentMethod, true));
  };

  const handlePaperTicket = (imageUrl, ticketTotal) => {
    setTicket([]);
    setPaperTicket({ imageUrl, total: ticketTotal });
    setScanOpen(false);
  };

  const categoryItems = items.filter((i) => i.category === activeCategory);

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg text-white"
            style={{ backgroundColor: shop.primaryColor }}
          >
            {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <Pizza size={18} />}
          </span>
          <div>
            <p className="text-sm font-extrabold leading-tight text-gray-900">{shop.name}</p>
            <p className="text-xs leading-tight text-gray-400">Tablet POS</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200"
        >
          <ArrowLeft size={14} /> Exit to Dashboard
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Menu grid — 70% */}
        <div className="w-[70%] overflow-y-auto p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  activeCategory === cat ? "bg-gray-900 text-white" : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {categoryItems.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">No items in this category.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {categoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToTicket(item)}
                  className={`flex h-28 flex-col items-start justify-between rounded-2xl p-4 text-left text-white shadow-sm transition active:scale-95 ${
                    CATEGORY_STYLES[item.category] || FALLBACK_STYLE
                  }`}
                >
                  <span className="line-clamp-2 text-sm font-extrabold leading-tight">{item.name}</span>
                  <span className="text-base font-bold">{formatCurrency(item.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ticket — 30% */}
        <div className="flex w-[30%] flex-col border-l border-gray-200 bg-white">
          <div className="space-y-3 border-b border-gray-100 p-4">
            <button
              onClick={() => setScanOpen(true)}
              disabled={ticket.length > 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-bold text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Camera size={16} /> Snap Paper Ticket
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrderType("walkin")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold transition ${
                  orderType === "walkin" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                <UserRound size={15} /> Walk-in
              </button>
              <button
                onClick={() => setOrderType("phone")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold transition ${
                  orderType === "phone" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                <PhoneCall size={15} /> Phone Order
              </button>
            </div>

            {orderType === "phone" && (
              <div className="space-y-2 animate-fade-in">
                <TextInput value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" />
                <TextInput value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone number" />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFulfillment("pickup")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-2 text-xs font-bold transition ${
                      fulfillment === "pickup" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <ShoppingBag size={13} /> Pickup
                  </button>
                  <button
                    onClick={() => setFulfillment("delivery")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-2 text-xs font-bold transition ${
                      fulfillment === "delivery" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <Bike size={13} /> Delivery
                  </button>
                </div>
                {fulfillment === "delivery" && (
                  <TextInput value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" />
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {paperTicket ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200">
                  <img src={paperTicket.imageUrl} alt="Handwritten ticket" className="max-h-64 w-full object-cover" />
                  <button
                    onClick={() => setPaperTicket(null)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Camera size={13} /> Handwritten paper ticket — total entered manually
                </p>
              </div>
            ) : ticket.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-300">
                <ShoppingBag size={32} />
                <p className="text-sm">Tap items to start a ticket</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ticket.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 rounded-xl border border-gray-100 p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(t.price)} each</p>
                    </div>
                    <button
                      onClick={() => updateQty(t.id, t.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold">{t.qty}</span>
                    <button
                      onClick={() => updateQty(t.id, t.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Plus size={13} />
                    </button>
                    <button onClick={() => updateQty(t.id, 0)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-gray-100 p-4">
            {!paperTicket && (
              <>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax (8%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-lg font-extrabold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <button
              onClick={() => canCharge && setPaymentOpen(true)}
              disabled={!canCharge}
              className="mt-2 flex w-full items-center justify-center rounded-2xl py-4 text-lg font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: shop.primaryColor }}
            >
              Charge {formatCurrency(total)}
            </button>
            {(ticket.length > 0 || paperTicket) && !isPhoneValid && (
              <p className="text-center text-xs font-semibold text-red-500">Enter name & phone for a phone order</p>
            )}
            {(ticket.length > 0 || paperTicket) && isPhoneValid && !isDeliveryValid && (
              <p className="text-center text-xs font-semibold text-red-500">Enter a delivery address</p>
            )}
          </div>
        </div>
      </div>

      <PosPaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={total}
        primaryColor={shop.primaryColor}
        orders={orders}
        onCashCharge={handleCashCharge}
        onQrCharge={handleQrCharge}
        onCardCharge={handleCardCharge}
        onConfirmPaid={markOrderPaid}
        onFinish={resetTicket}
      />

      <PaperTicketModal open={scanOpen} onClose={() => setScanOpen(false)} onCreate={handlePaperTicket} primaryColor={shop.primaryColor} />
    </div>
  );
}
