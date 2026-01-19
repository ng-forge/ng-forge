import PageFieldComponent from './page-field.component';
import { PageField, validatePageNesting } from '../../definitions/default/page-field';
import { setupSimpleTest } from '../../../../testing/src/simple-test-utils';

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
  });
});
