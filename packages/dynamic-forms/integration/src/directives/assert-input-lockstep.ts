import type { InputSignal, InputSignalWithTransform } from '@angular/core';

/**
 * Compile-time helper that extracts the property names of `T` whose values
 * are Angular `InputSignal<T>` or `InputSignalWithTransform<T, U>`. Used to
 * cross-check a forwarded-inputs tuple against a directive's declared inputs.
 *
 * `any` (rather than `unknown`) is required for conditional-type variance —
 * `unknown` is invariant in this position and would miss every `InputSignal<T>`
 * for non-unknown `T`.
 */

export type InputSignalProps<T> = {
  [K in keyof T]: T[K] extends InputSignal<any> | InputSignalWithTransform<any, any> ? K : never;
}[keyof T];

/** Names declared as inputs on `Dir` that the tuple `Tuple` is missing. */
export type MissingFromTuple<Dir, Tuple extends readonly string[]> = Exclude<InputSignalProps<Dir>, Tuple[number]>;

/** Names in the tuple `Tuple` that aren't declared inputs on `Dir`. */
export type ExtraInTuple<Dir, Tuple extends readonly string[]> = Exclude<Tuple[number], InputSignalProps<Dir>>;

/**
 * Resolves to `true` when `Tuple` exactly matches the declared `input()`
 * properties on `Dir`; otherwise resolves to a branded error type whose
 * message becomes the TypeScript error at the assertion site.
 *
 * Usage:
 * ```ts
 * const _LOCKSTEP: AssertTupleLockstep<MyDir, typeof MY_INPUTS, 'MY_INPUTS'> = true;
 * void _LOCKSTEP;
 * ```
 *
 * The `Label` parameter lets the error name the offending tuple explicitly
 * (e.g. "NG_FORGE_VALUE_FIELD_INPUTS contains entries that are not declared
 * inputs on NgForgeField"). Pass the tuple's variable name as a string
 * literal.
 */
export type AssertTupleLockstep<Dir, Tuple extends readonly string[], Label extends string> = [MissingFromTuple<Dir, Tuple>] extends [never]
  ? [ExtraInTuple<Dir, Tuple>] extends [never]
    ? true
    : { [K in `${Label} contains entries that are not declared inputs on the directive`]: ExtraInTuple<Dir, Tuple> }
  : { [K in `${Label} is MISSING declared directive inputs`]: MissingFromTuple<Dir, Tuple> };
