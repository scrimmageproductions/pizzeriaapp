import { ArrowRight, Link2, Pizza } from "lucide-react";
import { slugify } from "../../utils/helpers";
import Button from "../shared/Button";
import { TextInput } from "../shared/FormField";

export default function StepClaimShop({ name, onNameChange, onNext }) {
  const slug = slugify(name);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E31837] text-white shadow-lg shadow-[#E31837]/30">
        <Pizza size={30} />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-gray-900 sm:text-4xl">Claim your shop</h1>
      <p className="mt-2 text-gray-500">What's your pizzeria called? This is the name customers will see.</p>

      <form
        className="mt-8 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          if (slug) onNext();
        }}
      >
        <TextInput
          autoFocus
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Luigi's Pizza"
          className="!h-14 !text-center !text-xl !font-bold"
        />

        <div
          className={`mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-medium transition ${
            slug ? "border-[#00A651]/40 bg-[#00A651]/5 text-[#00913f]" : "border-gray-200 text-gray-300"
          }`}
        >
          <Link2 size={15} />
          <span>
            pizzaplug.com/<strong>{slug || "your-shop-name"}</strong>
          </span>
        </div>

        <Button type="submit" size="lg" icon={ArrowRight} className="mt-8 w-full py-3.5" disabled={!slug}>
          Continue
        </Button>
      </form>
    </div>
  );
}
