export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

export function minutesBetween(fromMs, toMs) {
  return (toMs - fromMs) / 60000;
}

/** Countdown (in whole seconds, floored at 0) until an order's cook time elapses. */
export function secondsRemaining(order, nowMs) {
  const readyAt = order.createdAt + order.prepTimeMinutes * 60000;
  return Math.max(0, Math.round((readyAt - nowMs) / 1000));
}

export function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
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

/** Estimated completion time for an order, honoring fulfillment type + live status. */
export function estimateCompletion(order) {
  const prepMs = order.prepTimeMinutes * 60000;
  const transitMs = order.fulfillment === "delivery" ? order.deliveryTransitMinutes * 60000 : 0;

  if (order.status === "completed") return null;

  if (order.status === "ready") {
    // Kitchen is done; only transit (if delivery) remains from now.
    return order.fulfillment === "delivery" ? Date.now() + transitMs : Date.now();
  }

  return order.createdAt + prepMs + transitMs;
}

export const STATUS_STEP_INDEX = {
  received: 0,
  cooking: 1,
  ready: 2,
  completed: 3,
};
