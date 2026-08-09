import { useState } from "react";
import { CheckCircle2, Loader2, Plug, ShieldCheck } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { THIRD_PARTY_META } from "../../data/thirdParty";
import Card from "../shared/Card";
import Toggle from "../shared/Toggle";
import Modal from "../shared/Modal";

const APPS = ["doordash", "ubereats", "grubhub"];

export default function IntegrationsPage() {
  const { shop } = useShopState();
  const { updateShop } = useShopActions();
  const [connecting, setConnecting] = useState(null); // { key, phase: 'connecting' | 'done' } | null

  const integrations = shop.integrations || { doordash: false, ubereats: false, grubhub: false };
  const activeCount = APPS.filter((k) => integrations[k]).length;

  const toggle = (key, val) => {
    if (!val) {
      updateShop({ integrations: { ...integrations, [key]: false } });
      return;
    }
    setConnecting({ key, phase: "connecting" });
    setTimeout(() => {
      setConnecting({ key, phase: "done" });
      updateShop({ integrations: { ...integrations, [key]: true } });
      setTimeout(() => setConnecting(null), 1400);
    }, 1600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <Plug size={22} /> Delivery Apps
        </h1>
        <p className="text-sm text-gray-500">Sync third-party marketplace orders into one KDS — and quietly win those customers back.</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#121212] p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#00A651]">
            <ShieldCheck size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white/60">Tablet Hell Eliminated</p>
            <p className="text-4xl font-extrabold tracking-tight">{activeCount} Active Integration{activeCount === 1 ? "" : "s"}</p>
            <p className="mt-1 text-sm text-white/50">Every connected app's orders land right here — one tablet, one KDS.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {APPS.map((key) => {
          const meta = THIRD_PARTY_META[key];
          return (
            <Card key={key}>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-extrabold"
                  style={{ backgroundColor: meta.bg, color: meta.color }}
                >
                  {meta.label.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{meta.label}</p>
                  <p className="text-xs text-gray-400">{integrations[key] ? "Connected" : "Not connected"}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <Toggle checked={!!integrations[key]} onChange={(val) => toggle(key, val)} label={integrations[key] ? "Syncing orders" : "Off"} />
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!connecting} onClose={() => {}} title="" maxWidth="max-w-sm">
        {connecting && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            {connecting.phase === "connecting" ? (
              <>
                <Loader2 size={32} className="animate-spin text-gray-400" />
                <p className="text-sm font-bold text-gray-800">Connecting to {THIRD_PARTY_META[connecting.key].label} API…</p>
                <p className="text-xs text-gray-400">Authorizing OAuth scope for order sync</p>
              </>
            ) : (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
                  <CheckCircle2 size={28} />
                </span>
                <p className="text-sm font-bold text-gray-800">Connected to {THIRD_PARTY_META[connecting.key].label}!</p>
                <p className="text-xs text-gray-400">Orders will now sync straight into your KDS.</p>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
