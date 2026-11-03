import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "1. How do I create a digital catalogue with FlipiBook?",
      answer: "Upload your PDF or start with a ready-made template. Customize your pages, add interactive content, and publish your catalogue to share with customers."
    },
    {
      question: "2. Can I alter the layout of my catalog?",
      answer: "Yes. Edit page layouts, organize your content, and personalize colors, backgrounds, and branding to match your business."
    },
    {
      question: "3. Can I add videos and 3D product models?",
      answer: "Yes. Add product videos, audio, 3D models, and clickable hotspots to help customers understand your products. Custom 3D modeling and animation are charged separately."
    },
    {
      question: "4. Can customers rotate products and view them in AR?",
      answer: "Customers can rotate and zoom in on interactive 3D models. AR lets them visualize products in their surroundings using a compatible device and an AR-ready model."
    },
    {
      question: "5. How can I share my digital catalogue?",
      answer: "Share your catalogue link through WhatsApp, email, or social media. You can also use a QR code or embed the catalogue on your website."
    },
    {
      question: "6. Can I track catalogue views and collect enquiries?",
      answer: "FlipiBook offers viewer statistics to help you understand catalogue engagement. Lead capture forms give interested customers a way to share their details and contact your team."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
      transition={{ duration: 0.8 }}
      className="w-full bg-white py-14 lg:py-[5.5vw] px-4 sm:px-8 lg:px-[6vw] font-poppins border-t border-gray-100"
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[4vw] items-start">
        
        {/* Left Side: Header & Desktop CTA */}
        <div className="lg:col-span-5 flex flex-col justify-between self-stretch">
          <div>
            {/* Tagline */}
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 lg:mb-[0.8vw]">
              <span className="text-[10px] sm:text-xs lg:text-[0.68vw] font-bold tracking-[0.22em] text-[#EC5137] uppercase">
                FAQ
              </span>
              <div className="w-8 sm:w-10 lg:w-[2vw] h-[1.5px] bg-[#EC5137]/35"></div>
            </div>

            {/* Title */}
            <h2 className="text-[34px] sm:text-4xl lg:text-[2.6vw] font-bold text-[#1b222c] tracking-tight leading-tight mb-2.5 sm:mb-3">
              Common Questions  <br />About <span className="text-[#EC5137]">FlipiBook</span>
            </h2>

            <p className="text-xs sm:text-sm lg:text-[0.9vw] text-gray-500 font-normal leading-relaxed mb-4 lg:mb-[3vw] lg:max-w-[22vw]">
              Learn how to create, customize, and share your interactive digital catalogue.
            </p>
          </div>

          {/* Desktop-only Bottom Left CTA (Hidden on mobile and tab) */}
          <div className="hidden lg:block pt-6 sm:pt-7 border-t border-gray-100 mt-auto">
            <h4 className="text-base sm:text-lg lg:text-[1.1vw] font-semibold text-[#1b222c] tracking-tight mb-1">
              Still have questions?
            </h4>
            <p className="text-xs sm:text-[13.5px] lg:text-[0.88vw] text-gray-500 font-normal leading-relaxed mb-4">
              Let’s discuss how FlipiBook can work for your products.
            </p>
            <button
              type="button"
              onClick={() => {
                const footerEl = document.querySelector('footer');
                if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
                else window.location.href = 'mailto:info@flipibook-o.com';
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 bg-[#EC5137] hover:bg-[#d8432a] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium active:scale-95 transition-all duration-200 group cursor-pointer shadow-sm"
            >
              <Icon icon="lucide:messages-square" className="w-4 h-4 shrink-0" />
              <span>Contact Our Team</span>
              <Icon icon="lucide:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Side: Accordion list */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4 lg:gap-[1vw]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-30px 0px -30px 0px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => toggleFAQ(index)}
                className={`bg-white border rounded-xl p-4 sm:p-5 lg:p-[1.2vw] cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md ${
                  isOpen ? 'border-[#ea7233]/50 ring-1 ring-[#ea7233]/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Question Header Row */}
                <div className="flex items-center justify-between gap-3">
                  <h3 className={`text-xs sm:text-sm lg:text-[0.95vw] font-medium text-left transition-colors duration-200 ${
                    isOpen ? 'text-[#ea7233]' : 'text-[#1b222c]'
                  }`}>
                    {faq.question}
                  </h3>
                  <Icon
                    icon="lucide:chevron-right"
                    className={`w-4 h-4 lg:w-[1.1vw] lg:h-[1.1vw] transition-transform duration-300 text-gray-400 shrink-0 ${
                      isOpen ? 'rotate-90 text-[#ea7233]' : ''
                    }`}
                  />
                </div>

                {/* Answer Content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs lg:text-[0.82vw] text-gray-500 font-normal leading-relaxed text-left pt-2.5 border-t border-gray-100 mt-2.5">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile & Tablet CTA: Placed at the very end after all accordion items */}
        <div className="block lg:hidden w-full pt-6 border-t border-gray-100 mt-2 text-left">
          <h4 className="text-base sm:text-lg font-semibold text-[#1b222c] tracking-tight mb-1">
            Still have questions?
          </h4>
          <p className="text-xs sm:text-[13.5px] text-gray-500 font-normal leading-relaxed mb-4">
            Let’s discuss how FlipiBook can work for your products.
          </p>
          <button
            type="button"
            onClick={() => {
              const footerEl = document.querySelector('footer');
              if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
              else window.location.href = 'mailto:info@flipibook-o.com';
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 bg-[#EC5137] hover:bg-[#d8432a] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium active:scale-95 transition-all duration-200 group cursor-pointer shadow-sm"
          >
            <Icon icon="lucide:messages-square" className="w-4 h-4 shrink-0" />
              <span>Contact Our Team</span>
            <Icon icon="lucide:arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </motion.section>
  );
}
