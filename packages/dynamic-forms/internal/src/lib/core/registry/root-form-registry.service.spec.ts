import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { RootFormRegistryService } from './root-form-registry.service';

describe('RootFormRegistryService', () => {
  let service: RootFormRegistryService;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<FieldTree<Record<string, unknown>> | undefined>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } }],
    });

    service = TestBed.inject(RootFormRegistryService);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('formValue', () => {
    it('should return empty object when entity is empty', () => {
      expect(service.formValue()).toEqual({});
    });

    it('should return entity value', () => {
      const value = { name: 'Alice', email: 'alice@example.com' };
      mockEntity.set(value);

      expect(service.formValue()).toEqual(value);
    });

    it('should update reactively when entity changes', () => {
      mockEntity.set({ name: 'first' });
      expect(service.formValue()).toEqual({ name: 'first' });

      mockEntity.set({ name: 'second' });
      expect(service.formValue()).toEqual({ name: 'second' });
    });
  });

  describe('rootForm', () => {
    it('should return undefined when no form is set', () => {
      expect(service.rootForm()).toBeUndefined();
    });

    it('should return the form instance', () => {
      const mockForm = (() => ({})) as unknown as FieldTree<Record<string, unknown>>;
      mockFormSignal.set(mockForm);

      expect(service.rootForm()).toBe(mockForm);
    });

    it('should update reactively when form changes', () => {
      const form1 = (() => ({})) as unknown as FieldTree<Record<string, unknown>>;
      const form2 = (() => ({})) as unknown as FieldTree<Record<string, unknown>>;

      mockFormSignal.set(form1);
      expect(service.rootForm()).toBe(form1);

      mockFormSignal.set(form2);
      expect(service.rootForm()).toBe(form2);
    });
  });
});
