import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiDownload, FiShare2, FiPlus, FiChevronRight, FiMinimize2, FiPlay, FiEye, FiThumbsUp, FiMessageSquare, FiCalendar, FiUsers, FiBookmark } from 'react-icons/fi';
import { getVideoDetails, getChannelInfo, searchVideos } from '../utils/api';
import { formatNumber, timeAgo, getThumb } from '../utils/helpers';
import { openDownload } from '../utils/download';
import { saveVideoState, getVideoState, saveDownloaded } from '../utils/storage';

export default function VideoModal({ videoId, onClose, onMini, onPlay, onSave, onChannel }) {
  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [related, setRelated] = useState([]);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const startTime = useRef(getVideoState(videoId));
  const iframeRef = useRef(null);
  const saveInterval = useRef(null);

  useEffect(() => {
    if (!videoId) return;
    setIframeLoaded(false);
    setVideo(null);
    setChannel(null);
    setRelated([]);
    setDescExpanded(false);
    startTime.current = getVideoState(videoId);

    (async () => {
      const details = await getVideoDetails([videoId]);
      if (details?.[0]) {
        setVideo(details[0]);
        const chData = await getChannelInfo(details[0].snippet?.channelId);
        if (chData?.items?.[0]) setChannel(chData.items[0]);

        // Load 50 related videos
        const searchQuery = details[0].snippet?.title?.split(' ').slice(0, 4).join(' ') || 'trending';
        const relData = await searchVideos(searchQuery, 50);
        if (relData?.items) {
          setRelated(relData.items.filter(i => i.id?.videoId && i.id.videoId !== videoId));
        }
      }
    })();

    // Simulate saving playback progress every 5 seconds
    saveInterval.current = setInterval(() => {
      const currentTime = startTime.current + Math.floor((Date.now() - startTime._loaded) / 1000);
      if (currentTime > 0) saveVideoState(videoId, currentTime);
    }, 5000);

    return () => {
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [videoId]);

  const handleDownloadSave = async () => {
    if (!video) return;
    await saveDownloaded({
      videoId,
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      thumbnail: getThumb(video.snippet, 'high'),
      duration: video.contentDetails?.duration,
    });
    openDownload(videoId);
  };

  if (!videoId) return null;

  const stats = video?.statistics || {};
  const snippet = video?.snippet || {};
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&iv_load_policy=3&showinfo=0&disablekb=0${startTime.current ? `&start=${Math.floor(startTime.current)}` : ''}`;

  return (
    <div className="fixed inset-0 z-[200] bg-black/[0.97] animate-fadeIn">
      <div className="w-full h-full overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-3 sm:py-5">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-vf-card transition-colors text-sm text-vf-gray hover:text-white">
              <FiArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
            </button>
            <button onClick={() => onMini?.(videoId, snippet.title)} className="p-2 hover:bg-vf-card rounded-xl transition-colors" title="Mini player">
              <FiMinimize2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 shadow-2xl border border-vf-border/50">
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-12 h-12 rounded-full border-2 border-vf-border animate-spin" style={{ borderTopColor: '#e50914' }} />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  className={`w-full h-full relative z-10 transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => {
                    setIframeLoaded(true);
                    startTime._loaded = Date.now();
                  }} />
              </div>

              {video && (
                <div className="space-y-3 animate-slideUp">
                  <h1 className="text-lg sm:text-2xl font-black leading-tight font-display">{snippet.title}</h1>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-vf-gray">
                    <span className="flex items-center gap-1"><FiEye size={14} className="text-vf-red" />{formatNumber(stats.viewCount)} views</span>
                    <span className="flex items-center gap-1"><FiThumbsUp size={14} className="text-vf-red" />{formatNumber(stats.likeCount)}</span>
                    <span className="flex items-center gap-1"><FiMessageSquare size={14} className="text-vf-red" />{formatNumber(stats.commentCount)}</span>
                    <span className="flex items-center gap-1"><FiCalendar size={14} className="text-vf-red" />{timeAgo(snippet.publishedAt)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleDownloadSave}
                      className="flex items-center gap-2 px-5 py-2.5 gr-red rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-red-900/30">
                      <FiDownload size={14} /> Download
                    </button>
                    <button onClick={handleDownloadSave}
                      className="flex items-center gap-2 px-4 py-2.5 bg-vf-card border border-vf-border rounded-2xl text-sm hover:border-vf-red transition-colors">
                      <FiBookmark size={14} /> Save for Later
                    </button>
                    <button onClick={() => {
                      const url = `https://youtube.com/watch?v=${videoId}`;
                      if (navigator.share) navigator.share({ title: snippet.title, url });
                      else navigator.clipboard.writeText(url);
                    }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-vf-card border border-vf-border rounded-2xl text-sm hover:border-vf-red transition-colors">
                      <FiShare2 size={14} /> Share
                    </button>
                    <button onClick={() => onSave?.(videoId, snippet.title)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-vf-card border border-vf-border rounded-2xl text-sm hover:border-vf-red transition-colors">
                      <FiPlus size={14} /> Playlist
                    </button>
                  </div>

                  {channel && (
                    <div className="flex items-center gap-3 p-4 bg-vf-card rounded-2xl border border-vf-border cursor-pointer hover:border-vf-red transition-colors group"
                      onClick={() => onChannel?.(channel.id)}>
                      <img src={getThumb(channel.snippet, 'default')} className="w-12 h-12 rounded-full ring-2 ring-vf-red/30" alt="" />
                      <div className="flex-1">
                        <p className="text-sm font-bold group-hover:text-vf-red transition-colors">{channel.snippet?.title}</p>
                        <p className="text-xs text-vf-gray flex items-center gap-1 mt-0.5">
                          <FiUsers size={11} />{formatNumber(channel.statistics?.subscriberCount)} subscribers
                        </p>
                      </div>
                      <FiChevronRight size={18} className="text-vf-gray group-hover:text-vf-red transition-colors" />
                    </div>
                  )}

                  <div className="p-4 bg-vf-card rounded-2xl border border-vf-border">
                    <p className={`text-xs text-vf-light leading-relaxed cursor-pointer whitespace-pre-line ${descExpanded ? '' : 'line-clamp-3'}`}
                      onClick={() => setDescExpanded(!descExpanded)}>
                      {snippet.description || 'No description'}
                    </p>
                    <button className="text-xs text-vf-red font-semibold mt-2" onClick={() => setDescExpanded(!descExpanded)}>
                      {descExpanded ? 'Show less' : 'Show more'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                <FiPlay size={16} className="text-vf-red" /> Up Next
                <span className="ml-auto text-[10px] text-vf-gray">{related.length}</span>
              </h3>
              <div className="space-y-2 max-h-[80vh] overflow-y-auto pr-1">
                {related.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-36 aspect-video skeleton rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 skeleton rounded w-full" />
                      <div className="h-2.5 skeleton rounded w-2/3" />
                    </div>
                  </div>
                ))}
                {related.map((v, i) => (
                  <div key={i} className="flex gap-2.5 p-2 rounded-xl hover:bg-vf-card cursor-pointer transition-colors group animate-cardIn"
                    style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
                    onClick={() => onPlay?.(v.id?.videoId)}>
                    <div className="w-32 sm:w-36 aspect-video rounded-xl overflow-hidden flex-shrink-0 relative bg-vf-card">
                      <img src={getThumb(v.snippet, 'medium')} className="w-full h-full object-cover no-drag" loading="lazy" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <FiPlay size={18} fill="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <p className="text-xs font-bold line-clamp-2 group-hover:text-vf-red transition-colors leading-tight">{v.snippet?.title}</p>
                      <p className="text-[10px] text-vf-gray mt-1">{v.snippet?.channelTitle}</p>
                      <p className="text-[10px] text-vf-gray">{timeAgo(v.snippet?.publishedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}