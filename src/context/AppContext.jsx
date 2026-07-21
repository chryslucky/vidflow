import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUser, saveUser, getPlaylists, savePlaylists, getBgSettings, saveBgSettings, incWatched } from '../utils/storage';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [bgSettings, setBgSettings] = useState({ type: 'none' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal states
  const [videoModalId, setVideoModalId] = useState(null);
  const [shortsModal, setShortsModal] = useState(null);
  const [miniPlayer, setMiniPlayer] = useState(null);
  const [channelId, setChannelId] = useState(null);
  const [plModal, setPlModal] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBgSettings, setShowBgSettings] = useState(false);
  
  const adCooldown = useRef(false);

  useEffect(() => {
    const u = getUser();
    const p = getPlaylists();
    const bg = getBgSettings();
    if (u) setUser(u);
    if (p) setPlaylists(p);
    if (bg) setBgSettings(bg);
  }, []);

  const handleOnboardingComplete = useCallback((userData) => {
    setUser(userData);
    saveUser(userData);
    setShowOnboarding(false);
  }, []);

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

  const handleSave = useCallback((vid, title) => {
    setPlModal({ videoId: vid, title: title || 'Video' });
  }, []);

  const addToPl = useCallback((plIndex) => {
    if (!plModal) return;
    setPlaylists(prev => {
      const updated = [...prev];
      if (updated[plIndex].videos.find(v => v.videoId === plModal.videoId)) return prev;
      updated[plIndex].videos.push({ videoId: plModal.videoId, title: plModal.title });
      savePlaylists(updated);
      return updated;
    });
    setPlModal(null);
  }, [plModal]);

  const createPl = useCallback((name) => {
    setPlaylists(prev => {
      const updated = [...prev, { name, videos: [] }];
      savePlaylists(updated);
      return updated;
    });
  }, []);

  const deletePl = useCallback((index) => {
    setPlaylists(prev => {
      const updated = prev.filter((_, i) => i !== index);
      savePlaylists(updated);
      return updated;
    });
  }, []);

  const removeFromPl = useCallback((plIdx, vidIdx) => {
    setPlaylists(prev => {
      const updated = [...prev];
      updated[plIdx].videos.splice(vidIdx, 1);
      savePlaylists(updated);
      return updated;
    });
  }, []);

  const handleBgSave = useCallback((newSettings) => {
    setBgSettings(newSettings);
    saveBgSettings(newSettings);
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser,
      playlists,
      bgSettings, handleBgSave,
      sidebarOpen, setSidebarOpen,
      videoModalId, setVideoModalId,
      shortsModal, setShortsModal,
      miniPlayer, setMiniPlayer,
      channelId, setChannelId,
      plModal, setPlModal,
      showAd, setShowAd,
      showOnboarding, setShowOnboarding,
      showBgSettings, setShowBgSettings,
      handleOnboardingComplete,
      handlePlay,
      handleMini,
      handleExpandMini,
      handleSave,
      addToPl,
      createPl,
      deletePl,
      removeFromPl,
    }}>
      {children}
    </AppContext.Provider>
  );
}