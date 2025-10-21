// Type declaration for @angular/core/rxjs-interop module
// This resolves module resolution issues in Jest testing environment
declare module '@angular/core/rxjs-interop' {
  import type { OutputEmitterRef } from '@angular/core';
  import type { Observable } from 'rxjs';

  export function outputFromObservable<T>(observable: Observable<T>): OutputEmitterRef<T>;
}
