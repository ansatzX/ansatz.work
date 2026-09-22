# Garden plugins in ansatz.work

The website implements the Garden plugin interface from
[oleeskild/digitalgarden](https://github.com/oleeskild/digitalgarden/tree/80a33ffa6cb198ecf733e5944b4a60510970e3b0),
pinned at `80a33ffa6cb198ecf733e5944b4a60510970e3b0` (2026-09-22).
This is the website extension API, not an Obsidian community-plugin runtime.

## Choosing plugins

Place trusted plugin directories at `src/plugins/<id>/`, including their
`garden-plugin.json`. Configure enablement, order and settings in
`src/plugins/plugins.json`, then restart the dev server or run a clean build.
For example:

```json
{"plugins":{"dg-search":{"enabled":true},"dg-link-preview":{"enabled":true},"dg-math":{"enabled":false}}}
```

Search and link previews are supplied by the bundled upstream-derived plugins.
Disabling them removes their UI and, for search, its generated JSON index.
The old component files are retained for reference but are not included by the
layouts; there is only one active implementation of each feature.

**Math remains owned by this site's custom markdown-it MathJax and TikZ pipeline.**
The upstream `dg-math` plugin is deliberately not installed and is explicitly
disabled. Keep it disabled when importing plugin sets. Enabling an additional
math renderer is not a supported configuration: replace the existing renderer
intentionally before choosing a different one. Timestamps and graph remain
built-in as well; do not enable duplicate implementations of those features.

## Supported interface

- All 21 upstream slots across note/index layouts, navigation, sidebars and
  floating actions; existing `components/user` insertion hooks are retained.
- The exclusive `navigation` region, with the existing navigation as fallback.
- `setupMarkdown` and `setupEleventy` hooks, including virtual output templates.
- Manifest styles (CSS and compiled SCSS), scripts, assets, per-note settings,
  plugin settings with environment/default resolution, order and disable flags.
- Generated includes go to `src/site/_includes/plugins/` (ignored by Git).
- Upstream broken-manifest and hook warning/skip behavior is retained; this
  isn't a sandbox for untrusted code or a guarantee against arbitrary plugin bugs.

The loader is the pinned upstream source with a `.cjs` extension. The project is
ESM, while `src/plugins/package.json` declares a CommonJS boundary for upstream
hooks. A plugin may declare its own package format; the upstream synchronous
hook-loading contract still applies. Plugin dependencies must be installed in
the website dependency tree; copying a directory does not install dependencies.

## Local adaptations

- Search uses the site's math-safe `searchText` and `searchTags` filters and
  serializes fields as JSON. It does not index MathJax CSS or TikZ source.
- Search revalidates its index even with a fixed build timestamp, escapes text
  for highlighting, skips formula/style nodes, and scopes previews to `.content`.
- Search buttons are native buttons. Link previews also respond to keyboard
  focus, and tolerate missing anchor targets.
- Site styles and UI strings integrate the upstream search preview with this
  website's layout. User CSS remains after plugin styles.
- Upstream MIT attribution is preserved in `src/plugins/UPSTREAM-LICENSE`.

## Validation

```sh
npm test -- --runInBand
node --test tests/rendering-regression.test.mjs
node --test tests/garden-plugin-integration.test.mjs
SOURCE_DATE_EPOCH=1700000000 TIKZ_STRICT=1 npm run build
```

The integration test makes three real Eleventy builds in a temporary copy:
all slots/settings/hooks/assets enabled; navigation replacement with search and
preview disabled; fixture disabled. It verifies emitted output, removal of
outputs after clean builds, and continued MathJax rendering. It leaves the
working tree and running preview unchanged.

These checks establish this pinned interface and the selected plugins. They do
not certify every third-party plugin, future upstream version, or the complete
Obsidian publishing/content-format pipeline. Review upstream template-update
PRs rather than merging replacements over this customized site automatically.
