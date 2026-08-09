import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PauseCircle, Pizza } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { FONT_OPTIONS } from "../../data/brand";
import { DEFAULT_LOYALTY } from "../../data/loyalty";
import { jitterLatLng } from "../../utils/helpers";
import StorefrontHeader from "./StorefrontHeader";
import MenuList from "./MenuList";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";
import OrderTracker from "./OrderTracker";

export default function PublicStorefront() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");
  const { shop, items, orders, customers, activeCustomerId, estimatedWaitTime } = useShopState();
  const { addOrder, upsertCustomer, redeemReward, setActiveCustomer } = useShopActions();

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutTotals, setCheckoutTotals] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);

  if (!shop || shop.slug !== slug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8F9FA] px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-200 text-gray-400">
          <Pizza size={28} />
        </span>
        <h1 className="text-xl font-extrabold text-gray-900">Shop not found</h1>
        <p className="text-sm text-gray-500">There's no pizzeria at deepdish.store/{slug} yet.</p>
      </div>
    );
  }

  const activeOrder = orders.find((o) => o.id === activeOrderId);
  const activeCustomer = activeCustomerId ? customers.find((c) => c.id === activeCustomerId) || null : null;
  const loyalty = shop.loyalty || DEFAULT_LOYALTY;

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id, qty) =>
    setCart((prev) => (qty <= 0 ? prev.filter((c) => c.id !== id) : prev.map((c) => (c.id === id ? { ...c, qty } : c))));

  const removeItem = (id) => {
    const removed = cart.find((c) => c.id === id);
    if (removed?.isReward && removed.customerId) {
      redeemReward(removed.customerId, -removed.pointsCost); // refund the points spent on this reward
    }
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRedeem = (customer, reward) => {
    if ((customer.loyaltyPoints || 0) < reward.pointsCost) return;
    setCart((prev) => [
      ...prev,
      { id: `reward_${reward.id}_${Date.now()}`, name: reward.freeItemName, price: 0, qty: 1, isReward: true, rewardId: reward.id, pointsCost: reward.pointsCost, customerId: customer.id },
    ]);
    redeemReward(customer.id, reward.pointsCost);
    setCartOpen(true);
  };

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const openCheckout = (totals) => {
    setCheckoutTotals(totals);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const placeOrder = ({ customerName, email, phone, fulfillment, address }) => {
    const orderId = `DD-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalFulfillment = tableNumber ? "dine-in" : fulfillment;
    const finalAddress = tableNumber ? `Table ${tableNumber}` : address;
    const destination = finalFulfillment === "delivery" ? jitterLatLng(shop.lat, shop.lng) : { lat: null, lng: null };
    const order = {
      id: orderId,
      customerName,
      customerEmail: email,
      customerPhone: phone,
      fulfillment: finalFulfillment,
      address: finalAddress,
      items: cart.map((c) => ({ itemId: c.id, name: c.name, qty: c.qty, price: c.price, modifiers: c.modifiers || null })),
      total: checkoutTotals.total,
      createdAt: Date.now(),
      prepMinutes: shop.prepMinutes,
      completedAt: null,
      source: "online",
      paymentMethod: "card",
      paidAt: Date.now(),
      thirdPartySource: null,
      assignedDriver: null,
      assignedDriverId: null,
      dispatchedAt: null,
      lat: destination.lat,
      lng: destination.lng,
      locationId: shop.locations?.[0]?.id || null, // online orders always route to the primary location
    };
    addOrder(order);
    upsertCustomer({ name: customerName, email, phone, orderTotal: checkoutTotals.total, address });
    setActiveOrderId(orderId);
    setCart([]);
    setCheckoutOpen(false);
  };

  const fontFamily = FONT_OPTIONS.find((f) => f.id === shop.font)?.family;

  if (activeOrder) {
    return <OrderTracker order={activeOrder} shop={shop} onNewOrder={() => setActiveOrderId(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ fontFamily }}>
      <StorefrontHeader
        shop={shop}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        customer={activeCustomer}
        onSignOut={() => setActiveCustomer(null)}
        estimatedWaitTime={estimatedWaitTime}
      />

      {!shop.acceptingOrders && (
        <div className="mx-auto mt-4 flex max-w-3xl items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-600">
          <PauseCircle size={16} />
          We're not accepting online orders right now — please check back soon!
        </div>
      )}

      <MenuList
        items={items}
        primaryColor={shop.primaryColor}
        onAddToCart={addToCart}
        disabled={!shop.acceptingOrders}
      />

      <footer className="mx-auto max-w-3xl px-4 pb-10 pt-4 text-center">
        <Link to={`/${slug}/careers`} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
          🚗 We're Hiring Drivers!
        </Link>
      </footer>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        primaryColor={shop.primaryColor}
        onCheckout={openCheckout}
        customer={activeCustomer}
        redemptionCatalog={loyalty.redemptionCatalog}
        onRedeem={handleRedeem}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        totals={checkoutTotals || { subtotal: 0, tax: 0, total: 0 }}
        primaryColor={shop.primaryColor}
        onPlaceOrder={placeOrder}
        customers={customers}
        redemptionCatalog={loyalty.redemptionCatalog}
        pointsPerDollar={loyalty.pointsPerDollar}
        cart={cart}
        onRedeem={handleRedeem}
        activeCustomer={activeCustomer}
        tableNumber={tableNumber}
      />
    </div>
  );
}
