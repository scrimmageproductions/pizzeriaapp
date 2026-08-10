import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { CATEGORIES } from "../../data/menuScan";
import { resizeImageFile } from "../../utils/imageProcessing";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import Dropzone from "../shared/Dropzone";
import { FormField, TextInput, TextArea, Select } from "../shared/FormField";

const emptyItem = { name: "", description: "", price: "", category: CATEGORIES[0], photoUrl: "" };

export default function ItemFormModal({ open, onClose, onSave, initialItem }) {
  const [form, setForm] = useState(emptyItem);
  const [photoProcessing, setPhotoProcessing] = useState(false);

  useEffect(() => {
    if (open) setForm(initialItem ? { ...emptyItem, ...initialItem } : emptyItem);
  }, [open, initialItem]);

  const handlePhotoFile = async (file) => {
    setPhotoProcessing(true);
    try {
      const dataUrl = await resizeImageFile(file, 640);
      setForm((f) => ({ ...f, photoUrl: dataUrl }));
    } finally {
      setPhotoProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, price: Number(form.price) || 0 });
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
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField label="🖼️ Upload Photo (Optional)">
          {form.photoUrl ? (
            <div className="relative">
              <img src={form.photoUrl} alt="" className="h-32 w-full rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, photoUrl: "" }))}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <Dropzone
              label={photoProcessing ? "Processing…" : "Upload a photo"}
              hint="Optional — items without a photo use the minimalist card layout"
              onFile={handlePhotoFile}
              icon={ImagePlus}
              accent="#E31837"
            />
          )}
        </FormField>
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-white/10">
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
