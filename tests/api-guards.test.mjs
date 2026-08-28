import assert from 'node:assert/strict';
import test from 'node:test';
import { readJsonBody, requireMethod } from '../api/_auth.js';

function responseDouble() {
  return {
    headers: new Map(),
    statusCode: null,
    payload: null,
    setHeader(name, value) { this.headers.set(name, value); },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
}

test('requireMethod permits the expected method and adds no-store protection', () => {
  const response = responseDouble();
  assert.equal(requireMethod({ method: 'POST' }, response, 'POST'), true);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.statusCode, null);
});

test('requireMethod returns a standards-compliant 405 response', () => {
  const response = responseDouble();
  assert.equal(requireMethod({ method: 'GET' }, response, 'POST'), false);
  assert.equal(response.headers.get('Allow'), 'POST');
  assert.equal(response.statusCode, 405);
  assert.deepEqual(response.payload, { error: 'Method not allowed.' });
});

test('readJsonBody parses valid JSON and rejects malformed input', () => {
  assert.deepEqual(readJsonBody({ body: '{"ok":true}', headers: {} }), { ok: true });
  assert.throws(
    () => readJsonBody({ body: '{', headers: {} }),
    (error) => error.statusCode === 400 && error.message === 'Request body must be valid JSON.',
  );
});

test('readJsonBody rejects oversized API payloads before parsing', () => {
  assert.throws(
    () => readJsonBody({ body: '{}', headers: { 'content-length': '100001' } }),
    (error) => error.statusCode === 413,
  );
});
