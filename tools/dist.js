// Cloudflare Pages build: copy only the public site into ./dist (keeps Docker/API sources out of the deploy)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const files = fs.readdirSync(root).filter((f) => f.endsWith('.html') || f === '_redirects' || f === '_headers');
for (const f of files) fs.copyFileSync(path.join(root, f), path.join(dist, f));
fs.cpSync(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });

console.log(`dist ready: ${files.length} files + assets`);
