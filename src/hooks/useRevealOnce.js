import { useEffect, useRef } from 'react';

// A seção continua visível se movimento reduzido estiver ativo ou o navegador
// não oferecer IntersectionObserver. A entrada acontece apenas uma vez.
export function useRevealOnce() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    section.classList.add('reveal-pending');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.classList.remove('reveal-pending');
      section.classList.add('is-revealed');
      observer.disconnect();
    }, { threshold: 0.18 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return ref;
}
