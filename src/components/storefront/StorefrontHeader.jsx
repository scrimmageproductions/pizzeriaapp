import { Pizza, ShoppingCart } from "lucide-react";
import { isShopOpen, formatHour } from "../../utils/helpers";

function CartButton({ primaryColor, cartCount, onOpenCart, floating }) {
  return (
    <button
      onClick={onOpenCart}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm ${
        floating ? "absolute right-4 top-4" : ""
      }`}
      style={{ backgroundColor: primaryColor }}
    >
      <ShoppingCart size={18} />
      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[11px] font-bold text-white">
          {cartCount}
        </span>
      )}
    </button>
  );
}

function OpenIndicator({ shop, dark }) {
  const open = isShopOpen(shop.hours);
  return (
    <span className={`flex items-center gap-1.5 text-xs font-bold ${open ? "text-[#00A651]" : dark ? "text-white/50" : "text-gray-400"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-[#00A651]" : dark ? "bg-white/40" : "bg-gray-400"}`} />
      {open ? "Open Now" : "Closed"} · {formatHour(shop.hours.open)}–{formatHour(shop.hours.close)}
    </span>
  );
}

export default function StorefrontHeader({ shop, cartCount, onOpenCart }) {
  if (shop.headerStyle === "hero" && shop.heroImageUrl) {
    return (
      <header className="relative h-64 w-full overflow-hidden sm:h-80">
        <img src={shop.heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <CartButton primaryColor={shop.primaryColor} cartCount={cartCount} onOpenCart={onOpenCart} floating />
        <div className="relative flex h-full flex-col items-center justify-end gap-2 px-4 pb-6 text-center">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-md"
            style={{ backgroundColor: shop.primaryColor }}
          >
            {shop.logoUrl ? <img src={shop.logoUrl} alt={shop.name} className="h-full w-full object-cover" /> : <Pizza size={24} />}
          </div>
          <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-3xl">{shop.name}</h1>
          <OpenIndicator shop={shop} dark />
        </div>
      </header>
    );
  }

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
            <OpenIndicator shop={shop} />
          </div>
        </div>

        <CartButton primaryColor={shop.primaryColor} cartCount={cartCount} onOpenCart={onOpenCart} />
      </div>
    </header>
  );
}
