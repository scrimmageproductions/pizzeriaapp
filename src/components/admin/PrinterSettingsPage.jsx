import { useState } from "react";
import { Bluetooth, BluetoothConnected, Printer, PrinterCheck, Search, Sparkles, Ticket } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { buildBoxTopperMessage, shopDirectLink } from "../../utils/boxTopper";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Toggle from "../shared/Toggle";

const MOCK_DEVICE = "Star Micronics TSP143";

export default function PrinterSettingsPage() {
  const { shop, printEvents } = useShopState();
  const { updateShop, addPrintEvent } = useShopActions();
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState(false);

  const printer = shop.printer || { connected: false, deviceName: null, autoPrintOnReady: false };

  const scan = () => {
    setFound(false);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setFound(true);
    }, 1800);
  };

  const connect = () => {
    updateShop({ printer: { ...printer, connected: true, deviceName: MOCK_DEVICE } });
  };

  const disconnect = () => {
    updateShop({ printer: { ...printer, connected: false, deviceName: null, autoPrintOnReady: false } });
    setFound(false);
  };

  const testPrint = () => {
    addPrintEvent(`🖨️ Printing test receipt from ${printer.deviceName}...`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <Printer size={22} /> Hardware & Printers
        </h1>
        <p className="text-sm text-gray-500">Pair a Bluetooth thermal receipt printer — no dedicated POS terminal required.</p>
      </div>

      <Card title="Bluetooth Receipt Printer" description="Standard ESC/POS thermal printers pair over Web Bluetooth." icon={Bluetooth}>
        {!printer.connected ? (
          <div className="space-y-4">
            <Button variant="outline" icon={scanning ? undefined : Search} onClick={scan} disabled={scanning}>
              {scanning ? "Scanning for nearby printers…" : "Search for Bluetooth Printers"}
            </Button>

            {scanning && (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                Looking for nearby devices…
              </div>
            )}

            {found && !scanning && (
              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <Printer size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{MOCK_DEVICE}</p>
                    <p className="text-xs text-gray-400">Bluetooth thermal printer</p>
                  </div>
                </div>
                <Button size="sm" onClick={connect}>
                  Connect
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[#00A651]/30 bg-[#00A651]/5 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A651]/10 text-[#00A651]">
                  <BluetoothConnected size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{printer.deviceName}</p>
                  <p className="text-xs font-semibold text-[#00A651]">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" icon={PrinterCheck} onClick={testPrint}>
                  Test Print
                </Button>
                <Button size="sm" variant="ghost" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            </div>

            <Toggle
              checked={printer.autoPrintOnReady}
              onChange={(val) => updateShop({ printer: { ...printer, autoPrintOnReady: val } })}
              label="Auto-print on Ready"
              description="Automatically print a receipt the moment an order is marked 'Ready'."
            />
          </div>
        )}
      </Card>

      <Card
        title="Automated Box Toppers"
        description="Turn expensive third-party customers into direct ones, one ticket at a time."
        icon={Sparkles}
        className="ring-2 ring-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/[0.04] to-[#E31837]/[0.04]"
      >
        <Toggle
          checked={!!printer.autoPrintBoxTopper}
          onChange={(val) => updateShop({ printer: { ...printer, autoPrintBoxTopper: val } })}
          disabled={!printer.connected}
          label="Auto-print 15% off conversion coupon for all Third-Party orders"
          description={
            printer.connected
              ? "Prints a secondary ticket the moment a DoorDash/UberEats/Grubhub order goes Ready."
              : "Connect a printer above to enable this."
          }
        />

        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
            <Ticket size={12} /> Ticket Preview
          </p>
          <div className="rounded-lg bg-white p-4 text-center font-mono text-xs leading-relaxed text-gray-700 shadow-inner">
            <p className="font-bold">*** {shop.name.toUpperCase()} ***</p>
            <p className="mt-2">{buildBoxTopperMessage(shop)}</p>
            <p className="mt-2 font-bold">CODE: DIRECT15</p>
            <p className="mt-1">{shopDirectLink(shop)}</p>
          </div>
        </div>
      </Card>

      <Card title="Recent Print Activity" icon={PrinterCheck}>
        {printEvents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
            Nothing printed yet.
          </p>
        ) : (
          <div className="space-y-2">
            {printEvents.slice(0, 10).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-xs">
                <span className="text-gray-700">{e.message}</span>
                <span className="shrink-0 text-gray-400">{new Date(e.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
