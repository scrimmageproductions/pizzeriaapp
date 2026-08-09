import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ImageOff, Palette, Sparkles, ShoppingBag } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { CUSTOM_MERCH_PRODUCTS } from "../../data/customMerch";
import { formatCurrency } from "../../utils/helpers";
import ProductMockup from "./ProductMockup";
import CustomProductModal from "./CustomProductModal";
import SupplyCartWidget from "./SupplyCartWidget";

const TAB_CLASS = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? "bg-gray-900 text-white" : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"}`;

export default function CustomBrandStudioPage() {
  const { shop } = useShopState();
  const { addToMerchantCart } = useShopActions();
  const cartRef = useRef(null);

  const [activeProduct, setActiveProduct] = useState(null);
  const hasLogo = !!shop.logoUrl;

  const handleAdd = (cartItem) => {
    addToMerchantCart(cartItem);
    cartRef.current?.openCart();
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

      <div className="overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-[#7C3AED]/[0.06] to-[#E31837]/[0.06] p-6 shadow-sm ring-2 ring-[#7C3AED]/20 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#E31837] text-white">
            <Palette size={22} />
          </span>
          <div>
            <p className="text-lg font-extrabold text-gray-900 sm:text-xl">Bring your brand to life.</p>
            <p className="text-sm text-gray-600">We automatically applied your logo to our premium supplies.</p>
          </div>
        </div>
      </div>

      {!hasLogo ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <ImageOff size={26} />
          </span>
          <p className="text-sm font-bold text-gray-700">Upload your logo in settings to see custom mockups!</p>
          <Link to="/admin/menu" className="text-sm font-semibold text-[#E31837] hover:underline">
            Go to Menu &amp; Brand →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {CUSTOM_MERCH_PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => setActiveProduct(product)}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:shadow-md"
            >
              <ProductMockup type={product.mockup} logoUrl={shop.logoUrl} color={shop.primaryColor} logoSize={45} />
              <div className="p-4">
                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  From {formatCurrency(product.tiers[0].price)}/ea · {product.tiers[product.tiers.length - 1].label} for{" "}
                  {formatCurrency(product.tiers[product.tiers.length - 1].price)}/ea
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#E31837]">
                  <Sparkles size={12} /> Customize &amp; Add to Cart
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <CustomProductModal open={!!activeProduct} product={activeProduct} shop={shop} onClose={() => setActiveProduct(null)} onAdd={handleAdd} />

      <SupplyCartWidget ref={cartRef} />
    </div>
  );
}
