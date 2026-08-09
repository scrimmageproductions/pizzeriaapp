import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Car, CheckCircle2, Pizza } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { FONT_OPTIONS } from "../../data/brand";
import { FormField, TextInput } from "../shared/FormField";
import Button from "../shared/Button";
import Toggle from "../shared/Toggle";

export default function CareersPage() {
  const { slug } = useParams();
  const { shop } = useShopState();
  const { addApplicant } = useShopActions();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [hasLicenseInsurance, setHasLicenseInsurance] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!shop || shop.slug !== slug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] text-gray-400">
        <p>There's no pizzeria at deepdish.store/{slug} yet.</p>
      </div>
    );
  }

  const fontFamily = FONT_OPTIONS.find((f) => f.id === shop.font)?.family;
  const canSubmit = name.trim() && phone.trim().length >= 7 && vehicleType.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    addApplicant({ name: name.trim(), phone: phone.trim(), vehicleType: vehicleType.trim(), hasLicenseInsurance });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]" style={{ fontFamily }}>
      <div className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg text-white"
            style={{ backgroundColor: shop.primaryColor }}
          >
            {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <Pizza size={18} />}
          </span>
          <p className="text-sm font-extrabold text-gray-900">{shop.name}</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-10">
        <Link to={`/${slug}`} className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-600">
          <ArrowLeft size={15} /> Back to menu
        </Link>

        {!submitted ? (
          <>
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{ backgroundColor: shop.primaryColor }}
            >
              <Car size={26} />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold text-gray-900">We're Hiring Drivers!</h1>
            <p className="mt-2 text-gray-500">Deliver for {shop.name} directly — flexible hours, keep 100% of your tips.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <FormField label="Full Name">
                <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </FormField>
              <FormField label="Phone Number">
                <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
              </FormField>
              <FormField label="Vehicle Type">
                <TextInput value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} placeholder="e.g. Honda Civic, Scooter" />
              </FormField>
              <Toggle
                checked={hasLicenseInsurance}
                onChange={setHasLicenseInsurance}
                label="I have a valid driver's license and insurance"
              />
              <Button type="submit" size="lg" className="w-full" style={{ backgroundColor: shop.primaryColor }} disabled={!canSubmit}>
                Apply to Drive
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
              <CheckCircle2 size={28} />
            </span>
            <p className="text-lg font-extrabold text-gray-900">Thanks! The owner will text you shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
