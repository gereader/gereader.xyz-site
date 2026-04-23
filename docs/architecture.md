# Architecture

Small single-author Hugo blog. Scope is deliberately modest — one static site, one theme (vendored), one deploy target.

## System overview

```
   author writes markdown
          │
          ▼
  ┌───────────────────┐        git push (main)        ┌──────────────────────┐
  │ content/posts/*   │ ─────────────────────────────▶ │ GitHub Actions       │
  │ layouts/          │                                │ (.github/workflows/  │
  │ static/           │                                │  hugo.yaml)          │
  │ hugo.toml         │                                └─────────┬────────────┘
  │ themes/ (subm.)   │                                          │ hugo --gc --minify
  └───────────────────┘                                          ▼
                                                       ┌─────────────────────┐
                                                       │ ./public (artifact) │
                                                       └─────────┬───────────┘
                                                                 │ deploy-pages@v4
                                                                 ▼
                                                       ┌────────────────────┐
                                                       │ GitHub Pages       │
                                                       │ blog.gereader.xyz  │
                                                       │ (CNAME in static/) │
                                                       └────────────────────┘
```

## Components

### Content (`content/`)
Markdown posts under `content/posts/`. Two shapes:
- Single file: `content/posts/<slug>.md` — used for simple text-only posts.
- Page bundle: `content/posts/<slug>/index.md` plus co-located assets (images, etc.). Required when the post has images.

Frontmatter is YAML (configured in `hugo.toml`). `archetypes/default.md` seeds defaults when using `hugo new`.

### Theme (`themes/hugo-blog-awesome/`)
Vendored as a git submodule. Provides baseline layouts, partials, and styles. Upstream: https://github.com/hugo-sid/hugo-blog-awesome.

### Overrides (`layouts/`)
Hugo merges `layouts/` over the theme. Current overrides:
- `layouts/shortcodes/` — five custom shortcodes (`callout`, `divider`, `twocol`, `lightbox`, `small`). See CLAUDE.md for the table.
- `layouts/_markup/render-codeblock-mermaid.html` — converts ` ```mermaid ` fences into `<div class="mermaid">` and flags `Page.Store.hasMermaid`.
- `layouts/_markup/render-link.html` — every external `http(s)` link gets `target="_blank" rel="noopener noreferrer"`.
- `layouts/partials/custom-head.html` — theme-defined extension point. Loads `css/custom.css` on every page; conditionally loads mermaid (when page frontmatter `renderMermaid: true`) and AnchorJS (when `renderAnchorLinks: true`).

### Static assets (`static/`)
Copied verbatim to the site root:
- `CNAME` — custom domain for Pages (`blog.gereader.xyz`).
- `css/custom.css` — width overrides, callout/twocol styling, dark-mode rules keyed on `html.dark`.
- `googlecdf24545872a1f8c.html` — Google Search Console verification.

### Config (`hugo.toml`)
- `baseURL`: `https://blog.gereader.xyz` (overridden by CI to the Pages URL).
- Theme binding, author profile, social icons, menu (Home, Posts), Disqus shortname, ToC levels.
- `markup.goldmark.renderer.unsafe = true` — raw HTML passes through. Safe here because the author controls all content.

### CI/CD (`.github/workflows/hugo.yaml`)
Two jobs on push to `main`:
1. **build**: checkout with `submodules: recursive`, install Hugo extended (`peaceiris/actions-hugo@v3`), `hugo --gc --minify --baseURL ${pages_base_url}/`, upload `./public` as the Pages artifact.
2. **deploy**: `actions/deploy-pages@v4` against the `github-pages` environment.

Concurrency group `"pages"` with `cancel-in-progress: false` — in-flight production deploys finish rather than getting cut off.

## Data flow (a post's journey)

1. Author drafts markdown in `content/posts/<slug>/index.md` with YAML frontmatter (`title`, `description`, `date`, `toc`, optional `renderMermaid`).
2. Shortcodes (`{{< callout >}}`, `{{< lightbox >}}`, etc.) are resolved by Hugo against `layouts/shortcodes/`.
3. Goldmark render hooks fire for code fences (mermaid) and links (external new-tab).
4. Theme's base templates render the page, pulling in `custom-head.html` — which gates optional CDN scripts on frontmatter flags.
5. `hugo --minify` emits HTML/CSS/JS into `./public/`.
6. Actions uploads `./public` as the Pages artifact; `deploy-pages` serves it from the Pages CDN under the custom domain.

## Key abstractions

- **Opt-in-per-page features**: heavy or non-universal assets (mermaid, anchor links) are gated by frontmatter flags rather than loaded globally. Add new opt-ins the same way — frontmatter key, conditional in `custom-head.html`.
- **Override via `layouts/`, never theme edits**: any theme change goes into a matching path under `layouts/` so the submodule stays pristine and updatable.
- **Shortcodes as the HTML escape hatch**: custom presentation (callouts, two-column blocks, lightbox) lives in shortcodes so posts stay markdown-first.

## External dependencies

- **Hugo extended** (latest, per CI) — build tool.
- **Theme `hugo-blog-awesome`** — git submodule.
- **GitHub Pages** — hosting.
- **Disqus** — comments (shortname `blog-gereader-xyz`).
- **CDN scripts** (loaded only when opted in per page):
  - `https://cdn.jsdelivr.net/npm/mermaid` (ESM import)
  - `https://cdn.jsdelivr.net/npm/anchor-js/anchor.min.js`

## Scaling notes

If the site grows (multi-section content, taxonomies beyond default tags/categories, custom list layouts), add documentation here. For now the architecture is intentionally small — a single `posts` section plus the default taxonomy views from the theme.
