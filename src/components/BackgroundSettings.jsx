import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiImage, FiDroplet, FiLayers, FiPlay, FiPause, FiTrash2, FiPlus, FiUpload, FiCheck } from 'react-icons/fi';
import { GRADIENT_PRESETS } from './BackgroundManager';
import { getBgImages, saveBgImage, removeBgImage } from '../utils/storage';

const SOLID_COLORS = [
  '#050505', '#0c0c0c', '#141414', '#1a1a1a', '#1e1e2e', '#22223b',
  '#1a1a2e', '#16213e', '#0f3460', '#533483', '#e50914', '#b30710',
];

export default function BackgroundSettings({ settings, onSave, onClose }) {
  const [tab, setTab] = useState(settings.type || 'none');
  const [value, setValue] = useState(settings.value);
  const [slideshow, setSlideshow] = useState(settings.slideshow || false);
  const [interval, setInterval] = useState(settings.interval || 8);
  const [slideshowItems, setSlideshowItems] = useState(settings.slideshowItems || []);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    getBgImages().then(setUploadedImages);
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large (max 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const src = ev.target.result;
      const imgs = await saveBgImage(src);
      setUploadedImages(imgs);
      if (tab === 'image') setValue(src);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = async (id) => {
    const imgs = await removeBgImage(id);
    setUploadedImages(imgs);
  };

  const toggleSlideshowItem = (item) => {
    const idx = slideshowItems.findIndex(i => i.value === item.value && i.type === item.type);
    if (idx > -1) {
      setSlideshowItems(prev => prev.filter((_, i) => i !== idx));
    } else {
      setSlideshowItems(prev => [...prev, item]);
    }
  };

  const isSelected = (item) => slideshowItems.some(i => i.value === item.value && i.type === item.type);

  const handleSave = () => {
    onSave({
      type: tab,
      value: tab === 'slideshow' ? null : value,
      slideshow: tab === 'slideshow',
      interval,
      slideshowItems: tab === 'slideshow' ? slideshowItems : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9500]">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full h-full overflow-y-auto flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-vf-dark rounded-3xl border border-vf-border shadow-2xl overflow-hidden animate-scaleIn">
          <div className="p-5 border-b border-vf-border/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FiLayers className="text-vf-red" /> Background Settings
              </h3>
              <p className="text-xs text-vf-gray mt-0.5">Customize your VidFlow experience</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-vf-card rounded-xl">
              <FiX size={20} />
            </button>
          </div>

          <div className="flex gap-1 p-2 border-b border-vf-border/30 overflow-x-auto hscroll">
            {[
              { id: 'none', label: 'None', Icon: FiX },
              { id: 'image', label: 'Image', Icon: FiImage },
              { id: 'gradient', label: 'Gradient', Icon: FiDroplet },
              { id: 'color', label: 'Color', Icon: FiDroplet },
              { id: 'slideshow', label: 'Slideshow', Icon: FiPlay },
            ].map(t => (
              <button key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  tab === t.id ? 'gr-red text-white' : 'text-vf-gray hover:bg-vf-card'
                }`}>
                <t.Icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 max-h-[50vh] overflow-y-auto">
            {tab === 'none' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-vf-card flex items-center justify-center mx-auto mb-3">
                  <FiX size={24} className="text-vf-gray" />
                </div>
                <p className="text-sm text-vf-gray">No background — pure black theme</p>
              </div>
            )}

            {tab === 'image' && (
              <div>
                <button onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-vf-card border-2 border-dashed border-vf-border hover:border-vf-red rounded-xl transition-colors mb-4 text-sm">
                  <FiUpload /> Upload New Image
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

                {uploadedImages.length === 0 ? (
                  <p className="text-vf-gray text-sm text-center py-6">No images yet. Upload one above.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedImages.map(img => (
                      <div key={img.id} className="relative group cursor-pointer" onClick={() => setValue(img.data)}>
                        <img src={img.data} className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${value === img.data ? 'border-vf-red' : 'border-vf-border'}`} alt="" />
                        {value === img.data && (
                          <div className="absolute top-1 right-1 w-5 h-5 gr-red rounded-full flex items-center justify-center">
                            <FiCheck size={10} />
                          </div>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveImage(img.id); }}
                          className="absolute top-1 left-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiTrash2 size={10} className="text-vf-red" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'gradient' && (
              <div className="grid grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map(g => (
                  <button key={g.name} onClick={() => setValue(g.value)}
                    className={`relative h-24 rounded-xl border-2 transition-all overflow-hidden ${value === g.value ? 'border-white' : 'border-vf-border'}`}
                    style={{ background: g.value }}>
                    <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-white drop-shadow">{g.name}</span>
                    {value === g.value && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <FiCheck size={10} className="text-vf-red" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {tab === 'color' && (
              <div>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {SOLID_COLORS.map(c => (
                    <button key={c} onClick={() => setValue(c)}
                      className={`relative h-16 rounded-xl border-2 transition-all ${value === c ? 'border-white' : 'border-vf-border'}`}
                      style={{ background: c }}>
                      {value === c && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <FiCheck size={8} className="text-vf-red" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <label className="text-xs font-medium text-vf-gray block mb-2">Custom Color</label>
                <input type="color" value={value || '#141414'} onChange={e => setValue(e.target.value)}
                  className="w-full h-12 rounded-xl border border-vf-border cursor-pointer bg-vf-card" />
              </div>
            )}

            {tab === 'slideshow' && (
              <div>
                <div className="flex items-center gap-3 mb-4 p-3 bg-vf-card rounded-xl border border-vf-border">
                  <label className="text-xs font-semibold flex-1">Interval (seconds)</label>
                  <input type="number" min="3" max="60" value={interval} onChange={e => setInterval(parseInt(e.target.value) || 8)}
                    className="w-20 bg-vf-dark border border-vf-border rounded-lg px-3 py-1.5 text-sm text-center" />
                </div>

                <p className="text-xs text-vf-gray mb-2">Selected: {slideshowItems.length}</p>

                <h4 className="text-xs font-bold text-vf-gray uppercase mb-2 mt-4">Your Images</h4>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {uploadedImages.map(img => {
                    const item = { type: 'image', value: img.data };
                    return (
                      <div key={img.id} className="relative cursor-pointer" onClick={() => toggleSlideshowItem(item)}>
                        <img src={img.data} className={`w-full h-16 object-cover rounded-lg border-2 ${isSelected(item) ? 'border-vf-red' : 'border-vf-border'}`} alt="" />
                        {isSelected(item) && <div className="absolute top-1 right-1 w-4 h-4 gr-red rounded-full flex items-center justify-center"><FiCheck size={8} /></div>}
                      </div>
                    );
                  })}
                </div>

                <h4 className="text-xs font-bold text-vf-gray uppercase mb-2 mt-4">Gradients</h4>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {GRADIENT_PRESETS.map(g => {
                    const item = { type: 'gradient', value: g.value };
                    return (
                      <button key={g.name} onClick={() => toggleSlideshowItem(item)}
                        className={`relative h-16 rounded-lg border-2 ${isSelected(item) ? 'border-vf-red' : 'border-vf-border'}`}
                        style={{ background: g.value }}>
                        {isSelected(item) && <div className="absolute top-1 right-1 w-4 h-4 gr-red rounded-full flex items-center justify-center"><FiCheck size={8} /></div>}
                      </button>
                    );
                  })}
                </div>

                <h4 className="text-xs font-bold text-vf-gray uppercase mb-2 mt-4">Colors</h4>
                <div className="grid grid-cols-6 gap-2">
                  {SOLID_COLORS.map(c => {
                    const item = { type: 'color', value: c };
                    return (
                      <button key={c} onClick={() => toggleSlideshowItem(item)}
                        className={`relative h-12 rounded-lg border-2 ${isSelected(item) ? 'border-vf-red' : 'border-vf-border'}`}
                        style={{ background: c }}>
                        {isSelected(item) && <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-vf-border flex gap-2 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-vf-border text-sm font-medium hover:bg-vf-card">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-2.5 rounded-xl gr-red text-white font-bold text-sm hover:opacity-90">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}