import { useState } from "react";
import { useAppActions, useAppState } from "../../context/AppContext";
import StorefrontHeader from "./StorefrontHeader";
import MenuList from "./MenuList";
import CartDrawer from "./CartDrawer";
import OrderTracker from "./OrderTracker";

export default function Storefront({ onBackToAdmin }) {
  const { config, categories, items, coupons, orders } = useAppState();
  const { addOrder } = useAppActions();

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const activeOrder = orders.find((o) => o.id === activeOrderId);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id, qty) => {
    setCart((prev) => (qty <= 0 ? prev.filter((c) => c.id !== id) : prev.map((c) => (c.id === id ? { ...c, qty } : c))));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const placeOrder = ({ customerName, fulfillment, address, total }) => {
    const orderId = `PZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const order = {
      id: orderId,
      customerName,
      items: cart.map((c) => ({ itemId: c.id, name: c.name, qty: c.qty, price: c.price })),
      fulfillment,
      address,
      status: "received",
      createdAt: Date.now(),
      prepTimeMinutes: config.prepTimeMinutes,
      deliveryTransitMinutes: config.deliveryTransitMinutes,
      total,
    };
    addOrder(order);
    setActiveOrderId(orderId);
    setCart([]);
    setCartOpen(false);
  };

  if (activeOrder) {
    return (
      <OrderTracker
        order={activeOrder}
        config={config}
        onNewOrder={() => setActiveOrderId(null)}
        onBackToAdmin={onBackToAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <StorefrontHeader
        config={config}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onBackToAdmin={onBackToAdmin}
      />
      <MenuList
        categories={categories}
        items={items}
        primaryColor={config.primaryColor}
        onAddToCart={addToCart}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        config={config}
        coupons={coupons}
        onPlaceOrder={placeOrder}
      />
    </div>
  );
}
