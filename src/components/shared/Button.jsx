const variants = {
  primary: "bg-[#E31837] text-white hover:bg-[#c31530] shadow-sm shadow-[#E31837]/20",
  secondary: "bg-[#00A651] text-white hover:bg-[#00913f] shadow-sm shadow-[#00A651]/20",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white",
  ghost: "text-gray-600 hover:bg-gray-100",
  danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}
