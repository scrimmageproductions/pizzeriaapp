import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Ban, LayoutGrid, Megaphone, Menu, Palette, Pizza, Store, Users, X } from "lucide-react";
import { useShopState } from "../../context/ShopContext";

const NAV_ITEMS = [
  { to: "/admin", end: true, label: "Overview", icon: Store },
  { to: "/admin/kds", label: "Live Order KDS", icon: LayoutGrid },
  { to: "/admin/menu", label: "Menu & Brand", icon: Palette },
  { to: "/admin/crm", label: "Customer CRM", icon: Users },
  { to: "/admin/marketing", label: "Automated Marketing", icon: Megaphone },
];

export default function AdminLayout({ children }) {
  const { shop, orders } = useShopState();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeOrderCount = orders.filter((o) => !o.completedAt).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-bold text-gray-900">{shop.name}</span>
        <span className="w-9" />
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#121212] transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-5">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E31837] text-white shadow-sm">
              <Pizza size={22} />
            </span>
            <div className="text-left">
              <p className="text-sm font-extrabold leading-tight text-white">DeepDish</p>
              <p className="text-xs leading-tight text-white/50">Owner Dashboard</p>
            </div>
          </button>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-black text-white"
            style={{ backgroundColor: shop.primaryColor }}
          >
            {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : shop.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{shop.name}</p>
            <p className="truncate text-xs text-white/50">deepdish.store/{shop.slug}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive ? "bg-[#E31837] text-white shadow-sm" : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.to === "/admin/kds" && activeOrderCount > 0 && (
                      <span
                        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                          isActive ? "bg-white text-[#E31837]" : "bg-[#E31837] text-white"
                        }`}
                      >
                        {activeOrderCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40">
            <Ban size={12} /> 0% commission, always
          </p>
        </div>
      </aside>

      {mobileNavOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileNavOpen(false)} />}

      <main className="flex-1 px-4 pb-16 pt-20 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
