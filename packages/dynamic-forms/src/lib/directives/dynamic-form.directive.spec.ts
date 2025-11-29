import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component, ComponentRef, ElementRef, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FieldRendererDirective } from './dynamic-form.directive';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'test-host',
  template: '<form [fieldRenderer]="fields()"></form>',
  imports: [FieldRendererDirective],
})
class TestHostComponent {
  fields = signal<ComponentRef<any>[] | null>(null);
}

describe('FieldRendererDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let formElement: HTMLFormElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, FieldRendererDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    formElement = fixture.nativeElement.querySelector('form');
    fixture.detectChanges();
  });

  function createMockComponentRef(id = 'field'): ComponentRef<any> {
    const element = document.createElement('div');
    element.setAttribute('data-field-id', id);
    element.textContent = id;

    return {
      location: {
        nativeElement: element,
      },
      destroy: vi.fn(),
    } as any;
  }

  describe('basic rendering', () => {
    it('should render single field component', () => {
      const field = createMockComponentRef('field1');

      component.fields.set([field]);
      fixture.detectChanges();

      expect(formElement.querySelector('[data-field-id="field1"]')).toBeTruthy();
    });

    it('should render multiple field components', () => {
      const fields = [createMockComponentRef('field1'), createMockComponentRef('field2'), createMockComponentRef('field3')];

      component.fields.set(fields);
      fixture.detectChanges();

      expect(formElement.querySelector('[data-field-id="field1"]')).toBeTruthy();
      expect(formElement.querySelector('[data-field-id="field2"]')).toBeTruthy();
      expect(formElement.querySelector('[data-field-id="field3"]')).toBeTruthy();
    });

    it('should append fields to form element', () => {
      const field = createMockComponentRef('field1');

      component.fields.set([field]);
      fixture.detectChanges();

      const renderedField = formElement.querySelector('[data-field-id="field1"]');
      expect(renderedField?.parentElement).toBe(formElement);
    });

    it('should preserve field order', () => {
      const fields = [createMockComponentRef('field1'), createMockComponentRef('field2'), createMockComponentRef('field3')];

      component.fields.set(fields);
      fixture.detectChanges();

      const renderedFields = Array.from(formElement.querySelectorAll('[data-field-id]'));
      expect(renderedFields[0].getAttribute('data-field-id')).toBe('field1');
      expect(renderedFields[1].getAttribute('data-field-id')).toBe('field2');
      expect(renderedFields[2].getAttribute('data-field-id')).toBe('field3');
    });
  });

  describe('clearing fields', () => {
    it('should clear fields when input becomes null', () => {
      const field = createMockComponentRef('field1');

      component.fields.set([field]);
      fixture.detectChanges();

      expect(formElement.querySelector('[data-field-id="field1"]')).toBeTruthy();

      component.fields.set(null);
      fixture.detectChanges();

      expect(formElement.querySelector('[data-field-id="field1"]')).toBeNull();
    });

    it('should clear fields when input becomes empty array', () => {
      const field = createMockComponentRef('field1');

      component.fields.set([field]);
      fixture.detectChanges();

      expect(formElement.querySelector('[data-field-id="field1"]')).toBeTruthy();

      component.fields.set([]);
      fixture.detectChanges();

      expect(formElement.querySelector('[data-field-id="field1"]')).toBeNull();
    });

    it('should clear all previously rendered fields', () => {
      const fields = [createMockComponentRef('field1'), createMockComponentRef('field2'), createMockComponentRef('field3')];

      component.fields.set(fields);
      fixture.detectChanges();

      component.fields.set([]);
      fixture.detectChanges();

      expect(formElement.querySelector('[data-field-id="field1"]')).toBeNull();
      expect(formElement.querySelector('[data-field-id="field2"]')).toBeNull();
      expect(formElement.querySelector('[data-field-id="field3"]')).toBeNull();
    });
  });

  describe('re-rendering', () => {
    it('should replace fields when input changes', () => {
      const field1 = createMockComponentRef('field1');
      component.fields.set([field1]);
      fixture.detectChanges();

      const field2 = createMockComponentRef('field2');
      component.fields.set([field2]);
      fixture.detectChanges();

      expect(formElement.querySelector('[data-field-id="field1"]')).toBeNull();
      expect(formElement.querySelector('[data-field-id="field2"]')).toBeTruthy();
    });

    it('should clear old fields before rendering new ones', () => {
      const fields1 = [createMockComponentRef('field1'), createMockComponentRef('field2')];
      component.fields.set(fields1);
      fixture.detectChanges();

      const fields2 = [createMockComponentRef('field3')];
      component.fields.set(fields2);
      fixture.detectChanges();

      expect(formElement.querySelectorAll('[data-field-id]')).toHaveLength(1);
      expect(formElement.querySelector('[data-field-id="field3"]')).toBeTruthy();
    });

    it('should handle multiple re-renders', () => {
      component.fields.set([createMockComponentRef('v1')]);
      fixture.detectChanges();

      component.fields.set([createMockComponentRef('v2')]);
      fixture.detectChanges();

      component.fields.set([createMockComponentRef('v3')]);
      fixture.detectChanges();

      expect(formElement.querySelectorAll('[data-field-id]')).toHaveLength(1);
      expect(formElement.querySelector('[data-field-id="v3"]')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle null fields gracefully', () => {
      component.fields.set(null);
      fixture.detectChanges();

      expect(formElement.children.length).toBe(0);
    });

    it('should handle empty array gracefully', () => {
      component.fields.set([]);
      fixture.detectChanges();

      expect(formElement.children.length).toBe(0);
    });

    it('should handle field without location', () => {
      const invalidField = { location: null } as any;

      expect(() => {
        component.fields.set([invalidField]);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should skip field with invalid location nativeElement', () => {
      const invalidField = { location: { nativeElement: null } } as any;
      const validField = createMockComponentRef('field1');

      component.fields.set([invalidField, validField]);
      fixture.detectChanges();

      // Only the valid field should be rendered
      expect(formElement.querySelectorAll('[data-field-id]')).toHaveLength(1);
      expect(formElement.querySelector('[data-field-id="field1"]')).toBeTruthy();
    });

    it('should skip null/undefined fields in array', () => {
      const field = createMockComponentRef('field1');

      component.fields.set([field, null as any, undefined as any]);
      fixture.detectChanges();

      expect(formElement.querySelectorAll('[data-field-id]')).toHaveLength(1);
      expect(formElement.querySelector('[data-field-id="field1"]')).toBeTruthy();
    });
  });

  // Note: fieldsInitialized output tests are omitted because afterNextRender()
  // does not fire in the Vitest test environment, making these tests unreliable.
  // The output functionality is tested through integration tests in a real browser environment.

  describe('cleanup on destroy', () => {
    it('should remove all fields from DOM on destroy', () => {
      const fields = [createMockComponentRef('field1'), createMockComponentRef('field2')];

      component.fields.set(fields);
      fixture.detectChanges();

      expect(formElement.querySelectorAll('[data-field-id]')).toHaveLength(2);

      fixture.destroy();

      expect(formElement.querySelectorAll('[data-field-id]')).toHaveLength(0);
    });

    it('should not throw when destroying with no rendered fields', () => {
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });

    it('should handle destroy after fields were already cleared', () => {
      const field = createMockComponentRef('field1');

      component.fields.set([field]);
      fixture.detectChanges();

      component.fields.set([]);
      fixture.detectChanges();

      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });

  describe('DOM manipulation', () => {
    it('should only remove fields that are still children of form', () => {
      const field1 = createMockComponentRef('field1');
      const field2 = createMockComponentRef('field2');

      component.fields.set([field1, field2]);
      fixture.detectChanges();

      // Manually remove field1 from DOM
      const element = formElement.querySelector('[data-field-id="field1"]');
      if (element) {
        element.remove();
      }

      // Should not throw when clearing
      expect(() => {
        component.fields.set([]);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should preserve other form content', () => {
      const otherElement = document.createElement('div');
      otherElement.setAttribute('data-other', 'true');
      formElement.appendChild(otherElement);

      const field = createMockComponentRef('field1');
      component.fields.set([field]);
      fixture.detectChanges();

      component.fields.set([]);
      fixture.detectChanges();

      expect(formElement.querySelector('[data-other="true"]')).toBeTruthy();
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid field updates', () => {
      for (let i = 0; i < 10; i++) {
        component.fields.set([createMockComponentRef(`field${i}`)]);
        fixture.detectChanges();
      }

      expect(formElement.querySelectorAll('[data-field-id]')).toHaveLength(1);
      expect(formElement.querySelector('[data-field-id="field9"]')).toBeTruthy();
    });

    it('should handle large number of fields', () => {
      const fields = Array.from({ length: 100 }, (_, i) => createMockComponentRef(`field${i}`));

      component.fields.set(fields);
      fixture.detectChanges();

      expect(formElement.querySelectorAll('[data-field-id]')).toHaveLength(100);
    });
  });
});
