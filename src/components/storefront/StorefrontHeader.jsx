import { Pizza, ShoppingCart } from "lucide-react";
import { isShopOpen, formatHour } from "../../utils/helpers";

export default function StorefrontHeader({ shop, cartCount, onOpenCart }) {
  const open = isShopOpen(shop.hours);

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-md"
            style={{ backgroundColor: shop.primaryColor }}
          >
            {shop.logoUrl ? <img src={shop.logoUrl} alt={shop.name} className="h-full w-full object-cover" /> : <Pizza size={22} />}
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-gray-900">{shop.name}</h1>
            <span
              className={`flex items-center gap-1.5 text-xs font-bold ${open ? "text-[#00A651]" : "text-gray-400"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-[#00A651]" : "bg-gray-400"}`} />
              {open ? "Open Now" : "Closed"} · {formatHour(shop.hours.open)}–{formatHour(shop.hours.close)}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenCart}
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm"
          style={{ backgroundColor: shop.primaryColor }}
        >
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[11px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
