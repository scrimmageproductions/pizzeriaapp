import { useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, ClipboardList, Package, Plus, Sparkles, Truck } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { formatCurrency } from "../../utils/helpers";
import { RECIPE_EXAMPLE } from "../../data/inventory";
import Card from "../shared/Card";
import Button from "../shared/Button";
import AddSupplierModal from "./AddSupplierModal";

function AiAutoPurchaseToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
        checked
          ? "bg-gradient-to-r from-[#7C3AED] to-[#E31837] text-white shadow-[0_0_0_3px_rgba(124,58,237,0.25),0_0_16px_rgba(124,58,237,0.55)]"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <Bot size={13} />
      <span className="relative flex h-4 w-8 items-center rounded-full bg-black/10">
        <span
          className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      AI Auto-Purchase
    </button>
  );
}

export default function InventoryPage() {
  const { ingredients, suppliers, agentActivityLog } = useShopState();
  const { updateIngredient, addSupplier } = useShopActions();
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);

  const supplierName = (id) => suppliers.find((s) => s.id === id)?.name || "—";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <Package size={22} /> AI Inventory
        </h1>
        <p className="text-sm text-gray-500">Track raw ingredients and let an AI agent auto-reorder stock before you ever run out.</p>
      </div>

      {/* Section A — Ingredient Tracker & Recipes */}
      <Card title="Ingredient Tracker" description="Raw stock levels, live from every completed order." icon={Package}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400">
                <th className="py-2 pr-3">Ingredient</th>
                <th className="py-2 pr-3">Current Stock</th>
                <th className="py-2 pr-3">Low-Stock Threshold</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Preferred Supplier</th>
                <th className="py-2 pr-3">Agent Control</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => {
                const low = ing.stock < ing.threshold;
                return (
                  <tr key={ing.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-3 font-bold text-gray-900">{ing.name}</td>
                    <td className="py-3 pr-3 text-gray-700">
                      {ing.stock} {ing.unit}
                    </td>
                    <td className="py-3 pr-3 text-gray-500">
                      {ing.threshold} {ing.unit}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          low ? "bg-red-50 text-red-600" : "bg-[#00A651]/10 text-[#00A651]"
                        }`}
                      >
                        {low ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                        {low ? "Low" : "In Stock"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-gray-500">{supplierName(ing.preferredSupplierId)}</td>
                    <td className="py-3 pr-3">
                      <AiAutoPurchaseToggle
                        checked={ing.autoPurchaseEnabled}
                        onChange={(val) => updateIngredient(ing.id, { autoPurchaseEnabled: val })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E31837]/10 text-[#E31837]">
            <ClipboardList size={17} />
          </span>
          <div className="text-xs text-gray-600">
            <p className="font-bold text-gray-800">Simulated Recipe Mapping</p>
            <p className="mt-1">
              Selling one <span className="font-semibold text-gray-800">{RECIPE_EXAMPLE.itemName}</span> in the POS automatically
              deducts{" "}
              {RECIPE_EXAMPLE.deductions.map((d, i) => (
                <span key={d.ingredientName}>
                  <span className="font-semibold text-gray-800">
                    {d.amount} of {d.ingredientName}
                  </span>
                  {i < RECIPE_EXAMPLE.deductions.length - 1 ? " and " : ""}
                </span>
              ))}{" "}
              from this list — no manual stock entry required.
            </p>
          </div>
        </div>
      </Card>

      {/* Section B — Suppliers & Agentic Auto-Purchase */}
      <Card
        title="Suppliers & Agentic Auto-Purchase"
        description="Preferred vendors the AI agent buys from automatically."
        icon={Truck}
        action={
          <Button size="sm" icon={Plus} onClick={() => setSupplierModalOpen(true)}>
            Add Supplier
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="rounded-2xl border border-gray-200 p-4">
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-gray-900">
                <Truck size={15} className="text-gray-400" /> {supplier.name}
              </p>
              <div className="mt-3 space-y-1.5">
                {supplier.items.map((it) => {
                  const ing = ingredients.find((i) => i.id === it.ingredientId);
                  if (!ing) return null;
                  return (
                    <div key={it.ingredientId} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{ing.name}</span>
                      <span className="font-bold text-gray-800">
                        {formatCurrency(it.costPerUnit)}/{ing.unit.replace(/s$/, "")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Agent Activity Log */}
      <Card
        title="Agent Activity Log"
        description="Every automatic purchase the AI has made on your behalf."
        icon={Sparkles}
        className="ring-2 ring-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/[0.04] to-[#E31837]/[0.04]"
      >
        {agentActivityLog.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
            <Bot size={20} />
            <p>No purchases yet — the agent logs activity here the moment it restocks something.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {agentActivityLog.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 rounded-xl bg-white/60 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#E31837] text-white">
                  <Sparkles size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700">{entry.message}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{new Date(entry.ts).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AddSupplierModal open={supplierModalOpen} onClose={() => setSupplierModalOpen(false)} onSave={addSupplier} ingredients={ingredients} />
    </div>
  );
}
