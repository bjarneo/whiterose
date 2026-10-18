# White Rose Design System

The website is a dark dot-matrix page that you control with a rotary dial.

This document describes how the current website looks and works. The source of truth is the code in `site/`. Colors and type live as CSS custom properties in `site/styles.css`. The dial, the canvas, and all input live in `site/script.js`.

Documents and PDFs do not follow this file. They stay black and white. See `pdf.md`.

## Intent

White Rose should feel clear, technical, quiet, and deliberate.

The dial and the dot grid make the site look like a technical tool, not a marketing page. The page shows one idea at a time. The copy stays plain and factual.

## Core Rules

- Use a near-black or warm off-white background with a fixed dot grid
- Use one accent color, rose, for the active state only
- Show one section at a time
- Separate items with dotted rules, not cards or boxes
- Use pill-shaped buttons
- Give text a halo in the background color so that it reads over the dots
- Do not use gradient fills or decorative images
- Do not add a second accent color
- Keep copy short and factual

## Implementation Model

The website is a static site in `site/`. There is no build step. A push to `main` runs `.github/workflows/pages.yml`, which deploys `site/` to GitHub Pages.

| File | Purpose |
| --- | --- |
| `site/index.html` | Metadata, the inline theme script, and all section content |
| `site/styles.css` | Color, type, and layout tokens, and all component styles |
| `site/script.js` | Canvas drawing, dial physics, input, theme, sound, and the contact sheet |
| `site/assets/` | Logos, favicons, the social image, and the wallpaper |

The page has 3 layers inside `[data-root]`:

1. The canvas draws the dot grid, the dial, the readout, the waves, and the ripple.
2. The UI layer holds the header, the content panel, the dial labels, and the hint.
3. The contact sheet covers the page when it is open.

## Color Tokens

The page has a dark and a light theme. `:root` holds the dark values. `:root[data-theme="light"]` holds the light values.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `--bg` | `#080808` | `#eeece6` | Page background, text halo, primary button text |
| `--fg` | `#edebe6` | `#131312` | Text, dots, primary button fill |
| `--accent` | `#f07383` | `#c8364c` | Active dial label, dial notch, item numbers, link hover, waves |
| `--surface` | `#e2e0db` | `#1e1e1d` | Contact sheet background, ripple fill |
| `--muted` | `#7b7a77` | `#81807c` | Kicker, counter, hint, secondary button border |
| `--soft` | `#bfbeba` | `#3f3e3c` | Paragraphs |
| `--line` | `#2d2c2c` | `#cbc9c4` | Pill and preview borders |
| `--dotline` | `#585756` | `#a1a09c` | Dotted rules above items |
| `--halo` | 3 shadows in `--bg` | 3 shadows in `--bg` | Text shadow that separates text from dots |

Each derived token is `--fg` mixed toward `--bg` by a fixed amount:

| Token | Mix toward `--bg` |
| --- | --- |
| `--surface` | 5% |
| `--soft` | 20% |
| `--muted` | 50% |
| `--dotline` | 65% |
| `--line` | 84% |

To change the palette, change `--bg`, `--fg`, and `--accent`, then compute the derived tokens again with these amounts.

`script.js` reads `--fg`, `--accent`, `--surface`, and `--bg` from the computed style when the theme changes. The canvas uses no hard-coded colors.

Color rules:

- Use `--accent` only for the active or selected state, and for numbers
- Use `--soft` for body copy and `--muted` for metadata
- Do not add new colors. Mix from the existing tokens.

## Typography

The site uses Geist for text and Geist Mono for labels. Both load from Google Fonts in `site/index.html`.

| Token | Value |
| --- | --- |
| `--font-sans` | Geist, then system UI fonts |
| `--font-mono` | Geist Mono, then system monospace fonts |

| Element | Size | Weight | Line height | Tracking |
| --- | --- | --- | --- | --- |
| Intro `h1` | `clamp(34px, 4.4vw, 64px)` | 500 | 1.02 | -0.03em |
| Section `h2` | `clamp(30px, 3.6vw, 52px)` | 500 | 1.04 | -0.025em |
| Contact sheet `h2` | `clamp(40px, 7vw, 104px)` | 500 | 0.98 | -0.035em |
| Item `h3` | `19px` | 500 | normal | -0.01em |
| Large item `h3`, `.wr-title-lg` | `clamp(22px, 2vw, 28px)` | 500 | normal | -0.02em |
| Lead paragraph, `.wr-lead` | `clamp(16px, 1.25vw, 19px)` | 400 | 1.55 | normal |
| Item paragraph | `15px` | 400 | 1.55 | normal |
| Kicker, numbers, pills | `12px` mono | 400 | normal | 0.06em for the kicker |
| Hint | `11px` mono | 400 | normal | normal |

