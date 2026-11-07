import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { webkit } from 'playwright-core';
import { preview } from 'vite';

let browser;
let server;
let url;

before(async () => {
  assert.ok(existsSync(webkit.executablePath()), 'Instale o navegador com: node node_modules/playwright-core/cli.js install webkit');
  server = await preview({ preview: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  url = `http://127.0.0.1:${server.httpServer.address().port}/`;
  browser = await webkit.launch();
});

after(async () => {
  await browser?.close();
  if (server?.httpServer) await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
});

for (const viewport of [{ width: 320, height: 568 }, { width: 320, height: 701 }, { width: 340, height: 701 }, { width: 340, height: 720 }, { width: 360, height: 640 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 768, height: 1024 }, { width: 568, height: 320 }]) {
  test(`WebKit: altura, conteúdo e setas em ${viewport.width}x${viewport.height}`, async () => {
    const page = await browser.newPage({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('.hero') && getComputedStyle(document.querySelector('.hero')).position === 'relative');
      await page.evaluate(() => document.fonts.ready);
      for (const id of ['inicio', 'historia', 'equipe', 'servicos', 'planos', 'unidades']) {
        const section = page.locator(`#${id}`);
        await section.evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
        const layout = await section.evaluate((element) => ({
          height: element.clientHeight,
          content: element.scrollHeight,
          viewport: window.innerHeight,
          visual: window.visualViewport.height,
          width: document.documentElement.scrollWidth,
        }));
        assert.ok(Math.abs(layout.viewport - layout.visual) <= 1);
        if (viewport.height > 500 || id === 'inicio') assert.ok(Math.abs(layout.height - layout.viewport) <= 1, `${id}: ${JSON.stringify(layout)}`);
        else assert.ok(layout.height >= layout.viewport, `${id}: ${JSON.stringify(layout)}`);
        assert.ok(layout.content <= layout.height + 1, `${id}: conteúdo cortado ${JSON.stringify(layout)}`);
        assert.ok(layout.width <= viewport.width);
      }
      const arrows = page.locator('.story-link .arrow, .team-link .arrow, .services-link .arrow, .plan-card a .arrow, .locations-cta .arrow, .footer-social .arrow');
      assert.equal(await arrows.count(), 8);
      assert.equal(await arrows.locator('svg').count(), 8);
      if (viewport.width <= 430 && viewport.height > 500) {
        for (const selector of ['.story-visual', '.team-visual']) {
          const size = await page.locator(selector).evaluate((element) => element.getBoundingClientRect().width);
          assert.ok(size >= viewport.width * .55, `${selector} deve permanecer em destaque.`);
        }
        for (const selector of ['.story h2', '.team h2']) {
          const size = await page.locator(selector).evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
          assert.ok(size >= 29, `${selector} deve permanecer legível.`);
        }
      }
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}

test('WebKit: seções acompanham mudanças na altura visível', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.hero') && getComputedStyle(document.querySelector('.hero')).position === 'relative');
    await page.evaluate(() => document.fonts.ready);
    for (const height of [700, 844, 700]) {
      await page.setViewportSize({ width: 390, height });
      await page.waitForFunction(() => Math.abs(document.querySelector('.hero').clientHeight - window.innerHeight) <= 1);
      for (const id of ['inicio', 'historia', 'equipe', 'servicos', 'planos', 'unidades']) {
        const actual = await page.locator(`#${id}`).evaluate((element) => ({ section: element.clientHeight, viewport: window.innerHeight }));
        assert.ok(Math.abs(actual.section - actual.viewport) <= 1, `${id}: ${JSON.stringify(actual)}`);
      }
    }
  } finally { await page.close(); }
});

test('WebKit: o botão acompanha alterações da área visível e mantém a rolagem livre', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.hero')?.classList.contains('is-in-view'));
    await page.waitForTimeout(2200);
    await page.locator('.hero-button').click();
    await page.waitForTimeout(250);
    await page.setViewportSize({ width: 390, height: 780 });
    await page.waitForTimeout(800);
    let top = await page.locator('#historia').evaluate((element) => element.getBoundingClientRect().top);
    assert.ok(Math.abs(top) < 2, `Deslocamento após mudança durante a transição: ${top}px`);
    await page.setViewportSize({ width: 390, height: 810 });
    await page.waitForTimeout(100);
    top = await page.locator('#historia').evaluate((element) => element.getBoundingClientRect().top);
    assert.ok(Math.abs(top) < 2, `Deslocamento após mudança ao final da transição: ${top}px`);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('touchstart'));
      window.scrollBy({ top: 120, behavior: 'instant' });
    });
    const moved = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(700);
    assert.ok(Math.abs((await page.evaluate(() => window.scrollY)) - moved) < 2, 'A rolagem manual não deve ser corrigida automaticamente.');
  } finally { await page.close(); }
});
