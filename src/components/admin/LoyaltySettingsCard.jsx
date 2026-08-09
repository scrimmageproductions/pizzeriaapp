import { useState } from "react";
import { Gift, Plus, Star, Trash2 } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { DEFAULT_LOYALTY } from "../../data/loyalty";
import { uid } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import { TextInput } from "../shared/FormField";

export default function LoyaltySettingsCard() {
  const { shop } = useShopState();
  const { updateLoyaltySettings } = useShopActions();
  const loyalty = shop.loyalty || DEFAULT_LOYALTY;

  const [draft, setDraft] = useState({ name: "", pointsCost: "", freeItemName: "" });

  const addReward = (e) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.freeItemName.trim() || Number(draft.pointsCost) <= 0) return;
    updateLoyaltySettings({
      redemptionCatalog: [
        ...loyalty.redemptionCatalog,
        { id: uid("reward"), name: draft.name.trim(), pointsCost: Number(draft.pointsCost), freeItemName: draft.freeItemName.trim() },
      ],
    });
    setDraft({ name: "", pointsCost: "", freeItemName: "" });
  };

  const removeReward = (id) =>
    updateLoyaltySettings({ redemptionCatalog: loyalty.redemptionCatalog.filter((r) => r.id !== id) });

  return (
    <Card title="Loyalty Program Settings" description="Reward repeat customers automatically — no punch cards required." icon={Star}>
      <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
        <div>
          <p className="text-sm font-bold text-gray-800">Conversion Rate</p>
          <p className="text-xs text-gray-500">How many points a customer earns per dollar spent.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm font-bold text-gray-700">
          $1 =
          <div className="w-16 shrink-0">
            <TextInput
              type="number"
              min="0"
              step="0.5"
              value={loyalty.pointsPerDollar}
              onChange={(e) => updateLoyaltySettings({ pointsPerDollar: Number(e.target.value) || 0 })}
              className="text-center"
            />
          </div>
          pts
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-800">
          <Gift size={15} /> Redemption Catalog
        </p>
        <div className="space-y-2">
          {loyalty.redemptionCatalog.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-400">Redeems for {r.freeItemName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#E31837]/10 px-2.5 py-1 text-xs font-bold text-[#E31837]">{r.pointsCost} pts</span>
                <button onClick={() => removeReward(r.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={addReward} className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-dashed border-gray-200 p-3 sm:grid-cols-[1fr_1fr_90px_auto]">
          <TextInput
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Reward name (e.g. Free Garlic Knots)"
          />
          <TextInput
            value={draft.freeItemName}
            onChange={(e) => setDraft({ ...draft, freeItemName: e.target.value })}
            placeholder="Menu item to give free"
          />
          <TextInput
            type="number"
            min="1"
            value={draft.pointsCost}
            onChange={(e) => setDraft({ ...draft, pointsCost: e.target.value })}
            placeholder="Points"
          />
          <Button type="submit" size="md" icon={Plus}>
            Add
          </Button>
        </form>
      </div>
    </Card>
  );
}
