import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DynamicFormTestUtils } from './dynamic-form-test-utils';
import { provideDynamicForm } from '../../src/lib/providers/dynamic-form-providers';

describe('DynamicFormTestUtils', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [provideDynamicForm()],
    }).compileComponents();
  });

  describe('FormConfigBuilder', () => {
    it('should build simple input form config', () => {
      const config = DynamicFormTestUtils.builder().inputField('name', { placeholder: 'Enter your name' }).build();

      expect(config.fields).toHaveLength(1);
      expect(config.fields[0]).toEqual({
        key: 'name',
        type: 'input',
        label: 'Name',
        props: { placeholder: 'Enter your name' },
      });
    });

    it('should build complex form config', () => {
      const config = DynamicFormTestUtils.builder()
        .requiredInputField('email', { type: 'email' })
        .selectField('country', [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ])
        .checkboxField('newsletter')
        .build();

      expect(config.fields).toHaveLength(3);
      expect(config.fields[0]).toEqual({
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        props: { type: 'email', placeholder: 'Enter email' },
      });
      expect(config.fields[1]).toEqual({
        key: 'country',
        type: 'select',
        label: 'Country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ],
        props: {},
      });
      expect(config.fields[2]).toEqual({
        key: 'newsletter',
        type: 'checkbox',
        label: 'Newsletter',
        props: {},
      });
    });
  });

  describe('createTest', () => {
    it('should create dynamic form test with test fields registered', async () => {
      const config = DynamicFormTestUtils.builder().inputField('username').build();

      const { component, fixture } = await DynamicFormTestUtils.createTest({
        config,
        initialValue: { username: 'test-user' },
      });

      expect(component).toBeDefined();
      expect(fixture).toBeDefined();
      expect(component.formValue()).toEqual({ username: 'test-user' });
    });

    it('should handle form interactions', async () => {
      const config = DynamicFormTestUtils.builder().inputField('email', { type: 'email' }).checkboxField('terms').build();

      const { component, fixture } = await DynamicFormTestUtils.createTest({
        config,
      });

      // Wait for full initialization
      await DynamicFormTestUtils.waitForInit(fixture);

      // Use more specific selectors based on the actual structure
      await DynamicFormTestUtils.simulateInput(fixture, 'input[type="email"]', 'user@example.com');
      await DynamicFormTestUtils.simulateCheckbox(fixture, 'input[type="checkbox"]', true);

      expect(component.formValue()).toEqual({
        email: 'user@example.com',
        terms: true,
      });
    });
  });

  describe('assertion helpers', () => {
    it('should assert form values correctly', async () => {
      const config = DynamicFormTestUtils.builder().inputField('name').build();

      const { component } = await DynamicFormTestUtils.createTest({
        config,
        initialValue: { name: 'John Doe' },
      });

      expect(() => {
        DynamicFormTestUtils.assertFormValue(component, { name: 'John Doe' });
      }).not.toThrow();

      expect(() => {
        DynamicFormTestUtils.assertFormValue(component, { name: 'Jane Doe' });
      }).toThrow();
    });

    it('should check form validity', async () => {
      const config = DynamicFormTestUtils.builder().requiredInputField('name').build();

      const { component, fixture } = await DynamicFormTestUtils.createTest({
        config,
        initialValue: { name: '' },
      });

      // Angular Signal Forms validates eagerly on form creation
      // No blur simulation needed - form should be invalid immediately with empty required field
      TestBed.flushEffects();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(DynamicFormTestUtils.isFormValid(component)).toBe(false);
    });
  });
});
