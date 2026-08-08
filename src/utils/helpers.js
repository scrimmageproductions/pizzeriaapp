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

/** Is the shop currently open, given HH:MM open/close strings? */
export function isShopOpen(hours, atDate = new Date()) {
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const nowMinutes = atDate.getHours() * 60 + atDate.getMinutes();
  if (closeMinutes > openMinutes) {
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  }
  // overnight hours (e.g. open 11:00, close 02:00)
  return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
}

export function formatHour(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Wall-clock time, e.g. "6:42 PM". */
export function formatClockTime(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * The automated timing engine. Every order carries an immutable snapshot of the shop's
 * timing config taken at the moment it was placed (prepBakeSeconds, transitSeconds), plus
 * any accumulated rush-delay seconds and the live dispatch/bump timestamp. Everything else —
 * which stage the order is in, how far along it is, and its ETA — is derived purely from
 * comparing those timestamps to "now". Nobody ever writes a "status" field.
 *
 * Stage 0 — Order Received      (before acceptedAt)
 * Stage 1 — Prepping & Baking   (acceptedAt .. readyAt)
 * Stage 2 — Ready / Out for Delivery (readyAt .. deliveryAt, or until bumped for pickup)
 * Stage 3 — Enjoy!              (delivered, or handed off at pickup)
 */
export function getOrderTiming(order, now) {
  const acceptedAt = order.acceptedAt;
  const readyAt = acceptedAt + (order.prepBakeSeconds + order.delaySeconds) * 1000;
  const bumped = order.dispatchedAt != null;

  const isAccepted = now >= acceptedAt;
  const isReady = now >= readyAt;

  let deliveryAt = null;
  let isDelivered;
  if (order.fulfillment === "delivery") {
    // Once dispatched, the ETA counts from the real hand-off moment; before that it's an estimate.
    deliveryAt = (bumped ? order.dispatchedAt : readyAt) + order.transitSeconds * 1000;
    isDelivered = bumped && now >= deliveryAt;
  } else {
    isDelivered = bumped;
  }

  let stageIndex;
  if (!isAccepted) stageIndex = 0;
  else if (!isReady) stageIndex = 1;
  else if (!isDelivered) stageIndex = 2;
  else stageIndex = 3;

  const prepDurationMs = Math.max(1, readyAt - acceptedAt);
  const prepProgress = clamp((now - acceptedAt) / prepDurationMs, 0, 1);

  let stage2Progress = 0;
  if (order.fulfillment === "delivery") {
    stage2Progress = bumped ? clamp((now - order.dispatchedAt) / Math.max(1, order.transitSeconds * 1000), 0, 1) : 0;
  } else {
    stage2Progress = bumped ? 1 : 0;
  }

  // Continuous 0..3 position used to smoothly fill the customer-facing progress bar.
  let overall;
  if (stageIndex === 0) overall = 0;
  else if (stageIndex === 1) overall = prepProgress;
  else if (stageIndex === 2) overall = 1 + stage2Progress;
  else overall = 3;

  return {
    stageIndex,
    isAccepted,
    isReady,
    isDelivered,
    bumped,
    acceptedAt,
    readyAt,
    deliveryAt,
    prepProgress,
    stage2Progress,
    overall,
    secondsUntilReady: Math.max(0, (readyAt - now) / 1000),
    secondsUntilDelivery: deliveryAt != null ? Math.max(0, (deliveryAt - now) / 1000) : null,
  };
}

/** Active (not-yet-bumped) orders first by urgency: waiting-to-be-boxed orders, then soonest-ready. */
export function sortOrdersByPriority(orders, now) {
  return [...orders].sort((a, b) => {
    const ta = getOrderTiming(a, now);
    const tb = getOrderTiming(b, now);
    if (ta.isReady !== tb.isReady) return ta.isReady ? -1 : 1;
    return ta.readyAt - tb.readyAt;
  });
}

export const STAGE_META = [
  { key: "received", label: "Order Received" },
  { key: "prepping", label: "Prepping & Baking" },
  { key: "ready", label: "Ready" },
  { key: "done", label: "Enjoy!" },
];
