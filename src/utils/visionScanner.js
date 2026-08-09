// Frontend half of the Claude Vision menu scanner: compresses the user's photo client-side so the
// base64 payload sent to /api/scan-menu stays well under Vercel's ~4.5MB request body cap, then
// talks to that endpoint and normalizes its response into the flat item shape the review UI
// already expects ({ name, description, category, price, sizes }).

export class MenuScanError extends Error {}

/**
 * Downscales to Claude's own high-res vision ceiling (long edge ~1568px) and re-encodes as JPEG,
 * which is dramatically smaller than the original photo's PNG/HEIC-derived data URL.
 */
export function compressImageForVision(file, maxDimension = 1568, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new MenuScanError("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new MenuScanError("Could not decode that image."));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function flattenCategories(categories) {
  const items = [];
  for (const category of categories || []) {
    const categoryName = (category?.name || "").trim() || "Menu";
    for (const item of category?.items || []) {
      const name = (item?.name || "").trim();
      if (!name) continue;

      const prices = (item?.prices || []).filter((p) => typeof p?.price === "number" && Number.isFinite(p.price));

      items.push({
        name,
        description: item?.description || "",
        category: categoryName,
        price: prices.length === 1 ? prices[0].price : null,
        sizes: prices.length > 1 ? prices.map((p) => ({ label: (p.size || "").trim(), price: p.price })) : [],
      });
    }
  }
  return items;
}

/**
 * Compresses the photo, sends it to the server-side Claude Vision endpoint, and returns a flat
 * array of parsed menu items ready for the editable review grid. Throws MenuScanError with a
 * user-facing message on any failure — network, server, or a malformed/refused response.
 */
export async function scanMenuWithVision(file) {
  const dataUrl = await compressImageForVision(file);

  let res;
  try {
    res = await fetch("/api/scan-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
    });
  } catch {
    throw new MenuScanError("Couldn't reach the scanner. Check your connection and try again.");
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // fall through — payload stays null, handled below
  }

  if (!res.ok) {
    throw new MenuScanError(payload?.error || "Couldn't scan that menu. Try a clearer photo.");
  }
  if (!payload || !Array.isArray(payload.categories)) {
    throw new MenuScanError("The scanner returned something unexpected. Please try again.");
  }

  return flattenCategories(payload.categories);
}
