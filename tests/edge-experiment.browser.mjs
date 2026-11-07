import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, webkit } from 'playwright-core';
import { preview } from 'vite';

let browser;
let server;
let url;
const testQuery = process.env.EDGE_TEST_STABLE === '1' ? '?teste-estavel=1' : '';

before(async () => {
  server = await preview({ preview: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  url = `http://127.0.0.1:${server.httpServer.address().port}/`;
  if (process.env.EDGE_TEST_BROWSER === 'webkit') {
    assert.ok(existsSync(webkit.executablePath()), 'Instale o WebKit com o Playwright.');
    browser = await webkit.launch({ headless: true });
  } else {
    const executablePath = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium', '/usr/bin/google-chrome'].filter(Boolean).find(existsSync);
    assert.ok(executablePath, 'Defina CHROME_PATH com o caminho do Chrome ou Edge.');
    browser = await chromium.launch({ executablePath, headless: true });
  }
});

after(async () => {
  await browser?.close();
  if (server?.httpServer) await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
});

test('o endereço normal ativa a versão estável aprovada', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 701 }, reducedMotion: 'reduce' });
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('.edge-experiment-top').waitFor();
    assert.equal(await page.locator('.edge-experiment').count(), 2);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('viewport-stable-experiment')), true);
    assert.equal(await page.locator('#equipe').evaluate((node) => getComputedStyle(node).overflowY), 'visible');
  } finally { await page.close(); }
});

test('a versão estável usa a menor altura do navegador sem prender a rolagem', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 699 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await page.goto(`${url}${testQuery}`, { waitUntil: 'networkidle' });
    await page.locator('.edge-experiment-top').waitFor();
    const result = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;visibility:hidden;height:100svh';
      document.body.append(probe);
      const smallHeight = probe.getBoundingClientRect().height;
      probe.remove();
      return {
        enabled: document.documentElement.classList.contains('viewport-stable-experiment'),
        smallHeight,
        hero: document.querySelector('#inicio').getBoundingClientRect().height,
        minHeights: [...document.querySelectorAll('main > section:not(#inicio)')].map((section) => parseFloat(getComputedStyle(section).minHeight)),
        snap: getComputedStyle(document.documentElement).scrollSnapType,
      };
    });
    assert.equal(result.enabled, true);
    assert.ok(Math.abs(result.hero - result.smallHeight) < 1);
    assert.ok(result.minHeights.every((height) => Math.abs(height - result.smallHeight) < 1));
    assert.equal(result.snap, 'none');
  } finally { await page.close(); }
});

