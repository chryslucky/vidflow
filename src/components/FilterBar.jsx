import React, { useRef } from 'react';
import { FiTrendingUp, FiMusic, FiClock, FiZap, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IoGameControllerOutline, IoNewspaperOutline, IoFootballOutline, IoFlaskOutline, IoSchoolOutline, IoAirplaneOutline, IoRestaurantOutline, IoBarbellOutline, IoHardwareChipOutline } from 'react-icons/io5';
import { HiOutlineFire, HiOutlineFilm, HiOutlineFaceSmile } from 'react-icons/hi2';

const filters = [
  { id: 'all', label: 'All', Icon: HiOutlineFire },
  { id: 'trending', label: 'Trending', Icon: FiTrendingUp },
  { id: 'music', label: 'Music', Icon: FiMusic },
  { id: 'gaming', label: 'Gaming', Icon: IoGameControllerOutline },
  { id: 'news', label: 'News', Icon: IoNewspaperOutline },
  { id: 'sports', label: 'Sports', Icon: IoFootballOutline },
  { id: 'education', label: 'Education', Icon: IoSchoolOutline },
  { id: 'entertainment', label: 'Entertainment', Icon: HiOutlineFilm },
  { id: 'science', label: 'Science', Icon: IoFlaskOutline },
  { id: 'comedy', label: 'Comedy', Icon: HiOutlineFaceSmile },
  { id: 'travel', label: 'Travel', Icon: IoAirplaneOutline },
  { id: 'food', label: 'Food', Icon: IoRestaurantOutline },
  { id: 'fitness', label: 'Fitness', Icon: IoBarbellOutline },
  { id: 'tech', label: 'Tech', Icon: IoHardwareChipOutline },
  { id: 'recently', label: 'New Today', Icon: FiClock },
  { id: 'shorts', label: 'Shorts', Icon: FiZap },
];

export default function FilterBar({ active, onFilter }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });

  return (
    <div className="fixed top-14 right-0 left-0 lg:left-60 z-[80] glass border-b border-vf-border/30">
      <div className="px-3 sm:px-4 py-2 relative">
        <button className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-vf-dark/80 rounded-full items-center justify-center hidden sm:flex hover:bg-vf-red transition-colors"
          onClick={() => scroll(-1)}>
          <FiChevronLeft size={14} />
        </button>
        <div className="hscroll flex gap-2 items-center px-6 sm:px-8" ref={scrollRef}>
          {filters.map(f => (
            <button key={f.id}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-all whitespace-nowrap ${
                active === f.id
                  ? 'gr-red border-transparent text-white'
                  : 'bg-vf-card border-vf-border text-vf-gray hover:bg-vf-card2 hover:border-vf-border2'
              }`}
              onClick={() => onFilter(f.id)}>
              <f.Icon size={14} />
              {f.label}
            </button>
          ))}
        </div>
        <button className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-vf-dark/80 rounded-full items-center justify-center hidden sm:flex hover:bg-vf-red transition-colors"
          onClick={() => scroll(1)}>
          <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}