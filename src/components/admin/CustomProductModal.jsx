import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import Modal from "../shared/Modal";
import Button from "../shared/Button";
import { FormField, Select } from "../shared/FormField";
import ProductMockup from "./ProductMockup";

export default function CustomProductModal({ open, product, shop, onClose, onAdd }) {
  const [logoSize, setLogoSize] = useState(45);
  const [accentColor, setAccentColor] = useState(shop.primaryColor);
  const [tierIndex, setTierIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setLogoSize(45);
      setAccentColor(shop.primaryColor);
      setTierIndex(0);
    }
  }, [open, product?.id, shop.primaryColor]);

  if (!product) return null;
  const tier = product.tiers[tierIndex];

  const handleAdd = () => {
    onAdd({
      productId: `${product.id}-${accentColor.replace("#", "")}-${logoSize}-${Date.now()}`,
      name: `${product.name} — Custom Branded`,
      price: tier.price,
      qty: tier.minQty,
      customization: { logoSize, accentColor },
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={product.name} maxWidth="max-w-lg">
      <div className="space-y-5">
        <ProductMockup type={product.mockup} logoUrl={shop.logoUrl} color={accentColor} logoSize={logoSize} className="rounded-2xl border border-gray-100" />

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-400">
            <span>Logo Size</span>
            <span>{logoSize}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="80"
            value={logoSize}
            onChange={(e) => setLogoSize(Number(e.target.value))}
            className="w-full accent-[#E31837]"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Accent Color</span>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
          />
        </div>

        <FormField label="Quantity">
          <Select value={tierIndex} onChange={(e) => setTierIndex(Number(e.target.value))}>
            {product.tiers.map((t, i) => (
              <option key={t.label} value={i}>
                {t.label} — {formatCurrency(t.price)}/ea
              </option>
            ))}
          </Select>
        </FormField>

        <Button size="lg" icon={Plus} className="w-full py-3.5" onClick={handleAdd}>
          Add to Cart — {formatCurrency(tier.price * tier.minQty)}
        </Button>
      </div>
    </Modal>
  );
}
