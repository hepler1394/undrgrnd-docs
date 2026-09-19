# undrgrnd-docs — state as of 2026-09-19

Documentary streaming. Single-file app (`index.html`), Vite build,
Vercel with GitHub auto-deploy on push to `master`.

## Where things stand

- 31 films. 12 stream from Bunny Stream, 7 self-host on Vercel Blob, the
  other 12 stream from archive.org.
- **The Sick Mind of EDP445 (Mike Clum, 2026) is live and featured** — hero
  slot 1, Underground Exclusives front card, `comingSoon` removed. Its master
  came from Cory's Downloads with the moov atom at the end (the Nanook failure
  mode); the faststart remux lives at `D:\Dev\_h264` with the others.
- Every poster is a frame from its own film, served from `public/assets`.
  No third-party image hosts anywhere.

## Media hosting: Bunny Stream and Vercel Blob (2026-09-19)

Three hosts, on purpose:

- **Bunny Stream library 757324**, 12 films, adaptive HLS at
  `https://vz-c0995941-cab.b-cdn.net/{GUID}/playlist.m3u8`. This is where
  new films should go. The account is prepaid and funded — **a zero balance
  403s the whole library, which is exactly how the August trial died**, so
  keep a low-balance alert on it.
- **Vercel Blob** `undrgrnd-media` (`store_5VUcHcm1Ey9QVTDq`, public, iad1),
  7 films, under
  `https://5vuchcm1ey9qvtdq.public.blob.vercel-storage.com/videos/`. Serves
  byte ranges (206), faststart verified at upload time.
- **archive.org**, 12 films, hotlinked and therefore the least durable.

**Every film that moved keeps its previous URL as `fallbackVideo`.** If a
host dies the player swaps to that copy once per film per visit rather than
showing the error panel. This is the specific defence against a repeat of
2026-08-25, when the Bunny trial lapsed and all 6 zone films 403'd at once.
Do not strip those fields to tidy the catalog.

Two Bunny settings that matter:

- **"Block direct url file access" is ON.** Any request without a `Referer`
  gets a 403. Browsers always send one, so playback is fine, but anything
  server-side (`check-links.mjs`) must set one explicitly or every Bunny
  film reads as dead.
- Token auth is off and the allowed-domains list is empty, so localhost and
  Vercel previews work with no extra configuration.

**hls.js is loaded lazily** from jsDelivr, and only when the browser has no
native HLS — Safari and iOS take the native path. It attaches through MSE,
which sets the `<video>` element's own `src` to a `blob:` URL; `teardownHls`
must clear that, because a `<video src>` beats its `<source>` children and a
stale blob silently breaks every mp4 loaded afterwards, the `fallbackVideo`
path included.

**Orphaned and safe to delete:** Bunny **Storage** zone `undrgrnd-docs`
(6 films, 2.52 GB, replicated, pull zone `undrgrnddocs.b-cdn.net`). Left
from the August trial; nothing in the catalog references it and every file
in it also exists on Vercel Blob and at `D:\Dev\_h264`. Pending Cory's go.

**Cloudflare hosts nothing.** DNS only, Free plan, zero subscriptions —
no R2 (never enabled), no Stream (not subscribed), no Pages, no Workers.
Audited 2026-09-19; stop re-investigating this.

To publish a new master:

    npx vercel blob put <file.mp4> --pathname "videos/<slug>.mp4" \
      --content-type video/mp4 --access public --multipart --rw-token <token>

The token is `BLOB_READ_WRITE_TOKEN` in `.env.local` (repopulate with
`vercel env pull`). Check moov placement first; remux with
`ffmpeg -c copy -movflags +faststart` if it sits after mdat.

Never-built infrastructure, for the record: `media.undrgrnddocs.com` never
had a DNS record and Cloudflare R2 was never provisioned — no R2 keys exist
on the Vercel project. `api/r2-upload-url.js` (the creator upload flow) still
assumes R2 and is therefore unconfigured; if creator uploads ever ship, point
that endpoint at Blob instead.

The player-error panel still shows "Watch at the source" and the
YouTube-embed auto-fallback still guards every self-hosted film. Embed
verdicts cannot be trusted from headless Chrome or the preview pane (both
return YT error 150 for everything); only a normal browser tells the truth.

