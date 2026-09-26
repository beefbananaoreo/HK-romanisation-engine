import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import reporter from '../scripts/stable-reporter.mjs';

function event(type, name, data = {}) {
  return { type, data: { name, nesting: 0, ...data } };
}

async function report(events) {
  let output = '';
  for await (const chunk of reporter(events)) output += chunk;
  return output;
}

function runNodeTests(source) {
  const reporterUrl = new URL('../scripts/stable-reporter.mjs', import.meta.url).href;
  const env = { ...process.env };
  // A separate Node invocation must not inherit the parent's test IPC mode.
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, [
    '--input-type=module', `--test-reporter=${reporterUrl}`, '-e', source,
  ], { encoding: 'utf8', timeout: 10_000, env });
  assert.ifError(result.error);
  assert.notEqual(result.stdout, '', result.stderr);
  return { status: result.status, report: JSON.parse(result.stdout) };
}

test('stable reporter preserves exact ordinary pass/fail evidence', async () => {
  const output = await report([
    event('test:start', 'ignored'),
    event('test:pass', 'passed'),
    event('test:fail', 'failed', { nesting: 1, details: { error: new Error('assertion failed') } }),
  ]);
  assert.equal(output, JSON.stringify({
    format: 'CHG050-STEP1-TEST-RESULTS-1',
    tests: [
      { name: 'passed', nesting: 0, result: 'PASS' },
      { name: 'failed', nesting: 1, result: 'FAIL', error: 'assertion failed' },
    ],
    passed: 1,
    failed: 1,
  }, null, 2) + '\n');
});

for (const [flag, expected] of [['skip', 'SKIP'], ['todo', 'TODO']]) {
  test(`stable reporter rejects ${flag} markers including an empty reason`, async () => {
    for (const reason of [true, 'deferred obligation', '']) {
      const output = JSON.parse(await report([
        event('test:pass', 'executed'),
        event('test:pass', 'unexecuted', { [flag]: reason }),
      ]));
      assert.equal(output.tests[1].result, expected);
      assert.equal(output.passed, 1);
      assert.equal(output.failed, 1);
    }
  });
}

test('stable reporter counts failing TODO tests as incomplete obligations', async () => {
  const output = JSON.parse(await report([
    event('test:fail', 'todo failure', { todo: true, details: { error: new Error('not implemented') } }),
  ]));
  assert.deepEqual(output.tests, [
    { name: 'todo failure', nesting: 0, result: 'TODO', error: 'not implemented' },
  ]);
  assert.equal(output.passed, 0);
  assert.equal(output.failed, 1);
});

test('actual Node skip and TODO events cannot masquerade as passing evidence', () => {
  const result = runNodeTests(`
    import test from 'node:test';
    test('executed', () => {});
    test('skipped', { skip: true }, () => { throw new Error('must not execute'); });
    test('todo', { todo: true }, () => {});
  `);
  assert.equal(result.status, 0);
  assert.deepEqual(result.report.tests.map(row => row.result), ['PASS', 'SKIP', 'TODO']);
  assert.equal(result.report.passed, 1);
  assert.equal(result.report.failed, 2);
});

test('actual Node cancellation remains failed evidence', () => {
  const result = runNodeTests(`
    import test from 'node:test';
    const abort = new AbortController();
    test('cancelled', { signal: abort.signal }, () => new Promise(resolve => setTimeout(resolve, 20)));
    abort.abort();
  `);
  assert.equal(result.status, 1);
  assert.equal(result.report.tests[0].result, 'FAIL');
  assert.equal(result.report.passed, 0);
  assert.equal(result.report.failed, 1);
});
