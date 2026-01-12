import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import type { PrimeNGConfigType } from 'primeng/config';

// ============================================
// EMBER COLOR TOKENS
// ============================================
const EMBER = {
  core: '#ff4d00',
  hot: '#ff6b2b',
  glow: '#ff8c42',
  molten: '#ffb627',
} as const;

const SEMANTIC = {
  success: '#28ca42',
  error: '#ff5f57',
  warning: '#ffbd2e',
} as const;

// ============================================
// SURFACE PALETTES
// ============================================
// These match our SCSS theme definitions

const SURFACES_LIGHT = {
  0: '#ffffff',
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
} as const;

// Dark surfaces match $theme-dark from _themes.scss
const SURFACES_DARK = {
  0: '#000000', // bg-void
  50: '#0a0908', // bg-deep
  100: '#131210', // bg-surface
  200: '#1a1916', // bg-elevated
  300: '#2a2824', // border
  400: '#5c5850', // text-muted
  500: '#9a958c', // text-secondary
  600: '#e8e4de', // text-primary
  700: '#f5f3f0',
  800: '#faf9f7',
  900: '#ffffff',
  950: '#ffffff',
} as const;

// ============================================
// EMBER PRESET
// ============================================
// Extends Aura theme with ember color palette

export const EmberPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: EMBER.glow,
      500: EMBER.core,
      600: EMBER.hot,
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
    colorScheme: {
      light: {
        surface: SURFACES_LIGHT,
        primary: {
          color: EMBER.core,
          contrastColor: '#ffffff',
          hoverColor: EMBER.hot,
          activeColor: '#c2410c',
        },
        formField: {
          background: '{surface.0}',
          disabledBackground: '{surface.100}',
          borderColor: '{surface.200}',
          focusBorderColor: EMBER.core,
          color: '{surface.900}',
        },
      },
      dark: {
        surface: SURFACES_DARK,
        primary: {
          color: EMBER.glow,
          contrastColor: '#000000',
          hoverColor: EMBER.core,
          activeColor: EMBER.hot,
        },
        formField: {
          background: '{surface.100}',
          disabledBackground: '{surface.50}',
          borderColor: '{surface.300}',
          focusBorderColor: EMBER.glow,
          color: '{surface.600}',
        },
      },
    },
  },
});

// ============================================
// THEME CONFIG
// ============================================
// Ready-to-use configuration for providePrimeNG()

export const PRIMENG_EMBER_THEME: PrimeNGConfigType['theme'] = {
  preset: EmberPreset,
  options: {
    darkModeSelector: '[data-theme="dark"]',
    cssLayer: {
      name: 'primeng',
      order: 'primeng',
    },
  },
};

// ============================================
// LANDING PAGE THEME CONFIG
// ============================================
// Uses dark mode by default for landing page context

export const PRIMENG_LANDING_THEME: PrimeNGConfigType['theme'] = {
  preset: EmberPreset,
  options: {
    darkModeSelector: ':root', // Always dark on landing
    cssLayer: {
      name: 'primeng',
      order: 'primeng',
    },
  },
};
