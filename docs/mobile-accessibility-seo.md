# Mobile reading, keyboard controls and discovery

Implemented locally on 2026-09-22. No deployment or search-engine submission was performed.

## Reading and navigation

Below 1400px, the site uses a single column with a visible menu and search button.
The mobile menu expands in normal document flow; Escape closes it and restores
focus to its launcher. Desktop sidebar collapse preferences do not hide the
mobile navigation. Folder controls are native buttons with expanded state.
The previous folder template also placed children outside their Alpine state
scope; the scope now includes both the button and its children.

Headings and padding adapt to narrow screens. Long formulas retain their size
inside horizontal scroll areas. Overflowing formulas, code blocks and tables
become keyboard-focusable regions. Skip-to-content and visible focus styles are
provided, with reduced-motion support.

Search uses a native modal dialog: background is inert, Tab/Shift+Tab cycle within
the dialog, Escape and a visible Close button dismiss it and restore focus.
Search results are actual links; arrow navigation and Enter from the input remain.
The global graph uses a modal dialog with Escape and a focusable Close button.
Local graph fullscreen can also be exited using Escape.

## Page metadata

- Per-page title and description, canonical URL, Open Graph and Twitter metadata.
- Default share image: `src/site/img/social-card.png` (1200 × 630).
- Override `title`, `description`, `socialImage`, `socialImageAlt` in frontmatter.
- `noindex: true` (or a robots directive containing noindex) sets robots metadata
  and excludes the note from sitemap. This is not privacy/access control.
- `sitemap: false` excludes only sitemap output; it does not prevent indexing.
- `updated`, `dg-updated` or an explicitly supplied `date` provides sitemap
  lastmod. File mtime/build time is not substituted for a real modification date.
- `SITE_BASE_URL` defines the public origin; this site's default is
  `https://ansatz.work`. Canonical URLs deliberately do not use the local preview
  origin. A preview intended to be public should be protected or explicitly
  configured noindex before exposing it.
- Sitemap contains note pages only. `robots.txt` advertises the absolute sitemap.
- Missing pages retain HTTP 404 and now include noindex metadata.

## Acceptance boundary

Local output and browser controls are testable without publishing. Social
platform crawlers cannot fetch localhost, and search engines make their own
indexing decisions. After a separately authorized deployment, verify production
HTTP responses/assets, inspect a shared URL on target platforms, then use the
owner's Search Console property to submit/inspect the sitemap and URLs.

This is targeted keyboard and responsive verification, not a complete WCAG
conformance audit or physical-device/screen-reader certification. Graph canvas
nodes retain pointer interaction; notes remain reachable via the keyboard file
navigation and search.

References: [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
[Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
