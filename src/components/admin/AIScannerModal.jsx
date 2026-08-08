import { useEffect, useState } from "react";
import { ScanLine, Sparkles, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { TextInput } from "../shared/FormField";

// Simulated OCR extraction result — stands in for a real Tesseract.js parse of a photographed menu.
const MOCK_SCAN_RESULTS = [
  {
    name: "Hawaiian Paradise",
    description: "Ham, pineapple, mozzarella, tomato sauce.",
    price: 17.0,
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Buffalo Wings (10pc)",
    description: "Crispy wings tossed in classic buffalo sauce, ranch on the side.",
    price: 11.5,
    imageUrl:
      "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Greek Salad",
    description: "Cucumber, tomato, red onion, kalamata olives, feta, oregano vinaigrette.",
    price: 9.0,
    imageUrl:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Sprite (2L)",
    description: "Ice cold, family size.",
    price: 3.5,
    imageUrl:
      "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&q=80&auto=format&fit=crop",
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, vanilla gelato.",
    price: 7.5,
    imageUrl:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&q=80&auto=format&fit=crop",
  },
];

const SCAN_STEPS = [
  "Reading document…",
  "Detecting menu sections…",
  "Extracting item names & prices…",
  "Cross-checking with photos…",
];

export default function AIScannerModal({ open, onClose, categoryId, onImport }) {
  const [phase, setPhase] = useState("upload"); // upload -> scanning -> review
  const [stepIndex, setStepIndex] = useState(0);
  const [reviewItems, setReviewItems] = useState([]);

  useEffect(() => {
    if (!open) {
      setPhase("upload");
      setStepIndex(0);
      setReviewItems([]);
    }
  }, [open]);

  const startScan = () => {
    setPhase("scanning");
    setStepIndex(0);
  };

  useEffect(() => {
    if (phase !== "scanning") return;
    if (stepIndex >= SCAN_STEPS.length - 1) {
      const finishTimer = setTimeout(() => {
        setReviewItems(MOCK_SCAN_RESULTS.map((it, i) => ({ ...it, _key: `scan_${i}` })));
        setPhase("review");
      }, 750);
      return () => clearTimeout(finishTimer);
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), 700);
    return () => clearTimeout(timer);
  }, [phase, stepIndex]);

  const updateReviewItem = (key, changes) => {
    setReviewItems((items) => items.map((it) => (it._key === key ? { ...it, ...changes } : it)));
  };

  const removeReviewItem = (key) => {
    setReviewItems((items) => items.filter((it) => it._key !== key));
  };

  const handleImport = () => {
    onImport(
      reviewItems.map(({ _key, ...item }) => ({
        ...item,
        categoryId,
        popular: false,
      }))
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="AI Menu Scanner" maxWidth="max-w-2xl">
      {phase === "upload" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F39C12]/10 text-[#F39C12]">
            <ScanLine size={32} />
          </span>
          <div>
            <h4 className="text-lg font-bold text-gray-900">Import your paper menu instantly</h4>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              Snap a photo or upload a PDF of your existing menu. Our AI scanner reads it and auto-fills
              items — no manual typing required.
            </p>
          </div>
          <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row">
            <Button variant="primary" icon={Sparkles} onClick={startScan}>
              Simulate Menu Scan
            </Button>
          </div>
          <p className="text-xs text-gray-400">Demo mode — this simulates scanning a sample paper menu.</p>
        </div>
      )}

      {phase === "scanning" && (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-[#F39C12]/20" />
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F39C12] text-white">
              <Loader2 size={28} className="animate-spin" />
            </span>
          </div>
          <div className="space-y-2">
            {SCAN_STEPS.map((step, i) => (
              <div
                key={step}
                className={`flex items-center gap-2 text-sm transition ${
                  i <= stepIndex ? "text-gray-800" : "text-gray-300"
                }`}
              >
                {i < stepIndex ? (
                  <CheckCircle2 size={16} className="text-[#00A651]" />
                ) : i === stepIndex ? (
                  <Loader2 size={16} className="animate-spin text-[#F39C12]" />
                ) : (
                  <span className="h-4 w-4 rounded-full border-2 border-gray-200" />
                )}
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "review" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-[#00A651]">
            <CheckCircle2 size={16} />
            Found {reviewItems.length} items — review before importing
          </div>
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {reviewItems.map((item) => (
              <div key={item._key} className="flex gap-3 rounded-xl border border-gray-200 p-3">
                <img src={item.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                <div className="flex-1 space-y-2">
                  <TextInput
                    value={item.name}
                    onChange={(e) => updateReviewItem(item._key, { name: e.target.value })}
                    className="font-semibold"
                  />
                  <TextInput
                    value={item.description}
                    onChange={(e) => updateReviewItem(item._key, { description: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">$</span>
                    <TextInput
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateReviewItem(item._key, { price: Number(e.target.value) })}
                      className="max-w-[100px]"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeReviewItem(item._key)}
                  className="h-fit rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {reviewItems.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No items left to import.</p>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleImport} disabled={reviewItems.length === 0}>
              Import {reviewItems.length} Item{reviewItems.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
