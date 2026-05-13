import { Directive, input } from '@angular/core';

/**
 * Base directive composed into every ng-forge component via `hostDirectives`.
 * Owns the universal identity inputs (`key`, `className`) and the host
 * bindings that every field shape — value-bearing, action, future container —
 * shares: `[id]`, `[attr.data-testid]`, `[class]`.
 *
 * Shape-specific add-ons (`NgForgeField` for value fields, `NgForgeAction`
 * for actions) inject this directive and read `key()` / `className()` from
 * it. Source-of-truth concerns like `hidden` / `disabled` live on the add-on
 * because they vary by shape (value fields derive from `field()()`; actions
 * receive direct inputs).
 *
 * Selectorless — usage is exclusively via `hostDirectives`. Prefer the
 * `NG_FORGE_FIELD` / `NG_FORGE_ACTION` presets rather than composing Shell
 * directly.
 */
@Directive({
  host: {
    '[id]': 'key()',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export class NgForgeFieldShell {
  readonly key = input.required<string>();
  readonly className = input<string>('');
}

/** Input names forwarded onto `NgForgeFieldShell` via `hostDirectives`. */
export const NG_FORGE_FIELD_SHELL_INPUTS = ['key', 'className'] as const;
