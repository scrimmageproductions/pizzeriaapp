import { useState } from "react";
import { Star, RefreshCw, CheckCircle2, Sheet, MapPin } from "lucide-react";
import { useAppActions, useAppState } from "../../context/AppContext";
import Card from "../shared/Card";
import Button from "../shared/Button";
import { FormField, TextInput } from "../shared/FormField";
import Toggle from "../shared/Toggle";

const MOCK_REVIEWS = [
  { name: "Amanda K.", text: "Best pizza in the neighborhood, hands down. Crust is perfect.", rating: 5 },
  { name: "Marcus T.", text: "Fast delivery and the garlic knots are addictive.", rating: 5 },
  { name: "Priya S.", text: "Ordered for a party of 12, everyone loved it!", rating: 5 },
  { name: "Diego R.", text: "Authentic taste, reminds me of Naples.", rating: 4 },
  { name: "Lena W.", text: "Super friendly staff and consistently great pies.", rating: 5 },
];

export default function IntegrationsSection() {
  const { config } = useAppState();
  const { updateConfig } = useAppActions();
  const [syncing, setSyncing] = useState(false);
  const [urlInput, setUrlInput] = useState(config.googleMapsUrl);

  const handleSync = () => {
    setSyncing(true);
    updateConfig({ googleMapsUrl: urlInput });
    setTimeout(() => {
      updateConfig({
        googleReviewsSynced: true,
        googleReviewRating: 4.8,
        googleReviewCount: 312,
      });
      setSyncing(false);
    }, 1600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card
        title="Google Reviews Sync"
        description="Pull your Google Maps rating & reviews onto your storefront."
        icon={Star}
      >
        <div className="space-y-4">
          <FormField label="Google Maps Business URL">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <TextInput
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://maps.google.com/…"
                  className="pl-9"
                />
              </div>
              <Button variant="secondary" icon={syncing ? RefreshCw : Star} onClick={handleSync} disabled={syncing}>
                {syncing ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={14} className="animate-spin" /> Syncing…
                  </span>
                ) : (
                  "Sync Reviews"
                )}
              </Button>
            </div>
          </FormField>

          {config.googleReviewsSynced && !syncing && (
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#00A651]">
                <CheckCircle2 size={16} />
                Synced — {config.googleReviewRating}★ average from {config.googleReviewCount} reviews
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {MOCK_REVIEWS.map((r) => (
                  <div key={r.name} className="rounded-lg bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">{r.name}</span>
                      <span className="flex items-center gap-0.5 text-[#F39C12]">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Google Sheets Sync"
        description="Automatically export every order to a live spreadsheet."
        icon={Sheet}
      >
        <div className="rounded-xl border border-gray-200 p-4">
          <Toggle
            checked={config.googleSheetsSyncEnabled}
            onChange={(val) => updateConfig({ googleSheetsSyncEnabled: val })}
            label="Auto-export orders to Google Sheets"
            description="New orders are appended as rows in real time."
          />
          {config.googleSheetsSyncEnabled && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-[#00A651]">
              <CheckCircle2 size={14} />
              Connected — orders-export-luigis-pizza.sheet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
