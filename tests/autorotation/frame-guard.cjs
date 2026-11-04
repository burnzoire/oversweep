const fs = require('fs'), vm = require('vm'), assert = require('assert');
// Inside a frame the exercise must not start and the page must offer a
// new-window link instead.
let ready = null, shown = null, frames = 0;
const element = () => ({ append(...parts) { this.parts = (this.parts || []).concat(parts); } });
const window = {}; window.self = window; window.top = {};
const ctx = vm.createContext({
  window, location: { href: 'https://oversweep.test/experiences/autorotation/' },
  document: { createElement: element, addEventListener(type, fn) { if (type === 'DOMContentLoaded') ready = fn; }, body: { replaceChildren(n) { shown = n; } } },
  requestAnimationFrame() { frames++; }, console,
});
// app.js is an ES module; its one import is stubbed so it runs as a script here.
const source = (f) => fs.readFileSync('src/experiences/autorotation/' + f, 'utf8')
  .replace(/^import \{ createAxisBindings \} from .*$/m, 'const createAxisBindings = () => { throw new Error("framed exercise must not bind axes"); };');
for (const f of ['frame-guard.js', 'app.js']) vm.runInContext(source(f), ctx);
ready();
assert.equal(frames, 0, 'framed exercise must not start');
const link = shown.parts.find(p => p && p.target);
assert.equal(link.target, '_blank');
assert.equal(link.href, 'https://oversweep.test/experiences/autorotation/');
console.log('Framed autorotation exercise stays stopped and links to a new window: PASS.');
