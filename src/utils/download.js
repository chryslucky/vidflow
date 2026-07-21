// SaveFrom.net is our only download service
export function openDownload(videoId) {
  const url = `https://en.savefrom.net/1-youtube-video-downloader-20/?url=https://www.youtube.com/watch?v=${videoId}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return 'SaveFrom';
}

export function getDownloadUrl(videoId) {
  return `https://en.savefrom.net/1-youtube-video-downloader-20/?url=https://www.youtube.com/watch?v=${videoId}`;
}