import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, LayoutDashboard, Pizza, ScanLine, Smartphone, Sparkles } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import Button from "../shared/Button";

const FEATURES = [
  {
    icon: ScanLine,
    title: "Snap your paper menu",
    description: "Upload a photo of your existing menu and we auto-build your digital one in seconds.",
  },
  {
    icon: Smartphone,
    title: "Your own ordering site",
    description: "A branded, mobile-first storefront at your own link — no tech skills required.",
  },
  {
    icon: Clock,
    title: "Orders that run themselves",
    description: "A live kitchen display with automatic prep timers — no manual status clicks.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { shop } = useShopState();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E31837] text-white">
            <Pizza size={18} />
          </span>
          <span className="text-lg font-extrabold text-gray-900">PizzaPlug</span>
        </div>
        {shop && (
          <Button variant="outline" icon={LayoutDashboard} onClick={() => navigate("/admin")}>
            Dashboard
          </Button>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 text-center sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-[#F39C12]/10 px-3 py-1.5 text-xs font-bold text-[#F39C12]"
        >
          <Sparkles size={13} /> Live in under 2 minutes — no credit card
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 sm:text-6xl"
        >
          Your pizzeria's own
          <br />
          <span className="text-[#E31837]">online ordering site.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-lg text-gray-500"
        >
          Snap a photo of your paper menu, upload your logo, and PizzaPlug builds a fully
          branded ordering website and kitchen dashboard — instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex justify-center"
        >
          <Button
            size="lg"
            icon={ArrowRight}
            className="px-7 py-3.5 text-base"
            onClick={() => navigate(shop ? "/admin" : "/onboarding")}
          >
            {shop ? "Go to Your Dashboard" : "Build My Free Site"}
          </Button>
        </motion.div>

        <div className="mt-20 grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E31837]/10 text-[#E31837]">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-sm font-bold text-gray-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
