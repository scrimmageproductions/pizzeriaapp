import { useEffect, useState } from "react";
import { Plus, ScanText, Tags, Trash2 } from "lucide-react";
import { CATEGORIES } from "../../data/menuScan";
import { uid } from "../../utils/helpers";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, Select, TextArea, TextInput } from "../shared/FormField";

function toDraftItems(parsedItems) {
  return parsedItems.map((item) => ({
    id: uid("draft"),
    name: item.name || "",
    description: item.description || "",
    category: item.category || CATEGORIES[0],
    priceRows:
      item.sizes && item.sizes.length > 0
        ? item.sizes.map((s) => ({ id: uid("row"), label: s.label, price: String(s.price) }))
        : [{ id: uid("row"), label: "", price: item.price != null ? String(item.price) : "" }],
  }));
}

function blankDraftItem() {
  return {
    id: uid("draft"),
    name: "",
    description: "",
    category: CATEGORIES[0],
    priceRows: [{ id: uid("row"), label: "", price: "" }],
  };
}

/** Converts the editable draft shape back to the { price, sizes } menu item model on import. */
function finalizeDraftItems(draftItems) {
  return draftItems
    .filter((d) => d.name.trim())
    .map((d) => {
      const validRows = d.priceRows.filter((r) => r.price !== "" && !Number.isNaN(Number(r.price)));
      const isSingle = validRows.length <= 1;
      return {
        name: d.name.trim(),
        description: d.description.trim(),
        category: d.category,
        price: isSingle ? (validRows[0] ? Number(validRows[0].price) : null) : null,
        sizes: isSingle ? [] : validRows.map((r) => ({ label: r.label.trim() || "Size", price: Number(r.price) })),
      };
    });
}

export default function ScannedMenuReviewModal({ open, parsedItems, onClose, onImport, primaryColor }) {
  const [draftItems, setDraftItems] = useState([]);

  useEffect(() => {
    if (open) setDraftItems(toDraftItems(parsedItems));
  }, [open, parsedItems]);

  const updateItem = (id, changes) => setDraftItems((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  const removeItem = (id) => setDraftItems((prev) => prev.filter((d) => d.id !== id));
  const addItem = () => setDraftItems((prev) => [...prev, blankDraftItem()]);

  const addSizeRow = (item) => {
    const nextLabel = ["Sm", "Med", "Lg", "XL"][item.priceRows.length] || `Size ${item.priceRows.length + 1}`;
    const rows =
      item.priceRows.length === 1 && !item.priceRows[0].label
        ? [{ ...item.priceRows[0], label: "Sm" }, { id: uid("row"), label: "Lg", price: "" }]
        : [...item.priceRows, { id: uid("row"), label: nextLabel, price: "" }];
    updateItem(item.id, { priceRows: rows });
  };

  const removeSizeRow = (item, rowId) => updateItem(item.id, { priceRows: item.priceRows.filter((r) => r.id !== rowId) });

  const updateRow = (item, rowId, changes) =>
    updateItem(item.id, { priceRows: item.priceRows.map((r) => (r.id === rowId ? { ...r, ...changes } : r)) });

  const handleImport = () => {
    const finalized = finalizeDraftItems(draftItems);
    onImport(finalized);
  };

  const importableCount = draftItems.filter((d) => d.name.trim()).length;

  return (
    <Modal open={open} onClose={onClose} title="Review Scanned Items" maxWidth="max-w-3xl">
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-700">
        <ScanText size={15} className="shrink-0" />
        OCR isn't perfect — double-check names, descriptions, and prices below before importing.
      </div>

      <div className="space-y-4">
        {draftItems.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
            No items detected. Add them manually below.
          </p>
        )}

        {draftItems.map((item) => (
          <div key={item.id} className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <FormField label="Name">
                  <TextInput value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} placeholder="Item name" />
                </FormField>
                <FormField label="Category">
                  <Select value={item.category} onChange={(e) => updateItem(item.id, { category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-2 mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500"
                title="Delete this line"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <FormField label="Description" className="mt-3">
              <TextArea
                rows={2}
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                placeholder="Optional description"
              />
            </FormField>

            <div className="mt-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                <Tags size={12} /> Sizes / Prices
              </p>
              <div className="space-y-2">
                {item.priceRows.map((row) => (
                  <div key={row.id} className="flex items-center gap-2">
                    {item.priceRows.length > 1 && (
                      <div className="w-20 shrink-0">
                        <TextInput value={row.label} onChange={(e) => updateRow(item, row.id, { label: e.target.value })} placeholder="Sm" />
                      </div>
                    )}
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                      <TextInput
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.price}
                        onChange={(e) => updateRow(item, row.id, { price: e.target.value })}
                        placeholder="0.00"
                        className="pl-6"
                      />
                    </div>
                    {item.priceRows.length > 1 && (
                      <button onClick={() => removeSizeRow(item, row.id)} className="shrink-0 text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addSizeRow(item)}
                className="mt-2 flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                <Plus size={12} /> Add Size
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-200 py-3 text-sm font-bold text-gray-500 hover:border-gray-300 hover:bg-gray-50"
        >
          <Plus size={14} /> Add Missing Item
        </button>
      </div>

      <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 flex justify-end gap-2 border-t border-gray-100 bg-white px-5 py-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button style={{ backgroundColor: primaryColor }} disabled={importableCount === 0} onClick={handleImport}>
          Import {importableCount} Item{importableCount === 1 ? "" : "s"} to Live Menu
        </Button>
      </div>
    </Modal>
  );
}
