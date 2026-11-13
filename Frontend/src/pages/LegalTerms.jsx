import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from './Footer';

export default function LegalTerms() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'services', title: '2. Description of Services' },
    { id: 'accounts', title: '3. User Accounts & Security' },
    { id: 'acceptable-use', title: '4. Acceptable Use Policy' },
    { id: 'ip-rights', title: '5. Intellectual Property' },
    { id: 'subscriptions', title: '6. Subscriptions & Billing' },
    { id: 'cancellation', title: '7. Cancellation & Termination' },
    { id: 'disclaimers', title: '8. Disclaimers & Limitations' },
    { id: 'governing-law', title: '9. Governing Law' },
    { id: 'contact', title: '10. Contact Information' },
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
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Please read these Terms and Conditions carefully before using the FlipiBook platform, websites, and associated services operated by Fisto Tech Private Limited.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-gray-400" />
                Last updated: November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-gray-400" />
                8 min read
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
                    <p className="font-semibold text-gray-800 mb-1">Need legal clarification?</p>
                    <p className="text-gray-600 mb-2 leading-relaxed">Our support team is happy to help answer any questions.</p>
                    <a
                      href="mailto:info@flipibook-o.com"
                      className="inline-flex items-center gap-1 text-[#EA7233] font-medium hover:underline"
                    >
                      <span>Contact Legal Team</span>
                      <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Articles - Expands full remaining width */}
            <article className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 lg:p-12 shadow-xs space-y-10 leading-relaxed text-sm sm:text-base text-gray-700">
              
              {/* Section 1 */}
              <section id="acceptance" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>Acceptance of Terms</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    By accessing, browsing, registering for, or using the services, applications, software, or websites provided by <strong>Fisto Tech Private Limited</strong> under the brand name <strong>FlipiBook</strong> (&quot;FlipiBook&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                  </p>
                  <p>
                    If you do not agree to all of these Terms, you are prohibited from using or accessing our platform and services. We reserve the right to revise or modify these Terms at any time with notice provided through the site or via email.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="services" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>Description of Services</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    FlipiBook offers an online platform that enables users to upload digital publications, PDFs, documents, audio, videos, and images to generate interactive digital flipbooks, 3D animated bookshelves, embeddable readers, customizable showcases, analytics dashboards, and related digital publishing solutions.
                  </p>
                  <p>
                    We continually improve the service and may introduce new features, modify existing features, or discontinue features with reasonable notice.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section id="accounts" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>User Accounts & Security</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    To access certain capabilities of FlipiBook, you must register for an account. When creating your account, you agree to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Provide accurate, current, and complete registration information.</li>
                    <li>Maintain and promptly update your account details.</li>
                    <li>Maintain the confidentiality of your password and credentials.</li>
                    <li>Accept full responsibility for all activities that occur under your account.</li>
                    <li>Notify us immediately at <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline">info@flipibook-o.com</a> if you discover any unauthorized use of your account.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section id="acceptable-use" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>Acceptable Use Policy</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    You agree not to use the platform for any unlawful purpose or in any way that violates these Terms. Specifically, you agree not to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Upload, publish, or distribute content that infringes upon third-party copyrights, trademarks, privacy, or proprietary rights.</li>
                    <li>Upload malicious software, viruses, Trojan horses, or harmful code.</li>
                    <li>Attempt to gain unauthorized access to our servers, infrastructure, or other user accounts.</li>
                    <li>Reverse-engineer, decompile, or copy the source code or proprietary rendering engines of FlipiBook.</li>
                    <li>Use automated scraping, crawling, or data harvesting bots on our services without explicit written consent.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="ip-rights" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">5</span>
                  <span>Intellectual Property</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    <strong>Your Content:</strong> You retain complete ownership and intellectual property rights in the content, publications, media, and files you upload to FlipiBook. By uploading content, you grant FlipiBook a worldwide, non-exclusive, royalty-free license solely to host, process, render, and display your publications according to your privacy and access settings.
                  </p>
                  <p>
                    <strong>FlipiBook IP:</strong> All proprietary software, graphics, user interface designs, bookshelf models, trademarks, logos, and rendering algorithms are the exclusive property of Fisto Tech Private Limited and its licensors.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="subscriptions" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">6</span>
                  <span>Subscriptions & Billing</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    FlipiBook offers both free tiers and paid subscription plans. By subscribing to a paid plan, you authorize FlipiBook and its payment processors to charge your selected payment method on a recurring billing cycle (monthly or annually) until cancelled.
                  </p>
                  <p>
                    All fees are non-refundable except where required by law or explicitly stated in a money-back guarantee policy. We reserve the right to adjust plan pricing upon prior notice.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="cancellation" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">7</span>
                  <span>Cancellation & Termination</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    You may cancel your subscription or delete your account at any time via your account settings. Upon cancellation, your paid benefits will remain accessible until the end of your current billing period.
                  </p>
                  <p>
                    FlipiBook reserves the right to suspend or terminate accounts that breach these Terms or engage in fraudulent, harmful, or abusive behavior without prior liability.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section id="disclaimers" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">8</span>
                  <span>Disclaimers & Limitation of Liability</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    The services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. FlipiBook does not guarantee uninterrupted, secure, or error-free operation at all times.
                  </p>
                  <p>
                    To the maximum extent permitted by applicable law, Fisto Tech Private Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the services.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section id="governing-law" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">9</span>
                  <span>Governing Law & Jurisdiction</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or relating to these Terms or the services shall be subject to the exclusive jurisdiction of the competent courts located in Coimbatore, Tamil Nadu, India.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section id="contact" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">10</span>
                  <span>Contact Information</span>
                </h2>
                <p className="text-gray-600 mb-4">
                  For questions or concerns regarding these Terms & Conditions, please contact us at:
                </p>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/70 text-xs sm:text-sm space-y-1.5 text-gray-700">
                  <p className="font-semibold text-gray-900">Fisto Tech Private Limited (FlipiBook)</p>
                  <p>Email: <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a></p>
                  <p>Phone: <a href="tel:+917530025147" className="text-[#EA7233] hover:underline font-medium">+91 75300 25147</a></p>
                  <p>Location: Coimbatore, Tamil Nadu, India</p>
                </div>
              </section>

              {/* Navigation Footer Inside Article */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Related documents:</span>
                  <Link to="/privacy-policy" className="text-[#EA7233] hover:underline font-medium">Privacy Policy</Link>
                  <span>•</span>
                  <Link to="/cookie-policy" className="text-[#EA7233] hover:underline font-medium">Cookie Policy</Link>
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
