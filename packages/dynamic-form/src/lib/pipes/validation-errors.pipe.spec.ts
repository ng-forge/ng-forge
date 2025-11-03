import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ValidationErrorsPipe, ValidationTranslationService } from './validation-errors.pipe';
import { ValidationError } from '../models/validation-types';
import { FakeTranslationService } from '../testing/fake-translation.service';

describe('ValidationErrorsPipe', () => {
  let pipe: ValidationErrorsPipe;
  let translationService: FakeTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationErrorsPipe, { provide: ValidationTranslationService, useClass: FakeTranslationService }],
    });

    pipe = TestBed.inject(ValidationErrorsPipe);
    translationService = TestBed.inject(ValidationTranslationService) as FakeTranslationService;
  });

  afterEach(() => {
    pipe.ngOnDestroy?.();
  });

  describe('Basic Functionality', () => {
    it('should return empty array for null/undefined errors', () => {
      expect(pipe.transform(null)).toEqual([]);
      expect(pipe.transform(undefined as any)).toEqual([]);
    });

    it('should return errors as-is when no translation service available', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ValidationErrorsPipe],
      });

      const pipeWithoutService = TestBed.inject(ValidationErrorsPipe);
      const errors: ValidationError[] = [
        { kind: 'required', message: 'Original required message' },
        { kind: 'email', message: 'Original email message' },
      ];

      const result = pipeWithoutService.transform(errors);
      expect(result).toEqual(errors);
    });
  });

  describe('Translation Service Integration', () => {
    beforeEach(() => {
      translationService.setTranslations({
        'validation.required': 'This field is required',
        'validation.email': 'Please enter a valid email address',
        'validation.min': 'Value must be at least {{min}}',
        'validation.max': 'Value must be at most {{max}}',
        'validation.minLength': 'Must be at least {{requiredLength}} characters',
        'validation.maxLength': 'Must be at most {{requiredLength}} characters',
        'validation.pattern': 'Invalid format',
      });
    });

    it('should translate basic validation errors', () => {
      const errors: ValidationError[] = [
        { kind: 'required', message: 'Original message' },
        { kind: 'email', message: 'Original message' },
      ];

      const result = pipe.transform(errors);

      expect(result).toEqual([
        { kind: 'required', message: 'This field is required' },
        { kind: 'email', message: 'Please enter a valid email address' },
      ]);
    });

    it('should interpolate parameters in validation messages', () => {
      const errors: ValidationError[] = [
        { kind: 'min', message: 'Original', min: 5 },
        { kind: 'max', message: 'Original', max: 100 },
        { kind: 'minLength', message: 'Original', requiredLength: 8, actualLength: 3 },
        { kind: 'maxLength', message: 'Original', requiredLength: 50, actualLength: 75 },
      ];

      const result = pipe.transform(errors);

      expect(result).toEqual([
        { kind: 'min', message: 'Value must be at least 5', min: 5 },
        { kind: 'max', message: 'Value must be at most 100', max: 100 },
        { kind: 'minLength', message: 'Must be at least 8 characters', requiredLength: 8, actualLength: 3 },
        { kind: 'maxLength', message: 'Must be at most 50 characters', requiredLength: 50, actualLength: 75 },
      ]);
    });

    it('should fall back to original message for unknown validation keys', () => {
      const errors: ValidationError[] = [{ kind: 'unknownValidation', message: 'Original unknown message' }];

      const result = pipe.transform(errors);

      expect(result).toEqual([{ kind: 'unknownValidation', message: 'Original unknown message' }]);
    });

    it('should update when translation language changes', () => {
      const errors: ValidationError[] = [{ kind: 'required', message: 'Original' }];

      // Initial English translation
      let result = pipe.transform(errors);
      expect(result[0].message).toBe('This field is required');

      // Change to Spanish
      translationService.addTranslations({
        'validation.required': 'Este campo es obligatorio',
      });
      translationService.setLanguage('es');

      result = pipe.transform(errors);
      expect(result[0].message).toBe('Este campo es obligatorio');
    });
  });

  describe('Custom Validation Messages', () => {
    it('should use custom string messages over translation service', () => {
      translationService.setTranslations({
        'validation.required': 'Default required message',
      });

      const errors: ValidationError[] = [
        { kind: 'required', message: 'Original' },
        { kind: 'email', message: 'Original' },
      ];

      const customMessages = {
        required: 'Custom required message',
        email: 'Custom email message',
      };

      const result = pipe.transform(errors, customMessages);

      expect(result).toEqual([
        { kind: 'required', message: 'Custom required message' },
        { kind: 'email', message: 'Custom email message' },
      ]);
    });

    it('should interpolate parameters in custom string messages', () => {
      const errors: ValidationError[] = [{ kind: 'min', message: 'Original', min: 10 }];

      const customMessages = {
        min: 'Custom: minimum value is {{min}}',
      };

      const result = pipe.transform(errors, customMessages);

      expect(result).toEqual([{ kind: 'min', message: 'Custom: minimum value is 10', min: 10 }]);
    });

    it('should handle Observable custom messages', () => {
      const messageSubject = new BehaviorSubject('Initial custom message');
      const errors: ValidationError[] = [{ kind: 'required', message: 'Original' }];

      const customMessages = {
        required: messageSubject.asObservable(),
      };

      let result = pipe.transform(errors, customMessages);
      expect(result[0].message).toBe('Initial custom message');

      // Update Observable
      messageSubject.next('Updated custom message');
      result = pipe.transform(errors, customMessages);
      expect(result[0].message).toBe('Updated custom message');
    });

    it('should handle Signal custom messages', () => {
      const messageSignal = signal('Signal custom message');
      const errors: ValidationError[] = [{ kind: 'required', message: 'Original' }];

      const customMessages = {
        required: messageSignal,
      };

      const result = pipe.transform(errors, customMessages);
      expect(result[0].message).toBe('Signal custom message');
    });

    it('should handle computed Signal custom messages', () => {
      const baseMessage = signal('Base');
      const computedMessage = computed(() => `${baseMessage()} computed message`);

      const errors: ValidationError[] = [{ kind: 'required', message: 'Original' }];

      const customMessages = {
        required: computedMessage,
      };

      const result = pipe.transform(errors, customMessages);
      expect(result[0].message).toBe('Base computed message');
    });

    it('should mix custom messages with translated messages', () => {
      translationService.setTranslations({
        'validation.email': 'Translated email message',
      });

      const errors: ValidationError[] = [
        { kind: 'required', message: 'Original required' },
        { kind: 'email', message: 'Original email' },
      ];

      const customMessages = {
        required: 'Custom required message',
        // email will use translation service
      };

      const result = pipe.transform(errors, customMessages);

      expect(result).toEqual([
        { kind: 'required', message: 'Custom required message' },
        { kind: 'email', message: 'Translated email message' },
      ]);
    });
  });

  describe('Performance and Caching', () => {
    it('should cache results for same input', () => {
      translationService.setTranslations({
        'validation.required': 'Required message',
      });

      const errors: ValidationError[] = [{ kind: 'required', message: 'Original' }];

      const result1 = pipe.transform(errors);
      const result2 = pipe.transform(errors); // Same input

      expect(result1).toBe(result2); // Should be the same reference
    });

    it('should invalidate cache when input changes', () => {
      translationService.setTranslations({
        'validation.required': 'Required message',
      });

      const errors1: ValidationError[] = [{ kind: 'required', message: 'Original' }];

      const errors2: ValidationError[] = [{ kind: 'email', message: 'Original' }];

      const result1 = pipe.transform(errors1);
      const result2 = pipe.transform(errors2); // Different input

      expect(result1).not.toBe(result2);
    });

    it('should handle rapid consecutive transforms', () => {
      translationService.setTranslations({
        'validation.required': 'Required message',
        'validation.email': 'Email message',
      });

      const errors: ValidationError[] = [
        { kind: 'required', message: 'Original required' },
        { kind: 'email', message: 'Original email' },
      ];

      // Rapid consecutive calls
      for (let i = 0; i < 10; i++) {
        const result = pipe.transform(errors);
        expect(result.length).toBe(2);
        expect(result[0].message).toBe('Required message');
        expect(result[1].message).toBe('Email message');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty errors array', () => {
      const result = pipe.transform([]);
      expect(result).toEqual([]);
    });

    it('should handle errors without message property', () => {
      const errors: ValidationError[] = [{ kind: 'required' } as any];

      translationService.setTranslations({
        'validation.required': 'Translated required',
      });

      const result = pipe.transform(errors);
      expect(result[0].message).toBe('Translated required');
    });

    it('should handle undefined custom messages gracefully', () => {
      const errors: ValidationError[] = [{ kind: 'required', message: 'Original' }];

      const result = pipe.transform(errors, undefined);
      expect(result).toEqual(errors);
    });

    it('should handle mixed validation error formats', () => {
      translationService.setTranslations({
        'validation.required': 'Required message',
        'validation.min': 'Min {{min}} message',
      });

      const errors: ValidationError[] = [
        { kind: 'required', message: 'Original required' },
        { kind: 'min', message: 'Original min', min: 5 },
        { kind: 'custom', message: 'Custom error message' },
      ];

      const result = pipe.transform(errors);

      expect(result).toEqual([
        { kind: 'required', message: 'Required message' },
        { kind: 'min', message: 'Min 5 message', min: 5 },
        { kind: 'custom', message: 'Custom error message' },
      ]);
    });
  });
});
