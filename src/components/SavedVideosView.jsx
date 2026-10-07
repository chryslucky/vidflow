import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiTrash2, FiPlay, FiBookmark } from 'react-icons/fi';
import { getSavedVideos, removeSavedVideo } from '../utils/storage';

export default function SavedVideosView({ onBack, onPlay }) {
  const [items, setItems] = useState([]);
  useEffect(() => { getSavedVideos().then(setItems); }, []);
  const remove = async (id) => setItems(await removeSavedVideo(id));
  return <div>
    <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold flex items-center gap-2"><FiBookmark className="text-vf-red"/> Saved Videos <span className="text-xs text-vf-gray">({items.length})</span></h3><button onClick={onBack} className="text-sm text-vf-red flex items-center gap-1"><FiArrowLeft/> Home</button></div>
    {!items.length ? <div className="text-center py-20"><FiBookmark size={32} className="mx-auto mb-4 text-vf-gray"/><h3 className="text-lg font-bold mb-2">Nothing saved yet</h3><p className="text-vf-gray text-sm">Save videos while browsing and they will appear here.</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(item=><div key={item.videoId} className="gr-card border border-vf-border rounded-2xl overflow-hidden"><button className="relative aspect-video w-full" onClick={()=>onPlay(item.videoId)}><img src={item.thumbnail} className="w-full h-full object-cover" alt=""/><span className="absolute inset-0 flex items-center justify-center"><span className="w-12 h-12 rounded-full gr-red flex items-center justify-center"><FiPlay size={20} fill="white"/></span></span></button><div className="p-3"><h4 className="text-sm font-bold line-clamp-2">{item.title}</h4><p className="text-xs text-vf-gray mt-1">{item.channel}</p><button onClick={()=>remove(item.videoId)} className="mt-3 px-3 py-2 bg-vf-card border border-vf-border rounded-lg text-xs flex items-center gap-1"><FiTrash2/> Remove</button></div></div>)}</div>}
  </div>;
}
