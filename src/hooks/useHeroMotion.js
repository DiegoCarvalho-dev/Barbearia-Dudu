import { useEffect, useRef } from 'react';

// A entrada só começa depois que a página está visível e a foto está pronta.
export function useHeroMotion() {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let ready = false;
    let entered = false;
    let disposed = false;
    let fallbackTimer;
    let onLoad;

    if (!motion.matches) hero.classList.add('motion-pending');

    const update = () => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      const offset = motion.matches ? 0 : Math.max(0, Math.min(-rect.top, hero.offsetHeight));
      hero.style.setProperty('--hero-scroll', `${offset}px`);
      if (!entered && ready && document.visibilityState === 'visible' && rect.bottom > window.innerHeight * 0.15 && rect.top < window.innerHeight * 0.85) {
        entered = true;
        hero.classList.add('is-in-view');
      }
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const start = () => {
      if (disposed || ready) return;
      ready = true;
      hero.classList.remove('motion-pending');
      requestUpdate();
    };
    const image = hero.querySelector('.hero-photo');
    const pageReady = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => { onLoad = resolve; window.addEventListener('load', onLoad, { once: true }); });
    const imageReady = image?.decode ? image.decode().catch(() => {}) : Promise.resolve();
    const fontsReady = document.fonts?.ready ?? Promise.resolve();

    Promise.allSettled([pageReady, imageReady, fontsReady]).then(start);
    // Evita esconder o conteúdo caso um recurso externo demore ou falhe.
    fallbackTimer = window.setTimeout(start, 1800);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    document.addEventListener('visibilitychange', requestUpdate);
    motion.addEventListener('change', requestUpdate);
    requestUpdate();

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (onLoad) window.removeEventListener('load', onLoad);
      document.removeEventListener('visibilitychange', requestUpdate);
      motion.removeEventListener('change', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return heroRef;
}
