# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Obsidian Digital Garden** - a static site generator that transforms Obsidian notes into a public website. It preserves Obsidian's note-taking experience while providing a polished web interface with support for links, (tags), callouts, diagrams, and more.

## Commands

### Development
- `npm start` - Start development server with live reload (downloads theme, watches SASS and Eleventy in parallel)
- `npm run dev` - Development mode with nodemon watching the notes folder
- `npm run get-theme` - Download and cache Obsidian theme from URL specified in .env
- `npm run watch:sass` - Watch SCSS files and compile to CSS
- `npm run watch:eleventy` - Run Eleventy in watch mode with dev server

### Build
- `npm run prebuild` - Clean the `dist` directory before building
`- `npm run build` - Full production build (theme + SASS + Eleventy)
- `npm run build:sass` - Compile SCSS to compressed CSS
- `npm run build:eleventy` - Build Eleventy for production (with 4GB memory limit via NODE_OPTIONS)

### Docker
- `docker build -f Dockerfile -t obsidian-digital-garden:latest .` - Build Docker image
- `docker compose up -d` - Start website on configured port (default 10034)

## Architecture

### Build Pipeline

1. **prebuild**: Clean `dist/` directory
2. **Theme Download** (`src/site/get-theme.js`): Downloads and caches Obsidian theme from `THEME` URL in `.env`
3. **SASS Compilation**: SCSS files in `src/site/styles/` compiled to CSS in `dist/styles/`
4. **Eleventy Build** (`.eleventy.js`):
   - Reads markdown notes from `src/site/notes/`
   - Parses frontmatter with gray-matter
   - Applies Nunjucks layouts from `_includes/layouts/` (index.njk, note.njk)
   - Generates favicon from favicon.svg
   - Generates RSS feed
   - Processes markdown with custom markdown-it plugins (TikZ, Mermaid, PlantUML, MathJax, etc.)
   - Applies transforms (callouts, images, tables, minification)
   - Generates HTML files in `dist/`
5. **Image Optimization**: Images resized and optimized using @11ty/eleventy-img (unless `USE_FULL_RESOLUTION_IMAGES=true`)
6. **HTML Minification**: Production builds minify HTML with html-minifier-terser

### Directory Structure

```
src/
├── helpers/              # Utility functions
│   ├── constants.js      # Constant definitions including ALL_NOTE_SETTINGS
│   ├── filetreeUtils.js  # File tree navigation utilities
│   ├── linkUtils.js      # Link parsing for [[wiki-links]], notes graph generation
│   ├── userSetup.js      # User customization hooks for plugins (markdown, Eleventy)
│   ├── userUtils.js      # User-specific utilities (computed data)
│   └── utils.js          # General utilities (slugify, headerToId, namedHeadingsFilter)
└── site/                 # Eleventy input directory
    ├── _data/            # Eleventy data files
    │   ├── meta.js       # Site metadata from .env variables
    │   ├── dynamics.js   # Dynamic data (file tree, notes graph, user components)
    │   ├── eleventyComputed.js # Computed properties
    │   └── notes.11tydata.js # Per-note data and layout selection
    ├── _includes/         # Nunjucks templates
    │   ├── components/    # Reusable UI components
    │   │   ├── calloutScript.njk, filetree.njk, graphScript.njk
    │   │   ├── linkPreview.njk, searchContainer.njk, searchScript.njk
    │   │   ├── navbar.njk, sidebar.njk, pageheader.njk
    │   │   ├── references.njk, timestamps.njk
    │   │   └── user/     # User custom components (extensibility)
    │   └── layouts/       # Page layouts (index.njk, note.njk)
    ├── notes/            # Obsidian markdown notes (content source)
    │   └── notes.11tytydata.js # Per-note settings
    ├── styles/           # SCSS stylesheets
    │   └── user/        # User custom SCSS (auto-included)
    ├── get-theme.js      # Theme downloader
    ├── robots.txt         # SEO configuration
    ├── feed.njk           # RSS feed template
    ├── search-index.njk    # Search index template
    ├── graph.njk          # Graph visualization page
    └── sitemap.njk        # Sitemap generation
