const assert = require('node:assert/strict');

(async () => {
  const baseUrl = process.env.QA_URL || 'http://127.0.0.1:8791';
  const urls = Array.from({ length: 110 }, (_, index) =>
    `${baseUrl}/?view=${index % 2 ? 'documents' : 'overview'}&load=${index + 1}`
  );
  const startedAt = Date.now();
  const responses = await Promise.all(urls.map(url => fetch(url, { redirect: 'follow' })));
  const failed = responses.filter(response => !response.ok);
  assert.equal(failed.length, 0, `${failed.length} of 110 requests failed`);
  const bodies = await Promise.all(responses.map(response => response.text()));
  assert.ok(bodies.every(body => body.includes('丝链智盾')), 'unexpected response body');
  console.log(`load-qa: 110 concurrent requests passed in ${Date.now() - startedAt}ms`);
})().catch(error => { console.error(error); process.exitCode = 1; });
