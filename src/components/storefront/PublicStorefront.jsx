import { useState } from "react";
import { useParams } from "react-router-dom";
import { PauseCircle, Pizza } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { FONT_OPTIONS } from "../../data/brand";
import { jitterLatLng } from "../../utils/helpers";
import StorefrontHeader from "./StorefrontHeader";
import MenuList from "./MenuList";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";
import OrderTracker from "./OrderTracker";
import VipUpsellBanner from "./VipUpsellBanner";

export default function PublicStorefront() {
  const { slug } = useParams();
  const { shop, items, orders, brands, customers, subscriptionPlan } = useShopState();
  const { addOrder, upsertCustomer, subscribeCustomer } = useShopActions();

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutTotals, setCheckoutTotals] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const isDefaultBrand = shop && shop.slug === slug;
  const virtualBrand = shop && !isDefaultBrand ? brands.find((b) => b.slug === slug) : null;

  if (!shop || !(isDefaultBrand || virtualBrand)) {
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

  // Ghost Kitchen: a virtual brand's storefront shares the parent's menu, hours, and kitchen —
  // it only swaps in its own name/logo/color so customers never see the "real" account name.
  const displayShop = virtualBrand
    ? { ...shop, name: virtualBrand.name, slug: virtualBrand.slug, logoUrl: virtualBrand.logoUrl, primaryColor: virtualBrand.primaryColor }
    : shop;

  const activeOrder = orders.find((o) => o.id === activeOrderId);

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
  const removeItem = (id) => setCart((prev) => prev.filter((c) => c.id !== id));
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const openCheckout = (totals) => {
    setCheckoutTotals(totals);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const placeOrder = ({ customerName, email, phone, fulfillment, address }) => {
    const orderId = `DD-${Math.floor(1000 + Math.random() * 9000)}`;
    const destination = fulfillment === "delivery" ? jitterLatLng(shop.lat, shop.lng) : { lat: null, lng: null };
    const subscriberMatch = customers.find((c) => c.phone === phone.trim() && c.isSubscriber);
    const order = {
      id: orderId,
      customerName,
      customerEmail: email,
      customerPhone: phone,
      fulfillment,
      address,
      items: cart.map((c) => ({ itemId: c.id, name: c.name, qty: c.qty, price: c.price })),
      total: checkoutTotals.total,
      createdAt: Date.now(),
      prepMinutes: shop.prepMinutes,
      completedAt: null,
      source: "online",
      paymentMethod: "card",
      paidAt: Date.now(),
      assignedDriver: null,
      dispatchedAt: null,
      lat: destination.lat,
      lng: destination.lng,
      ...(virtualBrand && { brandId: virtualBrand.id, brandName: virtualBrand.name, brandColor: virtualBrand.primaryColor }),
      isSubscriberOrder: !!subscriberMatch,
    };
    addOrder(order);
    upsertCustomer({ name: customerName, email, phone, orderTotal: checkoutTotals.total });
    setActiveOrderId(orderId);
    setCart([]);
    setCheckoutOpen(false);
  };

  const handleSubscribe = ({ name, phone }) => {
    subscribeCustomer({ name, phone });
  };

  const fontFamily = FONT_OPTIONS.find((f) => f.id === displayShop.font)?.family;

  if (activeOrder) {
    return <OrderTracker order={activeOrder} shop={displayShop} onNewOrder={() => setActiveOrderId(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ fontFamily }}>
      <StorefrontHeader shop={displayShop} cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />

      {!displayShop.acceptingOrders && (
        <div className="mx-auto mt-4 flex max-w-3xl items-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-600">
          <PauseCircle size={16} />
          We're not accepting online orders right now — please check back soon!
        </div>
      )}

      {subscriptionPlan && <VipUpsellBanner shop={displayShop} plan={subscriptionPlan} onSubscribe={handleSubscribe} />}

      <MenuList
        items={items}
        primaryColor={displayShop.primaryColor}
        onAddToCart={addToCart}
        disabled={!displayShop.acceptingOrders}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        primaryColor={displayShop.primaryColor}
        onCheckout={openCheckout}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        totals={checkoutTotals || { subtotal: 0, tax: 0, total: 0 }}
        primaryColor={displayShop.primaryColor}
        onPlaceOrder={placeOrder}
      />
    </div>
  );
}
