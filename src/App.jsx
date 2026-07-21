import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Loader from './components/Loader';
import Onboarding from './components/Onboarding';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import VideoCard from './components/VideoCard';
import SkeletonGrid from './components/SkeletonGrid';
import VideoModal from './components/VideoModal';
import ShortsModal from './components/ShortsModal';
import MiniPlayer from './components/MiniPlayer';
import ChannelModal from './components/ChannelModal';
import PlaylistModal from './components/PlaylistModal';
import AdModal from './components/AdModal';
import ScrollToTop from './components/ScrollToTop';
import HeroSlider from './components/HeroSlider';
import BackgroundManager from './components/BackgroundManager';
import BackgroundSettings from './components/BackgroundSettings';
import DownloadsView from './components/DownloadsView';
import { FiPlay, FiPlus, FiChevronLeft, FiChevronRight, FiZap, FiHeart, FiMusic, FiArrowLeft, FiList, FiTrash2, FiX } from 'react-icons/fi';
import { HiOutlineFire } from 'react-icons/hi2';
import { getPopularVideos, getShorts, searchVideos, getVideoDetails, clearApiCache } from './utils/api';
import { getUser, saveUser, getPlaylists, savePlaylists, getBgSettings, saveBgSettings, incWatched } from './utils/storage';
import { getThumb, getGreeting, getVideoId } from './utils/helpers';

