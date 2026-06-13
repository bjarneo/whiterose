# White Rose PDF And Document System

A practical guide for proposals, reports, invoices, statements of work, and other PDFs from White Rose.

PDFs should feel like the website: black and white, clear, technical, and restrained. They should also be easy to read, print, and forward.

## Purpose

Use this guide for:

- Proposals
- Statements of work
- Technical audits
- Architecture reviews
- DevOps reviews
- Project summaries
- Invoices and payment documents
- One-page capability documents

## Core Rules

- Black and white only
- No gradients
- No decorative color accents
- No stock imagery
- No ornamental dividers
- No heavy marketing language
- Keep documents readable when printed
- Use the logo with equal padding and clear contrast

## PDF Modes

Use two document modes.

| Mode | Background | Use |
| --- | --- | --- |
| Formal | White | Proposals, reports, invoices, client documents |
| Cover | Black | Optional first page, title pages, short one-pagers |

Default to Formal mode. Black pages look strong on screen but are expensive to print and can reduce readability in long documents.

## Page Setup

Recommended page settings:

| Setting | Value |
| --- | --- |
| Page size | A4 |
| Orientation | Portrait |
| Margin | 18mm to 22mm |
| Body width | 150mm to 165mm |
| Footer height | 10mm to 14mm |
| Header height | 12mm to 18mm |

For US clients, Letter size is acceptable, but the layout should keep the same proportions.

## Color

Formal mode:

| Token | Value | Use |
| --- | --- | --- |
| `pdf-bg` | `#ffffff` | Page background |
| `pdf-text` | `#000000` | Primary text |
| `pdf-muted` | `#555555` | Secondary text |
| `pdf-line` | `#d8d8d8` | Rules and tables |
| `pdf-surface` | `#f4f4f4` | Subtle table or note background |

Cover mode:

| Token | Value | Use |
| --- | --- | --- |
| `pdf-bg-dark` | `#000000` | Cover background |
| `pdf-text-dark` | `#ffffff` | Cover text |
| `pdf-muted-dark` | `#9a9a9a` | Cover secondary text |
| `pdf-line-dark` | `rgba(255,255,255,0.18)` | Cover border lines |

Rules:

- Do not use accent colors
- Do not use gradients
- Do not use tinted brand variants
- Use black, white, gray, and line weight only

## Typography

Match the website direction but optimize for documents.

Recommended type roles:

| Role | Font style | Use |
| --- | --- | --- |
| Display | Condensed bold sans | Cover titles and section titles |
| Body | Monospace or neutral sans | Body text, tables, metadata |
| Numbers | Monospace | Dates, amounts, row numbers, references |

Recommended sizes for A4:

| Role | Size | Notes |
| --- | --- | --- |
| Cover title | 32pt to 46pt | Uppercase, short |
| Document title | 22pt to 30pt | Uppercase or title case |
| Section heading | 12pt to 16pt | Uppercase |
| Body | 9.5pt to 11pt | Keep readable |
| Small metadata | 7.5pt to 8.5pt | Use sparingly |
| Footer | 7pt to 8pt | Low contrast is fine |

Typography rules:

- Keep headings short
- Avoid long uppercase paragraphs
- Avoid centered body text
- Use monospaced numbers in tables and invoices
- Do not mix many typefaces

## Logo Usage

Logo source assets live in `site/assets/`.

Use these assets:

| Asset | Use |
| --- | --- |
| `logo.png` | Main logo source for documents |
| `logo-512.png` | Large PDF cover or title page use |
| `logo-256.png` | Standard PDF header use |
| `logo-192.png` | Small header/footer use |

Rules:

- Use PNG only
- Keep the logo square
- Preserve equal padding on all sides
- Do not crop tighter than the existing assets
- Do not stretch or distort
- Do not rotate
- Do not recolor
- Do not add shadows, glows, outlines, or effects
- Do not place the logo over photography or patterns

Minimum sizes:

| Context | Minimum size |
| --- | --- |
| PDF cover | 28mm |
| PDF header | 12mm |
| PDF footer | 8mm |
| Invoice mark | 10mm |

Clear space:

