import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Loader from './components/Loader';
import Onboarding from './components/Onboarding';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import VideoModal from './components/VideoModal';
import ShortsModal from './components/ShortsModal';
import MiniPlayer from './components/MiniPlayer';
import ChannelModal from './components/ChannelModal';
import PlaylistModal from './components/PlaylistModal';
import AdModal from './components/AdModal';
import ScrollToTop from './components/ScrollToTop';
import BackgroundManager from './components/BackgroundManager';
import BackgroundSettings from './components/BackgroundSettings';

import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import PlaylistsPage from './pages/PlaylistsPage';
import DownloadsPage from './pages/DownloadsPage';
import ExplorePage from './pages/ExplorePage';

import { getUser } from './utils/storage';

function AppShell() {
  const navigate = useNavigate();
  const {
    user,
    sidebarOpen, setSidebarOpen,
    videoModalId, setVideoModalId,
    shortsModal, setShortsModal,
    miniPlayer,
    channelId, setChannelId,
    plModal, setPlModal,
    showAd, setShowAd,
    showOnboarding, setShowOnboarding,
    showBgSettings, setShowBgSettings,
    bgSettings, handleBgSave,
    handleOnboardingComplete,
    handlePlay,
    handleMini,
    handleExpandMini,
    handleSave,
    addToPl,
    createPl,
    playlists,
  } = useApp();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Swipe gestures
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
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <div className="min-h-screen">
      <BackgroundManager settings={bgSettings} />

      {showOnboarding && (
        <Onboarding initialUser={user} onComplete={handleOnboardingComplete} />
      )}

      {showBgSettings && (
        <BackgroundSettings settings={bgSettings} onSave={handleBgSave} onClose={() => setShowBgSettings(false)} />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onSettings={() => setShowOnboarding(true)}
        onBgSettings={() => setShowBgSettings(true)}
      />

      <div className="lg:ml-64 min-h-screen relative z-10">
        <Navbar
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onPlaylist={() => navigate('/playlists')}
          onSettings={() => setShowOnboarding(true)}
          onRefresh={handleRefresh}
        />
        <FilterBar />

        <main className="pt-[124px] pb-16 px-3 sm:px-5 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage refreshTrigger={refreshTrigger} />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/search/:query" element={<SearchPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="*" element={<HomePage refreshTrigger={refreshTrigger} />} />
          </Routes>
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
          onExpand={handleExpandMini} onClose={() => useApp().setMiniPlayer(null)} />
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

function MiniPlayerWrapper() {
  const { miniPlayer, setMiniPlayer, handleExpandMini } = useApp();
  if (!miniPlayer) return null;
  return (
    <MiniPlayer
      videoId={miniPlayer.videoId}
      title={miniPlayer.title}
      onExpand={handleExpandMini}
      onClose={() => setMiniPlayer(null)}
    />
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
    if (!getUser()) setNeedsOnboarding(true);
  }, []);

  if (loading) return <Loader onComplete={handleLoadComplete} />;

  return (
    <AppProvider>
      <AppShellWithOnboarding forceOnboarding={needsOnboarding} onOnboarded={() => setNeedsOnboarding(false)} />
    </AppProvider>
  );
}

function AppShellWithOnboarding({ forceOnboarding, onOnboarded }) {
  const { setShowOnboarding } = useApp();

  useEffect(() => {
    if (forceOnboarding) {
      setShowOnboarding(true);
      onOnboarded();
    }
  }, [forceOnboarding, setShowOnboarding, onOnboarded]);

  return <AppShell />;
}