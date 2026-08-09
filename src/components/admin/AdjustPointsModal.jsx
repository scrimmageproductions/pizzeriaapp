import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, TextInput } from "../shared/FormField";

export default function AdjustPointsModal({ customer, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e, sign) => {
    e.preventDefault();
    const delta = Math.round(Number(amount)) * sign;
    if (!delta) return;
    onSave(customer.id, delta);
    onClose();
  };

  return (
    <Modal open={!!customer} onClose={onClose} title={`Adjust Points — ${customer?.name || ""}`} maxWidth="max-w-sm">
      <form className="space-y-4">
        <p className="text-sm text-gray-500">
          Current balance: <span className="font-bold text-gray-900">{customer?.loyaltyPoints || 0} pts</span>
        </p>
        <FormField label="Points">
          <TextInput
            type="number"
            min="0"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50"
          />
        </FormField>
        <FormField label="Reason (optional)">
          <TextInput value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Customer service apology" />
        </FormField>
        <div className="flex gap-2 border-t border-gray-100 pt-4">
          <Button type="button" variant="danger" icon={Minus} className="flex-1" onClick={(e) => handleSubmit(e, -1)}>
            Remove
          </Button>
          <Button type="button" variant="secondary" icon={Plus} className="flex-1" onClick={(e) => handleSubmit(e, 1)}>
            Add
          </Button>
        </div>
      </form>
    </Modal>
  );
}
