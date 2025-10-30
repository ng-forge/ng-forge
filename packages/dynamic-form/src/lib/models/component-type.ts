import { Signal } from '@angular/core';

export type WithInputSignals<T> = {
  readonly [K in keyof T]-?: T[K] extends readonly unknown[]
    ? Signal<T[K]>
    : T[K] extends object
    ? Signal<WithInputSignals<T[K]>>
    : Signal<T[K]>;
};
