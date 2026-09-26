import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const requiredTests = ['types.test.ts', 'schema.test.ts', 'validators.test.ts', 'chg050-structure.test.ts'];

export function discoverTestFiles(projectRoot) {
  const sources = readdirSync(resolve(projectRoot, 'test'))
    .filter(name => /^(types|schema|validators|chg050[^/]*)\.test\.ts$/.test(name)).sort();
  const missing = requiredTests.filter(name => !sources.includes(name));
  if (missing.length) throw new Error('Missing bounded CHG050 test sources: ' + missing.join(', '));
  return sources.map(name => 'dist/test/' + name.replace(/\.ts$/, '.js'));
}

export function resetBuildDirectory(projectRoot) {
  // Only ignored compiler output is removed; every emitted test must be fresh.
  rmSync(resolve(projectRoot, 'dist'), { recursive: true, force: true });
}

function main() {
process.chdir(root);
const files = discoverTestFiles(root);
const record = process.argv.includes('--record');
const generated = ['src/public-contract.ts', 'generated/hklang-contract-5.0.16.schema.json'];
const before = new Map();
if (!record) for (const path of generated) before.set(path, readFileSync(path));
function command(args) {
  const result = spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,
    env:{...process.env,TZ:'UTC',LANG:'C.UTF-8',LC_ALL:'C.UTF-8'}});
  if (result.error || result.status !== 0) {
    process.stderr.write(result.stdout ?? ''); process.stderr.write(result.stderr ?? '');
    throw new Error(`Command failed (${result.status}): node ${args.join(' ')} ${result.error ?? ''}`);
  }
  return result.stdout;
}
command(['scripts/generate-types.mjs']);
command(['node_modules/typescript/bin/tsc','--noEmit']);
resetBuildDirectory(root);
command(['node_modules/typescript/bin/tsc','-p','tsconfig.build.json']);
command(['dist/src/schema/generate-schema.js']);
const missingOutputs = files.filter(path => !existsSync(path));
if (missingOutputs.length) throw new Error('Missing freshly compiled tests: ' + missingOutputs.join(', '));
const output = command(['--test','--test-concurrency=1','--test-reporter=./scripts/stable-reporter.mjs',...files]);
const results = JSON.parse(output);
if (results.failed || results.passed === 0) throw new Error('Tests did not close');
// Exercise the reporter itself outside the recorded contract evidence.
const harnessResults = JSON.parse(command(['--test', '--test-reporter=./scripts/stable-reporter.mjs',
  'test/stable-reporter.test.mjs', 'test/verification-harness.test.mjs']));
if (harnessResults.failed || harnessResults.passed === 0) throw new Error('Verification harness tests did not close');
mkdirSync('evidence',{recursive:true});
const stable='evidence/stable-test-output.json';
if(record) writeFileSync(stable,output); else if(readFileSync(stable,'utf8')!==output) throw new Error('Stable test output differs');
if(!record) for(const [path,bytes] of before) if(!readFileSync(path).equals(bytes)) throw new Error('Generated output drift: '+path);
process.stdout.write(JSON.stringify({typecheck:'PASS',schemaGeneration:'PASS',tests:results.passed,stableOutput:record?'RECORDED':'MATCH',generatedOutputs:record?'RECORDED':'MATCH',files})+'\n');
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
