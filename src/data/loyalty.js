// Defaults for the loyalty program & billing/domain state — factored out so both the reducer
// (which sets these on a freshly onboarded shop) and older persisted shops without them yet can
// fall back to the same sane values.
export const DEFAULT_LOYALTY = {
  pointsPerDollar: 1,
  redemptionCatalog: [
    { id: "reward_knots", name: "Free Garlic Knots", pointsCost: 100, freeItemName: "Garlic Knots (6)" },
    { id: "reward_pizza", name: "Free Large Pizza", pointsCost: 500, freeItemName: "Large Pizza" },
  ],
};

export const DEFAULT_BILLING = {
  plan: "DeepDish Core",
  planPrice: 99,
  nextBillingDate: Date.now() + 30 * 86400000,
  cardLast4: "4242",
  hasCustomDomain: false,
  customDomainUrl: null,
  domainVerified: false,
};

export const DEFAULT_RECOVERED_SALES = 320;
