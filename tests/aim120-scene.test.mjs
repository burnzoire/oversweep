// Playback and display geometry for the authored simulator scene.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MOMENTS, SCENE_MOTIONS, relativeBearing, sampleScene, sceneFrame, sceneView } from '../src/data/cockpit/f16c/aim120-scene.ts';
import { aimCue, hud } from '../src/data/cockpit/f16c/hud.ts';
import { aimFcr, local, scope } from '../src/data/cockpit/f16c/mfd-fcr.ts';
import { renderPanel } from '../src/data/cockpit/render.ts';

const seconds = (motion, index = -1) => motion.keyframes.at(index).seconds;
const at = (motion, fraction, start) => sampleScene(
  motion, seconds(motion, 0) + fraction * (seconds(motion) - seconds(motion, 0)), start,
);

test('turn eases in and out while both displays follow the same intermediate poses', () => {
  const { turn } = SCENE_MOTIONS;
  const start = at(turn, 0), early = at(turn, 0.25), mid = at(turn, 0.5), end = at(turn, 1);
  assert.equal(start.aircraft.bank, 0);
  assert.equal(end.aircraft.bank, 0);
  assert.ok(early.aircraft.bank < at(turn, 0.125).aircraft.bank && at(turn, 0.125).aircraft.bank < 0);
  assert.equal(early.aircraft.bank, mid.aircraft.bank);
  assert.equal(mid.aircraft.bank, at(turn, 0.75).aircraft.bank);
  assert.ok(mid.aircraft.bank < at(turn, 0.875).aircraft.bank && at(turn, 0.875).aircraft.bank < 0);
  assert.ok(start.aircraft.heading - early.aircraft.heading < early.aircraft.heading - mid.aircraft.heading);

  const poses = Array.from({ length: 11 }, (_, i) => at(turn, i / 10));
  const radarX = poses.map(frame => aimFcr(frame).cursor.at[0]);
  assert.ok(radarX.every((value, i) => !i || value > radarX[i - 1]));
  assert.ok(Math.abs(radarX.at(-1)) < Math.abs(radarX[0]));
  assert.equal(new Set(poses.map(frame => aimCue(frame).art)).size, poses.length);
  assert.ok(aimCue(mid).bankHeading);
  const relative = frame => relativeBearing(frame.aircraft.bearing, frame.aircraft.heading);
  assert.equal(relative(end), 0);
  assert.equal(relative(MOMENTS.turned), -7);
  assert.deepEqual(aimFcr(end).cursor.at, local(scope(0, end.aircraft.range, end.scale)));
  assert.equal(relative(at(SCENE_MOTIONS.close, 0, end)), 0);
  assert.equal(relative(at(SCENE_MOTIONS.close, 1)), 0);
  assert.equal(relative(sceneFrame('launched')), 0);
});

test('the heading tape shares the attitude ladder roll in the scene pages', () => {
  const svg = renderPanel(hud);
  const heading = svg.match(/data-page="mrm-bugged"[^>]*><g data-indicator="roll">.*?<g data-indicator="heading">/s);
  assert.ok(heading);
  assert.match(heading[0], /data-needle="roll"/);
  for (const id of ['mrm-away-1', 'mrm-away-2', 'mrm-away-3']) {
    assert.match(svg, new RegExp(`data-page="${id}"`));
  }
});

test('close and support sample between every authored range, including when scrubbing backwards', () => {
  for (const motion of [SCENE_MOTIONS.close, SCENE_MOTIONS.support]) {
    for (let i = 1; i < motion.keyframes.length; i++) {
      const a = motion.keyframes[i - 1], b = motion.keyframes[i];
      const time = (a.seconds + b.seconds) / 2;
      const result = sampleScene(motion, time);
      assert.ok(result.aircraft.range < a.frame.aircraft.range && result.aircraft.range > b.frame.aircraft.range);
      assert.equal(result.aircraft.range, sceneView(result).nm);
      assert.deepEqual(sampleScene(motion, b.seconds).aircraft, b.frame.aircraft);
      assert.deepEqual(sampleScene(motion, time), result);
      const closure = Math.round(result.aircraft.closure);
      assert.ok(aimCue(result).texts.some(text => text.t === `${closure}>`));
      assert.ok(aimFcr(result).words.some(word => word.t === `+${closure}K`));
    }
  }
});

test('smoke grows smoothly and the next step starts at exactly the previous endpoint', () => {
  const { away, crank, support } = SCENE_MOTIONS;
  const launchEnd = at(away, 1);
  assert.equal(at(away, 0).trail, 0);
  assert.notEqual(aimCue(at(away, 0.3)).scene, aimCue(at(away, 0.4)).scene);
  assert.ok(at(away, 0.25).trail < launchEnd.trail * 0.25);
  assert.strictEqual(at(crank, 0, launchEnd), launchEnd);
  assert.ok(at(crank, 0.01, launchEnd).trailOpacity > 0.99);

  const mid = at(crank, 0.5, launchEnd), end = at(crank, 1, launchEnd);
  const turn = relativeBearing(end.aircraft.heading, launchEnd.aircraft.heading);
  assert.ok(turn > 0 && turn < 180);
  assert.equal(relativeBearing(mid.aircraft.heading, launchEnd.aircraft.heading), turn / 2);
  assert.ok(mid.aircraft.bank > 0 && mid.trailOpacity < launchEnd.trailOpacity);
  assert.equal(end.aircraft.bank, 0);
  assert.equal(end.trailOpacity, 0);
  assert.strictEqual(at(support, 0, end), end);
});
