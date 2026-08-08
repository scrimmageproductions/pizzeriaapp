import { ImageIcon, Palette, Type, Upload } from "lucide-react";
import { useAppActions, useAppState } from "../../context/AppContext";
import Card from "../shared/Card";
import { FormField } from "../shared/FormField";
import { FONT_OPTIONS } from "../../data/mockData";

const SWATCHES = ["#E31837", "#00A651", "#F39C12", "#1D3557", "#6A0DAD", "#0EA5E9", "#111827"];

function ImageUploadBox({ label, hint, value, onChange, aspect = "aspect-video" }) {
  const inputId = `upload-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  };

  return (
    <FormField label={label} hint={hint}>
      <label
        htmlFor={inputId}
        className={`group relative flex ${aspect} w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-[#E31837] hover:bg-red-50/40`}
      >
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-400 group-hover:text-[#E31837]">
            <ImageIcon size={28} />
            <span className="text-xs font-semibold">Click to upload</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow group-hover:text-[#E31837]">
          <Upload size={14} />
        </div>
        <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </FormField>
  );
}

export default function BrandDesignSection() {
  const { config } = useAppState();
  const { updateConfig } = useAppActions();

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Logo & Cover Photo" description="Shown at the top of your storefront." icon={ImageIcon}>
        <div className="grid gap-5 sm:grid-cols-2">
          <ImageUploadBox
            label="Logo"
            hint="Square image recommended, at least 256x256px."
            value={config.logoUrl}
            onChange={(url) => updateConfig({ logoUrl: url })}
            aspect="aspect-square"
          />
          <ImageUploadBox
            label="Storefront Cover Photo"
            hint="Wide banner image, at least 1200x600px."
            value={config.coverUrl}
            onChange={(url) => updateConfig({ coverUrl: url })}
          />
        </div>
      </Card>

      <Card title="Brand Colors" description="Used across buttons, badges, and the tracker." icon={Palette}>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="Primary Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                className="h-11 w-11 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
              />
              <span className="font-mono text-sm text-gray-600">{config.primaryColor}</span>
            </div>
            <div className="mt-2 flex gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => updateConfig({ primaryColor: c })}
                  style={{ backgroundColor: c }}
                  className={`h-6 w-6 rounded-full ring-offset-2 transition ${
                    config.primaryColor === c ? "ring-2 ring-gray-900" : "hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </FormField>

          <FormField label="Secondary Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                className="h-11 w-11 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
              />
              <span className="font-mono text-sm text-gray-600">{config.secondaryColor}</span>
            </div>
            <div className="mt-2 flex gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => updateConfig({ secondaryColor: c })}
                  style={{ backgroundColor: c }}
                  className={`h-6 w-6 rounded-full ring-offset-2 transition ${
                    config.secondaryColor === c ? "ring-2 ring-gray-900" : "hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </FormField>
        </div>
      </Card>

      <Card title="Typography" description="Sets the display font across your storefront." icon={Type}>
        <div className="grid gap-3 sm:grid-cols-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              onClick={() => updateConfig({ font: font.id })}
              className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition ${
                config.font === font.id
                  ? "border-[#E31837] bg-red-50/50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span style={{ fontFamily: font.family }} className="text-2xl text-gray-900">
                Aa
              </span>
              <span className="text-xs font-semibold text-gray-600">{font.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
