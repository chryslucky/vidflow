import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPlus, FiChevronLeft, FiChevronRight, FiEye, FiClock } from 'react-icons/fi';
import { HiOutlineFire, HiOutlineSparkles } from 'react-icons/hi2';
import { getThumb, getVideoId, formatNumber, parseDuration } from '../utils/helpers';

export default function HeroSlider({ videos, onPlay, onSave }) {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(null);

  const items = (videos || []).slice(0, 5);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % items.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length, isPaused]);

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
  const duration = parseDuration(current.contentDetails?.duration);

  return (
    <section className="mb-10 animate-slideUp">
      <div 
        className="relative rounded-3xl overflow-hidden group shadow-2xl shadow-black/60" 
        style={{ minHeight: 280 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}>
        
        {/* Background layers with fade */}
        <div className="absolute inset-0 z-0">
          {items.map((item, i) => (
            <div 
              key={i} 
              className={`absolute inset-0 transition-all duration-1000 ${i === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
              <img 
                src={getThumb(item.snippet, 'high')}
                className="w-full h-full object-cover no-drag"
                alt="" 
              />
              {/* Ken burns effect */}
              {i === index && (
                <div className="absolute inset-0 animate-heroFade" />
              )}
            </div>
          ))}
        </div>

        {/* Multi-layer gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-vf-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-vf-black via-vf-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-red-900/20 via-transparent to-transparent z-10" />

        {/* Animated particles/dots */}
        <div className="absolute inset-0 z-10 opacity-30">
          <div className="absolute top-10 right-20 w-2 h-2 bg-vf-red rounded-full animate-ping" />
          <div className="absolute top-32 right-40 w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute bottom-20 right-60 w-1.5 h-1.5 bg-vf-red rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div 
          className="relative z-20 p-6 sm:p-10 lg:p-14 flex flex-col justify-end min-h-[280px] sm:min-h-[400px] lg:min-h-[480px] cursor-pointer"
          onClick={() => onPlay(vid)}>
          
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
            
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1.5 gr-red rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-900/40">
                <HiOutlineFire size={12} /> Featured
              </span>
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 flex items-center gap-1">
                <HiOutlineSparkles size={11} /> Trending Now
              </span>
              {duration && (
                <span className="px-3 py-1.5 bg-black/50 backdrop-blur-xl rounded-full text-[10px] font-bold flex items-center gap-1 border border-white/10">
                  <FiClock size={11} /> {duration}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 max-w-3xl leading-[1.05] font-display drop-shadow-2xl">
              {current.snippet?.title}
            </h2>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-vf-light mb-6 font-medium">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-vf-red animate-pulse" />
                {current.snippet?.channelTitle}
              </span>
              {current.statistics?.viewCount && (
                <span className="flex items-center gap-1.5">
                  <FiEye size={14} />
                  {formatNumber(current.statistics.viewCount)} views
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-7 py-3.5 gr-red rounded-2xl font-black text-sm transition-all hover:scale-105 shadow-2xl shadow-red-900/50 hover:shadow-red-900/80">
                <FiPlay size={18} fill="white" /> Watch Now
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-xl rounded-2xl font-bold text-sm hover:bg-white/20 transition-all border border-white/20 hover:border-white/40"
                onClick={(e) => { e.stopPropagation(); onSave(vid, current.snippet?.title); }}>
                <FiPlus size={16} /> Add to List
              </button>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        {items.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 backdrop-blur-xl hover:bg-vf-red rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/10 hover:border-transparent shadow-xl">
              <FiChevronLeft size={22} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); go(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/60 backdrop-blur-xl hover:bg-vf-red rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/10 hover:border-transparent shadow-xl">
              <FiChevronRight size={22} />
            </button>
          </>
        )}

        {/* Progress dots at bottom */}
        {items.length > 1 && (
          <div className="absolute bottom-4 right-4 sm:right-8 z-30 flex gap-2 items-center bg-black/40 backdrop-blur-xl rounded-full px-3 py-2 border border-white/10">
            {items.map((_, i) => (
              <button 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-10 gr-red' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} 
              />
            ))}
            <span className="text-[10px] font-bold text-vf-gray ml-2">
              {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}