import React, { useState, useEffect } from 'react';
import { FiChevronUp } from 'react-icons/fi';

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <button
      className={`fixed bottom-6 right-6 z-[80] w-11 h-11 rounded-full gr-red shadow-lg flex items-center justify-center transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'
      }`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <FiChevronUp size={20} />
    </button>
  );
}