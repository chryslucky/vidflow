import localforage from 'localforage';

localforage.config({
  name: 'VidFlow',
  storeName: 'vidflow_data',
});

const KEYS = {
  USER: 'vf_user_v3',
  PLAYLISTS: 'vf_playlists_v3',
  BG_SETTINGS: 'vf_bg_settings',
  WATCHED: 'vf_watched',
  VIDEO_STATES: 'vf_video_states',
  DOWNLOADED: 'vf_downloaded',
  BG_IMAGES: 'vf_bg_images',
};

// Sync storage (localStorage) for lightweight data
export function getUser() {
  try {
    const d = localStorage.getItem(KEYS.USER);
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}
export function saveUser(user) {
  try { localStorage.setItem(KEYS.USER, JSON.stringify(user)); } catch {}
}

export function getPlaylists() {
  try {
    const d = localStorage.getItem(KEYS.PLAYLISTS);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}
export function savePlaylists(pl) {
  try { localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(pl)); } catch {}
}

export function getBgSettings() {
  try {
    const d = localStorage.getItem(KEYS.BG_SETTINGS);
    return d ? JSON.parse(d) : { type: 'none', value: null, slideshow: false, interval: 8 };
  } catch { return { type: 'none', value: null, slideshow: false, interval: 8 }; }
}
export function saveBgSettings(settings) {
  try { localStorage.setItem(KEYS.BG_SETTINGS, JSON.stringify(settings)); } catch {}
}

export function getVideoStates() {
  try {
    const d = localStorage.getItem(KEYS.VIDEO_STATES);
    return d ? JSON.parse(d) : {};
  } catch { return {}; }
}
export function saveVideoState(videoId, time) {
  try {
    const states = getVideoStates();
    states[videoId] = { time, updated: Date.now() };
    // Keep only last 100 states
    const entries = Object.entries(states).sort((a, b) => b[1].updated - a[1].updated).slice(0, 100);
    const cleaned = Object.fromEntries(entries);
    localStorage.setItem(KEYS.VIDEO_STATES, JSON.stringify(cleaned));
  } catch {}
}
export function getVideoState(videoId) {
  const states = getVideoStates();
  return states[videoId]?.time || 0;
}

export function getWatched() {
  try { return parseInt(localStorage.getItem(KEYS.WATCHED) || '0'); } catch { return 0; }
}
export function incWatched() {
  const n = getWatched() + 1;
  try { localStorage.setItem(KEYS.WATCHED, String(n)); } catch {}
  return n;
}

// Async storage (IndexedDB via localforage) for large data
export async function getBgImages() {
  try {
    const imgs = await localforage.getItem(KEYS.BG_IMAGES);
    return imgs || [];
  } catch { return []; }
}
export async function saveBgImage(imageData) {
  try {
    const imgs = await getBgImages();
    imgs.push({ id: Date.now(), data: imageData });
    await localforage.setItem(KEYS.BG_IMAGES, imgs);
    return imgs;
  } catch { return []; }
}
export async function removeBgImage(id) {
  try {
    const imgs = await getBgImages();
    const filtered = imgs.filter(i => i.id !== id);
    await localforage.setItem(KEYS.BG_IMAGES, filtered);
    return filtered;
  } catch { return []; }
}
export async function clearBgImages() {
  try { await localforage.removeItem(KEYS.BG_IMAGES); } catch {}
}

// Downloaded videos (metadata)
export async function getDownloaded() {
  try {
    const d = await localforage.getItem(KEYS.DOWNLOADED);
    return d || [];
  } catch { return []; }
}
export async function saveDownloaded(video) {
  try {
    const list = await getDownloaded();
    if (list.find(v => v.videoId === video.videoId)) return list;
    list.push({ ...video, savedAt: Date.now() });
    await localforage.setItem(KEYS.DOWNLOADED, list);
    return list;
  } catch { return []; }
}
export async function removeDownloaded(videoId) {
  try {
    const list = await getDownloaded();
    const filtered = list.filter(v => v.videoId !== videoId);
    await localforage.setItem(KEYS.DOWNLOADED, filtered);
    return filtered;
  } catch { return []; }
}