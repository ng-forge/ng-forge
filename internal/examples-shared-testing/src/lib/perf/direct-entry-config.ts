import type { FormConfig } from '@ng-forge/dynamic-forms';

export const DIRECT_ENTRY_TOTAL_FIELDS = 240;
export const DIRECT_ENTRY_PAGE_COUNT = 6;
export const DIRECT_ENTRY_FIELDS_PER_PAGE = DIRECT_ENTRY_TOTAL_FIELDS / DIRECT_ENTRY_PAGE_COUNT;

type BenchmarkField = Record<string, unknown>;

function createInput(index: number): BenchmarkField {
  return {
    key: `field${index + 1}`,
    type: 'input',
    label: `Field ${index + 1}`,
    value: '',
  };
}

/** The eager 240-field control used to separate page orchestration from total form cost. */
export function directEntryFullConfig(): FormConfig {
  return {
    fields: Array.from({ length: DIRECT_ENTRY_TOTAL_FIELDS }, (_, index) => createInput(index)),
  } as unknown as FormConfig;
}

/** Six pages of 40 fields, matching the direct-entry Lighthouse workload. */
export function directEntryWizardConfig(): FormConfig {
  return {
    fields: Array.from({ length: DIRECT_ENTRY_PAGE_COUNT }, (_, pageIndex) => ({
      key: `page${pageIndex + 1}`,
      type: 'page',
      fields: Array.from({ length: DIRECT_ENTRY_FIELDS_PER_PAGE }, (_, fieldIndex) =>
        createInput(pageIndex * DIRECT_ENTRY_FIELDS_PER_PAGE + fieldIndex),
      ),
    })),
  } as unknown as FormConfig;
}
