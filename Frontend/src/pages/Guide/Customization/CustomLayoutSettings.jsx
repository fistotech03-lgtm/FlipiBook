import React, { useState } from 'react';
import { Sliders, Play, CheckCircle2, Lightbulb, ExternalLink } from 'lucide-react';
import CustomScrollbar from '../../../components/CustomScrollbar';
import { GUIDE_VIDEOS, getYoutubeVideoId } from '../guideVideos';

export const customLayoutSettingsSections = [
  {
    id: 'custom-layout-settings-sec',
    title: 'Layout Settings',
    icon: <Sliders className="w-[0.95vw] h-[0.95vw]" />,
    items: [
      { id: 'custom-layout-settings', label: 'Layout Settings' }
    ]
  }
];

const videoId = getYoutubeVideoId(GUIDE_VIDEOS.customLayoutSettings);

export default function CustomLayoutSettings({ id }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div id={id} className="w-full flex flex-col pt-[1vh] pb-[1.5vh] px-[1.5vw] space-y-[1vh] scroll-mt-[2vh]">
        <div className=" -mx-[1.5vw] px-[1.5vw]">
          <div className="flex items-center gap-[0.6vw]">
            <span className="p-[0.45vw] rounded-[0.45vw] bg-[#ec5137]/10 text-[#ec5137]">
              <Sliders className="w-[1.1vw] h-[1.1vw]" />
            </span>
            <h1 className="text-[1.3vw] font-semibold font-bold text-[#17202C] tracking-tight leading-snug">
              Layout Settings
            </h1>
          </div>
          <p className="text-[0.85vw] font-semibold text-gray-700 mt-[0.5vh] ml-[4vw] mr-[1vw] leading-relaxed">
            Customize viewer toolbar positions and choose which buttons readers see, including thumbnails, zoom, and search. Enable timed auto-play slideshow mode to run unattended presentations and showroom displays.
          </p>
        </div>

        <div className="w-full flex-1 flex items-center justify-center py-[0.5vh]">
          <div className="w-full max-w-[62vw] aspect-video rounded-none overflow-hidden shadow-sm isolate transform-gpu [transform:translateZ(0)] relative group flex items-center justify-center">
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
                title="Layout Settings Tutorial"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
  );
}
