import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, Select } from "../shared/FormField";

const UNMAPPED = "";

// Parent should remount this (e.g. key={uploadId}) whenever a new file is dropped, so
// `initialMapping` re-seeds local state instead of carrying over the previous file's mapping.
export default function ColumnMappingModal({ open, onClose, headers, fields, initialMapping, rowCount, onConfirm }) {
  const [mapping, setMapping] = useState(initialMapping);

  const setField = (key, header) => setMapping((prev) => ({ ...prev, [key]: header }));

  const missingRequired = fields.filter((f) => f.required && !mapping[f.key]);
  const canConfirm = missingRequired.length === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Map Your Columns"
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!canConfirm} onClick={() => onConfirm(mapping)}>
            Import {rowCount} Rows
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-gray-500">
        We matched what we could. Confirm — or fix — which of your spreadsheet's columns map to each DeepDish field.
      </p>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <FormField label={`${field.label}${field.required ? " *" : ""}`} className="flex-1">
              <p className="text-xs text-gray-400">DeepDish field</p>
            </FormField>
            <ArrowRight size={16} className="mt-4 shrink-0 text-gray-300" />
            <FormField label="Your CSV column" className="flex-1">
              <Select value={mapping[field.key] ?? UNMAPPED} onChange={(e) => setField(field.key, e.target.value)}>
                <option value={UNMAPPED}>— Not mapped —</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        ))}
      </div>
      {!canConfirm && (
        <p className="mt-3 text-xs font-semibold text-red-500">
          Map {missingRequired.map((f) => f.label).join(", ")} to continue.
        </p>
      )}
    </Modal>
  );
}
