import { useState } from "react";
import { Check, ChevronsUpDown, MapPin, Plus } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import AddLocationModal from "./AddLocationModal";

/** Sits at the very top of the Admin Sidebar — switch which location's KDS/POS/dashboard data is showing. */
export default function LocationSwitcher() {
  const { shop } = useShopState();
  const { setActiveLocation } = useShopActions();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const locations = shop.locations || [];
  const active = locations.find((l) => l.id === shop.activeLocationId) || locations[0];

  if (locations.length === 0) return null;

  return (
    <div className="relative border-b border-white/10 px-3 py-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/10"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E31837]/20 text-[#E31837]">
          <MapPin size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{active?.name || "Select Location"}</p>
          <p className="text-[11px] text-white/40">
            {locations.length} location{locations.length === 1 ? "" : "s"}
          </p>
        </div>
        <ChevronsUpDown size={14} className="shrink-0 text-white/40" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-3 right-3 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-white/10 bg-[#1c1c1c] shadow-2xl">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  setActiveLocation(loc.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                <span className="flex-1 truncate">{loc.name}</span>
                {loc.id === shop.activeLocationId && <Check size={14} className="shrink-0 text-[#00A651]" />}
              </button>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                setAddOpen(true);
              }}
              className="flex w-full items-center gap-2 border-t border-white/10 px-3.5 py-2.5 text-left text-sm font-bold text-[#E31837] transition hover:bg-white/10"
            >
              <Plus size={14} /> Add New Location (+$10/mo)
            </button>
          </div>
        </>
      )}

      <AddLocationModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
