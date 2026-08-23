import type { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { FormlyFieldConfig } from '@ngx-formly/core';
import { DIRECT_ENTRY_FIELDS_PER_PAGE, DIRECT_ENTRY_PAGE_COUNT } from './direct-entry-config';

/** Set at bootstrap so formly's async validator hits the same mock interceptor as ng-forge. */
const benchHttp: { current: HttpClient | null } = { current: null };

export function setBenchHttpClient(http: HttpClient): void {
  benchHttp.current = http;
}

/**
 * Formly mirror of {@link directEntryWizardConfig} for the head-to-head benchmark —
 * every ng-forge rule has a counterpart so neither side is measured doing more work.
 * `id` is forced to `<key>-input` to match the shared bench harness selectors.
 */

function genericRules(index: number): FormlyFieldConfig {
  const field: FormlyFieldConfig = {
    props: {
      required: index % 5 === 0,
      minLength: 2,
      ...(index % 3 === 0 ? { maxLength: 80 } : {}),
    },
  };

  if (index % 7 === 0) {
    field.expressions = { hide: () => false };
  }

  return field;
}

function createInput(index: number): FormlyFieldConfig {
  const fieldNumber = index + 1;
  const key = `field${fieldNumber}`;
  const base = genericRules(fieldNumber);

  const field: FormlyFieldConfig = {
    key,
    id: `${key}-input`,
    type: 'input',
    ...base,
    props: { ...base.props, label: `Field ${fieldNumber}` },
  };

  switch (fieldNumber) {
    case 1:
      return {
        ...field,
        props: { ...field.props, label: 'Account type', required: true, addonRight: { text: 'profile' } },
      };
    case 2:
      return { ...field, props: { ...field.props, label: 'Required profile name', required: true, minLength: 2 } };
    case 3:
      return { ...field, props: { ...field.props, label: 'Derivation source', required: true } };
    case 4:
      return {
        ...field,
        props: { ...field.props, label: 'Derived summary', readonly: true },
        expressions: { 'model.field4': (f) => `${f.model?.field3 ?? ''}-derived` },
      };
    case 5:
      return {
        ...field,
        props: { ...field.props, label: 'Conditional details' },
        expressions: { hide: (f) => f.model?.field1 === 'hidden' },
      };
    case 6:
      return {
        ...field,
        props: { ...field.props, label: 'Async username' },
        asyncValidators: {
          usernameTaken: {
            expression: async (control: { value: unknown }) => {
              const http = benchHttp.current;
              if (!http) return true;
              const res = await firstValueFrom(
                http.get<{ available?: boolean }>('/mock-perf/username-check', { params: { q: String(control.value ?? '') } }),
              );
              return !!res.available;
            },
            message: 'Already taken',
          },
        },
      };
    case 7:
      return {
        ...field,
        props: { ...field.props, label: 'Schema email', required: true },
        validators: { validation: ['email'] },
      };
    case 8:
      return { ...field, type: 'number', props: { ...field.props, label: 'Cross-field upper bound' } };
    case 9:
      return {
        ...field,
        type: 'number',
        props: { ...field.props, label: 'Cross-field lower bound' },
        validators: {
          lessThanUpper: {
            expression: (control: { value: unknown }, f: FormlyFieldConfig) => +String(control.value) < +String(f.model?.field8),
            message: 'Must be less than the upper bound',
          },
        },
      };
    case 10:
      return {
        ...field,
        props: { ...field.props, label: 'Conditionally disabled' },
        expressions: { 'props.disabled': (f) => f.model?.field1 === 'locked' },
      };
    case 41:
      return {
        ...field,
        props: { ...field.props, label: 'Cross-page summary', readonly: true },
        expressions: { 'model.field41': (f) => `${f.model?.field3 ?? ''}-page-2` },
      };
    default:
      return field;
  }
}

function createPageFields(pageIndex: number): FormlyFieldConfig[] {
  const pageStart = pageIndex * DIRECT_ENTRY_FIELDS_PER_PAGE;
  const directFields = Array.from({ length: DIRECT_ENTRY_FIELDS_PER_PAGE - 4 }, (_, i) => createInput(pageStart + i));

  return [
    ...directFields,
    {
      key: `page${pageIndex + 1}Group`,
      fieldGroup: [createInput(pageStart + 36), createInput(pageStart + 37)],
      validators: {
        groupShape: {
          expression: (control: { value: unknown }) => control.value !== null,
          message: 'Group must be present',
        },
      },
    },
    {
      key: `page${pageIndex + 1}Items`,
      type: 'repeat',
      props: { minLength: 1, maxLength: 4 },
      fieldArray: { fieldGroup: [createInput(pageStart + 38), createInput(pageStart + 39)] },
    },
  ];
}

/** Six pages of 40 controls, matching the ng-forge wizard fixture rule for rule. */
export function formlyDirectEntryPages(): FormlyFieldConfig[][] {
  return Array.from({ length: DIRECT_ENTRY_PAGE_COUNT }, (_, pageIndex) => createPageFields(pageIndex));
}

/** 240 bare inputs, no rules. Formly counterpart of `directEntryPlainConfig`. */
export function formlyDirectEntryPlain(): FormlyFieldConfig[] {
  return Array.from({ length: DIRECT_ENTRY_PAGE_COUNT * DIRECT_ENTRY_FIELDS_PER_PAGE }, (_, i) => ({
    key: `field${i + 1}`,
    id: `field${i + 1}-input`,
    type: 'input',
    props: { label: `Field ${i + 1}` },
  }));
}

/** Flat equivalent, matching `directEntryFullConfig`. */
export function formlyDirectEntryFlat(): FormlyFieldConfig[] {
  return formlyDirectEntryPages().flat();
}
