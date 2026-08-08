import { Clock, Palette, Timer } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import Card from "../shared/Card";
import { FormField, TextInput } from "../shared/FormField";
import Toggle from "../shared/Toggle";

const SWATCHES = ["#E31837", "#00A651", "#F39C12", "#1D3557", "#6A0DAD", "#0EA5E9", "#111827"];

export default function StoreSettingsPage() {
  const { shop } = useShopState();
  const { updateShop } = useShopActions();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-gray-900">Store Settings</h1>

      <Card title="Order Status" description="Turn off to stop accepting new orders on your site." icon={Timer}>
        <Toggle
          checked={shop.acceptingOrders}
          onChange={(val) => updateShop({ acceptingOrders: val })}
          label={shop.acceptingOrders ? "Accepting Orders" : "Paused — not accepting orders"}
          description="Customers will see a friendly notice on your site while paused."
        />
      </Card>

      <Card title="Brand Color" description="Used across your public site's header, buttons, and accents." icon={Palette}>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={shop.primaryColor}
            onChange={(e) => updateShop({ primaryColor: e.target.value })}
            className="h-11 w-11 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
          />
          <span className="font-mono text-sm text-gray-600">{shop.primaryColor}</span>
        </div>
        <div className="mt-3 flex gap-2">
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => updateShop({ primaryColor: c })}
              style={{ backgroundColor: c }}
              className={`h-7 w-7 rounded-full ring-offset-2 transition ${
                shop.primaryColor === c ? "ring-2 ring-gray-900" : "hover:scale-110"
              }`}
            />
          ))}
        </div>
      </Card>

      <Card title="Hours of Operation" icon={Clock}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Opening Time">
            <TextInput
              type="time"
              value={shop.hours.open}
              onChange={(e) => updateShop({ hours: { ...shop.hours, open: e.target.value } })}
            />
          </FormField>
          <FormField label="Closing Time">
            <TextInput
              type="time"
              value={shop.hours.close}
              onChange={(e) => updateShop({ hours: { ...shop.hours, close: e.target.value } })}
            />
          </FormField>
        </div>
      </Card>

      <Card title="Kitchen Prep Time" description="Drives the automated countdown on your Order KDS." icon={Timer}>
        <FormField label="Default prep time (minutes)">
          <TextInput
            type="number"
            min={1}
            max={120}
            value={shop.prepMinutes}
            onChange={(e) => updateShop({ prepMinutes: Math.max(1, Number(e.target.value) || 1) })}
            className="max-w-[160px]"
          />
        </FormField>
      </Card>
    </div>
  );
}
