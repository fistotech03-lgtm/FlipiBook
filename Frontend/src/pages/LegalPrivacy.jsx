import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from './Footer';

export default function LegalPrivacy() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: '1. Overview & Commitment' },
    { id: 'information-collect', title: '2. Information We Collect' },
    { id: 'how-we-use', title: '3. How We Use Information' },
    { id: 'sharing-disclosure', title: '4. Information Sharing & Disclosure' },
    { id: 'data-security', title: '5. Data Security & Storage' },
    { id: 'retention', title: '6. Data Retention' },
    { id: 'user-rights', title: '7. Your Privacy Rights' },
    { id: 'children', title: '8. Children’s Privacy' },
    { id: 'transfers', title: '9. International Data Transfers' },
    { id: 'updates', title: '10. Changes to this Policy' },
    { id: 'contact', title: '11. Contact Us' },
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
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              At FlipiBook, operated by Fisto Tech Private Limited, we are committed to safeguarding your personal data, publication content, and privacy rights across our platform.
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-gray-400" />
                Last updated: November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-gray-400" />
                7 min read
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
                    <p className="font-semibold text-gray-800 mb-1">Your privacy questions</p>
                    <p className="text-gray-600 mb-2 leading-relaxed">Reach our Data Protection Officer for any inquiries or data requests.</p>
                    <a
                      href="mailto:info@flipibook-o.com"
                      className="inline-flex items-center gap-1 text-[#EA7233] font-medium hover:underline"
                    >
                      <span>Email Privacy Officer</span>
                      <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Articles - Expands full remaining width */}
            <article className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 lg:p-12 shadow-xs space-y-10 leading-relaxed text-sm sm:text-base text-gray-700">
              
              {/* Section 1 */}
              <section id="overview" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>Overview & Commitment</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    This Privacy Policy explains how <strong>Fisto Tech Private Limited</strong> (&quot;FlipiBook&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, protects, and discloses information when you use our websites, web applications, 3D bookshelf showcases, reader views, and associated digital publishing tools.
                  </p>
                  <p>
                    We never sell your personal data. We are dedicated to transparency, user autonomy, and implementing robust privacy practices aligned with global data protection standards (including GDPR, CCPA, and Indian digital personal data regulations).
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="information-collect" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>Information We Collect</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>We collect several categories of information to deliver and enhance our services:</p>
                  <div className="space-y-3 pl-1">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">A. Information You Provide Directly</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Account creation details (full name, email address, password), billing contact info, profile photos, brand logos, support tickets, and direct feedback messages.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">B. Publication Content & Media</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Files you upload including PDFs, audio recordings, video clips, 3D models, images, custom layout configurations, titles, descriptions, and bookshelf shelf organization data.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">C. Automatically Collected Technical Data</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Device type, browser configuration, IP address, referral URLs, operating system, page view timestamps, reading duration, and viewer engagement metrics for analytics.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="how-we-use" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>How We Use Your Information</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>We use the collected information for specific, legitimate business purposes:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>To render, convert, host, and display your digital flipbooks and 3D bookshelves smoothly.</li>
                    <li>To authenticate your login credentials and secure your account.</li>
                    <li>To process subscription payments and issue accurate tax receipts.</li>
                    <li>To calculate reader analytics (such as page views, reading time, and geographical reach) shown in your creator dashboard.</li>
                    <li>To respond to customer support requests and troubleshoot technical issues.</li>
                    <li>To prevent fraud, spam, malicious code distribution, and unauthorized system access.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section id="sharing-disclosure" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>Information Sharing & Disclosure</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    We do not sell, rent, or trade your personal data. We only share information under strict and defined conditions:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Trusted Service Providers:</strong> Verified third-party cloud infrastructure (e.g. AWS, MongoDB Atlas, Cloudflare CDN) and payment gateways operating under confidentiality agreements.</li>
                    <li><strong>Public Showcases:</strong> Flipbooks or bookshelves that you explicitly set to &quot;Public&quot; access are accessible to viewers via their public URLs or embedded widgets.</li>
                    <li><strong>Legal Obligations:</strong> When required by applicable law, court summons, judicial order, or government regulation.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="data-security" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">5</span>
                  <span>Data Security & Storage</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    We implement industry-standard administrative, physical, and technical safeguards to protect your personal data and uploaded content. All network transmissions are secured via TLS 1.3 encryption (HTTPS), and databases are encrypted at rest with regular automated backups.
                  </p>
                  <p>
                    While we maintain rigorous security protocols, no method of transmission over the Internet or electronic storage is completely impenetrable. We encourage users to maintain strong passwords and protect their login credentials.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="retention" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">6</span>
                  <span>Data Retention</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    We retain your personal data for as long as your account remains active or as needed to provide you with the services. If you delete your account or specific flipbooks, the content will be permanently removed from our active databases within 30 days, subject to standard backup cycle purges and legal compliance requirements.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="user-rights" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">7</span>
                  <span>Your Privacy Rights</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>Depending on your location, you hold key rights regarding your personal information:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
                    <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete details.</li>
                    <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request full deletion of your account and files.</li>
                    <li><strong>Right to Data Portability:</strong> Export your uploaded flipbook files and metadata.</li>
                    <li><strong>Opt-Out of Marketing:</strong> Unsubscribe from promotional email newsletters at any time.</li>
                  </ul>
                  <p className="pt-1">
                    To exercise any of these rights, contact our privacy team at <a href="mailto:info@flipibook-o.com" className="text-[#EA7233] hover:underline font-medium">info@flipibook-o.com</a>.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section id="children" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">8</span>
                  <span>Children’s Privacy</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    Our services are not directed to individuals under the age of 13 (or under 16 where required by local law). We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete it promptly.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section id="transfers" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">9</span>
                  <span>International Data Transfers</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    FlipiBook operates globally. Your information may be processed and hosted on servers located outside of your country of residence. Where transfers occur, we implement suitable safeguards such as Standard Contractual Clauses to guarantee your data receives comparable protection.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section id="updates" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">10</span>
                  <span>Changes to this Privacy Policy</span>
                </h2>
                <div className="space-y-3.5 text-gray-600">
                  <p>
                    We may update this Privacy Policy periodically to reflect changes in our operational practices or legal duties. When modifications occur, the updated policy will be posted with an updated &quot;Last updated&quot; date at the top of this page.
                  </p>
                </div>
              </section>

              {/* Section 11 */}
              <section id="contact" className="scroll-mt-6 pt-4 border-t border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#EA7233] flex items-center justify-center text-xs font-bold shrink-0">11</span>
                  <span>Contact Us</span>
                </h2>
                <p className="text-gray-600 mb-4">
                  For any privacy inquiries, data deletion requests, or questions about how we handle your information, please reach out to:
                </p>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/70 text-xs sm:text-sm space-y-1.5 text-gray-700">
                  <p className="font-semibold text-gray-900">Data Protection Officer — Fisto Tech Private Limited (FlipiBook)</p>
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
