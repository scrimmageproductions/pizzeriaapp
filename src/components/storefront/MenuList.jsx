import { CupSoda, IceCreamCone, Plus, Salad, ShoppingBag } from "lucide-react";
import { CATEGORIES } from "../../data/menuScan";
import { formatCurrency } from "../../utils/helpers";

const CATEGORY_ICONS = {
  Pizzas: ShoppingBag,
  Sides: Salad,
  Drinks: CupSoda,
  Desserts: IceCreamCone,
};

function AddButton({ disabled, primaryColor, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={disabled ? undefined : { backgroundColor: primaryColor }}
      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95 ${
        disabled ? "cursor-not-allowed bg-gray-200 text-gray-400" : "text-white"
      }`}
    >
      <Plus size={13} /> Add
    </button>
  );
}

function MenuItemCard({ item, primaryColor, disabled, onAddToCart }) {
  const soldOut = item.isAvailable === false;
  const itemDisabled = disabled || soldOut;
  const handleAdd = () => !itemDisabled && onAddToCart(item);

  if (item.photoUrl) {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md sm:flex-row">
        <div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-auto sm:w-36">
          <img src={item.photoUrl} alt={item.name} className={`h-full w-full object-cover ${soldOut ? "grayscale" : ""}`} />
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-gray-900/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                Sold Out Today
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <p className="text-sm font-bold text-gray-900">{item.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-extrabold text-gray-900">{formatCurrency(item.price)}</span>
            <AddButton disabled={itemDisabled} primaryColor={primaryColor} onClick={handleAdd} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition ${
        soldOut ? "opacity-60 grayscale" : "hover:shadow-md"
      }`}
    >
      {soldOut && (
        <span className="absolute right-3 top-3 rounded-full bg-gray-900/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
          Sold Out Today
        </span>
      )}
      <div>
        <p className="text-sm font-bold text-gray-900">{item.name}</p>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-extrabold text-gray-900">{formatCurrency(item.price)}</span>
        <AddButton disabled={itemDisabled} primaryColor={primaryColor} onClick={handleAdd} />
      </div>
    </div>
  );
}

export default function MenuList({ items, primaryColor, onAddToCart, disabled = false }) {
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
              {catItems.map((item) => (
                <MenuItemCard key={item.id} item={item} primaryColor={primaryColor} disabled={disabled} onAddToCart={onAddToCart} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