Typography rules:

- Use sentence case for headings
- Use uppercase only for the mono kicker
- Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs
- Keep lead paragraphs to `60ch` or less

## Layout Tokens

`script.js` computes the layout from the viewport size. It sets these tokens on `[data-root]`. The values in `styles.css` are fallbacks for the first paint and for pages without JavaScript.

| Token | Use |
| --- | --- |
| `--rx` | Left edge of the header, the panel, and the hint |
| `--ht` | Top of the header |
| `--hr` | Right edge of the header |
| `--pt` | Top of the content panel, below the readout |
| `--pr` | Right edge of the content panel, left of the dial |
| `--pb` | Bottom of the content panel |
| `--dz-l`, `--dz-t` | Left and top edges of the dial drag zone |
| `--hint-d` | `display` value of the hint |
| `--cnt-d` | `display` value of the section counter |

Layout modes:

| Mode | Condition | Dial | Dot pitch |
| --- | --- | --- | --- |
| Wide | Width 760px or more | Right edge, turns vertically, 54px between labels | 12px |
| Short | Wide, and height less than 520px | Same as wide. The top area is tighter and the hint is hidden. | 12px |
| Narrow | Width less than 760px | Bottom edge, turns horizontally, 96px between labels | 10px |

All dots snap to the grid. The readout, the dial, and the panel edges align to the same grid.

## Sections

The page has 9 sections. The order in the HTML is the order on the dial.

| Order | `id` | Dial label | Readout word |
| --- | --- | --- | --- |
| 01 | `intro` | Intro | `white rose` |
| 02 | `position` | Position | `position` |
| 03 | `work` | Work | `work` |
| 04 | `products` | Products | `products` |
| 05 | `principles` | Principles | `principles` |
| 06 | `proof` | Proof | `proof` |
| 07 | `about` | About | `about` |
| 08 | `media` | Media | `media` |
| 09 | `contact` | Contact | `contact` |

`<html data-section="...">` selects the visible section. A CSS rule in `styles.css` shows only the section with that `id`. The inline script in `<head>` sets the first value from the URL hash, so the right section shows before `script.js` runs.

Current products:

- ContextOwl, `contextowl.co`
- Finnfisk, `finnfisk.no`
- cliamp, `cliamp.stream`
- Flux, `bjarneo.github.io/flux`
- Detent, `github.com/bjarneo/detent`

## Components

### Header

- Brand on the left: `logo-small.svg` at 22px and the text White Rose
- Tools on the right: the section counter, the theme pill, and the sound pill
- The counter shows `01 / 09`. It is hidden in narrow mode.
- In the light theme, CSS inverts the logo to black

Markup: `.wr-header`, `.wr-brand`, `.wr-tools`, `.wr-counter`, `.wr-pill`

### Readout

The readout shows the readout word of the active section in a dot-matrix font. It sits above the content panel.

- The font is a 5x9 grid. It has lowercase `a` to `z` and the space only.
- The readout uses 2x scale when it has 118 or more columns
- On very small screens, the dot pitch shrinks so that the longest word fits
- When the section changes, each dot fades to its new value from left to right

### Dial

The dial is an arc of dots with a notch at its center. The labels sit along the arc.

- The active label uses `--accent` and scales to 132%
- The notch dot uses `--accent` and pulses when the dial passes a section
- The labels fade toward the ends of the arc
- Labels are `<button>` elements in `<nav aria-label="Sections">`. The active label has `aria-current="true"`.

### Content Panel

The panel shows the active section and scrolls when the content is taller than the panel.

- The scrollbar is hidden
- A mask fades the top 14px and the bottom 36px
- The panel resets to the top when the section changes

Markup: `.wr-panel`, `.wr-section`, `.wr-prose` for text sections

### Item Grid

Work, products, principles, proof, and media use an auto-fit grid.

| Modifier | Minimum column | Use |
| --- | --- | --- |
| `.wr-grid` | 240px | Work and proof |
| `.wr-grid-products` | 260px, max width 820px | Products |
| `.wr-grid-principles` | 200px | Principles |
| `.wr-grid-media` | 220px | Media |

