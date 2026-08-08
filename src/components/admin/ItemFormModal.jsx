import { useEffect, useState } from "react";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, TextInput, TextArea, Select } from "../shared/FormField";
import Toggle from "../shared/Toggle";

const emptyItem = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: "",
  popular: false,
};

export default function ItemFormModal({ open, onClose, onSave, categories, initialItem }) {
  const [form, setForm] = useState(emptyItem);

  useEffect(() => {
    if (open) {
      setForm(
        initialItem
          ? { ...initialItem }
          : { ...emptyItem, categoryId: categories[0]?.id || "" }
      );
    }
  }, [open, initialItem, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) return;
    onSave({ ...form, price: Number(form.price) || 0 });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initialItem ? "Edit Item" : "Add Menu Item"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Item Name">
          <TextInput
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
        <div className="grid grid-cols-2 gap-4">
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
          <FormField label="Category">
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField label="Image URL">
          <TextInput
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://…"
          />
        </FormField>
        <Toggle
          checked={form.popular}
          onChange={(val) => setForm({ ...form, popular: val })}
          label="Mark as Popular"
          description="Adds a 'Popular' badge on the storefront."
        />
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
