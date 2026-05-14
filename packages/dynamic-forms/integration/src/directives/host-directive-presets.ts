import { Directive } from '@angular/core';
import { NgForgeAction, NG_FORGE_ACTION_INPUTS } from './ng-forge-action.directive';
import { NgForgeFieldShell, NG_FORGE_FIELD_SHELL_INPUTS } from './ng-forge-field-shell.directive';
import { NgForgeField, NG_FORGE_VALUE_FIELD_INPUTS } from './ng-forge-field.directive';

/**
 * Value-bearing field host wrapper. Composes `NgForgeFieldShell` (universal
 * identity) with `NgForgeField` (value + validation + aria + meta-tracking)
 * in a single host-directive entry, so consumer components compose just one
 * directive instead of two.
 *
 * Why a directive instead of a `const` preset: cross-package partial
 * compilation can't resolve a const reference inside `hostDirectives:`, so
 * an exported const array doesn't work for library consumers. A wrapper
 * directive's own `hostDirectives` IS a literal at compile time (in this
 * file), so it works everywhere.
 *
 * Authoring shape for adapter components:
 * ```ts
 * \@Component({
 *   hostDirectives: [NgForgeFieldHost],
 *   ...
 * })
 * export class MyInputField {
 *   protected readonly ngf = injectNgForgeField<string>();
 * }
 * ```
 *
 * Pattern reference: Taiga UI uses the same wrapper-directive technique
 * for the same reason. See https://www.angularspace.com/host-directives-decomposition-unleashed/
 */
@Directive({
  hostDirectives: [
    { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
    { directive: NgForgeField, inputs: [...NG_FORGE_VALUE_FIELD_INPUTS] },
  ],
})
export class NgForgeFieldHost {}

/**
 * Action / button host wrapper. Composes `NgForgeFieldShell` with
 * `NgForgeAction` (event dispatch + aria-disabled) for button-shaped
 * components.
 *
 * Authoring shape:
 * ```ts
 * \@Component({
 *   hostDirectives: [NgForgeActionHost],
 *   ...
 * })
 * export class MyButton {
 *   protected readonly action = injectNgForgeAction();
 * }
 * ```
 */
@Directive({
  hostDirectives: [
    { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
    { directive: NgForgeAction, inputs: [...NG_FORGE_ACTION_INPUTS] },
  ],
})
export class NgForgeActionHost {}
