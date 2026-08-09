import { useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency, uid } from "../../utils/helpers";
import { computeBillingBreakdown, projectBillingWithExtraLocation } from "../../utils/billing";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, TextInput } from "../shared/FormField";

const BLANK = { name: "", address: "", phone: "", managerPin: "" };

/** Shared by the Billing page and the sidebar's Location Switcher — same flow, same billing math. */
export default function AddLocationModal({ open, onClose }) {
  const { shop } = useShopState();
  const { addLocation, setActiveLocation } = useShopActions();
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (open) setForm(BLANK);
  }, [open]);

  const current = computeBillingBreakdown(shop);
  const projected = projectBillingWithExtraLocation(shop);
  const isValid = form.name.trim() && form.address.trim() && form.phone.trim() && /^\d{4}$/.test(form.managerPin.trim());

  const handleConfirm = () => {
    if (!isValid) return;
    const location = {
      id: uid("loc"),
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      managerPin: form.managerPin.trim(),
    };
    addLocation(location);
    setActiveLocation(location.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Location" maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#E31837]/5 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E31837]/10 text-[#E31837]">
            <MapPin size={16} />
          </span>
          <p className="text-xs font-semibold text-gray-600">
            Every additional active location is <span className="font-extrabold text-gray-900">+{formatCurrency(10)}/mo</span> on top of your DeepDish
            Core plan.
          </p>
        </div>

        <FormField label="Location Name">
          <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Westside Store" />
        </FormField>
        <FormField label="Address">
          <TextInput value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="88 Ocean Ave, Brooklyn, NY 11223" />
        </FormField>
        <FormField label="Phone Number">
          <TextInput value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(555) 402-1188" />
        </FormField>
        <FormField label="Store Manager PIN" hint="4 digits — used to clock this location's manager in at the POS/KDS.">
          <TextInput
            value={form.managerPin}
            onChange={(e) => setForm((f) => ({ ...f, managerPin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
            placeholder="4321"
            inputMode="numeric"
          />
        </FormField>

        <div className="rounded-xl border border-dashed border-gray-200 p-3.5 text-sm">
          <p className="font-semibold text-gray-600">
            Adding this location will update your monthly billing from{" "}
            <span className="font-extrabold text-gray-900">{formatCurrency(current.total)}</span> to{" "}
            <span className="font-extrabold text-[#E31837]">{formatCurrency(projected.projectedTotal)}/mo</span>.
          </p>
        </div>

        <Button size="lg" icon={Plus} className="w-full py-3.5" disabled={!isValid} onClick={handleConfirm}>
          Confirm & Launch Location
        </Button>
      </div>
    </Modal>
  );
}
