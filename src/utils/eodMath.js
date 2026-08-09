const TAX_RATE = 0.08;

/** Reconciles register activity since the last Z-report close (or the start of today, if none yet). */
export function computeEODSummary(orders, sinceTs, now = Date.now()) {
  const todays = orders.filter((o) => o.paidAt && o.paidAt >= sinceTs && o.paidAt <= now);

  const grossSales = +todays.reduce((sum, o) => sum + o.total, 0).toFixed(2);
  const netSales = +(grossSales / (1 + TAX_RATE)).toFixed(2);
  const taxCollected = +(grossSales - netSales).toFixed(2);
  const cashSales = +todays.filter((o) => o.paymentMethod === "cash").reduce((sum, o) => sum + o.total, 0).toFixed(2);
  const creditSales = +(grossSales - cashSales).toFixed(2);

  return { orderCount: todays.length, grossSales, netSales, taxCollected, cashSales, creditSales, periodStart: sinceTs, periodEnd: now };
}

/** Midnight of the current day, in local time — the default start-of-register-day cutoff. */
export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
