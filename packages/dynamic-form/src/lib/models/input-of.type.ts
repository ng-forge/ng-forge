import type { InputSignal } from '@angular/core';

/**
 * If the type `T` includes `null` or `undefined` then produce an InputSignal
 * that accepts `undefined` as well; otherwise produce an InputSignal<T>.
 */
export type InputOfType<T> = Extract<T, null | undefined> extends never ? InputSignal<T> : InputSignal<T | undefined>;
