#!/usr/bin/env node
// Catalog health check for undrgrnd-docs.
//
// Every source in this catalog is a public-domain film hosted by someone else,
// which means entries rot without warning: seven of nineteen broke within a
// fortnight. An HTTP 200 is not enough to prove a film plays, so this checks
// the three things that actually broke in practice:
//
//   1. Item removed      - archive.org keeps serving redirects for pulled items,
//                          and throttles with 503s that look identical to death.
//                          Only the metadata API separates the two reliably.
//   2. moov atom at end  - the file downloads fine and still refuses to play,
//                          because the browser cannot start without the index.
//   3. Wrong codec       - archive.org's "MPEG4" derivatives are sometimes
//                          MPEG-4 Part 2, which no browser will decode.
//
// Exits non-zero if anything is broken, so it can gate a deploy.
//
//   node scripts/check-links.mjs             check every entry
//   node scripts/check-links.mjs --suggest   also search for replacements
//   node scripts/check-links.mjs --file <p>  check a different catalog file

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'undrgrnd-docs-link-check';
const SUGGEST = process.argv.includes('--suggest');
const fileArg = process.argv.indexOf('--file');
const CATALOG_FILE = fileArg !== -1 ? process.argv[fileArg + 1] : join(ROOT, 'index.html');

const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, opts = {}, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        ...opts,
        headers: { 'User-Agent': UA, ...(opts.headers || {}) },
        signal: AbortSignal.timeout(90_000),
      });
      // Any 5xx from archive.org is its problem, not a verdict on the file:
      // 503 is throttling, 500 comes back from an overloaded storage node.
      // Back off and retry rather than reporting a live item as dead.
      if (res.status >= 500 && i < tries - 1) { await sleep(4000 * (i + 1)); continue; }
      return res;
    } catch (err) {
      last = err;
      if (i < tries - 1) await sleep(3000 * (i + 1));
    }
  }
  throw last ?? new Error('request failed');
}

// ── Parse the catalog out of the single-file app ────────────────────────────
async function readCatalog() {
  const html = await readFile(CATALOG_FILE, 'utf8');
  const entries = [];
  const re = /id:\s*(\d+),\s*title:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?video:\s*'([^']+)'[\s\S]*?runtime:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    entries.push({
      id: Number(m[1]),
      title: m[2].replace(/\\'/g, "'"),
      url: m[3],
      runtime: m[4],
    });
  }
  if (!entries.length) throw new Error('no catalog entries found in index.html');
  return entries;
}

