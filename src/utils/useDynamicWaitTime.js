import { useEffect, useMemo } from "react";
import { useShopActions, useShopState } from "../context/ShopContext";
import { computeEstimatedWaitTime } from "./waitTime";

/**
 * Watches the active (uncompleted) orders for the shop's currently active location and recomputes
 * the storefront-quoted wait time whenever load changes. Publishes the result to global context
 * (`estimatedWaitTime`) so it drives the customer-facing storefront instantly, regardless of
 * which page in the admin actually triggered the recalculation.
 */
export function useDynamicWaitTime() {
  const { shop, orders } = useShopState();
  const { setEstimatedWaitTime } = useShopActions();

  const activeOrderCount = useMemo(() => {
    if (!shop) return 0;
    const locationId = shop.activeLocationId;
    return orders.filter((o) => !o.completedAt && (!o.locationId || o.locationId === locationId)).length;
  }, [orders, shop]);

  const computed = useMemo(
    () => computeEstimatedWaitTime(activeOrderCount, { overrideActive: !!shop?.waitTimeOverrideActive }),
    [activeOrderCount, shop?.waitTimeOverrideActive]
  );

  useEffect(() => {
    setEstimatedWaitTime(computed);
    // Re-evaluate on a timer too — the peak-rush window is time-based, so the throttle should
    // still kick in/out at 5pm and 8pm even if no new order changes the active count.
    const id = setInterval(() => setEstimatedWaitTime(computed), 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed.minutes, computed.isPeak, computed.overridden, setEstimatedWaitTime]);

  return computed;
}