dist/                     # Eleventy output directory (generated)
```

### Eleventy Data Files

- **meta.js**: Reads all `process.env` variables and formats them for templates.
  - Returns theme, bodyClasses, noteIconsSettings, timestampSettings
  - Supports `D_G_CREATED_DATE` and `D_G_UPDATED_DATE` for custom timestamp field names

- **dynamics.js**: Dynamically discovers and loads user components from `components/user/` and user styles from `styles/user/`. Organizes by namespace and slot.

- **notes.11tydata.js**: Per-note settings processing.
  - Supports all settings in `ALL_NOTE_SETTINGS` from constants.js
  - Settings precedence: note frontmatter > global env var
  - Settings include: dgHomeLink, dgPassFrontmatter, dgShowBacklinks, dgShowLocalGraph, dgShowInlineTitle, dgShowFileTree, dgEnableSearch, dgShowToc, dgLinkPreview, dgShowTags, dgNoteIcon, dgCreatedDate, dgUpdatedDate

### Markdown Processing (.eleventy.js)

The markdown pipeline uses markdown-it with these plugins:
- `markdown-it-anchor`: Heading anchors for linking (uses custom `headerToId` from utils.js)
- `markdown-it-mark`: `==highlighted==` text support
- `markdown-it-footnote`: `[^note]` syntax
- `markdown-it-mathjax3`: LaTeX equations with `$inline$` and `$$display$$`
- `markdown-it-attrs`: `{.class #id key=val}` attributes
- `markdown-it-task-checkbox`: `- [ ]` task lists
- `markdown-it-plantuml`: PlantUML diagrams in ` ```plantuml ` blocks
- **namedHeadingsFilter** (from utils.js): Custom plugin for generating valid heading IDs
- **tikzPlugin**: Custom TikZ LaTeX diagram rendering (` ```tikz `) - requires LaTeX installation (dvisvgm)
- **Custom Mermaid plugin**: ` ```mermaid ` block support
- **Custom Transclusion plugin**: ` ```transclusion ` blocks (renders nested markdown)
- **Custom ad-* blocks**: Advanced callout blocks with ` ```ad-type ` syntax
- **Custom link renderer**: External links automatically get `target="_blank"` and `external-link` class

### Eleventy Filters

- **isoDate**: Formats dates to ISO strings (with null check)
- **dateToZulu**: Formats dates to Zulu-8601 format
- **link**: Converts `[[wiki-links]]` to proper HTML anchors
- **taggify**: Converts `#tags` to clickable search links
- **searchableTags**: Extracts tags for search functionality (returns JSON array)
- **hideDataview**: Hides Dataview plugin syntax `(key:: value)` -> `value`
- **jsonify**: Converts variables to JSON strings
- **validJson**: Escapes strings for safe JSON inclusion

### Eleventy Transforms

- **dataview-js-links**: Process Dataview plugin links with `data-href` attributes
- **callout-block**: Transforms `> [!type]` blockquotes and ` ```ad-type ` blocks to callout components
- **picture**: Image optimization with responsive source sets (webp/jpeg) unless `USE_FULL_RESOLUTION_IMAGES=true`
- **table**: Wraps tables in scrollable container, adds Dataview table classes
- **htmlMinifier**: HTML minification for production (in `ELEVENTY_ENV=prod` mode)

### Eleventy Plugins

- **eleventy-plugin-gen-favicons**: Generates favicons from `favicon.svg` in output directory
- **eleventy-plugin-nesting-toc**: Generates nested table of contents from headings
- **@11ty/eleventy-plugin-rss**: Generates RSS feed

### Link Resolution (`getAnchorAttributes` in .eleventy.js)

Internal links (`[[note]]`) are resolved by:
1. Looking for `src/site/notes/{note}.md`
2. If not found, returns dead link (class `is-unresolved`, href `/404`)
3. Reading frontmatter for `permalink` override
4. Using garden entry tag `gardenEntry: true` to map to `/`
5. Extracting `noteIcon` from frontmatter
6. Supporting header anchors via `note#heading` syntax
7. Returning appropriate href, class, and data-note-icon attributes

### User Customization (`src/helpers/userSetup.js`)

This file exports two functions for extending the build without modifying core code:
- `userMarkdownSetup(md)`: Add custom markdown-it plugins
- `userEleventySetup(eleventyConfig)`: Add custom Eleventy plugins, filters, transforms

### User Components (Extensibility)

Create components in `src/site/_includes/components/user/{namespace}/{slot}/{name}.njk` to extend the site.

**Namespaces**:
- `index`: Components included on index page
- `notes`: Components included on note pages
- `common`: Components included on all pages
- `filetree`: Components injected into file tree (slots: `beforeTitle`, `afterTitle`)
- `sidebar`: Components injected into sidebar (slots: `top`, `bottom`)

**Slots** (for index/notes/common):
- `head`: Inside `<head>` tag
- `header`: After navbar, before page title
- `beforeContent`: Before note content
- `afterContent`: After note content
- `footer`: In footer area

