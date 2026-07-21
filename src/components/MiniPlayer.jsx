import React, { useRef, useEffect, useState } from 'react';
import { FiMaximize2, FiX } from 'react-icons/fi';

export default function MiniPlayer({ videoId, title, onExpand, onClose }) {
  const playerRef = useRef(null);
  const [pos, setPos] = useState({ x: null, y: null });
  const dragRef = useRef({ active: false, sx: 0, sy: 0, sl: 0, st: 0 });

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.active) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      setPos({
        x: dragRef.current.sl + cx - dragRef.current.sx,
        y: dragRef.current.st + cy - dragRef.current.sy,
      });
    };
    const onUp = () => { dragRef.current.active = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, []);

  const startDrag = (e) => {
    const rect = playerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = { active: true, sx: cx, sy: cy, sl: rect.left, st: rect.top };
  };

  if (!videoId) return null;

  const style = {
    bottom: pos.y !== null ? 'auto' : '20px',
    right: pos.x !== null ? 'auto' : '20px',
    ...(pos.x !== null && { left: pos.x + 'px' }),
    ...(pos.y !== null && { top: pos.y + 'px' }),
    width: '380px',
  };

  return (
    <div ref={playerRef} className="mini-player fixed z-[180] rounded-2xl overflow-hidden shadow-2xl border border-vf-border bg-vf-dark" style={style}>
      <div className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={startDrag} onTouchStart={startDrag}>
        <span className="text-xs font-semibold truncate flex-1 mr-2">{title || 'Now Playing'}</span>
        <div className="flex gap-1">
          <button onClick={() => onExpand?.(videoId)} className="p-1.5 hover:bg-vf-card rounded-lg transition-colors">
            <FiMaximize2 size={12} />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-vf-card rounded-lg transition-colors">
            <FiX size={12} />
          </button>
        </div>
      </div>
      <div className="aspect-video bg-black">
        <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          className="w-full h-full" frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media" allowFullScreen />
      </div>
    </div>
  );
}