import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

/** Generic reactive value — a static value, an Angular Signal, or an RxJS Observable. */
export type DynamicValue<T> = T | Signal<T> | Observable<T>;
