import { InjectionToken } from '@angular/core';
import { FieldDef } from '../definitions';
import { MapperFn } from '../mappers';

export interface FieldTypeDefinition<T extends FieldDef<Record<string, unknown>> = any> {
  name: string;
  _fieldDef?: T;
  loadComponent?: () => Promise<any>;
  mapper: MapperFn<T>;
}

// Field Registry injection token
export const FIELD_REGISTRY = new InjectionToken<Map<string, FieldTypeDefinition>>('FIELD_REGISTRY', {
  providedIn: 'root',
  factory: () => new Map(),
});
