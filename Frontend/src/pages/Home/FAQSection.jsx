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
    <motion.section initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-50px 0px -50px 0px" }} transition={{ duration: 0.8 }} className="w-full bg-white py-14 lg:py-[5.5vw] px-4 sm:px-8 lg:px-[6vw] flex flex-col items-center justify-center font-poppins border-t border-gray-100">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="text-center w-full max-w-xl lg:max-w-[60vw] mb-8 lg:mb-[3.5vw] space-y-2"
      >
        <h2 className="text-2xl sm:text-4xl lg:text-[2.8vw] font-bold text-[#1b222c] tracking-tight leading-tight">
          Common Questions About <br />
          <span className="text-[#ea7233]">FlipiBook</span>
        </h2>
        <p className="text-xs sm:text-sm lg:text-[0.9vw] text-gray-500 font-normal leading-relaxed">
          Learn how to create, customize, and share your interactive digital catalogue.
        </p>
      </motion.div>

      {/* 2-Column FAQ Grid with Staggered Entrance */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-start">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
              transition={{ duration: 0.75, delay: (index % 4) * 0.12, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => toggleFAQ(index)}
              className={`bg-white border rounded-xl p-4 lg:p-[1.2vw] cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md ${
                isOpen ? 'border-[#ea7233]/50 ring-1 ring-[#ea7233]/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Question Header Row */}
              <div className="flex items-center justify-between gap-3">
                <h3 className={`text-xs sm:text-sm lg:text-[0.95vw] font-semibold text-left transition-colors duration-200 ${
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

      {/* Bottom Still Have Questions CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-50px 0px -50px 0px" }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 sm:mt-12 lg:mt-[3.5vw] flex flex-col items-center text-center space-y-3"
      >
        <h4 className="text-base sm:text-lg lg:text-[1.1vw] font-semibold text-[#1b222c]">
          Still have questions?
        </h4>
        <p className="text-xs sm:text-sm lg:text-[0.88vw] text-gray-500 max-w-md">
          Let’s discuss how FlipiBook can work for your products.
        </p>
        <button
          type="button"
          onClick={() => {
            const footerEl = document.querySelector('footer');
            if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 bg-[#ea7233] hover:bg-[#d86122] text-white rounded-lg text-xs sm:text-sm font-medium shadow-md transition-all duration-300 active:scale-95 cursor-pointer mt-1"
        >
          <span>Contact Our Team</span>
          <Icon icon="lucide:arrow-right" className="w-4 h-4" />
        </button>
      </motion.div>

    </motion.section>
  );
}
