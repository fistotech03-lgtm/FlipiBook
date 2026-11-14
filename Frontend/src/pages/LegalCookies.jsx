import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from './Footer';

export default function LegalCookies() {
  const [activeSection, setActiveSection] = useState('what-are-cookies');

  const sections = [
    { id: 'what-are-cookies', title: '1. What Are Cookies?' },
    { id: 'how-we-use', title: '2. How We Use Cookies' },
    { id: 'types-of-cookies', title: '3. Categories of Cookies We Use' },
    { id: 'local-storage', title: '4. Local & Session Storage' },
    { id: 'third-party', title: '5. Third-Party Technologies' },
    { id: 'managing-cookies', title: '6. Managing & Disabling Cookies' },
    { id: 'policy-updates', title: '7. Updates to this Policy' },
    { id: 'contact', title: '8. Contact Information' },
  ];

  // Active section scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-60px 0px -65% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between">
      <main className="w-full flex-1">
        {/* Hero Section */}
        <div className="relative w-full bg-gradient-to-b from-orange-50/50 via-white to-transparent border-b border-gray-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
          <div className="w-full max-w-[1920px] mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Cookie Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Learn how FlipiBook uses cookies, local storage, and similar technologies to deliver, customize, and improve your interactive flipbook experience.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-gray-400" />
                Last updated: November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-gray-400" />
                6 min read
              </span>
            </div>
          </div>
        </div>

        {/* Content Container - Edge-to-edge with no wide side gaps */}
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">
            {/* Left Sticky Table of Contents - Stays glued to viewport during scroll */}
            <aside className="w-full lg:w-[280px] xl:w-[320px] shrink-0 hidden lg:block sticky top-4 self-start z-10">
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs max-h-[calc(100vh-3.5rem)] overflow-y-auto custom-scrollbar flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                    Table of Contents
                  </h3>
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const isSelected = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50 text-[#EA7233] font-semibold shadow-2xs'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <span className="truncate">{section.title}</span>
                          {isSelected && (
                            <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5 text-[#EA7233] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="bg-orange-50/50 rounded-xl p-3.5 border border-orange-100 text-xs">
                    <p className="font-semibold text-gray-800 mb-1">Manage preferences</p>
                    <p className="text-gray-600 mb-2 leading-relaxed">You can modify cookie settings in your browser at any time.</p>
                    <a
                      href="mailto:info@flipibook-o.com"
                      className="inline-flex items-center gap-1 text-[#EA7233] font-medium hover:underline"
                    >
                      <span>Questions about Cookies?</span>
                      <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Articles - Expands full remaining width */}
            <article className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 lg:p-12 shadow-xs space-y-10 leading-relaxed text-sm sm:text-base text-gray-700">
              
              {/* Section 1 */}
              <section id="what-are-cookies" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>What Are Cookies?</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    Cookies are small text files that are placed and stored on your computer, smartphone, or tablet when you visit websites or web applications. They are widely used to make web experiences run smoothly, remember user preferences, maintain active login sessions, and provide aggregate analytical insights to service operators.
                  </p>
                  <p>
                    Along with standard cookies, we also use browser local storage, session storage, and web pixels to support interactive 3D bookshelf rendering and book reading continuity.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="how-we-use" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>How We Use Cookies</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    <strong>Fisto Tech Private Limited</strong> (&quot;FlipiBook&quot;) uses cookies and related technologies for several critical purposes:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Keeping you logged in safely across page navigations without re-entering credentials.</li>
                    <li>Remembering your personalized shelf styles, bookshelf lighting presets, and sound volume preferences.</li>
                    <li>Tracking reading positions so readers can resume from their last visited page.</li>
                    <li>Measuring reader engagement (page views, reading duration, device types) on published flipbooks.</li>
                    <li>Safeguarding our platform against CSRF attacks, bot manipulation, and abusive requests.</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section id="types-of-cookies" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>Categories of Cookies We Use</span>
                </h2>
                <div className="space-y-4">
                  {/* Category 1 */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">A. Strictly Necessary Cookies</h4>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-800">Essential</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      These cookies are essential for our website to function and cannot be switched off in our systems. They manage user authentication, session security, API routing, and protect forms from unauthorized forgery.
                    </p>
                  </div>

                  {/* Category 2 */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">B. Functionality & Preference Cookies</h4>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">Preferences</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      These allow FlipiBook to remember your personalized settings—such as preferred bookshelf theme, lamp lighting brightness, background music volume, page flip sound effects, and viewer layout choices.
                    </p>
                  </div>

                  {/* Category 3 */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">C. Performance & Analytics Cookies</h4>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">Analytics</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      These help us understand how creators and visitors interact with FlipiBook by collecting aggregated, anonymous data on popular templates, flipbook loading speeds, page reading times, and error occurrences.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section id="local-storage" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>Local & Session Storage</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    In addition to traditional cookies, FlipiBook uses HTML5 Local Storage and Session Storage. These technologies store data directly on your device rather than sending it with every server request, making the application significantly faster and more responsive:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Shelf Customizations:</strong> Caching active shelf styles, decor placement, and temporary unsaved drafts.</li>
                    <li><strong>Page Editor States:</strong> Autosaving changes during flipbook editing to protect against accidental browser closing.</li>
                    <li><strong>Audio/Video Playback State:</strong> Remembering mute/unmute and volume settings during book presentation.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="third-party" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">5</span>
                  <span>Third-Party Technologies</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    Some interactive features and embeds in FlipiBook rely on third-party services (such as YouTube or Vimeo video embeds, Google Fonts, and Cloudflare CDN caching). These third parties may set their own cookies when you view flipbooks containing their elements.
                  </p>
                  <p>
                    We do not control third-party cookies; we recommend reviewing the privacy and cookie policies of those respective services for detailed guidance.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="managing-cookies" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">6</span>
                  <span>Managing & Disabling Cookies</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    You have the right to decide whether to accept or reject cookies. Most web browsers automatically accept cookies by default, but you can modify your browser settings to decline cookies or alert you when a cookie is placed:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <p className="font-semibold text-gray-800 mb-0.5">Google Chrome</p>
                      <p className="text-gray-500">Settings → Privacy & Security → Third-party cookies</p>
                    </div>
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <p className="font-semibold text-gray-800 mb-0.5">Apple Safari</p>
                      <p className="text-gray-500">Preferences → Privacy → Block all cookies</p>
                    </div>
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <p className="font-semibold text-gray-800 mb-0.5">Mozilla Firefox</p>
                      <p className="text-gray-500">Settings → Privacy & Security → Enhanced Tracking Protection</p>
                    </div>
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <p className="font-semibold text-gray-800 mb-0.5">Microsoft Edge</p>
                      <p className="text-gray-500">Settings → Cookies and site permissions → Manage cookies</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 pt-1">
                    <em>Please note: Disabling essential cookies may impair your ability to log in, customize bookshelves, or view certain interactive flipbook features.</em>
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="policy-updates" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">7</span>
                  <span>Updates to this Cookie Policy</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    We may update this Cookie Policy from time to time to reflect modifications in the cookies we use or for legal and regulatory reasons. Please revisit this page regularly to stay informed about our use of cookies and related technologies.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section id="contact" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">8</span>
                  <span>Contact Information</span>
                </h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions or feedback regarding our Cookie Policy, please contact us at:
                </p>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/70 text-xs sm:text-sm space-y-1.5 text-gray-700">
                  <p className="font-semibold text-gray-900">Fisto Tech Private Limited (FlipiBook)</p>
                  <p>Email: <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a></p>
                  <p>Phone: <a href="tel:+917530025147" className="text-[#EA7233] hover:underline font-medium">+91 75300 25147</a></p>
                  <p>Address: Coimbatore, Tamil Nadu, India</p>
                </div>
              </section>

              {/* Navigation Footer Inside Article */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Related documents:</span>
                  <Link to="/terms-and-conditions" className="text-[#EA7233] hover:underline font-medium">Terms & Conditions</Link>
                  <span>•</span>
                  <Link to="/privacy-policy" className="text-[#EA7233] hover:underline font-medium">Privacy Policy</Link>
                </div>
                <Link to="/" className="inline-flex items-center gap-1.5 text-gray-700 hover:text-[#EA7233] font-medium transition-colors">
                  <Icon icon="lucide:arrow-left" className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
              </div>

            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
