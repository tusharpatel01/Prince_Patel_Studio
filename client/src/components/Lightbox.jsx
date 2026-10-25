import { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Art from './Art';

export default function Lightbox({ items, index, onClose, onIndex }) {
  const touch = useRef(null);
  const go = (d) => onIndex((index + d + items.length) % items.length);
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  });
  const it = items[index];
  return (
    <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-50 flex flex-col bg-charcoal/95 p-4"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); }}>
      <div className="flex items-center justify-between text-ivory">
        <p className="text-sm">{it.caption} · {index + 1}/{items.length}</p>
        <button onClick={onClose} aria-label="Close viewer" autoFocus><X /></button>
      </div>
      <div className="relative m-auto w-full max-w-4xl">
        <Art kind={it.kind} url={it.url} floors={it.floors} seed={it.seed} label={it.url ? it.caption || 'Project image' : `${it.caption} (concept)`} />
        {items.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-0 top-1/2 -translate-y-1/2 bg-ivory p-2"><ChevronLeft /></button>
            <button onClick={() => go(1)} aria-label="Next image" className="absolute right-0 top-1/2 -translate-y-1/2 bg-ivory p-2"><ChevronRight /></button>
          </>
        )}
      </div>
    </div>
  );
}
