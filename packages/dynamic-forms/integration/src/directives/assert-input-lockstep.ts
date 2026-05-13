import type { InputSignal, InputSignalWithTransform } from '@angular/core';

/** Property names on `T` whose values are `input()` / `input.required()` signals. `any` is required for conditional-type variance. */
 
export type InputSignalProps<T> = {
  [K in keyof T]: T[K] extends InputSignal<any> | InputSignalWithTransform<any, any> ? K : never;
}[keyof T];

export type MissingFromTuple<Dir, Tuple extends readonly string[]> = Exclude<InputSignalProps<Dir>, Tuple[number]>;
export type ExtraInTuple<Dir, Tuple extends readonly string[]> = Exclude<Tuple[number], InputSignalProps<Dir>>;

/** Resolves to `true` when `Tuple` exactly matches `Dir`'s declared inputs; otherwise a branded error type that surfaces the diff at the assertion site. */
export type AssertTupleLockstep<Dir, Tuple extends readonly string[], Label extends string> = [MissingFromTuple<Dir, Tuple>] extends [never]
  ? [ExtraInTuple<Dir, Tuple>] extends [never]
    ? true
    : { [K in `${Label} contains entries that are not declared inputs on the directive`]: ExtraInTuple<Dir, Tuple> }
  : { [K in `${Label} is MISSING declared directive inputs`]: MissingFromTuple<Dir, Tuple> };
