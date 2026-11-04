import assert from 'node:assert/strict';
import test from 'node:test';

// A minimal DOM and Gamepad API, enough for the binding rows.
function el() {
  const node = { children: [], listeners: {}, textContent: '', checked: false,
    append(...xs) { this.children.push(...xs); },
    addEventListener(t, f) { this.listeners[t] = f; } };
  return node;
}
globalThis.document = { createElement: el };
const store = {};
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; } };
const pad = { index: 0, id: 'Test HOTAS', mapping: '', axes: [0.4, 0, -1, 0] };
Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => [pad] }, configurable: true });
const { createAxisBindings } = await import('../../src/lessons/shared/axis-bindings.mjs');

test('Set binds the axis that moves, ignoring one resting off centre, and keeps signs', () => {
  const rows = el();
  const axes = createAxisBindings({ controls: [{ id: 'pitch', label: 'Pitch' }, { id: 'roll', label: 'Roll', raw: true }], rows, storeKey: 'k' });
  assert.equal(axes.bound('pitch'), false);
  assert.deepEqual(axes.poll(), {}, 'nothing bound: nothing reported, whatever the axes rest at');
  const setButton = (i) => rows.children[i].children[2];
  setButton(0).listeners.click();
  pad.axes[1] = -1; // stick pushed forward
  axes.poll();
  assert.equal(axes.bound('pitch'), true);
  assert.deepEqual(JSON.parse(store.k).pitch, { pad: 0, axis: 1, invert: false });
  assert.equal(axes.poll().pitch, 1, 'forward reads +1');
  assert.equal(axes.poll().pitch, undefined, 'an axis that has not moved reports nothing');
  setButton(1).listeners.click();
  pad.axes[3] = 1; // stick right
  axes.poll();
  assert.equal(axes.poll().roll, 1, 'a raw axis keeps the device sign: right reads +1');
  rows.children[0].children[3].children[0].checked = true;
  rows.children[0].children[3].children[0].listeners.change();
  pad.axes[1] = -0.5;
  assert.equal(axes.poll().pitch, -0.5, 'invert flips it');
  axes.clear();
  assert.equal(axes.bound('pitch'), false);
});
