import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, ScanLine } from "lucide-react";
import { SCANNED_MENU_ITEMS } from "../../data/menuScan";
import { formatCurrency } from "../../utils/helpers";
import Dropzone from "../shared/Dropzone";
import Button from "../shared/Button";

const SCAN_STEPS = ["Reading your menu…", "Finding items & prices…", "Sorting into categories…"];

export default function StepMenuScan({ primaryColor, onImport, onNext }) {
  const [phase, setPhase] = useState("idle"); // idle -> scanning -> done
  const [stepIndex, setStepIndex] = useState(0);

  const startScan = () => {
    setPhase("scanning");
    setStepIndex(0);
  };

  useEffect(() => {
    if (phase !== "scanning") return;
    if (stepIndex >= SCAN_STEPS.length - 1) {
      const finish = setTimeout(() => {
        onImport(SCANNED_MENU_ITEMS);
        setPhase("done");
      }, 900);
      return () => clearTimeout(finish);
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), 700);
    return () => clearTimeout(timer);
  }, [phase, stepIndex, onImport]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}55` }}
      >
        <ScanLine size={28} />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-gray-900 sm:text-4xl">Paper to digital</h1>
      <p className="mt-2 text-gray-500">Snap a photo of your paper menu — we'll build your digital menu for you.</p>

      <div className="mt-8 w-full">
        {phase === "idle" && (
          <>
            <Dropzone label="Upload a photo of your menu" hint="Any photo works for this demo" onFile={startScan} accent={primaryColor} />
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
              {SCAN_STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 text-sm transition ${i <= stepIndex ? "text-gray-800" : "text-gray-300"}`}
                >
                  {i < stepIndex ? (
                    <CheckCircle2 size={16} className="text-[#00A651]" />
                  ) : i === stepIndex ? (
                    <Loader2 size={16} className="animate-spin" style={{ color: primaryColor }} />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-gray-200" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "done" && (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-[#00A651]">
              <CheckCircle2 size={16} />5 items imported into your menu
            </div>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 text-left">
              {SCANNED_MENU_ITEMS.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {phase === "done" && (
          <Button size="lg" icon={ArrowRight} className="mt-6 w-full py-3.5" onClick={onNext}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