User styles in `src/site/styles/user/*.scss` are automatically compiled and included.

### Configuration (.env)

**Site Metadata**:
- `SITE_NAME_HEADER`: Site name displayed in header
- `SITE_BASE_URL`: Base URL for canonical links and RSS
- `SITE_MAIN_LANGUAGE`: Site language code (default: "en")

**Theme**:
- `THEME`: Obsidian theme URL to download (e.g., GitHub raw URL)
- `BASE_THEME`: "dark" or "light"
- `STYLE_SETTINGS_CSS`: Custom CSS to inject
- `STYLE_SETTINGS_BODY_CLASSES`: Additional body classes

**Note Icons**:
- `NOTE_ICON_DEFAULT`: Default emoji/icon for notes
- `NOTE_ICON_TITLE`: Show note icon in title (true/false)
- `NOTE_ICON_FILETREE`: Show note icon in file tree (true/false)
- `NOTE_ICON_INTERNAL_LINKS`: Show note icon in links (true/false)
- `NOTE_ICON_BACK_LINKS`: Show note icon in backlinks (true/false)
- `dgNoteIcon`: Per-note icon setting (frontmatter)
- `dgCreatedDate`: Per-note created date field name (default: "created")
- `dgUpdatedDate`: Per-note updated date field name (default: "updated")

**Timestamps**:
- `SHOW_CREATED_TIMESTAMP`: Show note creation date (true/false)
- `SHOW_UPDATED_TIMESTAMP`: Show note update date (true/false)
- `TIMESTAMP_FORMAT`: Date format (default: "MMM dd, yyyy h:mm a")

**Images**:
- `USE_FULL_RESOLUTION_IMAGES`: Disable image optimization, serve original images (default: false)

**Feature Toggles** (dg*):
- `dgHomeLink`: Show home link in navbar
- `dgPassFrontmatter`: Pass frontmatter to templates
- `dgShowBacklinks`: Show backlinks section
- `dgShowLocalGraph`: Show local note graph
- `dgShowInlineTitle`: Show inline title
- `dgShowFileTree`: Show sidebar file tree
- `dgEnableSearch`: Enable search functionality
- `dgShowToc`: Show table of contents
- `dgLinkPreview`: Enable link hover preview
- `dgShowTags`: Show tags

### Docker Configuration

**Multi-stage build**:
- Stage 1 (build): Node.js 18-bookworm-slim, installs dependencies, runs build
- Stage 2 (production): Node.js 18-bookworm-slim with TinyTeX for TikZ support

**Production stage**:
- Installs LaTeX via TinyTeX: `dvisvgm`, `pgf`, `siunitx`, `preview`, `standalone`, `fp`
- Sets `NODE_ENV=production`
- Exposes port 8080
- Runs `node app.js` (Express server)
- **Health check**: Verifies application is running

**docker-compose.yml**:
- Image: `obsidian-digital-garden:latest`
- Ports: Host 10034 → Container 8080
- Volumes: `.env`, `src/site/notes/`, `src/site/img/`
- Command: `npm run dev` (runs nodemon with watch)

### Express Server (app.js)

- Serves static files from `dist/` directory
- Provides `/api/search` endpoint for client-side search
- All unmatched routes redirect to `/404`
- Supports `PORT` environment variable (default: 8080)

### Obsidian Integration

- Notes should be written in `src/site/notes/`
- Use Obsidian Digital Garden plugin to publish notes to this repository
- Frontmatter supports: title, permalink, tags, noteIcon, etc.
- Garden entry point: `src/site/notes/README.md` with `tags: [gardenEntry]`

### Per-Note Settings

All settings defined in `src/helpers/constants.js` (ALL_NOTE_SETTINGS) are supported in note frontmatter with `dg` prefix. Settings precedence:
1. Note frontmatter value
2. Global environment variable (if set to "true")
3. Default to false

Available per-note settings:
- dgNoteIcon: Custom note icon (overrides global NOTE_ICON_DEFAULT)
- dgCreatedDate: Custom created date field name (default: "created")
- dgUpdatedDate: Custom updated date field name (default: "updated")

### Custom Timestamp Fields

To use custom timestamp fields in frontmatter:

```yaml
---
dgCreatedDate: "publishDate"  # Use 'publishDate' field instead of 'created'
dgUpdatedDate: "lastModified"  # Use 'lastModified' field instead of 'updated'
---
```

Or set global defaults in `.env`:

```env
D_G_CREATED_DATE="date"      # Default field name for created date
D_G_UPDATED_DATE="modified"   # Default field name for updated date
```
