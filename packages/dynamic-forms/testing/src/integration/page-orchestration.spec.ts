import { TestBed } from '@angular/core/testing';
import { EventBus } from '../../events/event.bus';
import { NextPageEvent, PageChangeEvent, PreviousPageEvent } from '../../events/constants';
import { detectFormMode, FormModeDetectionResult } from '../../models/types/form-mode';
import { FormModeValidator } from '../../utils/form-validation/form-mode-validator';
import { DynamicFormTestResult, DynamicFormTestUtils } from '../dynamic-form-test-utils';
import { FormConfig } from '../../models/form-config';
import { provideDynamicForm } from '../../providers';

describe('Page Orchestration Integration', () => {
  let testResult: DynamicFormTestResult;
  let eventBus: EventBus;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideDynamicForm()],
    }).compileComponents();
  });

  afterEach(() => {
    if (testResult?.fixture) {
      testResult.fixture.destroy();
    }
  });

  describe('Form Mode Detection', () => {
    it('should detect paged form mode correctly', () => {
      const pagedConfig: FormConfig = DynamicFormTestUtils.builder()
        .pageField(
          'page1',
          [
            { key: 'input1', type: 'input', label: 'Input 1' },
            { key: 'input2', type: 'input', label: 'Input 2' },
          ],
          'Page 1',
        )
        .pageField('page2', [{ key: 'checkbox1', type: 'checkbox', label: 'Checkbox 1' }], 'Page 2')
        .build();

      const detection: FormModeDetectionResult = detectFormMode(pagedConfig.fields);

      expect(detection.mode).toBe('paged');
      expect(detection.isValid).toBe(true);
      expect(detection.errors).toEqual([]);
    });

    it('should detect non-paged form mode correctly', () => {
      const nonPagedConfig: FormConfig = DynamicFormTestUtils.builder()
        .inputField('input1')
        .checkboxField('checkbox1')
        .selectField('select1', [{ value: 'option1', label: 'Option 1' }])
        .build();

      const detection: FormModeDetectionResult = detectFormMode(nonPagedConfig.fields);

      expect(detection.mode).toBe('non-paged');
      expect(detection.isValid).toBe(true);
      expect(detection.errors).toEqual([]);
    });

    it('should detect invalid mixed mode configuration', () => {
      const invalidConfig: FormConfig = {
        fields: [
          { key: 'page1', type: 'page', fields: [] },
          { key: 'input1', type: 'input', label: 'Direct input' }, // Invalid: mixing page and non-page at root
        ],
      } as FormConfig;

      const detection = detectFormMode(invalidConfig.fields);

      expect(detection.mode).toBe('paged');
      expect(detection.isValid).toBe(false);
      expect(detection.errors).toContain(
        'Mixed page and non-page fields at root level. In paged forms, ALL root-level fields must be of type "page".',
      );
    });
  });

  describe('Form Mode Validation', () => {
    it('should validate paged form configuration', () => {
      const pagedConfig: FormConfig = DynamicFormTestUtils.builder()
        .pageField(
          'personalInfo',
          [
            { key: 'firstName', type: 'input', value: '', label: 'First Name', required: true },
            { key: 'lastName', type: 'input', value: '', label: 'Last Name', required: true },
          ],
          'Personal Information',
        )
        .pageField('preferences', [{ key: 'newsletter', type: 'checkbox', value: false, label: 'Subscribe to newsletter' }], 'Preferences')
        .build();

      const validation = FormModeValidator.validateFormConfiguration(pagedConfig.fields);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
      expect(validation.mode).toBe('paged');
    });

    it('should reject page fields nested in non-page containers', () => {
      const invalidConfig: FormConfig = DynamicFormTestUtils.builder()
        .groupField('invalidGroup', [
          { key: 'nestedPage', type: 'page', fields: [] }, // Invalid: page inside group
        ])
        .build();

      const detection = detectFormMode(invalidConfig.fields);
      expect(detection.mode).toBe('non-paged');
      expect(detection.isValid).toBe(false);
      expect(detection.errors).toContain('Page fields are not allowed in non-paged forms.');
    });

    it('should handle empty form configurations', () => {
      const emptyConfig: FormConfig = { fields: [] } as FormConfig;
      const detection = detectFormMode(emptyConfig.fields);

      expect(detection.mode).toBe('non-paged');
      expect(detection.isValid).toBe(true);
      expect(detection.errors).toEqual([]);
    });

    it('should generate warnings for empty pages', () => {
      const configWithEmptyPage: FormConfig = DynamicFormTestUtils.builder()
        .pageField('emptyPage', [])
        .pageField('normalPage', [{ key: 'input1', type: 'input', label: 'Test' }], 'Normal Page')
        .build();

      const validation = FormModeValidator.validateFormConfiguration(configWithEmptyPage.fields);
      expect(validation.warnings).toContain('Page field at index 0 (key: "emptyPage") contains no fields and will render as empty.');
    });
  });

  describe('Page Form Rendering', () => {
    it('should create and render a paged form', async () => {
      const pagedConfig: FormConfig = DynamicFormTestUtils.builder()
        .pageField('page1', [{ key: 'input1', type: 'input', label: 'Input 1' }], 'Page 1')
        .pageField('page2', [{ key: 'checkbox1', type: 'checkbox', label: 'Checkbox 1' }], 'Page 2')
        .build();

      testResult = await DynamicFormTestUtils.createTest({
        config: pagedConfig,
        initialValue: {},
      });

      expect(testResult.component).toBeTruthy();
      expect(testResult.component.formModeDetection().mode).toBe('paged');
    });

    it('should render page orchestrator for paged forms', async () => {
      const pagedConfig: FormConfig = DynamicFormTestUtils.builder()
        .pageField('page1', [{ key: 'input1', type: 'input', label: 'Input 1' }], 'Page 1')
        .build();

      testResult = await DynamicFormTestUtils.createTest({
        config: pagedConfig,
        initialValue: {},
      });

      const orchestrator = testResult.fixture.nativeElement.querySelector('[page-orchestrator]');
      expect(orchestrator).toBeTruthy();
    });

    it('should not render page orchestrator for non-paged forms', async () => {
      const nonPagedConfig: FormConfig = DynamicFormTestUtils.builder().inputField('input1').checkboxField('checkbox1').build();

      testResult = await DynamicFormTestUtils.createTest({
        config: nonPagedConfig,
        initialValue: {},
      });

      const orchestrator = testResult.fixture.nativeElement.querySelector('[page-orchestrator]');
      expect(orchestrator).toBeFalsy();
    });
  });

  describe('Page Navigation Events', () => {
    it('should emit page change events during navigation', async () => {
      const pagedConfig: FormConfig = DynamicFormTestUtils.builder()
        .pageField('page1', [{ key: 'input1', type: 'input', label: 'Input 1' }], 'Page 1')
        .pageField('page2', [{ key: 'checkbox1', type: 'checkbox', label: 'Checkbox 1' }], 'Page 2')
        .build();

      testResult = await DynamicFormTestUtils.createTest({
        config: pagedConfig,
        initialValue: {},
      });

      // Get the EventBus from the component's dependency injection context
      eventBus = testResult.fixture.debugElement.injector.get(EventBus);

      let pageChangeEvent: PageChangeEvent | null = null;

      eventBus.on<PageChangeEvent>('page-change').subscribe((event) => {
        pageChangeEvent = event;
      });
      // Emit next page event
      eventBus.dispatch(NextPageEvent);
      testResult.fixture.detectChanges();
      await DynamicFormTestUtils.waitForInit(testResult.fixture);

      expect(pageChangeEvent).toBeTruthy();
      if (!pageChangeEvent) throw new Error('Expected pageChangeEvent to be defined');
      expect(pageChangeEvent.currentPageIndex).toBe(1);
      expect(pageChangeEvent.totalPages).toBe(2);
      expect(pageChangeEvent.previousPageIndex).toBe(0);
    });

    it('should handle navigation boundary constraints', async () => {
      const pagedConfig: FormConfig = DynamicFormTestUtils.builder()
        .pageField('page1', [{ key: 'input1', type: 'input', label: 'Input 1' }], 'Page 1')
        .build();

      testResult = await DynamicFormTestUtils.createTest({
        config: pagedConfig,
        initialValue: {},
      });

      // Get the EventBus from the component's dependency injection context
      eventBus = testResult.fixture.debugElement.injector.get(EventBus);

      let navigationAttempts = 0;
      eventBus.on<PageChangeEvent>('page-change').subscribe(() => {
        navigationAttempts++;
      });

      // Try to navigate beyond first page when there's only one page
      eventBus.dispatch(NextPageEvent);
      testResult.fixture.detectChanges();
      await DynamicFormTestUtils.waitForInit(testResult.fixture);

      // Should still be on page 0 since there's only one page
      expect(navigationAttempts).toBe(0);

      // Try to navigate before first page
      eventBus.dispatch(PreviousPageEvent);
      testResult.fixture.detectChanges();
      await DynamicFormTestUtils.waitForInit(testResult.fixture);

      // Should still be on page 0
      expect(navigationAttempts).toBe(0);
    });
  });

  describe('Form Data Integrity', () => {
    it('should maintain form data across page navigation', async () => {
      const pagedConfig: FormConfig = DynamicFormTestUtils.builder()
        .pageField(
          'page1',
          [
            { key: 'firstName', type: 'input', label: 'First Name' },
            { key: 'lastName', type: 'input', label: 'Last Name' },
          ],
          'Personal Info',
        )
        .pageField('page2', [{ key: 'email', type: 'input', label: 'Email' }], 'Contact Info')
        .build();

      testResult = await DynamicFormTestUtils.createTest({
        config: pagedConfig,
        initialValue: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      // Get the EventBus from the component's dependency injection context
      eventBus = testResult.fixture.debugElement.injector.get(EventBus);

      // Initial data should be preserved (form includes default values for all fields)
      const formValue = DynamicFormTestUtils.getFormValue(testResult.component);
      expect(formValue).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: '', // Form includes default empty string for email field
      });

      // Navigate to next page
      eventBus.dispatch(NextPageEvent);
      testResult.fixture.detectChanges();
      await DynamicFormTestUtils.waitForInit(testResult.fixture);

      // Data should still be there after navigation
      const formValueAfterNavigation = DynamicFormTestUtils.getFormValue(testResult.component);
      expect(formValueAfterNavigation).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: '', // Email field default value should still be present
      });
    });

    it('should preserve form validity state across pages', async () => {
      const pagedConfig: FormConfig = DynamicFormTestUtils.builder()
        .pageField('page1', [{ key: 'requiredField', type: 'input', label: 'Required Field', required: true }], 'Page 1')
        .pageField('page2', [{ key: 'optionalField', type: 'input', label: 'Optional Field' }], 'Page 2')
        .build();

      testResult = await DynamicFormTestUtils.createTest({
        config: pagedConfig,
        initialValue: {},
      });

      // Get the EventBus from the component's dependency injection context
      eventBus = testResult.fixture.debugElement.injector.get(EventBus);

      // Form should be invalid initially (required field is empty)
      expect(DynamicFormTestUtils.isFormValid(testResult.component)).toBe(false);

      // Navigate to next page
      eventBus.dispatch(NextPageEvent);
      testResult.fixture.detectChanges();
      await DynamicFormTestUtils.waitForInit(testResult.fixture);

      // Form should still be invalid after navigation
      expect(DynamicFormTestUtils.isFormValid(testResult.component)).toBe(false);
    });
  });
});

