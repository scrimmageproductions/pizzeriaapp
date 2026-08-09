import { useState } from "react";
import { ChefHat, Link2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { COLOR_SWATCHES } from "../../data/brand";
import { processLogoFile } from "../../utils/imageProcessing";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import Dropzone from "../shared/Dropzone";
import { FormField, TextInput } from "../shared/FormField";

function BrandCard({ name, slug, logoUrl, primaryColor, badge, onDelete }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#151515]">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : <ChefHat size={20} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{name}</p>
          {badge}
        </div>
        <p className="flex items-center gap-1 truncate text-xs text-gray-500 dark:text-white/40">
          <Link2 size={11} /> deepdish.store/{slug}
        </p>
      </div>
      {onDelete && (
        <button onClick={onDelete} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:text-white/30 dark:hover:bg-red-500/10 dark:hover:text-red-400">
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

function AddBrandModal({ open, onClose }) {
  const { addBrand } = useShopActions();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#E31837");
  const [processing, setProcessing] = useState(false);

  const reset = () => {
    setName("");
    setLogoUrl("");
    setPrimaryColor("#E31837");
  };

  const handleFile = async (file) => {
    setProcessing(true);
    try {
      const { dataUrl, dominantColor } = await processLogoFile(file);
      setLogoUrl(dataUrl);
      setPrimaryColor(dominantColor);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    addBrand({ name: name.trim(), logoUrl, primaryColor });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Virtual Brand"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!name.trim()} onClick={handleCreate}>
            Create Brand (+$10/mo)
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Brand Name">
          <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Fire Wings" />
        </FormField>

        <FormField label="Logo">
          <Dropzone
            label={processing ? "Analyzing colors…" : "Upload a logo"}
            hint="PNG or JPG, any size"
            preview={logoUrl}
            onFile={handleFile}
            accent={primaryColor}
          />
        </FormField>

        <FormField label="Brand Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-11 w-11 cursor-pointer rounded-lg border border-gray-200 bg-white p-1 dark:border-white/15 dark:bg-transparent"
            />
            <span className="font-mono text-sm text-gray-600 dark:text-white/60">{primaryColor}</span>
          </div>
          <div className="mt-2 flex gap-2">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => setPrimaryColor(c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full ring-offset-2 transition dark:ring-offset-[#161616] ${
                  primaryColor === c ? "ring-2 ring-gray-900 dark:ring-white" : "hover:scale-110"
                }`}
              />
            ))}
          </div>
        </FormField>
      </div>
    </Modal>
  );
}

export default function BrandsPage() {
  const { shop, brands } = useShopState();
  const { deleteBrand } = useShopActions();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Virtual Brands</h1>
        <p className="text-sm text-gray-500 dark:text-white/40">Run multiple storefronts out of this one kitchen — every order still lands on your single KDS.</p>
      </div>

      <Card
        title="Storefronts"
        description={`${1 + brands.length} live · one kitchen, one menu, ${1 + brands.length} brand${brands.length === 0 ? "" : "s"}.`}
        icon={ChefHat}
        action={
          <Button variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>
            Add Virtual Brand (+$10/mo)
          </Button>
        }
      >
        <div className="space-y-3">
          <BrandCard
            name={shop.name}
            slug={shop.slug}
            logoUrl={shop.logoUrl}
            primaryColor={shop.primaryColor}
            badge={
              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:bg-white/10 dark:text-white/40">
                <ShieldCheck size={10} /> Default
              </span>
            }
          />
          {brands.map((b) => (
            <BrandCard
              key={b.id}
              name={b.name}
              slug={b.slug}
              logoUrl={b.logoUrl}
              primaryColor={b.primaryColor}
              onDelete={() => setDeleteTarget(b)}
            />
          ))}
        </div>

        {brands.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white/30">
            No virtual brands yet — add one to launch a second storefront from this kitchen.
          </p>
        )}
      </Card>

      <AddBrandModal open={addOpen} onClose={() => setAddOpen(false)} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Virtual Brand" maxWidth="max-w-sm">
        <p className="text-sm text-gray-600 dark:text-white/60">
          Remove <strong>{deleteTarget?.name}</strong>? Its storefront URL will stop working and the $10/mo charge is removed.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteBrand(deleteTarget.id);
              setDeleteTarget(null);
            }}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
