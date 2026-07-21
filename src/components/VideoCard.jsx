import React from 'react';
import { FiPlay, FiPlus, FiEye, FiThumbsUp, FiClock, FiCheck } from 'react-icons/fi';
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
      className="card-hover cursor-pointer group animate-cardIn"
      style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
      onClick={() => onPlay?.(vid)}>
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-vf-card">
        <img src={getThumb(snippet, 'high')} alt={snippet.title || ''}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 no-drag"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/480x270/141414/333?text=VidFlow'; }} />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full gr-red flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-500 shadow-2xl shadow-red-900/60">
            <FiPlay size={26} className="ml-1 text-white" fill="white" />
          </div>
        </div>

        {/* Duration */}
        {duration && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/90 rounded-lg text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 border border-white/10">
            <FiClock size={9} />{duration}
          </span>
        )}

        {/* Watched progress bar */}
        {progressPct > 5 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div className="h-full gr-red" style={{ width: `${progressPct}%` }} />
          </div>
        )}

        {/* Continue watching badge */}
        {progressPct > 5 && progressPct < 95 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-vf-red rounded-lg text-[9px] font-bold flex items-center gap-1">
            <FiCheck size={9} /> Continue
          </span>
        )}

        {/* Save button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-4px] group-hover:translate-y-0">
          <button className="w-8 h-8 bg-black/70 backdrop-blur rounded-xl flex items-center justify-center hover:bg-vf-red transition-colors border border-white/10"
            onClick={(e) => { e.stopPropagation(); onSave?.(vid, snippet.title); }}>
            <FiPlus size={14} />
          </button>
        </div>
      </div>

      <div className="pt-3.5 flex gap-3">
        <img src={getThumb(snippet, 'default')}
          className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-vf-red transition-all no-drag"
          onClick={(e) => { e.stopPropagation(); onChannel?.(snippet.channelId); }}
          loading="lazy" alt=""
          onError={(e) => { e.target.src = 'https://placehold.co/40/222/666?text=C'; }} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold line-clamp-2 group-hover:text-vf-red transition-colors leading-snug">
            {snippet.title || 'Untitled'}
          </h4>
          <p className="text-xs text-vf-gray mt-1 hover:text-white cursor-pointer transition-colors font-medium"
            onClick={(e) => { e.stopPropagation(); onChannel?.(snippet.channelId); }}>
            {snippet.channelTitle || ''}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-vf-gray mt-1">
            {stats.viewCount && (
              <><span className="flex items-center gap-0.5"><FiEye size={10} />{formatNumber(stats.viewCount)}</span><span>·</span></>
            )}
            <span>{timeAgo(snippet.publishedAt)}</span>
            {stats.likeCount && (
              <><span>·</span><span className="flex items-center gap-0.5"><FiThumbsUp size={10} />{formatNumber(stats.likeCount)}</span></>
            )}
          </div>
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