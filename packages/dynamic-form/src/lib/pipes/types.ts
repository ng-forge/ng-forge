import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Union type for dynamic text values that can be resolved asynchronously
 */
export type DynamicText = string | Observable<string> | Signal<string>;
