import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function Toast({ show, message, icon: Icon = CheckCircle2 }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed left-1/2 top-6 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-start gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl"
        >
          <Icon size={16} className="mt-0.5 shrink-0 text-[#00A651]" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
