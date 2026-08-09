import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Pizza } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { slugify } from "../../utils/helpers";
import ConfettiBurst from "../shared/ConfettiBurst";
import Toast from "../shared/Toast";
import StepClaimShop from "./StepClaimShop";
import StepBranding from "./StepBranding";
import StepMenuScan from "./StepMenuScan";
import StepReveal from "./StepReveal";

const STEPS = ["Claim Shop", "Branding", "Menu", "Launch"];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useShopState();
  const { completeOnboarding, importScannedItems } = useShopActions();

  // The landing page's inline "Generate Store" input hands off the pizzeria name here so step
  // one (Claim Shop) arrives already completed instead of asking the owner to retype it.
  const initialName = location.state?.initialName || "";

  const [stepIndex, setStepIndex] = useState(initialName ? 1 : 0);
  const [name, setName] = useState(initialName);
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#E31837");
  const [toast, setToast] = useState("");
  const [confettiKey, setConfettiKey] = useState(0);
  const [launching, setLaunching] = useState(false);

  const slug = slugify(name);

  const goNext = () => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const handleBrandDetected = ({ logoUrl: url, primaryColor: color }) => {
    setLogoUrl(url);
    setPrimaryColor(color);
    setToast("Brand colors detected!");
    setTimeout(() => setToast(""), 2600);
  };

  const handleImportScanned = (scannedItems) => {
    importScannedItems(scannedItems);
  };

  const handleLaunch = () => {
    setLaunching(true);
    completeOnboarding({ name, slug, logoUrl, primaryColor });
    setConfettiKey((k) => k + 1);

    setTimeout(() => {
      window.open(`/${slug}`, "_blank", "noopener,noreferrer");
      navigate("/admin");
    }, 1600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA]">
      <ConfettiBurst burstKey={confettiKey} />
      <Toast show={!!toast} message={toast} />

      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E31837] text-white">
            <Pizza size={16} />
          </span>
          <span className="text-sm font-extrabold text-gray-900">DeepDish</span>
        </div>

        <div className="flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex ? "w-8 bg-[#E31837]" : i < stepIndex ? "w-4 bg-[#E31837]/40" : "w-4 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="w-16">
          {stepIndex > 0 && stepIndex < STEPS.length - 1 && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {stepIndex === 0 && <StepClaimShop name={name} onNameChange={setName} onNext={goNext} />}
            {stepIndex === 1 && (
              <StepBranding
                logoPreview={logoUrl}
                primaryColor={primaryColor}
                onBrandDetected={handleBrandDetected}
                onNext={goNext}
              />
            )}
            {stepIndex === 2 && (
              <StepMenuScan primaryColor={primaryColor} onImport={handleImportScanned} onNext={goNext} />
            )}
            {stepIndex === 3 && (
              <StepReveal
                name={name}
                slug={slug}
                logoPreview={logoUrl}
                primaryColor={primaryColor}
                itemCount={items.length}
                launching={launching}
                onLaunch={handleLaunch}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
