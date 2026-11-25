'use client';

import { useEffect, useState } from 'react';

const slideInterval = 3000;

export function CoverSlideshow({images, name}: {images: string[]; name: string}) {
  const [{ current, previous }, setSlide] = useState({ current: 0, previous: -1 });
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setAutoPlay(!preference.matches);
    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => preference.removeEventListener('change', syncPreference);
  }, [images.length]);

  useEffect(() => {
    if (!autoPlay || images.length < 2) return;
    const timer = window.setTimeout(() => {
      setSlide(({ current }) => ({ current: (current + 1) % images.length, previous: current }));
    }, slideInterval);
    return () => window.clearTimeout(timer);
  }, [current, images.length, autoPlay]);

  if (!images.length) return null;

  return <figure className="hero-media cover-slideshow" aria-label={`Ảnh bìa ${name}`}>
    <div className="cover-frames">
      {images.map((image, index) => <img
        key={index}
        className={current === index ? `cover-image is-current${previous >= 0 ? ' is-entering' : ''}` : previous === index ? 'cover-image is-previous' : 'cover-image'}
        src={image}
        alt={`Ảnh bìa ${index + 1} của ${name}`}
        aria-hidden={current !== index}
        fetchPriority={index === 0 ? 'high' : 'low'}
        decoding="async"
      />)}
      {previous >= 0 && <span key={current} className="cover-sweep" aria-hidden="true"/>}
    </div>
    {images.length > 1 && <div className="cover-controls">
      <div role="group" aria-label="Chọn ảnh bìa">
        {images.map((_, index) => <button type="button" key={index} aria-label={`Xem ảnh ${index + 1}`}
          aria-current={current === index ? 'true' : undefined} onClick={() => setSlide(slide => index === slide.current ? slide : { current: index, previous: slide.current })}>
          <span aria-hidden="true"/>
        </button>)}
      </div>

    </div>}
  </figure>;
}
