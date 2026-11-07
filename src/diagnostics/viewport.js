// Diagnóstico opt-in: os dados permanecem no aparelho até o visitante copiá-los.
export function startViewportDiagnostic() {
  const samples = [];
  let timers = [];
  const panel = document.createElement('details');
  panel.className = 'viewport-diagnostic';
  panel.innerHTML = `
    <summary>Diagnóstico</summary>
    <div class="viewport-diagnostic-content">
      <p>Toque em “Conheça a barbearia”, aguarde 4 segundos e copie o relatório.</p>
      <textarea aria-label="Relatório de diagnóstico" readonly></textarea>
      <button type="button">Copiar relatório</button>
      <span role="status" aria-live="polite"></span>
    </div>`;
  const css = document.createElement('style');
  css.textContent = `
    .viewport-diagnostic { position: fixed; left: 10px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); z-index: 9999; width: max-content; max-width: calc(100vw - 20px); color: #fff; font: 14px/1.4 Arial, sans-serif; }
    .viewport-diagnostic summary { display: inline-block; cursor: pointer; padding: 7px 10px; border-radius: 5px; background: #292929; color: #fff; }
    .viewport-diagnostic-content { width: min(340px, calc(100vw - 20px)); padding: 10px; background: #292929; border-radius: 5px; }
    .viewport-diagnostic-content p { margin: 0 0 8px; }
    .viewport-diagnostic textarea { display: block; width: 100%; height: 150px; margin-bottom: 8px; padding: 6px; font: 11px/1.3 monospace; color: #111; background: #fff; }
    .viewport-diagnostic button { padding: 8px; color: #111; background: #fff; border: 0; border-radius: 4px; }
    .viewport-diagnostic [role="status"] { display: block; margin-top: 6px; }
  `;
  document.head.appendChild(css);
  document.body.appendChild(panel);

  const output = panel.querySelector('textarea');
  const status = panel.querySelector('[role="status"]');
  const round = (value) => typeof value === 'number' ? Math.round(value * 100) / 100 : null;
  const section = (id) => {
    const element = document.getElementById(id);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      top: round(rect.top), bottom: round(rect.bottom), height: round(rect.height),
      clientHeight: element.clientHeight, scrollHeight: element.scrollHeight, scrollTop: round(element.scrollTop),
      cssHeight: style.height, minHeight: style.minHeight, maxHeight: style.maxHeight, overflowY: style.overflowY,
    };
  };
  const sample = (stage) => {
    const visual = window.visualViewport;
    samples.push({
      etapa: stage,
      viewport: {
        innerWidth: window.innerWidth, innerHeight: window.innerHeight,
        clientWidth: document.documentElement.clientWidth, clientHeight: document.documentElement.clientHeight,
        scrollY: round(window.scrollY),
        visual: visual ? { width: round(visual.width), height: round(visual.height), offsetTop: round(visual.offsetTop), pageTop: round(visual.pageTop), scale: round(visual.scale) } : null,
        screen: { width: screen.width, height: screen.height }, pixelRatio: round(window.devicePixelRatio),
        supportsDvh: CSS.supports('height', '100dvh'), reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      },
      inicio: section('inicio'), historia: section('historia'),
    });
    output.value = JSON.stringify(samples, null, 2);
    status.textContent = stage === '4 segundos' ? 'Relatório pronto para copiar.' : 'Coletando medidas locais…';
  };

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('.hero-button')) return;
    timers.forEach(clearTimeout);
    samples.length = 0;
    sample('antes do clique');
    timers = [1, 2, 4].map((seconds) => setTimeout(() => sample(`${seconds} segundo${seconds === 1 ? '' : 's'}`), seconds * 1000));
  }, true);

  panel.querySelector('button').addEventListener('click', async () => {
    if (!samples.length) {
      status.textContent = 'Primeiro toque em “Conheça a barbearia”.';
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard indisponível');
      await navigator.clipboard.writeText(output.value);
      status.textContent = 'Copiado. Cole o relatório na conversa.';
    } catch {
      output.focus();
      output.select();
      status.textContent = 'Selecione e copie o texto do relatório acima.';
    }
  });
}
