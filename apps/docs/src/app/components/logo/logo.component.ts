import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Available logo sizes */
export type LogoSize = 'sm' | 'md' | 'lg';

/**
 * Presentational logo component for ng-forge branding.
 * Uses inline SVG from favicon.svg with custom text styling.
 * Supports light/dark mode and hover effects.
 *
 * Wrap with an `<a>` or `<button>` element to make it interactive.
 */
@Component({
  selector: 'app-logo',
  template: `
    <svg
      class="logo-svg"
      viewBox="200 200 1400 600"
      xmlns="http://www.w3.org/2000/svg"
      [attr.aria-label]="showSubtitle() ? 'ng-forge Dynamic Forms' : 'ng-forge'"
      role="img"
      style="overflow: visible"
    >
      <defs>
        <linearGradient id="emberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff4d00" />
          <stop offset="50%" stop-color="#ff6b2b" />
          <stop offset="100%" stop-color="#ff8c42" />
        </linearGradient>
      </defs>
      <!-- Icon -->
      <g class="logo-icon" transform="translate(0.000000,1024.000000) scale(0.100000,-0.100000)" stroke="none">
        <path
          d="M5500 7507 c-8 -7 -196 -195 -417 -418 -388 -391 -403 -407 -403
-444 0 -21 9 -52 20 -69 27 -43 267 -269 297 -280 54 -18 86 0 217 126 l127
121 507 -506 507 -507 45 0 c42 0 47 4 142 98 94 94 98 100 98 142 l0 44 -510
511 -511 511 126 125 c70 68 133 136 141 151 15 29 18 86 6 104 -22 35 -260
278 -284 290 -33 17 -88 18 -108 1z"
        />
        <path
          d="M4080 6778 c0 -7 41 -149 91 -316 50 -167 89 -305 86 -308 -3 -3 -89
13 -191 35 -103 23 -189 41 -191 41 -25 0 68 -138 454 -675 169 -234 158 -222
170 -210 5 6 -35 129 -103 310 -62 165 -109 302 -104 303 4 2 78 -11 163 -29
86 -17 158 -30 161 -26 3 3 -61 115 -142 249 -311 515 -386 638 -390 638 -2 0
-4 -5 -4 -12z"
        />
        <path
          d="M5040 5849 c-107 -88 -201 -163 -207 -166 -31 -12 -7 -20 79 -27 50
-3 93 -8 96 -10 2 -3 -42 -70 -97 -150 -124 -177 -128 -187 -70 -150 111 70
504 337 507 344 2 4 -46 11 -106 15 -60 4 -114 10 -120 14 -8 5 11 51 58 142
70 136 76 149 63 149 -5 0 -96 -73 -203 -161z"
        />
        <path
          d="M4009 5143 l-33 -28 -575 -3 c-399 -2 -579 -6 -588 -13 -7 -7 -13
-26 -13 -44 0 -41 48 -104 174 -231 246 -246 529 -389 869 -440 179 -26 248
-54 324 -130 68 -68 88 -121 88 -229 0 -112 -20 -160 -101 -245 -92 -96 -186
-146 -323 -171 -90 -17 -91 -19 -91 -189 0 -131 2 -149 19 -164 17 -15 45 -17
283 -14 l264 3 89 72 c183 149 217 158 600 158 377 0 397 -5 582 -158 l88 -72
271 -3 c239 -3 274 -1 288 13 13 14 16 42 16 165 0 169 -2 173 -75 184 -117
18 -217 69 -305 157 -185 186 -164 468 50 680 114 112 263 185 645 316 75 26
137 53 148 65 14 17 17 42 17 168 0 130 -2 149 -18 163 -17 16 -124 17 -1340
17 l-1320 0 -33 -27z"
        />
      </g>
      <!-- Text -->
      <g class="logo-text">
        <text x="730" y="500" class="logo-name">ng-forge</text>
        @if (showSubtitle()) {
          <text x="730" y="650" class="logo-subtitle">Dynamic Forms</text>
        }
      </g>
    </svg>
  `,
  styles: `
    @use 'tokens' as *;
    @use 'themes' as *;

    :host {
      display: inline-flex;
    }

    :host(:hover) .logo-svg {
      filter: brightness(1.1) saturate(1.1) drop-shadow(0 0 6px rgba($molten, 0.4));
    }

    .logo-svg {
      height: 48px;
      width: auto;
      transition: filter 0.2s ease;
    }

    .logo-icon {
      fill: url(#emberGradient);
    }

    .logo-name {
      font-family:
        system-ui,
        -apple-system,
        sans-serif;
      font-size: 190px;
      font-weight: 700;
      fill: url(#emberGradient);
    }

    .logo-subtitle {
      font-family:
        system-ui,
        -apple-system,
        sans-serif;
      font-size: 110px;
      font-weight: 500;
      fill: $steel-mid;
    }

    // Size variants
    :host([size='sm']) .logo-svg {
      height: 32px;
    }

    :host([size='lg']) .logo-svg {
      height: 64px;
    }

    // Dark mode - subtitle color adjustment
    :host-context([data-theme='dark']),
    :host-context([data-theme='landing']),
    :host-context(.ng-doc-dark) {
      .logo-subtitle {
        fill: $steel-dim;
      }
    }

    @media (prefers-color-scheme: dark) {
      :host-context(html:not([data-theme='light'])) {
        .logo-subtitle {
          fill: $steel-dim;
        }
      }
    }
  `,
  host: {
    '[attr.size]': 'size()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {
  /** Show "Dynamic Forms" subtitle below the name (default: true as it's part of the brand) */
  readonly showSubtitle = input(true);

  /** Size variant: 'sm' | 'md' | 'lg' */
  readonly size = input<LogoSize>('md');
}
