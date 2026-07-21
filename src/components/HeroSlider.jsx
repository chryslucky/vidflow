import React, { useState, useEffect } from 'react';
import { FiPlay, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineFire } from 'react-icons/hi2';
import { getThumb, getVideoId, formatNumber } from '../utils/helpers';

export default function HeroSlider({ videos, onPlay, onSave }) {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const items = (videos || []).slice(0, 5);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % items.length);
        setIsTransitioning(false);
      }, 400);
    }, 7000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const go = (dir) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex(prev => {
        const next = prev + dir;
        if (next < 0) return items.length - 1;
        return next % items.length;
      });
      setIsTransitioning(false);
    }, 400);
  };

  const current = items[index];
  const vid = getVideoId(current);

  return (
    <section className="mb-8">
      <div className="relative rounded-3xl overflow-hidden cursor-pointer group" style={{ minHeight: 240 }}>
        {/* Background image with fade transition */}
        <div className="absolute inset-0 z-0">
          {items.map((item, i) => (
            <img key={i} src={getThumb(item.snippet, 'high')}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 no-drag ${i === index && !isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              style={{ transition: 'opacity 0.7s ease, transform 7s ease' }}
              alt="" />
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-vf-black via-transparent to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 p-5 sm:p-8 lg:p-12 flex flex-col justify-end min-h-[240px] sm:min-h-[360px] lg:min-h-[440px]"
          onClick={() => onPlay(vid)}>
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 gr-red rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-red-900/40">
                <HiOutlineFire size={12} /> Featured
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-lg text-[10px] font-bold uppercase">
                {formatNumber(current.statistics?.viewCount)} views
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-3 max-w-2xl leading-[1.1] font-display">
              {current.snippet?.title}
            </h2>
            <p className="text-vf-light text-sm sm:text-base mb-6 font-medium">
              {current.snippet?.channelTitle}
            </p>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-7 py-3 gr-red rounded-2xl font-black text-sm transition-all hover:scale-105 shadow-2xl shadow-red-900/40">
                <FiPlay size={18} fill="white" /> Watch Now
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-2xl font-bold text-sm hover:bg-white/20 transition-colors border border-white/10"
                onClick={(e) => { e.stopPropagation(); onSave(vid, current.snippet?.title); }}>
                <FiPlus size={16} /> Save
              </button>
            </div>
          </div>
        </div>

        {/* Nav arrows */}
        {items.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-black/60 backdrop-blur hover:bg-vf-red rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 border border-white/10">
              <FiChevronLeft size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); go(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-black/60 backdrop-blur hover:bg-vf-red rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 border border-white/10">
              <FiChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="absolute bottom-4 right-4 sm:right-8 z-30 flex gap-1.5">
            {items.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-vf-red' : 'w-1.5 bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}