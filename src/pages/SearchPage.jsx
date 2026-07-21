import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { searchVideosFull, searchShorts, searchChannels } from '../utils/api';
import { getVideoId, getThumb } from '../utils/helpers';
import VideoCard from '../components/VideoCard';
import SkeletonGrid from '../components/SkeletonGrid';
import { FiSearch, FiArrowLeft, FiPlay, FiZap } from 'react-icons/fi';

export default function SearchPage() {
  const { query } = useParams();
  const navigate = useNavigate();
  const { handlePlay, handleSave, setChannelId, setShortsModal, user } = useApp();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchQuery = decodeURIComponent(query || '');

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setResults(null);

    try {
      const [videoResult, shortsResult, channelsResult] = await Promise.all([
        searchVideosFull(searchQuery, 30),
        searchShorts(searchQuery, 15),
        searchChannels(searchQuery, 6),
      ]);

      setResults({
        videos: videoResult?.videos || [],
        shorts: shortsResult?.items?.filter(i => i.id?.videoId) || [],
        channels: channelsResult?.items?.filter(i => i.id?.channelId) || [],
      });
    } catch (err) {
      console.error('Search error:', err);
      setResults({ videos: [], shorts: [], channels: [] });
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    performSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [performSearch]);

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-vf-gray text-xs mb-2 font-medium uppercase tracking-widest">
            <FiSearch size={12} /> Search Results
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-display">
            "<span className="text-gradient">{searchQuery}</span>"
          </h3>
          {results && (
            <p className="text-xs text-vf-gray mt-2">
              Found {results.videos.length} videos
              {results.shorts.length > 0 && `, ${results.shorts.length} shorts`}
              {results.channels.length > 0 && `, ${results.channels.length} channels`}
            </p>
          )}
        </div>
        <button onClick={() => navigate('/')} className="text-sm text-vf-red hover:underline flex items-center gap-1 flex-shrink-0">
          <FiArrowLeft size={14} /> Home
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <SkeletonGrid count={8} />
        </div>
      ) : results && (results.videos.length > 0 || results.shorts.length > 0 || results.channels.length > 0) ? (
        <div className="space-y-10">
          {results.channels.length > 0 && (
            <div>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2 font-display">
                <FiPlay className="text-vf-red" size={18} /> Channels
              </h4>
              <div className="hscroll flex gap-4 pb-2">
                {results.channels.map((ch, i) => (
                  <div key={i}
                    onClick={() => setChannelId(ch.id?.channelId)}
                    className="flex-shrink-0 w-52 gr-card border border-vf-border rounded-2xl p-5 text-center cursor-pointer hover:border-vf-red transition-all animate-cardIn"
                    style={{ animationDelay: `${i * 60}ms` }}>
                    <img src={getThumb(ch.snippet, 'medium')}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover ring-2 ring-vf-red/30"
                      alt="" />
                    <p className="text-sm font-bold truncate">{ch.snippet?.title}</p>
                    <p className="text-[11px] text-vf-gray line-clamp-2 mt-1">{ch.snippet?.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.shorts.length > 0 && (
            <div>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2 font-display">
                <FiZap className="text-vf-red" size={18} /> Shorts
              </h4>
              <div className="hscroll flex gap-4 pb-2">
                {results.shorts.map((s, i) => (
                  <div key={i} className="flex-shrink-0 w-[170px] sm:w-[190px] cursor-pointer group animate-cardIn"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => setShortsModal({ shorts: results.shorts, startIndex: i, query: searchQuery })}>
                    <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-vf-card shadow-lg group-hover:shadow-2xl group-hover:shadow-red-900/30 transition-all group-hover:scale-[1.03]">
                      <img src={getThumb(s.snippet, 'high')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      <div className="absolute bottom-0 p-3">
                        <p className="text-xs font-bold line-clamp-2">{s.snippet?.title}</p>
                        <p className="text-[10px] text-vf-gray truncate mt-1">{s.snippet?.channelTitle}</p>
                      </div>
                      <span className="absolute top-2 left-2 px-2 py-1 gr-red rounded-lg text-[9px] font-black uppercase"><FiZap size={9} className="inline" /> Short</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.videos.length > 0 && (
            <div>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2 font-display">
                <FiPlay className="text-vf-red" size={18} /> Videos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.videos.map((v, i) => (
                  <VideoCard key={`sr-${getVideoId(v)}-${i}`} video={v} index={i} onPlay={handlePlay} onChannel={setChannelId} onSave={handleSave} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-vf-card flex items-center justify-center mx-auto mb-4">
            <FiSearch size={32} className="text-vf-gray" />
          </div>
          <h3 className="text-lg font-bold mb-2">No results found</h3>
          <p className="text-vf-gray text-sm max-w-sm mx-auto">Try different keywords or check your spelling</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2.5 gr-red rounded-xl text-sm font-bold">
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}