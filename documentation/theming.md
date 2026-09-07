# Theming & design tokens

## The one rule

**Brand colours are defined in exactly one place: `shared/theme/brand.ts`.**

No component contains a hex value. Everything reads semantic CSS variables such
as `var(--color-primary)` or `var(--color-border)`.

## How a colour reaches the screen

```
shared/theme/brand.ts
   │
   ├─► app/plugins/theme.client.ts ─► --color-* variables on <html>
   │        (via the Pinia theme store, so admin overrides apply at runtime)
   │
   ├─► uno.config.ts   ─► UnoCSS shortcuts (.card-flat, .title-lg, …)
   │
   └─► app/assets/css/main.css ─► @theme static block
            └─► Nuxt UI components (`color="primary"`)
```

`app/assets/css/tokens.css` holds the same values as static CSS so the first
paint is correct before JavaScript runs (no flash of unstyled colour).

## Semantic tokens

| Token | Purpose |
| --- | --- |
| `primary`, `primary-hover`, `primary-contrast` | Primary actions, links, active nav |
| `secondary`, `secondary-hover` | Dark industrial surfaces — footer, solid CTA |
| `accent`, `accent-hover` | Sparing highlights: eyebrows, stat rules |
| `background`, `surface`, `surface-muted` | Page and card backgrounds |
| `foreground`, `foreground-soft`, `muted` | Text hierarchy |
| `border`, `border-strong` | Hairlines and dividers |
| `success`, `warning`, `danger` | Status feedback |

Also available: `--radius-sm/md/lg`, `--shadow-sm/md`, `--font-fa`, `--font-en`.

## Changing the brand colour

Edit the scale in `shared/theme/brand.ts`:

```ts
const primaryScale: ColorScale = {
  50: '#eef5fb',
  …
  600: '#0f4c81',   // ← the main brand colour
  …
}
```

Then mirror the same scale in the `@theme static` block of
`app/assets/css/main.css` (Tailwind v4 requires literal values there — it cannot
read a TypeScript file) and in `app/assets/css/tokens.css` for the first-paint
defaults.

The three files are deliberately explicit rather than clever: a future developer
can see the whole palette without tracing a build step.

## Current palette — Mobin Bartar

| Role | Value | Why |
| --- | --- | --- |
| Primary | `#0f4c81` deep industrial blue | Trust, engineering, print heritage |
| Secondary | `#2f3740` graphite | Machinery, ink, steel — used for the footer |
| Accent | `#a35b18` copper | Press-amber highlight, used sparingly |

Light theme only. `colorMode` is pinned to `light` in `nuxt.config.ts`.

## Runtime overrides (admin panel, phase 3)

`app/stores/theme.ts` already merges a `Partial<ThemeSettings>` over the
compile-time defaults:

```ts
const theme = useThemeStore()
theme.applyOverrides({ primary: '#8a1c1c' })   // whole site re-themes instantly
```

The admin panel will load the persisted `ThemeSettings` row (see
`server/database/schema.ts` → `site_settings.theme`) and call this. No component
changes are needed — the plugin rewrites the CSS variables reactively.

## Design direction

The visual language is deliberately corporate/industrial, not "modern SaaS":

- Square-ish corners (2–6px), never pill-shaped cards
- Hairline borders instead of drop shadows
- Flat surfaces — no gradients, glassmorphism or blobs
- Strong typographic hierarchy and generous whitespace
- Real photography rather than decorative illustration
- Transitions limited to colour changes on hover/focus

`prefers-reduced-motion` is respected globally in `main.css`.
