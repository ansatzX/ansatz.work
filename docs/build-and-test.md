# Build and acceptance

Use Node 22 or newer and `npm ci`. Only Express and its transitive dependencies are required to serve the built site; all generators and test tools are devDependencies.

- `npm test`: unit plus Node integration/regression tests.
- `npm run test:unit`: fast Jest checks.
- `npm run test:integration`: real isolated Eleventy builds, rendering/SEO/comments and compiler controls.
- `npm run test:e2e`: HTTP acceptance through Playwright request fixtures; builds fresh files then launches a dedicated server on 127.0.0.1:18081. It does not claim full browser UI coverage.
- `npm run test:all`: all of the above.
- `npm audit`: current registry advisory check.

`npm run build` sets ELEVENTY_ENV=prod and always fails on TikZ errors, even if TIKZ_STRICT=0. Development builds may warn instead. TIKZ_CONCURRENCY defaults to 2, capped at 4. TIKZ_TIMEOUT_MS defaults to 30000 per external process, capped at 120000. LaTeX shell escape is disabled and failed artifacts are removed.

Docker builds with Debian TeX packages and ships only dist, app.js, package.json and production node_modules; it runs as node. It does not rebuild at startup. SOURCE_DATE_EPOCH can be supplied as a build argument. Base image and apt repositories are still rolling inputs, so this is not a bit-for-bit reproducible build.

Dependency note: Eleventy Image is upgraded to v7. The legacy favicon plugin uses a scoped sharp override to ^0.35.4 to avoid its vulnerable ^0.33 dependency; favicon and apple/manifest icon outputs are checked by HTTP acceptance. Recheck this override when upstream updates.
