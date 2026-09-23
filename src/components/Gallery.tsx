import React, { useState } from 'react';
import { GALLERY_ITEMS, GalleryItem } from '../data/gallery';
import { ZoomIn, Scissors } from 'lucide-react';

export const Gallery: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="py-20 md:py-28 bg-[#0c0d0e] border-t border-[#1e2229] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#1f232d] pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#c5a880] mb-2">
              <span>05. The Salon Atmosphere</span>
              <span aria-hidden="true">·</span>
              <span>Visual Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal">
              Atmosphere & Craft
            </h2>
            <p className="text-sm sm:text-base text-[#9ea3ae] mt-2 max-w-xl">
              A glimpse into our quiet interior, orderly setup, traditional grooming services, and personal attention.
            </p>
          </div>

          <div className="text-xs text-[#8c919d] font-mono">
            Clean Station · Dedicated Care
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative rounded-2xl overflow-hidden border border-[#222630] hover:border-[#c5a880]/50 bg-[#131518] cursor-pointer transition-all duration-300 shadow-lg shadow-black/20"
            >
              {/* Visual Card Canvas */}
              <div className={`aspect-[4/3] bg-gradient-to-br ${item.themeColor} p-6 flex flex-col justify-between relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]`}>
                
                {/* Subtle geometric grid texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#c5a880_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#c5a880] uppercase tracking-wider">
                    {item.category}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[#c5a880] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Center Icon Graphic */}
                <div className="relative z-10 my-auto text-center py-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-[#c5a880]/80 group-hover:text-[#c5a880] group-hover:border-[#c5a880]/30 transition-all">
                    <Scissors className="w-5 h-5 stroke-[1.5]" />
                  </div>
                </div>

                {/* Bottom Caption inside visual */}
                <div className="relative z-10">
                  <span className="text-[10px] text-[#b5af9f] uppercase tracking-wider block mb-1">
                    {item.tag}
                  </span>
                  <h3 className="text-base font-serif text-white font-medium">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Card Bottom Meta Description */}
              <div className="p-4 bg-[#14161a] border-t border-[#1e2229]">
                <p className="text-xs text-[#9ea3ae] line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal preview when item clicked */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="bg-[#14161a] border border-[#2e3340] rounded-2xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#242833] pb-3">
                <span className="text-xs font-mono text-[#c5a880] uppercase tracking-wider">
                  {selectedItem.category}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-xs text-[#8c919d] hover:text-white px-2 py-1 rounded hover:bg-[#1f2229]"
                >
                  Close [Esc]
                </button>
              </div>

              <div className={`aspect-[16/10] rounded-xl bg-gradient-to-br ${selectedItem.themeColor} p-6 flex flex-col justify-center items-center text-center border border-[#292e3a]`}>
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] mb-3">
                  <Scissors className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-medium">{selectedItem.title}</h4>
                <div className="text-xs text-[#c5a880] mt-1">{selectedItem.tag}</div>
              </div>

              <p className="text-xs sm:text-sm text-[#9ea3ae] leading-relaxed">
                {selectedItem.description}
              </p>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-[#1b1e25] hover:bg-[#252a35] text-xs font-medium text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
