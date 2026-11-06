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
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(150);
      const returned = await page.locator('.hero-photo').evaluate((element) => ({
        animations: element.getAnimations().map((animation) => animation.animationName),
        opacity: Number(getComputedStyle(element).opacity),
        top: element.getBoundingClientRect().top,
      }));
      assert.ok(!returned.animations.includes('home-portrait-in'), 'A entrada não deve reiniciar ao voltar para o home.');
      assert.equal(returned.opacity, 1, 'A foto deve permanecer visível ao voltar.');
      assert.ok(Math.abs(returned.top - initial.photo) < 2, 'O parallax deve retornar à posição inicial sem piscar.');
      const textAnimations = await page.locator('.hero-word span, .hero h1 span, .hero-button').evaluateAll((elements) => elements.flatMap((element) => element.getAnimations().map((animation) => animation.animationName)));
      assert.ok(!textAnimations.some((name) => ['home-word-in', 'home-in-left', 'home-in-right'].includes(name)), 'Os textos e o botão não devem refazer a entrada.');
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 680, height: 900 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 568, height: 320 }]) {
  test(`composição do home em ${viewport.width}x${viewport.height}`, async () => {
    const { page, errors } = await openPage(viewport);
    try {
      await page.waitForTimeout(2200);
      const layout = await page.evaluate(() => {
        const rect = (selector) => document.querySelector(selector).getBoundingClientRect().toJSON();
        const button = document.querySelector('.hero-button');
        const range = document.createRange();
        range.selectNode(button.firstChild);
        return {
          word: rect('.hero-word'), photo: rect('.hero-photo'), title: rect('.hero h1'),
          button: rect('.hero-button'), cities: rect('.hero-cities'),
          wordLayer: Number(getComputedStyle(document.querySelector('.hero-word')).zIndex),
          photoLayer: Number(getComputedStyle(document.querySelector('.hero-visual')).zIndex),
          contentLayer: Number(getComputedStyle(document.querySelector('.hero-content')).zIndex),
          buttonTextLines: range.getClientRects().length, width: document.documentElement.scrollWidth,
        };
      });
      assert.ok(layout.width <= viewport.width, 'A página não deve ultrapassar a largura da tela.');
      assert.ok(layout.word.left >= -1 && layout.word.right <= viewport.width + 1, 'O nome deve caber na tela.');
      assert.ok(layout.wordLayer < layout.photoLayer, 'O retrato deve ficar à frente do nome.');
      assert.ok(layout.word.left < layout.photo.right && layout.word.right > layout.photo.left && layout.word.top < layout.photo.bottom && layout.word.bottom > layout.photo.top, 'O nome deve aparecer atrás da foto.');
      assert.ok(layout.title.top >= 0 && layout.button.bottom <= layout.cities.top && layout.cities.bottom <= viewport.height, 'A chamada, o botão e as cidades precisam caber sem sobreposição.');
      assert.equal(layout.buttonTextLines, 1, 'O texto do botão deve caber em uma linha.');
      if (viewport.width <= 640 && viewport.height > viewport.width) {
        assert.ok(layout.photo.bottom > layout.title.top && layout.contentLayer > layout.photoLayer, 'A parte inferior do retrato deve ficar atrás da chamada no celular.');
      }
      if (viewport.width <= 900 && viewport.height > viewport.width) {
        const coverage = await page.evaluate(() => {
          const photo = document.querySelector('.hero-photo');
          const photoBox = photo.getBoundingClientRect();
          const letters = document.querySelector('.hero-word span').firstChild;
          const canvas = document.createElement('canvas');
          canvas.width = photo.naturalWidth;
          canvas.height = photo.naturalHeight;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.drawImage(photo, 0, 0);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          return [...letters.textContent].map((_, index) => {
            const range = document.createRange();
            range.setStart(letters, index);
            range.setEnd(letters, index + 1);
            const box = range.getBoundingClientRect();
            let covered = 0;
            let total = 0;
            for (let y = box.top; y < box.bottom; y += 4) {
              for (let x = box.left; x < box.right; x += 4) {
                total++;
                if (x < photoBox.left || x >= photoBox.right || y < photoBox.top || y >= photoBox.bottom) continue;
                const px = Math.floor((x - photoBox.left) / photoBox.width * canvas.width);
                const py = Math.floor((y - photoBox.top) / photoBox.height * canvas.height);
                if (pixels[(py * canvas.width + px) * 4 + 3] > 128) covered++;
              }
            }
            return covered / total;
          });
        });
        const ordered = [...coverage].sort((a, b) => b - a);
        assert.ok(ordered[0] > 0.2 && ordered[0] < 0.7, `A cabeça deve cobrir apenas parte de uma letra: ${coverage}`);
        assert.ok(ordered[1] < 0.25, `As outras letras devem continuar visíveis: ${coverage}`);
      }
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

test('os destaques da história respondem ao mouse e o link leva à equipe', async () => {
  const { page, errors } = await openPage({ width: 1440, height: 900 });
  try {
    await page.locator('#historia').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(1500);
    for (const selector of ['.story h2 .story-highlight', '.story-copy .story-highlight', '.story-trajectory']) {
      const element = page.locator(selector);
      const before = await element.evaluate((node) => getComputedStyle(node).color);
      await element.hover();
      await page.waitForTimeout(300);
      const after = await element.evaluate((node) => getComputedStyle(node).color);
      assert.notEqual(after, before, `${selector} deve mudar de cor ao passar o mouse.`);
    }
    const link = page.locator('.story-link');
    const before = await link.evaluate((node) => getComputedStyle(node).color);
    await link.hover();
    await page.waitForTimeout(300);
    assert.notEqual(await link.evaluate((node) => getComputedStyle(node).color), before);
    assert.equal(await link.getAttribute('href'), '#equipe');
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('a história revela foto e texto uma vez ao entrar na tela', async () => {
  const { page, errors } = await openPage({ width: 1440, height: 900 });
  try {
    assert.equal(await page.locator('.story').evaluate((element) => element.classList.contains('reveal-pending')), true);
    await page.evaluate(() => window.scrollTo({ top: innerHeight, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.story').classList.contains('is-revealed'));
    const animations = await page.evaluate(() => ({
      photo: getComputedStyle(document.querySelector('.story-visual')).animationName,
      heading: getComputedStyle(document.querySelector('.story-heading')).animationName,
      copy: getComputedStyle(document.querySelector('.story-copy')).animationName,
    }));
    assert.deepEqual(animations, { photo: 'story-from-left', heading: 'story-from-right', copy: 'story-from-right' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.scrollTo({ top: innerHeight, behavior: 'instant' }));
    await page.waitForTimeout(150);
    const after = await page.locator('.story-visual, .story-heading, .story-copy').evaluateAll((elements) => elements.map((element) => ({ opacity: Number(getComputedStyle(element).opacity), animations: element.getAnimations().length })));
    assert.ok(after.every((element) => element.opacity === 1 && element.animations === 0), 'A história não deve piscar ou repetir a entrada.');
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('a equipe entra em cena uma vez e permanece visível ao voltar', async () => {
  const { page, errors } = await openPage({ width: 1440, height: 900 });
  try {
    await page.locator('#equipe').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.team').classList.contains('is-revealed'));
    const animations = await page.evaluate(() => ({
      text: getComputedStyle(document.querySelector('.team-heading')).animationName,
      photo: getComputedStyle(document.querySelector('.team-visual')).animationName,
    }));
    assert.deepEqual(animations, { text: 'team-from-left', photo: 'team-from-right' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('#equipe').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(150);
    const elements = await page.locator('.team-heading, .team-copy, .team-visual').evaluateAll((nodes) => nodes.map((node) => ({ opacity: Number(getComputedStyle(node).opacity), animations: node.getAnimations().length })));
    assert.ok(elements.every((element) => element.opacity === 1 && element.animations === 0));
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('os serviços aparecem com animações apenas na primeira visita', async () => {
  const { page, errors } = await openPage({ width: 1440, height: 900 });
  try {
    await page.locator('#servicos').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.services').classList.contains('is-revealed'));
    const names = await page.locator('.service-item').evaluateAll((elements) => elements.map((element) => getComputedStyle(element).animationName));
    assert.deepEqual(names, ['services-from-bottom', 'services-from-bottom', 'services-from-bottom']);
    await page.waitForTimeout(1600);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('#servicos').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(150);
    const items = await page.locator('.services-heading, .services-intro, .service-item, .services-link').evaluateAll((elements) => elements.map((element) => ({ opacity: Number(getComputedStyle(element).opacity), animations: element.getAnimations().length })));
    assert.ok(items.every((item) => item.opacity === 1 && item.animations === 0));
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 568 }, { width: 568, height: 320 }]) {
  test(`serviços são legíveis e cabem na tela em ${viewport.width}x${viewport.height}`, async () => {
    const { page, errors } = await openPage(viewport, { reducedMotion: 'reduce' });
    try {
      await page.locator('#servicos').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
      const layout = await page.locator('.services').evaluate((section) => {
        const items = [...section.querySelectorAll('.service-item')];
        const link = section.querySelector('.services-link');
        return { height: section.clientHeight, content: section.scrollHeight, pageWidth: document.documentElement.scrollWidth, items: items.map((item) => ({ title: item.querySelector('h3').textContent, top: item.getBoundingClientRect().top, left: item.getBoundingClientRect().left })), linkBottom: link.getBoundingClientRect().bottom, href: link.getAttribute('href'), animation: getComputedStyle(items[0]).animationName };
      });
      assert.equal(layout.height, viewport.height);
      assert.ok(layout.content <= layout.height + 1);
      assert.ok(layout.pageWidth <= viewport.width && layout.linkBottom <= viewport.height + 1);
      assert.deepEqual(layout.items.map((item) => item.title), ['Cabelo', 'Barba', 'Mais cuidados']);
      assert.equal(layout.href, 'https://wa.me/5500000000000');
      assert.equal(layout.animation, 'none');
      if (viewport.width === 390 || viewport.width === 320 || viewport.width === 768) assert.ok(layout.items[0].top < layout.items[1].top && layout.items[1].top < layout.items[2].top);
      if (viewport.width === 1440 || viewport.width === 1024) assert.ok(layout.items[0].left < layout.items[1].left && layout.items[1].left < layout.items[2].left);
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 568 }, { width: 568, height: 320 }]) {
  test(`equipe e história ocupam a tela em ${viewport.width}x${viewport.height}`, async () => {
    const { page, errors } = await openPage(viewport, { reducedMotion: 'reduce' });
    try {
      await page.locator('#equipe').evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('.team-visual img').naturalWidth > 0);
      const layout = await page.evaluate(() => {
        const story = document.querySelector('.story');
        const team = document.querySelector('.team');
        const photo = document.querySelector('.team-visual img');
        const link = document.querySelector('.team-link');
        return { storyHeight: story.clientHeight, teamHeight: team.clientHeight, contentHeight: team.scrollHeight, pageWidth: document.documentElement.scrollWidth, imageWidth: photo.naturalWidth, alt: photo.alt, link: link.href, animation: getComputedStyle(document.querySelector('.team-heading')).animationName, photoBottom: photo.getBoundingClientRect().bottom, linkBottom: link.getBoundingClientRect().bottom };
      });
      assert.equal(layout.storyHeight, viewport.height);
      assert.equal(layout.teamHeight, viewport.height);
      assert.ok(layout.contentHeight <= layout.teamHeight + 1, 'O conteúdo deve caber na tela verificada.');
      assert.ok(layout.pageWidth <= viewport.width);
      assert.equal(layout.imageWidth, 885);
      assert.ok(layout.alt.includes('Equipe'));
      assert.ok(layout.link.startsWith('https://www.instagram.com/dudu.barbershop01/'));
      assert.equal(layout.animation, 'none');
      assert.ok(layout.photoBottom <= viewport.height + 1 && layout.linkBottom <= viewport.height + 1);
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 568 }, { width: 568, height: 320 }]) {
  test(`história e fotografia cabem em ${viewport.width}x${viewport.height}`, async () => {
    const { page, errors } = await openPage(viewport, { reducedMotion: 'reduce' });
    try {
      await page.evaluate(() => document.querySelector('#historia').scrollIntoView({ behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('.story-visual img').naturalWidth > 0);
      const layout = await page.evaluate(() => {
        const section = document.querySelector('.story');
        const photo = document.querySelector('.story-visual img');
        const link = document.querySelector('.story-link');
        section.scrollTop = section.scrollHeight;
        const box = link.getBoundingClientRect();
        return { height: section.clientHeight, scrollHeight: section.scrollHeight, pageWidth: document.documentElement.scrollWidth, photoWidth: photo.naturalWidth, alt: photo.alt, linkBottom: box.bottom, linkHref: link.getAttribute('href'), animation: getComputedStyle(document.querySelector('.story-heading')).animationName, overflow: getComputedStyle(section).overflowY };
      });
      assert.equal(layout.height, viewport.height);
      if (viewport.height > 400) assert.ok(layout.scrollHeight <= layout.height + 1, 'A seção deve caber na tela verificada.');
      else assert.equal(layout.overflow, 'auto', 'Em telas muito baixas, o conteúdo deve permanecer rolável.');
      assert.ok(layout.pageWidth <= viewport.width);
      assert.equal(layout.photoWidth, 1170);
      assert.ok(layout.alt.includes('barba'));
      assert.ok(layout.linkBottom <= viewport.height);
      assert.equal(layout.linkHref, '#equipe');
      assert.equal(layout.animation, 'none');
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 568, height: 320 }]) {
  test(`foto acima do texto nas duas seções em ${viewport.width}x${viewport.height}`, async () => {
    const { page, errors } = await openPage(viewport, { reducedMotion: 'reduce' });
    try {
      for (const section of ['story', 'team']) {
        await page.locator(`.${section}`).evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
        const layout = await page.locator(`.${section}`).evaluate((element) => {
          const photo = element.querySelector('figure').getBoundingClientRect();
          const heading = element.querySelector('h2').getBoundingClientRect();
          const copy = element.querySelector(`.${element.classList.contains('story') ? 'story' : 'team'}-copy`).getBoundingClientRect();
          return { photoBottom: photo.bottom, photoWidth: photo.width, headingTop: heading.top, headingBottom: heading.bottom, copyTop: copy.top };
        });
        assert.ok(layout.photoBottom <= layout.headingTop, 'A foto deve aparecer acima do título.');
        assert.ok(layout.headingBottom <= layout.copyTop, 'O texto deve aparecer abaixo do título.');
        if (viewport.width === 390) assert.ok(layout.photoWidth >= 250, 'A foto deve ter destaque no celular.');
      }
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}
