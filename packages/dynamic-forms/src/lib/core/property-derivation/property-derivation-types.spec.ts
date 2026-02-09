import { describe, expect, it } from 'vitest';
import { isPropertyDerivationLogicConfig, LogicConfig } from '../../models/logic/logic-config';
import { createEmptyPropertyDerivationCollection } from './property-derivation-types';

describe('isPropertyDerivationLogicConfig', () => {
  it('should return true for propertyDerivation type', () => {
    const config: LogicConfig = {
      type: 'propertyDerivation',
      targetProperty: 'minDate',
      expression: 'formValue.startDate',
    };
    expect(isPropertyDerivationLogicConfig(config)).toBe(true);
  });

  it('should return false for state logic types', () => {
    const hidden: LogicConfig = { type: 'hidden', condition: true };
    const disabled: LogicConfig = { type: 'disabled', condition: false };
    const readonly: LogicConfig = { type: 'readonly', condition: true };
    const required: LogicConfig = { type: 'required', condition: true };

    expect(isPropertyDerivationLogicConfig(hidden)).toBe(false);
    expect(isPropertyDerivationLogicConfig(disabled)).toBe(false);
    expect(isPropertyDerivationLogicConfig(readonly)).toBe(false);
    expect(isPropertyDerivationLogicConfig(required)).toBe(false);
  });

  it('should return false for value derivation type', () => {
    const config: LogicConfig = { type: 'derivation', expression: 'formValue.x' };
    expect(isPropertyDerivationLogicConfig(config)).toBe(false);
  });
});

describe('createEmptyPropertyDerivationCollection', () => {
  it('should create collection with empty entries array', () => {
    const collection = createEmptyPropertyDerivationCollection();
    expect(collection.entries).toEqual([]);
  });
});
