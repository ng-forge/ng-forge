import { TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FieldRegistry } from './field-registry';
import { FieldTypeDefinition, FieldWrapperDefinition } from '../models/field-type';

@Component({
  selector: 'mock-input',
  template: '<input />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockInputComponent {}

@Component({
  selector: 'mock-select',
  template: '<select></select>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockSelectComponent {}

@Component({
  selector: 'mock-wrapper',
  template: '<div><ng-content></ng-content></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockWrapperComponent {}

describe('FieldRegistry', () => {
  let service: FieldRegistry;

  const mockInputType: FieldTypeDefinition = {
    name: 'input',
    component: MockInputComponent,
    defaultProps: {
      type: 'text',
      placeholder: 'Enter value'
    },
    validators: ['required'],
    wrappers: ['form-field']
  };

  const mockSelectType: FieldTypeDefinition = {
    name: 'select',
    component: MockSelectComponent,
    defaultProps: {
      multiple: false,
      options: []
    }
  };

  const mockEmailType: FieldTypeDefinition = {
    name: 'email',
    extends: 'input',
    defaultProps: {
      type: 'email'
    },
    validators: ['required', 'email']
  };

  const mockLazyType: FieldTypeDefinition = {
    name: 'lazy',
    loadComponent: () => Promise.resolve(MockInputComponent),
    defaultProps: {
      type: 'text'
    }
  };

  const mockWrapper: FieldWrapperDefinition = {
    name: 'form-field',
    component: MockWrapperComponent,
    priority: 10
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockInputComponent, MockSelectComponent, MockWrapperComponent],
      providers: [FieldRegistry]
    }).compileComponents();

    service = TestBed.inject(FieldRegistry);
  });

  afterEach(() => {
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerType', () => {
    it('should register a field type', () => {
      service.registerType(mockInputType);

      expect(service.hasType('input')).toBe(true);
      expect(service.getType('input')).toBe(mockInputType);
    });

    it('should warn when overwriting existing type', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      service.registerType(mockInputType);
      service.registerType(mockInputType);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Field type "input" is already registered. Overwriting.'
      );

      consoleSpy.mockRestore();
    });

    it('should handle type without component', () => {
      const typeWithoutComponent: FieldTypeDefinition = {
        name: 'custom',
        defaultProps: { label: 'Custom' }
      };

      service.registerType(typeWithoutComponent);

      expect(service.hasType('custom')).toBe(true);
      expect(service.getType('custom')).toBe(typeWithoutComponent);
    });
  });

  describe('registerTypes', () => {
    it('should register multiple types', () => {
      service.registerTypes([mockInputType, mockSelectType]);

      expect(service.hasType('input')).toBe(true);
      expect(service.hasType('select')).toBe(true);
      expect(service.getTypes()).toHaveLength(2);
    });

    it('should handle empty array', () => {
      service.registerTypes([]);

      expect(service.getTypes()).toHaveLength(0);
    });
  });

  describe('getType', () => {
    beforeEach(() => {
      service.registerTypes([mockInputType, mockEmailType]);
    });

    it('should return registered type', () => {
      const type = service.getType('input');
      expect(type).toBe(mockInputType);
    });

    it('should return undefined for unregistered type', () => {
      const type = service.getType('unknown');
      expect(type).toBeUndefined();
    });

    it('should resolve type inheritance', () => {
      const type = service.getType('email');

      expect(type).toEqual({
        name: 'email',
        extends: 'input',
        component: MockInputComponent,
        defaultProps: {
          type: 'email',
          placeholder: 'Enter value'
        },
        validators: ['required', 'required', 'email'], // Arrays are concatenated as expected
        wrappers: ['form-field']
      });
    });

    it('should handle missing parent type in inheritance', () => {
      const orphanType: FieldTypeDefinition = {
        name: 'orphan',
        extends: 'nonexistent'
      };

      service.registerType(orphanType);

      const type = service.getType('orphan');
      expect(type).toBe(orphanType);
    });
  });

  describe('loadTypeComponent', () => {
    it('should return component for eagerly loaded type', async () => {
      service.registerType(mockInputType);

      const component = await service.loadTypeComponent('input');
      expect(component).toBe(MockInputComponent);
    });

    it('should load and cache lazy component', async () => {
      service.registerType(mockLazyType);

      const component1 = await service.loadTypeComponent('lazy');
      const component2 = await service.loadTypeComponent('lazy');

      expect(component1).toBe(MockInputComponent);
      expect(component2).toBe(MockInputComponent);
      expect(component1).toBe(component2);
    });

    it('should throw error for unregistered type', async () => {
      await expect(service.loadTypeComponent('unknown'))
        .rejects.toThrow('Field type "unknown" is not registered');
    });

    it('should throw error for type without component or loadComponent', async () => {
      const invalidType: FieldTypeDefinition = {
        name: 'invalid',
        defaultProps: {}
      };

      service.registerType(invalidType);

      await expect(service.loadTypeComponent('invalid'))
        .rejects.toThrow('Field type "invalid" has no component or loadComponent function');
    });

    it('should handle lazy loading errors', async () => {
      const errorType: FieldTypeDefinition = {
        name: 'error',
        loadComponent: () => Promise.reject(new Error('Load failed'))
      };

      service.registerType(errorType);

      await expect(service.loadTypeComponent('error'))
        .rejects.toThrow('Failed to load component for field type "error": Error: Load failed');
    });
  });

  describe('wrapper management', () => {
    beforeEach(() => {
      service.registerWrapper(mockWrapper);
    });

    it('should register wrapper', () => {
      expect(service.hasWrapper('form-field')).toBe(true);
      expect(service.getWrapper('form-field')).toBe(mockWrapper);
    });

    it('should warn when overwriting existing wrapper', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      service.registerWrapper(mockWrapper);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Wrapper "form-field" is already registered. Overwriting.'
      );

      consoleSpy.mockRestore();
    });

    it('should register multiple wrappers', () => {
      const wrapper2: FieldWrapperDefinition = {
        name: 'panel',
        component: MockWrapperComponent,
        priority: 5
      };

      service.registerWrappers([wrapper2]);

      expect(service.hasWrapper('form-field')).toBe(true);
      expect(service.hasWrapper('panel')).toBe(true);
      expect(service.getWrappers()).toHaveLength(2);
    });

    it('should return wrappers sorted by priority (descending)', () => {
      const lowPriority: FieldWrapperDefinition = {
        name: 'low',
        component: MockWrapperComponent,
        priority: 1
      };

      const highPriority: FieldWrapperDefinition = {
        name: 'high',
        component: MockWrapperComponent,
        priority: 20
      };

      service.registerWrappers([lowPriority, highPriority]);

      const wrappers = service.getWrappers();
      expect(wrappers[0].name).toBe('high');
      expect(wrappers[1].name).toBe('form-field'); // priority 10
      expect(wrappers[2].name).toBe('low');
    });
  });

  describe('clear', () => {
    it('should clear all registrations', () => {
      service.registerType(mockInputType);
      service.registerWrapper(mockWrapper);

      service.clear();

      expect(service.getTypes()).toEqual([]);
      expect(service.getWrappers()).toEqual([]);
      expect(service.hasType('input')).toBe(false);
      expect(service.hasWrapper('form-field')).toBe(false);
    });
  });
});
