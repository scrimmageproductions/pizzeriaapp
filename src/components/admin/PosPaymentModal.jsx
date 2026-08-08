import { useState } from "react";
import { Banknote, CheckCircle2, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatCurrency } from "../../utils/helpers";
import Button from "../shared/Button";

const QUICK_CASH_STEPS = [0, 5, 10, 20];

export default function PosPaymentModal({ open, onClose, total, primaryColor, orders, onCashCharge, onQrCharge, onConfirmPaid, onFinish }) {
  const [method, setMethod] = useState(null); // null | 'cash' | 'qr'
  const [tendered, setTendered] = useState("");
  const [cashDone, setCashDone] = useState(false);
  const [qrOrder, setQrOrder] = useState(null);

  const reset = () => {
    setMethod(null);
    setTendered("");
    setCashDone(false);
    setQrOrder(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startQr = () => {
    const order = onQrCharge();
    setQrOrder(order);
    setMethod("qr");
  };

  const completeCash = () => {
    onCashCharge(Number(tendered) || total);
    setCashDone(true);
  };

  const finishAndReset = () => {
    reset();
    onFinish();
  };

  const liveQrOrder = qrOrder ? orders.find((o) => o.id === qrOrder.id) || qrOrder : null;
  const qrPaid = !!liveQrOrder?.paidAt;
  const tenderedNum = Number(tendered) || 0;
  const change = Math.max(0, tenderedNum - total);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-extrabold text-gray-900">
            {method === null ? "Charge" : method === "cash" ? "Cash Payment" : "Scan & Pay"}
          </h3>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {method === null && (
            <div className="space-y-4">
              <p className="text-center text-3xl font-extrabold text-gray-900">{formatCurrency(total)}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod("cash")}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-gray-200 py-6 transition hover:border-[#00A651] hover:bg-[#00A651]/5"
                >
                  <Banknote size={30} className="text-[#00A651]" />
                  <span className="text-sm font-bold text-gray-800">Cash</span>
                </button>
                <button
                  onClick={startQr}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-gray-200 py-6 transition hover:border-[#0EA5E9] hover:bg-[#0EA5E9]/5"
                >
                  <QrCode size={30} className="text-[#0EA5E9]" />
                  <span className="text-sm font-bold text-gray-800">Scan & Pay</span>
                </button>
              </div>
              <p className="text-center text-xs text-gray-400">No card reader required for either option.</p>
            </div>
          )}

          {method === "cash" && !cashDone && (
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-500">Total Due</p>
              <p className="text-center text-3xl font-extrabold text-gray-900">{formatCurrency(total)}</p>

              <input
                type="number"
                autoFocus
                value={tendered}
                onChange={(e) => setTendered(e.target.value)}
                placeholder="Amount tendered"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-2xl font-bold outline-none focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
              />

              <div className="grid grid-cols-4 gap-2">
                {QUICK_CASH_STEPS.map((extra) => {
                  const amount = extra === 0 ? total : total + extra;
                  return (
                    <button
                      key={extra}
                      onClick={() => setTendered(String(amount.toFixed(2)))}
                      className="rounded-lg bg-gray-100 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200"
                    >
                      {extra === 0 ? "Exact" : `+$${extra}`}
                    </button>
                  );
                })}
              </div>

              {tenderedNum > 0 && (
                <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
                  <p className="text-xs font-semibold text-gray-500">Change Due</p>
                  <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(change)}</p>
                </div>
              )}

              <Button
                size="lg"
                className="w-full py-3.5"
                style={{ backgroundColor: primaryColor }}
                disabled={tenderedNum < total}
                onClick={completeCash}
              >
                Complete Sale
              </Button>
            </div>
          )}

          {method === "cash" && cashDone && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
                <CheckCircle2 size={32} />
              </span>
              <p className="text-lg font-extrabold text-gray-900">Sale Complete</p>
              {change > 0 && <p className="text-sm text-gray-500">Give back {formatCurrency(change)} change</p>}
              <Button className="mt-2 w-full" style={{ backgroundColor: primaryColor }} onClick={finishAndReset}>
                Start Next Order
              </Button>
            </div>
          )}

          {method === "qr" && liveQrOrder && !qrPaid && (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm font-semibold text-gray-600">
                Customer scans to pay with Apple Pay / Google Pay on their phone.
              </p>
              <div className="rounded-2xl border-4 border-gray-100 p-3">
                <QRCodeSVG value={`${window.location.origin}/pay/${liveQrOrder.id}`} size={200} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(total)}</p>
              <p className="text-xs text-gray-400">Waiting for payment…</p>
              <Button variant="outline" className="w-full" onClick={() => onConfirmPaid(liveQrOrder.id)}>
                Customer Paid — Confirm Manually
              </Button>
            </div>
          )}

          {method === "qr" && qrPaid && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
                <CheckCircle2 size={32} />
              </span>
              <p className="text-lg font-extrabold text-gray-900">Payment Confirmed</p>
              <p className="text-sm text-gray-500">{formatCurrency(total)} received via Scan & Pay</p>
              <Button className="mt-2 w-full" style={{ backgroundColor: primaryColor }} onClick={finishAndReset}>
                Start Next Order
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
