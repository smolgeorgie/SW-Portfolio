# CLAUDE.md

Persistent context for Claude Code. Read at the start of every session.

---

## About me

**Ilona van Oosbree** — Frontend Designer & Developer. Based in Mijdrecht, Netherlands. Born 24 January 2001.

- Portfolio: [ilonavanoosbree.com](https://ilonavanoosbree.com)
- GitHub: [smolgeorgie](https://github.com/smolgeorgie)
- Languages: Dutch (native), English (fluent) — code, comments and commits in English unless I say otherwise

### Background

- **VDB Tech** — Junior Systeembeheerder (08/2025 – present). Workstations, servers and network equipment; Windows/Linux install and config; first- and second-line support; accounts, rights and backups; updates, patches and security checks.
- **Paer Studio** — Frontend Lead & Co-owner (11/2024 – 07/2026, studio now closed). Accessible, performant websites with a SvelteKit focus, extending into Shopify and WordPress. Performance and a11y optimisation regardless of framework. Project planning plus bookkeeping, invoicing and contract management.
- **Pon Center** (Hiker Verhuur / Euromobil, automotive) — since 01/2022. Also worked briefly in car sales, and did an online marketing internship there (09/2021 – 01/2022): SEO, CMS work in Sulu, and commercial photography.
- **Leo Catering** — allround marketing internship (01/2023 – 05/2023). Social media, content calendar, copywriting, visual design and photography.

### Education

- **AD Frontend Design and Development** — Hogeschool van Amsterdam, 2023–2025, with an extra curriculum in Cybersecurity
- **MHBO Marketing, Journalistiek en Communicatie** — MBO Utrecht, niveau 4, 2020–2023
- **VMBO-T Zorg en Welzijn** — RKSG Thamen Uithoorn, 2013–2017

### Skills

| Area            | Tools                                                     |
| --------------- | --------------------------------------------------------- |
| Core            | HTML, CSS, JavaScript                                     |
| Frameworks      | SvelteKit (primary), 11ty, Enhance                        |
| CMS             | Directus, GhostCMS, Sulu CMS, Hygraph, WordPress, Shopify |
| Other languages | Python                                                    |
| Version control | Git, GitHub                                               |
| Design          | Figma, Canva                                              |
| Photography     | Adobe Lightroom, Adobe Photoshop                          |

Assume competence in all of the above — explain unfamiliar concepts, not familiar ones.

---

## How I write code

These are conventions, not suggestions. Follow them in anything you write or review for me.

### HTML — semantic and accessible first

I write semantic HTML to 2026 standards. Markup describes meaning; CSS handles appearance.

**Element choice**

- Use the element that means the thing: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`, `figcaption`, `time`, `address`.
- `div` is only for elements that exist _purely_ for styling — a flex wrapper, a grid container. If an element carries meaning, it gets a semantic tag.
- Same for `span`: styling hooks only.
- `button` for actions, `a` for navigation. Never a clickable `div`.
- A `section` needs an accessible name (a heading or `aria-label`). If it has neither, it's probably a `div`.

**Structure**

- Exactly one `<main>` per page.
- Landmark-based structure — every region of the page sits inside a landmark.
- Strict heading hierarchy `h1` → `h6`, no levels skipped. One `h1` per page.
- Component-based organisation; consistent container/wrapper conventions.
- Layout and content stay separated — layout wrappers don't carry content semantics, and content elements don't do layout duty.
- Mobile-first markup and progressive enhancement: it works without JavaScript, then gets better with it.
- DRY and minimal — no wrapper divs that exist for no reason, no decorative nesting. Flatten the DOM where you can.

**Attributes**

- `alt` on every image. Empty `alt=""` for decorative images — never omitted.
- `loading="lazy"` on below-the-fold images; explicit `width` and `height` to prevent layout shift.
- `aria-*` only where semantics can't do the job. Native semantics beat ARIA every time.
- `for` / `id` pairing on every label and input. Every input has a real label.
- Boolean attributes bare: `disabled`, `required`, `hidden` — not `disabled="true"`.
- `autocomplete` on form fields wherever a standard token applies.
- `data-*` for JS hooks and state, never for styling.
- `role` only when the native element can't express it.
- `id` for anchors, label pairing and ARIA references — not as a styling hook.
- `name` on all form controls that submit.

**Performance**

- Accessibility and performance come before convenience. If a pattern is faster to write but worse for either, don't write it.
- Modern image formats (WebP/AVIF) with `srcset` and `sizes`.
- Defer non-critical JS; no render-blocking unless there's a reason.

### CSS

- **Scoped CSS by default.** Component styles live with the component.
- **Anything recurring goes in `global.css`** — recurring layouts and containers get consistent, reusable class names there rather than being redefined per component.
- **Always start with `:root`.** All recurring colours are custom properties. Same for spacing, typography and other repeated tokens. No hardcoded hex values in component CSS.
- **Class naming: semantic + BEM.** Names describe what a thing _is_, not what it looks like — `card__title`, not `big-blue-text`.
- **State and accessibility naming** for states: `is-open`, `has-error`, `is-active`, and so on.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Visible focus styles on everything interactive. Never `outline: none` without a replacement.

---

## Working with me

- I work iteratively — short exchanges, course-correcting as I go. Prefer small steps I can review over one large drop.
- Show me the code, then explain if needed. Don't over-explain things I already know.
- Flag accessibility or performance problems in my own code even if I didn't ask.
- If a convention above conflicts with what a task actually needs, say so instead of silently breaking it.

---

## Current project

<!-- Fill this in per project -->

- **What it is:**
- **Stack:**
- **Build / dev commands:**
- **Deploy:**
- **Notes:**

### Known requirements

- Age displayed on the site must be calculated from the birthday (24 January 2001), not hardcoded — it should roll over on its own each year.
