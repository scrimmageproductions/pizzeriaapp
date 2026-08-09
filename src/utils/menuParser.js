// Turns raw Tesseract OCR text from a photographed menu into structured items. Deliberately does
// NOT key off the "$" sign — plenty of real menus omit it — and instead hunts for the decimal
// price pattern every menu shares (e.g. "15.19"), using nearby size abbreviations (Sm/Med/Lg/...)
// to figure out whether a line is a single-price item or a multi-size one.

const PRICE_RE = /\d{1,2}\.\d{2}\b/g;

// Ordered so a longer/more specific alias (e.g. "extra large") is tried before a shorter one
// that could false-positive inside it (e.g. "lg" inside nothing here, but keeps the pattern safe).
const SIZE_ALIASES = [
  { re: /\bx-?large\b|\bextra\s*large\b|\bxl\b/i, label: "XL" },
  { re: /\bsmall\b|\bsm\b/i, label: "Sm" },
  { re: /\bmedium\b|\bmed\b/i, label: "Med" },
  { re: /\blarge\b|\blg\b|\blj\b/i, label: "Lg" },
];

const DEFAULT_LABELS_BY_POSITION = ["Sm", "Med", "Lg", "XL"];

// Decorative leader lines ("....", "- - -") some scanned menus use between name and price.
const DECORATIVE_RE = /^[\s.\-_•·]{3,}$/;

function detectSizeLabel(segment, positionIndex) {
  for (const { re, label } of SIZE_ALIASES) {
    if (re.test(segment)) return label;
  }
  return DEFAULT_LABELS_BY_POSITION[positionIndex] || `Size ${positionIndex + 1}`;
}

function cleanText(str) {
  return str
    .replace(/[.\-_•·]{2,}/g, " ") // strip leader-dot runs wherever they land in a line
    .replace(/\s+/g, " ")
    .trim();
}

/** Given a line and its ordered price matches, map each price to a size label from the text that precedes it. */
function extractSizes(line, priceRegexMatches) {
  const sizes = [];
  let cursor = 0;
  priceRegexMatches.forEach((match, i) => {
    const segment = line.slice(cursor, match.index);
    sizes.push({ label: detectSizeLabel(segment, i), price: Number(match[0]) });
    cursor = match.index + match[0].length;
  });
  return sizes;
}

function splitBuffer(buffer) {
  const clean = buffer.map(cleanText).filter(Boolean);
  if (clean.length === 0) return { name: "", description: "" };
  const [name, ...rest] = clean;
  return { name, description: rest.join(" ") };
}

/**
 * Parses raw OCR text into a list of draft menu items:
 *   { name, description, price: number|null, sizes: { label, price }[] }
 * Lines with no decimal number are buffered as a candidate name/description; the next line that
 * DOES contain decimal number(s) consumes that buffer and becomes an item.
 */
export function parseMenuText(rawText) {
  const lines = (rawText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !DECORATIVE_RE.test(l));

  const items = [];
  let buffer = [];

  for (const line of lines) {
    const matches = [...line.matchAll(PRICE_RE)];

    if (matches.length === 0) {
      buffer.push(line);
      continue;
    }

    const { name: bufferedName, description } = splitBuffer(buffer);
    buffer = [];

    // No name buffered above (name/price sat on the same OCR line) — recover it from the text
    // preceding the first price on this line.
    const inlineName = cleanText(line.slice(0, matches[0].index));
    const name = bufferedName || inlineName || "Menu Item";

    if (matches.length === 1) {
      items.push({ name, description, price: Number(matches[0][0]), sizes: [] });
    } else {
      items.push({ name, description, price: null, sizes: extractSizes(line, matches) });
    }
  }

  return items;
}
