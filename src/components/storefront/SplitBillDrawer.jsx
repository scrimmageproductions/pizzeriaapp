import { useState } from "react";
import { CheckCircle2, Minus, Plus, Share2, Users, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatCurrency } from "../../utils/helpers";
import Button from "../shared/Button";

export default function SplitBillDrawer({ open, onClose, order, primaryColor, onDone }) {
  const [mode, setMode] = useState("even"); // 'even' | 'custom'
  const [numPeople, setNumPeople] = useState(2);
  const [customAmount, setCustomAmount] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  if (!order) return null;

  const collected = order.splitPaidTotal || 0;
  const remaining = Math.max(0, order.total - collected);
  const fullyPaid = !!order.paidAt;

  const evenAmount = numPeople > 0 ? order.total / numPeople : 0;
  const customValue = Math.min(Number(customAmount) || 0, remaining);
  const shareAmount = mode === "even" ? evenAmount : customValue;
  const shareUrl = `${window.location.origin}/split/${order.id}?amount=${shareAmount.toFixed(2)}`;
  const canGenerate = shareAmount > 0;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Pay your share", text: `Pay your share of ${order.customerName}'s bill`, url: shareUrl });
        return;
      } catch {
        // user dismissed the native share sheet — fall back to copying the link
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard blocked (e.g. no permission) — the QR code alone is still enough to pay
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <Users size={18} /> Split the Bill
          </h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 px-5 py-5">
          {fullyPaid ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
                <CheckCircle2 size={32} />
              </span>
              <p className="text-lg font-extrabold text-gray-900">Bill Fully Settled!</p>
              <p className="text-sm text-gray-500">{formatCurrency(order.total)} collected from the table.</p>
              <Button className="mt-2 w-full" style={{ backgroundColor: primaryColor }} onClick={onDone}>
                Track My Order
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Bill Total</p>
                <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(order.total)}</p>
                {collected > 0 && (
                  <p className="mt-1 text-xs font-semibold text-[#00A651]">
                    {formatCurrency(collected)} collected · {formatCurrency(remaining)} remaining
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("even")}
                  className={`rounded-xl border-2 py-2.5 text-sm font-bold transition ${
                    mode === "even" ? "text-white" : "border-gray-200 text-gray-500"
                  }`}
                  style={mode === "even" ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                >
                  Split Evenly
                </button>
                <button
                  onClick={() => setMode("custom")}
                  className={`rounded-xl border-2 py-2.5 text-sm font-bold transition ${
                    mode === "custom" ? "text-white" : "border-gray-200 text-gray-500"
                  }`}
                  style={mode === "custom" ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                >
                  Pay Custom Amount
                </button>
              </div>

              {mode === "even" ? (
                <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <span className="text-sm font-semibold text-gray-600">Number of people</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNumPeople((n) => Math.max(2, n - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center text-base font-extrabold text-gray-900">{numPeople}</span>
                    <button
                      onClick={() => setNumPeople((n) => Math.min(20, n + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">Your share ($)</label>
                  <input
                    type="number"
                    min="0.01"
                    max={remaining}
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={remaining.toFixed(2)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#E31837] focus:ring-2 focus:ring-[#E31837]/20"
                  />
                </div>
              )}

              {canGenerate && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 p-5 text-center">
                  <p className="text-sm font-semibold text-gray-600">
                    {mode === "even" ? `Each person scans & pays their $${evenAmount.toFixed(2)} share` : "Share this so someone else can pay their part"}
                  </p>
                  <div className="rounded-2xl border-4 border-gray-100 p-3">
                    <QRCodeSVG value={shareUrl} size={180} />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(shareAmount)}</p>
                  <Button variant="outline" icon={linkCopied ? CheckCircle2 : Share2} className="w-full" onClick={handleShare}>
                    {linkCopied ? "Link Copied!" : "Share Link"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
