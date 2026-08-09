import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Copy, CreditCard, Globe, Loader2, MapPin, Plus, ShieldCheck } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { DEFAULT_BILLING } from "../../data/loyalty";
import { computeBillingBreakdown } from "../../utils/billing";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import { TextInput } from "../shared/FormField";
import AddLocationModal from "./AddLocationModal";

const DNS_RECORDS = [
  { type: "A Record", name: "@", value: "76.76.21.21" },
  { type: "CNAME", name: "www", value: "cname.deepdish.store" },
];

function CopyableValue({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (e.g. insecure context) — no-op, the value is still selectable text
    }
  };
  return (
    <button onClick={copy} className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-gray-800 hover:text-[#E31837]">
      {value}
      {copied ? <CheckCircle2 size={13} className="text-[#00A651]" /> : <Copy size={13} className="text-gray-300" />}
    </button>
  );
}

export default function BillingPage() {
  const { shop } = useShopState();
  const { updateShop } = useShopActions();
  const billing = shop.billing || DEFAULT_BILLING;

  const [domainDraft, setDomainDraft] = useState(billing.customDomainUrl || "");
  const [verifying, setVerifying] = useState(false);
  const [addLocationOpen, setAddLocationOpen] = useState(false);

  const bill = computeBillingBreakdown(shop);

  const startUpgrade = () => updateShop({ billing: { ...billing, hasCustomDomain: true } });

  const saveDomain = (e) => {
    e.preventDefault();
    if (!domainDraft.trim()) return;
    updateShop({ billing: { ...billing, customDomainUrl: domainDraft.trim().replace(/^https?:\/\//, ""), domainVerified: false } });
  };

  const verify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      updateShop({ billing: { ...billing, domainVerified: true } });
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <CreditCard size={22} /> Billing & Domains
        </h1>
        <p className="text-sm text-gray-500">Manage your subscription and connect a custom domain.</p>
      </div>

      <Card title="Subscription Overview" icon={ShieldCheck}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Current Plan</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">{billing.plan}</p>
            <p className="mt-1 text-sm font-semibold text-[#00A651]">0% Commissions, always</p>

            <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-xs font-semibold text-gray-500">
              <div className="flex justify-between">
                <span>DeepDish Core Plan (1st Location Included)</span>
                <span>{formatCurrency(bill.basePrice)}/mo</span>
              </div>
              {bill.extraLocations > 0 && (
                <div className="flex justify-between">
                  <span>Additional Locations ({bill.extraLocations})</span>
                  <span>{formatCurrency(bill.extraLocationsCost)}/mo</span>
                </div>
              )}
              {bill.hasCustomDomain && (
                <div className="flex justify-between">
                  <span>Custom Domain Add-on</span>
                  <span>{formatCurrency(bill.domainCost)}/mo</span>
                </div>
              )}
            </div>

            <p className="mt-3 border-t border-gray-200 pt-3 text-2xl font-black text-gray-900">
              {formatCurrency(bill.total)}
              <span className="text-sm font-semibold text-gray-400">/mo</span>
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Next Billing Date</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">
              {new Date(billing.nextBillingDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-gray-400">Card on File</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold text-gray-700">
              <CreditCard size={15} className="text-gray-400" /> •••• •••• •••• {billing.cardLast4}
            </p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-gray-400">Locations ({bill.locationCount})</p>
            <div className="mt-1.5 space-y-1">
              {(shop.locations || []).map((loc) => (
                <p key={loc.id} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <MapPin size={11} className="shrink-0 text-gray-400" /> {loc.name}
                </p>
              ))}
            </div>
            <Button size="sm" variant="outline" icon={Plus} className="mt-3 w-full" onClick={() => setAddLocationOpen(true)}>
              Add New Location (+{formatCurrency(10)}/mo)
            </Button>
          </div>
        </div>
      </Card>

      {!billing.hasCustomDomain ? (
        <div className="overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-[#E31837]/[0.04] to-[#7C3AED]/[0.04] p-6 shadow-sm ring-2 ring-[#E31837]/15 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E31837]/10 text-[#E31837]">
                <Globe size={20} />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Want to use your own domain?</h3>
                <p className="mt-1 max-w-md text-sm text-gray-600">
                  Upgrade to a custom domain (e.g. joespizza.com) to build your brand and rank higher on Google. Only $10/month.
                </p>
              </div>
            </div>
            <Button size="lg" className="shrink-0" onClick={startUpgrade}>
              Upgrade & Connect Domain
            </Button>
          </div>
        </div>
      ) : (
        <Card title="Custom Domain" description="Point your own domain at your DeepDish storefront." icon={Globe}>
          <form onSubmit={saveDomain} className="flex flex-col gap-2 sm:flex-row">
            <TextInput
              value={domainDraft}
              onChange={(e) => setDomainDraft(e.target.value)}
              placeholder="www.my-pizza-shop.com"
              className="flex-1"
            />
            <Button type="submit">Save</Button>
          </form>

          <AnimatePresence>
            {billing.customDomainUrl && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-5">
                  {!billing.domainVerified ? (
                    <>
                      <p className="mb-2 text-sm font-bold text-gray-800">Add these DNS records at your registrar</p>
                      <p className="mb-3 text-xs text-gray-500">GoDaddy, Namecheap, or wherever {billing.customDomainUrl} is registered.</p>
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full min-w-[420px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-400">
                              <th className="px-4 py-2.5">Type</th>
                              <th className="px-4 py-2.5">Name</th>
                              <th className="px-4 py-2.5">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {DNS_RECORDS.map((r) => (
                              <tr key={r.type} className="border-b border-gray-50 last:border-0">
                                <td className="px-4 py-3 font-semibold text-gray-700">{r.type}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.name}</td>
                                <td className="px-4 py-3">
                                  <CopyableValue value={r.value} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <Button className="mt-4" onClick={verify} disabled={verifying}>
                        {verifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        {verifying ? "Checking DNS records…" : "Verify Connection"}
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-[#00A651]/30 bg-[#00A651]/5 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00A651] text-white">
                        <CheckCircle2 size={20} />
                      </span>
                      <p className="text-sm font-bold text-[#00713a]">
                        ✅ Active! Your storefront is now live at{" "}
                        <a href={`https://${billing.customDomainUrl}`} target="_blank" rel="noopener noreferrer" className="underline">
                          {billing.customDomainUrl}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      <AddLocationModal open={addLocationOpen} onClose={() => setAddLocationOpen(false)} />
    </div>
  );
}