Each item has a 2px dotted top rule in `--dotline`, an optional mono number in `--accent`, a title, and one paragraph.

Markup: `.wr-item`, `.wr-num`, `.wr-title-lg`

### Buttons

| Class | Style | Hover |
| --- | --- | --- |
| `.wr-btn-primary` | `--fg` fill, `--bg` text | `--accent` fill |
| `.wr-btn-secondary` | `--bg` fill, 1px `--muted` border | `--fg` border |
| `.wr-pill` | Small mono pill with a 1px `--line` border | `--muted` border |

All buttons have a 999px radius. Hover styles apply only on devices that can hover.

### Media Cards

- A 16:10 preview with a 6px radius and a 1px `--line` border
- The white logo sits on `#000000`. The black logo sits on `#f3f2ef`.
- The wallpaper preview fills the card
- A mono download link under the text

Markup: `.wr-media`, `.wr-preview`, `.wr-preview-light`, `.wr-download`

### Contact Sheet

The contact sheet is a full-screen panel in `--surface` with `--bg` text.

- "Discuss a project" opens it. `Enter` on the Contact section also opens it.
- A ripple grows from the button that opened it, then the sheet fades in
- The close button and `Esc` close it. The ripple then shrinks back.
- While the sheet is open, the UI layer is `inert` and the sheet has focus
- When the sheet closes, focus goes back to the button that opened it

Markup: `.wr-sheet`, `.wr-sheet-close`, `.wr-sheet-email`

## Input

| Input | Result |
| --- | --- |
| Mouse wheel or trackpad over the panel | Scrolls the panel. At the panel edge, a new wheel gesture turns the dial. |
| Mouse wheel elsewhere | Turns the dial |
| Drag on the dial | Turns the dial. A fast release continues with momentum. |
| Tap or click on the dial | Goes to the section at that angle |
| Tap or click on a label | Goes to that section |
| `ArrowDown`, `ArrowRight`, `PageDown`, `j` | Next section |
| `ArrowUp`, `ArrowLeft`, `PageUp`, `k` | Previous section |
| `Home`, `End` | First or last section |
| `Enter` on the Contact section | Opens the contact sheet |
| `Esc` | Closes the contact sheet |
| Vertical swipe that starts at the panel edge | Next or previous section, on touch screens |
| Link to `#work` or another section id | Goes to that section |

Input rules:

- Past the first and last section, the dial resists and springs back
- After the panel reaches its edge, the wheel must pause for 320 ms before it turns the dial
- A swipe must be at least 60px, shorter than 700 ms, and mostly vertical
- A swipe changes the section only when it starts at the panel edge. A scroll that reaches the edge does not change the section.
- Keys with `Alt`, `Ctrl`, or `Meta` go to the browser
- When the dial settles, `history.replaceState` writes the section id to the URL hash

## Mobile

Narrow mode is the phone layout.

- The dial sits 124px above the bottom edge and turns horizontally
- The labels sit under the notch, so a thumb can reach them
- The drag zone covers the full width from 56px above the notch to the bottom
- `overscroll-behavior` stops pull-to-refresh, so swipes do not reload the page
- On touch screens, pills and the close button are at least 36px tall
- On touch screens, the hint and the `Esc` key label are hidden
- Below 360px wide, the header uses smaller gaps so that it fits on one line
- On Android, the phone vibrates for each section while you drag the dial, if sound is on

Check every change at 320px, 360px, and 390px wide, and on a phone in landscape.

## Theme

| Choice | Result |
| --- | --- |
| Dark | Default |
| Light | Light tokens |
| System | Follows `prefers-color-scheme` |

The theme pill cycles from Dark to Light to System. The choice is stored in `localStorage` under `white-rose-theme`. The inline script in `<head>` applies the stored theme before the first paint. `script.js` also updates `<meta name="theme-color">` to the current `--bg`.

## Sound

- A short tick plays each time the dial passes a section
- A stronger tick plays when the contact sheet opens or closes
- Sound is on by default. The choice is stored in `localStorage` under `white-rose-sound`.
- The audio context starts on the first click, tap, or key press. Browsers block audio before that.

## Motion

| Motion | Duration | Trigger |
| --- | --- | --- |
| Section enters, 10px rise and fade | 380 ms | Section change |
| Wave of accent dots from the notch | Up to 900 ms | Page load and dial settle |
| Ripple across the dot grid | 640 ms | Contact sheet opens or closes |
| Contact sheet fade | 240 ms | Contact sheet opens |
| UI layer fade | 220 ms | Contact sheet opens or closes |

