import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      col: 12,
    },
    // Gap 4: Derives status based on password length (proxy for valid/invalid)
    {
      key: 'passwordStrength',
      type: 'input',
      label: 'Password Strength',
      value: 'TOO_SHORT',
      readonly: true,
      col: 12,
      logic: [
        {
          type: 'derivation',
          value: 'VALID',
          condition: { type: 'javascript', expression: '(formValue.password || "").length >= 6' },
          dependsOn: ['password'],
        },
        {
          type: 'derivation',
          value: 'TOO_SHORT',
          condition: { type: 'javascript', expression: '(formValue.password || "").length < 6' },
          dependsOn: ['password'],
        },
      ],
    },
    // Gap 5: Self-state — field becomes readonly when dirty
    {
      key: 'lockOnEdit',
      type: 'input',
      label: 'Lock On Edit (once edited)',
      value: '',
      col: 12,
      logic: [
        {
          type: 'readonly',
          condition: { type: 'javascript', expression: 'fieldState.dirty' },
        },
      ],
    },
    // Gap 6: formFieldState in readonly condition — readonly when password is touched
    {
      key: 'lockedAfterPasswordTouch',
      type: 'input',
      label: 'Locked After Password Touch',
      value: 'editable initially',
      col: 12,
      logic: [
        {
          type: 'readonly',
          condition: { type: 'javascript', expression: 'formFieldState.password.touched' },
        },
      ],
    },
    // Gap 7: stopOnUserOverride + formFieldState combo
    {
      key: 'autoTag',
      type: 'input',
      label: 'Auto Tag',
      col: 12,
      logic: [
        {
          type: 'derivation',
          value: 'needs-input',
          condition: { type: 'javascript', expression: '!formFieldState.password.dirty' },
          stopOnUserOverride: true,
          dependsOn: ['password'],
        },
        {
          type: 'derivation',
          expression: '"tag-" + formValue.password',
          condition: { type: 'javascript', expression: 'formFieldState.password.dirty' },
          stopOnUserOverride: true,
          dependsOn: ['password'],
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const fieldStateAdvancedScenario: TestScenario = {
  testId: 'field-state-advanced-test',
  title: 'Field State Advanced',
  description: 'Tests fieldState conditions (self-state, formFieldState), readonly logic, and stopOnUserOverride + fieldState combo',
  config,
};
