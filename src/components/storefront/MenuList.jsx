import * as Icons from "lucide-react";
import { Plus, Star, UtensilsCrossed } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

function CategoryIcon({ name, ...props }) {
  const IconComp = Icons[name] || UtensilsCrossed;
  return <IconComp {...props} />;
}

export default function MenuList({ categories, items, primaryColor, onAddToCart }) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-8 pt-6">
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.categoryId === cat.id);
        if (catItems.length === 0) return null;
        return (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <div className="mb-3 flex items-center gap-2">
              <CategoryIcon name={cat.icon} size={18} style={{ color: primaryColor }} />
              <h2 className="text-lg font-extrabold text-gray-900">{cat.name}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      {item.popular && (
                        <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#F39C12]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#F39C12]">
                          <Star size={9} fill="currentColor" /> Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 flex-1 text-xs text-gray-500">{item.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-gray-900">{formatCurrency(item.price)}</span>
                      <button
                        onClick={() => onAddToCart(item)}
                        style={{ backgroundColor: primaryColor }}
                        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
                      >
                        <Plus size={13} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
