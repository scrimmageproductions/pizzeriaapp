import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Printer, X } from "lucide-react";
import { useShopState } from "../../context/ShopContext";

const BANNER_MS = 7000;
const TOAST_MS = 4000;

// Mounted once at the app root so the AI agent's purchase banner and the printer's toast fire
// no matter which page (POS, KDS, Inventory…) the owner happens to be looking at.
export default function AgentEventHost() {
  const { agentActivityLog, printEvents } = useShopState();
  const [banner, setBanner] = useState(null);
  const [printToast, setPrintToast] = useState(null);
  const seenAgentIds = useRef(new Set(agentActivityLog.map((e) => e.id)));
  const seenPrintIds = useRef(new Set(printEvents.map((e) => e.id)));
  const bannerTimer = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    const fresh = agentActivityLog.find((e) => !seenAgentIds.current.has(e.id));
    agentActivityLog.forEach((e) => seenAgentIds.current.add(e.id));
    if (fresh) {
      setBanner(fresh);
      clearTimeout(bannerTimer.current);
      bannerTimer.current = setTimeout(() => setBanner(null), BANNER_MS);
    }
  }, [agentActivityLog]);

  useEffect(() => {
    const fresh = printEvents.find((e) => !seenPrintIds.current.has(e.id));
    printEvents.forEach((e) => seenPrintIds.current.add(e.id));
    if (fresh) {
      setPrintToast(fresh);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setPrintToast(null), TOAST_MS);
    }
  }, [printEvents]);

  return (
    <>
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-0 top-0 z-[200] flex justify-center px-4 pt-3"
          >
            <div className="flex max-w-xl items-start gap-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#E31837] px-4 py-3 text-white shadow-2xl">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Bot size={16} />
              </span>
              <p className="text-sm font-semibold leading-snug">{banner.message}</p>
              <button onClick={() => setBanner(null)} className="ml-1 shrink-0 rounded-full p-1 hover:bg-white/20">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {printToast && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-6 z-[200] flex justify-center px-4"
          >
            <div className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl">
              <Printer size={15} className="text-sky-400" />
              {printToast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
