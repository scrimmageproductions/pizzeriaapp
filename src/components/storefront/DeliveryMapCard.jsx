import { Bike, Home, UtensilsCrossed } from "lucide-react";

export default function DeliveryMapCard({ progress, dispatched, primaryColor }) {
  const pct = Math.round(progress * 100);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div
        className="relative h-28 overflow-hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #eef1f4 0px, #eef1f4 1px, #f8fafb 1px, #f8fafb 22px), repeating-linear-gradient(90deg, #eef1f4 0px, #eef1f4 1px, #f8fafb 1px, #f8fafb 22px)",
        }}
      >
        <div className="absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
        <div
          className="absolute left-6 top-1/2 h-1 -translate-y-1/2 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `calc((100% - 3rem) * ${progress})`, backgroundColor: primaryColor }}
        />

        <div className="absolute left-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow ring-2 ring-white">
          <UtensilsCrossed size={14} className="text-gray-500" />
        </div>
        <div className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow ring-2 ring-white">
          <Home size={14} className="text-gray-500" />
        </div>

        <div
          className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg transition-all duration-1000 ease-linear"
          style={{ left: `calc(1.5rem + (100% - 3rem) * ${progress})`, backgroundColor: primaryColor }}
        >
          <Bike size={16} />
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-bold text-gray-900">Mike is your driver</p>
          <p className="text-xs text-gray-500">
            {!dispatched
              ? "Preparing to depart the kitchen…"
              : pct < 15
              ? "Just picked up your order"
              : pct < 85
              ? "On the way to you"
              : "Almost at your door!"}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">{pct}%</span>
      </div>
    </div>
  );
}
