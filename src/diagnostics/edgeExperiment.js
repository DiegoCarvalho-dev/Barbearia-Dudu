// Protótipo opt-in: testa a extensão de cor das barras do navegador, sem rolar a página.
export function startEdgeExperiment() {
  const sections = () => [...document.querySelectorAll('main > section, footer.footer')];
  const makeEdge = (name) => {
    const edge = document.createElement('div');
    edge.className = `edge-experiment edge-experiment-${name}`;
    edge.setAttribute('aria-hidden', 'true');
    Object.assign(edge.style, {
      position: 'fixed', left: '0', right: '0', height: '12px',
      zIndex: '9998', pointerEvents: 'none', [name]: '-5px',
      backgroundColor: '#101010',
    });
    document.body.appendChild(edge);
    return edge;
  };

  const topEdge = makeEdge('top');
  const bottomEdge = makeEdge('bottom');
  const visual = window.visualViewport;
  let frame = 0;

  const colorAt = (elements, point) => {
    const section = elements.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top <= point && rect.bottom > point;
    });
    if (!section) return '#101010';
    // A Home usa gradiente, que não é exposto como background-color.
    if (section.id === 'inicio') return '#100d0d';
    const color = getComputedStyle(section).backgroundColor;
    return color === 'rgba(0, 0, 0, 0)' ? '#101010' : color;
  };

  const update = () => {
    frame = 0;
    // Ao ampliar a página, não cobrir conteúdo nem tentar seguir o viewport móvel.
    const zoomed = visual && Math.abs(visual.scale - 1) > 0.01;
    topEdge.hidden = Boolean(zoomed);
    bottomEdge.hidden = Boolean(zoomed);
    if (zoomed) return;

    const elements = sections();
    const offsetTop = visual?.offsetTop ?? 0;
    const height = visual?.height ?? window.innerHeight;
    topEdge.style.backgroundColor = colorAt(elements, offsetTop + 1);
    bottomEdge.style.backgroundColor = colorAt(elements, offsetTop + Math.max(1, height - 1));
  };
  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  visual?.addEventListener('scroll', requestUpdate, { passive: true });
  visual?.addEventListener('resize', requestUpdate);
  requestUpdate();

  return () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener('scroll', requestUpdate);
    window.removeEventListener('resize', requestUpdate);
    visual?.removeEventListener('scroll', requestUpdate);
    visual?.removeEventListener('resize', requestUpdate);
    topEdge.remove();
    bottomEdge.remove();
  };
}
