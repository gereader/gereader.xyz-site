# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

Hugo static site for `blog.gereader.xyz` — Gene's personal tech blog. Deployed to GitHub Pages via GitHub Actions on every push to `main`. Theme is `hugo-blog-awesome`, vendored as a git submodule under `themes/`.

## Build, run, deploy

- Local preview: `hugo server` (or `hugo server -D` to include drafts). Default at http://localhost:1313.
- Production build: `hugo --gc --minify` (what CI runs).
- Deploy: push to `main`. `.github/workflows/hugo.yaml` checks out with submodules, runs Hugo extended, uploads `./public` as a Pages artifact, deploys. No manual deploy step.
- Submodules: after a fresh clone, run `git submodule update --init --recursive` or the theme will be missing.

There are no tests — content site.

## Hugo MCP

A project-scoped MCP server is configured in `.mcp.json` pointing at `/Users/gene/Developer/personal/hugo-mcp` (run via `uv`). It exposes tools for Hugo install checks, content creation, preview server, build, etc. Auto-loads when Claude Code runs from this directory.

## Directory map

- `content/posts/` — posts. Either single `.md` files or page bundles (`<slug>/index.md` + co-located assets like `.webp` images). Use page bundles when a post has images.
- `archetypes/default.md` — frontmatter template `hugo new` uses. Current defaults: `toc`, `tocOpen`, `renderMermaid: false`, `renderAnchorLinks: true`.
- `layouts/shortcodes/` — custom shortcodes (see below).
- `layouts/_markup/` — goldmark render hooks. `render-codeblock-mermaid.html` (turns ` ```mermaid ` fences into a div and flags the page), `render-link.html` (external http(s) links get `target="_blank" rel="noopener noreferrer"`).
- `layouts/partials/custom-head.html` — injects `css/custom.css`; conditionally loads mermaid (CDN, ESM) when `renderMermaid: true`, and AnchorJS when `renderAnchorLinks: true`.
- `static/` — served at site root. `CNAME` pins `blog.gereader.xyz`. `css/custom.css` holds width overrides, callout/twocol styling, and dark-mode rules (keyed on `html.dark`).
- `assets/images/` — author avatar (`MyFace.jpeg`) pipelined by the theme.
- `themes/hugo-blog-awesome/` — submodule. Don't edit; override via `layouts/` instead.
- `hugo.toml` — site config. YAML frontmatter, goldmark `unsafe: true` (raw HTML allowed), Disqus `blog-gereader-xyz`, ToC levels 2–4.
- `public/` and `.hugo_build.lock` — **build output / local lock**. See "Repo hygiene" below.
- `.github/workflows/hugo.yaml` — CI/deploy.

## Custom shortcodes

| Shortcode | Purpose | Notes |
|---|---|---|
| `callout` | Titled highlight box | `{{< callout title="..." >}}...{{< /callout >}}` — inner is markdownified |
| `divider` | Short horizontal rule | No args |
| `twocol` | 2fr:3fr grid; left inner, right via attr | `{{< twocol right="right markdown" >}}left markdown{{< /twocol >}}` |
| `lightbox` | Click-to-zoom image with pan/zoom | Args: `src`, `alt`, `caption`. **Gotcha:** injects the same `<script>` every use — works but duplicates on image-heavy posts |
| `small` | Wraps inner in `<small>` | Inner is raw, not markdownified |

## Conventions

- Post filenames: kebab-case (`set-up-hugo-blog`).
- Frontmatter: YAML (`format = "yaml"` in `hugo.toml`). Include `title`, `description`, `date`. `toc: true` / `tocOpen: true` are the norm.
- Opt-in features per page:
  - `renderMermaid: true` to load mermaid on that page (don't set globally — it pulls a CDN script).
  - `renderAnchorLinks: true` for heading anchors (default on).
- Images in post bundles: `.webp` is the established pattern.
- External links render with `target="_blank"` automatically — no need to add it in markdown.

## Gotchas and tech debt

- **Mermaid theme is hardcoded `'default'`** (light) in `custom-head.html`; a comment notes the `MutationObserver` intentionally ignores theme toggles.
- **`lightbox` duplicates its script** per invocation. Fine for now; if a post has many images and the page feels heavy, move the script to `custom-head.html` behind a page flag.
- **Theme is a submodule**, not Hugo Modules — `git submodule update --init` after clone; `git submodule update --remote themes/hugo-blog-awesome` to update.
- **`goldmark.unsafe = true`** — raw HTML in markdown will render. Source is trusted (single-author blog) so this is fine, but be aware when pasting external content.

## Repo hygiene

- `public/` is committed but is pure build output. GitHub Pages serves the artifact produced by the Actions workflow, **not** the committed `public/` — so the directory is dead weight and a merge-conflict magnet. Safe to add `public/` and `.hugo_build.lock` to `.gitignore` and `git rm -r --cached` them. Not removing proactively; flag for user.
- `.gitignore` currently only contains `.DS_Store`.

## Style (per user global preferences)

- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`). Terse.
- No `Co-Authored-By: Claude` trailers.
- No narrating comments in layouts/shortcodes; prefer self-documenting names.
- For multi-file changes, draft a plan before editing.
- Never push to remote without explicit request.
