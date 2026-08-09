import { useState } from "react";
import { Inbox, MessageSquareWarning, Star, ThumbsUp } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Toast from "../shared/Toast";

function formatDate(ms) {
  return new Date(ms).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ReputationPage() {
  const { googleReviewsBoosted, feedback } = useShopState();
  const { resolveFeedback } = useShopActions();
  const [toast, setToast] = useState("");

  const sorted = [...feedback].sort((a, b) => b.createdAt - a.createdAt);

  const handleApologize = (item) => {
    resolveFeedback(item.id);
    setToast(`Texted ${item.customerName} an apology + refund link.`);
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast show={!!toast} message={toast} icon={ThumbsUp} />

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">⭐ Reputation</h1>
        <p className="text-sm text-gray-500">Great reviews go public automatically. Bad ones come to you first.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A651]/10 text-[#00A651]">
              <Star size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{googleReviewsBoosted}</p>
              <p className="text-xs text-gray-500">Google Reviews Boosted</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F39C12]/10 text-[#F39C12]">
              <MessageSquareWarning size={20} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{feedback.length}</p>
              <p className="text-xs text-gray-500">Bad Reviews Intercepted</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Intercept Inbox" description="1-3 star feedback, kept off Google and sent straight to you.">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
            <Inbox size={28} />
            <p className="text-sm">No intercepted feedback yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Rating</th>
                  <th className="pb-3 pr-4">Complaint</th>
                  <th className="pb-3 pr-4" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 last:border-0 align-top">
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-gray-700">{f.orderId}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-900">{f.customerName}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={13} className={n <= f.rating ? "fill-[#F39C12] text-[#F39C12]" : "text-gray-200"} />
                        ))}
                      </div>
                      <p className="mt-1 text-[11px] text-gray-400">{formatDate(f.createdAt)}</p>
                    </td>
                    <td className="max-w-xs py-3 pr-4 text-gray-600">{f.comment || "—"}</td>
                    <td className="py-3">
                      {f.resolved ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-400">Resolved</span>
                      ) : (
                        <Button variant="danger" size="sm" onClick={() => handleApologize(f)}>
                          Text Customer to Apologize & Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
