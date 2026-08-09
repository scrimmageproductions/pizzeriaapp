import { useState } from "react";
import { createWorker, PSM } from "tesseract.js";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, ScanLine } from "lucide-react";
import { formatItemPrice } from "../../utils/helpers";
import { preprocessImageForOCR } from "../../utils/imageProcessing";
import { parseMenuText } from "../../utils/menuParser";
import Dropzone from "../shared/Dropzone";
import Button from "../shared/Button";
import ScannedMenuReviewModal from "./ScannedMenuReviewModal";

const SCAN_STAGES = ["Preprocessing image…", "Reading your menu (OCR)…", "Finding items & prices…"];

export default function StepMenuScan({ primaryColor, onImport, onNext }) {
  const [phase, setPhase] = useState("idle"); // idle -> scanning -> review -> done
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [parsedItems, setParsedItems] = useState([]);
  const [importedItems, setImportedItems] = useState([]);

  const runScan = async (file) => {
    setPhase("scanning");
    setError(null);
    setStageIndex(0);
    setProgress(0);

    let worker;
    try {
      const dataUrl = await preprocessImageForOCR(file);
      setStageIndex(1);

      worker = await createWorker("eng", 1, {
        // Self-hosted rather than the default jsdelivr CDN — keeps the scanner from depending on
        // a third-party CDN's uptime and avoids CSP/network issues in locked-down environments.
        workerPath: "/tesseract/worker.min.js",
        workerBlobURL: false, // needed so the worker's own location resolves the co-located .wasm file correctly
        corePath: "/tesseract/tesseract-core-lstm.js",
        langPath: "/tesseract-lang",
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(m.progress);
        },
      });
      // Sparse text mode — Tesseract's default page-segmentation assumes one uniform block of
      // prose and blindly reads across multi-column menu layouts as if they were a single
      // sentence. SPARSE_TEXT instead finds text fragments wherever they sit on the page.
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
      const {
        data: { text },
      } = await worker.recognize(dataUrl);

      setStageIndex(2);
      const parsed = parseMenuText(text);
      setParsedItems(parsed);
      setPhase("review");
    } catch (err) {
      console.error("Menu scan failed", err);
      setError("Couldn't read that image. Try a clearer, well-lit photo — or add items manually.");
      setPhase("idle");
    } finally {
      if (worker) await worker.terminate();
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
      <p className="mt-2 text-gray-500">Snap a photo of your paper menu — our OCR engine reads it and builds your digital menu.</p>

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
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-2xl" style={{ backgroundColor: `${primaryColor}30` }} />
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Loader2 size={24} className="animate-spin" />
              </span>
            </div>
            <div className="space-y-2">
              {SCAN_STAGES.map((step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 text-sm transition ${i <= stageIndex ? "text-gray-800" : "text-gray-300"}`}
                >
                  {i < stageIndex ? (
                    <CheckCircle2 size={16} className="text-[#00A651]" />
                  ) : i === stageIndex ? (
                    <Loader2 size={16} className="animate-spin" style={{ color: primaryColor }} />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-gray-200" />
                  )}
                  {step}
                  {i === 1 && i === stageIndex && progress > 0 && (
                    <span className="text-xs text-gray-400">{Math.round(progress * 100)}%</span>
                  )}
                </div>
              ))}
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
