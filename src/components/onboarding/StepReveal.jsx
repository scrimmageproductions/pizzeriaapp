import { Pizza, Rocket, Star } from "lucide-react";
import Button from "../shared/Button";

export default function StepReveal({ name, slug, logoPreview, primaryColor, itemCount, launching, onLaunch }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
      <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">You're all set{name ? `, ${name.split(" ")[0]}` : ""}! 🎉</h1>
      <p className="mt-2 text-gray-500">Your ordering site is ready to go live.</p>

      <div className="mt-8 w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
        <div className="h-20" style={{ backgroundColor: primaryColor }} />
        <div className="-mt-8 flex flex-col items-center px-6 pb-6">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white text-white shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            {logoPreview ? <img src={logoPreview} alt="" className="h-full w-full object-cover" /> : <Pizza size={26} />}
          </div>
          <p className="mt-3 text-lg font-extrabold text-gray-900">{name || "Your Pizzeria"}</p>
          <p className="flex items-center gap-1 text-xs text-gray-400">
            <Star size={11} className="text-[#F39C12]" fill="currentColor" /> New on PizzaPlug
          </p>
          <p className="mt-2 text-xs font-semibold text-gray-400">pizzaplug.com/{slug}</p>
          <p className="mt-3 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
            {itemCount} menu item{itemCount === 1 ? "" : "s"} ready
          </p>
        </div>
      </div>

      <Button
        size="lg"
        icon={Rocket}
        className="mt-8 w-full py-4 text-base"
        style={{ backgroundColor: primaryColor }}
        onClick={onLaunch}
        disabled={launching}
      >
        {launching ? "Launching…" : "Launch My App 🚀"}
      </Button>
    </div>
  );
}
