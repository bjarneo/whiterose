# White Rose Design System

A strict black-and-white design system for a software engineering consultancy.

This document describes how the current website is designed and implemented. The source of truth for implementation is `site/styles.css`, where all core decisions are expressed as CSS custom properties in `:root`.

## Intent

White Rose should feel clear, technical, quiet, and deliberate.

The design should not feel like a generic agency site. It should feel like an engineering practice: direct, structured, and easy to trust.

## Core Rules

- Black and white only
- No gradients
- No decorative color accents
- No soft marketing visuals
- No rounded pill-heavy UI
- Use borders, spacing, weight, and hierarchy for emphasis
- Keep copy plain and factual
- Prefer rows, rails, and editorial structure over cards

## Implementation Model

The website is implemented as a static site in `site/`.

| File | Purpose |
| --- | --- |
| `site/index.html` | Semantic page structure, metadata, content |
| `site/styles.css` | Design system tokens, layout, components, responsive behavior |
| `site/script.js` | Header scroll state, mobile menu, reveal behavior |
| `site/assets/` | Logo, favicon, Apple icon, social preview image |

The CSS is organized around token categories:

- Color tokens
- Typography tokens
- Layout tokens
- Spacing tokens
- Component tokens
- Responsive overrides

When changing the site, update or reuse tokens before adding one-off values.

## Color Tokens

The palette is monochrome by design.

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#000000` | Page background |
| `--color-text` | `#ffffff` | Primary text, active UI, logo contrast |
| `--color-muted` | `#9a9a9a` | Paragraphs, secondary text |
| `--color-faint` | `#5f5f5f` | Low-priority numbers and metadata |
| `--color-line` | `rgba(255, 255, 255, 0.18)` | Default borders |
| `--color-line-strong` | `rgba(255, 255, 255, 0.52)` | Hover and emphasis borders |
| `--color-surface` | `rgba(255, 255, 255, 0.045)` | Subtle panel fill |
| `--color-header` | `rgba(0, 0, 0, 0.9)` | Mobile/scrolled header background |

Color rules:

- Do not add accent colors
- Do not add gradients
- Do not use shadows as decoration
- Use stronger borders instead of color for emphasis
- Use `--color-muted` for supporting copy, not disabled text

## Typography Tokens

The system uses hard condensed display fonts for headings and monospaced fonts for body copy.

| Token | Use |
| --- | --- |
| `--font-display` | Headings, service titles, strong editorial text |
| `--font-body` | Body copy, labels, navigation, metadata |
| `--font-size-h1` | Hero headline |
| `--font-size-h2` | Section headings |
| `--font-size-h3` | Service and principle titles |
| `--font-size-lead` | Hero paragraph |
| `--font-size-body` | Service descriptions and contact links |
| `--font-size-small` | Rail metadata values |
| `--font-size-label` | Labels, eyebrow text, row numbers |
| `--font-size-nav` | Navigation links |

Tracking and line-height tokens:

| Token | Use |
| --- | --- |
| `--line-height-tight` | Hero heading |
| `--line-height-heading` | Section headings |
| `--line-height-body` | Body copy |
| `--tracking-label` | Labels and metadata |
| `--tracking-nav` | Navigation and brand text |
| `--tracking-heading-lg` | Hero heading |
| `--tracking-heading-md` | Section headings |
| `--tracking-heading-sm` | Small headings |

Typography rules:

- Headings are uppercase
- Headings should be short
- Paragraphs should be plain and factual
- Avoid decorative serif typography
- Avoid friendly rounded typefaces
- Avoid long marketing claims

## Layout Tokens

The desktop layout is a two-column editorial system: an identity rail on the left and content on the right.

| Token | Use |
| --- | --- |
| `--container` | Main desktop page width |
| `--container-mobile` | Mobile page width |
| `--rail-width` | Desktop identity rail width |
| `--content-gap` | Gap between rail and content |
| `--label-column` | Left label column inside content sections |
| `--section-gap` | Gap between section label and section body |
| `--section-y` | Desktop vertical section padding |
| `--section-y-mobile` | Mobile vertical section padding |
| `--page-top` | Top offset below header |
| `--header-top` | Header top offset |

Layout rules:

- Desktop keeps the rail visible
- Tablet collapses to a single content column
- Mobile hides the identity rail entirely
- Content is divided by horizontal borders
- Services are rows, not cards
- Mobile spacing is tighter than desktop spacing

## Spacing Tokens

Spacing uses named scale tokens rather than arbitrary values.

