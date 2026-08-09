import { CupSoda, IceCreamCone, Plus, Salad, ShoppingBag } from "lucide-react";
import { CATEGORIES } from "../../data/menuScan";
import { formatCurrency, formatItemPrice } from "../../utils/helpers";

const CATEGORY_ICONS = {
  Pizzas: ShoppingBag,
  Sides: Salad,
  Drinks: CupSoda,
  Desserts: IceCreamCone,
};

export default function MenuList({ items, primaryColor, onAddToCart, disabled = false }) {
  const addSize = (item, size) => {
    onAddToCart({ id: `${item.id}::${size.label}`, name: `${item.name} (${size.label})`, price: size.price });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-8 pt-6">
      {CATEGORIES.map((category) => {
        const catItems = items.filter((i) => i.category === category);
        if (catItems.length === 0) return null;
        const Icon = CATEGORY_ICONS[category] || ShoppingBag;
        return (
          <section key={category}>
            <div className="mb-3 flex items-center gap-2">
              <Icon size={18} style={{ color: primaryColor }} />
              <h2 className="text-lg font-extrabold text-gray-900">{category}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {catItems.map((item) => {
                const hasSizes = item.sizes && item.sizes.length > 0;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</p>
                    </div>

                    {!hasSizes ? (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-gray-900">{formatItemPrice(item)}</span>
                        <button
                          onClick={() => onAddToCart(item)}
                          disabled={disabled}
                          style={disabled ? undefined : { backgroundColor: primaryColor }}
                          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95 ${
                            disabled ? "cursor-not-allowed bg-gray-200 text-gray-400" : "text-white"
                          }`}
                        >
                          <Plus size={13} /> Add
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.sizes.map((size) => (
                          <button
                            key={size.label}
                            onClick={() => addSize(item, size)}
                            disabled={disabled}
                            className={`flex flex-col items-center rounded-xl border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                              disabled
                                ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                                : "border-gray-200 text-gray-700 hover:border-current"
                            }`}
                            style={!disabled ? { color: primaryColor } : undefined}
                          >
                            {size.label}
                            <span className="text-[11px] font-semibold text-gray-500">{formatCurrency(size.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
