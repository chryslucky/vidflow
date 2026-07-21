import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiDownload, FiTrash2, FiPlay, FiExternalLink } from 'react-icons/fi';
import { getDownloaded, removeDownloaded } from '../utils/storage';
import { openDownload } from '../utils/download';
import { timeAgo } from '../utils/helpers';

export default function DownloadsView({ onBack, onPlay }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getDownloaded().then(setItems);
  }, []);

  const handleRemove = async (id) => {
    const updated = await removeDownloaded(id);
    setItems(updated);
  };

  const handleReDownload = (vid) => {
    openDownload(vid);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 font-display">
          <FiDownload className="text-vf-red" size={22} /> My Downloads
          <span className="text-xs text-vf-gray font-normal">({items.length})</span>
        </h3>
        <button onClick={onBack} className="text-sm text-vf-red hover:underline flex items-center gap-1">
          <FiArrowLeft size={14} /> Home
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-vf-card flex items-center justify-center mx-auto mb-4">
            <FiDownload size={32} className="text-vf-gray" />
          </div>
          <h3 className="text-lg font-bold mb-2">No downloads yet</h3>
          <p className="text-vf-gray text-sm max-w-sm mx-auto">Click the download button on any video to save it here for quick offline access</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.videoId} className="gr-card border border-vf-border rounded-2xl overflow-hidden group animate-cardIn">
              <div className="relative aspect-video cursor-pointer" onClick={() => onPlay(item.videoId)}>
                <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-12 h-12 rounded-full gr-red flex items-center justify-center">
                    <FiPlay size={20} fill="white" />
                  </div>
                </div>
                {item.isShort && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 gr-red rounded-lg text-[10px] font-bold uppercase">Short</span>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-sm font-bold line-clamp-2 mb-1">{item.title}</h4>
                <p className="text-xs text-vf-gray mb-2">{item.channel}</p>
                <p className="text-[10px] text-vf-gray mb-3">Saved {timeAgo(new Date(item.savedAt).toISOString())}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleReDownload(item.videoId)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 gr-red rounded-lg text-xs font-bold hover:opacity-90">
                    <FiExternalLink size={12} /> Get File
                  </button>
                  <button onClick={() => handleRemove(item.videoId)}
                    className="p-2 bg-vf-card border border-vf-border rounded-lg hover:border-vf-red transition-colors">
                    <FiTrash2 size={14} className="text-vf-gray" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}