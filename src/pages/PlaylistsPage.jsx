import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiArrowLeft, FiList, FiTrash2, FiPlay, FiX } from 'react-icons/fi';

export default function PlaylistsPage() {
  const navigate = useNavigate();
  const { playlists, createPl, deletePl, removeFromPl, handlePlay } = useApp();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 font-display">
          <FiList className="text-vf-red" size={24} /> My Playlists
        </h3>
        <button onClick={() => navigate('/')} className="text-sm text-vf-red hover:underline flex items-center gap-1">
          <FiArrowLeft size={14} /> Home
        </button>
      </div>

      <div className="flex gap-2 mb-6 max-w-md">
        <input type="text" id="plNameInput" placeholder="New playlist name..."
          className="flex-1 bg-vf-card border border-vf-border rounded-xl px-4 py-2.5 text-sm focus:border-vf-red transition-colors"
          onKeyDown={e => { 
            if (e.key === 'Enter' && e.target.value.trim()) { 
              createPl(e.target.value.trim()); 
              e.target.value = ''; 
            } 
          }} />
        <button onClick={() => { 
          const inp = document.getElementById('plNameInput'); 
          if (inp?.value.trim()) { 
            createPl(inp.value.trim()); 
            inp.value = ''; 
          } 
        }}
          className="px-5 py-2.5 gr-red rounded-xl text-sm font-bold">Create</button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-vf-card flex items-center justify-center mx-auto mb-4">
            <FiList size={24} className="text-vf-gray" />
          </div>
          <h3 className="text-lg font-bold mb-2">No playlists</h3>
          <p className="text-vf-gray text-sm">Create your first playlist above</p>
        </div>
      ) : (
        playlists.map((pl, pi) => (
          <div key={pi} className="mb-4 p-5 gr-card border border-vf-border rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-base flex items-center gap-2">
                <FiList className="text-vf-red" size={18} />
                {pl.name}
                <span className="text-xs text-vf-gray font-normal">({pl.videos.length})</span>
              </h4>
              <button onClick={() => deletePl(pi)} className="p-2 hover:bg-vf-border rounded-lg transition-colors">
                <FiTrash2 size={14} className="text-vf-gray" />
              </button>
            </div>
            {pl.videos.length === 0 ? <p className="text-vf-gray text-xs">Empty playlist</p> : (
              <div className="space-y-1.5">
                {pl.videos.map((v, vi) => (
                  <div key={vi} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-vf-border/20 cursor-pointer transition-colors"
                    onClick={() => handlePlay(v.videoId)}>
                    <span className="text-xs text-vf-gray w-6 text-center">{vi + 1}</span>
                    <FiPlay size={12} className="text-vf-red" />
                    <span className="text-sm flex-1 truncate">{v.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFromPl(pi, vi); }} className="p-1.5 hover:bg-vf-border rounded">
                      <FiX size={12} className="text-vf-gray" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}