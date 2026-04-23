# Site Refresh Spec

**Branch:** `refresh`
**Goal:** Make `blog.gereader.xyz` a credibility-signalling portfolio — minimal, fast, accessible, works great on phone and desktop, Catppuccin-themed.
**Non-goals:** New blog posts; rewriting existing post content; replacing Hugo; switching themes.

---

## Context

- Site is Hugo + `hugo-blog-awesome` (submodule) deployed to GitHub Pages via Actions on push to `main`.
- Primary audience: recruiters and hiring managers arriving from the author's LinkedIn / resume.
- Author gates: minimal visual style, mobile-first, accessible, privacy-friendly.

## Principles

1. **Minimal, not underdone.** Small surface area, strong typography, generous whitespace.
2. **Mobile-first.** Every milestone QA'd at 375px before desktop.
3. **Accessible by default.** Semantic HTML, visible focus, WCAG AA contrast, alt text everywhere.
4. **Zero tracking / low runtime cost.** No third-party fonts, no cookies, no heavy analytics.
5. **Override the theme, don't fork it.** Everything goes under `layouts/` / `assets/` / `static/`. Theme submodule stays pristine.

---

## Decisions

### Identity

- **Tagline:** "Notes from a platform engineer." *(interim — author may revise during M2 brainstorm.)*
- **Avatar:** keep `assets/images/MyFace.jpeg`.
- **Resume:** no PDF. LinkedIn button in nav & footer.
- **Featured projects (3):** `autocon4`, `intro-to-clab`, `rss-news-aggregator`.
- **Content license:** **CC BY 4.0** — permissive, requires attribution, no share-alike constraint. Good default for technical writing you want cited but don't want to police derivatives. Shown in footer as "Content © {year} Gene Reader · CC BY 4.0".

### Visual system

- **Palette:** Catppuccin **Latte** (light) + **Mocha** (dark). Exposed as CSS custom properties under `:root` and `html.dark`.
- **Fonts:** Inter (body/UI, variable) + JetBrains Mono (code). Self-hosted via Hugo asset pipeline; preload the two most-used weights.
- **Type scale:** modular, base 16/18px, prose measure ~72ch.
- **Width model:** prose column ~720px, with breakout utility for code blocks, images, mermaid, and shortcodes (`lightbox`, `twocol`).
- **Motion:** subtle; respect `prefers-reduced-motion`.

### Layout

- **Homepage:** hero (name, tagline, avatar, social) → **Featured Projects** (3 cards) → **Recent Posts** (5 most recent, excluding featured) → small about paragraph.
- **Top nav:** Home · Projects · Posts · Tags · RSS.
- **Post page:** title, date, last-updated, reading time, tag chips, floating TOC (desktop ≥1024px), inline TOC fallback (mobile).
- **Footer:** © year · content license · social icons (GitHub, LinkedIn) · "Built with Hugo" link.

### Shortcodes

- **`callout`** — variants `info | tip | warn | danger | note`. Accent color from Catppuccin. Backwards compatible with existing `title`-only usage.
- **`lightbox`** — wraps **GLightbox** (self-hosted). Preserves existing API (`src`, `alt`, `caption`). Single global script/CSS.
- **`twocol`** — retained, restyled with tokens.
- **`divider`** — retained, restyled.
- **`small`** — retained as-is.
- **`img`** *(new)* — emits `<picture>` with AVIF/WebP/fallback and responsive `srcset` via Hugo image processing.

### Code blocks

- Chroma with Catppuccin Latte (light) + Mocha (dark) styles.
- Line numbers on.
- Copy-to-clipboard button, self-hosted vanilla JS (~1KB).

### Diagrams

- **Mermaid** — self-hosted, initialized with Catppuccin-matched theme vars, re-initialized on theme toggle. Opt-in per page stays (`renderMermaid: true`).

### SEO / sharing

- Per-post OG image generated at build (Catppuccin card: title, site, avatar). Fallback site-wide image.
- `head-seo.html` partial: OG, Twitter Card, canonical, JSON-LD BlogPosting on posts.
- `sitemap.xml` + `robots.txt` verified.

### Engagement

- **Comments:** removed entirely. Disqus deleted from config; no giscus. Rationale: low expected comment volume, removes third-party JS, portfolio-appropriate.
- **Analytics:** **Cloudflare Web Analytics** (no cookies, no PII, free). Aligns with existing Cloudflare registrar setup. Single async beacon.

### Content hygiene

- Normalize tags/categories across all existing posts.
- Group `part-1-cicd-container-registry` + `part-2-cicd-deploy-aws-ecs` as a series (frontmatter + UI affordance).
- Delete `content/posts/hello-world.md`.
- Add `lastmod` frontmatter convention to all posts (backfill current dates).
- Alt-text sweep on every image.

### Accessibility

- Contrast audit — all text meets WCAG AA; large text AAA where feasible; Catppuccin code-block combos specifically verified.
- Visible focus rings on all interactive elements.
- Skip-to-content link.
- `prefers-reduced-motion` honored.

### Performance targets

- Lighthouse (mobile, slow 4G, mid-tier phone emulation): Performance ≥ 95, Accessibility ≥ 100, Best Practices ≥ 95, SEO ≥ 100.
- LCP < 2.0s, CLS < 0.05, no blocking JS on post pages.

---

## Milestones

Each milestone is an independent, mergeable commit series. Author QAs before moving to the next.

