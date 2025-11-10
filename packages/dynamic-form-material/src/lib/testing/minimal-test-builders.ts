import { DynamicFormConfig } from '@ng-forge/dynamic-form';
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
  static withPlaceholder(placeholder: string) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'input', placeholder }).build();

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
  static withTabIndex(tabIndex: number) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'input', tabIndex }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field with custom CSS class
   * Use when testing custom styling
   */
  static withClassName(className: string) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'input', className }).build();

    return { config, initialValue: { field: '' } };
  }

  /**
   * Single field marked as required
   * Use when testing required validation
   */
  static withRequired(required = true) {
    const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'input', required }).build();

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

    const fields: Array<{ key: string; value: any }> = [];
    for (let i = 0; i < count; i++) {
      const key = `field${i}`;
      builder.field({ key, type: fieldType });
      fields.push({ key, value: this.getDefaultValue(fieldType) });
    }

    const config = builder.build();
    const initialValue = fields.reduce((acc, f) => ({ ...acc, [f.key]: f.value }), {});

    return { config, initialValue };
  }

  /**
   * Get default value for field type
   */
  private static getDefaultValue(fieldType: string): any {
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
