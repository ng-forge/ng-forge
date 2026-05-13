import { NgForgeAction, NG_FORGE_ACTION_INPUTS } from './ng-forge-action.directive';
import { NgForgeFieldShell, NG_FORGE_FIELD_SHELL_INPUTS } from './ng-forge-field-shell.directive';
import { NgForgeField, NG_FORGE_VALUE_FIELD_INPUTS } from './ng-forge-field.directive';

/**
 * Shell-only preset. Use for ng-forge component shapes that don't fit value or
 * action — e.g. future container primitives that only need the universal
 * identity bindings (`[id]`, `[attr.data-testid]`, `[class]`) without
 * value/validation or event-dispatch plumbing.
 *
 * @example
 * ```ts
 * \@Component({ hostDirectives: NG_FORGE_SHELL, ... })
 * ```
 */
export const NG_FORGE_SHELL = [{ directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] }];

/**
 * Value-bearing field preset. Composes `NgForgeFieldShell` (universal
 * identity) with `NgForgeField` (value + validation + aria + meta-tracking).
 * The canonical authoring shape for input / textarea / select / radio /
 * checkbox / toggle / multi-checkbox / slider / datepicker components.
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: NG_FORGE_FIELD,
 *   template: `...`,
 * })
 * export class MyInputField {
 *   protected readonly ngf = injectNgForgeField<string>();
 * }
 * ```
 */
export const NG_FORGE_FIELD = [
  { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
  { directive: NgForgeField, inputs: [...NG_FORGE_VALUE_FIELD_INPUTS] },
];

/**
 * Action / button preset. Composes `NgForgeFieldShell` (universal identity)
 * with `NgForgeAction` (event dispatch + aria-disabled). The canonical
 * authoring shape for button / submit / next / previous / array-mutation
 * components.
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: NG_FORGE_ACTION,
 *   template: `<button (click)="action.dispatch()">{{ action.label() }}</button>`,
 * })
 * export class MyButton {
 *   protected readonly action = inject(NgForgeAction);
 * }
 * ```
 */
export const NG_FORGE_ACTION = [
  { directive: NgForgeFieldShell, inputs: [...NG_FORGE_FIELD_SHELL_INPUTS] },
  { directive: NgForgeAction, inputs: [...NG_FORGE_ACTION_INPUTS] },
];
