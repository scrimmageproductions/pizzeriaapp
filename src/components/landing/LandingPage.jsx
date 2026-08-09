import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Pizza } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import Button from "../shared/Button";

const TRUST_ITEMS = ["🍕 Built for Pizza", "📱 Zero Hardware Needed", "💵 0% Order Commissions", "⚡ Setup in 40 Seconds"];

function KdsMockup() {
  return (
    <div className="w-72 rounded-[2rem] border-[10px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl sm:w-96">
      <div className="rounded-[1.25rem] bg-white p-3">
        <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E31837] text-white">
            <Pizza size={11} />
          </span>
          <span className="text-[11px] font-extrabold text-gray-800">Order KDS</span>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00A651]" />
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {[
            { label: "Received", accent: "bg-gray-300", cards: 1 },
            { label: "Prepping", accent: "bg-[#F39C12]", cards: 2 },
            { label: "Ready", accent: "bg-[#00A651]", cards: 1 },
          ].map((col) => (
            <div key={col.label} className="rounded-lg bg-gray-50 p-1.5">
              <p className="text-[8px] font-bold uppercase tracking-wide text-gray-400">{col.label}</p>
              <div className="mt-1.5 space-y-1.5">
                {Array.from({ length: col.cards }).map((_, i) => (
                  <div key={i} className="rounded-md border border-gray-100 bg-white p-1.5 shadow-sm">
                    <div className={`h-1 w-6 rounded-full ${col.accent}`} />
                    <div className="mt-1.5 h-1 w-full rounded-full bg-gray-100" />
                    <div className="mt-1 h-1 w-2/3 rounded-full bg-gray-100" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StorefrontMockup() {
  return (
    <div className="w-44 rounded-[2.25rem] border-[8px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-white pb-3 pt-5">
        <div className="absolute left-1/2 top-1.5 h-1.5 w-10 -translate-x-1/2 rounded-full bg-[#1a1a1a]" />
        <div className="flex items-center gap-1.5 px-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E31837] text-white">
            <Pizza size={10} />
          </span>
          <span className="text-[9px] font-extrabold text-gray-800">Joe's Pizza</span>
        </div>
        <div className="mt-3 space-y-1.5 px-3">
          {[
            { color: "bg-[#E31837]/15", w: "w-full" },
            { color: "bg-[#F39C12]/15", w: "w-full" },
            { color: "bg-[#0EA5E9]/15", w: "w-full" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-lg border border-gray-100 p-1">
              <div className={`h-5 w-5 shrink-0 rounded-md ${row.color}`} />
              <div className="flex-1 space-y-1">
                <div className="h-1 w-3/4 rounded-full bg-gray-200" />
                <div className="h-1 w-1/3 rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="mx-3 mt-3 rounded-full bg-[#E31837] py-1.5 text-center text-[8px] font-extrabold text-white">
          Checkout — 0% Fees
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { shop } = useShopState();
  const [pizzeriaName, setPizzeriaName] = useState("");

  const handleGenerate = (e) => {
    e.preventDefault();
    const trimmed = pizzeriaName.trim();
    if (!trimmed) return;
    navigate("/onboarding", { state: { initialName: trimmed } });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E31837] text-white">
            <Pizza size={18} />
          </span>
          <span className="text-lg font-extrabold text-gray-900">DeepDish</span>
        </div>
        {shop && (
          <Button variant="outline" icon={LayoutDashboard} onClick={() => navigate("/admin")}>
            Dashboard
          </Button>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-6 text-center sm:pt-10">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold leading-tight text-gray-900 sm:text-6xl"
        >
          Keep your <span className="text-[#E31837]">dough.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mx-auto mt-5 max-w-xl text-lg text-gray-500"
        >
          The zero-hardware, 0% commission operating system for modern pizzerias.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 flex flex-col items-center"
        >
          {shop ? (
            <Button size="lg" className="px-7 py-3.5 text-base" onClick={() => navigate("/admin")}>
              Go to Your Dashboard
            </Button>
          ) : (
            <>
              <form
                onSubmit={handleGenerate}
                className="flex w-full max-w-lg flex-col gap-2 rounded-3xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-200/60 sm:flex-row sm:items-center sm:gap-1.5 sm:rounded-full sm:p-1.5 sm:pl-6"
              >
                <input
                  value={pizzeriaName}
                  onChange={(e) => setPizzeriaName(e.target.value)}
                  placeholder="Enter your pizzeria's name..."
                  className="min-w-0 flex-1 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 sm:text-base"
                />
                <button
                  type="submit"
                  disabled={!pizzeriaName.trim()}
                  className="shrink-0 whitespace-nowrap rounded-full bg-[#E31837] px-5 py-3 text-sm font-bold text-white shadow-sm shadow-[#E31837]/30 transition hover:bg-[#c31530] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Generate Store ✨
                </button>
              </form>
              <p className="mt-4 text-xs text-gray-400">Flat $99/mo. No credit card required to start.</p>
            </>
          )}
        </motion.div>

        <div className="relative mt-16 flex items-center justify-center sm:mt-20">
          <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#E31837]/10 blur-3xl sm:h-96 sm:w-96" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <KdsMockup />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24, rotate: 6 }}
              animate={{ opacity: 1, x: 0, rotate: -6 }}
              transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
              className="absolute -bottom-8 -right-10 sm:-bottom-10 sm:-right-14"
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>
                <StorefrontMockup />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-semibold text-gray-400 sm:mt-14"
        >
          {TRUST_ITEMS.map((item, i) => (
            <span key={item} className="flex items-center gap-3">
              {i > 0 && <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />}
              <span>{item}</span>
            </span>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
