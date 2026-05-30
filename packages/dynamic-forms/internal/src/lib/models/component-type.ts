import { Signal } from '@angular/core';

export type WithInputSignals<T> = {
  readonly [K in keyof T]-?: Signal<T[K]>;
};