const CATEGORY_MAP = {
  music: '10', gaming: '20', news: '25', sports: '17', education: '27',
  entertainment: '24', science: '28', comedy: '23', travel: '19',
  food: '26', fitness: '17', tech: '28'
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBgSettings, setShowBgSettings] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [activeFilter, setActiveFilter] = useState('all');
  const [view, setView] = useState('home');
  const [popular, setPopular] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [forYou, setForYou] = useState([]);
  const [musicVids, setMusicVids] = useState([]);
  const [heroVideos, setHeroVideos] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoModalId, setVideoModalId] = useState(null);
  const [shortsModal, setShortsModal] = useState(null);
  const [miniPlayer, setMiniPlayer] = useState(null);
  const [channelId, setChannelId] = useState(null);
  const [plModal, setPlModal] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [bgSettings, setBgSettings] = useState({ type: 'none' });
  const [pageToken, setPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [popularLoading, setPopularLoading] = useState(true);
  const adCooldown = useRef(false);
  const contentLoaded = useRef(false);

  useEffect(() => {
    const u = getUser();
    const p = getPlaylists();
    const bg = getBgSettings();
    if (u) setUser(u);
    if (p) setPlaylists(p);
    if (bg) setBgSettings(bg);
  }, []);

  const loadAllContent = useCallback(async (forceRefresh = false) => {
    if (contentLoaded.current && !forceRefresh) return;
    contentLoaded.current = true;

    if (forceRefresh) clearApiCache();

    const u = getUser();
    setPopularLoading(true);

    // Load 100 popular videos (2 pages of 50)
    const pop1 = await getPopularVideos(u?.country || 'US', 50, '', '', !forceRefresh);
    if (pop1?.items) {
      // Shuffle for refresh feel
      const shuffled = forceRefresh ? [...pop1.items].sort(() => Math.random() - 0.5) : pop1.items;
      setPopular(shuffled);
      setHeroVideos(shuffled.slice(0, 5));
      setPageToken(pop1.nextPageToken || null);

      if (pop1.nextPageToken) {
        const pop2 = await getPopularVideos(u?.country || 'US', 50, pop1.nextPageToken, '', !forceRefresh);
        if (pop2?.items) {
          setPopular(prev => [...prev, ...pop2.items]);
          setPageToken(pop2.nextPageToken || null);
        }
      }
    }
    setPopularLoading(false);

    // Shorts
    const interest = u?.interests?.[Math.floor(Math.random() * (u?.interests?.length || 1))] || 'trending';
    const sh = await getShorts(interest + ' shorts', 24, u?.country || 'US');
    if (sh?.items) setShorts(sh.items);

    // For You
    const fyQ = u?.interests?.[Math.floor(Math.random() * (u?.interests?.length || 1))] || 'popular';
    const fyData = await searchVideos(fyQ, 10, '', !forceRefresh);
    if (fyData?.items) {
      const ids = fyData.items.map(i => i.id?.videoId).filter(Boolean);
      const det = await getVideoDetails(ids);
      setForYou(det);
    }

    // Music
    const mData = await getPopularVideos(u?.country || 'US', 10, '', '10', !forceRefresh);
    if (mData?.items) setMusicVids(mData.items);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
    if (!getUser()) setShowOnboarding(true);
    else loadAllContent();
  }, [loadAllContent]);

  const handleRefreshFeed = useCallback(() => {
    contentLoaded.current = false;
    loadAllContent(true);
  }, [loadAllContent]);

  useEffect(() => {
    if (loadingMore || !pageToken || view !== 'home') return;
    const handler = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, pageToken, view]);

  const loadMore = async () => {
    if (loadingMore || !pageToken) return;
    setLoadingMore(true);
    // Load 100 more (2 pages of 50)
    const data = await getPopularVideos(user?.country || 'US', 50, pageToken);
    if (data?.items) {
      setPopular(prev => [...prev, ...data.items]);
      const nextToken = data.nextPageToken;

      if (nextToken) {
        const data2 = await getPopularVideos(user?.country || 'US', 50, nextToken);
        if (data2?.items) {
          setPopular(prev => [...prev, ...data2.items]);
          setPageToken(data2.nextPageToken || null);
        } else {
          setPageToken(nextToken);
        }
      } else {
        setPageToken(null);
      }
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    let startX = 0;
    const ts = (e) => { startX = e.changedTouches[0].screenX; };
    const te = (e) => {
      const dx = e.changedTouches[0].screenX - startX;
      if (dx > 80 && startX < 40 && window.innerWidth < 1024) setSidebarOpen(true);
      if (dx < -80 && sidebarOpen && window.innerWidth < 1024) setSidebarOpen(false);
    };
    document.addEventListener('touchstart', ts, { passive: true });
    document.addEventListener('touchend', te, { passive: true });
    return () => {
      document.removeEventListener('touchstart', ts);
      document.removeEventListener('touchend', te);
    };
  }, [sidebarOpen]);

  const handleOnboardingComplete = (userData) => {
    setUser(userData);
    saveUser(userData);
    setShowOnboarding(false);
    contentLoaded.current = false;
    loadAllContent(true);
  };

  const handlePlay = useCallback((vid) => {
    if (!vid) return;
    const count = incWatched();
    if (count > 0 && count % 5 === 0 && !adCooldown.current) {
      adCooldown.current = true;
      setTimeout(() => setShowAd(true), 1500);
      setTimeout(() => { adCooldown.current = false; }, 60000);
    }
    setVideoModalId(vid);
  }, []);

  const handleMini = useCallback((vid, title) => {
    setMiniPlayer({ videoId: vid, title });
    setVideoModalId(null);
  }, []);

  const handleExpandMini = useCallback((vid) => {
    setMiniPlayer(null);
    setVideoModalId(vid);
  }, []);

  const handleSearch = useCallback(async (q) => {
    if (!q) return;
    setSearchQuery(q);
    setView('search');
    setSearchResults(null);
    if (videoModalId) handleMini(videoModalId, '');

    const [vidData, shortsData] = await Promise.all([
      searchVideos(q, 20),
      searchVideos(q + ' shorts', 12),
    ]);

    let videos = [];
    if (vidData?.items) {
      const ids = vidData.items.map(i => i.id?.videoId).filter(Boolean);
      videos = await getVideoDetails(ids);
    }
    const shortsList = shortsData?.items?.filter(i => i.id?.videoId) || [];
    setSearchResults({ videos, shorts: shortsList });
  }, [videoModalId, handleMini]);

  const handleFilter = useCallback(async (id) => {
    setActiveFilter(id);
    if (id === 'all' || id === 'trending') {
      setView('home');
      setPopularLoading(true);
      const data = await getPopularVideos(user?.country || 'US', 50);
      if (data?.items) {
        setPopular(data.items);
        setPageToken(data.nextPageToken || null);
        if (data.items.length) setHeroVideos(data.items.slice(0, 5));
      }
      setPopularLoading(false);
      return;
    }
    if (id === 'shorts') { handleSearch('trending shorts'); return; }
    if (id === 'recently') {
      setView('home');
      setPopularLoading(true);
      const data = await searchVideos('new today trending', 20);
      if (data?.items) {
        const ids = data.items.map(i => i.id?.videoId).filter(Boolean);
        const det = await getVideoDetails(ids);
        setPopular(det);
        setPageToken(null);
      }
      setPopularLoading(false);
      return;
    }
    const catId = CATEGORY_MAP[id];
    if (catId) {
      setView('home');
      setPopularLoading(true);
      const data = await getPopularVideos(user?.country || 'US', 24, '', catId);
      if (data?.items) { setPopular(data.items); setPageToken(null); }
      setPopularLoading(false);
    } else {
      handleSearch(id);
    }
  }, [user, handleSearch]);

  const handleNav = useCallback((page) => {
    setActiveNav(page);
    if (page === 'home') { setView('home'); setActiveFilter('all'); return; }
    if (page === 'playlists') { setView('playlists'); return; }
    if (page === 'explore') { handleSearch('trending worldwide'); return; }
    handleFilter(page);
  }, [handleFilter, handleSearch]);

  const goHome = () => { setView('home'); setActiveNav('home'); setActiveFilter('all'); };

  const handleSave = (vid, title) => {
    setPlModal({ videoId: vid, title: title || 'Video' });
  };

  const addToPl = (plIndex) => {
    if (!plModal) return;
    const updated = [...playlists];
    if (updated[plIndex].videos.find(v => v.videoId === plModal.videoId)) return;
    updated[plIndex].videos.push({ videoId: plModal.videoId, title: plModal.title });
    setPlaylists(updated);
    savePlaylists(updated);
    setPlModal(null);
  };

  const createPl = (name) => {
    const updated = [...playlists, { name, videos: [] }];
    setPlaylists(updated);
    savePlaylists(updated);
  };

  const deletePl = (index) => {
    const updated = playlists.filter((_, i) => i !== index);
    setPlaylists(updated);
    savePlaylists(updated);
  };

  const removeFromPl = (plIdx, vidIdx) => {
    const updated = [...playlists];
    updated[plIdx].videos.splice(vidIdx, 1);
    setPlaylists(updated);
    savePlaylists(updated);
  };

  const handleBgSave = (newSettings) => {
    setBgSettings(newSettings);
    saveBgSettings(newSettings);
  };

  const scrollShorts = (dir) => {
    const el = document.getElementById('shortsRow');
    el?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  if (loading) return <Loader onComplete={handleLoadComplete} />;

  return (
    <div className="min-h-screen">
      <BackgroundManager settings={bgSettings} />

      {showOnboarding && (
        <Onboarding initialUser={user} onComplete={handleOnboardingComplete} />
      )}

      {showBgSettings && (
        <BackgroundSettings settings={bgSettings} onSave={handleBgSave} onClose={() => setShowBgSettings(false)} />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        active={activeNav} onNavigate={handleNav} user={user}
        onSettings={() => setShowOnboarding(true)}
        onBgSettings={() => setShowBgSettings(true)}
        onDownloaded={() => { setView('downloads'); setActiveNav('downloads'); }} />

      <div className="lg:ml-64 min-h-screen relative z-10">
        <Navbar user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onSearch={handleSearch}
          onPlaylist={() => { setView('playlists'); setActiveNav('playlists'); }}
          onSettings={() => setShowOnboarding(true)}
          onRefresh={handleRefreshFeed} />
        <FilterBar active={activeFilter} onFilter={handleFilter} />

        <main className="pt-[124px] pb-16 px-3 sm:px-5 lg:px-8">
          {view === 'home' && (
            <>
              {heroVideos.length > 0 && (
                <HeroSlider videos={heroVideos} onPlay={handlePlay} onSave={handleSave} />
              )}

              <div className="mb-6 animate-slideUp">
                <h2 className="text-2xl sm:text-3xl font-black font-display">
                  {getGreeting()}, <span className="text-gradient">{user?.name || 'Explorer'}</span>
                </h2>
                <p className="text-vf-gray text-sm mt-1">Fresh picks curated just for you</p>
              </div>

              <section className="mb-10">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-5 font-display">
                  <HiOutlineFire className="text-vf-red" size={22} /> Most Popular
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {popularLoading ? <SkeletonGrid count={8} /> :
                    popular.map((v, i) => (
                      <VideoCard key={`${getVideoId(v)}-${i}`} video={v} index={i} onPlay={handlePlay} onChannel={setChannelId} onSave={handleSave} />
                    ))
                  }
                </div>
              </section>

              {shorts.length > 0 && (
                <section className="mb-10">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-5 font-display">
                    <FiZap className="text-vf-red" size={20} /> Shorts
                  </h3>
                  <div className="relative group/s">
                    <button onClick={() => scrollShorts(-1)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-black/80 backdrop-blur hover:bg-vf-red rounded-full flex items-center justify-center transition-colors -ml-3 opacity-0 group-hover/s:opacity-100 border border-white/10">
                      <FiChevronLeft size={20} />
                    </button>
                    <div id="shortsRow" className="hscroll flex gap-3 px-1">
                      {shorts.map((s, i) => (
                        <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer group card-hover animate-cardIn"
                          style={{ animationDelay: `${i * 40}ms` }}
                          onClick={() => setShortsModal({ shorts, startIndex: i })}>
                          <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-vf-card">
                            <img src={getThumb(s.snippet, 'high')}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 no-drag" loading="lazy" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-xs font-bold line-clamp-2 leading-tight">{s.snippet?.title}</p>
                            </div>
                            <span className="absolute top-2 left-2 px-2 py-0.5 gr-red rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-lg">
                              <FiZap size={9} /> Short
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                <FiPlay size={20} fill="white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => scrollShorts(1)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-black/80 backdrop-blur hover:bg-vf-red rounded-full flex items-center justify-center transition-colors -mr-3 opacity-0 group-hover/s:opacity-100 border border-white/10">
                      <FiChevronRight size={20} />
                    </button>
                  </div>
                </section>
              )}

              {forYou.length > 0 && (
                <section className="mb-10">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-5 font-display">
                    <FiHeart className="text-vf-red" size={20} /> Recommended For You
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                    {forYou.map((v, i) => (
                      <VideoCard key={`fy-${getVideoId(v)}-${i}`} video={v} index={i} onPlay={handlePlay} onChannel={setChannelId} onSave={handleSave} />
                    ))}
                  </div>
                </section>
              )}

              {musicVids.length > 0 && (
                <section className="mb-10">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 mb-5 font-display">
                    <FiMusic className="text-vf-red" size={20} /> Music Hits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                    {musicVids.map((v, i) => (
                      <VideoCard key={`mu-${getVideoId(v)}-${i}`} video={v} index={i} onPlay={handlePlay} onChannel={setChannelId} onSave={handleSave} />
                    ))}
                  </div>
                </section>
              )}

              {loadingMore && (
                <div className="flex justify-center py-10">
                  <div className="flex items-center gap-3 text-vf-gray">
                    <div className="w-6 h-6 rounded-full border-2 border-vf-border animate-spin" style={{ borderTopColor: '#e50914' }} />
                    <span className="text-sm">Loading 100 more videos...</span>
                  </div>
                </div>
              )}
            </>
          )}

          {view === 'search' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold font-display">
                  Results for "<span className="text-gradient">{searchQuery}</span>"
                </h3>
                <button onClick={goHome} className="text-sm text-vf-red hover:underline flex items-center gap-1">
                  <FiArrowLeft size={14} /> Home
                </button>
              </div>
              {!searchResults ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <SkeletonGrid count={8} />
                </div>
              ) : (
                <div className="space-y-8">
                  {searchResults.shorts.length > 0 && (
                    <div>
                      <h4 className="text-base font-bold mb-3 flex items-center gap-2"><FiZap className="text-vf-red" size={18} /> Shorts</h4>
                      <div className="hscroll flex gap-3 pb-2">
                        {searchResults.shorts.map((s, i) => (
                          <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer group card-hover"
                            onClick={() => setShortsModal({ shorts: searchResults.shorts, startIndex: i, query: searchQuery })}>
                            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-vf-card">
                              <img src={getThumb(s.snippet, 'high')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" alt="" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                              <div className="absolute bottom-0 p-3"><p className="text-xs font-bold line-clamp-2">{s.snippet?.title}</p></div>
                              <span className="absolute top-2 left-2 px-2 py-0.5 gr-red rounded-lg text-[9px] font-black uppercase"><FiZap size={9} className="inline" /> Short</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-bold mb-3 flex items-center gap-2"><FiPlay className="text-vf-red" size={18} /> Videos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                      {searchResults.videos.map((v, i) => (
                        <VideoCard key={`sr-${getVideoId(v)}-${i}`} video={v} index={i} onPlay={handlePlay} onChannel={setChannelId} onSave={handleSave} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'playlists' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 font-display">
                  <FiList className="text-vf-red" size={22} /> My Playlists
                </h3>
                <button onClick={goHome} className="text-sm text-vf-red hover:underline flex items-center gap-1">
                  <FiArrowLeft size={14} /> Home
                </button>
              </div>
              <div className="flex gap-2 mb-6 max-w-md">
                <input type="text" id="plNameInput" placeholder="New playlist..."
                  className="flex-1 bg-vf-card border border-vf-border rounded-xl px-4 py-2.5 text-sm focus:border-vf-red transition-colors"
                  onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { createPl(e.target.value.trim()); e.target.value = ''; } }} />
                <button onClick={() => { const inp = document.getElementById('plNameInput'); if (inp?.value.trim()) { createPl(inp.value.trim()); inp.value = ''; } }}
                  className="px-5 py-2.5 gr-red rounded-xl text-sm font-bold">Create</button>
              </div>
              {playlists.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-vf-card flex items-center justify-center mx-auto mb-4">
                    <FiList size={24} className="text-vf-gray" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">No playlists</h3>
                  <p className="text-vf-gray text-sm">Create your first playlist above</p>
                </div>
              ) : (
                playlists.map((pl, pi) => (
                  <div key={pi} className="mb-4 p-5 gr-card border border-vf-border rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-base flex items-center gap-2">
                        <FiList className="text-vf-red" size={18} />
                        {pl.name}
                        <span className="text-xs text-vf-gray font-normal">({pl.videos.length})</span>
                      </h4>
                      <button onClick={() => deletePl(pi)} className="p-2 hover:bg-vf-border rounded-lg transition-colors">
                        <FiTrash2 size={14} className="text-vf-gray" />
                      </button>
                    </div>
                    {pl.videos.length === 0 ? <p className="text-vf-gray text-xs">Empty playlist</p> : (
                      <div className="space-y-1.5">
                        {pl.videos.map((v, vi) => (
                          <div key={vi} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-vf-border/20 cursor-pointer transition-colors"
                            onClick={() => handlePlay(v.videoId)}>
                            <span className="text-xs text-vf-gray w-6 text-center">{vi + 1}</span>
                            <FiPlay size={12} className="text-vf-red" />
                            <span className="text-sm flex-1 truncate">{v.title}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeFromPl(pi, vi); }} className="p-1.5 hover:bg-vf-border rounded">
                              <FiX size={12} className="text-vf-gray" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {view === 'downloads' && (
            <DownloadsView onBack={goHome} onPlay={handlePlay} />
          )}
        </main>
      </div>

      {videoModalId && (
        <VideoModal videoId={videoModalId} onClose={() => setVideoModalId(null)}
          onMini={handleMini} onPlay={handlePlay} onSave={handleSave}
          onChannel={(chId) => { setVideoModalId(null); setChannelId(chId); }} />
      )}

      {shortsModal && (
        <ShortsModal shorts={shortsModal.shorts} startIndex={shortsModal.startIndex}
          query={shortsModal.query} userCountry={user?.country}
          onClose={() => setShortsModal(null)} onSave={handleSave} />
      )}

      {miniPlayer && (
        <MiniPlayer videoId={miniPlayer.videoId} title={miniPlayer.title}
          onExpand={handleExpandMini} onClose={() => setMiniPlayer(null)} />
      )}

      {channelId && (
        <ChannelModal channelId={channelId} onClose={() => setChannelId(null)}
          onPlay={(vid) => { setChannelId(null); handlePlay(vid); }} onSave={handleSave} />
      )}

      {plModal && (
        <PlaylistModal playlists={playlists} onClose={() => setPlModal(null)}
          onAdd={addToPl} onCreate={createPl} />
      )}

      {showAd && <AdModal onClose={() => setShowAd(false)} />}

      <ScrollToTop />
    </div>
  );
}