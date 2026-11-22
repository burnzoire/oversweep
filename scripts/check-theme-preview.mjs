// Run against a local build, dev server, or PR preview. Install Playwright and Chromium
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
const referenceRoutes = {
  manual: ['manual/', '.subject-nav'],
  'manual-group': ['manual/general-flight/', '.page-content'],
  'flight-diagram': ['manual/flight-fundamentals/principles-of-flight/', 'svg.natops'],
  'instrument-lesson': ['manual/instrument-flight/attitude-instrument-flying/', 'svg.inst'],
  'formation-lesson': ['manual/formation-flying/two-ship-formation/', 'svg.form'],
  'refueling-lesson': ['manual/air-to-air-refuelling/aar-procedures/', 'svg.aar'],
  'aerodrome-lesson': ['manual/airfield-operations/airfield-basics/', 'svg:has(.apron)'],
  'radio-bands': ['manual/radio-communications/radio-procedures/', 'svg:has(.band.uhf)'],
  'training-library': ['training/', '.page-content'],
  encyclopedia: ['encyclopedia/', '.page-content'],
  'aircraft-catalogue': ['encyclopedia/aircraft/', '.record-filter'],
  'aircraft-record': ['encyclopedia/aircraft/f-16/', '.data-plate'],
  glossary: ['encyclopedia/terminology/brevity/', '.term'],
  'reference-data': ['encyclopedia/reference-data/units-and-conversions/', 'table'],
  'airfield-plan': ['encyclopedia/locations/sochi/', 'svg.plan'],
  'carrier-profile': ['encyclopedia/carriers/classes/nimitz/', '.page-content'],
};
const figureLabels = {
  'aerodrome-lesson': ['APRON (RAMP)', '.apron'],
  'radio-bands': [/^UHF +300/, '.band.uhf'],
};
const trainers = {
  'case-iii': ['#briefDialog', '#startExercise', '#chart'],
  'ils-approach': ['#brief', '#start', '#mainApp'],
  'autorotation': ['#setup', '#start', '#scene'],
  'radio-trainer': [null, null, '.columns'],
};
const viewports = {
  desktop: { width: 1440, height: 1000 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
};
const scheme = page => page.locator('html').evaluate(html => getComputedStyle(html).colorScheme);
const preference = page => page.getByRole('button', { name: /^Switch to (light|dark) mode$/ });
const activeTheme = page => preference(page).getAttribute('data-current-theme');

async function selectTheme(page, theme) {
  if (await scheme(page) === 'light dark' && await activeTheme(page) === theme) {
    await preference(page).click();
  }
  if (await activeTheme(page) !== theme) await preference(page).click();
  assert.equal(await scheme(page), theme);
}

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
    const context = await browser.newContext({ viewport, colorScheme: 'dark', reducedMotion: 'reduce' });
    const page = await context.newPage();
    await visit(page, '');
    assert.equal(await activeTheme(page), 'dark');
    const search = page.getByRole('link', { name: 'Search', exact: true });
    await preference(page).focus();
    await page.keyboard.press('Tab');
    assert.ok(await search.evaluate(control => control === document.activeElement));
    const [searchBox, themeBox, headerBox] = await Promise.all([
      search.boundingBox(), preference(page).boundingBox(), page.locator('.header-inner').boundingBox(),
    ]);
    assert.ok(searchBox && themeBox && headerBox && themeBox.x < searchBox.x && searchBox.y === themeBox.y);
    assert.ok(Math.abs(searchBox.x + searchBox.width - (headerBox.x + headerBox.width)) < 1);
    await page.keyboard.press('Enter');
    await page.getByRole('dialog', { name: 'Search Oversweep' }).waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    assert.equal(await scheme(page), 'light dark');
    const systemBackground = await page.locator('body').evaluate(body => getComputedStyle(body).backgroundColor);

    for (const theme of ['light', 'dark']) {
      await selectTheme(page, theme);
      for (const [name, route] of Object.entries(routes)) {
        await visit(page, route);
        assert.equal(await activeTheme(page), theme, name);
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
      if (size !== 'tablet') {
        for (const [name, [route, target]] of Object.entries(referenceRoutes)) {
          await visit(page, route);
          assert.equal(await activeTheme(page), theme, name);
          const subject = page.locator(target).first();
          const surface = await subject.evaluate(element => {
            for (let node = element; node; node = node.parentElement) {
              const background = getComputedStyle(node).backgroundColor;
              if (background !== 'rgba(0, 0, 0, 0)') return background;
            }
          });
          const ink = await subject.evaluate(element => getComputedStyle(element).color);
          assert.ok(contrast(ink, surface) >= 4.5, `Reference surface contrast: ${name} ${theme}`);
          const label = figureLabels[name];
          if (label) {
            const [text, shape] = label;
            const [pigment, paper] = await Promise.all([
              subject.locator('text').filter({ hasText: text }).first().evaluate(node => getComputedStyle(node).fill),
              subject.locator(shape).first().evaluate(node => getComputedStyle(node).fill),
            ]);
            assert.ok(contrast(pigment, paper) >= 4.5, `Diagram label contrast: ${name} ${theme}`);
          }
          if (name === 'aircraft-catalogue') {
            const select = subject.locator('select:visible').first();
            const [text, background] = await select.evaluate(element => {
              const style = getComputedStyle(element);
              return [style.color, style.backgroundColor];
            });
            assert.ok(contrast(text, background) >= 4.5, `Catalogue select contrast: ${theme}`);
          }
          await page.screenshot({ path: join(output, `${name}-${size}-${theme}.png`) });
          if (target !== '.page-content') {
            await subject.screenshot({ path: join(output, `${name}-${size}-${theme}-detail.png`) });
          }
        }
      }
    }

    await page.evaluate(() => localStorage.removeItem('oversweep:theme'));
    await page.reload();
    assert.equal(await scheme(page), 'light dark');
    const background = () => page.locator('body').evaluate(body => getComputedStyle(body).backgroundColor);
    assert.equal(await background(), systemBackground);
    await page.emulateMedia({ colorScheme: 'light' });
    assert.notEqual(await background(), systemBackground);
    await page.getByRole('button', { name: 'Switch to dark mode' }).waitFor();
    if (size !== 'tablet') {
      const trainer = await context.newPage();
      await trainer.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
      for (const [slug, [brief, start, exercise]] of Object.entries(trainers)) {
        for (const theme of ['light', 'dark']) {
          await selectTheme(page, theme);
          await visit(trainer, `experiences/${slug}/`);
          assert.ok(await trainer.locator('body').getAttribute('data-experience-id'), slug);
          assert.equal(await scheme(trainer), theme, slug);
          assert.equal(await preference(trainer).count(), 0);
          if (brief) {
            await trainer.locator(brief).waitFor({ state: 'visible' });
            await trainer.screenshot({ path: join(output, `trainer-${slug}-${size}-${theme}-brief.png`) });
            await trainer.locator(start).click();
          }
          await trainer.locator(exercise).waitFor({ state: 'visible' });
          if (slug === 'radio-trainer') {
            for (const input of await trainer.locator('input[placeholder]').all()) {
              const [text, paper] = await input.evaluate(element => [
                getComputedStyle(element, '::placeholder').color,
                getComputedStyle(element).backgroundColor,
              ]);
              assert.ok(contrast(text, paper) >= 4.5, `Radio trainer placeholder contrast: ${theme}`);
            }
          }
          await trainer.screenshot({ path: join(output, `trainer-${slug}-${size}-${theme}.png`) });
          if (size === 'desktop' && slug === 'ils-approach') {
            await trainer.locator('#goAround').click();
            await trainer.locator('#debrief').waitFor({ state: 'visible' });
            await trainer.screenshot({ path: join(output, `trainer-${slug}-${size}-${theme}-debrief.png`) });
          }
        }
      }

      // A trainer already open in a separate tab updates without a reload.
      await visit(trainer, 'experiences/autorotation/');
      const darkSky = await trainer.locator('#scene').evaluate(canvas => {
        const context = canvas.getContext('2d');
        return Array.from(context.getImageData(30, 30, 1, 1).data);
      });
      await selectTheme(page, 'light');
      await trainer.waitForFunction(() => document.documentElement.dataset.theme === 'light');
      await trainer.waitForFunction(dark => {
        const canvas = document.querySelector('#scene');
        const rgba = canvas.getContext('2d').getImageData(30, 30, 1, 1).data;
        return rgba[0] > dark[0] + 40 && rgba[3] === 255;
      }, darkSky);
      await page.evaluate(() => localStorage.removeItem('oversweep:theme'));
      await trainer.waitForFunction(() => !document.documentElement.dataset.theme);
      assert.equal(await scheme(trainer), 'light dark');
      await trainer.close();
    }
    if (size === 'desktop') {
      await visit(page, '');
      await selectTheme(page, 'light');
      await visit(page, 'manual/');
      const otherTab = await context.newPage();
      await visit(otherTab, '');
      await selectTheme(otherTab, 'dark');
      await page.goBack();
      await page.waitForFunction(() => document.querySelector('[data-theme-preference]')?.dataset.currentTheme === 'dark');
      assert.equal(await scheme(page), 'dark');
      await otherTab.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
