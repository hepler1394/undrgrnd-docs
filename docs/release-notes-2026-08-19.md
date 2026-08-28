# Launch improvement batch — 2026-08-19

This release implements 71 items from the 1,000-improvement register. Evidence is grouped below; item status is preserved by `scripts/generate-improvement-backlog.mjs`.

## Access and navigation

- **UD-0041, UD-0042:** semantic home/profile/menu controls, truthful hash targets, explicit accessible names and visible focus.
- **UD-0085–UD-0087:** named hero controls, pressed states, safe poster fallback, and no automatic motion for reduced-motion or data-saver users.
- **UD-0121, UD-0122, UD-0125–UD-0127:** labeled combobox, bounded results, empty copy, Arrow Up/Down/Escape behavior and DOM-based result rendering.

## Authentication and forms

- **UD-0297, UD-0298:** visible password requirements tied to the password field.
- **UD-0301–UD-0303:** friendly Firebase error mapping, assertive error announcement and disabled in-flight auth actions.
- **UD-0306, UD-0307, UD-0618, UD-0619:** dialog focus entry/return, focus trap, Escape/scrim cancellation and body scroll locking.
- **UD-0621, UD-0622, UD-0625–UD-0627:** complete input types, labels, limits, live upload status and alert semantics.
- **UD-0633–UD-0635:** reduced-motion and data-saver behavior stops hero autoplay and rotation.

## Creator and administrator operations

- **UD-0377–UD-0379:** bounded metadata fields, numeric release-year constraints, HTTPS-only hosted media and safe admin rendering.
- **UD-0409, UD-0411, UD-0413, UD-0415:** matching client/server MIME checks with separate 10 GB video and 25 MB poster limits.
- **UD-0417–UD-0419:** live upload progress and clear connection/failure messages.
- **UD-0453–UD-0455:** bounded creator application fields, work URL validation, minimum pitch context and rights confirmation.

## Trust, policy and discovery

- **UD-0021, UD-0521, UD-0561, UD-0565, UD-0569:** accurate free pre-launch terms, proposed-not-guaranteed creator economics, privacy contact and editorial review language.
- **UD-0741, UD-0745, UD-0749:** Organization structured data, sitemap and explicit robots policy.

## Security, data and delivery

- **UD-0761, UD-0763, UD-0889, UD-0891, UD-0905, UD-0907, UD-0909, UD-0911:** owner-scoped Firestore access plus key, type, length, ownership and server-timestamp rules for profiles and applications.
- **UD-0769, UD-0771:** bounded RS256 Firebase bearer tokens, verified administrator allowlist and consistent no-store API errors.
- **UD-0773, UD-0775:** short-lived admin-only R2 signatures bound to MIME type and byte length.
- **UD-0789, UD-0791:** response hardening headers, explicit API method handling and service-worker cache controls.
- **UD-0793, UD-0795:** Vite 8 upgrade and a zero-vulnerability production/development audit.
- **UD-0689, UD-0691, UD-0693:** metadata-only hero loading, offline shell resilience and dynamically split Firebase startup.
- **UD-0921, UD-0923:** repeatable HTML and launch-artifact validation.
- **UD-0925, UD-0927:** Node tests for API method, cache and request-body guards.

## Verification evidence

- `npm run verify` passes HTML validation, the 1,000-ID register check, four API guard tests and the Vite production build.
- `npm audit` reports zero vulnerabilities.
- `git diff --check` reports no whitespace errors.
