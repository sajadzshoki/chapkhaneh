# Theming & design tokens

## The two sources of truth

Colour lives in exactly two places, and which one applies depends on whether
the site is running:

| Source | Role |
| --- | --- |
| `shared/theme/brand.ts` | The **default** palette. Compile-time seed for Tailwind and the pre-paint stylesheet. |
| `theme_settings` (PostgreSQL) | The **live** palette. What an owner edits in the admin. Overrides the default at runtime. |

No component contains a hex value. Everything reads semantic CSS variables such
as `var(--color-primary)` or `var(--color-border)`.

## How a colour reaches the screen

```
theme_settings row (PostgreSQL)
   │  sanitizeTheme()  — rejects anything that is not #rrggbb
   ▼
shared/theme/tokens.ts  — 8 editable colours ─► 19 semantic tokens + 3×11 numbered scales
   │
   ├─► server/routes/theme.css.ts ─► GET /theme.css
   │        └─► <link rel="stylesheet"> in app/app.vue  (render-blocking, so no flash)
   │
   └─► app/pages/admin/settings/theme.vue ─► inline styles on the preview container only
            (same function, so the preview matches production exactly)
```

`shared/theme/brand.ts` feeds two **generated** files via
`npm run theme:generate`:

- `app/assets/css/tokens.css` — the default palette as static CSS.
- the `@theme static` block in `app/assets/css/main.css` — Tailwind v4 needs
  literal values at build time; it cannot read a database.

`/theme.css` is served *after* those, so the saved palette wins the cascade.

### Why the palette is duplicated

Tailwind v4 resolves utility classes at build time and Nuxt UI resolves
`color="primary"` against numbered scales such as `--color-primary-600`. Neither
can wait for a database query. The build therefore needs literal CSS, while the
runtime needs database values.

Rather than maintain both by hand, `scripts/generate-theme-css.mjs` derives the
build-time CSS from `brand.ts`, and `shared/theme/tokens.ts` derives the runtime
CSS from the same rules. **Edit `brand.ts`, then run `npm run theme:generate`.**
Never edit `tokens.css` or the `@theme` block directly.

This is deliberately the simplest thing that works: one small script, no CSS
pipeline, no PostCSS plugins.

## Changing colours does not require a rebuild

Saving in `/admin/settings/theme` writes to PostgreSQL. The next request to
`/theme.css` reflects it. Only the *defaults* in `brand.ts` need
`npm run theme:generate` plus a rebuild.

## The 8 editable colours

`primary`, `secondary`, `accent`, `background`, `surface`, `foreground`,
`muted`, `border`.

Everything else is derived: hover states, `surface-muted`, `foreground-soft`,
`border-strong`, and `primary-contrast` (chosen for WCAG contrast against the
primary colour). `success`, `warning` and `danger` are fixed, because their
meaning is conventional rather than brand-specific.

### Curated vs derived

When an editable colour still equals its default, the hand-tuned value from
`brand.ts` is used verbatim instead of the computed one. This keeps the seeded
Mobin Bartar demo pixel-identical while still letting any custom colour produce
a sensible full scale.

## Validation and safety

Theme strings are user input that ends up inside a stylesheet, so:

- Zod enforces `/^#[0-9a-fA-F]{6}$/` on write.
- `sanitizeTheme()` runs again on read, so a value written directly to the
  database by other means still cannot break out.
- Anything invalid falls back to the default for that key.

Shorthand (`#fff`), named colours, `rgb()`, and anything containing `;`, `}` or
`<` are all rejected. There is no path by which a stored value can inject CSS.

## Admin preview isolation

The preview in `/admin/settings/theme` applies the draft palette as **inline
styles on a single container**. It never touches `document.documentElement`, so
the surrounding admin UI keeps the saved theme and an abandoned edit cannot
leave the admin looking broken. Cancel restores the last saved values; no reload
is needed to change a colour.

## Presets

Default, Blue, Red, Green and Orange set only `primary`, `secondary` and
`accent` — they are a starting point, not a lock. All eight colours remain
editable afterwards.
