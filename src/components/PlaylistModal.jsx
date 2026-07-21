import React, { useState } from 'react';
import { FiX, FiList, FiPlus } from 'react-icons/fi';

export default function PlaylistModal({ playlists, onClose, onAdd, onCreate }) {
  const [newName, setNewName] = useState('');

  return (
    <div className="fixed inset-0 z-[250]">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-md bg-vf-dark rounded-2xl border border-vf-border shadow-2xl">
          <div className="p-4 border-b border-vf-border flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FiList className="text-vf-red" size={16} /> Add to Playlist
            </h3>
            <button onClick={onClose} className="p-1.5 hover:bg-vf-card rounded-lg"><FiX size={16} /></button>
          </div>
          <div className="p-4 max-h-52 overflow-y-auto">
            {playlists.length === 0 && (
              <p className="text-vf-gray text-sm text-center py-4">No playlists yet. Create one below.</p>
            )}
            {playlists.map((pl, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-vf-card cursor-pointer transition-colors"
                onClick={() => onAdd(i)}>
                <FiList size={16} className="text-vf-red" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{pl.name}</p>
                  <p className="text-[10px] text-vf-gray">{pl.videos.length} videos</p>
                </div>
                <FiPlus size={14} className="text-vf-gray" />
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-vf-border flex gap-2">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) { onCreate(newName.trim()); setNewName(''); } }}
              placeholder="New playlist name..."
              className="flex-1 bg-vf-card border border-vf-border rounded-xl px-3 py-2 text-sm focus:border-vf-red transition-colors" />
            <button onClick={() => { if (newName.trim()) { onCreate(newName.trim()); setNewName(''); } }}
              className="px-4 py-2 gr-red rounded-xl text-sm font-bold">Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}