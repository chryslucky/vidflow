import React, { useState, useEffect } from 'react';

const GRADIENT_PRESETS = [
  { name: 'Aurora', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)' },
  { name: 'Crimson', value: 'linear-gradient(135deg, #e50914 0%, #8B0000 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)' },
  { name: 'Rose', value: 'linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)' },
  { name: 'Gold', value: 'linear-gradient(135deg, #FDBB2D 0%, #22C1C3 100%)' },
  { name: 'Neon', value: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' },
];

export default function BackgroundManager({ settings, images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayValue, setDisplayValue] = useState(null);
  const [prevValue, setPrevValue] = useState(null);

  const items = [];
  if (settings.type === 'image' && settings.value) items.push({ type: 'image', value: settings.value });
  else if (settings.type === 'gradient' && settings.value) items.push({ type: 'gradient', value: settings.value });
  else if (settings.type === 'color' && settings.value) items.push({ type: 'color', value: settings.value });
  else if (settings.type === 'slideshow' && settings.slideshow) {
    (settings.slideshowItems || []).forEach(item => items.push(item));
  }

  useEffect(() => {
    if (!items.length) {
      setDisplayValue(null);
      return;
    }
    setDisplayValue(items[0]);
    if (items.length > 1 && settings.slideshow) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          const next = (prev + 1) % items.length;
          setPrevValue(items[prev]);
          setDisplayValue(items[next]);
          return next;
        });
      }, (settings.interval || 8) * 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [settings.type, settings.value, settings.slideshow, settings.interval, JSON.stringify(items)]);

  if (!displayValue) return null;

  const renderBg = (item, opacity = 1) => {
    if (!item) return null;
    if (item.type === 'image') {
      return <img src={item.value} alt="" className="w-full h-full object-cover" style={{ opacity: 0.15 * opacity, filter: 'blur(20px)' }} />;
    }
    if (item.type === 'gradient' || item.type === 'color') {
      return <div className="w-full h-full" style={{ background: item.value, opacity: 0.35 * opacity }} />;
    }
    return null;
  };

  return (
    <>
      {prevValue && (
        <div className="slideshow-bg" style={{ opacity: 0 }}>
          {renderBg(prevValue)}
        </div>
      )}
      <div className="slideshow-bg animate-fadeIn">
        {renderBg(displayValue)}
      </div>
    </>
  );
}

export { GRADIENT_PRESETS };