import { useState } from "react";
import { Crown, DollarSign, Plus, Sparkles, Users } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import Toggle from "../shared/Toggle";
import { FormField, TextInput } from "../shared/FormField";

function CreatePlanModal({ open, onClose }) {
  const { setSubscriptionPlan } = useShopActions();
  const [name, setName] = useState("VIP Club");
  const [monthlyPrice, setMonthlyPrice] = useState("59.99");
  const [rewardEnabled, setRewardEnabled] = useState(true);
  const [reward, setReward] = useState("1 Free Large Pizza per week");

  const price = Number(monthlyPrice) || 0;
  const canCreate = name.trim() && price > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    setSubscriptionPlan({ name: name.trim(), monthlyPrice: price, reward: rewardEnabled ? reward.trim() : "" });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Subscription Plan"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!canCreate} onClick={handleCreate}>
            Launch Plan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Plan Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="VIP Club" />
        </FormField>
        <FormField label="Monthly Price">
          <TextInput type="number" min="0" step="0.01" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} placeholder="59.99" />
        </FormField>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
          <Toggle checked={rewardEnabled} onChange={setRewardEnabled} label="Include a weekly reward" description="Shown to customers on the storefront upsell." />
          {rewardEnabled && (
            <TextInput
              className="mt-3"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="1 Free Large Pizza per week"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function SubscriptionsPage() {
  const { customers, subscriptionPlan } = useShopState();
  const [modalOpen, setModalOpen] = useState(false);

  const subscribers = customers.filter((c) => c.isSubscriber);
  const mrr = subscriptionPlan ? subscribers.length * subscriptionPlan.monthlyPrice : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Subscription Engine</h1>
        <p className="text-sm text-gray-500 dark:text-white/40">Give your regulars a reason to pay you monthly, not just per order.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F39C12]/10 text-[#F39C12]">
              <Users size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{subscribers.length}</p>
              <p className="text-xs text-gray-500 dark:text-white/40">Active Subscribers</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A651]/10 text-[#00A651]">
              <DollarSign size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(mrr)}</p>
              <p className="text-xs text-gray-500 dark:text-white/40">Total MRR</p>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Your Plan"
        description={subscriptionPlan ? "Live on your storefront right now." : "Launch a plan to start earning recurring revenue."}
        icon={Sparkles}
        action={
          <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
            {subscriptionPlan ? "Replace Plan" : "Create Subscription Plan"}
          </Button>
        }
      >
        {subscriptionPlan ? (
          <div className="overflow-hidden rounded-2xl bg-[#121212] p-6 text-white">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-[#F5B700]" />
              <p className="text-lg font-extrabold">{subscriptionPlan.name}</p>
            </div>
            <p className="mt-2 text-3xl font-extrabold">{formatCurrency(subscriptionPlan.monthlyPrice)}/mo</p>
            {subscriptionPlan.reward && <p className="mt-1 text-sm text-white/60">Includes: {subscriptionPlan.reward}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400 dark:text-white/30">
            <Sparkles size={28} />
            <p className="text-sm">No subscription plan yet.</p>
          </div>
        )}
      </Card>

      <Card title="Active Subscribers" description="Recognized instantly at the POS and on the KDS with a gold crown.">
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400 dark:text-white/30">
            <Crown size={28} />
            <p className="text-sm">No VIP subscribers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400 dark:border-white/10 dark:text-white/30">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 text-right">Lifetime Value</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 dark:border-white/5">
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">
                      <span className="flex items-center gap-1.5">
                        <Crown size={13} className="text-[#F5B700]" /> {c.name}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-white/60">{c.phone}</td>
                    <td className="py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(c.lifetimeValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreatePlanModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
