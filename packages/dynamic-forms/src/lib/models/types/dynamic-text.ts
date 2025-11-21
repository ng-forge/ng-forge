import { Observable } from 'rxjs';
import { Signal } from '@angular/core';

/**
 * Union type for dynamic text values that can be resolved asynchronously
 */
export type DynamicText = string | Observable<string> | Signal<string>;
