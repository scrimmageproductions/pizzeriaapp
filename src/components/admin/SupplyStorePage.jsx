import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Plus, Printer, QrCode, Receipt, Sparkles, ShoppingBag } from "lucide-react";
import { useShopActions } from "../../context/ShopContext";
import { SUPPLY_PRODUCTS } from "../../data/supplyStore";
import { formatCurrency } from "../../utils/helpers";
import Button from "../shared/Button";
import SupplyCartWidget from "./SupplyCartWidget";

const ICONS = { QrCode, ShoppingBag, Printer, Receipt };

const TAB_CLASS = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? "bg-gray-900 text-white" : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"}`;

export default function SupplyStorePage() {
  const { addToMerchantCart } = useShopActions();
  const cartRef = useRef(null);

  const [subscribed, setSubscribed] = useState({}); // { [productId]: boolean }
  const [pulseId, setPulseId] = useState(null);

  const handleAddToCart = (product) => {
    const isSubscribed = product.subscribable && subscribed[product.id];
    const price = isSubscribed ? +(product.price * 0.9).toFixed(2) : product.price;
    addToMerchantCart({ productId: product.id, name: product.name, price, subscription: isSubscribed });
    cartRef.current?.openCart();
    setPulseId(product.id);
    setTimeout(() => setPulseId(null), 500);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <ShoppingBag size={22} /> Hardware & Supplies
        </h1>
        <p className="text-sm text-gray-500">Everything you need to run your shop — ordered without ever leaving your dashboard.</p>
      </div>

      <div className="flex gap-2">
        <NavLink to="/admin/supply-store" end className={TAB_CLASS}>
          Hardware & Supplies
        </NavLink>
        <NavLink to="/admin/supply-store/custom" className={TAB_CLASS}>
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} /> Custom Branded Merch
          </span>
        </NavLink>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#121212] p-6 text-white shadow-lg sm:p-8">
        <p className="text-2xl font-extrabold sm:text-3xl">Everything you need to run your shop.</p>
        <p className="mt-2 text-sm text-white/50">Fast shipping, guaranteed quality.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SUPPLY_PRODUCTS.map((product) => {
          const Icon = ICONS[product.icon] || ShoppingBag;
          const isSubscribed = !!subscribed[product.id];
          const price = product.subscribable && isSubscribed ? product.price * 0.9 : product.price;
          return (
            <div key={product.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E31837]/10 text-[#E31837]">
                <Icon size={22} />
              </span>
              <p className="mt-3 text-sm font-bold text-gray-900">{product.name}</p>
              <p className="mt-1 flex-1 text-xs text-gray-500">{product.description}</p>

              {product.subscribable && (
                <label className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                  <span className="text-xs font-semibold text-gray-600">Subscribe &amp; Save 10% — auto-ships monthly</span>
                  <button
                    type="button"
                    onClick={() => setSubscribed((prev) => ({ ...prev, [product.id]: !prev[product.id] }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      isSubscribed ? "bg-[#00A651]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        isSubscribed ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-extrabold text-gray-900">{formatCurrency(price)}</span>
                <motion.div animate={pulseId === product.id ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.4 }}>
                  <Button size="sm" icon={pulseId === product.id ? CheckCircle2 : Plus} onClick={() => handleAddToCart(product)}>
                    {pulseId === product.id ? "Added" : "Add to Cart"}
                  </Button>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      <SupplyCartWidget ref={cartRef} />
    </div>
  );
}
