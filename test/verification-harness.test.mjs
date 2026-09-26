import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { discoverTestFiles, resetBuildDirectory } from '../scripts/run-step1.mjs';

const required = ['types.test.ts', 'schema.test.ts', 'validators.test.ts', 'chg050-structure.test.ts'];

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'hklang verification '));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, 'test'));
  mkdirSync(join(directory, 'dist', 'test'), { recursive: true });
  for (const name of required) {
    writeFileSync(join(directory, 'test', name), '// current source\n');
    writeFileSync(join(directory, 'dist', 'test', name.replace(/\.ts$/, '.js')), '// old output\n');
  }
  return directory;
}

test('verification CLI rejects a missing mandatory source despite stale compiled evidence', t => {
  const directory = fixture(t);
  rmSync(join(directory, 'test', 'chg050-structure.test.ts'));
  mkdirSync(join(directory, 'scripts'));
  copyFileSync(new URL('../scripts/run-step1.mjs', import.meta.url), join(directory, 'scripts', 'run-step1.mjs'));
  const result = spawnSync(process.execPath, [join(directory, 'scripts', 'run-step1.mjs')], {
    encoding: 'utf8', timeout: 10_000,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing bounded CHG050 test sources: chg050-structure\.test\.ts/);
});

test('all four mandatory source suites are required independently', t => {
  const directory = fixture(t);
  for (const name of required) {
    rmSync(join(directory, 'test', name));
    assert.throws(() => discoverTestFiles(directory), error => error.message.includes(name));
    writeFileSync(join(directory, 'test', name), '// restored source\n');
  }
});

test('test discovery includes new CHG050 suites and excludes obsolete compiled suites', t => {
  const directory = fixture(t);
  writeFileSync(join(directory, 'test', 'chg050-added.test.ts'), '// new regression\n');
  writeFileSync(join(directory, 'dist', 'test', 'chg050-obsolete.test.js'), '// removed suite\n');
  assert.deepEqual(discoverTestFiles(directory), [
    'dist/test/chg050-added.test.js',
    'dist/test/chg050-structure.test.js',
    'dist/test/schema.test.js',
    'dist/test/types.test.js',
    'dist/test/validators.test.js',
  ]);
});

test('a new build cannot reuse old emitted files and preserves source files', t => {
  const directory = fixture(t);
  resetBuildDirectory(directory);
  assert.equal(existsSync(join(directory, 'dist')), false);
  assert.equal(readFileSync(join(directory, 'test', 'types.test.ts'), 'utf8'), '// current source\n');
  assert.doesNotThrow(() => resetBuildDirectory(directory));
});
