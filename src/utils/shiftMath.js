const FEE_PER_DELIVERY = 2.0;

/**
 * Reconciles a driver's shift purely from order history — no separate running counters to keep
 * in sync. Deliveries = orders they completed since clocking in. Card tips are owed TO the
 * driver; cash collected at the door is owed BACK to the store.
 */
export function computeShiftSummary(driver, orders, now = Date.now()) {
  const since = driver.clockInAt || 0;
  const delivered = orders.filter(
    (o) => o.assignedDriverId === driver.id && o.completedAt && o.completedAt >= since && o.completedAt <= now
  );

  const deliveries = delivered.length;
  const mileageFee = +(deliveries * FEE_PER_DELIVERY).toFixed(2);
  const tips = +delivered.reduce((sum, o) => sum + (o.tipAmount || 0), 0).toFixed(2);
  const cashCollected = +delivered.filter((o) => o.paymentMethod === "cash").reduce((sum, o) => sum + o.total, 0).toFixed(2);
  const netPayout = +(mileageFee + tips - cashCollected).toFixed(2);

  return { deliveries, feePerDelivery: FEE_PER_DELIVERY, mileageFee, tips, cashCollected, netPayout, periodStart: since, periodEnd: now };
}
