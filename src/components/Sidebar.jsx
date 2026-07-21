import React, { useRef } from 'react';
import { FiHome, FiTrendingUp, FiZap, FiMusic, FiSettings, FiLayers, FiX, FiList, FiCompass, FiDownload } from 'react-icons/fi';
import { IoGameControllerOutline, IoNewspaperOutline, IoFootballOutline } from 'react-icons/io5';
import Logo from './Logo';

const navItems = [
  { id: 'home', icon: FiHome, label: 'Home' },
  { id: 'trending', icon: FiTrendingUp, label: 'Trending' },
  { id: 'shorts', icon: FiZap, label: 'Shorts' },
  { id: 'music', icon: FiMusic, label: 'Music' },
  { id: 'gaming', icon: IoGameControllerOutline, label: 'Gaming' },
  { id: 'news', icon: IoNewspaperOutline, label: 'News' },
  { id: 'sports', icon: IoFootballOutline, label: 'Sports' },
  { id: 'explore', icon: FiCompass, label: 'Explore' },
];

export default function Sidebar({ open, onClose, active, onNavigate, user, onSettings, onBgSettings, onDownloaded }) {
  return (
    <>
      <div className={`fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose} />
      <aside className={`fixed top-0 left-0 bottom-0 w-64 z-[95] glass-strong border-r border-vf-border/50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-vf-border/30 flex items-center justify-between">
          <div onClick={() => { onNavigate('home'); onClose(); }} className="cursor-pointer">
            <Logo size="sm" />
          </div>
          <button className="lg:hidden p-1.5 hover:bg-vf-card rounded-lg" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-vf-gray font-bold px-3 mb-2 mt-1">Discover</p>
          {navItems.map((item, i) => (
            <button key={item.id}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                active === item.id
                  ? 'bg-vf-red/15 text-white'
                  : 'text-vf-gray hover:text-white hover:bg-vf-card/70'
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => { onNavigate(item.id); if (window.innerWidth < 1024) onClose(); }}>
              {active === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 gr-red rounded-r-full" />}
              <item.icon size={18} className={active === item.id ? 'text-vf-red' : ''} />
              <span>{item.label}</span>
              {active === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-vf-red" />}
            </button>
          ))}

          <div className="border-t border-vf-border/30 my-4 mx-1" />

          <p className="text-[10px] uppercase tracking-widest text-vf-gray font-bold px-3 mb-2">Library</p>
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active === 'playlists' ? 'bg-vf-red/15 text-white' : 'text-vf-gray hover:text-white hover:bg-vf-card/70'
          }`}
            onClick={() => { onNavigate('playlists'); if (window.innerWidth < 1024) onClose(); }}>
            <FiList size={18} className={active === 'playlists' ? 'text-vf-red' : ''} />
            Playlists
          </button>
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active === 'downloads' ? 'bg-vf-red/15 text-white' : 'text-vf-gray hover:text-white hover:bg-vf-card/70'
          }`}
            onClick={() => { onDownloaded(); if (window.innerWidth < 1024) onClose(); }}>
            <FiDownload size={18} className={active === 'downloads' ? 'text-vf-red' : ''} />
            Downloads
          </button>

          <div className="border-t border-vf-border/30 my-4 mx-1" />

          <p className="text-[10px] uppercase tracking-widest text-vf-gray font-bold px-3 mb-2">Personalize</p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-vf-gray hover:text-white hover:bg-vf-card/70 transition-all" onClick={onBgSettings}>
            <FiLayers size={18} />
            Background
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-vf-gray hover:text-white hover:bg-vf-card/70 transition-all" onClick={onSettings}>
            <FiSettings size={18} />
            Preferences
          </button>
        </nav>

        <div className="p-3 border-t border-vf-border/30">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-vf-card/50 cursor-pointer transition-colors" onClick={onSettings}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl gr-red flex items-center justify-center text-sm font-bold shadow-lg shadow-red-900/30">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-vf-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-vf-gray truncate">{user?.country || ''} • Explorer</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}