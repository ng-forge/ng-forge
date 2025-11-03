import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Fake translation service for testing dynamic text functionality in Material components.
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
  private readonly translations = new BehaviorSubject<Record<string, string>>({});
  private readonly currentLanguage = signal('en');

  /**
   * Set the translation dictionary
   */
  setTranslations(translations: Record<string, string>): void {
    this.translations.next(translations);
  }

  /**
   * Add translations to the existing dictionary
   */
  addTranslations(translations: Record<string, string>): void {
    const current = this.translations.value;
    this.translations.next({ ...current, ...translations });
  }

  /**
   * Simulate language change
   */
  setLanguage(language: string): void {
    this.currentLanguage.set(language);
    // Trigger translation updates by emitting current translations
    this.translations.next(this.translations.value);
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
    return this.translations.pipe(
      map((translations) => {
        const translatedValue = translations[key] || key;
        return this.interpolateParams(translatedValue, params);
      })
    );
  }

  /**
   * Get instant translation (synchronous)
   * Supports parameter interpolation using {{param}} syntax
   */
  instant(key: string, params?: Record<string, unknown>): string {
    const translations = this.translations.value;
    const translatedValue = translations[key] || key;
    return this.interpolateParams(translatedValue, params);
  }

  /**
   * Get all current translations
   */
  getTranslations(): Record<string, string> {
    return this.translations.value;
  }

  /**
   * Clear all translations
   */
  clearTranslations(): void {
    this.translations.next({});
  }

  private interpolateParams(template: string, params?: Record<string, unknown>): string {
    if (!params) {
      return template;
    }

    let result = template;
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(placeholder, String(value));
    });

    return result;
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
  greeting: 'Hola',
  goodbye: 'Adiós',
};

/**
 * Test utility to create a configured FakeTranslationService with default translations
 */
export function createTestTranslationService(
  initialTranslations: Record<string, string> = DEFAULT_TEST_TRANSLATIONS
): FakeTranslationService {
  const service = new FakeTranslationService();
  service.setTranslations(initialTranslations);
  return service;
}
