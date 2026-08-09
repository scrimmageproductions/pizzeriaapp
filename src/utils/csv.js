/** Strips dashes, parentheses, dots, and whitespace from a raw phone string before it hits state. */
export function sanitizePhone(raw) {
  return String(raw ?? "").replace(/[-().\s]/g, "");
}

/** Triggers a browser download of a CSV built from a header row + array-of-arrays body. */
export function downloadCsv(filename, headerRow, rows) {
  const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const csv = [headerRow, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const normalizeHeader = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Best-effort auto-mapping from a messy CSV's headers to our target fields, so the mapping
 * modal opens pre-filled ("Phone" / "Cell" / "Contact" all guess onto our `phone` field) and the
 * owner usually just has to confirm rather than map every column by hand.
 */
export function guessColumnMapping(headers, fields) {
  const usedHeaders = new Set();
  const mapping = {};
  fields.forEach((field) => {
    const match = headers.find((h) => {
      if (usedHeaders.has(h)) return false;
      const normalized = normalizeHeader(h);
      return field.synonyms.some((syn) => normalized.includes(syn) || syn.includes(normalized));
    });
    mapping[field.key] = match || "";
    if (match) usedHeaders.add(match);
  });
  return mapping;
}
