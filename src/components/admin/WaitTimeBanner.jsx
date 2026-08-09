import { Flame, Lock, Unlock } from "lucide-react";
import { formatWaitRange } from "../../utils/waitTime";

/**
 * The KDS's Auto-Throttle status banner. Green and unobtrusive when wait times are normal,
 * escalates to orange/red the moment the algorithm bumps the storefront quote above baseline —
 * with a manual override for when a manager wants to force the standard quote regardless.
 */
export default function WaitTimeBanner({ waitTime, overrideActive, onToggleOverride }) {
  if (overrideActive) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Lock size={16} className="text-gray-500" /> Manual Override Active — quoting standard {formatWaitRange(20)} regardless of load
          {waitTime.isThrottled && <span className="text-xs font-semibold text-gray-400">(algorithm wants {formatWaitRange(waitTime.baseMinutes)})</span>}
        </p>
        <button
          onClick={onToggleOverride}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-700"
        >
          <Unlock size={13} /> Re-enable Auto-Throttle
        </button>
      </div>
    );
  }

  if (!waitTime.isThrottled) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#00A651]/20 bg-[#00A651]/5 px-4 py-3">
        <p className="text-sm font-bold text-[#00713a]">🟢 Standard Wait: {waitTime.minutes}m</p>
        <button onClick={onToggleOverride} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
          Override
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#E31837]/30 bg-gradient-to-r from-[#E31837]/10 to-orange-500/10 px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-bold text-[#c31530]">
        <Flame size={16} className="text-[#E31837]" /> High Volume: Auto-Throttle engaged. Storefront quoting {formatWaitRange(waitTime.minutes)}
        {waitTime.isPeak && <span className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] font-bold text-orange-600">Peak Rush</span>}
      </p>
      <button
        onClick={onToggleOverride}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#c31530] shadow-sm hover:bg-gray-50"
      >
        <Lock size={13} /> Override to Standard
      </button>
    </div>
  );
}
