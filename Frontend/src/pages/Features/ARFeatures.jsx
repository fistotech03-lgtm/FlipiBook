import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Footer from '../Footer';

export default function ARFeatures() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] text-[#1E293B] font-poppins flex flex-col justify-between">
      <main className="w-full flex-1 max-w-[92vw] mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/features')}
          className="inline-flex items-center gap-2 text-sm text-[#EC5137] font-semibold hover:underline mb-6 cursor-pointer"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" /> Back to Features
        </button>
        <span className="text-xs font-bold tracking-[0.2em] text-[#EC5137] uppercase block mb-2">
          Augmented Reality
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#111827] tracking-tight">
          Real-World AR <span className="text-[#EC5137]">Product Previews</span>
        </h1>
        <p className="mt-3 text-base text-[#64748B] max-w-2xl">
          Bring your products into the physical world with interactive 3D and WebAR previews directly from your digital catalogues.
        </p>
      </main>
      <Footer />
    </div>
  );
}

