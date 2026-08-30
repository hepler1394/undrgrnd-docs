// One-off: put Mike Clum's Boogie2988 documentary on Vercel Blob, matching how
// the other self-hosted films in the catalog are served.
//
// The token is read from .env.local at point of use and never printed.

import { put } from '@vercel/blob';
import { createReadStream, readFileSync, statSync } from 'node:fs';

const SRC = 'C:/Users/Cory/Downloads/The-Dark-Sad-Life-of-Boogie2988-Official_Media_QgDx0RIWY8_001_1080p.mp4';
const DEST = 'videos/mike-clum-the-dark-sad-life-of-boogie2988.mp4';

function tokenFromEnvLocal() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*BLOB_READ_WRITE_TOKEN\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('BLOB_READ_WRITE_TOKEN not found in .env.local');
}

const size = statSync(SRC).size;
console.log(`uploading ${(size / 1048576).toFixed(1)} MB -> ${DEST}`);

const res = await put(DEST, createReadStream(SRC), {
  access: 'public',
  token: tokenFromEnvLocal(),
  contentType: 'video/mp4',
  multipart: true,          // required at this size
  addRandomSuffix: false,   // keep the URL predictable like the other films
  allowOverwrite: true,
});

console.log('DONE');
console.log(res.url);
