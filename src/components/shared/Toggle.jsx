export default function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <label
      className={`flex items-center justify-between gap-4 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-semibold text-gray-800">{label}</span>}
          {description && <span className="text-xs text-gray-500">{description}</span>}
        </span>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-[#00A651]" : "bg-gray-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
