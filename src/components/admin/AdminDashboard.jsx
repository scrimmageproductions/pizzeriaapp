import { useState } from "react";
import {
  Store,
  Palette,
  UtensilsCrossed,
  Tag,
  Link2,
  LayoutGrid,
  Pizza,
  Menu,
  X,
  Eye,
} from "lucide-react";
import { useAppState } from "../../context/AppContext";
import ShopProfileSection from "./ShopProfileSection";
import BrandDesignSection from "./BrandDesignSection";
import MenuBuilderSection from "./MenuBuilderSection";
import DealsSection from "./DealsSection";
import IntegrationsSection from "./IntegrationsSection";
import LiveOrderManagerSection from "./LiveOrderManagerSection";

const NAV_ITEMS = [
  { id: "profile", label: "Shop Profile & Logistics", icon: Store },
  { id: "brand", label: "Brand & Design", icon: Palette },
  { id: "menu", label: "Menu Builder", icon: UtensilsCrossed },
  { id: "deals", label: "Deals & Coupons", icon: Tag },
  { id: "integrations", label: "Google Integrations", icon: Link2 },
  { id: "orders", label: "Live Order Manager", icon: LayoutGrid },
];

export default function AdminDashboard({ onPreviewStorefront }) {
  const [activeSection, setActiveSection] = useState("orders");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { config, orders } = useAppState();

  const activeOrderCount = orders.filter((o) => o.status !== "completed").length;

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ShopProfileSection />;
      case "brand":
        return <BrandDesignSection />;
      case "menu":
        return <MenuBuilderSection />;
      case "deals":
        return <DealsSection />;
      case "integrations":
        return <IntegrationsSection />;
      case "orders":
        return <LiveOrderManagerSection />;
      default:
        return null;
    }
  };

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeSection)?.label;

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-bold text-gray-900">{activeLabel}</span>
        <button
          onClick={onPreviewStorefront}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#E31837] hover:bg-red-50"
        >
          <Eye size={20} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E31837] text-white shadow-sm">
              <Pizza size={22} />
            </span>
            <div>
              <p className="text-sm font-extrabold leading-tight text-gray-900">PizzaPlug</p>
              <p className="text-xs leading-tight text-gray-500">Command Center</p>
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
            style={{ backgroundColor: config.primaryColor }}
          >
            {config.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">{config.name}</p>
            <p className="truncate text-xs text-gray-500">{config.location}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileNavOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#E31837] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === "orders" && activeOrderCount > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                      isActive ? "bg-white text-[#E31837]" : "bg-[#E31837] text-white"
                    }`}
                  >
                    {activeOrderCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <button
            onClick={onPreviewStorefront}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Eye size={16} />
            Preview Storefront
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 px-4 pb-16 pt-20 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-extrabold text-gray-900">{activeLabel}</h1>
          </div>
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
