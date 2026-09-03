const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('script.js', 'utf8');
const linkage = fs.readFileSync('linkage-client.js', 'utf8');

assert.match(html, /linkage-client\.css\?v=20260903-01/);
assert.match(html, /linkage-client\.js\?v=20260903-01/);
assert.match(app, /window\.suiyoukaiLinkage = Object\.freeze/);
assert.match(linkage, /action: "linkage_ticket_redeem"/);
assert.match(linkage, /appNumber,\s*displayName/);
assert.match(linkage, /history\.replaceState/);
assert.match(linkage, /1回限りの連携券/);
assert.doesNotMatch(linkage, /searchParams\.set\([^)]*appNumber/);

console.log('Flower app linkage client checks passed.');