| Token | Value |
| --- | --- |
| `--space-1` | `8px` |
| `--space-2` | `10px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `18px` |
| `--space-6` | `20px` |
| `--space-7` | `22px` |
| `--space-8` | `24px` |
| `--space-9` | `26px` |
| `--space-10` | `28px` |
| `--space-11` | `34px` |
| `--space-12` | `40px` |
| `--space-13` | `48px` |
| `--space-14` | `54px` |
| `--space-15` | `56px` |
| `--space-16` | `70px` |
| `--space-17` | `76px` |

Spacing rules:

- Use existing spacing tokens first
- Do not add new spacing tokens unless a repeated need appears
- Keep mobile sections compact
- Keep desktop sections calm and open

## Component Tokens

| Token | Use |
| --- | --- |
| `--button-height` | Base button height |
| `--button-x` | Button horizontal padding |
| `--mark-sm` | Header logo size |
| `--mark-lg` | Rail logo size |
| `--border` | Standard component border |
| `--border-strong` | Emphasis border |
| `--motion-fast` | Small UI transitions |
| `--motion-reveal` | Reveal transition timing |

Component rules:

- Components should be rectangular and line-based
- Avoid soft radius values
- Avoid decorative shadows
- Prefer one strong detail over many small effects

## Components

### Header

Desktop behavior:

- Fixed at the top
- Brand on the left
- Navigation on the right
- Transparent by default
- Gains black background and border on scroll

Mobile behavior:

- Brand is centered
- Hamburger menu is top right
- Navigation is hidden until opened
- Menu closes when a nav link is clicked
- Menu closes on `Escape`

Implementation:

- Markup: `.site-header`, `.brand`, `.menu-toggle`, `.nav`
- State class: `.is-scrolled`
- Mobile state class: `.is-menu-open`
- JS: `site/script.js`

### Identity Rail

The identity rail is a desktop structural element.

Desktop:

- Shows the large logo
- Shows short metadata: practice and focus
- Uses a right border to separate the rail from content

Mobile:

- Hidden completely
- Brand remains available in the header

Implementation:

- Markup: `.identity-rail`, `.rail-mark`
- CSS hides `.identity-rail` at the mobile breakpoint

### Hero

The hero states the offer without decoration.

Rules:

- One short kicker
- One direct heading
- One plain paragraph
- One primary action
- No domain link as visible content

Implementation:

- Markup: `.hero`, `.kicker`, `.lead`, `.hero-actions`, `.button`

### Statement

The statement section explains the working model.

Rules:

- Keep the heading short
- Keep the paragraph wide enough to avoid awkward wrapping
- Use the label column on desktop
- Collapse to one column on mobile

Implementation detail:

- `.statement p:not(.section-label)` is explicitly placed in grid column 2 on desktop
- It resets to a normal single column on tablet/mobile

### Service Rows

Services are numbered rows.

Current services:

- Technical direction
- Architecture review
- Development
- DevOps

Rules:

- Keep row titles short
- Keep descriptions one sentence
- Use borders rather than cards
- Collapse to one column on mobile

Implementation:

- Markup: `.service-list`, `.service`

### Principle Panels

Principles are compact panels.

Current principles:

- Readable
- Durable
- Exact

Rules:

- Keep the title one word if possible
- Keep descriptions short
- Reduce padding on mobile

Implementation:

- Markup: `.principle-grid`, `.principle`

### Contact

Contact is minimal.

Rules:

- Show email only as visible contact detail
- Use `mailto:` for the email link
- Do not show the domain as a visible link
- Keep metadata domain references for Open Graph, Twitter, and GitHub Pages

Implementation:

- Markup: `.contact`, `.contact-link`

## Logo Assets

Logo assets live in `site/assets/`.

| Asset | Use |
| --- | --- |
| `logo.png` | Source square web logo |
| `logo-512.png` | Large interface/logo asset |
| `logo-256.png` | Medium logo asset |
| `logo-192.png` | Header logo and Android-style icon size |
| `apple-touch-icon.png` | Apple touch icon |
| `favicon-32.png` | 32px favicon |
| `favicon-16.png` | 16px favicon |
| `favicon.ico` | Browser fallback favicon |
| `og-image.png` | Social preview image |

Logo rules:

- Use PNG assets, not SVG
- Keep the logo square
- Preserve equal padding on all sides
- Use the logo only in black and white
- Do not stretch, skew, rotate, recolor, or crop tighter
- Do not place the logo on color backgrounds

See `pdf.md` for document and PDF logo usage.

## Metadata

Metadata is implemented in `site/index.html`.

Required metadata:

- `<title>`
- `meta[name="description"]`
- `theme-color`
- Open Graph title, description, URL, image, image size, image alt
- Twitter card title, description, image, image alt
- Favicons and Apple touch icon

Metadata rules:

- Keep `https://whiterose.no` in metadata
- Do not show `whiterose.no` as a visible page link unless intentionally reintroduced
- Keep social image at `1200x630`

## Motion

Motion is minimal and functional.

Allowed:

- Header scroll state
- Mobile menu open/close
- Subtle reveal on scroll
- Border color changes on hover

Avoid:

- Parallax
- Decorative animation
- Animated gradients
- Large hover movement
- Motion required to understand content

Implementation:

- `site/script.js` toggles `.is-scrolled`
- `site/script.js` toggles `.is-menu-open`
- `IntersectionObserver` reveals `.reveal` elements
- `prefers-reduced-motion` disables meaningful transitions

## Responsive Behavior

Breakpoints:

| Breakpoint | Behavior |
| --- | --- |
| `max-width: 980px` | Collapse rail/content layout to one column |
| `max-width: 640px` | Mobile header, hamburger nav, hidden rail, compact sections |
| `max-width: 380px` | Smaller heading and nav scale |

Mobile rules:

- Hide the identity rail
- Center the brand in the header
- Place hamburger top right
- Remove the viewport border wrapper
- Use tighter vertical section spacing
- Make service rows single-column
- Make buttons full-width
- Allow contact links to wrap safely

## Content Voice

White Rose is positioned as a software engineering consultancy that also does hands-on development and DevOps.

Use:

- Plain technical language
- Short sentences
- Specific service names
- Clear descriptions of work
- Words like consultancy, development, DevOps, architecture, review, delivery

Avoid:

- Generic agency language
- Startup hype
- Luxury claims
- Big promises
- Floral or romantic brand copy
- Bragging about seniority unless context requires it

## Extension Rules

When adding a new section or component:

- Start with semantic HTML
- Reuse existing tokens
- Use borders for separation
- Keep it monochrome
- Keep copy short
- Check mobile at `640px` and below
- Verify no gradients or SVG logo references are introduced
- Push both `main` and `gh-pages` when deploying site changes

Before shipping:

- Check `site/index.html` for visible domain links if not intended
- Check `site/styles.css` for gradients or one-off color additions
- Check `site/assets/` for correct PNG logo usage
- Check GitHub Pages build status after deployment
