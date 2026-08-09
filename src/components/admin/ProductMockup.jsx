// CSS-only product mockups — no photography needed. Each template is a flat-shaded shape built
// from plain divs; the owner's logo is layered on top with absolute positioning + mix-blend-mode
// so it reads as "printed" on the material rather than pasted over it.

function LogoOverlay({ logoUrl, logoSize, blend = "normal", top = "50%", left = "50%", maxWidth = "60%" }) {
  if (!logoUrl) return null;
  return (
    <img
      src={logoUrl}
      alt=""
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-sm"
      style={{ top, left, width: `${logoSize}%`, maxWidth, mixBlendMode: blend }}
    />
  );
}

function PizzaBoxMockup({ color, logoUrl, logoSize }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: "#D8B382" }}>
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, #00000022 0 2px, transparent 2px 10px)" }}
      />
      <div className="absolute inset-x-0 top-0 h-[14%]" style={{ backgroundColor: "#B98D5D" }} />
      <div className="absolute inset-x-0 bottom-0 h-[14%]" style={{ backgroundColor: "#B98D5D" }} />
      <div className="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-lg border-4" style={{ borderColor: color }} />
      <LogoOverlay logoUrl={logoUrl} logoSize={logoSize} blend="multiply" />
    </div>
  );
}

function PaperBagMockup({ color, logoUrl, logoSize }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: "#C79A63" }}>
      <div
        className="absolute inset-0 opacity-25"
        style={{ backgroundImage: "repeating-linear-gradient(180deg, #00000022 0 1px, transparent 1px 14px)" }}
      />
      <div className="absolute inset-x-0 top-0 h-[20%]" style={{ backgroundColor: "#A87D4B", clipPath: "polygon(0 0, 100% 0, 92% 100%, 8% 100%)" }} />
      <div className="absolute inset-x-[15%] top-[38%] h-[30%] rounded-sm border-2 opacity-70" style={{ borderColor: color }} />
      <LogoOverlay logoUrl={logoUrl} logoSize={logoSize * 0.8} blend="multiply" top="60%" maxWidth="50%" />
    </div>
  );
}

function VisorMockup({ color, logoUrl, logoSize }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100">
      <div
        className="absolute left-1/2 top-[30%] h-[60%] w-[85%] -translate-x-1/2"
        style={{ backgroundColor: color, borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }}
      />
      <div className="absolute left-1/2 top-[22%] h-[10%] w-[70%] -translate-x-1/2 rounded-full bg-white shadow-sm" />
      <LogoOverlay logoUrl={logoUrl} logoSize={logoSize * 0.5} blend="normal" top="27%" maxWidth="30%" />
    </div>
  );
}

function HotBagMockup({ color, logoUrl, logoSize }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100">
      <div className="absolute left-1/2 top-1/2 h-[75%] w-[65%] -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-md" style={{ backgroundColor: color }} />
      <div className="absolute left-1/2 top-[28%] h-[6%] w-[50%] -translate-x-1/2 rounded-full bg-black/15" />
      <div className="absolute left-[20%] top-[15%] h-[14%] w-[8%] rounded-full border-4 border-black/20" />
      <div className="absolute right-[20%] top-[15%] h-[14%] w-[8%] rounded-full border-4 border-black/20" />
      <LogoOverlay logoUrl={logoUrl} logoSize={logoSize} blend="normal" top="58%" />
    </div>
  );
}

const MOCKUPS = {
  "pizza-box": PizzaBoxMockup,
  "paper-bag": PaperBagMockup,
  visor: VisorMockup,
  "hot-bag": HotBagMockup,
};

export default function ProductMockup({ type, logoUrl, color, logoSize = 45, className = "" }) {
  const Mockup = MOCKUPS[type];
  if (!Mockup) return null;
  return (
    <div className={`aspect-square w-full ${className}`}>
      <Mockup color={color} logoUrl={logoUrl} logoSize={logoSize} />
    </div>
  );
}
