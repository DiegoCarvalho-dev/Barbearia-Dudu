import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium, webkit } from 'playwright-core';
import { preview } from 'vite';

let browser;
let server;
let url;

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

test('as bordas permanecem isoladas do site normal', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 701 }, reducedMotion: 'reduce' });
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.edge-experiment').count(), 0);
    assert.equal(await page.locator('.locations h2').evaluate((node) => parseFloat(getComputedStyle(node).fontSize)), 40);
    assert.equal(await page.locator('link[href*="edgeExperiment"]').count(), 0);
  } finally { await page.close(); }
});

test('cores estabilizam nas divisões e não impedem rolagem ou toques', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 699 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await page.goto(`${url}?teste-bordas=1`, { waitUntil: 'networkidle' });
    const top = page.locator('.edge-experiment-top');
    const bottom = page.locator('.edge-experiment-bottom');
    await top.waitFor();
    await page.waitForTimeout(100);
    const color = (element) => element.evaluate((node) => getComputedStyle(node).backgroundColor);
    assert.equal(await top.getAttribute('aria-hidden'), 'true');
    assert.equal(await top.evaluate((node) => getComputedStyle(node).pointerEvents), 'none');
    await page.locator('.hero-button').click();
    await page.waitForTimeout(250);
    assert.ok(Math.abs(await page.locator('#historia').evaluate((node) => node.getBoundingClientRect().top)) < 2);
    assert.equal(await color(top), 'rgb(255, 255, 255)');
    assert.equal(await color(bottom), 'rgb(255, 255, 255)');

    const boundary = await page.locator('#equipe').evaluate((node) => node.getBoundingClientRect().top + scrollY);
    for (let i = 0; i < 10; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), boundary + (i % 2 ? -3 : 3));
      await page.waitForTimeout(35);
      assert.equal(await color(top), 'rgb(255, 255, 255)', 'Pequenas oscilações não devem piscar.');
    }
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), boundary + 30);
    await page.waitForTimeout(250);
    assert.equal(await color(top), 'rgb(17, 17, 17)');
    const manualScroll = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => window.scrollY), manualScroll, 'As bordas não devem reposicionar a página.');
  } finally { await page.close(); }
});

test('Onde Estamos não salta ao cruzar 700px e mantém conteúdo visível', async () => {
  for (const width of [320, 360, 390, 430]) {
    const page = await browser.newPage({ viewport: { width, height: 699 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    try {
      await page.goto(`${url}?teste-bordas=1`, { waitUntil: 'networkidle' });
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
