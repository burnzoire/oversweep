// Run against the dev server or a PR preview. Install Playwright and Chromium
// separately, as for scripts/cockpit-review.mjs. Screenshots go to <output-dir>.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const [url, output] = process.argv.slice(2);
if (!url || !output) {
  throw new Error('Usage: node scripts/check-theme-preview.mjs <preview-url> <output-dir>');
}

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
const base = new URL(url.endsWith('/') ? url : url + '/');
const f16 = 'manual/aircraft-procedures/f-16c/';
const routes = {
  home: '',
  f16,
  cockpit: f16 + 'cockpit/',
  elec: f16 + 'cockpit/elec/',
  sidewall: f16 + 'cockpit/sidewall-controls/',
  'engine-start': f16 + 'engine-start/',
};
const viewports = {
  desktop: { width: 1440, height: 1000 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
};
const scheme = page => page.locator('html').evaluate(html => getComputedStyle(html).colorScheme);
const preference = page => page.getByRole('combobox', { name: 'Colour theme' });

async function visit(page, route) {
  const response = await page.goto(new URL(route, base).href);
  assert.ok(response?.ok(), `Page failed to load: ${route}`);
}

function luminance(rgb) {
  return rgb.match(/[\d.]+/g).slice(0, 3).map(channel => {
    const value = Number(channel) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(foreground, background) {
  const [brighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (brighter + 0.05) / (darker + 0.05);
}

try {
  await mkdir(output, { recursive: true });
  for (const [size, viewport] of Object.entries(viewports)) {
    const page = await browser.newPage({ viewport, colorScheme: 'dark', reducedMotion: 'reduce' });
    await visit(page, '');
    assert.equal(await preference(page).inputValue(), 'system');
    const search = page.locator('.header-tools .search-trigger');
    await search.focus();
    await page.keyboard.press('Tab');
    assert.ok(await preference(page).evaluate(control => control === document.activeElement));
    const [searchBox, themeBox] = await Promise.all([search.boundingBox(), preference(page).boundingBox()]);
    assert.ok(searchBox && themeBox && searchBox.x < themeBox.x && searchBox.y === themeBox.y);
    assert.equal(await scheme(page), 'light dark');
    const systemBackground = await page.locator('body').evaluate(body => getComputedStyle(body).backgroundColor);

    for (const theme of ['light', 'dark']) {
      await preference(page).selectOption(theme);
      for (const [name, route] of Object.entries(routes)) {
        await visit(page, route);
        assert.equal(await preference(page).inputValue(), theme, name);
        assert.equal(await scheme(page), theme, name);
        const [foreground, background] = await page.locator('body').evaluate(body => {
          const style = getComputedStyle(body);
          return [style.color, style.backgroundColor];
        });
        assert.ok(contrast(foreground, background) >= 4.5, `Body text contrast: ${name} ${theme}`);
        if (name === 'elec' && theme === 'dark') {
          const lampColours = await page.locator('.cp-stage').evaluate(stage => {
            const sample = document.createElement('span');
            stage.append(sample);
            const paper = getComputedStyle(stage).backgroundColor;
            sample.style.color = 'var(--panel-ink)';
            const ink = getComputedStyle(sample).color;
            const colours = ['amber', 'green', 'red', 'blue'].map(colour => {
              sample.style.color = `var(--panel-lit-${colour})`;
              return { colour, lens: getComputedStyle(sample).color, paper, ink };
            });
            sample.remove();
            return colours;
          });
          for (const { colour, lens, paper, ink } of lampColours) {
            assert.ok(contrast(lens, paper) >= 3, `Lit ${colour} lens against panel paper`);
            assert.ok(contrast(ink, lens) >= 4.5, `Legend over lit ${colour} lens`);
          }
        }
        if (name === 'sidewall') {
          const [label, paper] = await page.locator('.cp-stage text').filter({ hasText: 'Canopy switch' }).evaluate(text => [
            getComputedStyle(text).fill,
            getComputedStyle(text.closest('.cp-stage')).backgroundColor,
          ]);
          assert.ok(contrast(label, paper) >= 4.5, `Canopy switch label: ${theme}`);
        }
        if (theme === 'dark') assert.equal(background, systemBackground, name);
        await page.screenshot({ path: join(output, `${name}-${size}-${theme}.png`) });
        if (['elec', 'sidewall', 'engine-start'].includes(name)) {
          await page.locator('.cp-stage:visible').first()
            .screenshot({ path: join(output, `${name}-${size}-${theme}-panel.png`) });
        }
        if (name === 'engine-start' && size === 'desktop' && theme === 'dark') {
          await page.getByRole('button', { name: 'Move MAIN PWR switch up' }).press('Enter');
          await page.locator('[data-step-id="flcs-test"]').waitFor({ state: 'visible' });
          await page.screenshot({ path: join(output, 'engine-start-battery-desktop-dark.png') });
        }
      }
    }

    await preference(page).focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('Enter');
    assert.equal(await preference(page).inputValue(), 'system');
    const background = () => page.locator('body').evaluate(body => getComputedStyle(body).backgroundColor);
    assert.equal(await background(), systemBackground);
    await page.emulateMedia({ colorScheme: 'light' });
    assert.notEqual(await background(), systemBackground);
    await visit(page, 'encyclopedia/');
    assert.equal(await preference(page).count(), 0);
    assert.equal(await scheme(page), 'light');
    await page.close();
  }
} finally {
  await browser.close();
}
