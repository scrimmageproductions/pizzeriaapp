import { useRef, useState } from "react";
import { Camera, RotateCcw } from "lucide-react";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { formatCurrency } from "../../utils/helpers";

export default function PaperTicketModal({ open, onClose, onCreate, primaryColor }) {
  const inputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [total, setTotal] = useState("");

  const reset = () => {
    setImageUrl(null);
    setTotal("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const totalNum = Number(total) || 0;

  const confirm = () => {
    if (!imageUrl || totalNum <= 0) return;
    onCreate(imageUrl, totalNum);
    reset();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Snap Paper Ticket" maxWidth="max-w-sm">
      <div className="space-y-4">
        {!imageUrl ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center transition hover:border-gray-400 hover:bg-gray-50"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${primaryColor}1a`, color: primaryColor }}>
              <Camera size={26} />
            </span>
            <span className="text-sm font-bold text-gray-800">Tap to open camera</span>
            <span className="px-6 text-xs text-gray-500">Photograph the handwritten order so the kitchen can read it on the KDS.</span>
          </button>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200">
              <img src={imageUrl} alt="Handwritten ticket" className="max-h-72 w-full object-cover" />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-black/80"
              >
                <RotateCcw size={12} /> Retake
              </button>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-800">Total Price</span>
              <input
                type="number"
                autoFocus
                min="0"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-2xl font-bold outline-none focus:border-[#E31837] focus:ring-2 focus:ring-[#E31837]/20"
              />
            </label>

            <Button className="w-full py-3" style={{ backgroundColor: primaryColor }} disabled={totalNum <= 0} onClick={confirm}>
              Send to Kitchen — {formatCurrency(totalNum)}
            </Button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </Modal>
  );
}
