# Comments

Giscus is enabled through the existing user note-footer hook (`001-comment.njk`). It uses `ansatzX/ansatz.work`, the Announcements category, strict pathname matching, Simplified Chinese, lazy loading, and the preferred system color scheme. Set `comments: false` in a note frontmatter to omit it.

Repository ID: `R_kgDOOWabPQ`; category ID: `DIC_kwDOOWabPc4C5wnH`. These public identifiers were read from the official https://giscus.app/zh-CN configurator on 2026-09-22; it confirmed all repository prerequisites were satisfied. No new GitHub app permissions were granted.

The disabled predecessor pointed at `dangehub/qlog` and used title matching. This change does not migrate discussions from that repository. Keep published page paths stable to preserve associations. Giscus creates a discussion on the first comment or reaction; previewing a page alone does not create one. Visitors sign in with GitHub to comment.

`GISCUS_ENABLED=true|false` is the single global switch; the remaining `GISCUS_*` variables in `.env` configure the embed at build time. Both layouts and the sidebar use the same computed configuration. `comments: false` (or legacy per-note `dgShowComments: false`) opts an individual page out; a page cannot override the global off switch. Rebuild after changing configuration. Docker embeds these build-time settings into the static files; runtime environment changes do not re-render pages. Public deployment and a real signed-in comment submission are separate acceptance checks; automated verification must not post test comments to the production repository.
