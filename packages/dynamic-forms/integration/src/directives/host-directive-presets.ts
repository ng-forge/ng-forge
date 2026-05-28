import { Directive } from '@angular/core';
import { NgForgeAction, NG_FORGE_ACTION_INPUTS } from './ng-forge-action.directive';
import { NgForgeFieldShell, NG_FORGE_FIELD_SHELL_INPUTS } from './ng-forge-field-shell.directive';
import { NgForgeField, NG_FORGE_VALUE_FIELD_INPUTS } from './ng-forge-field.directive';

/**
 * Value-bearing field host wrapper. Composes `NgForgeFieldShell` (universal
 * identity) with `NgForgeField` (value + validation + aria + meta-tracking)
 * in a single host-directive entry, so consumer components compose just one
 * directive instead of two.
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
 */
@Directive({
  hostDirectives: [
    { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
    { directive: NgForgeAction, inputs: [...NG_FORGE_ACTION_INPUTS] },
  ],
})
export class NgForgeActionHost {}
