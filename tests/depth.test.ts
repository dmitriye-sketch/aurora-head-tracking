import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authoredDepth } from '../src/scene/depth';

test('authored depth is bounded over the image', () => {
  for (let y = 0; y <= 100; y++) {
    for (let x = 0; x <= 100; x++) {
      const depth = authoredDepth(x / 100, y / 100);
      assert.ok(Number.isFinite(depth) && depth >= 0 && depth <= 1);
    }
  }
});

test('sky is nearly static and near bank is closer than lake and forest', () => {
  assert.ok(authoredDepth(0.5, 0.08) < authoredDepth(0.5, 0.5));
  assert.ok(authoredDepth(0.5, 0.5) < authoredDepth(0.5, 0.75));
  assert.ok(authoredDepth(0.90, 0.70) > authoredDepth(0.5, 0.75));
});

test('depth varies continuously across the image', () => {
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      const value = authoredDepth(x / 100, y / 100);
      assert.ok(Math.abs(value - authoredDepth((x + 1) / 100, y / 100)) < 0.12);
      assert.ok(Math.abs(value - authoredDepth(x / 100, (y + 1) / 100)) < 0.12);
    }
  }
});
