import { useEffect, useState } from "react";
import { Image, LayoutTemplate, Palette, Pencil, Plus, Quote, Star, Trash2 } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { COLOR_SWATCHES } from "../../data/brand";
import { processLogoFile, resizeImageFile } from "../../utils/imageProcessing";
import { uid } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import Dropzone from "../shared/Dropzone";
import { FormField, TextArea, TextInput } from "../shared/FormField";

const MAX_REVIEWS = 3;

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-[#F5B700]">
          <Star size={22} fill={n <= value ? "currentColor" : "none"} strokeWidth={n <= value ? 0 : 1.5} />
        </button>
      ))}
    </div>
  );
}

function ReviewFormModal({ open, onClose, onSave, initialReview }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialReview?.name || "");
      setRating(initialReview?.rating || 5);
      setText(initialReview?.text || "");
    }
  }, [open, initialReview]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialReview ? "Edit Review" : "Feature a Review"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!name.trim() || !text.trim()}
            onClick={() => {
              onSave({ id: initialReview?.id || uid("review"), name: name.trim(), rating, text: text.trim() });
              onClose();
            }}
          >
            {initialReview ? "Save Changes" : "Add Review"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Customer Name">
          <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah M." />
        </FormField>
        <FormField label="Star Rating">
          <StarPicker value={rating} onChange={setRating} />
        </FormField>
        <FormField label="Review Text">
          <TextArea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Best pizza in the neighborhood, hands down!" />
        </FormField>
      </div>
    </Modal>
  );
}

export default function StorefrontCustomizerPage() {
  const { shop } = useShopState();
  const { updateShop } = useShopActions();
  const [logoProcessing, setLogoProcessing] = useState(false);
  const [heroProcessing, setHeroProcessing] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const featuredReviews = shop.featuredReviews || [];
  const headerStyle = shop.headerStyle || "minimal";

  const handleLogoFile = async (file) => {
    setLogoProcessing(true);
    try {
      const { dataUrl } = await processLogoFile(file);
      updateShop({ logoUrl: dataUrl });
    } finally {
      setLogoProcessing(false);
    }
  };

  const handleHeroFile = async (file) => {
    setHeroProcessing(true);
    try {
      const dataUrl = await resizeImageFile(file, 1200);
      updateShop({ heroImageUrl: dataUrl });
    } finally {
      setHeroProcessing(false);
    }
  };

  const saveReview = (review) => {
    const exists = featuredReviews.some((r) => r.id === review.id);
    const next = exists ? featuredReviews.map((r) => (r.id === review.id ? review : r)) : [...featuredReviews, review];
    updateShop({ featuredReviews: next.slice(0, MAX_REVIEWS) });
  };

  const deleteReview = (id) => updateShop({ featuredReviews: featuredReviews.filter((r) => r.id !== id) });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Storefront</h1>
        <p className="text-sm text-gray-500 dark:text-white/40">Total control over how deepdish.store/{shop.slug} looks to customers.</p>
      </div>

      <Card title="Logo" description="Shown in your header and across the dashboard." icon={Image}>
        <Dropzone
          label={logoProcessing ? "Processing…" : "Upload your logo"}
          hint="PNG or JPG, any size — drag & drop or click"
          preview={shop.logoUrl}
          onFile={handleLogoFile}
          accent={shop.primaryColor}
        />
      </Card>

      <Card title="Theme Color" description="Applies to every button and accent on your storefront." icon={Palette}>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={shop.primaryColor}
            onChange={(e) => updateShop({ primaryColor: e.target.value })}
            className="h-11 w-11 cursor-pointer rounded-lg border border-gray-200 bg-white p-1 dark:border-white/15 dark:bg-transparent"
          />
          <span className="font-mono text-sm text-gray-600 dark:text-white/60">{shop.primaryColor}</span>
        </div>
        <div className="mt-3 flex gap-2">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => updateShop({ primaryColor: c })}
              style={{ backgroundColor: c }}
              className={`h-7 w-7 rounded-full ring-offset-2 transition dark:ring-offset-[#141414] ${
                shop.primaryColor === c ? "ring-2 ring-gray-900 dark:ring-white" : "hover:scale-110"
              }`}
            />
          ))}
        </div>
      </Card>

      <Card title="Header Style" description="How the top of your storefront renders for customers." icon={LayoutTemplate}>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => updateShop({ headerStyle: "minimal" })}
            className={`rounded-xl border-2 p-4 text-left transition ${
              headerStyle === "minimal" ? "border-[#E31837] bg-red-50/50 dark:bg-[#E31837]/10" : "border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20"
            }`}
          >
            <p className="text-sm font-bold text-gray-900 dark:text-white">Clean & Minimal</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-white/40">Just your logo and name — fast and simple.</p>
          </button>
          <button
            onClick={() => updateShop({ headerStyle: "hero" })}
            className={`rounded-xl border-2 p-4 text-left transition ${
              headerStyle === "hero" ? "border-[#E31837] bg-red-50/50 dark:bg-[#E31837]/10" : "border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20"
            }`}
          >
            <p className="text-sm font-bold text-gray-900 dark:text-white">Hero Banner</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-white/40">A massive background image up top.</p>
          </button>
        </div>

        {headerStyle === "hero" && (
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/10">
            <Dropzone
              label={heroProcessing ? "Processing…" : "Upload a hero banner image"}
              hint="Wide landscape photo works best"
              preview={shop.heroImageUrl}
              onFile={handleHeroFile}
              accent={shop.primaryColor}
              icon={Image}
            />
          </div>
        )}
      </Card>

      <Card
        title="Featured Reviews"
        description="Manually pick your best 3 — shown as a trust-building carousel above your menu."
        icon={Quote}
        action={
          featuredReviews.length < MAX_REVIEWS && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingReview(null);
                setReviewModalOpen(true);
              }}
            >
              Add Review
            </Button>
          )
        }
      >
        {featuredReviews.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400 dark:text-white/30">
            <Quote size={28} />
            <p className="text-sm">No featured reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {featuredReviews.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-white/10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{r.name}</p>
                    <span className="flex items-center gap-0.5 text-[#F5B700]">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
                      ))}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs italic text-gray-500 dark:text-white/40">"{r.text}"</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => {
                      setEditingReview(r);
                      setReviewModalOpen(true);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-white/30 dark:hover:bg-white/10 dark:hover:text-white/70"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(r)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:text-white/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ReviewFormModal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} onSave={saveReview} initialReview={editingReview} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Review" maxWidth="max-w-sm">
        <p className="text-sm text-gray-600 dark:text-white/60">
          Remove the review from <strong>{deleteTarget?.name}</strong>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteReview(deleteTarget.id);
              setDeleteTarget(null);
            }}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
