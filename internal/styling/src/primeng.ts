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

// Light surfaces - matches Bootstrap light mode
const SURFACES_LIGHT = {
  0: '#ffffff', // input background
  50: 'rgb(250, 250, 250)', // page background
  100: '#f8f9fa', // subtle background
  200: '#dee2e6', // borders (Bootstrap)
  300: '#ced4da', // darker borders
  400: '#adb5bd', // muted elements
  500: '#6c757d', // secondary text
  600: '#495057', // primary text
  700: '#343a40',
  800: '#212529',
  900: '#111827',
  950: '#030712',
} as const;

// Dark surfaces - Bootstrap-like colors for consistency
const SURFACES_DARK = {
  0: 'rgb(19, 18, 16)', // page background
  50: 'rgb(25, 25, 25)', // slightly elevated
  100: 'rgb(33, 37, 41)', // input/card background (Bootstrap $gray-800)
  200: 'rgb(52, 58, 64)', // elevated surfaces (Bootstrap $gray-700)
  300: 'rgb(73, 80, 87)', // borders (Bootstrap $gray-600)
  400: 'rgb(108, 117, 125)', // muted text (Bootstrap $gray-500)
  500: 'rgb(134, 142, 150)', // secondary text
  600: 'rgb(222, 226, 230)', // primary text (Bootstrap $gray-200)
  700: 'rgb(233, 236, 239)',
  800: 'rgb(248, 249, 250)',
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
          background: '#ffffff',
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
          background: '#000000',
          disabledBackground: '{surface.100}',
          borderColor: '{surface.300}',
          focusBorderColor: EMBER.glow,
          color: '{surface.600}',
        },
        overlay: {
          select: {
            background: '{surface.100}',
            borderColor: '{surface.300}',
            color: '{surface.600}',
          },
          popover: {
            background: '{surface.100}',
            borderColor: '{surface.300}',
            color: '{surface.600}',
          },
          modal: {
            background: '{surface.100}',
            borderColor: '{surface.300}',
            color: '{surface.600}',
          },
        },
        content: {
          background: '{surface.100}',
          borderColor: '{surface.300}',
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