test('produção corresponde ao link estável aprovado', async () => {
  for (const viewport of [{ width: 390, height: 699 }, { width: 1440, height: 900 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    try {
      const layouts = [];
      for (const query of ['', '?teste-estavel=1']) {
        await page.goto(`${url}${query}`, { waitUntil: 'networkidle' });
        await page.locator('.edge-experiment-top').waitFor();
        await page.evaluate(() => document.fonts.ready);
        layouts.push(await page.evaluate(() => ({
          stable: document.documentElement.classList.contains('viewport-stable-experiment'),
          sections: [...document.querySelectorAll('main > section')].map((section) => ({
            height: section.getBoundingClientRect().height,
            minHeight: getComputedStyle(section).minHeight,
            overflowY: getComputedStyle(section).overflowY,
          })),
          brandSize: getComputedStyle(document.querySelector('.locations-brand')).fontSize,
        })));
      }
      assert.deepEqual(layouts[0], layouts[1], `O layout de produção deve corresponder ao aprovado em ${viewport.width}px.`);
    } finally { await page.close(); }
  }
});

test('cores estabilizam nas divisões e não impedem rolagem ou toques', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 699 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await page.goto(`${url}${testQuery}`, { waitUntil: 'networkidle' });
    const top = page.locator('.edge-experiment-top');
    const bottom = page.locator('.edge-experiment-bottom');
    await top.waitFor();
    await page.waitForTimeout(100);
    const color = (element) => element.evaluate((node) => getComputedStyle(node).backgroundColor);
    assert.equal(await top.getAttribute('aria-hidden'), 'true');
    assert.equal(await top.evaluate((node) => getComputedStyle(node).pointerEvents), 'none');
    await page.locator('.hero-button').click();
    await page.waitForFunction(() => ['.edge-experiment-top', '.edge-experiment-bottom'].every((selector) => getComputedStyle(document.querySelector(selector)).backgroundColor === 'rgb(255, 255, 255)'), null, { timeout: 1500 });
    assert.ok(Math.abs(await page.locator('#historia').evaluate((node) => node.getBoundingClientRect().top)) < 2);
    assert.equal(await color(top), 'rgb(255, 255, 255)');
    assert.equal(await color(bottom), 'rgb(255, 255, 255)');

    const boundary = await page.locator('#equipe').evaluate((node) => node.getBoundingClientRect().top + scrollY);
    for (let i = 0; i < 10; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), boundary + (i % 2 ? -3 : 3));
      await page.waitForTimeout(35);
      assert.equal(await color(top), 'rgb(255, 255, 255)', 'Pequenas oscilações não devem piscar.');
    }
    for (let i = 0; i < 4; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), boundary + (i % 2 ? -3 : 3));
      await page.waitForTimeout(155);
      assert.equal(await color(top), 'rgb(255, 255, 255)', 'Movimentos lentos perto da divisa também devem permanecer estáveis.');
    }
    for (let i = 0; i < 5; i++) {
      await page.evaluate((y) => {
        window.scrollTo({ top: y, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      }, boundary + 3);
      await page.waitForTimeout(80);
      assert.equal(await color(top), 'rgb(255, 255, 255)', 'A cor deve aguardar a rolagem estabilizar junto à divisa.');
    }
    await page.waitForTimeout(300);
    assert.equal(await color(top), 'rgb(17, 17, 17)', 'A cor deve refletir a seção após a rolagem parar.');
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), boundary + 30);
    await page.waitForTimeout(250);
    assert.equal(await color(top), 'rgb(17, 17, 17)');
    const manualScroll = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => window.scrollY), manualScroll, 'As bordas não devem reposicionar a página.');
  } finally { await page.close(); }
});

test('seções móveis não criam uma segunda rolagem quando o conteúdo cresce', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 699 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await page.goto(`${url}${testQuery}`, { waitUntil: 'networkidle' });
    for (const id of ['historia', 'equipe', 'servicos', 'planos', 'unidades']) {
      const state = await page.locator(`#${id}`).evaluate((section) => ({ overflow: getComputedStyle(section).overflowY, height: section.clientHeight }));
      assert.equal(state.overflow, 'visible', `${id} não deve criar rolagem interna.`);
      assert.ok(state.height >= 699, `${id} deve preencher a janela.`);
    }
    const team = page.locator('#equipe');
    await team.locator('.team-grid').evaluate((element) => { element.style.minHeight = '900px'; });
    const layout = await team.evaluate((section) => ({ height: section.clientHeight, content: section.scrollHeight }));
    assert.ok(layout.height >= 900, 'Conteúdo ampliado deve fazer a seção crescer.');
    assert.ok(layout.content <= layout.height + 1, 'O conteúdo deve continuar no fluxo principal.');
  } finally { await page.close(); }
});

test('um gesto lento continua na direção do dedo entre seções', { skip: process.env.EDGE_TEST_BROWSER === 'webkit' }, async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 699 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await page.goto(`${url}${testQuery}`, { waitUntil: 'networkidle' });
    const input = await page.context().newCDPSession(page);
    for (const id of ['equipe', 'unidades']) {
      for (const direction of [1, -1]) {
        await page.locator(`#${id}`).evaluate((section, dir) => window.scrollTo({ top: section.getBoundingClientRect().top + scrollY - 120 * dir, behavior: 'instant' }), direction);
        await page.waitForTimeout(300);
        const positions = [await page.evaluate(() => scrollY)];
        await input.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 350 }] });
        for (let step = 1; step <= 6; step++) {
          await input.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 350 - direction * step * 20 }] });
          await page.waitForTimeout(80);
          positions.push(await page.evaluate(() => scrollY));
        }
        await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        assert.ok(direction * (positions.at(-1) - positions[0]) > 20, `${id}: gesto não avançou: ${positions}`);
        assert.ok(positions.every((position, index) => index === 0 || direction * (position - positions[index - 1]) >= -2), `${id}: rolagem retrocedeu: ${positions}`);
        await page.waitForTimeout(400);
      }
    }
  } finally { await page.close(); }
});

