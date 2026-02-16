# Docs App Guidelines

The docs app uses a custom "Forge" design language — dark industrial aesthetic with ember/fire accents.

## Theme System

All reusable styles are in `src/styles/`:

- `_variables.scss` — Design tokens (colors, spacing, typography)
- `_mixins.scss` — Reusable SCSS mixins
- `_animations.scss` — Keyframe animations
- `_index.scss` — Main entry point

Import in component SCSS files (`includePaths` is configured in `project.json`):

```scss
@use 'variables' as *;
@use 'mixins' as mix;
@use 'animations' as anim;
```

## Color Palette

### Backgrounds (Dark → Light)

| Variable       | Hex       | Use                         |
| -------------- | --------- | --------------------------- |
| `$bg-void`     | `#000000` | Absolute black, sparingly   |
| `$bg-deep`     | `#0a0908` | Primary dark background     |
| `$bg-surface`  | `#131210` | Headers, panels             |
| `$bg-elevated` | `#1a1916` | Cards, interactive elements |

### Ember/Fire (Primary Accent)

| Variable      | Hex       | Use                     |
| ------------- | --------- | ----------------------- |
| `$ember-core` | `#ff4d00` | Primary action color    |
| `$ember-hot`  | `#ff6b2b` | Hover/active states     |
| `$ember-glow` | `#ff8c42` | Highlights, links, code |
| `$molten`     | `#ffb627` | Gold accent             |

### Steel (Text & Borders)

| Variable      | Hex       | Use               |
| ------------- | --------- | ----------------- |
| `$steel`      | `#e8e4de` | Primary text      |
| `$steel-mid`  | `#9a958c` | Secondary text    |
| `$steel-dim`  | `#5c5850` | Muted text        |
| `$steel-dark` | `#2a2824` | Borders, dividers |

## Typography

- **Primary**: `$font-primary` — 'Space Grotesk', sans-serif
- **Monospace**: `$font-mono` — 'JetBrains Mono', monospace

## Key Mixins

```scss
// Cards
@include mix.card; // Basic card with hover
@include mix.card($with-ember-border: true); // Gradient top border
@include mix.card-static; // No hover effects

// Buttons
@include mix.btn-primary; // Ember gradient
@include mix.btn-secondary; // Outlined

// Code blocks
@include mix.code-block; // Container with accent
@include mix.code-header; // Header with traffic lights
@include mix.code-body; // Content area

// Links
@include mix.link-inline; // Animated underline
@include mix.link-nav; // Nav hover underline

// Sections
@include mix.section-container; // Max-width + padding
@include mix.section-label; // "FEATURES" label
@include mix.section-title; // Large heading
@include mix.section-desc; // Description text

// Animations
@include anim.animated-border; // Shimmer gradient
@include anim.pulse-rings; // Radiating pulse
@include anim.spinner($size: 24px); // Loading spinner
@include anim.skeleton; // Loading skeleton
```

## Design Principles

1. **Dark-first** — dark backgrounds, light text
2. **Ember accents** — ember colors for CTAs, links, interactive states
3. **Subtle animations** — hover transforms, border shimmers, pulse effects
4. **Glass effects** — `@include glass-panel` for floating navigation
5. **Consistent spacing** — use `$space-*` variables, never arbitrary values
6. **Mobile-responsive** — use `@include mobile { }` for responsive overrides
