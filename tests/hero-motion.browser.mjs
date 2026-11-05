import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const browsers = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
let browser;
let server;
let url;

before(async () => {
  const executablePath = browsers.find(existsSync);
  assert.ok(executablePath, 'Defina CHROME_PATH com o caminho de um navegador Chrome ou Edge.');
  server = await preview({ preview: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  url = `http://127.0.0.1:${server.httpServer.address().port}/`;
  browser = await chromium.launch({ executablePath, headless: true });
});

after(async () => {
  await browser?.close();
  if (server?.httpServer) await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
});

async function openPage(viewport, options = {}) {
  const page = await browser.newPage({ viewport, reducedMotion: 'no-preference', ...options });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.hero')?.classList.contains('is-in-view'));
  return { page, errors };
}

test('a foto e as frases realmente entram em movimento após o carregamento', async () => {
  const { page, errors } = await openPage({ width: 1440, height: 900 });
  try {
    await page.waitForTimeout(350);
    const during = await page.evaluate(() => {
      const photo = document.querySelector('.hero-photo');
      return {
        photoX: photo.getBoundingClientRect().left,
        photoOpacity: Number(getComputedStyle(photo).opacity),
        photoAnimation: photo.getAnimations().map((animation) => animation.animationName),
        lines: [...document.querySelectorAll('.hero h1 span')].map((line) => line.getAnimations().map((animation) => animation.animationName)),
      };
    });
    await page.waitForTimeout(1800);
    const finished = await page.evaluate(() => ({ x: document.querySelector('.hero-photo').getBoundingClientRect().left, opacity: Number(getComputedStyle(document.querySelector('.hero-photo')).opacity) }));
    assert.ok(during.photoAnimation.includes('home-portrait-in'));
    assert.ok(during.lines[0].includes('home-in-left'));
    assert.ok(during.lines[1].includes('home-in-right'));
    assert.ok(during.photoX - finished.x > 10, `A foto não entrou pela direita: ${during.photoX} → ${finished.x}`);
    assert.ok(during.photoOpacity < finished.opacity && finished.opacity === 1);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('a entrada aguarda a fotografia quando ela demora a carregar', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  try {
    await page.route('**/images/dudu-recorte.webp', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.hero').evaluate((element) => element.classList.contains('motion-pending')), true);
    await page.waitForFunction(() => document.querySelector('.hero').classList.contains('is-in-view'));
    assert.ok(await page.locator('.hero-photo').evaluate((element) => element.getAnimations().some((animation) => animation.animationName === 'home-portrait-in')));
  } finally { await page.close(); }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`parallax e tamanho do home em ${viewport.width}x${viewport.height}`, async () => {
    const { page, errors } = await openPage(viewport);
    try {
      await page.waitForTimeout(2200);
      const positions = () => page.evaluate(() => ({
        photo: document.querySelector('.hero-photo').getBoundingClientRect().top,
        word: document.querySelector('.hero-word').getBoundingClientRect().top,
        text: document.querySelector('.hero-content').getBoundingClientRect().top,
        height: document.querySelector('.hero').getBoundingClientRect().height,
        width: document.documentElement.scrollWidth,
      }));
      const initial = await positions();
      await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'instant' }));
      await page.waitForTimeout(150);
      const scrolled = await positions();
      assert.ok(Math.abs(initial.height - viewport.height) <= 1);
      assert.ok(initial.width <= viewport.width);
      assert.ok(Math.abs(scrolled.photo - initial.photo) < 2, 'A foto deve permanecer fixa durante a saída do home.');
      assert.ok(Math.abs((scrolled.word - initial.word) + 70) < 3, 'O nome deve mover-se em uma velocidade diferente.');
      assert.ok(Math.abs((scrolled.text - initial.text) + 250) < 3, 'O texto deve acompanhar a página.');
      await page.evaluate(() => window.scrollTo({ top: innerHeight, behavior: 'instant' }));
      await page.waitForTimeout(100);
      assert.equal(await page.locator('.hero').evaluate((element) => element.classList.contains('is-in-view')), false);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('.hero').classList.contains('is-in-view'));
      assert.ok(await page.locator('.hero-photo').evaluate((element) => element.getAnimations().some((animation) => animation.animationName === 'home-portrait-in')));
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}

test('o botão percorre a página gradualmente e chega à história', async () => {
  const { page } = await openPage({ width: 390, height: 844 });
  try {
    await page.waitForTimeout(2200);
    await page.locator('.hero-button').click();
    await page.waitForTimeout(180);
    const partial = await page.evaluate(() => window.scrollY);
    assert.ok(partial > 0 && partial < 844, `A rolagem deve ser gradual, posição: ${partial}`);
    await page.waitForTimeout(1000);
    const result = await page.evaluate(() => ({ top: document.querySelector('#historia').getBoundingClientRect().top, hash: location.hash, focus: document.activeElement.id }));
    assert.ok(Math.abs(result.top) < 2);
    assert.equal(result.hash, '#historia');
    assert.equal(result.focus, 'historia');
  } finally { await page.close(); }
});

test('o visitante pode interromper a rolagem do botão', async () => {
  const { page } = await openPage({ width: 1440, height: 900 });
  try {
    await page.waitForTimeout(2200);
    await page.locator('.hero-button').click();
    await page.waitForTimeout(180);
    await page.mouse.wheel(0, 30);
    await page.waitForTimeout(250);
    const stopped = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(900);
    const final = await page.evaluate(() => window.scrollY);
    assert.ok(Math.abs(final - stopped) <= 3 && final < 850, `A rolagem continuou: ${stopped} → ${final}`);
  } finally { await page.close(); }
});

test('a preferência de movimento reduzido desativa as animações e o parallax', async () => {
  const { page } = await openPage({ width: 390, height: 844 }, { reducedMotion: 'reduce' });
  try {
    const initial = await page.locator('.hero-photo').evaluate((photo) => ({ top: photo.getBoundingClientRect().top, animation: getComputedStyle(photo).animationName }));
    assert.equal(initial.animation, 'none');
    await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
    await page.waitForTimeout(120);
    const top = await page.locator('.hero-photo').evaluate((photo) => photo.getBoundingClientRect().top);
    assert.ok(Math.abs((top - initial.top) + 200) < 2, 'A foto deve acompanhar a página sem parallax.');
  } finally { await page.close(); }
});
