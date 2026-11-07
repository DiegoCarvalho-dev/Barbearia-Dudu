import './edgeExperiment.css';

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
  const colors = new WeakMap();
  const topState = { current: null, pending: null, timer: 0 };
  const bottomState = { current: null, pending: null, timer: 0 };

  const clearPending = (state) => {
    window.clearTimeout(state.timer);
    state.timer = 0;
    state.pending = null;
  };
  const setStableColor = (edge, state, color) => {
    if (state.current === null) {
      state.current = color;
      edge.style.backgroundColor = color;
      return;
    }
    if (color === state.current) {
      clearPending(state);
      return;
    }
    if (color === state.pending) return;
    clearPending(state);
    state.pending = color;
    state.timer = window.setTimeout(() => {
      state.current = state.pending;
      state.pending = null;
      state.timer = 0;
      edge.style.backgroundColor = state.current;
    }, 120);
  };

  const colorAt = (elements, point) => {
    const match = elements.find(({ rect }) => rect.top <= point && rect.bottom > point);
    if (!match) return '#101010';
    const section = match.element;
    // A Home usa gradiente, que não é exposto como background-color.
    if (section.id === 'inicio') return '#100d0d';
    if (colors.has(section)) return colors.get(section);
    const color = getComputedStyle(section).backgroundColor;
    const result = color === 'rgba(0, 0, 0, 0)' ? '#101010' : color;
    colors.set(section, result);
    return result;
  };

  const update = () => {
    frame = 0;
    // Ao ampliar a página, não cobrir conteúdo nem tentar seguir o viewport móvel.
    const zoomed = visual && Math.abs(visual.scale - 1) > 0.01;
    if (topEdge.hidden !== Boolean(zoomed)) topEdge.hidden = Boolean(zoomed);
    if (bottomEdge.hidden !== Boolean(zoomed)) bottomEdge.hidden = Boolean(zoomed);
    if (zoomed) {
      clearPending(topState);
      clearPending(bottomState);
      return;
    }

    const elements = sections().map((element) => ({ element, rect: element.getBoundingClientRect() }));
    const offsetTop = visual?.offsetTop ?? 0;
    const height = visual?.height ?? window.innerHeight;
    const topColor = colorAt(elements, offsetTop + 1);
    const bottomColor = colorAt(elements, offsetTop + Math.max(1, height - 1));
    setStableColor(topEdge, topState, topColor);
    setStableColor(bottomEdge, bottomState, bottomColor);
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
    clearPending(topState);
    clearPending(bottomState);
    window.removeEventListener('scroll', requestUpdate);
    window.removeEventListener('resize', requestUpdate);
    visual?.removeEventListener('scroll', requestUpdate);
    visual?.removeEventListener('resize', requestUpdate);
    topEdge.remove();
    bottomEdge.remove();
  };
}
