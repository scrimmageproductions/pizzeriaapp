import { Star } from "lucide-react";

function ReviewCard({ review }) {
  return (
    <div className="w-72 shrink-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-0.5 text-[#F5B700]">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <p className="mt-2 line-clamp-3 text-sm italic text-gray-600">"{review.text}"</p>
      <p className="mt-2 text-xs font-bold text-gray-900">— {review.name}</p>
    </div>
  );
}

export default function FeaturedReviewsCarousel({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  // Duplicate the strip so the CSS marquee can loop seamlessly at the -50% mark.
  const strip = [...reviews, ...reviews];

  return (
    <div className="border-b border-gray-100 bg-white py-4">
      <div className="scrollbar-none overflow-hidden">
        <div className="flex w-max animate-marquee gap-3 px-4">
          {strip.map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}
