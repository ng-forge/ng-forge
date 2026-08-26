import PageFieldComponent from './page-field.component';
import { PageField, validatePageNesting } from '@ng-forge/dynamic-forms/internal';
import { setupSimpleTest } from '../../../../test-utils/src/simple-test-utils';
import { TestBed } from '@angular/core/testing';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { ActivePageInitializedEvent } from '../../events/constants/active-page-initialized.event';
import { delay } from '@ng-forge/utils';
import { createPropertyOverrideStore, PROPERTY_OVERRIDE_STORE } from '../../core/property-derivation/property-override-store';

describe('PageFieldComponent', () => {
  it('should create', () => {
    const field: PageField<never[]> = {
      key: 'test-page',
      type: 'page',
      fields: [],
    };

    const { component } = setupSimpleTest(PageFieldComponent, { field, pageIndex: 0, isVisible: true });
    expect(component).toBeDefined();
    expect(component).toBeInstanceOf(PageFieldComponent);
  });

  it('should have field input property', () => {
    const field: PageField<never[]> = {
      key: 'test-page',
      type: 'page',
      label: 'Test Page',
      fields: [],
    };

    const { component } = setupSimpleTest(PageFieldComponent, { field, pageIndex: 0, isVisible: true });
    expect(component.field()).toEqual(field);
  });

  it('should handle disabled state', () => {
    const field: PageField<never[]> = {
      key: 'test-page',
      type: 'page',
      disabled: true,
      fields: [],
    };

    const { component } = setupSimpleTest(PageFieldComponent, { field, pageIndex: 0, isVisible: true });
    expect(component.disabled()).toBe(true);
  });

  it('emits active-page readiness after the visible page fields render', async () => {
    const field: PageField<any> = {
      key: 'test-page',
      type: 'page',
      fields: [{ key: 'name', type: 'test' }],
    };
    TestBed.configureTestingModule({
      providers: [{ provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore }],
    });
    const { fixture } = setupSimpleTest(PageFieldComponent, { field, pageIndex: 2, isVisible: true });
    const eventBus = TestBed.inject(EventBus);
    const events: ActivePageInitializedEvent[] = [];
    eventBus.on<ActivePageInitializedEvent>('active-page-initialized').subscribe((event) => events.push(event));

    await delay(0);
    fixture.detectChanges();
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(events).toEqual([new ActivePageInitializedEvent(2, 'test-page')]);

    fixture.detectChanges();
    TestBed.flushEffects();
    expect(events).toHaveLength(1);

    fixture.componentRef.setInput('isVisible', false);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.componentRef.setInput('isVisible', true);
    fixture.detectChanges();
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(events).toEqual([new ActivePageInitializedEvent(2, 'test-page'), new ActivePageInitializedEvent(2, 'test-page')]);
  });

  it('emits active-page readiness when an empty page becomes visible', async () => {
    const field: PageField<never[]> = {
      key: 'empty-page',
      type: 'page',
      fields: [],
    };
    const { fixture } = setupSimpleTest(PageFieldComponent, { field, pageIndex: 0, isVisible: false });
    const eventBus = TestBed.inject(EventBus);
    const events: ActivePageInitializedEvent[] = [];
    eventBus.on<ActivePageInitializedEvent>('active-page-initialized').subscribe((event) => events.push(event));

    fixture.componentRef.setInput('isVisible', true);
    await delay(0);
    fixture.detectChanges();
    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(events).toEqual([new ActivePageInitializedEvent(0, 'empty-page')]);
  });

  it('should validate page nesting and prevent nested pages', () => {
    const validField: PageField<never[]> = {
      key: 'valid-page',
      type: 'page',
      fields: [],
    };

    const { component } = setupSimpleTest(PageFieldComponent, { field: validField, pageIndex: 0, isVisible: true });
    expect(component.isValid()).toBe(true);

    // Test validation logic directly since we can't set up multiple TestBed instances
    expect(validatePageNesting(validField)).toBe(true);

    const invalidField: PageField<any> = {
      key: 'invalid-page',
      type: 'page',
      fields: [{ key: 'nested-page', type: 'page', fields: [] }],
    };

    expect(validatePageNesting(invalidField)).toBe(false);
  });
});

