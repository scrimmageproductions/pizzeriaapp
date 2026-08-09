import { CreditCard, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";

const BASE_PLAN_PRICE = 99;
const BRAND_ADDON_PRICE = 10;

export default function BillingPage() {
  const { brands } = useShopState();

  const brandAddonTotal = brands.length * BRAND_ADDON_PRICE;
  const total = BASE_PLAN_PRICE + brandAddonTotal;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Billing</h1>
        <p className="text-sm text-gray-500 dark:text-white/40">One flat monthly bill, no commission line item — ever.</p>
      </div>

      <Card title="This Month's Bill" icon={CreditCard}>
        <div className="divide-y divide-gray-100 dark:divide-white/10">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">DeepDish Core Plan</p>
              <p className="text-xs text-gray-500 dark:text-white/40">POS, KDS, online ordering, CRM, and marketing — 0% commission.</p>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(BASE_PLAN_PRICE)}/mo</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Virtual Brands (Ghost Kitchens)</p>
              <p className="text-xs text-gray-500 dark:text-white/40">
                {brands.length} additional brand{brands.length === 1 ? "" : "s"} × {formatCurrency(BRAND_ADDON_PRICE)}/mo
              </p>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(brandAddonTotal)}/mo</span>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-base font-extrabold text-gray-900 dark:text-white">Total Due Monthly</p>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
          </div>
        </div>

        {brands.length === 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
            <Store size={14} className="shrink-0 text-gray-400 dark:text-white/30" />
            Add a virtual brand in{" "}
            <Link to="/admin/brands" className="font-bold text-[#E31837] hover:underline">
              Virtual Brands
            </Link>{" "}
            to run a second storefront out of this kitchen for {formatCurrency(BRAND_ADDON_PRICE)}/mo.
          </div>
        )}
      </Card>
    </div>
  );
}
