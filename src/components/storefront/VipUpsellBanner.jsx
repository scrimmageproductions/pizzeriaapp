import { useState } from "react";
import { CheckCircle2, Crown, Loader2 } from "lucide-react";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, TextInput } from "../shared/FormField";

export default function VipUpsellBanner({ shop, plan, onSubscribe }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  if (!plan) return null;

  const canSubmit = name.trim() && phone.trim().length >= 7;

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setName("");
      setPhone("");
      setDone(false);
    }, 250);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setProcessing(true);
    setTimeout(() => {
      onSubscribe({ name: name.trim(), phone: phone.trim() });
      setProcessing(false);
      setDone(true);
    }, 1200); // mock Stripe checkout round-trip
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mx-auto mt-4 flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left shadow-md transition hover:brightness-105"
        style={{ backgroundColor: shop.primaryColor }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-[#F5B700]">
            <Crown size={20} />
          </span>
          <p className="text-sm font-bold leading-snug text-white sm:text-base">
            Join the {shop.name} VIP Club! Get {plan.reward || "member perks"} for just ${plan.monthlyPrice.toFixed(2)}/mo.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white sm:block">Join Now</span>
      </button>

      <Modal open={open} onClose={handleClose} title={done ? "Welcome to the Club!" : `Join the ${plan.name}`} maxWidth="max-w-sm">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
              <CheckCircle2 size={32} />
            </span>
            <p className="text-lg font-extrabold text-gray-900">You're in, {name.trim().split(" ")[0]}!</p>
            <p className="text-sm text-gray-500">
              {plan.reward ? `Your first ${plan.reward.toLowerCase()} is waiting.` : "Your VIP perks are active."}
            </p>
            <Button className="mt-2 w-full" style={{ backgroundColor: shop.primaryColor }} onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-2xl font-extrabold text-gray-900">${plan.monthlyPrice.toFixed(2)}/mo</p>
              {plan.reward && <p className="text-xs text-gray-500">Includes: {plan.reward}</p>}
            </div>
            <FormField label="Your Name">
              <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </FormField>
            <FormField label="Phone Number">
              <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
            </FormField>
            <Button type="submit" size="lg" className="w-full" style={{ backgroundColor: shop.primaryColor }} disabled={!canSubmit || processing}>
              {processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Processing…
                </span>
              ) : (
                "Subscribe with Stripe"
              )}
            </Button>
            <p className="text-center text-[11px] text-gray-400">Mock checkout — no card charged.</p>
          </form>
        )}
      </Modal>
    </>
  );
}
