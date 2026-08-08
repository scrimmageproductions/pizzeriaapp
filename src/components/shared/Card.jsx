export default function Card({ title, description, icon: Icon, action, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E31837]/10 text-[#E31837]">
                <Icon size={20} />
              </span>
            )}
            <div>
              {title && <h3 className="text-base font-bold text-gray-900">{title}</h3>}
              {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