- **YT Grabber 403, diagnosed deeper (2026-08-12):** yt-dlp's n-challenge
  solver was missing; it is now enabled (`--js-runtimes node
  --remote-components ejs:github` — the EJS lib is cached). Challenges
  solve, and the googlevideo media servers STILL 403 every client,
  confirming an IP-level block, not tooling. `--cookies-from-browser` is a
  DEAD END on this machine for both Chrome and Edge: tested with Chrome
  fully closed (0 processes) and it fails on App-Bound Encryption
  (Chrome 127+, yt-dlp issue 10927) — do not retry. Working paths:
  a one-time cookies.txt export via the "Get cookies.txt LOCALLY"
  extension (then `yt-dlp --cookies <file>`), or fetching from a
  different network.

- H.264 masters are at `D:\Dev\_h264` (3GB with the EDP445 film). If the
  Blob store is ever lost, re-uploading is minutes rather than a re-transcode.

## Things worth knowing before changing anything

- **Deploys happen on push.** The git integration is live and production
  tracks `master`. It is not CLI-only, despite what the deployment list
  looks like: the Username column shows the project owner, not the trigger.
- **archive.org items disappear.** Seven died in a fortnight, two more died
  mid-session. The nightly check (09:17 UTC) opens a `catalog-health` issue
  when one confirms dead and closes it on recovery.
- **A healthy HTTP status does not mean a film plays.** Nanook returned 200
  and would not play: its moov atom sat after mdat. The checker tests for it.
- **archive.org storage nodes drop out.** The checker reports those as
  warnings, never broken, so a live film is never swapped out over a blip.
- **Cards are activated by delegation** on `data-doc-id`, not inline
  handlers. Search results bind `onmousedown`, so a synthetic `click` test
  on them reports a false failure.
- **Card posters must never be hidden with `display: none`.** The shimmer
  state once did that while the imgs were `loading="lazy"`; a hidden img has
  no layout box, so Chrome deprioritized or skipped the fetch and cards sat
  as blank shimmer indefinitely (Cory saw it on prod, 2026-08-27). The fix:
  shimmer hides with `opacity: 0` and card posters load eagerly — the whole
  poster set is ~480KB, cheaper than one second of hero video.
- **Playback is auth-gated** (`checkPlatformAuthForPlayback` in
  `src/platform.js`): openDetail requires a signed-in Firebase user, except
  entries flagged `freeToWatch: true` (currently only The Sick Mind of
  EDP445, per Cory 2026-08-27). For player tests on gated films, stub the
  check to `() => true` in the page rather than minting test accounts.
- **Chart.js loads on demand**, only when the creator view opens.
- **Headless screenshots freeze entry animations at frame 0.** The payout
  chart looks like a collapsed spike in a headless capture; its computed
  point geometry spans the full axis. Check `getDatasetMeta(0).data`
  coordinates before calling a chart broken. (Headless Chrome with
  puppeteer-core is how the site was finally seen, after the Browser pane
  refused to composite — that path works and lives in the session notes.)

## Open, none urgent

- Creator dashboard numbers are labelled sample data but still invented.
  Real figures need uploads and subscriptions wired up.
- The upload flow is a front-end simulation; it alerts as much on completion.
- YouTube 403s downloads from this IP. yt-dlp is current (2026.07.04) and
  cookies and five player clients were all refused, so YT Grabber cannot
  fetch new videos until that clears.
- ~~Nothing in the visual pass has been seen~~ Resolved 2026-08-12: the site
  was rendered and reviewed via headless Chrome (screenshots sent to Cory).
  The review surfaced and fixed three real defects: the keyboard handler
  referenced an undefined `detailView` so every keypress threw and player
  shortcuts never worked; five poster jpgs (Montel, Deposition, Town Meeting,
  Predicting Everything, Running for POTUS) were byte-identical copies of one
  frame, now each a real frame from its own film; More Like This was filled
  once at render time so films recommended themselves, now per-film,
  same-genre first. Cory has not yet passed judgment on the look itself —
  the Upload page's glitch-styled headline diverging from the didone system
  is the one taste question worth asking him.
