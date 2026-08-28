import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const categories = [
  ['Brand & positioning', ['homepage value proposition', 'viewer promise', 'creator promise', 'independence claim', 'editorial mission', 'launch-stage disclosure', 'brand voice', 'trust signals', 'audience definition', 'competitive differentiation']],
  ['Information architecture', ['primary navigation', 'footer navigation', 'view hierarchy', 'page naming', 'URL behavior', 'back navigation', 'mobile menu', 'cross-links', 'legal navigation', 'creator/admin separation']],
  ['Homepage discovery', ['hero selection', 'hero controls', 'featured synopsis', 'genre filter', 'content-row ordering', 'continue-watching row', 'new-arrivals row', 'exclusive row', 'empty catalog state', 'signed-out discovery']],
  ['Search & filtering', ['search input', 'search suggestions', 'result ranking', 'zero-results state', 'keyboard navigation', 'query clearing', 'creator matching', 'genre matching', 'description matching', 'large-catalog scaling']],
  ['Catalog cards', ['card title', 'poster image', 'creator credit', 'metadata line', 'progress indicator', 'play affordance', 'focus state', 'loading state', 'broken-image state', 'touch target']],
  ['Film detail', ['title presentation', 'creator attribution', 'synopsis', 'rights label', 'quality label', 'subtitle label', 'related titles', 'source credit', 'resume state', 'content advisory']],
  ['Video playback', ['play/pause control', 'timeline scrubbing', 'volume control', 'caption control', 'fullscreen control', 'keyboard shortcuts', 'playback errors', 'source fallback', 'resume persistence', 'mobile playback']],
  ['Auth & onboarding', ['Google sign-in', 'email sign-up', 'email login', 'email verification', 'password guidance', 'auth errors', 'auth modal focus', 'post-login return', 'sign-out flow', 'first-session orientation']],
  ['Profiles & watchlist', ['account identity', 'watch history', 'continue watching', 'completed films', 'progress reset', 'watchlist empty state', 'privacy controls', 'account deletion path', 'email preferences', 'cross-device synchronization']],
  ['Admin content operations', ['release creation', 'release editing', 'draft publishing', 'release archiving', 'metadata validation', 'rights documentation', 'poster management', 'video replacement', 'content list', 'admin permissions']],
  ['Upload & storage', ['direct video upload', 'poster upload', 'file-type checks', 'file-size checks', 'upload progress', 'upload cancellation', 'retry behavior', 'orphan cleanup', 'media URL validation', 'storage cost visibility']],
  ['Creator recruitment', ['journalist headline', 'creator eligibility', 'ownership explanation', 'application form', 'application confirmation', 'rights attestation', 'work-sample request', 'audience-size framing', 'creator FAQ', 'contact alternative']],
  ['Creator outreach', ['prospect discovery', 'business-email capture', 'prospect review', 'email composer', 'message personalization', 'send confirmation', 'unsubscribe handling', 'suppression list', 'outreach history', 'follow-up cadence']],
  ['Monetization & transparency', ['75-percent proposal', 'net-revenue definition', 'watch-time allocation', 'first-window weighting', 'earnings disclaimer', 'worked payout example', 'creator statements', 'fee disclosure', 'subscription launch notice', 'model-change notice']],
  ['Legal, trust & safety', ['terms status', 'privacy notice', 'content policy', 'copyright complaints', 'creator license', 'community reporting', 'age-sensitive content', 'defamation review', 'source protection', 'law-enforcement requests']],
  ['Accessibility', ['skip navigation', 'heading hierarchy', 'landmark structure', 'accessible names', 'dialog behavior', 'form labels', 'error announcements', 'focus visibility', 'reduced motion', 'zoom and reflow']],
  ['Mobile & responsive', ['mobile header', 'mobile navigation', 'hero viewport', 'card rails', 'film detail layout', 'player controls', 'creator form', 'admin tables', 'modal sizing', 'safe-area support']],
  ['Performance & Core Web Vitals', ['font loading', 'poster loading', 'hero media loading', 'JavaScript payload', 'Firebase startup', 'layout stability', 'interaction latency', 'service-worker caching', 'third-party scripts', 'low-bandwidth mode']],
  ['SEO & social discovery', ['page title', 'meta description', 'canonical URL', 'Open Graph image', 'Twitter card', 'structured data', 'sitemap', 'robots policy', 'film-specific URLs', 'creator-specific URLs']],
  ['Security & abuse prevention', ['Firestore authorization', 'admin identity', 'API token checks', 'upload signatures', 'file-content validation', 'outreach rate limits', 'application spam', 'security headers', 'dependency hygiene', 'incident contact']],
  ['Observability & analytics', ['authentication failures', 'playback starts', 'playback failures', 'search success', 'creator applications', 'upload failures', 'outreach delivery', 'API latency', 'storage growth', 'release health dashboard']],
  ['Email & deliverability', ['sending-domain authentication', 'creator outreach template', 'plain-text fallback', 'reply handling', 'unsubscribe path', 'bounce handling', 'complaint handling', 'send idempotency', 'email audit trail', 'reputation monitoring']],
  ['Firebase & data quality', ['user profile schema', 'content schema', 'creator application schema', 'creator lead schema', 'outreach log schema', 'server timestamps', 'document size limits', 'required fields', 'data migration', 'backup and restore']],
  ['Testing & release engineering', ['HTML validation', 'unit tests', 'auth integration tests', 'Firestore rule tests', 'API contract tests', 'player tests', 'accessibility tests', 'mobile regression tests', 'preview deployment checks', 'rollback procedure']],
  ['Community & retention', ['new-release communication', 'editorial collections', 'creator follow feature', 'viewer feedback', 'content reporting', 'release calendar', 'community guidelines', 'member referrals', 'creator Q&A', 'returning-viewer recommendations']],
];

