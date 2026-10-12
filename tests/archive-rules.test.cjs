const assert = require('node:assert/strict');
const rules = require('../dist/archive-rules.js');

const record = rules.buildArchiveRecord({
  enterprise: 'SCG', fonds: 'A001', project: 'BR2026', category: 'ZY', subcategory: 'GJGYL',
  year: '2026', retention: 'D10', stage: 'PROC', documentType: 'PO', date: '2026-10-12', sequence: 8, version: 1, language: 'ZH', extension: 'pdf'
});
assert.equal(record.archiveNumber, 'A001-ZY·GJGYL·2026·D10-PROC-0008');
assert.equal(record.fileName, 'SCG-BR2026-PROC-PO-20261012-0008-V01-ZH.pdf');
assert.equal(record.retentionLabel, '定期10年');
assert.match(record.paperLabel, /电子文件：SCG-BR2026/);

const sanitized = rules.buildArchiveRecord({ enterprise: '../sc g', fonds: 'a-001', project: '订单 88', sequence: '123456' });
assert.equal(sanitized.enterprise, 'SCG');
assert.equal(sanitized.fonds, 'A001');
assert.equal(sanitized.project, '88');
assert.equal(sanitized.sequence, '3456');
assert.doesNotMatch(sanitized.fileName, /\.\.|\//);

const exported = rules.csv([record]);
assert.match(exported, /^"档号","电子文件名"/);
assert.match(exported, /A001-ZY·GJGYL·2026·D10-PROC-0008/);
console.log('archive-rules: 12 assertions passed');