The canvas draws only while something moves. It stops when the dial, the readout, the waves, and the ripple are all at rest.

With `prefers-reduced-motion: reduce`, the page skips the section animation, the waves, the ripple, and the fades. The dial still moves, because it follows direct input.

## Without JavaScript

The inline script in `<head>` adds the `js` class to `<html>`. Without it:

- All sections show in one scrolling column in the panel
- Elements with `data-js-only` are hidden. These are the tools, the dial labels, the hint, and the copy button.
- Links and email links still work

## Accessibility

- The canvas has `aria-hidden="true"`. All content is real HTML.
- Each section has an `id` and a heading that labels it
- Focus shows a 2px `--accent` outline
- The contact sheet has `role="dialog"` and `aria-modal="true"`
- The sound pill has `aria-pressed`

## Logo Assets

Logo assets live in `site/assets/`.

| Asset | Use |
| --- | --- |
| `logo.svg` | White mark on transparent background, media download |
| `logo-black.svg` | Black mark on transparent background, media download |
| `logo-small.svg` | Simplified white mark for the header and other small sizes |
| `logo.png` | 1024px square tile, white mark on black |
| `logo-512.png` | Large tile, schema.org logo and PDF covers |
| `logo-256.png` | Medium tile |
| `logo-192.png` | Small tile, PDF page headers |
| `apple-touch-icon.png` | Apple touch icon |
| `favicon.svg` | Scalable favicon |
| `favicon-32.png` | 32px favicon |
| `favicon-16.png` | 16px favicon |
| `favicon.ico` | Browser fallback favicon |
| `og-image.png` | Social preview image |
| `white-rose-wallpaper.png` | 3840x2160 desktop wallpaper |

To render a PNG tile from the SVG mark, run:

```sh
rsvg-convert -w 512 -h 512 -b '#000000' site/assets/logo.svg -o site/assets/logo-512.png
```

Logo rules:

- Use the SVG marks on the website
- Use the PNG tiles in documents and on white backgrounds
- Keep the logo square
- Preserve equal padding on all sides
- Use the logo only in black and white. Do not use the accent color on the logo.
- Do not stretch, skew, rotate, recolor, or crop tighter
- Do not place the logo on color backgrounds

See `pdf.md` for document and PDF logo usage.

## Metadata

Metadata is in the `<head>` of `site/index.html`.

Required metadata:

- `<title>`
- `meta[name="description"]`
- `meta[name="theme-color"]`
- The canonical link
- The JSON-LD schema for the business, the website, and the founder
- Open Graph title, description, URL, image, image size, and image alt
- Twitter card title, description, image, and image alt
- Favicons and the Apple touch icon
- The Google tag

Metadata rules:

- Keep `https://whiterose.no` in metadata
- Keep the social image at 1200x630
- Update `<lastmod>` in `site/sitemap.xml` when the content changes

## Content Voice

White Rose is a software engineering consultancy that also does hands-on development and DevSecOps.

Use:

- Plain technical language
- Short sentences
- Specific service names
- Clear descriptions of work
- Words like consultancy, development, DevSecOps, architecture, review, delivery

Avoid:

- Generic agency language
- Startup hype
- Luxury claims
- Big promises
- Floral or romantic brand copy
- Bragging about seniority unless context requires it

## Extension Rules

To add a section:

1. Add a `<section class="wr-section" id="..." data-section data-word="...">` to `<main>` in `site/index.html`.
2. Add a label `<button type="button" data-i="...">` to the `[data-labels]` nav at the same position.
3. Update the `data-i` values of the labels after it, so that they count from 0 in order.
4. Add the id to the list of `.js[data-section="..."]` selectors in `site/styles.css`.
5. Update the `01 / 09` fallback text in `.wr-counter`.

Use only lowercase `a` to `z` and spaces in `data-word`. The readout font has no other glyphs. Keep the word to 10 characters or less. A longer word makes the readout shrink on small screens.

To add a product, add an `.wr-item` to the products grid and number it in order.

When you change the site:

- Reuse the color and type tokens before you add values
- Keep one accent color
- Use dotted rules and spacing to separate items
- Keep copy short

Before shipping:

- Check the page at 320px, 360px, and 390px wide, on a phone in landscape, and on desktop
- Check the dial with touch, mouse, wheel, and keyboard
- Check both themes
- Check the page with JavaScript turned off
- Check the browser console for errors
- Push to `main` and check that the Pages workflow succeeds
