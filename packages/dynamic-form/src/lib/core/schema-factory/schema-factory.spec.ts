import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { createSchemaFromFields, fieldsToDefaultValues } from './schema-factory';
import { FieldDef } from '../../definitions';

describe('schema-factory', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  describe('createSchemaFromFields', () => {
    it('should create a valid schema and apply it to a form', () => {
      // Arrange
      const fields: FieldDef<any>[] = [
        { key: 'username', type: 'input', required: true, minLength: 3 } as any,
        { key: 'email', type: 'email', required: true } as any,
      ];

      // Act
      const createdSchema = createSchemaFromFields(fields);

      // Create a form using the schema
      const initialValue = signal({ username: '', email: '' });

      const testForm = runInInjectionContext(injector, () => {
        return form(initialValue, createdSchema);
      });

      // Assert
      expect(createdSchema).toBeDefined();
      expect(testForm).toBeDefined();
      expect(testForm().value()).toEqual({ username: '', email: '' });
    });

    it('should apply required validation by checking form validity', () => {
      // Arrange - Test that the schema actually enforces required validation
      const fields: FieldDef<any>[] = [{ key: 'name', type: 'input', required: true } as any, { key: 'optional', type: 'input' } as any];

      const createdSchema = createSchemaFromFields(fields);

      // Test with empty required field - should be invalid
      const invalidValue = signal({ name: '', optional: '' });
      const invalidForm = runInInjectionContext(injector, () => {
        return form(invalidValue, createdSchema);
      });

      // Test with filled required field - should be valid
      const validValue = signal({ name: 'John', optional: '' });
      const validForm = runInInjectionContext(injector, () => {
        return form(validValue, createdSchema);
      });

      // Assert
      expect(invalidForm().valid()).toBeFalsy(); // Empty required field should be invalid
      expect(validForm().valid()).toBeTruthy(); // Filled required field should be valid
    });

    it('should apply minLength validation', () => {
      // Arrange
      const fields: FieldDef<any>[] = [{ key: 'password', type: 'password', minLength: 8 } as any];

      const createdSchema = createSchemaFromFields(fields);

      // Test with short password
      const shortValue = signal({ password: 'short' });
      const shortForm = runInInjectionContext(injector, () => {
        return form(shortValue, createdSchema);
      });

      // Test with long enough password
      const longValue = signal({ password: 'longenoughpassword' });
      const longForm = runInInjectionContext(injector, () => {
        return form(longValue, createdSchema);
      });

      // Assert
      expect(shortForm().valid()).toBeFalsy(); // Short password should be invalid
      expect(longForm().valid()).toBeTruthy(); // Long enough password should be valid
    });

    it('should apply maxLength validation', () => {
      // Arrange
      const fields: FieldDef<any>[] = [{ key: 'username', type: 'input', maxLength: 10 } as any];

      const createdSchema = createSchemaFromFields(fields);

      // Test with too long username
      const longValue = signal({ username: 'verylongusername' });
      const longForm = runInInjectionContext(injector, () => {
        return form(longValue, createdSchema);
      });

      // Test with short enough username
      const shortValue = signal({ username: 'short' });
      const shortForm = runInInjectionContext(injector, () => {
        return form(shortValue, createdSchema);
      });

      // Assert
      expect(longForm().valid()).toBeFalsy(); // Too long username should be invalid
      expect(shortForm().valid()).toBeTruthy(); // Short enough username should be valid
    });

    it('should apply min value validation', () => {
      // Arrange
      const fields: FieldDef<any>[] = [{ key: 'age', type: 'number', min: 18 } as any];

      const createdSchema = createSchemaFromFields(fields);

      // Test with too young age
      const youngValue = signal({ age: 16 });
      const youngForm = runInInjectionContext(injector, () => {
        return form(youngValue, createdSchema);
      });

      // Test with old enough age
      const oldValue = signal({ age: 25 });
      const oldForm = runInInjectionContext(injector, () => {
        return form(oldValue, createdSchema);
      });

      // Assert
      expect(youngForm().valid()).toBeFalsy(); // Too young should be invalid
      expect(oldForm().valid()).toBeTruthy(); // Old enough should be valid
    });

    it('should apply max value validation', () => {
      // Arrange
      const fields: FieldDef<any>[] = [{ key: 'score', type: 'number', max: 100 } as any];

      const createdSchema = createSchemaFromFields(fields);

      // Test with too high score
      const highValue = signal({ score: 150 });
      const highForm = runInInjectionContext(injector, () => {
        return form(highValue, createdSchema);
      });

      // Test with acceptable score
      const lowValue = signal({ score: 85 });
      const lowForm = runInInjectionContext(injector, () => {
        return form(lowValue, createdSchema);
      });

      // Assert
      expect(highForm().valid()).toBeFalsy(); // Too high should be invalid
      expect(lowForm().valid()).toBeTruthy(); // Acceptable should be valid
    });

    it('should apply multiple validations to the same field', () => {
      // Arrange
      const fields: FieldDef<any>[] = [
        {
          key: 'password',
          type: 'password',
          required: true,
          minLength: 8,
          maxLength: 100,
        } as any,
      ];

      const createdSchema = createSchemaFromFields(fields);

      // Test various invalid cases
      const emptyValue = signal({ password: '' });
      const emptyForm = runInInjectionContext(injector, () => {
        return form(emptyValue, createdSchema);
      });

      const shortValue = signal({ password: 'short' });
      const shortForm = runInInjectionContext(injector, () => {
        return form(shortValue, createdSchema);
      });

      const longValue = signal({ password: 'a'.repeat(101) });
      const longForm = runInInjectionContext(injector, () => {
        return form(longValue, createdSchema);
      });

      // Test valid case
      const validValue = signal({ password: 'validpassword123' });
      const validForm = runInInjectionContext(injector, () => {
        return form(validValue, createdSchema);
      });

      // Assert
      expect(emptyForm().valid()).toBeFalsy(); // Empty should fail required
      expect(shortForm().valid()).toBeFalsy(); // Too short should fail minLength
      expect(longForm().valid()).toBeFalsy(); // Too long should fail maxLength
      expect(validForm().valid()).toBeTruthy(); // Valid password should pass all validations
    });

    it('should handle fields without validation rules', () => {
      // Arrange
      const fields: FieldDef<any>[] = [{ key: 'description', type: 'textarea' } as any, { key: 'notes', type: 'input' } as any];

      const createdSchema = createSchemaFromFields(fields);

      // Test with any values - should always be valid since no validation rules
      const emptyValue = signal({ description: '', notes: '' });
      const emptyForm = runInInjectionContext(injector, () => {
        return form(emptyValue, createdSchema);
      });

      const filledValue = signal({ description: 'Some description', notes: 'Some notes' });
      const filledForm = runInInjectionContext(injector, () => {
        return form(filledValue, createdSchema);
      });

      // Assert
      expect(emptyForm().valid()).toBeTruthy(); // No validation means always valid
      expect(filledForm().valid()).toBeTruthy(); // No validation means always valid
    });

    it('should skip fields that do not exist in the form model', () => {
      // Arrange - Create schema with more fields than the form has
      const fields: FieldDef<any>[] = [
        { key: 'existingField', type: 'input', required: true } as any,
        { key: 'nonExistentField', type: 'input', required: true } as any,
      ];

      const createdSchema = createSchemaFromFields(fields);

      // Create form with only one of the fields
      const partialValue = signal({ existingField: '' });
      const partialForm = runInInjectionContext(injector, () => {
        return form(partialValue, createdSchema);
      });

      // The form should only validate the existing field
      // Since existingField is empty and required, form should be invalid
      expect(partialForm().valid()).toBeFalsy();

      // When we fill the existing field, it should become valid
      // (nonExistentField validation should be skipped)
      const filledValue = signal({ existingField: 'filled' });
      const filledForm = runInInjectionContext(injector, () => {
        return form(filledValue, createdSchema);
      });

      expect(filledForm().valid()).toBeTruthy();
    });

    it('should handle empty fields array', () => {
      // Arrange
      const fields: FieldDef<any>[] = [];

      const createdSchema = createSchemaFromFields(fields);
      const emptyValue = signal({});

      // Act & Assert - Should create valid schema even with empty fields
      const emptyForm = runInInjectionContext(injector, () => {
        return form(emptyValue, createdSchema);
      });

      expect(createdSchema).toBeDefined();
      expect(emptyForm).toBeDefined();
      expect(emptyForm().value()).toEqual({});
      expect(emptyForm().valid()).toBeTruthy(); // No validations = always valid
    });

    it('should handle zero values correctly for min/max constraints', () => {
      // Arrange
      const fields: FieldDef<any>[] = [
        { key: 'rating', type: 'number', min: 0, max: 0 } as any, // Exactly 0 allowed
        { key: 'count', type: 'string', minLength: 0, maxLength: 0 } as any, // Empty string allowed
      ];

      const createdSchema = createSchemaFromFields(fields);

      // Test valid cases (exactly meeting the constraints)
      const validValue = signal({ rating: 0, count: '' });
      const validForm = runInInjectionContext(injector, () => {
        return form(validValue, createdSchema);
      });

      // Test invalid cases
      const invalidRating1 = signal({ rating: 1, count: '' });
      const invalidForm1 = runInInjectionContext(injector, () => {
        return form(invalidRating1, createdSchema);
      });

      const invalidRating2 = signal({ rating: -1, count: '' });
      const invalidForm2 = runInInjectionContext(injector, () => {
        return form(invalidRating2, createdSchema);
      });

      const invalidCount = signal({ rating: 0, count: 'a' });
      const invalidForm3 = runInInjectionContext(injector, () => {
        return form(invalidCount, createdSchema);
      });

      // Assert
      expect(validForm().valid()).toBeTruthy(); // Exactly meeting constraints should be valid
      expect(invalidForm1().valid()).toBeFalsy(); // Above max should be invalid
      expect(invalidForm2().valid()).toBeFalsy(); // Below min should be invalid
      expect(invalidForm3().valid()).toBeFalsy(); // Too long string should be invalid
    });

    it('should work end-to-end with complex form validation', () => {
      // Arrange
      const fields: FieldDef<any>[] = [
        { key: 'firstName', type: 'input', required: true, minLength: 2 } as any,
        { key: 'lastName', type: 'input', required: true, minLength: 2 } as any,
        { key: 'age', type: 'number', min: 18, max: 100 } as any,
        { key: 'email', type: 'email', required: true } as any,
      ];

      // Act - Create schema
      const createdSchema = createSchemaFromFields(fields);

      // Test initially invalid form (required fields empty)
      const emptyValue = signal({ firstName: '', lastName: '', age: 0, email: '' });
      const emptyForm = runInInjectionContext(injector, () => {
        return form(emptyValue, createdSchema);
      });

      // Test valid form
      const validValue = signal({ firstName: 'John', lastName: 'Doe', age: 25, email: 'john@example.com' });
      const validForm = runInInjectionContext(injector, () => {
        return form(validValue, createdSchema);
      });

      // Test partially invalid form (age too low)
      const invalidAgeValue = signal({ firstName: 'John', lastName: 'Doe', age: 15, email: 'john@example.com' });
      const invalidAgeForm = runInInjectionContext(injector, () => {
        return form(invalidAgeValue, createdSchema);
      });

      // Test partially invalid form (name too short)
      const invalidNameValue = signal({ firstName: 'J', lastName: 'Doe', age: 25, email: 'john@example.com' });
      const invalidNameForm = runInInjectionContext(injector, () => {
        return form(invalidNameValue, createdSchema);
      });

      // Assert
      expect(emptyForm().valid()).toBeFalsy(); // Empty required fields should be invalid
      expect(validForm().valid()).toBeTruthy(); // All valid data should be valid
      expect(invalidAgeForm().valid()).toBeFalsy(); // Too young age should be invalid
      expect(invalidNameForm().valid()).toBeFalsy(); // Too short name should be invalid

      // Check that values are preserved correctly
      expect(validForm().value()).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        email: 'john@example.com',
      });
    });
  });

  describe('fieldsToDefaultValues', () => {
    it('should return empty object when no fields provided', () => {
      const fields: FieldDef<any>[] = [];
      const result = fieldsToDefaultValues(fields);
      expect(result).toEqual({});
    });

    it('should return empty object for fields without default values', () => {
      const fields: FieldDef<any>[] = [
        { key: 'username', type: 'input' },
        { key: 'email', type: 'email' },
      ];
      const result = fieldsToDefaultValues(fields);
      expect(result).toEqual({});
    });

    it('should handle readonly fields array', () => {
      const fields: readonly FieldDef<any>[] = [
        { key: 'username', type: 'input' },
        { key: 'email', type: 'email' },
      ] as const;
      const result = fieldsToDefaultValues(fields);
      expect(result).toEqual({});
    });

    it('should maintain type safety with generic parameter', () => {
      interface UserModel {
        username: string;
        email: string;
        age?: number;
      }

      const fields: FieldDef<any>[] = [
        { key: 'username', type: 'input' },
        { key: 'email', type: 'email' },
        { key: 'age', type: 'number' },
      ];

      const result = fieldsToDefaultValues<UserModel>(fields);
      expect(result).toEqual({});
      // Type safety compilation test
      expect(typeof result.username).toBe('undefined');
      expect(typeof result.email).toBe('undefined');
      expect(typeof result.age).toBe('undefined');
    });

    it('should be ready for future implementation with defaultValue property', () => {
      const fields: FieldDef<any>[] = [
        { key: 'username', type: 'input' /* defaultValue: 'john_doe' */ },
        { key: 'age', type: 'number' /* defaultValue: 25 */ },
      ];

      const result = fieldsToDefaultValues(fields);

      // Currently returns empty object due to TODO implementation
      expect(result).toEqual({});

      // When implemented, should return:
      // expect(result).toEqual({ username: 'john_doe', age: 25 });
    });
  });

  describe('type safety and integration', () => {
    it('should create type-safe schemas with custom interfaces', () => {
      interface UserProfile {
        username: string;
        email: string;
        age: number;
      }

      const fields: FieldDef<any>[] = [
        { key: 'username', type: 'input', required: true } as any,
        { key: 'email', type: 'email', required: true } as any,
        { key: 'age', type: 'number', min: 0 } as any,
      ];

      const typedSchema = createSchemaFromFields<UserProfile>(fields);
      const initialValue = signal<UserProfile>({ username: '', email: '', age: 0 });

      const typedForm = runInInjectionContext(injector, () => {
        return form(initialValue, typedSchema);
      });

      expect(typedSchema).toBeDefined();
      expect(typedForm).toBeDefined();

      const value: UserProfile = typedForm().value();
      expect(typeof value.username).toBe('string');
      expect(typeof value.email).toBe('string');
      expect(typeof value.age).toBe('number');
    });

    it('should handle unknown model types', () => {
      const fields: FieldDef<any>[] = [{ key: 'dynamicField', type: 'input', required: true } as any];

      const unknownSchema = createSchemaFromFields<unknown>(fields);
      const initialValue = signal<unknown>({ dynamicField: '' });

      const unknownForm = runInInjectionContext(injector, () => {
        return form(initialValue, unknownSchema);
      });

      expect(unknownSchema).toBeDefined();
      expect(unknownForm).toBeDefined();
      expect(unknownForm().value()).toEqual({ dynamicField: '' });
    });
  });
});
