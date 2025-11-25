import { Observable } from 'rxjs';
import { Signal } from '@angular/core';

export type DynamicText = string | Observable<string> | Signal<string>;
