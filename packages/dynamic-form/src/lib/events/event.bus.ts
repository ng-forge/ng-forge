import { Injectable } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { Event } from './interfaces/event';
import { isArray } from 'lodash-es';

@Injectable()
export class EventBus {
  private pipeline$ = new Subject<Event>();

  events$ = this.pipeline$.asObservable();

  dispatch(event: Event): void {
    this.pipeline$.next(event);
  }

  subscribe<T extends Event>(eventType: T['type']): Observable<T>;
  subscribe<T extends Event>(eventType: Array<T['type']>): Observable<T>;
  subscribe<T extends Event>(eventType: T['type'] | Array<T['type']>): Observable<T> {
    if (isArray(eventType)) {
      return this.pipeline$.pipe(filter((event): event is T => eventType.includes(event.type)));
    }

    return this.pipeline$.pipe(filter((event): event is T => event.type === eventType));
  }
}
