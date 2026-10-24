import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What files can I upload?",
      answer: "You can upload PDF files, Microsoft Word (.docx), PowerPoint (.pptx), and high-resolution images (.jpg, .png). Our system automatically converts them into smooth, interactive flipbooks."
    },
    {
      question: "Can I customise page layouts?",
      answer: "Yes! You can fully customize backgrounds, toolbar branding, add hot-spots, clickable links, video embeds, and 3D product widgets using our drag-and-drop editor."
    },
    {
      question: "Can I add 3D models and videos?",
      answer: "Absolutely. Flipibook supports interactive GLTF/GLB 3D models, YouTube/Vimeo embeds, self-hosted MP4 videos, and audio tracks directly on your flipbook pages."
    },
    {
      question: "Does Flipibook support 360° views?",
      answer: "Yes, you can integrate 360-degree interactive product spin views so buyers can inspect products from every angle."
    },
    {
      question: "Can I share my catalogue online?",
      answer: "You can instantly share your flipbook via a short web URL, QR code, or embed it seamlessly directly into your website or e-commerce store."
    },
    {
      question: "Can I track catalogue engagement?",
      answer: "Yes! Our real-time analytics dashboard gives you insights on total reads, page views, time spent per page, button clicks, and visitor locations."
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
          <span className="text-[#ea7233]">Flipibook</span>
        </h2>
        <p className="text-xs sm:text-sm lg:text-[0.9vw] text-gray-500 font-normal leading-relaxed">
          Turn static PDFs into engaging digital catalogue experiences.
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

    </motion.section>
  );
}
