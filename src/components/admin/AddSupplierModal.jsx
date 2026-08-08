import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, TextInput, Select } from "../shared/FormField";

export default function AddSupplierModal({ open, onClose, onSave, ingredients }) {
  const [name, setName] = useState("");
  const [rows, setRows] = useState([{ ingredientId: ingredients[0]?.id || "", costPerUnit: "" }]);

  const reset = () => {
    setName("");
    setRows([{ ingredientId: ingredients[0]?.id || "", costPerUnit: "" }]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const updateRow = (i, changes) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...changes } : r)));
  const addRow = () => setRows((prev) => [...prev, { ingredientId: ingredients[0]?.id || "", costPerUnit: "" }]);
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const items = rows.filter((r) => r.ingredientId && Number(r.costPerUnit) > 0).map((r) => ({ ingredientId: r.ingredientId, costPerUnit: Number(r.costPerUnit) }));
    if (items.length === 0) return;
    onSave({ name: name.trim(), items });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Supplier">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Supplier Name">
          <TextInput autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Restaurant Depot" />
        </FormField>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-gray-800">Ingredients Supplied</span>
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select value={row.ingredientId} onChange={(e) => updateRow(i, { ingredientId: e.target.value })} className="flex-1">
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}
                  </option>
                ))}
              </Select>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                placeholder="$/unit"
                value={row.costPerUnit}
                onChange={(e) => updateRow(i, { costPerUnit: e.target.value })}
                className="w-24"
              />
              <button type="button" onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addRow} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700">
            <Plus size={14} /> Add another ingredient
          </button>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Supplier
          </Button>
        </div>
      </form>
    </Modal>
  );
}
