import { Store, Clock, Timer, Bike } from "lucide-react";
import { useAppActions, useAppState } from "../../context/AppContext";
import Card from "../shared/Card";
import { FormField, TextInput, TextArea } from "../shared/FormField";
import Toggle from "../shared/Toggle";

export default function ShopProfileSection() {
  const { config } = useAppState();
  const { updateConfig } = useAppActions();

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Basic Information" description="This appears on your storefront and receipts." icon={Store}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Pizzeria Name">
            <TextInput value={config.name} onChange={(e) => updateConfig({ name: e.target.value })} />
          </FormField>
          <FormField label="Phone Number">
            <TextInput value={config.phone} onChange={(e) => updateConfig({ phone: e.target.value })} />
          </FormField>
          <FormField label="Location / Address" className="sm:col-span-2">
            <TextInput value={config.location} onChange={(e) => updateConfig({ location: e.target.value })} />
          </FormField>
          <FormField label="Tagline" hint="A short line shown under your name on the storefront.">
            <TextArea
              rows={2}
              value={config.tagline}
              onChange={(e) => updateConfig({ tagline: e.target.value })}
            />
          </FormField>
        </div>
      </Card>

      <Card title="Hours of Operation" icon={Clock}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Opening Time">
            <TextInput
              type="time"
              value={config.hours.open}
              onChange={(e) => updateConfig({ hours: { ...config.hours, open: e.target.value } })}
            />
          </FormField>
          <FormField label="Closing Time">
            <TextInput
              type="time"
              value={config.hours.close}
              onChange={(e) => updateConfig({ hours: { ...config.hours, close: e.target.value } })}
            />
          </FormField>
        </div>
      </Card>

      <Card
        title="Order Settings"
        description="Controls timing shown to customers on the live tracker."
        icon={Timer}
      >
        <div className="space-y-5">
          <FormField
            label="Default Cook / Prep Time (minutes)"
            hint="Used to calculate estimated completion time for new orders."
          >
            <TextInput
              type="number"
              min={1}
              max={180}
              value={config.prepTimeMinutes}
              onChange={(e) => updateConfig({ prepTimeMinutes: Math.max(1, Number(e.target.value) || 1) })}
              className="max-w-[160px]"
            />
          </FormField>

          <div className="rounded-xl border border-gray-200 p-4">
            <Toggle
              checked={config.deliveryEnabled}
              onChange={(val) => updateConfig({ deliveryEnabled: val })}
              label="Enable Delivery"
              description="Turn off to run Pickup Only."
            />
            {config.deliveryEnabled && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <FormField
                  label="Estimated Delivery Transit Time (minutes)"
                  hint="Added on top of prep time once an order is ready."
                >
                  <div className="flex items-center gap-2">
                    <Bike size={16} className="text-gray-400" />
                    <TextInput
                      type="number"
                      min={1}
                      max={120}
                      value={config.deliveryTransitMinutes}
                      onChange={(e) =>
                        updateConfig({ deliveryTransitMinutes: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="max-w-[160px]"
                    />
                  </div>
                </FormField>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
