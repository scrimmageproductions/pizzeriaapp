import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Ban, Database, LayoutDashboard, Palette, Pizza, Sparkles } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import Button from "../shared/Button";

const PILLARS = [
  {
    icon: Ban,
    title: "0% Commissions",
    description: "One flat $99/month fee. Every dollar from every order is yours — no 30% cut to a middleman.",
  },
  {
    icon: Palette,
    title: "100% White-Labeled",
    description: "Your logo, your colors, your domain. No \"Powered by\" badge telling customers who really built it.",
  },
  {
    icon: Database,
    title: "You Own the Data",
    description: "Every customer, every order, every phone number — exportable, yours, forever.",
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
          <span className="text-lg font-extrabold text-gray-900">DeepDish</span>
        </div>
        {shop && (
          <Button variant="outline" icon={LayoutDashboard} onClick={() => navigate("/admin")}>
            Dashboard
          </Button>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 text-center sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-[#F39C12]/10 px-3 py-1.5 text-xs font-bold text-[#F39C12]"
        >
          <Sparkles size={13} /> The Anti-Aggregator for Pizzerias
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 sm:text-6xl"
        >
          Keep your <span className="text-[#E31837]">dough.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-lg text-gray-500"
        >
          Stop paying 30% to delivery apps. Your App. Your Customers. <strong className="text-gray-800">0% Commissions.</strong>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <Button
            size="lg"
            icon={ArrowRight}
            className="px-7 py-3.5 text-base"
            onClick={() => navigate(shop ? "/admin" : "/onboarding")}
          >
            {shop ? "Go to Your Dashboard" : "Build My Free Site"}
          </Button>
          <p className="text-sm font-semibold text-gray-400">
            Flat <span className="text-gray-700">$99/month</span>. No commissions. No credit card to start.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-5 sm:grid-cols-3">
          {PILLARS.map((f, i) => {
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-6 overflow-hidden rounded-2xl bg-[#121212] p-6 text-left text-white sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/40">On a $3,000 month</p>
              <p className="mt-2 text-3xl font-extrabold text-white/30 line-through">-$900 to a delivery app</p>
              <p className="mt-1 text-xs text-white/40">at a typical 30% commission</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#F39C12]">With DeepDish</p>
              <p className="mt-2 text-3xl font-extrabold text-white">-$99 flat, period.</p>
              <p className="mt-1 text-xs text-white/50">Same sales. $801 more stays in your kitchen.</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
