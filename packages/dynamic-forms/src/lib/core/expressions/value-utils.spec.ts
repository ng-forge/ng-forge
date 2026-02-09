import { beforeEach, describe, expect, it } from 'vitest';
import { compareValues, getNestedValue, hasNestedProperty } from './value-utils';

describe('value-utils', () => {
  describe('compareValues', () => {
    describe('equals operator', () => {
      it('should return true for identical primitive values', () => {
        expect(compareValues('test', 'test', 'equals')).toBe(true);
        expect(compareValues(123, 123, 'equals')).toBe(true);
        expect(compareValues(true, true, 'equals')).toBe(true);
        expect(compareValues(null, null, 'equals')).toBe(true);
        expect(compareValues(undefined, undefined, 'equals')).toBe(true);
      });

      it('should return false for different primitive values', () => {
        expect(compareValues('test', 'other', 'equals')).toBe(false);
        expect(compareValues(123, 456, 'equals')).toBe(false);
        expect(compareValues(true, false, 'equals')).toBe(false);
        expect(compareValues(null, undefined, 'equals')).toBe(false);
      });

      it('should return false for different object instances', () => {
        expect(compareValues({}, {}, 'equals')).toBe(false);
        expect(compareValues([], [], 'equals')).toBe(false);
        expect(compareValues({ a: 1 }, { a: 1 }, 'equals')).toBe(false);
      });
    });

    describe('notEquals operator', () => {
      it('should return false for identical primitive values', () => {
        expect(compareValues('test', 'test', 'notEquals')).toBe(false);
        expect(compareValues(123, 123, 'notEquals')).toBe(false);
        expect(compareValues(true, true, 'notEquals')).toBe(false);
      });

      it('should return true for different primitive values', () => {
        expect(compareValues('test', 'other', 'notEquals')).toBe(true);
        expect(compareValues(123, 456, 'notEquals')).toBe(true);
        expect(compareValues(true, false, 'notEquals')).toBe(true);
      });
    });

    describe('numeric comparison operators', () => {
      describe('greater operator', () => {
        it('should compare numbers correctly', () => {
          expect(compareValues(10, 5, 'greater')).toBe(true);
          expect(compareValues(5, 10, 'greater')).toBe(false);
          expect(compareValues(5, 5, 'greater')).toBe(false);
        });

        it('should convert strings to numbers for comparison', () => {
          expect(compareValues('10', '5', 'greater')).toBe(true);
          expect(compareValues('5', '10', 'greater')).toBe(false);
          expect(compareValues('5.5', '5.2', 'greater')).toBe(true);
        });

        it('should handle mixed types by converting to numbers', () => {
          expect(compareValues(10, '5', 'greater')).toBe(true);
          expect(compareValues('10', 5, 'greater')).toBe(true);
        });

        it('should handle NaN conversion gracefully', () => {
          expect(compareValues('invalid', 5, 'greater')).toBe(false);
          expect(compareValues(5, 'invalid', 'greater')).toBe(false);
          expect(compareValues('invalid', 'invalid', 'greater')).toBe(false);
        });
      });

      describe('less operator', () => {
        it('should compare numbers correctly', () => {
          expect(compareValues(5, 10, 'less')).toBe(true);
          expect(compareValues(10, 5, 'less')).toBe(false);
          expect(compareValues(5, 5, 'less')).toBe(false);
        });

        it('should convert strings to numbers for comparison', () => {
          expect(compareValues('5', '10', 'less')).toBe(true);
          expect(compareValues('10', '5', 'less')).toBe(false);
        });
      });

      describe('greaterOrEqual operator', () => {
        it('should compare numbers correctly', () => {
          expect(compareValues(10, 5, 'greaterOrEqual')).toBe(true);
          expect(compareValues(5, 5, 'greaterOrEqual')).toBe(true);
          expect(compareValues(5, 10, 'greaterOrEqual')).toBe(false);
        });

        it('should handle string to number conversion', () => {
          expect(compareValues('10', '10', 'greaterOrEqual')).toBe(true);
          expect(compareValues('10', '5', 'greaterOrEqual')).toBe(true);
        });
      });

      describe('lessOrEqual operator', () => {
        it('should compare numbers correctly', () => {
          expect(compareValues(5, 10, 'lessOrEqual')).toBe(true);
          expect(compareValues(5, 5, 'lessOrEqual')).toBe(true);
          expect(compareValues(10, 5, 'lessOrEqual')).toBe(false);
        });
      });
    });

    describe('string operators', () => {
      describe('contains operator', () => {
        it('should check if string contains substring', () => {
          expect(compareValues('hello world', 'world', 'contains')).toBe(true);
          expect(compareValues('hello world', 'foo', 'contains')).toBe(false);
          expect(compareValues('hello world', '', 'contains')).toBe(true);
        });

        it('should convert non-strings to strings', () => {
          expect(compareValues(12345, '23', 'contains')).toBe(true);
          expect(compareValues(12345, 67, 'contains')).toBe(false);
          expect(compareValues(true, 'ru', 'contains')).toBe(true);
        });

        it('should handle null and undefined', () => {
          expect(compareValues(null, 'null', 'contains')).toBe(true);
          expect(compareValues(undefined, 'undefined', 'contains')).toBe(true);
        });
      });

      describe('startsWith operator', () => {
        it('should check if string starts with prefix', () => {
          expect(compareValues('hello world', 'hello', 'startsWith')).toBe(true);
          expect(compareValues('hello world', 'world', 'startsWith')).toBe(false);
          expect(compareValues('hello world', '', 'startsWith')).toBe(true);
        });

        it('should convert non-strings to strings', () => {
          expect(compareValues(12345, '123', 'startsWith')).toBe(true);
          expect(compareValues(12345, '45', 'startsWith')).toBe(false);
        });
      });

      describe('endsWith operator', () => {
        it('should check if string ends with suffix', () => {
          expect(compareValues('hello world', 'world', 'endsWith')).toBe(true);
          expect(compareValues('hello world', 'hello', 'endsWith')).toBe(false);
          expect(compareValues('hello world', '', 'endsWith')).toBe(true);
        });

        it('should convert non-strings to strings', () => {
          expect(compareValues(12345, '345', 'endsWith')).toBe(true);
          expect(compareValues(12345, '123', 'endsWith')).toBe(false);
        });
      });

      describe('matches operator', () => {
        it('should test against regex patterns', () => {
          expect(compareValues('test123', '\\d+', 'matches')).toBe(true);
          expect(compareValues('test', '\\d+', 'matches')).toBe(false);
          expect(compareValues('hello@example.com', '\\w+@\\w+\\.\\w+', 'matches')).toBe(true);
        });

        it('should handle regex flags in pattern', () => {
          expect(compareValues('TEST', 'test', 'matches')).toBe(false);
          expect(compareValues('test123test', 'test', 'matches')).toBe(true);
        });

        it('should convert non-strings to strings for testing', () => {
          expect(compareValues(123, '\\d+', 'matches')).toBe(true);
          expect(compareValues(true, 'true', 'matches')).toBe(true);
        });

        it('should handle invalid regex patterns gracefully', () => {
          // Invalid regex should return false when caught
          expect(compareValues('test', '[', 'matches')).toBe(false);
          expect(compareValues('test', '*', 'matches')).toBe(false);
          expect(compareValues('test', '?', 'matches')).toBe(false);
        });
      });
    });

    describe('invalid operator', () => {
      it('should return false for unknown operators', () => {
        expect(compareValues('test', 'test', 'unknownOperator')).toBe(false);
        expect(compareValues(123, 123, 'invalidOp')).toBe(false);
        expect(compareValues(true, true, '')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle extreme number values', () => {
        expect(compareValues(Number.MAX_VALUE, Number.MIN_VALUE, 'greater')).toBe(true);
        expect(compareValues(Infinity, 1000, 'greater')).toBe(true);
        expect(compareValues(-Infinity, -1000, 'less')).toBe(true);
      });

      it('should handle boolean to string conversion', () => {
        expect(compareValues(true, 'true', 'equals')).toBe(false);
        expect(compareValues(true, 'true', 'contains')).toBe(true);
        expect(compareValues(false, 'false', 'contains')).toBe(true);
      });
    });
  });

  describe('getNestedValue', () => {
    let testObject: Record<string, unknown>;

    beforeEach(() => {
      testObject = {
        name: 'John',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'Anytown',
          country: {
            name: 'USA',
            code: 'US',
          },
        },
        hobbies: ['reading', 'gaming', 'cooking'],
        metadata: {
          scores: [85, 92, 78],
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
      };
    });

    describe('simple property access', () => {
      it('should return direct property values', () => {
        expect(getNestedValue(testObject, 'name')).toBe('John');
        expect(getNestedValue(testObject, 'age')).toBe(30);
      });

      it('should return undefined for non-existent properties', () => {
        expect(getNestedValue(testObject, 'nonexistent')).toBeUndefined();
      });
    });

    describe('nested property access', () => {
      it('should access nested object properties', () => {
        expect(getNestedValue(testObject, 'address.street')).toBe('123 Main St');
        expect(getNestedValue(testObject, 'address.city')).toBe('Anytown');
        expect(getNestedValue(testObject, 'address.country.name')).toBe('USA');
        expect(getNestedValue(testObject, 'address.country.code')).toBe('US');
      });

      it('should access deeply nested properties', () => {
        expect(getNestedValue(testObject, 'metadata.settings.theme')).toBe('dark');
        expect(getNestedValue(testObject, 'metadata.settings.notifications')).toBe(true);
      });

      it('should return undefined for non-existent nested paths', () => {
        expect(getNestedValue(testObject, 'address.nonexistent')).toBeUndefined();
        expect(getNestedValue(testObject, 'address.country.nonexistent')).toBeUndefined();
        expect(getNestedValue(testObject, 'nonexistent.property')).toBeUndefined();
      });

      it('should handle paths that traverse through non-objects gracefully', () => {
        expect(getNestedValue(testObject, 'name.length')).toBeUndefined();
        expect(getNestedValue(testObject, 'age.value')).toBeUndefined();
      });
    });

    describe('array access', () => {
      it('should access array elements', () => {
        expect(getNestedValue(testObject, 'hobbies.0')).toBe('reading');
        expect(getNestedValue(testObject, 'hobbies.1')).toBe('gaming');
        expect(getNestedValue(testObject, 'hobbies.2')).toBe('cooking');
      });

      it('should access nested arrays', () => {
        expect(getNestedValue(testObject, 'metadata.scores.0')).toBe(85);
        expect(getNestedValue(testObject, 'metadata.scores.1')).toBe(92);
        expect(getNestedValue(testObject, 'metadata.scores.2')).toBe(78);
      });

      it('should return undefined for out-of-bounds array access', () => {
        expect(getNestedValue(testObject, 'hobbies.10')).toBeUndefined();
        expect(getNestedValue(testObject, 'metadata.scores.5')).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should handle null and undefined input objects', () => {
        expect(getNestedValue(null, 'property')).toBeUndefined();
        expect(getNestedValue(undefined, 'property')).toBeUndefined();
      });

      it('should handle empty path', () => {
        // Empty path returns undefined because split('') creates [''] array
        // and accessing obj[''] returns undefined for most objects
        expect(getNestedValue(testObject, '')).toBeUndefined();
      });

      it('should handle single character paths', () => {
        const singleCharObj = { a: 'value', b: { c: 'nested' } };
        expect(getNestedValue(singleCharObj, 'a')).toBe('value');
        expect(getNestedValue(singleCharObj, 'b.c')).toBe('nested');
      });

      it('should handle properties with special characters', () => {
        const specialObj = {
          'property-with-dashes': 'value1',
          property_with_underscores: 'value2',
          'property with spaces': 'value3',
        };
        expect(getNestedValue(specialObj, 'property-with-dashes')).toBe('value1');
        expect(getNestedValue(specialObj, 'property_with_underscores')).toBe('value2');
        expect(getNestedValue(specialObj, 'property with spaces')).toBe('value3');
      });

      it('should handle numeric property names', () => {
        const numericObj = {
          '0': 'zero',
          '123': 'one-two-three',
          nested: {
            '456': 'nested-number',
          },
        };
        expect(getNestedValue(numericObj, '0')).toBe('zero');
        expect(getNestedValue(numericObj, '123')).toBe('one-two-three');
        expect(getNestedValue(numericObj, 'nested.456')).toBe('nested-number');
      });

      it('should handle objects with null/undefined values', () => {
        const objWithNulls = {
          nullValue: null,
          undefinedValue: undefined,
          nested: {
            nullValue: null,
          },
        };
        expect(getNestedValue(objWithNulls, 'nullValue')).toBeNull();
        expect(getNestedValue(objWithNulls, 'undefinedValue')).toBeUndefined();
        expect(getNestedValue(objWithNulls, 'nested.nullValue')).toBeNull();
        expect(getNestedValue(objWithNulls, 'nullValue.property')).toBeUndefined();
      });

      it('should handle circular references without infinite loops', () => {
        const circularObj: any = { name: 'test' };
        circularObj.self = circularObj;

        expect(getNestedValue(circularObj, 'name')).toBe('test');
        expect(getNestedValue(circularObj, 'self.name')).toBe('test');
        expect(getNestedValue(circularObj, 'self.self.name')).toBe('test');
      });

      it('should handle very deep nesting', () => {
        let deepObj: any = { value: 'found' };
        for (let i = 0; i < 100; i++) {
          deepObj = { level: deepObj };
        }

        const deepPath = Array(100).fill('level').join('.') + '.value';
        expect(getNestedValue(deepObj, deepPath)).toBe('found');
      });
    });
  });

  describe('hasNestedProperty', () => {
    it('should return true for existing top-level properties', () => {
      expect(hasNestedProperty({ name: 'John' }, 'name')).toBe(true);
    });

    it('should return true for existing nested properties', () => {
      expect(hasNestedProperty({ address: { city: 'NY' } }, 'address.city')).toBe(true);
    });

    it('should return true when property exists with value undefined', () => {
      expect(hasNestedProperty({ field: undefined }, 'field')).toBe(true);
    });

    it('should return true when nested property exists with value undefined', () => {
      expect(hasNestedProperty({ nested: { field: undefined } }, 'nested.field')).toBe(true);
    });

    it('should return false for non-existent properties', () => {
      expect(hasNestedProperty({ name: 'John' }, 'age')).toBe(false);
    });

    it('should return false for non-existent nested properties', () => {
      expect(hasNestedProperty({ address: { city: 'NY' } }, 'address.zip')).toBe(false);
    });

    it('should return false when parent path does not exist', () => {
      expect(hasNestedProperty({ name: 'John' }, 'address.city')).toBe(false);
    });

    it('should return false for null/undefined input', () => {
      expect(hasNestedProperty(null, 'field')).toBe(false);
      expect(hasNestedProperty(undefined, 'field')).toBe(false);
    });

    it('should return false when traversing through non-objects', () => {
      expect(hasNestedProperty({ name: 'John' }, 'name.length')).toBe(false);
    });
  });
});
