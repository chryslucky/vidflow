import React from 'react';
import { FiX, FiExternalLink, FiStar, FiCheckCircle, FiGlobe, FiCompass } from 'react-icons/fi';

export default function AdModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[300]">
      <div className="absolute inset-0 bg-black/93 backdrop-blur-md" />
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-lg">
          <div className="relative rounded-3xl overflow-hidden border border-vf-border/50 shadow-2xl">
            <button onClick={onClose} className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors">
              <FiX size={14} />
            </button>
            <a href="https://altuverasafaris.com" target="_blank" rel="noopener noreferrer" className="block group">
              <div className="relative h-56 sm:h-72 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-amber-700" />
                <img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
                    <FiCompass size={32} className="text-amber-400" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-white mb-2">Discover East Africa</h3>
                  <p className="text-white/80 text-sm max-w-xs">Unforgettable safari adventures across the most beautiful landscapes</p>
                </div>
              </div>
              <div className="bg-gradient-to-b from-vf-dark to-vf-black p-6 text-center">
                <div className="text-xl font-extrabold mb-1">Altuvera Safaris</div>
                <p className="text-vf-gray text-sm mb-5">Premium guided tours — Kenya, Tanzania, Uganda & Rwanda</p>
                <div className="flex justify-center gap-5 mb-5 text-xs text-vf-gray">
                  <span className="flex items-center gap-1"><FiStar size={14} className="text-amber-400" /> Top Rated</span>
                  <span className="flex items-center gap-1"><FiCheckCircle size={14} className="text-emerald-400" /> Verified</span>
                  <span className="flex items-center gap-1"><FiGlobe size={14} className="text-blue-400" /> East Africa</span>
                </div>
                <div className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-white font-bold text-sm transition-all">
                  Explore Adventures <FiExternalLink size={14} />
                </div>
              </div>
            </a>
          </div>
          <p className="text-center text-vf-gray/30 text-[10px] mt-3">Suggested for you</p>
        </div>
      </div>
    </div>
  );
}