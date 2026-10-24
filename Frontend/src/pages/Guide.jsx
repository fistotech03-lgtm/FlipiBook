import React, { useState } from 'react';
import { Search, BookOpen, Layers, Box, Link2, Share2, Shield, Sparkles, ChevronRight, CheckCircle2, PlayCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const GUIDES = [
  {
    id: 'quickstart',
    icon: Sparkles,
    color: 'bg-orange-50 text-orange-600',
    title: 'Quick Start Guide',
    description: 'Get your first interactive flipbook published in under 3 minutes.',
    steps: [
      'Upload a PDF or choose from our pre-designed templates.',
      'Customize your flipbook title, page thickness, and flip sounds.',
      'Add interactive 3D models, clickable links, or video hotspots.',
      'Click Publish to get a shareable link or embed snippet for your website.'
    ]
  },
  {
    id: 'editor',
    icon: Layers,
    color: 'bg-blue-50 text-blue-600',
    title: 'The Page Editor',
    description: 'Master the visual canvas to craft beautiful page layouts and typography.',
    steps: [
      'Use the Toolbar to add text headers, paragraphs, and custom typography.',
      'Upload high-resolution images and vector graphics directly to any page.',
      'Arrange layers, align elements, and configure responsive page layouts.',
      'Preview real-time flip animations in desktop and mobile viewports.'
    ]
  },
  {
    id: '3d',
    icon: Box,
    color: 'bg-emerald-50 text-emerald-600',
    title: '3D Models & Augmented Reality',
    description: 'Embed realistic 3D objects with orbit controls and lighting presets.',
    steps: [
      'Upload GLB, GLTF, or OBJ 3D model assets into your flipbook library.',
      'Position models on pages or configure popup interactive 3D overlays.',
      'Set auto-rotation, zoom levels, shadow intensity, and background HDR environments.',
      'Enable mobile AR mode so readers can inspect items in real-world space.'
    ]
  },
  {
    id: 'hotspots',
    icon: Link2,
    color: 'bg-purple-50 text-purple-600',
    title: 'Interactive Hotspots & Links',
    description: 'Turn static pages into engaging interactive experiences.',
    steps: [
      'Place pulsing hotspot markers anywhere on your catalog pages.',
      'Link hotspots to external URLs, shopping carts, or video popups.',
      'Configure tooltip text and hover animations for reader guidance.',
      'Track click-through metrics in your analytics dashboard.'
    ]
  },
  {
    id: 'security',
    icon: Shield,
    color: 'bg-rose-50 text-rose-600',
    title: 'Privacy & Password Protection',
    description: 'Control who can view, download, or share your publications.',
    steps: [
      'Set publications to Public, Private, or Password-Protected.',
      'Whitelist specific domains for embedded iframe viewers.',
      'Disable PDF downloads or print buttons to protect proprietary intellectual property.',
      'Generate secure, time-limited invitation links for VIP clients.'
    ]
  },
  {
    id: 'distribution',
    icon: Share2,
    color: 'bg-teal-50 text-teal-600',
    title: 'Sharing & Embedding',
    description: 'Distribute your flipbooks across social media, email newsletters, and websites.',
    steps: [
      'Copy responsive HTML iframe embed code for WordPress, Shopify, or Webflow.',
      'Generate QR codes for print magazines and conference banners.',
      'Share direct preview links with customized Open Graph social cards.',
      'Export standalone offline HTML packages for trade shows and exhibitions.'
    ]
  }
];

export default function Guide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(GUIDES[0]);

  const filteredGuides = GUIDES.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full bg-[#f8f9fb] text-slate-800 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1f2937] text-white py-12 px-6 md:px-12 border-b border-slate-700">
        <div className="max-w-6xl mx-auto space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#ec5137]/20 text-[#ff8166] border border-[#ec5137]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Documentation & Learning Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            FlipiBook User Guide
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl">
            Everything you need to know about creating, customizing, enhancing with 3D models, and publishing interactive digital flipbooks.
          </p>

          <div className="pt-2 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search guides, tutorials, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/10 text-white placeholder-slate-400 border border-white/20 rounded-xl focus:outline-none focus:border-[#ec5137] focus:ring-1 focus:ring-[#ec5137] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Guide Cards Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Core Topics</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => {
                const IconComponent = guide.icon;
                const isSelected = selectedGuide.id === guide.id;
                return (
                  <div
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#ec5137] shadow-md ring-2 ring-[#ec5137]/10'
                        : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-xl ${guide.color} flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-gray-900">{guide.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {guide.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#ec5137]">
                      <span>View walkthrough</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Video Resources Card */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Video Walkthroughs & Webinars</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Watch our step-by-step masterclasses on advanced 3D catalog design.
                  </p>
                </div>
              </div>
              <Link
                to="/forum"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#ec5137] bg-[#fff5f3] hover:bg-[#ffeae6] border border-[#ec5137]/20 transition-colors shrink-0"
              >
                Visit Community Forum
              </Link>
            </div>
          </div>

          {/* Right Selected Guide Detail */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedGuide.color} flex items-center justify-center shrink-0`}>
                  <selectedGuide.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">{selectedGuide.title}</h3>
                  <span className="text-[11px] text-gray-400 font-medium">Walkthrough & Steps</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedGuide.description}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Step-by-step</h4>
                <ol className="space-y-3">
                  {selectedGuide.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/my-flipbooks"
                  className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#ec5137] hover:bg-[#d4432c] shadow-sm transition-colors"
                >
                  Try in Flipbook Studio
                </Link>
                <Link
                  to="/help"
                  className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  Contact Help / Support
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
