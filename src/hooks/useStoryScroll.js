import { useEffect, useRef } from 'react';

export function useStoryScroll() {
  const cleanupRef = useRef(null);
  useEffect(() => () => cleanupRef.current?.(), []);

  return (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById('historia');
    if (!target) return;
    event.preventDefault();
    cleanupRef.current?.();

    const start = window.scrollY;
    const destination = () => Math.round(target.getBoundingClientRect().top + window.scrollY);
    if (window.location.hash !== '#historia') window.history.pushState(null, '', '#historia');

    let frame = 0;
    let startedAt;
    let settleTimer;
    let settling = false;
    const cleanup = () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancelOnScrollKey);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      cleanupRef.current = null;
    };
    const cancel = () => cleanup();
    const cancelOnScrollKey = (keyEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(keyEvent.key)) cancel();
    };
    const align = () => window.scrollTo({ top: destination(), behavior: 'instant' });
    const onResize = () => {
      if (!settling) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(align);
    };
    const finish = () => {
      settling = true;
      align();
      target.focus({ preventScroll: true });
      // As barras do navegador podem terminar de mudar após a animação.
      settleTimer = window.setTimeout(cleanup, 600);
    };
    const step = (time) => {
      if (startedAt === undefined) startedAt = time;
      const progress = Math.min((time - startedAt) / 900, 1);
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      window.scrollTo({ top: start + (destination() - start) * eased, behavior: 'instant' });
      if (progress < 1) frame = window.requestAnimationFrame(step);
      else finish();
    };
    cleanupRef.current = cleanup;
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancelOnScrollKey);
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(destination() - start) < 2) finish();
    else frame = window.requestAnimationFrame(step);
  };
}
