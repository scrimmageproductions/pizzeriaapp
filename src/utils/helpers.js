export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatClockTime(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Is the shop currently open, given HH:MM open/close strings? */
export function isShopOpen(hours, atDate = new Date()) {
  if (!hours?.open || !hours?.close) return true;
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const nowMinutes = atDate.getHours() * 60 + atDate.getMinutes();
  if (closeMinutes > openMinutes) {
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  }
  return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
}

export function formatHour(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * The automated KDS timing engine. An order is auto-accepted a few seconds after it's placed,
 * then automatically becomes "Ready" once its snapshot prep time elapses — nobody clicks it
 * through stages by hand. Everything (stage, progress, ETA) is derived from timestamps vs "now".
 *
 * Stage 0 — Order Received  (createdAt .. acceptedAt)
 * Stage 1 — Prepping        (acceptedAt .. readyAt)
 * Stage 2 — Ready           (readyAt ..)
 */
export function getOrderTiming(order, now) {
  const acceptedAt = order.createdAt + 3000;
  const readyAt = acceptedAt + order.prepMinutes * 60000;
  const isAccepted = now >= acceptedAt;
  const isReady = now >= readyAt;

  const stageIndex = !isAccepted ? 0 : !isReady ? 1 : 2;
  const prepDurationMs = Math.max(1, readyAt - acceptedAt);
  const prepProgress = clamp((now - acceptedAt) / prepDurationMs, 0, 1);

  return {
    stageIndex,
    isAccepted,
    isReady,
    acceptedAt,
    readyAt,
    prepProgress,
    secondsUntilReady: Math.max(0, (readyAt - now) / 1000),
  };
}

/** Not-yet-completed orders, most urgent (soonest ready) first. */
export function sortOrdersByUrgency(orders, now) {
  return [...orders].sort((a, b) => {
    const ta = getOrderTiming(a, now);
    const tb = getOrderTiming(b, now);
    return ta.readyAt - tb.readyAt;
  });
}

/**
 * A random point within `maxKm` of (lat, lng) — stands in for real geocoding of a delivery
 * address so the dispatch map has a destination pin to drop without calling any mapping API.
 */
export function jitterLatLng(lat, lng, maxKm = 3) {
  const kmPerDegLat = 111;
  const kmPerDegLng = 111 * Math.cos((lat * Math.PI) / 180);
  const dLat = ((Math.random() - 0.5) * 2 * maxKm) / kmPerDegLat;
  const dLng = ((Math.random() - 0.5) * 2 * maxKm) / kmPerDegLng;
  return { lat: lat + dLat, lng: lng + dLng };
}
