import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiMic, FiBookmark, FiArrowRight, FiCornerDownLeft, FiRefreshCw } from 'react-icons/fi';
import Logo from './Logo';
import { getSuggestions } from '../utils/api';

export default function Navbar({ user, onMenuToggle, onPlaylist, onSettings, onRefresh }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [listening, setListening] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sugRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleInput = useCallback((val) => {
    setQuery(val);
    if (val.trim().length < 2) { setSuggestions([]); setShowSug(false); return; }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const data = await getSuggestions(val.trim());
      if (data?.items) {
        setSuggestions(data.items.map(i => i.snippet?.title || '').filter(Boolean));
        setShowSug(true);
      }
    }, 300);
  }, []);

  const doSearch = useCallback((q) => {
    const searchQuery = (q || query).trim();
    if (!searchQuery) return;
    setShowSug(false);
    navigate(`/search/${encodeURIComponent(searchQuery)}`);
  }, [query, navigate]);

  const startVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    setListening(true);
    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      setQuery(text);
      if (e.results[0].isFinal) {
        setListening(false);
        doSearch(text);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }, [doSearch]);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh?.();
    setTimeout(() => setRefreshing(false), 1500);
  };

  useEffect(() => {
    const handler = (e) => {
      if (sugRef.current && !sugRef.current.contains(e.target)) setShowSug(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-64 z-[85] glass border-b border-vf-border/40">
        <div className="flex items-center gap-2 sm:gap-3 h-16 px-3 sm:px-5">
          <button className="p-2 hover:bg-vf-card rounded-xl transition-colors lg:hidden" onClick={onMenuToggle}>
            <FiMenu size={20} />
          </button>
          <div className="lg:hidden cursor-pointer" onClick={() => navigate('/')}>
            <Logo size="xs" showText={false} />
          </div>

          <div className="flex-1 max-w-2xl mx-auto relative" ref={sugRef}>
            <div className="flex items-center bg-vf-card/60 border border-vf-border rounded-2xl overflow-hidden focus-within:border-vf-red focus-within:bg-vf-card transition-all group">
              <FiSearch className="ml-4 text-vf-gray group-focus-within:text-vf-red transition-colors" size={16} />
              <input type="text" value={query}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                onFocus={() => suggestions.length > 0 && setShowSug(true)}
                placeholder="Search videos, channels, anything..."
                className="flex-1 bg-transparent px-3 py-3 text-sm placeholder-vf-gray" />
              <button onClick={startVoice} className="p-3 hover:bg-vf-border/40 transition-colors hidden sm:block">
                <FiMic size={16} className={`${listening ? 'text-vf-red animate-pulse' : 'text-vf-gray'}`} />
              </button>
              <button onClick={() => doSearch()} className="px-4 py-3 bg-vf-border/30 hover:bg-vf-red/30 transition-colors">
                <FiArrowRight size={16} />
              </button>
            </div>
            {showSug && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-strong border border-vf-border rounded-2xl overflow-hidden shadow-2xl z-50 animate-slideDown">
                {suggestions.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-vf-card transition-colors"
                    onClick={() => { setQuery(s); doSearch(s); }}>
                    <FiSearch size={14} className="text-vf-gray flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{s}</span>
                    <FiCornerDownLeft size={12} className="text-vf-gray/30" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleRefresh} className="p-2 hover:bg-vf-card rounded-xl transition-colors hidden sm:block" title="Refresh feed">
            <FiRefreshCw size={18} className={refreshing ? 'animate-spin text-vf-red' : ''} />
          </button>
          <button onClick={startVoice} className="p-2 hover:bg-vf-card rounded-xl transition-colors sm:hidden">
            <FiMic size={18} className={listening ? 'text-vf-red animate-pulse' : ''} />
          </button>
          <button onClick={onPlaylist} className="p-2 hover:bg-vf-card rounded-xl transition-colors">
            <FiBookmark size={18} />
          </button>
          <div className="w-9 h-9 rounded-xl gr-red flex items-center justify-center text-sm font-bold cursor-pointer shadow-lg shadow-red-900/20" onClick={onSettings}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      </header>

      {listening && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-md flex items-center justify-center" onClick={() => setListening(false)}>
          <div className="text-center" onClick={e => e.stopPropagation()}>
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 gr-red rounded-full flex items-center justify-center shadow-2xl shadow-red-900/50" style={{ animation: 'breathe 1.5s ease-in-out infinite' }}>
                <FiMic size={44} />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-vf-red animate-ping opacity-40" />
              <div className="absolute inset-[-8px] rounded-full border-2 border-vf-red animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-3xl font-black mb-2 font-display">Listening...</p>
            <p className="text-vf-gray text-lg">{query || 'Say something to search'}</p>
            <button onClick={() => setListening(false)} className="mt-8 px-8 py-3 border border-vf-border rounded-xl hover:border-vf-red transition-colors text-sm">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}