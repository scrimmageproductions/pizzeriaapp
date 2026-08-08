import { LayoutDashboard, Pizza, Store } from "lucide-react";

export default function TopToggle({ view, onChange }) {
  return (
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E31837] text-white">
          <Pizza size={15} />
        </span>
        <span className="hidden text-sm font-extrabold text-gray-900 sm:inline">PizzaPlug</span>
      </div>

      <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
        <button
          onClick={() => onChange("admin")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
            view === "admin" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LayoutDashboard size={14} /> Admin
        </button>
        <button
          onClick={() => onChange("storefront")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
            view === "storefront" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Store size={14} /> Storefront
        </button>
      </div>
    </header>
  );
}
