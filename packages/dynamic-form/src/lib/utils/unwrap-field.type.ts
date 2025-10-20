import { InputSignal } from '@angular/core';

export type UnwrapField<T> = T extends InputSignal<infer U>
  ? UnwrapField<U>
  : T extends readonly any[]
  ? T
  : T extends () => unknown
  ? T
  : T extends object
  ? { [K in keyof T]: UnwrapField<T[K]> }
  : T;
