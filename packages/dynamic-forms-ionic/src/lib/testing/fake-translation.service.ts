import { Signal, signal } from '@angular/core';

/**
 * Fake translation service for testing
 * Provides a simple implementation of TranslationService for testing purposes
 */
export class FakeTranslationService {
  translate(key: string): Signal<string> {
    return signal(key);
  }
}
