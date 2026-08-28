import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const requiredFiles = [
  'public/robots.txt',
  'public/sitemap.xml',
  'public/.well-known/security.txt',
  'public/assets/sick-mind-edp445.jpg',
  'docs/1000-improvements.md',
  'firestore.rules',
];

await Promise.all(requiredFiles.map((path) => access(path, constants.R_OK)));

const [backlog, html, rules, manifestText, vercelText] = await Promise.all([
  readFile('docs/1000-improvements.md', 'utf8'),
  readFile('index.html', 'utf8'),
  readFile('firestore.rules', 'utf8'),
  readFile('public/manifest.json', 'utf8'),
  readFile('vercel.json', 'utf8'),
]);

const ids = [...backlog.matchAll(/^\- \[[ x]\] \*\*(UD-\d{4})/gm)].map((match) => match[1]);
const completed = [...backlog.matchAll(/^\- \[x\] \*\*(UD-\d{4})/gm)].map((match) => match[1]);
if (ids.length !== 1000) throw new Error(`Expected exactly 1,000 backlog items; found ${ids.length}.`);
if (new Set(ids).size !== ids.length) throw new Error('Improvement backlog contains duplicate IDs.');
if (ids[0] !== 'UD-0001' || ids.at(-1) !== 'UD-1000') throw new Error('Improvement IDs are not contiguous from UD-0001 to UD-1000.');
if (!completed.length) throw new Error('The improvement register must preserve evidence-backed completion status.');

const requiredHtml = [
  'The Sick Mind of EDP445',
  'Are you a journalist?',
  'application/ld+json',
  'id="auth-modal"',
  'id="admin-view"',
  'creators@undrgrnddocs.com',
  'free pre-launch stage',
];
for (const marker of requiredHtml) {
  if (!html.includes(marker)) throw new Error(`Missing required launch marker: ${marker}`);
}

for (const marker of ['verifiedAdmin()', 'creatorApplications', 'request.resource.data.createdAt == request.time']) {
  if (!rules.includes(marker)) throw new Error(`Missing Firestore safety marker: ${marker}`);
}

const manifest = JSON.parse(manifestText);
const vercel = JSON.parse(vercelText);
if (manifest.id !== '/' || manifest.scope !== '/') throw new Error('PWA manifest must stay scoped to the site root.');
if (!Array.isArray(vercel.headers) || !vercel.headers.length) throw new Error('Vercel security headers are missing.');

console.log(`Launch checks passed: 1,000 unique items (${completed.length} implemented) and all required safety artifacts are present.`);
