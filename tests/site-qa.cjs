const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('dist/index.html', 'utf8');
const app = fs.readFileSync('dist/app.js', 'utf8');
const css = fs.readFileSync('dist/styles.css', 'utf8');
for (const file of ['index.html', 'app.js', 'styles.css', 'archive-rules.js']) {
  assert.equal(fs.readFileSync(file, 'utf8'), fs.readFileSync(`dist/${file}`, 'utf8'), `${file} differs between GitHub Pages root and Sites dist`);
}
const ids = [...html.matchAll(/id=["']([^"']+)/g)].map(match => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert.deepEqual(duplicateIds, [], `duplicate IDs: ${duplicateIds.join(', ')}`);

const selectors = [...app.matchAll(/querySelector\(["']#([^"']+)/g)].map(match => match[1]);
const missing = [...new Set(selectors)].filter(id => !ids.includes(id));
assert.deepEqual(missing, [], `missing selector targets: ${missing.join(', ')}`);
assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length, 'unbalanced CSS braces');
for (const required of ['archiveForm', 'archiveNumberOutput', 'fileNameOutput', 'paperLabelOutput', 'archiveRegister']) assert.ok(ids.includes(required));
for (const standard of ['DA/T 13—2022', 'DA/T 22—2015', 'GB/T 18894—2016', 'DA/T 31—2017', 'DA/T 94—2022']) assert.ok(html.includes(standard));
console.log(`site-qa: root/dist parity, ${ids.length} IDs, ${new Set(selectors).size} selector targets, standards and CSS passed`);