const lenses = [
  ['Clarity', (target) => `Clarify ${target} so a first-time visitor understands its purpose, next action, and limitations without insider knowledge.`],
  ['Accessibility', (target) => `Make ${target} keyboard-, screen-reader-, zoom-, and touch-operable with an explicit name and visible focus where applicable.`],
  ['Resilience', (target) => `Add loading, empty, error, retry, and degraded-network behavior for ${target} so a failure is never silent.`],
  ['Measurement', (target) => `Define a privacy-conscious success event, owner, baseline, target, and review cadence for ${target}.`],
];

// Completion is evidence-backed in docs/release-notes-2026-08-19.md. Keep the
// stable IDs here so regenerating the register never erases delivery status.
const completedIds = new Set([
  'UD-0021',
  'UD-0041', 'UD-0042',
  'UD-0085', 'UD-0086', 'UD-0087',
  'UD-0121', 'UD-0122', 'UD-0125', 'UD-0126', 'UD-0127',
  'UD-0297', 'UD-0298', 'UD-0301', 'UD-0302', 'UD-0303', 'UD-0306', 'UD-0307',
  'UD-0377', 'UD-0378', 'UD-0379',
  'UD-0409', 'UD-0411', 'UD-0413', 'UD-0415', 'UD-0417', 'UD-0418', 'UD-0419',
  'UD-0453', 'UD-0454', 'UD-0455',
  'UD-0521',
  'UD-0561', 'UD-0565', 'UD-0569',
  'UD-0618', 'UD-0619', 'UD-0621', 'UD-0622', 'UD-0625', 'UD-0626', 'UD-0627', 'UD-0633', 'UD-0634', 'UD-0635',
  'UD-0689', 'UD-0691', 'UD-0693',
  'UD-0741', 'UD-0745', 'UD-0749',
  'UD-0761', 'UD-0763', 'UD-0769', 'UD-0771', 'UD-0773', 'UD-0775', 'UD-0789', 'UD-0791', 'UD-0793', 'UD-0795',
  'UD-0889', 'UD-0891', 'UD-0905', 'UD-0907', 'UD-0909', 'UD-0911',
  'UD-0921', 'UD-0923', 'UD-0925', 'UD-0927',
]);

if (categories.length !== 25 || categories.some(([, targets]) => targets.length !== 10)) {
  throw new Error('Backlog taxonomy must contain exactly 25 categories with 10 targets each.');
}

function priority(categoryIndex, lensIndex) {
  if ([6, 7, 9, 10, 14, 15, 19, 22, 23].includes(categoryIndex) && lensIndex < 3) return 'P1';
  if (categoryIndex <= 9 || [11, 12, 13, 16, 17, 18, 20, 21].includes(categoryIndex)) return 'P2';
  return 'P3';
}

let sequence = 0;
const sections = categories.map(([category, targets], categoryIndex) => {
  const items = targets.flatMap((target) => lenses.map(([lens, sentence], lensIndex) => {
    sequence += 1;
    const id = `UD-${String(sequence).padStart(4, '0')}`;
    return `- [${completedIds.has(id) ? 'x' : ' '}] **${id} · ${priority(categoryIndex, lensIndex)} · ${lens}:** ${sentence(target)}`;
  }));
  return `## ${String(categoryIndex + 1).padStart(2, '0')}. ${category}\n\n${items.join('\n')}`;
});

if (sequence !== 1000) throw new Error(`Expected 1,000 improvements, generated ${sequence}.`);

const output = `# UNDRGRND Docs — 1,000-improvement register

Generated from 25 product areas × 10 concrete targets × 4 delivery lenses. Every item has a stable ID and a launch priority. P1 items protect access, security, publishing, playback, or trust; P2 items materially improve the product; P3 items deepen the platform after launch.

Status at generation: **${completedIds.size} implemented · ${1000 - completedIds.size} queued**.

This is an execution register, not a claim that all 1,000 items should ship at once. Each item should be accepted only with evidence: code, copy, a test, an operating procedure, or a measured result.

## Delivery rules

- Preserve the current Vite/Firebase/Vercel architecture until a measured limitation justifies migration.
- Never publish creator-supplied work without documented rights and editorial review.
- Never send outreach to a scraped or private address; use a clearly public business contact and honor suppression immediately.
- Never label proposed monetization as a guaranteed rate or earning.
- Record implemented IDs in release notes with verification evidence.

${sections.join('\n\n')}
`;

const outputPath = resolve('docs/1000-improvements.md');
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, output, 'utf8');
console.log(`Generated ${sequence.toLocaleString('en-US')} improvements at ${outputPath}`);
