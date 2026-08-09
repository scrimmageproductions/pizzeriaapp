import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Delete, LogOut, MapPin, Pizza } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { computeShiftSummary } from "../../utils/shiftMath";
import { formatCurrency } from "../../utils/helpers";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export default function DispatchTerminalPage() {
  const { shop, drivers, orders } = useShopState();
  const { setDriverStatus, clockOutDriver } = useShopActions();
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [activeDriver, setActiveDriver] = useState(null);
  const [cashoutSummary, setCashoutSummary] = useState(null);

  if (!shop) return null;

  const tapKey = (key) => {
    if (key === "" || activeDriver) return;
    if (key === "back") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    const next = pin + key;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      const match = drivers.find((d) => d.pin === next);
      if (match) {
        setActiveDriver(match);
        setPin("");
        setError(false);
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 700);
      }
    }
  };

  const reset = () => {
    setActiveDriver(null);
    setCashoutSummary(null);
    setPin("");
  };

  const clockIn = () => {
    setDriverStatus(activeDriver.id, "IN_STORE", { clockInAt: Date.now(), inStoreSince: Date.now() });
    reset();
  };
  const leaveOnDelivery = () => {
    setDriverStatus(activeDriver.id, "ON_ROAD", { inStoreSince: null });
    reset();
  };
  const returnToStore = () => {
    setDriverStatus(activeDriver.id, "IN_STORE", { inStoreSince: Date.now() });
    reset();
  };

  const startClockOut = () => setCashoutSummary(computeShiftSummary(activeDriver, orders));

  const approveClockOut = () => {
    clockOutDriver(activeDriver.id, cashoutSummary);
    reset();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0B0B0D] text-white">
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-1.5 text-sm font-semibold text-white/40 hover:text-white/70">
          <ArrowLeft size={15} /> Admin
        </button>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E31837]">
            <Pizza size={14} />
          </span>
          <span className="text-sm font-extrabold">{shop.name} Dispatch Terminal</span>
        </div>
        <span className="w-16" />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        {!activeDriver && (
          <div className="flex w-full max-w-xs flex-col items-center gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-white/80">Enter your PIN</p>
              <p className="text-xs text-white/40">Drivers: punch in to clock in, go out on delivery, or clock out.</p>
            </div>
            <div className={`flex gap-3 ${error ? "animate-pulse" : ""}`}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <span
                  key={i}
                  className={`h-4 w-4 rounded-full border-2 ${
                    error ? "border-red-500 bg-red-500" : i < pin.length ? "border-white bg-white" : "border-white/30"
                  }`}
                />
              ))}
            </div>
            {error && <p className="text-xs font-bold text-red-400">PIN not recognized — try again</p>}
            <div className="grid grid-cols-3 gap-3">
              {KEYS.map((key, i) => (
                <button
                  key={i}
                  onClick={() => tapKey(key)}
                  disabled={key === ""}
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold transition active:scale-95 ${
                    key === "" ? "invisible" : key === "back" ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {key === "back" ? <Delete size={22} /> : key}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeDriver && !cashoutSummary && (
          <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
            <p className="text-2xl font-extrabold">Hi, {activeDriver.name.split(" ")[0]}!</p>
            <p className="text-sm text-white/50">Current status: {activeDriver.status.replace("_", " ")}</p>

            <div className="mt-2 flex w-full flex-col gap-3">
              {activeDriver.status === "OFF_CLOCK" && (
                <button onClick={clockIn} className="rounded-2xl bg-[#00A651] py-6 text-lg font-extrabold shadow-lg active:scale-[0.98]">
                  Clock In for Shift
                </button>
              )}
              {activeDriver.status === "IN_STORE" && (
                <>
                  <button onClick={leaveOnDelivery} className="flex items-center justify-center gap-2 rounded-2xl bg-[#F39C12] py-6 text-lg font-extrabold shadow-lg active:scale-[0.98]">
                    <MapPin size={20} /> Leaving on Delivery
                  </button>
                  <button onClick={startClockOut} className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-5 text-base font-bold hover:bg-white/20 active:scale-[0.98]">
                    <LogOut size={18} /> Clock Out
                  </button>
                </>
              )}
              {activeDriver.status === "ON_ROAD" && (
                <button onClick={returnToStore} className="rounded-2xl bg-[#00A651] py-6 text-lg font-extrabold shadow-lg active:scale-[0.98]">
                  Returned to Store
                </button>
              )}
            </div>

            <button onClick={reset} className="mt-2 text-sm font-semibold text-white/40 hover:text-white/70">
              Cancel
            </button>
          </div>
        )}

        {activeDriver && cashoutSummary && (
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-gray-900 shadow-2xl">
            <h2 className="text-center text-lg font-extrabold">End of Shift — {activeDriver.name}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Deliveries</span>
                <span className="font-bold">{cashoutSummary.deliveries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Mileage Fee ({cashoutSummary.deliveries} × {formatCurrency(cashoutSummary.feePerDelivery)})
                </span>
                <span className="font-bold text-[#00A651]">+{formatCurrency(cashoutSummary.mileageFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Credit Card Tips Earned</span>
                <span className="font-bold text-[#00A651]">+{formatCurrency(cashoutSummary.tips)}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-200 pb-3">
                <span className="text-gray-500">Cash Orders Collected</span>
                <span className="font-bold text-red-600">-{formatCurrency(cashoutSummary.cashCollected)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-base font-extrabold text-gray-900">Net Payout</span>
                <span className={`text-2xl font-black ${cashoutSummary.netPayout < 0 ? "text-red-600" : "text-[#00A651]"}`}>
                  {cashoutSummary.netPayout < 0
                    ? `Driver Owes Store: ${formatCurrency(Math.abs(cashoutSummary.netPayout))}`
                    : `Store Owes Driver: ${formatCurrency(cashoutSummary.netPayout)}`}
                </span>
              </div>
            </div>

            <button
              onClick={approveClockOut}
              className="mt-6 w-full rounded-2xl bg-[#E31837] py-4 text-base font-extrabold text-white shadow-lg active:scale-[0.98]"
            >
              Approve & Clock Out
            </button>
            <button onClick={() => setCashoutSummary(null)} className="mt-3 w-full text-sm font-semibold text-gray-400 hover:text-gray-600">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
