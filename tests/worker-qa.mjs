import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const buildDir = path.resolve(process.env.WORKER_BUILD_DIR || 'dist');
const worker = (await import(pathToFileURL(path.join(buildDir, 'server', 'index.js')).href + `?v=${Date.now()}`)).default;
const run = (pathname, init = {}, env = {}) => worker.fetch(new Request(`https://example.test${pathname}`, init), env, {});

for (const route of ['/', '/styles.css', '/app.js', '/archive-rules.js', '/config.js']) {
  const response = await run(route);
  assert.equal(response.status, 200, `${route} should be served`);
}
assert.match(await (await run('/config.js')).text(), /\/api\/analyze/);
const sample = { taskId: 'TASK-001', route: '深圳 → 林查班', riskScore: 78, issues: [{ level: 'high', title: '数量不一致', detail: '提单少200件' }] };
let response = await run('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sample) });
assert.equal(response.status, 503);

const originalFetch = globalThis.fetch;
let upstreamRequest;
globalThis.fetch = async (url, init) => {
  upstreamRequest = { url, init };
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ risk_summary: '存在短装风险，需暂停放单。', actions: ['仓库复点', '核对提单', '通知业务负责人'], evidence_note: '依据数量差异字段生成，须人工复核。' }) } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
};
response = await run('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sample) }, { DEEPSEEK_API_KEY: 'test-secret', DEEPSEEK_MODEL: 'deepseek-flash' });
globalThis.fetch = originalFetch;
assert.equal(response.status, 200);
const payload = await response.json();
assert.equal(payload.model, 'deepseek-flash');
assert.equal(payload.advice.actions.length, 3);
assert.equal(upstreamRequest.url, 'https://api.deepseek.com/chat/completions');
assert.equal(upstreamRequest.init.headers.authorization, 'Bearer test-secret');
assert.ok(!JSON.stringify(payload).includes('test-secret'));
console.log('worker-qa: static routes, secret isolation, DeepSeek proxy and response validation passed');
