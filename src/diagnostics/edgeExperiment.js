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
  const topState = { current: null, section: null, timer: 0 };
  const bottomState = { current: null, section: null, timer: 0 };

  const clearPending = (state) => {
    window.clearTimeout(state.timer);
    state.timer = 0;
  };
  const setStableColor = (edge, state, next, elements, point) => {
    const commit = () => {
      clearPending(state);
      state.section = next.section;
      if (state.current !== next.color) {
        state.current = next.color;
        edge.style.backgroundColor = next.color;
      }
    };
    if (state.current === null) return commit();
    if (next.color === state.current) {
      clearPending(state);
      state.section = next.section;
      return;
    }

    // Conservar a cor perto da divisa evita oscilar com pequenos movimentos.
    const previous = elements.find(({ element }) => element === state.section);
    const nearBoundary = previous && previous.rect.top <= point + 12 && previous.rect.bottom >= point - 12;
    if (!nearBoundary) return commit();
    clearPending(state);
    // Quando a rolagem para exatamente na divisa, a cor correta ainda aparece.
    state.timer = window.setTimeout(commit, 230);
  };

  const colorAt = (elements, point) => {
    const match = elements.find(({ rect }) => rect.top <= point && rect.bottom > point);
    if (!match) return { section: null, color: '#101010' };
    const section = match.element;
    // A Home usa gradiente, que não é exposto como background-color.
    if (section.id === 'inicio') return { section, color: '#100d0d' };
    if (colors.has(section)) return { section, color: colors.get(section) };
    const color = getComputedStyle(section).backgroundColor;
    const result = color === 'rgba(0, 0, 0, 0)' ? '#101010' : color;
    colors.set(section, result);
    return { section, color: result };
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
    const topPoint = offsetTop + 1;
    const bottomPoint = offsetTop + Math.max(1, height - 1);
    setStableColor(topEdge, topState, colorAt(elements, topPoint), elements, topPoint);
    setStableColor(bottomEdge, bottomState, colorAt(elements, bottomPoint), elements, bottomPoint);
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
