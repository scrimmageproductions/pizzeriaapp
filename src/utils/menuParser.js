// Turns raw Tesseract OCR text from a photographed menu into structured items. A heuristic state
// machine — not a one-line-per-item assumption — because real menus are hierarchical (a title and
// description sit above the price line that "closes" them), sometimes cram multiple standalone
// items onto one OCR line (multi-column layouts collapsing together), and sometimes list several
// sizes for a single item on one line. Deliberately does NOT key off "$" — plenty of menus omit
// it — and instead hunts for the decimal price pattern every menu shares (e.g. "15.19").

const PRICE_RE = /\$?\d{1,2}\.\d{2}\b/g;

// Recognized pizza/menu size vocabulary — an empty label (prices sitting back-to-back with no
// text before them) is also treated as a valid size slot, using positional Sm/Med/Lg/XL defaults.
const SIZE_WORDS = new Set([
  "sm", "small", "med", "medium", "lg", "large", "xl", "x-large", "xlarge", "extra large",
  "lj", "jr", "junior", "ind", "individual", "pers", "personal", "reg", "regular",
]);

const DEFAULT_LABELS_BY_POSITION = ["Sm", "Med", "Lg", "XL"];

function isSizeLabel(text) {
  const t = text.trim().toLowerCase().replace(/\.$/, "");
  return t === "" || SIZE_WORDS.has(t);
}

/**
 * Pre-parsing sanitization run on every OCR line before anything else touches it:
 *  - dot-leaders / dash-leaders ("Pizza..........12.99") collapse to a single space
 *  - calorie counts ("(650 cal)", "(120-140 Calories)") are stripped so they're never mistaken
 *    for a price or bleed into an item name
 *  - stray OCR-injected symbols (bullets, carets, backticks, tildes, pipes, asterisks) are dropped
 */
function sanitizeLine(line) {
  return line
    .replace(/[.,\-_]{3,}/g, " ")
    .replace(/\([\d\s-]+cal(?:ories)?\)/gi, "")
    .replace(/[*~^`|•·]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Finds every price on a sanitized line and slices out the text immediately preceding each one. */
function segmentLine(line) {
  const matches = [...line.matchAll(PRICE_RE)];
  const segments = [];
  let cursor = 0;
  for (const m of matches) {
    segments.push({ label: line.slice(cursor, m.index).trim(), price: Number(m[0].replace("$", "")) });
    cursor = m.index + m[0].length;
  }
  return segments;
}

/** Maps price segments to a sizes array, preserving the OCR'd label verbatim (e.g. "LJ" stays "LJ"). */
function sizesFromSegments(segments) {
  return segments.map((seg, i) => ({
    label: seg.label || DEFAULT_LABELS_BY_POSITION[i] || `Size ${i + 1}`,
    price: seg.price,
  }));
}

function splitBuffer(buffer) {
  const clean = buffer.filter(Boolean);
  if (clean.length === 0) return { name: "", description: "" };
  const [name, ...rest] = clean;
  return { name, description: rest.join(" ") };
}

/**
 * Parses raw OCR text into a list of draft menu items:
 *   { name, description, price: number|null, sizes: { label, price }[] }
 *
 * State machine per (sanitized) line:
 *  - No price on the line → buffered as a candidate name/description for the next priced line.
 *  - Exactly one price → closes out the buffered item (or, if nothing was buffered, recovers the
 *    name from the text preceding the price on that same line).
 *  - Multiple prices, and every label preceding them looks like a size word → one item with a
 *    `sizes` array (e.g. "Sm 15.19 Med 20.79 Lg 25.79").
 *  - Multiple prices, but the labels are arbitrary text → a multi-column line that collapsed onto
 *    one OCR line; each price+label pair becomes its own standalone item (e.g. "9 Piece 16.00
 *    14 Piece 25.00" → two separate items).
 */
export function parseMenuText(rawText) {
  const rawLines = (rawText || "").split(/\r?\n/);
  const items = [];
  let buffer = [];

  for (const raw of rawLines) {
    const line = sanitizeLine(raw);
    if (!line) continue;

    const segments = segmentLine(line);

    if (segments.length === 0) {
      buffer.push(line);
      continue;
    }

    const { name: bufferedName, description } = splitBuffer(buffer);
    buffer = [];

    if (segments.length === 1) {
      const name = bufferedName || segments[0].label || "Menu Item";
      items.push({ name, description, price: segments[0].price, sizes: [] });
      continue;
    }

    if (segments.every((s) => isSizeLabel(s.label))) {
      const name = bufferedName || "Menu Item";
      items.push({ name, description, price: null, sizes: sizesFromSegments(segments) });
    } else {
      segments.forEach((seg) => {
        items.push({ name: seg.label || "Menu Item", description, price: seg.price, sizes: [] });
      });
    }
  }

  return items;
}
