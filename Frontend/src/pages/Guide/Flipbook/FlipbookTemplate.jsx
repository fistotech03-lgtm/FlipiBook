import React, { useState } from 'react';
import { LayoutTemplate, Play, CheckCircle2, Lightbulb, ExternalLink } from 'lucide-react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import { GUIDE_VIDEOS, getYoutubeVideoId } from '../guideVideos';

export const flipbookTemplateSections = [
  {
    id: 'flipbook-use-template-sec',
    title: 'Use Template',
    icon: <LayoutTemplate className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'flipbook-use-template', label: 'Use Template' }
    ]
  }
];

const videoId = getYoutubeVideoId(GUIDE_VIDEOS.flipbookTemplate);

export default function FlipbookTemplate() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <CustomScrollbar
      color="#d1d5db"
      hoverColor="#9ca3af"
      width="0.25vw"
      className="w-full h-full"
    >
      <div className="w-full min-h-full flex flex-col pt-[1.5vh] pb-[3vh] px-[1.5vw] space-y-[2.5vh]">
        <div className="pb-[1.8vh] border-b border-gray-200 -mx-[1.5vw] px-[1.5vw]">
          <div className="flex items-center gap-[0.6vw]">
            <span className="p-[0.45vw] rounded-[0.45vw] bg-[#ec5137]/10 text-[#ec5137]">
              <LayoutTemplate className="w-[1.1vw] h-[1.1vw]" />
            </span>
            <h1 className="text-[1.3vw] font-semibold text-gray-900 tracking-tight leading-snug">
              Use Template
            </h1>
          </div>
          <p className="text-[0.9vw] font-semibold text-gray-400 mt-[1.8vh] ml-[4vw] mr-[4vw] leading-relaxed">
            Browse a library of professionally designed templates across magazines, portfolios, and product catalogs. Preview interactive layouts and adopt any template with a single click to plug in your own text and photos.
          </p>
        </div>

        <div className="w-full flex-1 flex items-center justify-center py-[2vh]">
          <div className="w-full max-w-[62vw] aspect-video rounded-[0.8vw] overflow-hidden shadow-md border border-gray-200 bg-black relative group flex items-center justify-center">
            {!isPlaying ? (
              <div
                onClick={() => setIsPlaying(true)}
                className="w-full h-full relative cursor-pointer flex items-center justify-center select-none"
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }}
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors duration-200" />
                <div className="absolute z-10 w-[4.6vw] min-w-[3.6rem] h-[3.2vw] min-h-[2.5rem] bg-[#FF0000] hover:bg-[#cc0000] rounded-[0.8vw] flex items-center justify-center shadow-2xl transition-all duration-200 transform group-hover:scale-110 active:scale-95">
                  <Play className="w-[1.5vw] h-[1.5vw] text-white fill-white ml-[0.15vw]" />
                </div>
              </div>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title="Use Template Tutorial"
                className="w-full h-full rounded-[0.8vw] border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </div></div>
    </CustomScrollbar>
  );
}
