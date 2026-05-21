/**
 * Compile-time XOR enforcement check for `PrimeButtonAddon`.
 *
 * The reviewer flagged uncertainty about whether `preset` / `actionRef` /
 * `action` were independently optional. They aren't — the click axis is a
 * discriminated union with `?: never` on each variant's other slots. These
 * `@ts-expect-error` lines fail the build if the XOR ever regresses.
 *
 * Each `@ts-expect-error` sits on the line BEFORE the offending `const`
 * declaration: TypeScript reports the union-incompatibility error against
 * the object literal as a whole, not against the property line within it.
 *
 * Type-only file: no runtime emit. Vitest is happy to skip it.
 */
import type { PrimeButtonAddon } from './addons';

// ============================================================================
// Click-axis XOR — at most one of preset / actionRef / action
// ============================================================================

// Valid: preset only.
const _presetOnly: PrimeButtonAddon = {
  kind: 'prime-button',
  slot: 'suffix',
  icon: 'times',
  ariaLabel: 'Clear',
  preset: 'clear',
};

// Valid: actionRef only.
const _actionRefOnly: PrimeButtonAddon = {
  kind: 'prime-button',
  slot: 'suffix',
  icon: 'send',
  ariaLabel: 'Send',
  actionRef: 'mySendHandler',
};

// Valid: action only.
const _actionOnly: PrimeButtonAddon = {
  kind: 'prime-button',
  slot: 'suffix',
  icon: 'send',
  ariaLabel: 'Send',
  action: () => undefined,
};

// Valid: none — decorative.
const _noClickVariant: PrimeButtonAddon = {
  kind: 'prime-button',
  slot: 'suffix',
  icon: 'send',
  ariaLabel: 'Send',
};

// Invalid: preset + actionRef.
// @ts-expect-error XOR: at most one of preset / actionRef / action may be set.
const _presetPlusActionRef: PrimeButtonAddon = {
  kind: 'prime-button',
  slot: 'suffix',
  icon: 'times',
  ariaLabel: 'Clear',
  preset: 'clear',
  actionRef: 'somehandler',
};

// Invalid: preset + action.
// @ts-expect-error XOR: at most one of preset / actionRef / action may be set.
const _presetPlusAction: PrimeButtonAddon = {
  kind: 'prime-button',
  slot: 'suffix',
  icon: 'times',
  ariaLabel: 'Clear',
  preset: 'clear',
  action: () => undefined,
};

// Invalid: actionRef + action.
// @ts-expect-error XOR: at most one of preset / actionRef / action may be set.
const _actionRefPlusAction: PrimeButtonAddon = {
  kind: 'prime-button',
  slot: 'suffix',
  icon: 'send',
  ariaLabel: 'Send',
  actionRef: 'mySendHandler',
  action: () => undefined,
};

// ============================================================================
// Content-axis XOR — icon-only requires ariaLabel
// ============================================================================

// Invalid: icon without label OR ariaLabel.
// @ts-expect-error icon-only buttons must carry an accessible label.
const _iconWithoutLabelOrAria: PrimeButtonAddon = {
  kind: 'prime-button',
  slot: 'suffix',
  icon: 'times',
};

// Suppress "declared but never read".
void _presetOnly;
void _actionRefOnly;
void _actionOnly;
void _noClickVariant;
void _presetPlusActionRef;
void _presetPlusAction;
void _actionRefPlusAction;
void _iconWithoutLabelOrAria;