// Test the standalone validation functions
describe('PageField validation functions', () => {
  describe('validatePageNesting', () => {
    it('should return true for page with no nested pages', () => {
      const pageField: PageField<any> = {
        key: 'valid-page',
        type: 'page',
        fields: [
          { key: 'input1', type: 'input' },
          { key: 'checkbox1', type: 'checkbox' },
        ],
      };

      expect(validatePageNesting(pageField)).toBe(true);
    });

    it('should return true for page with row/group containing non-page fields', () => {
      const pageField: PageField<any> = {
        key: 'valid-page',
        type: 'page',
        fields: [
          {
            key: 'row1',
            type: 'row',
            fields: [
              { key: 'input1', type: 'input' },
              { key: 'input2', type: 'input' },
            ],
          },
          {
            key: 'group1',
            type: 'group',
            fields: [{ key: 'select1', type: 'select' }],
          },
        ],
      };

      expect(validatePageNesting(pageField)).toBe(true);
    });

    it('should return false for page with direct nested page', () => {
      const pageField: PageField<any> = {
        key: 'invalid-page',
        type: 'page',
        fields: [{ key: 'nested-page', type: 'page', fields: [] }],
      };

      expect(validatePageNesting(pageField)).toBe(false);
    });

    it('should return false for page with nested page inside row', () => {
      const pageField: PageField<any> = {
        key: 'invalid-page',
        type: 'page',
        fields: [
          {
            key: 'row1',
            type: 'row',
            fields: [{ key: 'nested-page', type: 'page', fields: [] }],
          },
        ],
      };

      expect(validatePageNesting(pageField)).toBe(false);
    });

    it('should return false for page with nested page inside group', () => {
      const pageField: PageField<any> = {
        key: 'invalid-page',
        type: 'page',
        fields: [
          {
            key: 'group1',
            type: 'group',
            fields: [{ key: 'nested-page', type: 'page', fields: [] }],
          },
        ],
      };

      expect(validatePageNesting(pageField)).toBe(false);
    });

    it('should return false for deeply nested pages', () => {
      const pageField: PageField<any> = {
        key: 'invalid-page',
        type: 'page',
        fields: [
          {
            key: 'group1',
            type: 'group',
            fields: [
              {
                key: 'row1',
                type: 'row',
                fields: [{ key: 'nested-page', type: 'page', fields: [] }],
              },
            ],
          },
        ],
      };

      expect(validatePageNesting(pageField)).toBe(false);
    });

    it('should return false for page with nested page inside container', () => {
      const pageField: PageField<any> = {
        key: 'invalid-page',
        type: 'page',
        fields: [
          {
            key: 'container1',
            type: 'container',
            wrappers: [],
            fields: [{ key: 'nested-page', type: 'page', fields: [] }],
          },
        ],
      };

      expect(validatePageNesting(pageField)).toBe(false);
    });

    it('should return false for nested page inside container wrapping a row', () => {
      const pageField: PageField<any> = {
        key: 'invalid-page',
        type: 'page',
        fields: [
          {
            key: 'container1',
            type: 'container',
            wrappers: [],
            fields: [
              {
                key: 'row1',
                type: 'row',
                fields: [{ key: 'nested-page', type: 'page', fields: [] }],
              },
            ],
          },
        ],
      };

      expect(validatePageNesting(pageField)).toBe(false);
    });

    it('should return false for nested page inside row wrapping a container', () => {
      const pageField: PageField<any> = {
        key: 'invalid-page',
        type: 'page',
        fields: [
          {
            key: 'row1',
            type: 'row',
            fields: [
              {
                key: 'container1',
                type: 'container',
                wrappers: [],
                fields: [{ key: 'nested-page', type: 'page', fields: [] }],
              },
            ],
          },
        ],
      };

      expect(validatePageNesting(pageField)).toBe(false);
    });

    it('should return true for page with container holding only leaf fields', () => {
      const pageField: PageField<any> = {
        key: 'valid-page',
        type: 'page',
        fields: [
          {
            key: 'container1',
            type: 'container',
            wrappers: [],
            fields: [
              { key: 'input1', type: 'input' },
              { key: 'input2', type: 'input' },
            ],
          },
        ],
      };

      expect(validatePageNesting(pageField)).toBe(true);
    });
  });
});
