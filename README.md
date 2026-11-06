# igScripts

Instagram Clean: a lightweight, privacy-first userscript that makes Instagram Web distraction-free on iPhone Safari (iOS 26), using the [Userscripts](https://github.com/quoid/userscripts) extension by quoid.

## Repository

- `instagram-clean.user.js`: the single script containing everything (version 2.1).
- The third-party *Instagram Distraction Free* (Lukas Westholt) reference script was reviewed and then removed from the repo; its findings are summarized below.

## What it does

- **Reels:** hides Reels links, removes Reels posts from Home, blocks clicks to and redirects `/reels/...` to `/`. Single `/reel/<id>/` links still work.
- **Suggested content:** hides suggested posts and recommended-account modules (English and Spanish labels).
- **Ads:** hides sponsored posts using label matching (EN/ES/FR/DE/IT/PT), tolerant of zero-width characters and split-letter labels; also checks `aria-label`. Profile links are ignored so usernames like "ad" aren't hidden. Paid partnerships are kept unless `CONFIG.paidPartnerships` is `true`.
- **Loader:** a full-screen spinner covers the page until the first filtering pass finishes (feed posts found + 250 ms), with a 5 s fail-safe. Light/dark and reduced-motion aware.
- **Preserved:** DMs, Stories, profiles, search, posting, notifications are untouched.

## Install

1. Install Userscripts (quoid) on iOS and enable it for Safari.
2. Copy `instagram-clean.user.js` into your Userscripts folder (no auto-update URL is set, by design).
3. Open instagram.com in Safari.

## Security design

- `@grant none`; `@match` limited to `www.instagram.com` and `m.instagram.com`; `@noframes`.
- No network calls, storage, cookies, telemetry, `eval`, remote loading, or `innerHTML`.
- No overrides of `fetch`, XHR, `JSON.parse` or `history`. DOM-only filtering via `MutationObserver` throttled with `requestAnimationFrame`.
- No update URLs: updates are manual and reviewed.

### Reference script review (Instagram Distraction Free)

No exploitable vulnerabilities, but: it auto-updates from Greasy Fork (a later release would run in your logged-in session); it overrides `JSON.parse`, `Response.prototype.json`, `fetch` and XHR so it can see all API traffic; it filters Instagram's self-XSS console warning and blocks some telemetry/read-receipt calls. We deliberately avoid all of these.

## Limitations

- Tested only with `node --check` and a synthetic jsdom page. **Not yet verified on live Instagram or iOS Safari.**
- Label/selector matching depends on Instagram's current DOM and may break when it changes.
- DM-shared reels may open under `/reels/<id>/`, which would be redirected to `/` (unverified).
- Ads/suggestions are only filtered on the Home route; ads outside `article`/`role="article"` are missed.

## Next steps

1. Test on a real iPhone (Web Inspector from a Mac): confirm hidden elements are ads/suggestions and nothing legitimate disappears.
2. Verify DM-shared reels, Stories, search, posting and notifications still work; adjust the Reels redirect if needed.
3. Check the Reels tab hiding on the mobile bottom nav.
4. Add Spanish/English suggested-module checks against real markup; add a CONFIG toggle for the loader.
5. Re-check selectors periodically as Instagram changes its DOM.
