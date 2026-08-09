// The Algorithmic Auto-Throttle: quoted storefront wait times rise automatically with kitchen
// load, rather than staying pinned to a static number that stops meaning anything the moment a
// rush hits. Pure functions here so the logic is trivially testable independent of React.

export const BASE_WAIT_MINUTES = 20;
export const VOLUME_BASELINE_ORDERS = 5;
export const VOLUME_PENALTY_MINUTES = 2;
export const PEAK_MULTIPLIER = 1.25;

export const DEFAULT_WAIT_TIME = {
  minutes: BASE_WAIT_MINUTES,
  baseMinutes: BASE_WAIT_MINUTES,
  isPeak: false,
  isThrottled: false,
  overridden: false,
  activeOrderCount: 0,
};

/** Friday/Saturday, 5:00 PM–8:00 PM local time — the mocked "peak rush" window. */
export function isPeakRush(date = new Date()) {
  const day = date.getDay(); // 0 Sun .. 5 Fri, 6 Sat
  const hour = date.getHours();
  return (day === 5 || day === 6) && hour >= 17 && hour < 20;
}

/**
 * activeOrderCount should already be scoped to whatever matters (e.g. the active location's
 * uncompleted orders). `overrideActive` forces the standard base time regardless of load — the
 * KDS's manual override switch.
 */
export function computeEstimatedWaitTime(activeOrderCount, { now = new Date(), overrideActive = false } = {}) {
  const volumePenalty = Math.max(0, activeOrderCount - VOLUME_BASELINE_ORDERS) * VOLUME_PENALTY_MINUTES;
  const peak = isPeakRush(now);
  const baseMinutes = BASE_WAIT_MINUTES + volumePenalty;
  const algorithmicMinutes = Math.round(peak ? baseMinutes * PEAK_MULTIPLIER : baseMinutes);

  if (overrideActive) {
    return { minutes: BASE_WAIT_MINUTES, baseMinutes: algorithmicMinutes, isPeak: peak, isThrottled: false, overridden: true, activeOrderCount };
  }

  return {
    minutes: algorithmicMinutes,
    baseMinutes: algorithmicMinutes,
    isPeak: peak,
    isThrottled: algorithmicMinutes > BASE_WAIT_MINUTES,
    overridden: false,
    activeOrderCount,
  };
}

/** A rounded "45-55m" style range for the storefront-facing quote, ±15% around the point estimate. */
export function formatWaitRange(minutes) {
  const low = Math.max(5, Math.round((minutes * 0.85) / 5) * 5);
  const high = Math.round((minutes * 1.15) / 5) * 5;
  return low === high ? `${low}m` : `${low}-${high}m`;
}
