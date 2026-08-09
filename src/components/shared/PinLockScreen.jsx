import { useState } from "react";
import { Delete, Lock } from "lucide-react";
import { useShopActions } from "../../context/ShopContext";
import { MOCK_PINS } from "../../data/rbac";

const PAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

/**
 * Fullscreen numeric PIN pad gating a kiosk terminal (POS, KDS) until someone "clocks in".
 * Mock RBAC — a 4-digit PIN maps straight to a role via MOCK_PINS, no backend involved.
 */
export default function PinLockScreen({ primaryColor = "#E31837", title = "Clock In", subtitle = "Enter your PIN to continue" }) {
  const { clockInUser } = useShopActions();
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);

  const press = (key) => {
    if (key === "") return;
    setError(false);
    if (key === "del") {
      setDigits((d) => d.slice(0, -1));
      return;
    }
    setDigits((d) => {
      if (d.length >= 4) return d;
      const next = d + key;
      if (next.length === 4) {
        const match = MOCK_PINS[next];
        if (match) {
          setTimeout(() => clockInUser(match.role, match.name), 120);
        } else {
          setTimeout(() => {
            setError(true);
            setDigits("");
          }, 250);
        }
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gray-950 px-6 text-white">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}55` }}
      >
        <Lock size={24} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold">{title}</h1>
      <p className="mt-1 text-sm text-white/50">{subtitle}</p>

      <div className={`mt-8 flex gap-3 ${error ? "animate-shake" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border-2 transition ${digits.length > i ? "border-white bg-white" : "border-white/30"}`}
          />
        ))}
      </div>
      <p className={`mt-3 h-4 text-xs font-bold text-red-400 transition-opacity ${error ? "opacity-100" : "opacity-0"}`}>
        Incorrect PIN — try again
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {PAD_KEYS.map((key, i) =>
          key === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => press(key)}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white transition hover:bg-white/20 active:scale-95"
            >
              {key === "del" ? <Delete size={20} /> : key}
            </button>
          )
        )}
      </div>

      <p className="mt-8 text-center text-xs text-white/30">Demo PINs — Admin 9999 · Manager 5555 · Cashier 1111</p>
    </div>
  );
}
