import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Layers,
  Box,
  Link2,
  Share2,
  Shield,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

const GUIDES = [
  {
    id: 'quickstart',
    category: 'basics',
    icon: Sparkles,
    color: 'bg-orange-50 text-[#ec5137] border border-orange-200',
    title: 'Quick Start Guide',
    description: 'Get your first interactive digital flipbook converted and published in under 3 minutes.',
    tip: 'You can drag & drop any PDF directly into the studio to trigger high-speed vector conversion.',
    steps: [
      'Upload a PDF document or choose from our pre-designed templates gallery.',
      'Customize your publication title, page thickness, paper curl, and audio flip sounds.',
      'Add interactive 3D models, clickable links, video embeds, or audio hotspots.',
      'Click Publish to get a responsive shareable URL or iframe embed snippet for your website.'
    ]
  },
  {
    id: 'editor',
    category: 'editor',
    icon: Layers,
    color: 'bg-blue-50 text-blue-600 border border-blue-200',
    title: 'Visual Page Editor',
    description: 'Master the visual canvas to craft beautiful page layouts, custom typography, and vector graphics.',
    tip: 'Use layer grouping to lock background designs while editing foreground text.',
    steps: [
      'Use the Toolbar to add text headers, paragraphs, and custom typography styling.',
      'Upload high-resolution images, SVG graphics, and icons directly onto any page.',
      'Arrange layers, align elements with snapping guides, and configure responsive layouts.',
      'Preview real-time flip animations across desktop, tablet, and mobile viewports.'
    ]
  },
  {
    id: '3d',
    category: '3d',
    icon: Box,
    color: 'bg-emerald-50 text-[#16A34A] border border-emerald-200',
    title: '3D Models & Augmented Reality',
    description: 'Embed realistic 3D objects with full orbit controls, shadow intensity, and lighting presets.',
    tip: 'GLB files under 15MB offer the smoothest 60 FPS rotation on mobile browsers.',
    steps: [
      'Upload GLB, GLTF, or OBJ 3D model assets into your publication library.',
      'Position models on pages or configure popup interactive 3D inspection overlays.',
      'Configure auto-rotation speed, camera zoom limits, and background HDR environments.',
      'Enable mobile AR mode so readers can project and inspect items in real-world space.'
    ]
  },
  {
    id: 'hotspots',
    category: 'interactivity',
    icon: Link2,
    color: 'bg-purple-50 text-purple-600 border border-purple-200',
    title: 'Interactive Hotspots & Links',
    description: 'Turn static catalog pages into engaging, clickable shopping and multimedia experiences.',
    tip: 'Pulsing hotspot beacons boost reader click-through rates by up to 34%.',
    steps: [
      'Place pulsing hotspot markers anywhere on your catalog or magazine pages.',
      'Link hotspots to external e-commerce URLs, shopping carts, or modal video popups.',
      'Configure tooltip text, custom thumbnail previews, and hover animations.',
      'Track reader click-through and engagement metrics in your analytics dashboard.'
    ]
  },
  {
    id: 'security',
    category: 'security',
    icon: Shield,
    color: 'bg-rose-50 text-rose-600 border border-rose-200',
    title: 'Privacy & Password Protection',
    description: 'Control who can view, download, or share your proprietary intellectual publications.',
    tip: 'Enable domain whitelisting to prevent unauthorized iframe embedding on other sites.',
    steps: [
      'Set publication privacy to Public, Private, or Password-Protected with encryption.',
      'Whitelist authorized website domains for embedded iframe viewers.',
      'Disable PDF downloads or print buttons to protect proprietary intellectual assets.',
      'Generate secure, time-limited invitation links for VIP clients and stakeholders.'
    ]
  },
  {
    id: 'distribution',
    category: 'distribution',
    icon: Share2,
    color: 'bg-teal-50 text-teal-600 border border-teal-200',
    title: 'Sharing, Embedding & QR Codes',
    description: 'Distribute your flipbooks across social media, email newsletters, and websites seamlessly.',
    tip: 'Embed iframe snippets automatically adapt between single-page mobile and 2-page desktop mode.',
    steps: [
      'Copy responsive HTML iframe embed code for WordPress, Shopify, Webflow, or Squarespace.',
      'Generate vector QR codes for print magazines, flyers, and exhibition booth banners.',
      'Share direct preview links with customized Open Graph social meta cards.',
      'Export standalone offline HTML packages for trade shows and offline presentations.'
    ]
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'basics', label: 'Quick Start' },
  { id: 'editor', label: 'Page Editor' },
  { id: '3d', label: '3D & AR' },
  { id: 'interactivity', label: 'Interactivity' },
  { id: 'security', label: 'Privacy' },
  { id: 'distribution', label: 'Sharing' },
];

