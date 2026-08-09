import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import { Download, Pizza, Sparkles, Star } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import { Select } from "../shared/FormField";

function TemplateFrame({ frameRef, children }) {
  return (
    <div
      ref={frameRef}
      className="mx-auto flex aspect-square w-full max-w-[300px] flex-col overflow-hidden rounded-2xl shadow-lg"
    >
      {children}
    </div>
  );
}

function Logo({ shop, dark }) {
  return (
    <span
      className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ${
        dark ? "bg-white/15 text-white" : "bg-gray-100 text-gray-700"
      }`}
    >
      {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <Pizza size={22} />}
    </span>
  );
}

export default function SocialStudioPage() {
  const { shop, items } = useShopState();
  const [selectedId, setSelectedId] = useState(items[0]?.id || "");
  const [generatedItem, setGeneratedItem] = useState(null);

  const teaserRef = useRef(null);
  const reviewRef = useRef(null);
  const promoRef = useRef(null);

  const selectedItem = items.find((i) => i.id === selectedId);
  const storefrontUrl = `${window.location.origin}/${shop.slug}`;

  const handleGenerate = () => {
    if (selectedItem) setGeneratedItem(selectedItem);
  };

  const handleDownload = async (ref, filename) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch {
      // DOM-to-image rendering can fail on cross-origin assets (e.g. a remotely hosted logo) — nothing to recover client-side
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">🎨 Social Studio</h1>
        <p className="text-sm text-gray-500">The Canva of POS — turn any menu item into ready-to-post Instagram content.</p>
      </div>

      <Card title="Generate Assets" description="Pick a menu item and we'll build three on-brand templates instantly." icon={Sparkles}>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Add items to your menu first — then come back here.</p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button size="lg" icon={Sparkles} style={{ backgroundColor: shop.primaryColor }} onClick={handleGenerate}>
              Generate Instagram Assets ✨
            </Button>
          </div>
        )}
      </Card>

      {generatedItem && (
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-3">
            <TemplateFrame frameRef={teaserRef}>
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-6 p-6 text-center"
                style={{ backgroundColor: shop.primaryColor }}
              >
                <Logo shop={shop} dark />
                <p className="text-3xl font-black uppercase leading-tight tracking-tight text-white">{generatedItem.name}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">Now at {shop.name}</p>
              </div>
            </TemplateFrame>
            <p className="text-center text-xs font-bold uppercase tracking-wide text-gray-400">The Teaser</p>
            <Button variant="outline" icon={Download} className="w-full" onClick={() => handleDownload(teaserRef, `${generatedItem.name}-teaser.png`)}>
              Download to Post
            </Button>
          </div>

          <div className="space-y-3">
            <TemplateFrame frameRef={reviewRef}>
              <div className="flex h-full w-full flex-col items-center justify-between bg-white p-6 text-center">
                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={26} className="fill-[#F39C12] text-[#F39C12]" />
                    ))}
                  </div>
                  <p className="text-xl font-extrabold leading-snug text-gray-900">"Best pizza in town!"</p>
                  <p className="text-xs font-semibold text-gray-400">— a very happy customer</p>
                </div>
                <div className="flex flex-col items-center gap-2 pb-2">
                  <Logo shop={shop} />
                  <p className="text-xs font-bold text-gray-700">{shop.name}</p>
                </div>
              </div>
            </TemplateFrame>
            <p className="text-center text-xs font-bold uppercase tracking-wide text-gray-400">The Review</p>
            <Button variant="outline" icon={Download} className="w-full" onClick={() => handleDownload(reviewRef, `${generatedItem.name}-review.png`)}>
              Download to Post
            </Button>
          </div>

          <div className="space-y-3">
            <TemplateFrame frameRef={promoRef}>
              <div className="flex h-full w-full flex-col items-center justify-between bg-[#F8F9FA] p-6 text-center">
                <Logo shop={shop} />
                <div className="space-y-1">
                  <p className="text-lg font-extrabold leading-snug text-gray-900">
                    Order {generatedItem.name} Direct &amp; Save 15%
                  </p>
                  <p className="text-xs font-semibold text-gray-500">{formatCurrency(generatedItem.price * 0.85)} when you skip the apps</p>
                </div>
                <div className="rounded-xl border-4 border-white bg-white p-2 shadow-sm">
                  <QRCodeSVG value={storefrontUrl} size={110} fgColor={shop.primaryColor} />
                </div>
              </div>
            </TemplateFrame>
            <p className="text-center text-xs font-bold uppercase tracking-wide text-gray-400">The Promo</p>
            <Button variant="outline" icon={Download} className="w-full" onClick={() => handleDownload(promoRef, `${generatedItem.name}-promo.png`)}>
              Download to Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
