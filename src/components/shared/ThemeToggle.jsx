import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useSound } from "../../utils/useSound";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();
  const { playTick } = useSound();

  const handleToggle = () => {
    playTick();
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`relative flex h-8 w-16 shrink-0 items-center rounded-full border border-gray-200 bg-gray-100 p-1 transition-colors dark:border-white/10 dark:bg-white/10 ${className}`}
    >
      <span className="relative z-10 flex flex-1 items-center justify-center text-gray-400 dark:text-white/30">
        <Sun size={13} />
      </span>
      <span className="relative z-10 flex flex-1 items-center justify-center text-gray-400 dark:text-white/30">
        <Moon size={13} />
      </span>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#E31837] shadow-md dark:bg-[#1a1a1a] dark:text-[#F5B700]"
        style={{ left: isDark ? "calc(100% - 1.75rem)" : "0.25rem" }}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </motion.span>
    </button>
  );
}
