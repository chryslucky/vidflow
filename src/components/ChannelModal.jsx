import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiUsers, FiVideo, FiEye, FiPlay } from 'react-icons/fi';
import { getChannelInfo, getChannelVideos, getVideoDetails } from '../utils/api';
import { formatNumber, getThumb } from '../utils/helpers';
import VideoCard from './VideoCard';
import SkeletonGrid from './SkeletonGrid';

export default function ChannelModal({ channelId, onClose, onPlay, onSave }) {
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId) return;
    setLoading(true);
    (async () => {
      const [chData, vidData] = await Promise.all([
        getChannelInfo(channelId),
        getChannelVideos(channelId),
      ]);
      if (chData?.items?.[0]) setChannel(chData.items[0]);
      if (vidData?.items) {
        const ids = vidData.items.map(i => i.id?.videoId).filter(Boolean);
        const details = await getVideoDetails(ids);
        setVideos(details);
      }
      setLoading(false);
    })();
  }, [channelId]);

  if (!channelId) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/[0.97]">
      <div className="w-full h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-vf-card transition-colors text-sm text-vf-gray hover:text-white mb-4">
            <FiArrowLeft size={16} /> Back
          </button>
          {channel && (
            <>
              <div className="relative rounded-3xl overflow-hidden mb-6">
                {channel.brandingSettings?.image?.bannerExternalUrl ? (
                  <img src={channel.brandingSettings.image.bannerExternalUrl} className="w-full h-36 sm:h-52 object-cover" alt="" />
                ) : (
                  <div className="w-full h-36 sm:h-52 gr-red" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex items-end gap-4">
                  <img src={getThumb(channel.snippet, 'medium')} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-vf-red shadow-lg" alt="" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold">{channel.snippet?.title}</h2>
                    <div className="flex flex-wrap gap-3 text-xs text-vf-gray mt-1">
                      <span className="flex items-center gap-1"><FiUsers size={12} />{formatNumber(channel.statistics?.subscriberCount)} subs</span>
                      <span className="flex items-center gap-1"><FiVideo size={12} />{formatNumber(channel.statistics?.videoCount)} videos</span>
                      <span className="flex items-center gap-1"><FiEye size={12} />{formatNumber(channel.statistics?.viewCount)} views</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-vf-light mb-6 line-clamp-3 leading-relaxed">{channel.snippet?.description}</p>
            </>
          )}
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <FiPlay className="text-vf-red" size={16} /> Latest Videos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <SkeletonGrid count={6} /> :
              videos.map(v => (
                <VideoCard key={v.id} video={v} onPlay={onPlay} onSave={onSave} onChannel={() => {}} />
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}