### M1 — Foundation (design tokens)
**Scope**
- Replace width-override CSS with a proper token system (`static/css/tokens.css` or inlined in theme's CSS via asset pipeline).
- Add Catppuccin Latte/Mocha variables.
- Self-host Inter + JBM; preload two weights.
- Apply base typography, spacing, radius globally.
- Prose width 72ch + `.breakout` utility.

**Deliverables**
- Tokens file + updated `custom.css`.
- Preload hints in `custom-head.html`.
- No layout/structure changes — existing pages look like themselves with new palette and type.

**Accept when**
- Both themes render all existing posts with no broken styling.
- Theme toggle keeps mermaid/callouts/twocol legible in both modes.

### M2 — Homepage, nav, footer
**Scope**
- Override theme's home layout with hero + featured + recent-posts composition.
- Top nav additions (Projects, Tags, RSS).
- Footer partial with © + license + socials + last-updated.
- Author picks tagline.

**Deliverables**
- `layouts/index.html` (or equivalent override).
- `layouts/partials/footer.html` override.
- Nav config in `hugo.toml`.
- Mobile + desktop QA screenshots.

**Open questions in this milestone**
- Which 3 posts are featured?
- Tagline final pick.
- Content license choice.

### M3 — Shortcodes refresh
**Scope**
- `callout` variants with Catppuccin accents.
- Replace `lightbox` internals with GLightbox (same shortcode API).
- Chroma Catppuccin theme + line numbers + copy button.
- Token-driven restyle of `divider`, `twocol`.

**Deliverables**
- Updated shortcodes under `layouts/shortcodes/`.
- GLightbox assets self-hosted via `assets/`.
- Copy-button JS under `assets/js/`, loaded on pages with code blocks only.
- Chroma style config in `hugo.toml`.

**Accept when**
- All existing posts render correctly; no console errors on image-heavy pages.
- Copy button works on mobile (tap), keyboard-accessible.

### M4 — Diagrams + images
**Scope**
- Mermaid init → theme-aware, re-init on toggle. Self-host the script.
- New `img` shortcode emitting `<picture>` with AVIF/WebP/fallback + `srcset`.
- Alt-text audit across all posts with proposed diffs.

**Deliverables**
- `layouts/partials/custom-head.html` updated for mermaid.
- `layouts/shortcodes/img.html`.
- PR/diff for alt-text fixes.

**Accept when**
- Mermaid diagrams re-theme instantly on toggle, no flash/flicker.
- Images lazy-load, serve AVIF where supported.
- No image in any post lacks a meaningful `alt`.

### M5 — SEO + sharing
**Scope**
- Per-post OG image pipeline (Hugo template → image via resource processing).
- `head-seo.html` partial: OG, Twitter Card, canonical, JSON-LD.
- Verify sitemap + robots.

**Deliverables**
- `layouts/partials/head-seo.html`.
- OG card template + font assets reused.
- Manual share-preview check (LinkedIn, Twitter/X debugger).

**Accept when**
- Every post URL renders a unique OG preview in social debuggers.
- Lighthouse SEO = 100.

### M6 — Analytics + comments cleanup
**Scope**
- Remove Disqus config + any partial references.
- Add Cloudflare Web Analytics beacon (async, deferred).
- Verify no cookies set, no PII transmitted.

**Deliverables**
- `hugo.toml` cleanup.
- Analytics snippet in a partial, gated on production.

**Accept when**
- No Disqus network calls from any page.
- CF Analytics dashboard shows traffic within 24h.

### M7 — Content hygiene
**Scope**
- Normalize tags/categories (propose taxonomy; author approves).
- Series metadata + UI on part-1/part-2 CICD posts.
- Delete `hello-world.md`.
- Backfill `lastmod` frontmatter.

**Deliverables**
- Frontmatter PR across all posts.
- Proposed taxonomy doc (short list + mapping).
- Series partial used on in-series posts.

**Accept when**
- Tag pages are meaningful and non-redundant.
- Series navigation works on the two CICD posts.

### M8 — Accessibility + QA
**Scope**
- Contrast sweep (axe + manual).
- Keyboard nav pass: tab order, focus rings, skip link, trap-free lightbox.
- Mobile QA: 375 / 414 / 768.
- Desktop QA: 1280 / 1440 / 1920.
- Lighthouse pass per template type (home, post, tag, 404).

**Deliverables**
- Fixes for any failure.
- Short QA log appended to this spec.

**Accept when**
- All perf/a11y targets met.
- No axe violations at default severity.

---

## Out of scope (post-refresh)

- Rewriting AWS jobtracker post (or replacing with hello-world). Content decision for a later pass.
- New posts.
- Custom theme / themeless setup.
- giscus comments.
- Analytics dashboarding beyond Cloudflare defaults.

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Theme updates upstream conflict with overrides | All overrides in `layouts/`; diff on submodule bump |
| Mermaid theme re-init flicker | Hide `.mermaid` until initialized; transition opacity |
| Self-hosted fonts + per-post OG inflate build size | Subset fonts; cap OG images at optimized PNG (~50KB) |
| Cloudflare Web Analytics insufficient | Easy swap for Plausible / Umami later; beacon is isolated |
| Catppuccin contrast on code blocks | M1 acceptance gate + M8 formal audit |
| Large image-heavy posts slow after GLightbox swap | Lazy-load + single shared GLightbox instance |

---

## Open questions

All blockers resolved. Remaining soft question: final tagline. Interim "Notes from a platform engineer." ships with M2; author may revise any time.

---

## Workflow

- Work on branch `refresh`.
- One milestone per commit series; open questions resolved before the milestone they block.
- Author reviews after each milestone before the next starts.
- No push to remote without explicit request.
- Merge to `main` is the deploy; author triggers.
