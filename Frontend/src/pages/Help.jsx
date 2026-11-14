import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Plus,
  X,
  BookOpen, 
  Layers, 
  Box, 
  Share2, 
  CreditCard, 
  LifeBuoy, 
  Mail, 
  Phone,
  Clock,
  Send,
  CheckCircle2,
  ArrowRight, 
  ExternalLink,
  FileQuestion,
  Lock
} from 'lucide-react';
import Footer from './Footer';

export default function Help() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Sidebar FAQ Categories matching screenshot
  const faqCategories = [
    { id: 'getting-started', title: 'General Questions' },
    { id: 'editor', title: 'Page Editor & Interactivity' },
    { id: '3d-ar', title: '3D Studio & AR' },
    { id: 'sharing', title: 'Publishing & Embedding' },
    { id: 'privacy', title: 'Privacy & Security' },
    { id: 'billing', title: 'Subscriptions & Billing' },
  ];

  // Contact Form State
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Smooth scroll to #contact when linked from Let's Talk button
  useEffect(() => {
    if (location.hash === '#contact' || location.search.includes('contact')) {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('contact');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
      return () => clearTimeout(scrollTimer);
    }
  }, [location.hash, location.search, location.pathname]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactFormData.name || !contactFormData.email || !contactFormData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 600);
  };

  // Quick Help Categories
  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      color: 'bg-orange-50 text-[#EC5137] border-orange-200',
      description: 'Upload your first PDF, choose templates, and understand the basic flipbook workflow.',
    },
    {
      id: 'editor',
      title: 'Page Editor & Interactivity',
      icon: Layers,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      description: 'Add clickable links, video embeds, audio clips, interactive hotspots, and tooltips.',
    },
    {
      id: '3d-ar',
      title: '3D Studio & AR',
      icon: Box,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      description: 'Interactive 3D page flip effects, GLB/OBJ 3D models, and mobile Augmented Reality preview.',
    },
    {
      id: 'sharing',
      title: 'Sharing & Embedding',
      icon: Share2,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      description: 'Embed on WordPress, Shopify, or any site, share via link, QR code, or social media.',
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Lock,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      description: 'Password protection, private links, disable downloads, and copyright settings.',
    },
    {
      id: 'billing',
      title: 'Billing & Account',
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      description: 'Manage subscription plans, invoices, custom domains, and workspace profiles.',
    },
  ];

  // Comprehensive FAQs
  const allFaqs = [
    {
      category: 'getting-started',
      question: 'What file formats can I upload to create a flipbook?',
      answer: 'FlipiBook supports PDF, DOCX, PPTX, and high-resolution image sets (PNG, JPG, WebP). Once uploaded, our cloud conversion engine automatically processes each page into vector-crisp, fast-loading digital flipbook pages.'
    },
    {
      category: 'getting-started',
      question: 'How do I create my first flipbook from a PDF?',
      answer: 'Click "Upload" or "Create Flipbook" from your dashboard or top navigation, select your document file, and wait a few moments for conversion. Once converted, you can preview the 3D flipping animation, customize page layouts, and publish instantly.'
    },
    {
      category: 'getting-started',
      question: 'Can I reorder, add, or delete pages after uploading?',
      answer: 'Yes! Open your book in the Page Editor, open the page thumbnail manager on the left panel, and you can drag to reorder pages, duplicate pages, delete unwanted pages, or insert new blank and template pages.'
    },
    {
      category: 'editor',
      question: 'How do I add clickable links, videos, and shopping hotspots?',
      answer: 'In the Page Editor, open the Interaction panel from the toolbar. You can place clickable hotspots anywhere on the page and configure actions such as: Open Web URL, Go to Page, Play YouTube/Vimeo video, Show Popup modal, or Display a 3D model.'
    },
    {
      category: 'editor',
      question: 'Can I add background music or page audio effects?',
      answer: 'Yes. In the Customized Editor settings, you can toggle realistic page-flip sound effects, upload ambient background music with loop controls, or attach individual audio narrations to specific pages.'
    },
    {
      category: 'editor',
      question: 'What animations can I add to page elements?',
      answer: 'Our Animation engine allows you to apply entrance, loop, and exit animations (such as Fade, Slide, Zoom, Bounce, Pulse, and Flip) to images, text blocks, and interactive icons.'
    },
    {
      category: '3d-ar',
      question: 'How does the 3D Studio and AR (Augmented Reality) view work?',
      answer: 'FlipiBook renders pages with realistic physics-based lighting, page curvature, and paper thickness. You can import 3D models (.glb/.gltf) into your pages, and readers on compatible mobile devices can tap the AR icon to view the model directly in their real environment.'
    },
    {
      category: '3d-ar',
      question: 'What 3D model formats are supported?',
      answer: 'We support standard .glb and .gltf formats with embedded textures and animations. We recommend keeping 3D file sizes under 25MB for lightning-fast mobile loading.'
    },
    {
      category: 'sharing',
      question: 'How do I embed my flipbook into my website (WordPress, Shopify, etc.)?',
      answer: 'Click "Share" on any published flipbook and switch to the "Embed" tab. Copy the provided responsive HTML <iframe> code and paste it into your CMS, website builder, or blog post. You can customize the embed width, height, and autoplay options.'
    },
    {
      category: 'sharing',
      question: 'Can I share my flipbook on social media or via QR code?',
      answer: 'Yes. The Share dialog provides direct share links for LinkedIn, Twitter/X, Facebook, WhatsApp, and email, along with an auto-generated high-resolution QR code that you can download and print on flyers or business cards.'
    },
    {
      category: 'privacy',
      question: 'Can I password-protect my flipbooks?',
      answer: 'Yes. In the flipbook privacy settings, you can enable Password Protection. When enabled, viewers must enter the designated password before accessing or viewing the pages.'
    },
    {
      category: 'privacy',
      question: 'Can I prevent readers from downloading or printing my PDF?',
      answer: 'Yes. In the book viewer toolbar settings, you can freely toggle the Download PDF, Print, Share, and Fullscreen buttons on or off according to your copyright preferences.'
    },
    {
      category: 'billing',
      question: 'Can I use FlipiBook for free?',
      answer: 'Yes! Our Free plan provides full access to core visual editing, realistic 3D flip effects, and up to 5 flipbooks with no credit card required.'
    },
    {
      category: 'billing',
      question: 'Can I remove FlipiBook branding and use my own custom domain?',
      answer: 'Yes. Upgraded plans allow you to remove all default FlipiBook logos, customize the viewer loader with your company branding, and connect your own custom domain (e.g., catalog.yourbrand.com).'
    },
    {
      category: 'billing',
      question: 'How do I upgrade or manage my subscription?',
      answer: 'Navigate to Settings > Billing and Invoice from your profile menu to view current plan limits, upgrade to higher tiers, update payment methods, or download past tax invoices.'
    },
    {
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), PayPal, and direct wire transfer invoicing for corporate annual plans.'
    }
  ];

  // Filter FAQs based on search and selected category
  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch = 
        !searchQuery.trim() ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allFaqs, selectedCategory, searchQuery]);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(prev => (prev === catId ? 'all' : catId));
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between selection:bg-[#EC5137] selection:text-white">
      
      {/* Hero & Search Header */}
      <section className="relative bg-gradient-to-br from-[#101726] via-[#1a2333] to-[#0d131f] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            How can we help you today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Search our guides, explore step-by-step tutorials, or browse answers to frequently asked questions about creating interactive flipbooks.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, topics, or features..."
                className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white text-slate-100 focus:text-gray-900 placeholder:text-slate-400 focus:placeholder:text-gray-400 border border-slate-700 focus:border-[#EC5137] outline-hidden text-xs sm:text-sm backdrop-blur-md transition-all shadow-md focus:ring-2 focus:ring-[#EC5137]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Keyword Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs text-slate-400">
              <span className="font-medium text-slate-400">Popular:</span>
              {['Upload PDF', 'Page Editor', '3D & AR', 'Embed Code', 'Password', 'Custom Domain'].map((pill) => (
                <button
                  key={pill}
                  onClick={() => setSearchQuery(pill)}
                  className="px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subtle Background Glow Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-[#EC5137]/10 rounded-full blur-[90px] pointer-events-none" />
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12 flex-1 w-full space-y-12 sm:space-y-16">

        {/* Category Cards Section - aligned with max-w-6xl like FAQ */}
        <section className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Browse by Topic
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                Select a category to filter answers and find relevant instructions.
              </p>
            </div>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs sm:text-sm font-semibold text-[#EC5137] hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-[#EC5137] shadow-md ring-2 ring-[#EC5137]/15'
                      : 'bg-white border-gray-200/80 hover:border-gray-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`p-2 rounded-xl border ${cat.color} transition-transform group-hover:scale-105`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h3 className={`text-sm sm:text-base font-semibold transition-colors ${isSelected ? 'text-[#EC5137]' : 'text-gray-900 group-hover:text-[#EC5137]'}`}>
                      {cat.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="mt-3.5 flex items-center gap-1.5 text-xs font-semibold text-[#EC5137]">
                    <span>{isSelected ? 'Viewing topic' : 'Explore topic'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* Frequently Asked Questions (FAQ) Section */}
        <section id="faqs" className="scroll-mt-8">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <span className="text-xs font-bold text-[#EC5137] uppercase tracking-wider">
              Common Questions
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
              Everything you need to know about FlipiBook features, publishing, and subscriptions.
            </p>
          </div>

          {/* 2-Column FAQ Layout Matching Reference: Left Category Pills + Right Accordions */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Category Navigation Cards */}
            <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
              {faqCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setOpenFaqIndex(0);
                    }}
                    className={`w-full px-5 py-4 rounded-xl sm:rounded-2xl text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-gray-900 font-semibold shadow-xs border border-gray-200/90 ring-1 ring-black/5'
                        : 'bg-white/70 hover:bg-white text-gray-500 hover:text-gray-800 border border-gray-100 hover:border-gray-200 font-medium'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{cat.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                        isSelected ? 'text-gray-800 translate-x-0.5' : 'text-gray-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Accordion Questions with + and ✕ */}
            <div className="lg:col-span-8 space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className={`rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isOpen
                          ? 'bg-white border-gray-200 shadow-xs'
                          : 'bg-white border-gray-200/80 hover:border-gray-300 hover:shadow-2xs'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full px-5 sm:px-6 py-4 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-hidden"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                          {faq.question}
                        </span>
                        <div
                          className={`p-1 rounded-md transition-colors duration-200 shrink-0 mt-0.5 ${
                            isOpen ? 'text-gray-700 bg-gray-100' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {isOpen ? (
                            <X className="w-4 h-4 stroke-[2.2]" />
                          ) : (
                            <Plus className="w-4 h-4 stroke-[2.2]" />
                          )}
                        </div>
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100/80">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-6">
                  <FileQuestion className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800">No questions found</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-4">
                    No questions matching your search in this category.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('getting-started'); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EC5137] text-white hover:bg-[#d9442b] transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Still Need Help? Contact Cards - aligned with max-w-6xl like FAQ */}
        <section className="text-center pt-4 max-w-6xl mx-auto w-full">
          <div className="max-w-xl mx-auto mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Still Need Assistance?
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
              Can't find what you're looking for? Our team is here to support you at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {/* Ticket Support */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 text-center hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EC5137] flex items-center justify-center mx-auto mb-3 border border-orange-100">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  Support Tickets
                </h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Submit a query and track ticket status directly inside your dashboard.
                </p>
              </div>
              <Link
                to="/settings/tickets"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#EC5137] text-white hover:bg-[#d9442b] text-xs font-semibold transition-colors shadow-2xs"
              >
                <span>Open a Ticket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Video & Documentation Guide */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 text-center hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  User Guide
                </h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Browse detailed feature documentation, walkthroughs, and specifications.
                </p>
              </div>
              <Link
                to="/guide"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-xs font-semibold transition-colors shadow-2xs"
              >
                <span>View User Guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Email Support */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 text-center hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 border border-purple-100">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  Direct Email
                </h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Reach our customer support team directly for enterprise inquiries.
                </p>
              </div>
              <a
                href="mailto:info@flipibook-o.com"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                <span>info@flipibook-o.com</span>
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Contact Form Section - aligned with max-w-6xl like FAQ */}
        <section id="contact" className="scroll-mt-10 pt-4 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-bold text-[#EC5137] uppercase tracking-wider">
              Get in Touch
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Let's Talk
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
              Have questions about features, enterprise plans, or custom solutions? Fill out the form below and our team will get back to you within 24 hours.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs max-w-6xl mx-auto overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              
              {/* Left Column: Contact Information */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                    Contact Information
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    Reach out to us directly or send a message using the form.
                  </p>

                  <div className="space-y-4 text-xs sm:text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[#EC5137]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">Email Us</p>
                        <a href="mailto:info@flipibook-o.com" className="text-white hover:text-[#EC5137] transition-colors break-all">
                          info@flipibook-o.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[#EC5137]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">Call Us</p>
                        <a href="tel:+917530025147" className="text-white hover:text-[#EC5137] transition-colors">
                          +91 75300 25147
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[#EC5137]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">Support Hours</p>
                        <p className="text-slate-300 text-xs">Mon – Sat, 9:00 AM – 7:00 PM IST</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700/80">
                  <p className="text-[11px] text-slate-400">Company</p>
                  <p className="text-xs font-semibold text-white mt-0.5">Fisto Tech Private Limited</p>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="lg:col-span-3 p-6 sm:p-8">
                {formSubmitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 max-w-sm mb-5 leading-relaxed">
                      Thank you for contacting us. A team member will respond to <span className="font-semibold text-gray-800">{contactFormData.email}</span> within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSubmitted(false);
                        setContactFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Your Name <span className="text-[#EC5137]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={contactFormData.name}
                          onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-[#EC5137] focus:ring-2 focus:ring-[#EC5137]/15 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Email Address <span className="text-[#EC5137]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={contactFormData.email}
                          onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                          placeholder="you@company.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-[#EC5137] focus:ring-2 focus:ring-[#EC5137]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Inquiry Topic
                      </label>
                      <select
                        value={contactFormData.subject}
                        onChange={(e) => setContactFormData({ ...contactFormData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-800 focus:outline-hidden focus:border-[#EC5137] focus:ring-2 focus:ring-[#EC5137]/15 transition-all cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Enterprise & Sales">Enterprise & Custom Solutions</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Billing & Invoicing">Billing & Subscriptions</option>
                        <option value="Feature Request">Feature Suggestion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Message <span className="text-[#EC5137]">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={contactFormData.message}
                        onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                        placeholder="Tell us what you need help with..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-[#EC5137] focus:ring-2 focus:ring-[#EC5137]/15 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#EC5137] hover:bg-[#d9442b] disabled:bg-[#EC5137]/60 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}
