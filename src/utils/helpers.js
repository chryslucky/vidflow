export function formatNumber(num) {
  if (!num) return '0';
  const n = parseInt(num);
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}

export function timeAgo(dateString) {
  if (!dateString) return '';
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return 'now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  if (diff < 2592000) return Math.floor(diff / 604800) + 'w ago';
  if (diff < 31536000) return Math.floor(diff / 2592000) + 'mo ago';
  return Math.floor(diff / 31536000) + 'y ago';
}

export function parseDuration(dur) {
  if (!dur) return '';
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '';
  const h = m[1] ? m[1] + ':' : '';
  const mm = m[2] ? m[2].padStart(h ? 2 : 1, '0') : '0';
  const ss = m[3] ? m[3].padStart(2, '0') : '00';
  return h + mm + ':' + ss;
}

export function getThumb(snippet, quality = 'medium') {
  return snippet?.thumbnails?.[quality]?.url
    || snippet?.thumbnails?.high?.url
    || snippet?.thumbnails?.default?.url
    || '';
}

export function getVideoId(item) {
  if (typeof item === 'string') return item;
  return item?.id?.videoId || item?.id || '';
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}