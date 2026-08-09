import { useState } from "react";
import { useParams } from "react-router-dom";
import { ExternalLink, Heart, MessageCircle, Pizza, SendHorizonal, Star } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { TextArea } from "../shared/FormField";
import Button from "../shared/Button";
import Toast from "../shared/Toast";

export default function FeedbackPage() {
  const { orderId } = useParams();
  const { shop, orders } = useShopState();
  const { submitFeedback } = useShopActions();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [step, setStep] = useState("rate"); // 'rate' | 'happy' | 'sorry' | 'sent'
  const [toast, setToast] = useState("");

  const order = orders.find((o) => o.id === orderId);
  const customerName = order?.customerName || "there";

  if (!shop) return null;

  const pick = (stars) => {
    setRating(stars);
    if (stars >= 4) {
      submitFeedback({ orderId, customerName, rating: stars });
      setStep("happy");
    } else {
      setStep("sorry");
    }
  };

  const handleSendToOwner = () => {
    submitFeedback({ orderId, customerName, rating, comment: comment.trim() });
    setStep("sent");
  };

  const handleGoogleClick = () => {
    setToast("Redirecting you to Google Reviews… (mock)");
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8F9FA] px-6 py-10">
      <Toast show={!!toast} message={toast} icon={ExternalLink} />

      <div className="mx-auto w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-white"
            style={{ backgroundColor: shop.primaryColor }}
          >
            {shop.logoUrl ? <img src={shop.logoUrl} alt="" className="h-full w-full object-cover" /> : <Pizza size={18} />}
          </span>
          <span className="text-sm font-extrabold text-gray-900">{shop.name}</span>
        </div>

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-xl">
          {step === "rate" && (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Order {orderId}</p>
              <h1 className="mt-2 text-xl font-extrabold text-gray-900">How was your DeepDish pizza today?</h1>
              <div className="mt-6 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => pick(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition active:scale-90"
                  >
                    <Star
                      size={38}
                      className={(hoverRating || rating) >= n ? "fill-[#F39C12] text-[#F39C12]" : "text-gray-200"}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400">Tap a star to rate your experience.</p>
            </>
          )}

          {step === "happy" && (
            <>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
                <Heart size={30} />
              </span>
              <h1 className="mt-4 text-xl font-extrabold text-gray-900">You made our day! 🎉</h1>
              <p className="mt-1 text-sm text-gray-500">Thanks for the {rating}-star love, {customerName}.</p>
              <Button
                size="lg"
                className="mt-6 w-full py-4 text-base"
                style={{ backgroundColor: "#4285F4" }}
                icon={ExternalLink}
                onClick={handleGoogleClick}
              >
                Awesome! Could you take 10 seconds to leave us a Google Review?
              </Button>
            </>
          )}

          {step === "sorry" && (
            <>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E31837]/10 text-[#E31837]">
                <MessageCircle size={28} />
              </span>
              <h1 className="mt-4 text-xl font-extrabold text-gray-900">We are so sorry we missed the mark.</h1>
              <p className="mt-1 text-sm text-gray-500">What went wrong? This goes straight to the owner, not online.</p>
              <TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what happened…"
                rows={4}
                className="mt-4"
              />
              <Button
                size="lg"
                className="mt-4 w-full py-3.5"
                style={{ backgroundColor: shop.primaryColor }}
                icon={SendHorizonal}
                disabled={!comment.trim()}
                onClick={handleSendToOwner}
              >
                Send directly to the Owner
              </Button>
            </>
          )}

          {step === "sent" && (
            <>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00A651]/10 text-[#00A651]">
                <SendHorizonal size={26} />
              </span>
              <h1 className="mt-4 text-xl font-extrabold text-gray-900">Got it — thank you.</h1>
              <p className="mt-1 text-sm text-gray-500">The owner has been notified and will make this right.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
