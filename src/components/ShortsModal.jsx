import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiDownload, FiShare2, FiBookmark, FiUser, FiPlay, FiPause } from 'react-icons/fi';
import { openDownload } from '../utils/download';
import { saveVideoState, getVideoState, saveDownloaded } from '../utils/storage';
import { getShorts, searchVideos } from '../utils/api';

export default function ShortsModal({ shorts: initialShorts, startIndex, onClose, onSave, query, userCountry }) {
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const [shorts, setShorts] = useState(initialShorts || []);
  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Load more shorts to reach up to 300
  const loadMoreShorts = async () => {
    if (loadingRef.current || shorts.length >= 300) return;
    loadingRef.current = true;
    setLoading(true);
    const data = query
      ? await searchVideos(query + ' shorts', 30, pageToken, false)
      : await getShorts('trending shorts', 30, userCountry || 'US', pageToken);
    if (data?.items) {
      const newShorts = data.items.filter(i => i.id?.videoId);
      setShorts(prev => [...prev, ...newShorts]);
      setPageToken(data.nextPageToken || null);
    }
    setLoading(false);
    loadingRef.current = false;
  };

  useEffect(() => {
    if (!containerRef.current || !shorts?.length) return;
    const items = containerRef.current.querySelectorAll('.short-item');
    if (items[startIndex]) {
      setTimeout(() => items[startIndex].scrollIntoView({ behavior: 'instant' }), 50);
    }
  }, [startIndex]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const iframe = entry.target.querySelector('iframe');
        const idx = parseInt(entry.target.dataset.idx);
        if (!iframe) return;

        if (entry.isIntersecting) {
          // Load and play
          const vid = entry.target.dataset.vid;
          const start = getVideoState(vid);
          const src = `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&loop=1&controls=1&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3${start ? `&start=${Math.floor(start)}` : ''}&playlist=${vid}`;
          if (iframe.src !== src) iframe.src = src;

          // Load more when near end
          if (idx >= shorts.length - 3 && shorts.length < 300) {
            loadMoreShorts();
          }
        } else {
          // Pause by clearing src
          if (iframe.src && !iframe.src.includes('about:blank')) {
            const vid = entry.target.dataset.vid;
            // Save the time (approximate)
            saveVideoState(vid, 0);
            iframe.src = 'about:blank';
          }
        }
      });
    }, { root: containerRef.current, threshold: 0.7 });

    const items = containerRef.current.querySelectorAll('.short-item');
    items.forEach(item => observerRef.current.observe(item));
    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line
  }, [shorts]);

  const handleDownload = async (s, vid) => {
    await saveDownloaded({
      videoId: vid,
      title: s.snippet?.title,
      channel: s.snippet?.channelTitle,
      thumbnail: s.snippet?.thumbnails?.high?.url || s.snippet?.thumbnails?.default?.url,
      isShort: true,
    });
    openDownload(vid);
  };

  if (!shorts?.length) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      <button onClick={onClose} className="absolute top-4 left-4 z-50 p-3 bg-black/60 hover:bg-vf-card backdrop-blur rounded-full transition-colors border border-white/10">
        <FiX size={20} />
      </button>

      <div className="absolute top-4 right-4 z-50 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full border border-white/10">
        <span className="text-xs font-bold">{shorts.length} shorts</span>
      </div>

      <div ref={containerRef} className="shorts-container w-full h-full">
        {shorts.map((s, i) => {
          const vid = s.id?.videoId || s.id;
          return (
            <div key={`${vid}-${i}`} className="short-item relative bg-black flex items-center justify-center" data-idx={i} data-vid={vid}>
              <div className="relative w-full max-w-[440px] mx-auto h-full">
                <iframe className="w-full h-full absolute inset-0"
                  src="about:blank"
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope"
                  allowFullScreen />

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 pb-6 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none">
                  <p className="text-sm font-bold mb-1.5 leading-tight line-clamp-2">{s.snippet?.title}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full gr-red flex items-center justify-center">
                      <FiUser size={10} />
                    </div>
                    <p className="text-xs text-vf-light font-medium">{s.snippet?.channelTitle}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute right-3 bottom-32 flex flex-col gap-3 items-center">
                  <button className="w-12 h-12 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-vf-red transition-colors border border-white/10"
                    onClick={() => handleDownload(s, vid)}>
                    <FiDownload size={18} />
                  </button>
                  <button className="w-12 h-12 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-vf-red transition-colors border border-white/10"
                    onClick={() => {
                      const url = `https://youtube.com/watch?v=${vid}`;
                      if (navigator.share) navigator.share({ url });
                      else navigator.clipboard.writeText(url);
                    }}>
                    <FiShare2 size={18} />
                  </button>
                  <button className="w-12 h-12 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-vf-red transition-colors border border-white/10"
                    onClick={() => onSave?.(vid, s.snippet?.title)}>
                    <FiBookmark size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="short-item flex items-center justify-center bg-black">
            <div className="w-12 h-12 rounded-full border-2 border-vf-border animate-spin" style={{ borderTopColor: '#e50914' }} />
          </div>
        )}
      </div>
    </div>
  );
}