const archiveIdOf = (url) => {
  const m = url.match(/archive\.org\/download\/([^/]+)\//);
  return m ? decodeURIComponent(m[1]) : null;
};

// ── Check 1: does the archive.org item still exist? ─────────────────────────
// A removed item answers HTTP 200 with {"error": ...} or an empty file list,
// while a throttled request fails at the transport or returns 5xx. Conflating
// the two is the single easiest way to condemn a healthy film, so an
// inconclusive answer is never reported as death — it is retried, then
// surfaced as a warning.
async function checkItemAlive(identifier) {
  const attempt = async () => {
    let res;
    try {
      res = await fetchWithRetry(`https://archive.org/metadata/${encodeURIComponent(identifier)}`);
    } catch (err) {
      return { verdict: 'unknown', reason: err?.cause?.message || err.message };
    }
    if (res.status !== 200) return { verdict: 'unknown', reason: `metadata HTTP ${res.status}` };

    const body = await res.json().catch(() => null);
    if (body === null) return { verdict: 'unknown', reason: 'metadata was not valid JSON' };
    if (body.error || !Array.isArray(body.files) || !body.files.length) {
      return { verdict: 'dead' };
    }
    return { verdict: 'alive', files: body.files };
  };

  let out = await attempt();
  // Confirm a death sentence before handing it down.
  if (out.verdict === 'dead') {
    await sleep(5000);
    out = await attempt();
  }
  return out;
}

// A network-level failure here is nearly always one archive.org storage node
// being unreachable, not a problem with the film. Surfacing it as "broken"
// would invite replacing a perfectly good entry, so it is reported separately.
class NodeUnreachable extends Error {}

async function readRange(url, start, end) {
  let res;
  try {
    res = await fetchWithRetry(url, { headers: { Range: `bytes=${start}-${end}` } });
  } catch (err) {
    const detail = err?.cause?.message || err.message;
    throw new NodeUnreachable(detail);
  }
  if (res.status !== 200 && res.status !== 206) return { status: res.status, buf: null };
  return { status: res.status, buf: Buffer.from(await res.arrayBuffer()) };
}

// ── Checks 2 and 3: stream health, moov placement, real codec ───────────────
// Walks the atom chain with 16-byte reads rather than pulling megabytes. Only
// the moov header region is ever downloaded in bulk, and only to read the
// codec fourcc. Large files over flaky archive.org nodes made the naive
// "fetch the first 1.5MB" approach time out and report healthy files as dead.
async function checkStream(url) {
  const order = [];
  let off = 0;
  let moovAt = null;
  let moovSize = 0;
  let status = 0;

  for (let i = 0; i < 12; i++) {
    const { status: s, buf } = await readRange(url, off, off + 15);
    status = s;
    if (!buf || buf.length < 8) break;

    let size = buf.readUInt32BE(0);
    const type = buf.toString('latin1', 4, 8);
    let headerLen = 8;
    if (size === 1) {
      if (buf.length < 16) break;
      size = Number(buf.readBigUInt64BE(8));
      headerLen = 16;
    }
    order.push(type);
    if (type === 'moov') { moovAt = off + headerLen; moovSize = size - headerLen; }
    if (type === 'moov' || type === 'mdat' || size <= 0) break;
    off += size;
  }

  if (!order.length) return { ok: false, status };

  const moov = order.indexOf('moov');
  const mdat = order.indexOf('mdat');
  // If mdat comes first the browser must pull the entire file before it can
  // start, which presents as a video that simply never plays.
  const faststart = moov !== -1 && (mdat === -1 || moov < mdat);

  // Read enough of moov to find the video sample description fourcc.
  let codec = null;
  if (moovAt !== null && moovSize > 0) {
    const { buf } = await readRange(url, moovAt, moovAt + Math.min(moovSize, 400_000) - 1);
    if (buf) {
      const head = buf.toString('latin1');
      if (head.includes('avc1') || head.includes('avc3')) codec = 'h264';
      else if (head.includes('hvc1') || head.includes('hev1')) codec = 'hevc';
      else if (head.includes('av01')) codec = 'av1';
      else if (head.includes('mp4v')) codec = 'mpeg4-part2';
    }
  }

  return { ok: true, status, faststart, codec, atoms: order.slice(0, 5) };
}

// Codecs a browser will actually decode in an MP4 container. HEVC and AV1 are
// deliberately excluded: Chrome's support for them is conditional, and this
// catalog has no reason to depend on it.
const BROWSER_SAFE = new Set(['h264']);

function fileInfo(files, url) {
  const name = decodeURIComponent(url.split('/').pop());
  return files.find((x) => x.name === name) || null;
}

// ── Suggest replacements for a dead entry ──────────────────────────────────
async function suggest(title) {
  const q = `mediatype:movies AND title:"${title.replace(/"/g, '')}"`;
  const url = 'https://archive.org/advancedsearch.php?'
    + new URLSearchParams({ q, 'fl[]': 'identifier', rows: '8', output: 'json' });
  try {
    const res = await fetchWithRetry(url);
    const body = await res.json();
    const ids = (body.response?.docs || []).map((d) => d.identifier);
    const out = [];
    for (const id of ids.slice(0, 6)) {
      const info = await checkItemAlive(id).catch(() => ({ alive: false }));
      if (!info.alive) continue;
      const mp4s = info.files.filter((f) => /\.mp4$/i.test(f.name));
      for (const f of mp4s.slice(0, 1)) {
        out.push(`${id}/${f.name}  ${f.format}  ${Math.round(Number(f.size || 0) / 1e6)}MB  ${Math.round(Number(f.length || 0) / 60)}min`);
      }
      await sleep(1500);
    }
    return out;
  } catch {
    return [];
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
const catalog = await readCatalog();
console.log(`${c.bold}Checking ${catalog.length} catalog entries${c.reset}\n`);

const broken = [];
const warnings = [];

for (const doc of catalog) {
  const label = `${String(doc.id).padStart(2)} ${doc.title}`.padEnd(34).slice(0, 34);
  process.stdout.write(`${label} `);

  const identifier = archiveIdOf(doc.url);
  const problems = [];
  const notes = [];

  try {
    let files = null;
    if (identifier) {
      const item = await checkItemAlive(identifier);
      if (item.verdict === 'dead') {
        problems.push(`archive item "${identifier}" no longer exists`);
      } else if (item.verdict === 'unknown') {
        notes.push(`could not confirm item status - ${item.reason}`);
      } else {
        files = item.files;
      }
    }

    if (!problems.length) {
      let stream;
      try {
        stream = await checkStream(doc.url);
      } catch (err) {
        if (err instanceof NodeUnreachable) {
          // The item exists (metadata confirmed above); its storage node is
          // just down or unroutable from here. Transient, not a dead link.
          notes.push(`storage node unreachable - ${err.message}`);
          stream = null;
        } else {
          throw err;
        }
      }

      if (stream && !stream.ok && stream.status >= 500) {
        // Survived the retries but still 5xx. That is archive.org struggling,
        // not a missing file, and swapping the entry out would be wrong.
        notes.push(`archive.org returned HTTP ${stream.status} - transient, re-check later`);
      } else if (stream && !stream.ok) {
        problems.push(`HTTP ${stream.status}`);
      } else if (stream) {
        if (!stream.faststart) {
          problems.push(`moov atom after mdat - will not stream (atoms: ${stream.atoms.join(',')})`);
        }
        if (stream.codec && !BROWSER_SAFE.has(stream.codec)) {
          problems.push(`video codec is ${stream.codec} - browsers will not decode it`);
        } else if (!stream.codec) {
          notes.push('could not determine video codec from moov');
        }
        if (files) {
          const info = fileInfo(files, doc.url);
          if (info?.length) {
            const mins = Math.round(Number(info.length) / 60);
            const claimed = doc.runtime.match(/(?:(\d+)h\s*)?(\d+)m/);
            if (claimed) {
              const want = (Number(claimed[1] || 0) * 60) + Number(claimed[2]);
              if (Math.abs(want - mins) > 3) {
                notes.push(`runtime says ${doc.runtime} but file is ${mins}m`);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    problems.push(`check failed: ${err.message}`);
  }

  if (problems.length) {
    console.log(`${c.red}BROKEN${c.reset}`);
    for (const p of problems) console.log(`   ${c.red}${p}${c.reset}`);
    broken.push({ doc, problems });
  } else if (notes.length) {
    console.log(`${c.yellow}WARN${c.reset}`);
    for (const n of notes) console.log(`   ${c.yellow}${n}${c.reset}`);
    warnings.push({ doc, notes });
  } else {
    console.log(`${c.green}ok${c.reset}`);
  }

  await sleep(1200); // stay well under archive.org's throttle
}

console.log();
if (SUGGEST && broken.length) {
  console.log(`${c.bold}Replacement candidates${c.reset}\n`);
  for (const { doc } of broken) {
    console.log(`${c.cyan}${doc.title}${c.reset}`);
    const picks = await suggest(doc.title);
    if (!picks.length) console.log(`   ${c.dim}nothing found - search archive.org by hand${c.reset}`);
    for (const p of picks) console.log(`   https://archive.org/download/${p}`);
    console.log();
  }
}

const summary = `${catalog.length - broken.length - warnings.length} ok, ${warnings.length} warn, ${broken.length} broken`;
if (broken.length) {
  console.log(`${c.red}${c.bold}${summary}${c.reset}`);
  if (!SUGGEST) console.log(`${c.dim}re-run with --suggest to search for replacements${c.reset}`);
  process.exit(1);
}
console.log(`${c.green}${c.bold}${summary}${c.reset}`);
