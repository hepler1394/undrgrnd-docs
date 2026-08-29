// Move the self-hosted films off Vercel Blob onto Cloudflare R2.
//
// Why: the Blob store (undrgrnd-media, Hobby plan) hit its limit and was
// suspended, so every self-hosted film started returning 403 and the site's
// hero stopped playing. R2 has no egress fees, which is the right shape for
// hour-long documentaries.
//
// Usage:
//   node scripts/migrate-to-r2.mjs --check          verify credentials only
//   node scripts/migrate-to-r2.mjs <file> <key>     upload one file
//   node scripts/migrate-to-r2.mjs --rewrite        repoint index.html at R2
//
// Credentials are read from .env.local and never printed.

import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { createReadStream, readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function env() {
  const raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  const need = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'];
  const missing = need.filter((k) => !out[k]);
  if (missing.length) {
    console.error('Missing in .env.local: ' + missing.join(', '));
    console.error('\nCreate an R2 bucket at dash.cloudflare.com -> R2, then an API token');
    console.error('with Object Read & Write on that bucket, and add those five values.');
    process.exit(1);
  }
  return out;
}

function client(e) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: e.R2_ACCESS_KEY_ID, secretAccessKey: e.R2_SECRET_ACCESS_KEY },
  });
}

const mode = process.argv[2];

if (mode === '--check') {
  const e = env();
  await client(e).send(new HeadBucketCommand({ Bucket: e.R2_BUCKET_NAME }));
  console.log(`ok: bucket "${e.R2_BUCKET_NAME}" reachable`);
  console.log(`public base: ${e.R2_PUBLIC_URL}`);
  process.exit(0);
}

if (mode === '--rewrite') {
  const e = env();
  const file = join(ROOT, 'index.html');
  const before = readFileSync(file, 'utf8');
  const base = e.R2_PUBLIC_URL.replace(/\/$/, '');
  const after = before.replace(
    /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/videos\//g,
    `${base}/videos/`,
  );
  const n = (before.match(/public\.blob\.vercel-storage\.com\/videos\//g) || []).length;
  if (!n) { console.log('nothing to rewrite'); process.exit(0); }
  writeFileSync(file, after);
  console.log(`rewrote ${n} video URL(s) in index.html -> ${base}/videos/`);
  process.exit(0);
}

// upload one file
const src = process.argv[2];
const key = process.argv[3] || `videos/${basename(src)}`;
if (!src) { console.error('usage: migrate-to-r2.mjs <file> [key] | --check | --rewrite'); process.exit(1); }

const e = env();
const size = statSync(src).size;
console.log(`uploading ${(size / 1048576).toFixed(1)} MB -> ${key}`);

await client(e).send(new PutObjectCommand({
  Bucket: e.R2_BUCKET_NAME,
  Key: key,
  Body: createReadStream(src),
  ContentType: 'video/mp4',
  ContentLength: size,
}));

console.log('DONE');
console.log(`${e.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`);
