import { motion } from "framer-motion";

/** Stylized, glowing line-art pizza box — shown when the KDS queue is completely empty. */
export default function KdsEmptyState() {
  return (
    <div className="relative flex flex-col items-center justify-center gap-5 py-24 text-center">
      <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-[#E31837]/10 blur-3xl dark:bg-[#E31837]/15" />

      <motion.svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{ opacity: { duration: 0.5 }, y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } }}
        className="relative text-gray-300 dark:text-white/20"
      >
        <rect x="10" y="30" width="76" height="50" rx="6" stroke="currentColor" strokeWidth="2.5" />
        <path d="M10 30 L48 10 L86 30" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M48 10 V30" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="48" cy="55" r="16" stroke="#E31837" strokeWidth="2" opacity="0.6" />
        <circle cx="43" cy="50" r="2" fill="#E31837" opacity="0.6" />
        <circle cx="53" cy="58" r="2" fill="#E31837" opacity="0.6" />
        <circle cx="46" cy="61" r="2" fill="#E31837" opacity="0.6" />
      </motion.svg>

      <div className="relative">
        <p className="text-base font-bold text-gray-500 dark:text-white/70">Kitchen is clear.</p>
        <p className="mt-0.5 text-sm text-gray-400 dark:text-white/40">You are all caught up.</p>
      </div>
    </div>
  );
}
