import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, footer, maxWidth = "max-w-lg" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="glass-surface absolute inset-0 animate-fade-in bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${maxWidth} max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-fade-in dark:border dark:border-white/10 dark:bg-[#161616] dark:shadow-none`}
      >
        <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-gray-100 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#161616]">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-white/10">{footer}</div>}
      </div>
    </div>
  );
}
