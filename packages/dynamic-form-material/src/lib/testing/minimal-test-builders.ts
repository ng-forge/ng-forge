import { FieldOption } from '@ng-forge/dynamic-form';
import { MaterialFormTestUtils } from './material-test-utils';

/**
 * MINIMAL TEST DATA BUILDERS
 *
 * Philosophy: Only create what you're testing
 *
 * Benefits:
 * - Clear intent (builder name matches test purpose)
 * - Fast execution (no unnecessary fields/data)
 * - Reusable (consistent patterns across tests)
 * - Maintainable (change in one place)
 */

export class MinimalTestBuilder {
  /**
   * Absolute minimum: single field with default config
   * Use when testing framework basics, not specific properties
   */
  static minimal(fieldType: 'input' | 'select' | 'checkbox' | 'textarea' | 'slider' | 'datepicker' = 'input') {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: fieldType }).build();

    const initialValue = { field: this.getDefaultValue(fieldType) };

    return { config, initialValue };
  }

  /**
   * Single input field with specific type attribute
   * Use when testing input type rendering (email, password, number, etc.)
   */
  static withInputType(type: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel') {
    const config = MaterialFormTestUtils.builder().matInputField({ key: 'field', props: { type } }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field with label
   * Use when testing label rendering
   */
  static withLabel(label: string, fieldType: 'input' | 'select' | 'checkbox' = 'input') {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: fieldType, label }).build();

    return { config, initialValue: { field: this.getDefaultValue(fieldType) } };
  }

  /**
   * Single field with placeholder
   * Use when testing placeholder attribute
   */
  static withPlaceholder(placeholder: string, fieldType: 'input' | 'textarea' = 'input') {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: fieldType, placeholder }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field with hint text
   * Use when testing hint/help text rendering
   */
  static withHint(hint: string) {
    const config = MaterialFormTestUtils.builder().matInputField({ key: 'field', props: { hint } }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field with Material appearance
   * Use when testing Material-specific styling
   */
  static withAppearance(appearance: 'fill' | 'outline') {
    const config = MaterialFormTestUtils.builder().matInputField({ key: 'field', props: { appearance } }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field with tabIndex
   * Use when testing tab order
   */
  static withTabIndex(tabIndex: number, fieldType: 'input' | 'textarea' = 'input') {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: fieldType, tabIndex }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field with custom CSS class
   * Use when testing custom styling
   */
  static withClassName(className: string, fieldType: 'input' | 'textarea' = 'input') {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: fieldType, className }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field marked as required
   * Use when testing required validation
   */
  static withRequired(required = true, fieldType: 'input' | 'textarea' = 'input') {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: fieldType, required }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field with disabled state
   * Use when testing disabled behavior
   */
  static withDisabled(disabled = true) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'input', disabled }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field with initial value
   * Use when testing value binding and updates
   */
  static withValue(value: string | number | boolean) {
    const config = MaterialFormTestUtils.builder().matInputField({ key: 'field' }).build();

    return { config, initialValue: { field: value } };
  }

  /**
   * Multiple fields of same type
   * Use when testing multiple field rendering or interaction
   */
  static withMultipleFields(count: number, fieldType: 'input' | 'select' | 'checkbox' = 'input') {
    const builder = MaterialFormTestUtils.builder();

    const fields: Array<{ key: string; value: string | number | boolean | null }> = [];
    for (let i = 0; i < count; i++) {
      const key = `field${i}`;
      builder.field({ key, type: fieldType });
      fields.push({ key, value: this.getDefaultValue(fieldType) });
    }

    const config = builder.build();
    const initialValue = fields.reduce((acc, f) => ({ ...acc, [f.key]: f.value }), {} as Record<string, string | number | boolean | null>);

    return { config, initialValue };
  }

  /**
   * Get default value for field type
   */
  private static getDefaultValue(fieldType: string): string | number | boolean | null {
    switch (fieldType) {
      case 'checkbox':
        return false;
      case 'slider':
        return 0;
      case 'select':
        return null;
      default:
        return '';
    }
  }

  // ========================================
  // TEXTAREA-SPECIFIC BUILDERS
  // ========================================

  /**
   * Single textarea with rows attribute
   * Use when testing textarea rows configuration
   */
  static withRows(rows: number) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'textarea', props: { rows } }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single textarea with cols attribute
   * Use when testing textarea columns configuration
   */
  static withCols(cols: number) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'textarea', props: { cols } }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single textarea with maxLength attribute
   * Use when testing maxlength validation
   */
  static withMaxLength(maxLength: number) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'textarea', props: { maxLength } }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single textarea with resize style
   * Use when testing textarea resize behavior
   */
  static withResize(resize: 'none' | 'both' | 'horizontal' | 'vertical') {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'textarea', props: { resize } }).build();

    return { config, initialValue: { field: '' } };
  }

  // ========================================
  // SELECT-SPECIFIC BUILDERS
  // ========================================

  /**
   * Single select with simple options
   * Use when testing basic select rendering
   */
  static withSelectOptions(options: FieldOption[]) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'select', options }).build();

    return { config, initialValue: { field: null } };
  }

  /**
   * Single select with disabled option
   * Use when testing option disabled state
   */
  static withDisabledOption() {
    const config = MaterialFormTestUtils.builder()
      .field({
        key: 'field',
        type: 'select',
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2', disabled: true },
          { label: 'Option 3', value: '3' },
        ],
      })
      .build();

    return { config, initialValue: { field: null } };
  }

  /**
   * Single multi-select
   * Use when testing multiple selection
   */
  static withMultiSelect() {
    const config = MaterialFormTestUtils.builder()
      .field({
        key: 'field',
        type: 'select',
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
        props: { multiple: true },
      })
      .build();

    return { config, initialValue: { field: [] } };
  }

  // ========================================
  // MULTI-CHECKBOX-SPECIFIC BUILDERS
  // ========================================

  /**
   * Single multi-checkbox with options
   * Use when testing checkbox group rendering
   */
  static withCheckboxOptions(options: FieldOption[]) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'multi-checkbox', options }).build();

    return { config, initialValue: { field: [] } };
  }

  /**
   * Multi-checkbox with disabled option
   * Use when testing disabled option state
   */
  static withDisabledCheckboxOption() {
    const config = MaterialFormTestUtils.builder()
      .field({
        key: 'field',
        type: 'multi-checkbox',
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2', disabled: true },
          { label: 'Option 3', value: '3' },
        ],
      })
      .build();

    return { config, initialValue: { field: [] } };
  }

  /**
   * Multi-checkbox with color
   * Use when testing Material color theme
   */
  static withCheckboxColor(color: 'primary' | 'accent' | 'warn') {
    const config = MaterialFormTestUtils.builder()
      .field({
        key: 'field',
        type: 'multi-checkbox',
        options: [{ label: 'Option 1', value: '1' }],
        props: { color },
      })
      .build();

    return { config, initialValue: { field: [] } };
  }

  /**
   * Multi-checkbox with label position
   * Use when testing checkbox label positioning
   */
  static withCheckboxLabelPosition(labelPosition: 'before' | 'after') {
    const config = MaterialFormTestUtils.builder()
      .field({
        key: 'field',
        type: 'multi-checkbox',
        options: [{ label: 'Option 1', value: '1' }],
        props: { labelPosition },
      })
      .build();

    return { config, initialValue: { field: [] } };
  }
}

/**
 * USAGE EXAMPLES:
 *
 * // Test input type rendering
 * it('should render email type', async () => {
 *   const { config, initialValue } = MinimalTestBuilder.withInputType('email');
 *   const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });
 *   // Assert type attribute
 * });
 *
 * // Test label rendering
 * it('should render label', async () => {
 *   const { config, initialValue } = MinimalTestBuilder.withLabel('Email Address');
 *   const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });
 *   // Assert label text
 * });
 *
 * // Test multiple fields
 * it('should render 5 inputs', async () => {
 *   const { config, initialValue } = MinimalTestBuilder.withMultipleFields(5);
 *   const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });
 *   // Assert count
 * });
 */
