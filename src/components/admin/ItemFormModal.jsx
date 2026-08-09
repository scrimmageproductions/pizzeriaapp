import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CATEGORIES } from "../../data/menuScan";
import { uid } from "../../utils/helpers";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, TextInput, TextArea, Select } from "../shared/FormField";

const emptyForm = { name: "", description: "", price: "", category: CATEGORIES[0], sizes: [] };

function toFormSizes(sizes) {
  return (sizes || []).map((s) => ({ id: uid("row"), label: s.label, price: String(s.price) }));
}

export default function ItemFormModal({ open, onClose, onSave, initialItem }) {
  const [form, setForm] = useState(emptyForm);
  const [multiSize, setMultiSize] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialItem) {
      const hasSizes = initialItem.sizes && initialItem.sizes.length > 0;
      setForm({
        name: initialItem.name || "",
        description: initialItem.description || "",
        price: initialItem.price != null ? String(initialItem.price) : "",
        category: initialItem.category || CATEGORIES[0],
        sizes: hasSizes ? toFormSizes(initialItem.sizes) : [],
      });
      setMultiSize(hasSizes);
    } else {
      setForm(emptyForm);
      setMultiSize(false);
    }
  }, [open, initialItem]);

  const addSizeRow = () => {
    const nextLabel = ["Sm", "Med", "Lg", "XL"][form.sizes.length] || `Size ${form.sizes.length + 1}`;
    setForm({ ...form, sizes: [...form.sizes, { id: uid("row"), label: nextLabel, price: "" }] });
  };
  const updateSizeRow = (id, changes) =>
    setForm({ ...form, sizes: form.sizes.map((s) => (s.id === id ? { ...s, ...changes } : s)) });
  const removeSizeRow = (id) => setForm({ ...form, sizes: form.sizes.filter((s) => s.id !== id) });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const validSizes = multiSize ? form.sizes.filter((s) => s.price !== "" && !Number.isNaN(Number(s.price))) : [];
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: multiSize ? null : Number(form.price) || 0,
      sizes: validSizes.map((s) => ({ label: s.label.trim() || "Size", price: Number(s.price) })),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initialItem ? "Edit Item" : "Add Menu Item"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Item Name">
          <TextInput
            autoFocus
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Classic Margherita"
          />
        </FormField>
        <FormField label="Description">
          <TextArea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short, appetizing description"
          />
        </FormField>

        <FormField label="Category">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>

        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input type="checkbox" checked={multiSize} onChange={(e) => setMultiSize(e.target.checked)} className="h-4 w-4 accent-[#E31837]" />
          This item has multiple sizes (e.g. Sm / Med / Lg)
        </label>

        {!multiSize ? (
          <FormField label="Price ($)">
            <TextInput
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </FormField>
        ) : (
          <div>
            <span className="text-sm font-semibold text-gray-800">Sizes</span>
            <div className="mt-2 space-y-2">
              {form.sizes.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="w-20 shrink-0">
                    <TextInput value={s.label} onChange={(e) => updateSizeRow(s.id, { label: e.target.value })} placeholder="Sm" />
                  </div>
                  <TextInput
                    type="number"
                    step="0.01"
                    min="0"
                    value={s.price}
                    onChange={(e) => updateSizeRow(s.id, { price: e.target.value })}
                    placeholder="0.00"
                    className="flex-1"
                  />
                  <button type="button" onClick={() => removeSizeRow(s.id)} className="shrink-0 text-gray-300 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSizeRow}
              className="mt-2 flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700"
            >
              <Plus size={12} /> Add Size
            </button>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialItem ? "Save Changes" : "Add Item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
