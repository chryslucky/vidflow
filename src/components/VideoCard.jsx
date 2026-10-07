import React from 'react';
import { FiPlay, FiPlus, FiEye, FiClock, FiMoreVertical, FiShare2 } from 'react-icons/fi';
import { formatNumber, timeAgo, parseDuration, getThumb, getVideoId } from '../utils/helpers';
import { getVideoState } from '../utils/storage';

export default function VideoCard({ video, onPlay, onChannel, onSave, index = 0 }) {
  const vid = getVideoId(video);
  const stats = video.statistics || {};
  const duration = parseDuration(video.contentDetails?.duration);
  const snippet = video.snippet || {};
  const savedTime = getVideoState(vid);
  const durationSec = parseDurationSec(video.contentDetails?.duration);
  const progressPct = savedTime && durationSec ? Math.min(100, (savedTime / durationSec) * 100) : 0;

  return (
    <div
      className="group cursor-pointer animate-cardIn"
      style={{ animationDelay: `${Math.min(index * 25, 400)}ms` }}
      onClick={() => onPlay?.(vid)}>
      
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-vf-card mb-3 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-red-900/20">
        <img 
          src={getThumb(snippet, 'high')} 
          alt={snippet.title || ''}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 no-drag"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/480x270/141414/333?text=VidFlow'; }} 
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button center */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="relative">
            <div className="absolute inset-0 gr-red rounded-full blur-lg opacity-70 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full gr-red flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
              <FiPlay size={26} className="ml-1 text-white" fill="white" />
            </div>
          </div>
        </div>

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/90 backdrop-blur-md rounded-lg text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-lg">
            <FiClock size={9} className="text-vf-red" />
            <span>{duration}</span>
          </div>
        )}

        {/* Continue watching badge */}
        {progressPct > 5 && progressPct < 95 && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-bold flex items-center gap-1 border border-vf-red/30 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-vf-red animate-pulse" />
            <span>Resume</span>
          </div>
        )}

        {/* Save button (visible on hover) */}
        <button 
          className="absolute top-2 right-2 w-9 h-9 bg-black/70 backdrop-blur-md rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 hover:bg-vf-red border border-white/10 hover:border-transparent"
          onClick={(e) => { e.stopPropagation(); onSave?.(vid, snippet.title); }}
          title="Save to playlist">
          <FiPlus size={14} />
        </button>

        {/* Progress bar */}
        {progressPct > 5 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
            <div className="h-full gr-red shadow-lg shadow-red-500/50" style={{ width: `${progressPct}%` }} />
          </div>
        )}

        {/* Views badge (top-left when no continue) */}
        {(!progressPct || progressPct < 5) && stats.viewCount && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[9px] font-bold flex items-center gap-1 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FiEye size={9} className="text-vf-red" />
            <span>{formatNumber(stats.viewCount)}</span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex gap-3 px-1">
        <img 
          src={getThumb(snippet, 'default')}
          className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-vf-red transition-all no-drag object-cover"
          onClick={(e) => { e.stopPropagation(); onChannel?.(snippet.channelId); }}
          loading="lazy" 
          alt=""
          onError={(e) => { e.target.src = 'https://placehold.co/40/222/666?text=' + (snippet.channelTitle?.[0] || 'C'); }} 
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-bold line-clamp-2 group-hover:text-vf-red transition-colors leading-snug mb-1">
            {snippet.title || 'Untitled'}
          </h4>
          <p 
            className="text-xs text-vf-gray hover:text-vf-light cursor-pointer transition-colors font-medium truncate mb-1"
            onClick={(e) => { e.stopPropagation(); onChannel?.(snippet.channelId); }}>
            {snippet.channelTitle || ''}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-vf-gray font-medium">
            {stats.viewCount && (
              <>
                <span>{formatNumber(stats.viewCount)} views</span>
                <span className="text-vf-gray/50">•</span>
              </>
            )}
            <span>{timeAgo(snippet.publishedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 self-start flex-shrink-0">
          <button
            className="p-2 bg-black/60 rounded-full hover:bg-vf-red transition-colors md:opacity-0 md:group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onSave?.(vid, snippet.title); }}
            aria-label="Save video"
            title="Save video">
            <FiPlus size={15} />
          </button>
          <button
            className="p-2 bg-black/60 rounded-full hover:bg-vf-red transition-colors md:opacity-0 md:group-hover:opacity-100"
            onClick={async (e) => { e.stopPropagation(); const url = `https://www.youtube.com/watch?v=${vid}`; try { if (navigator.share) await navigator.share({ title: snippet.title, url }); else await navigator.clipboard.writeText(url); } catch {} }}
            aria-label="Share video"
            title="Share video">
            <FiShare2 size={15} />
          </button>
          <button
            className="p-2 bg-black/60 rounded-full hover:bg-vf-card transition-colors md:opacity-0 md:group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onSave?.(vid, snippet.title); }}
            aria-label="More actions"
            title="More actions">
            <FiMoreVertical size={16} className="text-vf-gray" />
          </button>
        </div>
      </div>
    </div>
  );
}

function parseDurationSec(dur) {
  if (!dur) return 0;
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}