// Multi-location SaaS pricing: $99/mo base includes the first location, each additional active
// location is +$10/mo, and the custom-domain add-on is a flat +$10/mo on top of either.
export const BASE_PLAN_PRICE = 99;
export const PER_EXTRA_LOCATION_PRICE = 10;
export const CUSTOM_DOMAIN_PRICE = 10;

export function computeBillingBreakdown(shop) {
  const locationCount = Math.max(1, shop?.locations?.length || 1);
  const extraLocations = locationCount - 1;
  const basePrice = shop?.billing?.planPrice ?? BASE_PLAN_PRICE;
  const extraLocationsCost = extraLocations * PER_EXTRA_LOCATION_PRICE;
  const hasCustomDomain = !!shop?.billing?.hasCustomDomain;
  const domainCost = hasCustomDomain ? CUSTOM_DOMAIN_PRICE : 0;

  return {
    basePrice,
    locationCount,
    extraLocations,
    extraLocationsCost,
    hasCustomDomain,
    domainCost,
    total: basePrice + extraLocationsCost + domainCost,
  };
}

/** What the bill would become with one more active location — used for the "Confirm & Launch" notice. */
export function projectBillingWithExtraLocation(shop) {
  const current = computeBillingBreakdown(shop);
  return { ...current, projectedTotal: current.total + PER_EXTRA_LOCATION_PRICE };
}