test('as animações móveis não criam rolagem horizontal', async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 699 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  try {
    await page.goto(`${url}${testQuery}`, { waitUntil: 'networkidle' });
    await page.locator('#equipe').evaluate((section) => section.scrollIntoView({ behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('#equipe').classList.contains('is-revealed'));
    for (let i = 0; i < 8; i++) {
      const layout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
      assert.ok(layout.width <= layout.viewport, `A animação excedeu a largura da tela: ${JSON.stringify(layout)}`);
      await page.waitForTimeout(100);
    }
  } finally { await page.close(); }
});

test('as seções móveis mantêm a composição ao cruzar 700px', async () => {
  for (const width of [320, 390, 430]) {
    const page = await browser.newPage({ viewport: { width, height: 699 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    try {
      await page.goto(`${url}${testQuery}`, { waitUntil: 'networkidle' });
      await page.locator('.edge-experiment-top').waitFor();
      await page.evaluate(() => document.fonts.ready);
      let previous;
      for (const height of [699, 700, 701, 702]) {
        await page.setViewportSize({ width, height });
        await page.waitForFunction((expected) => window.innerHeight === expected, height);
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const layouts = await page.evaluate(() => Object.fromEntries([
          ['historia', '.story-grid'], ['equipe', '.team-grid'], ['servicos', '.services-inner'], ['planos', '.plans-inner'],
        ].map(([id, selector]) => {
          const section = document.getElementById(id);
          const outer = section.getBoundingClientRect();
          const inner = section.querySelector(selector).getBoundingClientRect();
          return [id, { top: inner.top - outer.top, height: inner.height }];
        })));
        if (previous) for (const id of Object.keys(layouts)) {
          assert.ok(Math.abs(layouts[id].top - previous[id].top) < 5, `${id} em ${width}px: posição mudou bruscamente ao passar para ${height}px`);
          assert.ok(Math.abs(layouts[id].height - previous[id].height) < 5, `${id} em ${width}px: conteúdo mudou bruscamente ao passar para ${height}px`);
        }
        previous = layouts;
      }
    } finally { await page.close(); }
  }
});

test('Onde Estamos não salta ao cruzar 700px e mantém conteúdo visível', async () => {
  for (const width of [320, 360, 390, 430]) {
    const page = await browser.newPage({ viewport: { width, height: 699 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    try {
      await page.goto(`${url}${testQuery}`, { waitUntil: 'networkidle' });
      await page.locator('.edge-experiment-top').waitFor();
      await page.evaluate(() => document.fonts.ready);
      let previous;
      let previousHeight;
      for (const height of [568, 649, 650, 651, 699, 700, 701, 702, 719, 720, 721, 739, 740, 741, 759, 760, 761, 844, 932]) {
        await page.setViewportSize({ width, height });
        await page.waitForFunction((expected) => window.innerHeight === expected, height);
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.locator('#unidades').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
        const layout = await page.locator('#unidades').evaluate((section) => {
          const grid = section.querySelector('.locations-grid').getBoundingClientRect();
          const rect = section.getBoundingClientRect();
          return { gridTop: grid.top - rect.top, gridHeight: grid.height, height: section.clientHeight, content: section.scrollHeight };
        });
        assert.ok(layout.content <= layout.height + 1, `${width}x${height}: conteúdo cortado ${JSON.stringify(layout)}`);
        if (height - previousHeight === 1) {
          assert.ok(Math.abs(layout.gridTop - previous.gridTop) < 5, `${width}px: salto entre ${previousHeight} e ${height}px: ${JSON.stringify({ previous, layout })}`);
          assert.ok(Math.abs(layout.gridHeight - previous.gridHeight) < 5, `${width}px: mudança brusca entre ${previousHeight} e ${height}px: ${JSON.stringify({ previous, layout })}`);
        }
        previous = layout;
        previousHeight = height;
      }
    } finally { await page.close(); }
  }
});
