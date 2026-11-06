# igScripts
Instagram Clean: a lightweight, privacy-first userscript that makes Instagram Web distraction-free on iPhone Safari (iOS 26), using the [Userscripts](https://github.com/quoid/userscripts) extension by quoid.

It keeps Instagram's useful social features while removing addictive content and unnecessary recommendations.

## Repository structure

- `instagram-clean.user.js`: our custom script (the primary file to develop).
- `reference-instagram-distraction-free.js`: *Instagram Distraction Free* by Lukas Westholt, downloaded from Greasy Fork. **Reference material only** for studying detection and filtering techniques. Do not modify it, do not blindly copy it, and treat it as untrusted until reviewed.

## Features

1. **Remove Reels**
   - Hide the Reels navigation tab.
   - Remove Reels from the Home feed.
   - Block navigation to the infinite Reels feed.
   - Preserve regular photo and carousel posts.
   - Ideally allow individual Reels shared through DMs without enabling infinite scrolling.
2. **Remove suggested content**
   - Hide suggested posts and recommended accounts.
   - Preserve content from followed accounts.
   - Support Instagram in English and Spanish.
3. **Remove advertisements**
   - Hide sponsored posts and ads in the Home feed.
   - Avoid hiding legitimate content.
4. **Preserve Instagram functionality**
   - DMs, Stories, profiles, search, posting, and notifications keep working.
   - The interface stays responsive and visually clean.

## Technical constraints

- Target: iPhone Safari, iOS 26, with the Userscripts extension by quoid.
- Vanilla JavaScript only: no React, TypeScript build pipeline, backend, or external dependencies.
- Compact, clearly auditable functions.
- Use `MutationObserver` for the dynamically rendered feed; avoid unnecessary DOM scanning and heavy observers.
- Handle Instagram's single-page navigation and lazily loaded posts.
- Valid userscript metadata header with `@match` entries for Instagram only.
- Prefer DOM-based filtering. API-level filtering requires an explained tradeoff and explicit approval first.

## Security requirements (highest priority)

The script runs inside an authenticated Instagram session, so:

- Never collect, log, store, or transmit passwords, cookies, session tokens, or authentication headers.
- Never send Instagram data to external servers. No analytics, telemetry, tracking, or remote dependencies.
- No `eval`, remote script loading, or obfuscated code.
- Do not override `fetch`, `XMLHttpRequest`, `JSON.parse`, or other global APIs unless absolutely necessary and explicitly justified.
- Do not disable Instagram's security warnings or diagnostics.
- Keep permissions limited to Instagram domains.
- No automatic updates from unreviewed sources.
- Treat third-party userscript code as untrusted until reviewed.

## Reference script security review

Review of `reference-instagram-distraction-free.js` found no exploitable vulnerabilities, but note:

- `@grant none`, no `@require`/`@resource`, `@match` limited to `*.instagram.com`; no `eval`, `innerHTML`, cookie access, or outbound network calls of its own.
- `@updateURL`/`@downloadURL` point to Greasy Fork: a later upstream release would run in your logged-in session. Do not enable auto-update for it.
- It overrides `JSON.parse`, `Response.prototype.json`, `fetch` and XHR, so it can see all Instagram API traffic. We avoid this approach (DOM-based filtering only).
- It filters the console self-XSS warning and blocks some Instagram telemetry/read-receipt calls, which conflicts with our rules.

## Development guidelines

1. Explain the issue being addressed.
2. Make small, focused changes.
3. Preserve existing functionality.
4. Avoid unnecessary complexity.
5. Check for security and performance regressions.
6. Document limitations and assumptions.
7. Do not claim a selector or feature works on iOS unless it has been tested or verified.

## Success criteria

With the userscript enabled in Safari:

- The Home feed shows ordinary posts from followed accounts.
- Sponsored posts and recommendations are hidden.
- Reels and infinite Reels navigation are blocked.
- Stories and DMs remain functional.
- No account data leaves the device because of our code.
- Works without subscriptions, a backend, or periodic reinstallation.

## Notes and limitations

- A full-screen loader covers the page until the first filtering pass completes (feed posts found plus a 250 ms settle), with a 5 s fail-safe so the page is never blocked.
- Runs at `document-start`; no `history`/`fetch`/XHR overrides. Reels routes are caught via click interception, `popstate` and the DOM observer.
- `/reels/...` is redirected to `/`; single `/reel/<id>/` links are allowed. Unverified: Instagram may open DM-shared reels under `/reels/<id>/`, which would then be redirected.
- Label/selector matching (English/Spanish) depends on Instagram's current DOM and may break when it changes. Not yet tested on iOS Safari.

## Status

Next step: audit both scripts (architecture and security implications), then implement the first set of safe DOM-based filters in the custom script.
