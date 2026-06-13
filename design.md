# White Rose Design System

A strict black-and-white design system for a software engineering consultancy.

## Principles

- Black and white only
- No gradients
- No decorative color accents
- Hard typography, compact spacing, and sharp lines
- Editorial layout over marketing-card layout
- Consultancy-first content, clear and simple
- Every visual element should feel deliberate, restrained, and technical

## Color

The palette is monochrome by design.

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#000000` | Page background |
| `--color-text` | `#ffffff` | Primary text and active UI |
| `--color-muted` | `#9a9a9a` | Paragraphs and secondary text |
| `--color-faint` | `#5f5f5f` | Low-priority numbers and metadata |
| `--color-line` | `rgba(255, 255, 255, 0.18)` | Default borders |
| `--color-line-strong` | `rgba(255, 255, 255, 0.52)` | Hover and emphasis borders |
| `--color-surface` | `rgba(255, 255, 255, 0.045)` | Subtle panels |

Do not add color accents. If emphasis is needed, use contrast, weight, spacing, or border strength.

## Typography

The system uses hard, condensed display fonts for headings and monospaced fonts for body copy.

| Token | Use |
| --- | --- |
| `--font-display` | Headings and service titles |
| `--font-body` | Body copy, labels, navigation, metadata |
| `--font-size-h1` | Hero headline |
| `--font-size-h2` | Section headings |
| `--font-size-h3` | Service and principle titles |
| `--font-size-label` | Labels, eyebrow text, numbers |

Heading rules:

- Uppercase headings only
- Tight letter spacing
- Short headline copy
- Avoid soft, friendly, or rounded type choices

## Layout

The site uses a two-column editorial layout.

| Token | Use |
| --- | --- |
| `--container` | Maximum page width |
| `--rail-width` | Left identity rail |
| `--content-gap` | Gap between rail and content |
| `--label-column` | Section label column |
| `--section-y` | Vertical section padding |

Layout rules:

- Keep the left identity rail on desktop
- Use horizontal rules to divide content
- Prefer rows over cards for service lists
- Keep sections spacious but not oversized
- Collapse to a single column on tablet and mobile

## Components

### Logo

The logo is stored as square PNG assets in `site/assets/`.

Generated assets:

- `logo-512.png`
- `logo-256.png`
- `logo-192.png`
- `logo.png`
- `apple-touch-icon.png`
- `favicon-32.png`
- `favicon-16.png`
- `favicon.ico`
- `og-image.png`

Rules:

- Keep the logo square
- Preserve equal padding on all sides
- Use PNG files in the interface
- Use PNG/ICO files for platform metadata and favicons
- Do not add color variants unless the wider visual system changes

### Header

The header is fixed on desktop and becomes visually stronger on scroll.

Rules:

- Brand on the left
- Navigation on the right
- No filled header by default
- Use only a bottom border and black background when scrolled

### Identity Rail

The rail provides company metadata and visual structure.

Rules:

- Keep content factual
- Use short metadata labels
- Avoid marketing statements in the rail

### Buttons

Buttons are rectangular and text-led.

Rules:

- Primary button is white with black text
- Secondary button is transparent with a white border
- No rounded pill buttons
- No icons unless strictly functional

### Service Rows

Services are displayed as numbered rows.

Rules:

- Keep titles short
- Use concise descriptions
- Use borders instead of cards or shadows

## Motion

Motion is minimal and functional.

Allowed:

- Subtle reveal on scroll
- Header state change on scroll
- Border changes on hover

Avoid:

- Parallax
- Decorative animation
- Animated gradients
- Excessive hover movement

## Content Voice

White Rose is positioned as a software engineering consultancy.

Use:

- Direct, plain technical language
- Consultancy, development, DevOps, architecture, review, delivery
- Clear statements about judgement and execution

Avoid:

- Generic agency language
- Startup hype
- Claims that sound broad or inflated
- Floral or romantic brand copy

## Implementation

The design system is implemented in `site/styles.css` using CSS custom properties at `:root`.

When extending the site:

- Add or reuse tokens before adding one-off values
- Keep new components monochrome
- Keep all layout spacing tied to existing spacing tokens
- Do not introduce gradients, shadows as decoration, or third-party visual dependencies
- Keep `https://whiterose.no` as the only external URL unless explicitly changed
