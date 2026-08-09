import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2, ScanLine } from "lucide-react";
import { formatItemPrice } from "../../utils/helpers";
import { MenuScanError, scanMenuWithVision } from "../../utils/visionScanner";
import Dropzone from "../shared/Dropzone";
import Button from "../shared/Button";
import ScannedMenuReviewModal from "./ScannedMenuReviewModal";

const LOADING_MESSAGES = ["Claude is reading the layout…", "Extracting prices & sizes…", "Categorizing items…", "Finalizing menu…"];

export default function StepMenuScan({ primaryColor, onImport, onNext }) {
  const [phase, setPhase] = useState("idle"); // idle -> scanning -> review -> done
  const [thumbnail, setThumbnail] = useState(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [parsedItems, setParsedItems] = useState([]);
  const [importedItems, setImportedItems] = useState([]);
  const intervalRef = useRef(null);
  const thumbnailUrlRef = useRef(null);

  useEffect(
    () => () => {
      clearInterval(intervalRef.current);
      if (thumbnailUrlRef.current) URL.revokeObjectURL(thumbnailUrlRef.current);
    },
    []
  );

  const runScan = async (file) => {
    setPhase("scanning");
    setError(null);
    setMessageIndex(0);
    if (thumbnailUrlRef.current) URL.revokeObjectURL(thumbnailUrlRef.current);
    thumbnailUrlRef.current = URL.createObjectURL(file);
    setThumbnail(thumbnailUrlRef.current);

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1500);

    try {
      const items = await scanMenuWithVision(file);
      setParsedItems(items);
      setPhase("review");
    } catch (err) {
      console.error("Menu scan failed", err);
      const message = err instanceof MenuScanError ? err.message : "Couldn't read that image. Try a clearer, well-lit photo — or add items manually.";
      setError(message);
      setPhase("idle");
    } finally {
      clearInterval(intervalRef.current);
    }
  };

  const handleImport = (finalizedItems) => {
    onImport(finalizedItems);
    setImportedItems(finalizedItems);
    setPhase("done");
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}55` }}
      >
        <ScanLine size={28} />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-gray-900 sm:text-4xl">Paper to digital</h1>
      <p className="mt-2 text-gray-500">Snap a photo of your paper menu — Claude reads it and builds your digital menu.</p>

      <div className="mt-8 w-full">
        {phase === "idle" && (
          <>
            <Dropzone label="Upload a photo of your menu" hint="Works best with a clear, well-lit photo" onFile={runScan} accent={primaryColor} />
            {error && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-red-500">
                <AlertTriangle size={14} /> {error}
              </p>
            )}
            <button onClick={onNext} className="mt-6 text-sm font-semibold text-gray-400 hover:text-gray-600">
              Skip for now
            </button>
          </>
        )}

        {phase === "scanning" && (
          <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-gray-200 py-10">
            <div className="relative h-40 w-32 overflow-hidden rounded-2xl shadow-lg">
              {thumbnail && <img src={thumbnail} alt="Your menu" className="h-full w-full object-cover" />}
              <div className="absolute inset-0 bg-black/10" />
              <motion.div
                className="absolute inset-x-0 h-10"
                style={{
                  background: `linear-gradient(180deg, transparent, ${primaryColor}bb, transparent)`,
                  boxShadow: `0 0 16px 2px ${primaryColor}99`,
                }}
                animate={{ top: ["-10%", "95%", "-10%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="h-5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm font-semibold text-gray-700"
                >
                  {LOADING_MESSAGES[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        )}

        {phase === "done" && (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-[#00A651]">
              <CheckCircle2 size={16} />
              {importedItems.length} item{importedItems.length === 1 ? "" : "s"} imported into your menu
            </div>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 text-left">
              {importedItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{formatItemPrice(item)}</span>
                </div>
              ))}
            </div>
            <Button size="lg" icon={ArrowRight} className="mt-6 w-full py-3.5" onClick={onNext}>
              Continue
            </Button>
          </>
        )}
      </div>

      <ScannedMenuReviewModal
        open={phase === "review"}
        parsedItems={parsedItems}
        onClose={() => setPhase("idle")}
        onImport={handleImport}
        primaryColor={primaryColor}
      />
    </div>
  );
}