describe('Form Mode Validation Edge Cases', () => {
  it('should reject deeply nested page fields', () => {
    const deeplyNestedInvalidConfig: FormConfig = {
      fields: [
        {
          key: 'page1',
          type: 'page',
          fields: [
            {
              key: 'group1',
              type: 'group',
              fields: [
                {
                  key: 'row1',
                  type: 'row',
                  fields: [{ key: 'deepPage', type: 'page', fields: [] }], // Invalid: deeply nested page
                },
              ],
            },
          ],
        },
      ],
    } as any;

    const validation = FormModeValidator.validateFormConfiguration(deeplyNestedInvalidConfig.fields);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((error) => error.includes('Page fields cannot contain nested page fields'))).toBe(true);
  });

  it('should handle complex nested structures without pages', () => {
    const complexNonPagedConfig: FormConfig = DynamicFormTestUtils.builder()
      .groupField('userInfo', [
        { key: 'firstName', type: 'input', label: 'First Name' },
        { key: 'lastName', type: 'input', label: 'Last Name' },
      ])
      .rowField('contactRow', [
        { key: 'email', type: 'input', label: 'Email' },
        { key: 'phone', type: 'input', label: 'Phone' },
      ])
      .build();

    const detection = detectFormMode(complexNonPagedConfig.fields);
    expect(detection.mode).toBe('non-paged');
    expect(detection.isValid).toBe(true);
    expect(detection.errors).toEqual([]);
  });
});
