# White Rose Site Structure

Recommended URL hierarchy and internal linking model for growing White Rose beyond a one-page site without losing its direct, technical brand.

## Architecture Principles

- Keep the site small enough to maintain.
- Give each service its own indexable page.
- Use a hub-and-spoke model around services, proof, and insights.
- Add pages only when they serve a real buyer question or proof need.
- Keep URLs short, lowercase, and descriptive.

## Recommended URL Hierarchy

```text
/
/services/
/services/technical-direction/
/services/architecture-review/
/services/software-development/
/services/devsecops/
/services/infrastructure-automation/
/services/technical-due-diligence/
/process/
/about/
/work/
/work/architecture-review-example/
/work/devsecops-automation-example/
/work/internal-tooling-example/
/insights/
/insights/architecture-review-checklist/
/insights/codebase-review-checklist/
/insights/devsecops-review-checklist/
/insights/how-to-plan-a-technical-roadmap/
/insights/when-to-rewrite-a-system/
/contact/
```

`/services/technical-due-diligence/` should only be published if White Rose wants to sell that service explicitly.

## Navigation Model

| Primary Nav | Purpose |
| --- | --- |
| Services | Commercial service discovery |
| Work | Proof and project examples |
| Insights | Expertise and informational search |
| About | Trust and E-E-A-T |
| Contact | Conversion |

## Page Requirements

| Page Type | Required Sections |
| --- | --- |
| Homepage | Positioning, services summary, proof signals, principles, contact |
| Service hub | Service overview, who it helps, links to service pages, contact CTA |
| Service page | Problem, service scope, deliverables, process, good fit, not a fit, FAQ, CTA |
| Proof page | Context, challenge, constraints, approach, outcome, related services |
| Insight page | Clear question, practical answer, checklist or framework, service CTA |
| About page | Bio, experience, focus areas, links, contact, Person schema |
| Contact page | Email, response expectations, project fit notes |

## Internal Linking Strategy

| Source | Link To | Anchor Examples |
| --- | --- | --- |
| Homepage | Service hub | `software engineering consultancy services` |
| Homepage | Contact | `discuss a technical decision` |
| Service hub | Individual services | `architecture review`, `DevSecOps support`, `technical direction` |
| Service pages | Related insights | `architecture review checklist`, `codebase review checklist` |
| Insight pages | Relevant service page | `architecture review service`, `technical direction support` |
| Proof pages | Services used | `DevSecOps`, `software development`, `architecture review` |
| About page | Services and contact | `work with White Rose`, `contact Bjarne` |

## Sitemap Structure

Keep `site/sitemap.xml` limited to pages that meet quality gates.

Priority order for sitemap expansion:

1. Homepage
2. Service hub
3. Core service pages
4. About page
5. Process page
6. Proof hub and proof pages
7. Insight hub and insight pages
8. Contact page if separate

## Quality Gates

Do not add a page to the sitemap until it passes these checks.

| Gate | Requirement |
| --- | --- |
| Search intent | One clear target intent |
| Title | Unique, natural, under practical display length |
| Description | Unique and specific to the page |
| H1 | One descriptive H1 |
| Content | No filler, includes concrete details and buyer value |
| Internal links | At least 3 relevant internal links where possible |
| CTA | Clear path to contact or next page |
| Schema | Appropriate JSON-LD where useful |
| Images | Meaningful alt text or decorative handling |
| Performance | Page remains fast on mobile |

## Schema Plan

| Page | Schema |
| --- | --- |
| Homepage | Organization, ProfessionalService, WebSite |
| About | Person, ProfilePage |
| Service hub | CollectionPage, ProfessionalService |
| Service pages | Service, FAQPage if FAQs are present |
| Proof pages | Article or CreativeWork |
| Insight pages | Article or BlogPosting |
| Contact | ContactPage |

## User Journeys

| User | Likely Entry | Next Step | Conversion |
| --- | --- | --- | --- |
| CTO with system risk | Architecture review page | Checklist or proof page | Email White Rose |
| Founder needing technical direction | Technical direction page | Process page | Discuss project |
| Team with deployment problems | DevSecOps page | DevSecOps checklist | Email White Rose |
| Buyer evaluating credibility | About page | Work page | Contact |
| Searcher with informational query | Insight page | Related service page | Contact after reading proof |

## Future Internationalization

The current site uses English. If local Norwegian search becomes a priority, add Norwegian pages under `/no/` rather than mixing languages on the same URL.

Recommended approach:

- Keep English pages as canonical for international and technical searches.
- Add `/no/` only after the English service structure is stable.
- Use hreflang pairs if Norwegian pages are published.
