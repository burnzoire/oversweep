// Joystick, throttle and game controller axis binding for the trainers,
// through the browser's Gamepad API. The pilot presses Set beside a control
// and moves the axis they want for it; the binding (controller, axis,
// invert) is kept in localStorage. Used by the autorotation exercise and
// the instrument trainer.
//
// An axis reports only when it moves, so keys and on-screen controls still
// work with a controller connected. Values are signed so that pushed
// forward or up reads +1 (most devices report forward or up as -1); a
// control with `raw: true` keeps the device's sign, so a stick's right
// reads +1.

const pads = () => (navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : []);

/**
 * `controls`: [{ id, label, raw? }] in the order the rows appear. `rows`: the
 * element the binding rows are drawn into. `status`: an element for the
 * connected-controller line. `storeKey`: the localStorage key.
 * Returns { poll, clear, cancel, render, bound }. poll() returns the values of
 * the bound axes that moved since the last poll, { [id]: -1..1 }.
 */
export function createAxisBindings({ controls, rows, status, storeKey }) {
  const read = () => { try { return JSON.parse(localStorage.getItem(storeKey)) || {}; } catch { return {}; } };
  const write = () => { try { localStorage.setItem(storeKey, JSON.stringify(bindings)); } catch { /* private window */ } };
  let bindings = read(), binding = null, shownAt = -Infinity;
  const seen = {};
  const last = {};
  const els = {};

  for (const { id, label } of controls) {
    const row = document.createElement('div');
    row.className = 'bind-row';
    const name = document.createElement('span'); name.textContent = label;
    const shown = document.createElement('b');
    const set = document.createElement('button'); set.type = 'button'; set.textContent = 'Set';
    const inv = document.createElement('label'); inv.className = 'switch';
    const box = document.createElement('input'); box.type = 'checkbox';
    inv.append(box, ' Invert');
    row.append(name, shown, set, inv);
    rows.append(row);
    els[id] = { shown, box };
    set.addEventListener('click', () => start(id));
    box.addEventListener('change', () => { if (bindings[id]) { bindings[id].invert = box.checked; write(); } });
  }

  function start(id) {
    binding = { id, base: Object.fromEntries(pads().map((p) => [p.index, [...p.axes]])) };
    els[id].shown.textContent = 'Move it now…';
  }
  function render() {
    for (const { id } of controls) {
      const b = bindings[id];
      els[id].shown.textContent = b ? `Controller ${b.pad + 1}, axis ${b.axis + 1}` : 'Not set';
      els[id].box.checked = Boolean(b?.invert);
    }
  }
  function clear() { bindings = {}; binding = null; write(); render(); }
  function cancel() { binding = null; render(); }

  function poll() {
    const list = pads();
    if (status && status.closest('dialog')?.open !== false && performance.now() - shownAt > 100) {
      shownAt = performance.now();
      // Every device the browser exposes, one name per line, with a mark on
      // the one being moved, so a pilot can see whether their stick is
      // visible at all.
      const now = performance.now();
      for (const p of list) {
        const prev = seen[p.index];
        if (prev && p.axes.some((v, i) => Math.abs(v - (prev.axes[i] ?? v)) > 0.05)) prev.moved = now;
        seen[p.index] = { axes: [...p.axes], moved: prev?.moved ?? -Infinity };
      }
      status.textContent = list.length
        ? list.map((p) => `${p.index + 1}. ${p.id.replace(/\s*\(.*\)\s*$/, '')}${now - seen[p.index].moved < 1000 ? '  ← moving' : ''}`).join('\n')
          + (list.length >= 4 ? '\nA browser shows only so many devices (some stop at four, others at eight). If yours is missing, try Firefox, which showed more, or unplug a device you do not need here.' : '')
        : 'No controller seen yet. Press any button on it; browsers reveal each device on its first input.';
    }
    const out = {};
    if (binding) {
      // A controller first seen after Set was pressed (browsers reveal each
      // one on its first input) takes its resting axes as its baseline.
      for (const p of list) {
        const base = binding.base[p.index] ??= [...p.axes];
        const axis = p.axes.findIndex((v, i) => Math.abs(v - (base[i] ?? v)) > 0.5);
        if (axis < 0) continue;
        bindings[binding.id] = { pad: p.index, axis, invert: els[binding.id].box.checked };
        delete last[binding.id];
        write(); binding = null; render();
        break;
      }
      return out;
    }
    for (const { id, raw } of controls) {
      const b = bindings[id];
      const pad = b && list.find((p) => p.index === b.pad);
      const v = pad?.axes[b.axis];
      if (v === undefined) continue;
      if (last[id] !== undefined && Math.abs(v - last[id]) < 0.01) continue;
      last[id] = v;
      out[id] = (b.invert ? -1 : 1) * (raw ? v : -v);
    }
    return out;
  }

  render();
  return { poll, clear, cancel, render, bound: (id) => Boolean(bindings[id]) };
}
