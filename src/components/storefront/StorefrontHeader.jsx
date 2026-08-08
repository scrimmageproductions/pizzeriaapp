import { Star, MapPin, Phone, ShoppingCart, Pizza } from "lucide-react";
import { isShopOpen, formatHour } from "../../utils/helpers";
import { FONT_OPTIONS } from "../../data/mockData";

export default function StorefrontHeader({ config, cartCount, onOpenCart }) {
  const open = isShopOpen(config.hours);
  const fontFamily = FONT_OPTIONS.find((f) => f.id === config.font)?.family;

  return (
    <header className="relative">
      <div
        className="h-40 w-full bg-cover bg-center sm:h-56"
        style={{
          backgroundImage: config.coverUrl
            ? `url(${config.coverUrl})`
            : `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`,
        }}
      >
        <div className="flex h-full flex-col justify-between bg-black/20 p-4">
          <div className="flex items-center justify-end">
            <button
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-800 shadow backdrop-blur"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto -mt-10 max-w-3xl px-4 sm:-mt-12">
        <div className="flex items-end gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white text-3xl font-black text-white shadow-lg sm:h-24 sm:w-24"
            style={{ backgroundColor: config.primaryColor }}
          >
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.name} className="h-full w-full object-cover" />
            ) : (
              <Pizza size={36} />
            )}
          </div>
          <div className="min-w-0 pb-1">
            <h1
              style={{ fontFamily, color: "#1f2937" }}
              className="truncate text-2xl leading-tight sm:text-4xl"
            >
              {config.name}
            </h1>
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600">{config.tagline}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
              open ? "bg-[#00A651]/10 text-[#00A651]" : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-[#00A651]" : "bg-gray-400"}`} />
            {open ? "Open Now" : "Closed"} · {formatHour(config.hours.open)}–{formatHour(config.hours.close)}
          </span>

          {config.googleReviewsSynced && (
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
              <Star size={13} className="text-[#F39C12]" fill="currentColor" />
              {config.googleReviewRating} ({config.googleReviewCount} reviews)
            </span>
          )}

          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} /> {config.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Phone size={12} /> {config.phone}
          </span>
        </div>
      </div>
    </header>
  );
}
