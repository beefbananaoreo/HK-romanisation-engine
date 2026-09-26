export default async function* reporter(source) {
  const rows = [];
  for await (const event of source) {
    if (event.type === 'test:pass' || event.type === 'test:fail') {
      // Node emits test:pass for skipped and passing TODO tests. Neither closes
      // an execution obligation, so preserve that distinction in the evidence.
      const skip = event.data.skip === true || typeof event.data.skip === 'string';
      const todo = event.data.todo === true || typeof event.data.todo === 'string';
      const row = {name: event.data.name, nesting: event.data.nesting,
        result: skip ? 'SKIP' : todo ? 'TODO' : event.type === 'test:pass' ? 'PASS' : 'FAIL'};
      if (event.type === 'test:fail') row.error = String(event.data.details?.error?.message ?? event.data.details?.error ?? 'failure');
      rows.push(row);
    }
  }
  yield JSON.stringify({format:'CHG050-STEP1-TEST-RESULTS-1', tests:rows,
    passed:rows.filter(x=>x.result==='PASS').length,
    failed:rows.filter(x=>x.result!=='PASS').length}, null, 2) + '\n';
}