export default function Guide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState(GUIDES[0]);

  const filteredGuides = GUIDES.filter((g) => {
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.steps.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-[92vw] mx-auto p-[1.5vw] font-sans space-y-[1.4vw]">
      {/* 1. Header Banner */}
      <div className="w-full relative rounded-[1vw] py-[1.2vw] px-[1.6vw] border border-gray-200 shadow-sm flex justify-between items-center overflow-hidden select-none bg-gradient-to-r from-white via-white to-[#fff8f6]">
        {/* Ambient Glows */}
        <div className="absolute -top-[5vw] right-[14vw] w-[18vw] h-[18vw] bg-gradient-to-br from-orange-400/10 via-rose-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-[4vw] right-[2vw] w-[14vw] h-[14vw] bg-gradient-to-tl from-amber-400/10 via-orange-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col z-10 max-w-[70%]">
          <div className="inline-flex items-center gap-[0.35vw] px-[0.6vw] py-[0.18vw] rounded-full text-[0.66vw] font-medium bg-[#fff1ee] text-[#ec5137] border border-[#fecaca] w-fit mb-[0.5vw]">
            <BookOpen className="w-[0.8vw] h-[0.8vw]" />
            <span>Documentation & Knowledge Base</span>
          </div>

          <h1 className="text-[1.35vw] font-semibold text-gray-800 tracking-tight leading-tight">
            FlipiBook Creator Guide & Tutorials
          </h1>

          <p className="text-[0.74vw] text-gray-500 font-normal mt-[0.25vw] max-w-[46vw] leading-relaxed">
            Everything you need to know about designing, enhancing with 3D models, embedding multimedia, and publishing interactive digital flipbooks.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-[0.65vw] z-10">
          <Link
            to="/my-flipbooks"
            className="inline-flex items-center gap-[0.4vw] px-[1.05vw] py-[0.48vw] rounded-[0.5vw] bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] text-white font-medium text-[0.78vw] shadow-xs transition-all cursor-pointer"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-[0.8vw] h-[0.8vw]" />
          </Link>
          <Link
            to="/forum"
            className="inline-flex items-center gap-[0.4vw] px-[0.85vw] py-[0.42vw] rounded-[0.5vw] bg-white border border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-medium text-[0.78vw] shadow-xs transition-all cursor-pointer"
          >
            <span>Ask Community</span>
          </Link>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white rounded-[1vw] border border-gray-200 p-[0.9vw] shadow-sm flex flex-wrap items-center justify-between gap-[0.8vw]">
        {/* Search */}
        <div className="relative flex-1 min-w-[15vw] max-w-[22vw]">
          <Search size="0.95vw" className="absolute left-[0.75vw] top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, tutorials, or tools..."
            className="w-full pl-[2.2vw] pr-[0.8vw] py-[0.45vw] bg-[#f8f9fa] hover:bg-white focus:bg-white border border-gray-200 rounded-[0.5vw] text-[0.78vw] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ec5137] transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-[0.45vw] flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-[0.85vw] py-[0.38vw] rounded-[0.5vw] text-[0.75vw] font-medium transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#ec5137] text-white shadow-xs'
                  : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1.2vw]">
        {/* Left Column: Topics Grid & Video Resources */}
        <div className="lg:col-span-2 space-y-[1.2vw]">
          {/* Topics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.9vw]">
            {filteredGuides.map((guide) => {
              const IconComponent = guide.icon;
              const isSelected = selectedGuide.id === guide.id;

              return (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`p-[1.2vw] rounded-[0.75vw] border transition-all cursor-pointer shadow-xs hover:shadow-sm ${
                    isSelected
                      ? 'bg-white border-[#ec5137] ring-1 ring-[#ec5137]/20 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-[0.75vw] mb-[0.6vw]">
                    <div className={`w-[2.2vw] h-[2.2vw] rounded-[0.5vw] ${guide.color} flex items-center justify-center shrink-0`}>
                      <IconComponent className="w-[1.1vw] h-[1.1vw]" />
                    </div>
                    <h3 className="font-medium text-[0.88vw] text-gray-800 leading-tight">
                      {guide.title}
                    </h3>
                  </div>

                  <p className="text-[0.72vw] text-gray-500 font-normal line-clamp-2 leading-relaxed">
                    {guide.description}
                  </p>

                  <div className="mt-[0.6vw] flex items-center gap-[0.25vw] text-[0.72vw] font-medium text-[#ec5137]">
                    <span>View detailed walkthrough</span>
                    <ChevronRight className="w-[0.8vw] h-[0.8vw]" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredGuides.length === 0 && (
            <div className="py-[3vw] text-center bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm">
              <HelpCircle className="w-[2vw] h-[2vw] mx-auto text-gray-300 mb-[0.4vw]" />
              <p className="text-[0.88vw] font-medium text-gray-800">No guides found</p>
              <p className="text-[0.72vw] text-gray-400 font-normal mt-[0.2vw]">
                Try adjusting your search keyword or selected category tab.
              </p>
            </div>
          )}

          {/* Video Walkthrough Callout Banner */}
          <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.2vw] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-[1vw]">
            <div className="flex items-center gap-[0.85vw]">
              <div className="w-[2.6vw] h-[2.6vw] rounded-[0.6vw] bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <PlayCircle className="w-[1.3vw] h-[1.3vw]" />
              </div>
              <div>
                <h3 className="font-medium text-[0.88vw] text-gray-800">
                  Video Masterclasses & Creator Tutorials
                </h3>
                <p className="text-[0.72vw] text-gray-500 font-normal mt-[0.1vw]">
                  Watch step-by-step video masterclasses on 3D design, animation, and responsive publishing.
                </p>
              </div>
            </div>
            <Link
              to="/forum"
              className="px-[0.85vw] py-[0.42vw] rounded-[0.5vw] text-[0.78vw] font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-xs transition active:scale-[0.98] shrink-0"
            >
              Visit Forum Tutorials
            </Link>
          </div>
        </div>

        {/* Right Column: Active Guide Walkthrough Panel */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-[1vw] border border-gray-200 p-[1.5vw] shadow-sm sticky top-[1.5vw] space-y-[1vw]">
            {/* Guide Header */}
            <div className="flex items-center gap-[0.75vw] pb-[0.75vw] border-b border-gray-100">
              <div className={`w-[2.4vw] h-[2.4vw] rounded-[0.55vw] ${selectedGuide.color} flex items-center justify-center shrink-0 shadow-2xs`}>
                <selectedGuide.icon className="w-[1.2vw] h-[1.2vw]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-[0.98vw] text-gray-800 truncate">
                  {selectedGuide.title}
                </h3>
                <span className="text-[0.68vw] text-gray-400 font-normal block">
                  Walkthrough & Step-by-Step
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-[0.76vw] text-gray-600 font-normal leading-relaxed">
              {selectedGuide.description}
            </p>

            {/* Steps list */}
            <div className="space-y-[0.65vw] pt-[0.2vw]">
              <h4 className="text-[0.72vw] font-medium uppercase tracking-wide text-gray-400">
                Action Steps
              </h4>
              <ol className="space-y-[0.6vw]">
                {selectedGuide.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-[0.65vw] text-[0.75vw] text-gray-700 leading-relaxed font-normal">
                    <span className="w-[1.4vw] h-[1.4vw] rounded-full bg-[#f8f9fa] border border-gray-200 text-gray-700 font-medium text-[0.68vw] flex items-center justify-center shrink-0 mt-[0.1vw]">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Pro Tip Box */}
            {selectedGuide.tip && (
              <div className="p-[0.85vw] rounded-[0.6vw] bg-[#fff8f6] border border-[#fecaca] text-[0.72vw] text-gray-700 space-y-[0.2vw]">
                <div className="flex items-center gap-[0.3vw] text-[#ec5137] font-medium">
                  <Sparkles className="w-[0.75vw] h-[0.75vw]" />
                  <span>Pro Tip</span>
                </div>
                <p className="text-gray-600 font-normal leading-relaxed">
                  {selectedGuide.tip}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-[0.6vw] border-t border-gray-100 flex flex-col gap-[0.45vw]">
              <Link
                to="/my-flipbooks"
                className="w-full text-center py-[0.48vw] px-[1vw] rounded-[0.5vw] text-[0.78vw] font-medium text-white bg-[#ec5137] hover:bg-[#d94229] active:scale-[0.98] shadow-xs transition-all"
              >
                Try in Flipbook Studio
              </Link>
              <Link
                to="/settings/support"
                className="w-full text-center py-[0.42vw] px-[1vw] rounded-[0.5vw] text-[0.78vw] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-xs transition-all active:scale-[0.98]"
              >
                Need Help? Contact Support
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
