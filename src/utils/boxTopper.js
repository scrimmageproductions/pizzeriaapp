/** The conversion coupon printed on a secondary "box topper" ticket for third-party orders. */
export function shopDirectLink(shop) {
  return shop.billing?.domainVerified && shop.billing?.customDomainUrl ? shop.billing.customDomainUrl : `deepdish.store/${shop.slug}`;
}

export function buildBoxTopperMessage(shop) {
  return `Stop paying delivery app fees! Order your next pizza directly from us at ${shopDirectLink(shop)} and use code DIRECT15 for 15% off your entire order.`;
}
