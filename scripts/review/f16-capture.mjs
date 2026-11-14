import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const host = 'http://127.0.0.1:4321';
const route = '/manual/aircraft-procedures/f-16c/engine-start/';
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], {
  env: { ...process.env, OVERSWEEP_REVIEW_TRAINERS: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.on('data', data => process.stdout.write(data));
server.stderr.on('data', data => process.stderr.write(data));

let browser;
try {
  let ready = false;
  for (let i = 0; i < 75; i++) {
    try {
      const response = await fetch(host + route);
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

  // The 20% gate is step 8 (zero-based index 7).
  for (let i = 0; i < 7; i++) await page.locator('[data-next]').click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'review-screenshots/f16-rpm20-desktop.png', fullPage: true });
  if (!(await page.locator('[data-step="7"]').isVisible())) throw Error('RPM 20% step not reached');

  for (let i = 7; i < 10; i++) await page.locator('[data-next]').click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'review-screenshots/f16-idle-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  for (let i=10;i>0;i--) await page.locator('[data-prev]').click();
  await page.screenshot({ path: 'review-screenshots/f16-start-mobile.png', fullPage: true });
  console.log('Captured desktop start, RPM threshold, idle, and mobile start from real Chromium browser.');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
