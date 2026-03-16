import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Fake translation service for testing dynamic text functionality.
 * Provides Observable-based translation methods with language switching simulation.
 *
 * @example
 * ```typescript
 * TestBed.configureTestingModule({
 *   providers: [
 *     { provide: TranslationService, useClass: FakeTranslationService }
 *   ]
 * });
 *
 * const service = TestBed.inject(FakeTranslationService);
 * service.setTranslations({
 *   'form.username.label': 'Username',
 *   'validation.required': 'This field is required'
 * });
 * ```
 *
 * @public
 */
@Injectable({
  providedIn: 'root',
})
export class FakeTranslationService {
  private readonly translations = signal<Record<string, string>>({});
  private readonly translations$ = toObservable(this.translations);
  private readonly currentLanguage = signal('en');

  /**
   * Set the translation dictionary
   */
  setTranslations(translations: Record<string, string>): void {
    this.translations.set(translations);
  }

  /**
   * Add translations to the existing dictionary
   */
  addTranslations(translations: Record<string, string>): void {
    this.translations.update((current) => ({ ...current, ...translations }));
  }

  /**
   * Simulate language change
   */
  setLanguage(language: string): void {
    this.currentLanguage.set(language);
    // Trigger translation updates by re-setting current translations
    this.translations.update((current) => ({ ...current }));
  }

  /**
   * Get current language as signal
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Translate a key and return an Observable
   * Supports parameter interpolation using {{param}} syntax
   */
  translate(key: string, params?: Record<string, unknown>): Observable<string> {
    return this.translations$.pipe(
      map((translations) => {
        const translatedValue = translations[key] || key;
        return this.interpolateParams(translatedValue, params);
      }),
    );
  }

  /**
   * Get instant translation (synchronous)
   * Supports parameter interpolation using {{param}} syntax
   */
  instant(key: string, params?: Record<string, unknown>): string {
    const translations = this.translations();
    const translatedValue = translations[key] || key;
    return this.interpolateParams(translatedValue, params);
  }

  /**
   * Simulate translation for validation errors
   * Uses validation.${errorKind} pattern
   */
  translateValidationError(errorKind: string, params?: Record<string, unknown>): Observable<string> {
    const key = `validation.${errorKind}`;
    return this.translate(key, params);
  }

  /**
   * Get all current translations
   */
  getTranslations(): Record<string, string> {
    return this.translations();
  }

  /**
   * Clear all translations
   */
  clearTranslations(): void {
    this.translations.set({});
  }

  private interpolateParams(template: string, params?: Record<string, unknown>): string {
    if (!params) {
      return template;
    }

    return Object.entries(params).reduce(
      (result, [key, value]) => result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value)),
      template,
    );
  }
}

/**
 * Default translations for common form fields and validation messages
 * Useful for quick testing setup
 */
export const DEFAULT_TEST_TRANSLATIONS = {
  // Form field labels
  'form.username.label': 'Username',
  'form.email.label': 'Email Address',
  'form.password.label': 'Password',
  'form.firstName.label': 'First Name',
  'form.lastName.label': 'Last Name',
  'form.phone.label': 'Phone Number',
  'form.address.label': 'Address',

  // Form field placeholders
  'form.username.placeholder': 'Enter your username',
  'form.email.placeholder': 'Enter your email address',
  'form.password.placeholder': 'Enter your password',

  // Validation messages
  'validation.required': 'This field is required',
  'validation.email': 'Please enter a valid email address',
  'validation.min': 'Value must be at least {{min}}',
  'validation.max': 'Value must be at most {{max}}',
  'validation.minLength': 'Must be at least {{requiredLength}} characters',
  'validation.maxLength': 'Must be at most {{requiredLength}} characters',
  'validation.pattern': 'Invalid format',

  // Button labels
  'buttons.submit': 'Submit',
  'buttons.cancel': 'Cancel',
  'buttons.save': 'Save',
  'buttons.delete': 'Delete',
  'buttons.edit': 'Edit',

  // Multi-language examples for testing language switching
  greeting: 'Hello',
  goodbye: 'Goodbye',
};

/**
 * Alternative translations for testing language switching
 */
export const SPANISH_TEST_TRANSLATIONS = {
  'form.username.label': 'Nombre de usuario',
  'form.email.label': 'Dirección de correo electrónico',
  'form.password.label': 'Contraseña',
  'validation.required': 'Este campo es obligatorio',
  'validation.email': 'Por favor ingrese una dirección de correo válida',
  greeting: 'Hola',
  goodbye: 'Adiós',
};

/**
 * Test utility to create a configured FakeTranslationService with default translations
 */
export function createTestTranslationService(
  initialTranslations: Record<string, string> = DEFAULT_TEST_TRANSLATIONS,
): FakeTranslationService {
  const service = new FakeTranslationService();
  service.setTranslations(initialTranslations);
  return service;
}
