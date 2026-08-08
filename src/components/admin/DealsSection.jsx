import { useState } from "react";
import { Tag, Plus, Trash2, Percent, DollarSign } from "lucide-react";
import { useAppActions, useAppState } from "../../context/AppContext";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import { FormField, TextInput } from "../shared/FormField";
import Toggle from "../shared/Toggle";

export default function DealsSection() {
  const { coupons } = useAppState();
  const { addCoupon, updateCoupon, deleteCoupon } = useAppActions();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return;
    addCoupon({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
    });
    setForm({ code: "", type: "percent", value: "" });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card
        title="Discount Codes"
        description="Promo codes customers can apply at checkout."
        icon={Tag}
        action={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
            New Coupon
          </Button>
        }
      >
        {coupons.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
            <Tag size={28} />
            <p className="text-sm">No coupons yet. Create your first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      coupon.type === "percent" ? "bg-[#00A651]/10 text-[#00A651]" : "bg-[#F39C12]/10 text-[#F39C12]"
                    }`}
                  >
                    {coupon.type === "percent" ? <Percent size={18} /> : <DollarSign size={18} />}
                  </span>
                  <div>
                    <p className="font-mono text-sm font-extrabold tracking-wide text-gray-900">{coupon.code}</p>
                    <p className="text-xs text-gray-500">
                      {coupon.type === "percent" ? `${coupon.value}% off order` : `$${coupon.value} off order`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <Toggle
                    checked={coupon.active}
                    onChange={(val) => updateCoupon(coupon.id, { active: val })}
                    label={coupon.active ? "Active" : "Paused"}
                  />
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Discount Code">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Promo Code">
            <TextInput
              autoFocus
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SUMMER20"
            />
          </FormField>
          <FormField label="Discount Type">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "percent" })}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-semibold transition ${
                  form.type === "percent" ? "border-[#00A651] bg-[#00A651]/10 text-[#00A651]" : "border-gray-200 text-gray-600"
                }`}
              >
                <Percent size={15} /> Percentage
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "flat" })}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-semibold transition ${
                  form.type === "flat" ? "border-[#F39C12] bg-[#F39C12]/10 text-[#F39C12]" : "border-gray-200 text-gray-600"
                }`}
              >
                <DollarSign size={15} /> Flat Rate
              </button>
            </div>
          </FormField>
          <FormField label={form.type === "percent" ? "Percentage Off (%)" : "Amount Off ($)"}>
            <TextInput
              type="number"
              min="0"
              step={form.type === "percent" ? "1" : "0.01"}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </FormField>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
