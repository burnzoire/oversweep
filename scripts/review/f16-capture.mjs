import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const host = 'http://127.0.0.1:4321';
const route = '/manual/aircraft-procedures/f-16c/engine-start/';
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], {
  env: { ...process.env, OVERSWEEP_REVIEW_TRAINERS: '1' },
  stdio: ['ignore', 'pipe', 'pipe'], detached: true,
});
server.stdout.on('data', data => process.stdout.write(data));
server.stderr.on('data', data => process.stderr.write(data));

let browser;
try {
  let ready = false;
  for (let i = 0; i < 75; i++) {
    try {
      const response = await fetch(host + route, { signal: AbortSignal.timeout(3000) });
      if (response.status === 200) { ready = true; break; }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!ready) throw Error('Astro review page did not become available');

  const paths = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'];
  const { existsSync } = await import('node:fs');
  const executablePath = paths.find(existsSync);
  if (!executablePath) throw Error('Chrome is not installed on this runner');
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  await mkdir('review-screenshots', { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(host + route, {waitUntil:'networkidle'});
  await page.locator('[data-procedure] [data-step]:visible').first().waitFor();
  if (!(await page.title()).includes('F-16C')) throw Error('Unexpected review page title');
  await page.screenshot({ path: 'review-screenshots/f16-start-desktop.png', fullPage: true });
  // Full-resolution crops permit reviewers to count fasteners and inspect legends,
  // rather than judging tiny drawings embedded in full-page screenshots.
  async function capturePanel(panel, filename) {
    const svg = page.locator(`[data-panel="${panel}"] svg`);
    await svg.evaluate(el => { el.style.width = '680px'; el.style.maxWidth='none'; el.style.maxHeight='none'; });
    await svg.screenshot({ path:`review-screenshots/${filename}.png` });
    await svg.evaluate(el => { el.style.width=''; el.style.maxWidth=''; el.style.maxHeight=''; });
  }

  // Exercise the actual SVG controls; Next must be blocked until each action.
  if (!(await page.locator('[data-next]').isDisabled())) throw Error('Battery action is not gated');
  await page.locator('[data-control="main-batt"]').click();
  if (await page.locator('[data-next]').isDisabled()) throw Error('Battery switch did not complete step');
  await page.screenshot({ path: 'review-screenshots/f16-battery-selected-desktop.png', fullPage: true });
  await capturePanel('elec','panel-elec-detail');
  await page.locator('[data-next]').click(); // FLCS test
  await page.locator('[data-control="flcs-test"]').click();
  await page.screenshot({ path: 'review-screenshots/f16-flcs-test-desktop.png', fullPage: true });
  await capturePanel('test','panel-test-detail');
  await page.locator('[data-next]').click(); // FLCS release
  await page.locator('[data-control="flcs-test"]').click();
  await page.locator('[data-next]').click(); // MAIN PWR
  await page.locator('[data-control="main-main"]').click();
  await page.screenshot({ path: 'review-screenshots/f16-electrical-caution-desktop.png', fullPage: true });
  await page.locator('[data-next]').click(); // EPU
  await page.locator('[data-control="epu-check"]').click();
  await page.locator('[data-next]').click(); // ground
  await page.locator('[data-next]').click(); // JFS
  await page.locator('[data-control="jfs-start2"]').click();
  await page.screenshot({ path: 'review-screenshots/f16-jfs-selected-desktop.png', fullPage: true });
  await capturePanel('jfs','panel-jfs-detail');
  await page.locator('[data-next]').click(); // 20 percent
  await page.waitForTimeout(1400);
  if (!(await page.locator('[data-step="7"]').isVisible())) throw Error('RPM 20% step not reached');
  await page.screenshot({ path: 'review-screenshots/f16-rpm20-desktop.png', fullPage: true });
  await page.locator('[data-confirm]').click();
  await page.locator('[data-next]').click(); // throttle idle
  await page.locator('[data-control="throttle-idle"]').click();
  await page.screenshot({ path: 'review-screenshots/f16-throttle-idle-desktop.png', fullPage: true });
  await page.locator('[data-next]').click(); // generator
  await page.screenshot({ path: 'review-screenshots/f16-engine-eyebrow-desktop.png', fullPage: true });
  await page.locator('[data-confirm]').click();
  await page.locator('[data-next]').click(); // idle
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'review-screenshots/f16-idle-desktop.png', fullPage: true });
  const instrument = page.locator('[data-engine-reference] svg');
  await instrument.evaluate(el => {el.style.width='540px';el.style.maxWidth='none'});
  await instrument.screenshot({path:'review-screenshots/panel-engine-stack-detail.png'});
  await page.setViewportSize({ width: 390, height: 844 });
  for (let i=10;i>0;i--) await page.locator('[data-prev]').click();
  await page.screenshot({ path: 'review-screenshots/f16-start-mobile.png', fullPage: true });
  console.log('Captured panel geometry for ELEC/TEST/JFS, caution light matrix, right eyebrow and instrument stack plus mobile in Chromium; step gating verified.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  try { process.kill(-server.pid, 'SIGTERM'); } catch {}
  process.exit(process.exitCode || 0);
}
