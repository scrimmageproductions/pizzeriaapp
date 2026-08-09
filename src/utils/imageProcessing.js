/**
 * Loads an image file onto a small canvas, returning both a resized data URL (small enough to
 * live comfortably in localStorage) and a genuinely-computed dominant color sampled from its
 * pixels — this is real client-side color extraction, not a random pick, so a red logo really
 * does produce a red brand color.
 */
export function processLogoFile(file, maxDimension = 160) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const { data } = ctx.getImageData(0, 0, w, h);
        const dominantColor = computeDominantColor(data);
        const dataUrl = canvas.toDataURL("image/png");

        resolve({ dataUrl, dominantColor });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function computeDominantColor(pixels) {
  // Bucket pixels by hue-ish quantized RGB so a handful of dominant tones win over noise,
  // while skipping near-white/near-black/near-gray pixels (usually background, not "the brand").
  const buckets = new Map();

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (a < 128) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(2 * lightness - 255));
    if (lightness > 235 || lightness < 20 || saturation < 0.15) continue;

    const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
    const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  let best = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.count > best.count) best = bucket;
  }

  if (!best) return "#E31837"; // logo was all near-white/black/gray — fall back to the DeepDish red.

  const r = Math.round(best.r / best.count);
  const g = Math.round(best.g / best.count);
  const b = Math.round(best.b / best.count);
  return rgbToHex(r, g, b);
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Prepares a photographed menu for Tesseract: draws it to a canvas, downscales it to a sane OCR
 * resolution, then BINARIZES every pixel to pure black or pure white. A grayscale/contrast blend
 * still leaves midtones that Tesseract misreads on colored menu backgrounds (bright yellow, red,
 * blue) — a hard threshold gives it unambiguous text edges instead. The threshold is set relative
 * to the photo's own average luminance (not a fixed constant) so it adapts to both dim and
 * brightly-lit photos rather than only working on one lighting condition.
 */
export function preprocessImageForOCR(file, maxDimension = 1800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const pixelCount = data.length / 4;

        const luminances = new Float32Array(pixelCount);
        let sum = 0;
        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          const luminance = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          luminances[p] = luminance;
          sum += luminance;
        }

        // Bias below the mean: menu backgrounds are usually the majority pixel and lighter than
        // the printed text, so leaning the cutoff down keeps background tones landing white.
        const threshold = (sum / pixelCount) * 0.82;

        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          const bw = luminances[p] < threshold ? 0 : 255;
          data[i] = bw;
          data[i + 1] = bw;
          data[i + 2] = bw;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
