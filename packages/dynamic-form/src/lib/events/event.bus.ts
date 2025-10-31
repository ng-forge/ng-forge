import { Injectable } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { FormEvent, FormEventConstructor } from './interfaces/form-event';
import { isArray } from 'lodash-es';

@Injectable()
export class EventBus {
  private pipeline$ = new Subject<FormEvent>();

  events$ = this.pipeline$.asObservable();

  dispatch<T extends FormEventConstructor>(eventConstructor: T): void {
    this.pipeline$.next(new eventConstructor());
  }

  subscribe<T extends FormEvent>(eventType: T['type']): Observable<T>;
  subscribe<T extends FormEvent>(eventType: Array<T['type']>): Observable<T>;
  subscribe<T extends FormEvent>(eventType: T['type'] | Array<T['type']>): Observable<T> {
    if (isArray(eventType)) {
      return this.pipeline$.pipe(filter((event): event is T => eventType.includes(event.type)));
    }

    return this.pipeline$.pipe(filter((event): event is T => event.type === eventType));
  }
}