- Keep at least one quarter of the logo width as clear space around the logo
- Do not place text or borders too close to the mark
- Align the logo to a document grid, not by eye

Background rules:

- On white pages, use the black square logo asset as-is if contrast is acceptable
- On black pages, use the logo asset as-is
- If a transparent or inverted logo is needed later, create a documented PNG asset instead of editing it ad hoc

## Document Structure

Use a consistent structure for most PDFs.

### Cover Page

Use for proposals, reviews, and important reports.

Recommended content:

- Logo
- Document title
- Short subtitle
- Client or project name
- Date
- Contact email

Example:

```txt
WHITE ROSE
ARCHITECTURE REVIEW

System review and technical recommendations
Prepared for: Client Name
Date: 2026-06-13
Contact: bjarne@oever.li
```

### Summary Page

Use the first content page to explain the work plainly.

Recommended sections:

- Context
- What was reviewed
- Main findings
- Recommended next steps

### Body Pages

Use clear sectioning.

Recommended sections for technical documents:

- Context
- Current state
- Findings
- Risks
- Options
- Recommendation
- Next steps

### Final Page

Use a short closing page only if needed.

Recommended content:

- Contact email
- Scope note
- Version or date

## Proposal Format

Recommended proposal sections:

- Summary
- Scope
- Approach
- Deliverables
- Timeline
- Responsibilities
- Commercial terms
- Next steps

Rules:

- Keep scope specific
- Avoid broad claims
- Use tables for deliverables and timeline
- Use plain language for assumptions and exclusions

## Technical Review Format

Recommended review sections:

- System overview
- Review scope
- Findings
- Severity or priority
- Recommendation
- Next steps

Finding format:

| Field | Meaning |
| --- | --- |
| Finding | What was observed |
| Impact | Why it matters |
| Recommendation | What to do next |
| Priority | High, medium, low |

Keep findings factual. Avoid blame language.

## Invoice Format

Invoices should be simpler than proposals.

Recommended sections:

- Logo and company name
- Invoice number
- Invoice date
- Due date
- Bill to
- Line items
- Total
- Payment details
- Contact email

Invoice rules:

- Use white background
- Use black text
- Use thin table rules
- Align amounts right
- Use monospaced numbers
- Keep footer minimal

## Tables

Tables should be functional, not decorative.

Rules:

- Thin black or gray rules
- No color fills except light gray surfaces
- Left-align text
- Right-align amounts and totals
- Keep row height compact but readable
- Avoid vertical borders unless needed

## Headers And Footers

Header options:

- Small logo left, document title right
- Document title left, date right
- No header on cover pages

Footer options:

- `White Rose`
- Page number
- Version or date
- `bjarne@oever.li`

Footer rules:

- Keep low contrast
- Keep one line where possible
- Do not repeat large branding on every page

## Writing Style

Use:

- Plain technical language
- Short paragraphs
- Specific observations
- Clear recommendations
- Direct next steps

Avoid:

- Sales language
- Hype
- Long introductions
- Vague claims
- Decorative brand copy
- Over-explaining obvious points

## File Naming

Use predictable filenames.

Recommended format:

```txt
white-rose-client-project-document-type-YYYY-MM-DD.pdf
```

Examples:

```txt
white-rose-acme-architecture-review-2026-06-13.pdf
white-rose-acme-proposal-2026-06-13.pdf
white-rose-invoice-2026-001.pdf
```

## Export Checklist

Before sending a PDF:

- Logo is square and not distorted
- No gradients or color accents are used
- Text is readable at 100 percent zoom
- Document prints well in black and white
- Metadata does not expose drafts or private notes
- Links work
- Email is correct: `bjarne@oever.li`
- Filename follows the naming format
- PDF is not unnecessarily large

## Relationship To Website

The PDF system follows the website design system in `design.md` but adapts it for print and client documents.

Use the website system for:

- Brand tone
- Logo assets
- Monochrome discipline
- Typography direction
- Structural restraint

Adapt for PDFs:

- Prefer white pages for readability
- Use smaller type
- Use tables for scope, timeline, and costs
- Avoid full-black long documents
