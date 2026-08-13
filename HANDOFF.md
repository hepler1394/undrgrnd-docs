# undrgrnd-docs — state as of 2026-08-12

Public-domain documentary streaming. Single-file app (`index.html`), Vite build,
Vercel with GitHub auto-deploy on push to `master`.

## Where things stand

- 24 films, all verified playing. `npm run check-links` reports 24 ok, 0 broken.
- 6 films self-hosted on Bunny CDN; the other 18 stream from archive.org.
- Every poster is a frame from its own film, served from `public/assets`.
  No third-party image hosts anywhere.

## The thing with a deadline

**The Bunny trial ends 2026-08-25.** When it lapses those 6 films stop
serving and the Political category breaks. Storage is about 5 cents a month;
it is the funding step that matters, not the cost.

Softened but not solved (2026-08-12): the player-error panel now shows
"Watch at the source" linking each film's original upload, so a lapsed zone
degrades to a redirect rather than a dead end. Additionally, a dead
self-hosted stream now auto-falls-back to its YouTube original as an embed
(one attempt per film per visit); films whose owners disallow embedding
land on the panel as before. How many of the six actually embed is
unknowable from automation: BOTH headless Chrome and the preview pane
return YT error 150 for every video — including "Me at the zoo", which
embeds everywhere — so never trust an embed verdict from either. Only a
normal browser tells the truth.

- **YT Grabber 403, diagnosed deeper (2026-08-12):** yt-dlp's n-challenge
  solver was missing; it is now enabled (`--js-runtimes node
  --remote-components ejs:github` — the EJS lib is cached). Challenges
  solve, and the googlevideo media servers STILL 403 every client,
  confirming an IP-level block, not tooling. Next viable step is
  `--cookies-from-browser chrome`, which fails while Chrome is running
  (locked cookie DB) — needs Chrome closed for one run, i.e. Cory's call.

- Storage zone `undrgrnd-docs` (id 1734660, New York), pull zone
  `undrgrnddocs.b-cdn.net`.
- H.264 masters are at `D:\Dev\_h264` (2.4GB). If the zone is ever lost,
  re-uploading is minutes rather than a re-transcode.

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
