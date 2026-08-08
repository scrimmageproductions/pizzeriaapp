import { useState } from "react";
import { ArrowRight, Palette } from "lucide-react";
import { processLogoFile } from "../../utils/imageProcessing";
import Dropzone from "../shared/Dropzone";
import Button from "../shared/Button";

export default function StepBranding({ logoPreview, primaryColor, onBrandDetected, onNext }) {
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file) => {
    setProcessing(true);
    try {
      const { dataUrl, dominantColor } = await processLogoFile(file);
      onBrandDetected({ logoUrl: dataUrl, primaryColor: dominantColor });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F39C12] text-white shadow-lg shadow-[#F39C12]/30">
        <Palette size={28} />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-gray-900 sm:text-4xl">Smart branding</h1>
      <p className="mt-2 text-gray-500">Upload your logo — we'll pull your brand colors automatically.</p>

      <div className="mt-8 w-full">
        <Dropzone
          label={processing ? "Analyzing colors…" : "Upload your logo"}
          hint="PNG or JPG, any size"
          preview={logoPreview}
          onFile={handleFile}
          accent={primaryColor}
        />

        {logoPreview && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <span className="h-6 w-6 rounded-full border border-black/5" style={{ backgroundColor: primaryColor }} />
            <span className="text-sm font-semibold text-gray-700">Primary brand color: {primaryColor}</span>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2">
          <Button size="lg" icon={ArrowRight} className="w-full py-3.5" onClick={onNext} disabled={processing}>
            Continue
          </Button>
          <button onClick={onNext} className="text-sm font-semibold text-gray-400 hover:text-gray-600">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
