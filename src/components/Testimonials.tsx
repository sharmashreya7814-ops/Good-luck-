import React, { useState } from 'react';
import { PLACEHOLDER_REVIEWS } from '../data/reviews';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? PLACEHOLDER_REVIEWS.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev === PLACEHOLDER_REVIEWS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-20 md:py-28 bg-[#0c0d0e] border-t border-[#1e2229] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c5a880]">
            <span>06. Patron Reflections</span>
            <span aria-hidden="true">·</span>
            <span>Client Trust</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal">
            Echoes of Craftsmanship
          </h2>
          <p className="text-xs sm:text-sm text-[#8c919d]">
            Structured client reflections. Real reviews from neighborhood regulars can replace these placeholders.
          </p>
        </div>

        {/* Desktop: 2-Column Grid */}
        <div className="hidden md:grid grid-cols-2 gap-8">
          {PLACEHOLDER_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="p-8 rounded-2xl bg-[#131518] border border-[#22262f] flex flex-col justify-between space-y-6 shadow-lg shadow-black/20 relative"
            >
              <Quote className="w-8 h-8 text-[#c5a880]/30 stroke-[1.5]" />

              <p className="text-base sm:text-lg font-serif text-[#e4e1db] italic leading-relaxed">
                "{review.quote}"
              </p>

              <div className="pt-4 border-t border-[#1e2229] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {review.clientName}
                  </h4>
                  <div className="text-xs text-[#8c919d]">
                    {review.relation} · <span className="text-[#c5a880]">{review.serviceType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-[#c5a880]">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#c5a880]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Interactive Carousel */}
        <div className="md:hidden space-y-4">
          <div className="p-6 rounded-2xl bg-[#131518] border border-[#22262f] space-y-5">
            <Quote className="w-7 h-7 text-[#c5a880]/30 stroke-[1.5]" />

            <p className="text-base font-serif text-[#e4e1db] italic leading-relaxed">
              "{PLACEHOLDER_REVIEWS[currentIndex].quote}"
            </p>

            <div className="pt-4 border-t border-[#1e2229] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {PLACEHOLDER_REVIEWS[currentIndex].clientName}
                </h4>
                <div className="text-xs text-[#8c919d]">
                  {PLACEHOLDER_REVIEWS[currentIndex].relation}
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-[#c5a880]">
                {Array.from({ length: PLACEHOLDER_REVIEWS[currentIndex].rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#c5a880]" />
                ))}
              </div>
            </div>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-[#8c919d] font-mono">
              {currentIndex + 1} of {PLACEHOLDER_REVIEWS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevReview}
                className="p-2 rounded-lg bg-[#181b21] border border-[#262a34] text-white hover:bg-[#202530]"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextReview}
                className="p-2 rounded-lg bg-[#181b21] border border-[#262a34] text-white hover:bg-[#202530]"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
