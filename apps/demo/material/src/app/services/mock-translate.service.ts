import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Mock translation keys for demo purposes
 */
const MOCK_TRANSLATIONS = {
  'form.labels.firstName': 'First Name',
  'form.labels.lastName': 'Last Name',
  'form.labels.email': 'Email Address',
  'form.labels.password': 'Password',
  'form.labels.confirmPassword': 'Confirm Password',
  'form.labels.phoneNumber': 'Phone Number',
  'form.labels.birthDate': 'Date of Birth',
  'form.labels.gender': 'Gender',
  'form.labels.country': 'Country',
  'form.labels.city': 'City',
  'form.labels.address': 'Address',
  'form.labels.postalCode': 'Postal Code',
  'form.labels.agreeToTerms': 'I agree to the terms and conditions',
  'form.labels.newsletter': 'Subscribe to newsletter',
  'form.labels.submit': 'Submit',
  'form.labels.reset': 'Reset',
  'form.labels.cancel': 'Cancel',
  'form.labels.next': 'Next',
  'form.labels.previous': 'Previous',
  'form.placeholders.enterFirstName': 'Enter your first name',
  'form.placeholders.enterLastName': 'Enter your last name',
  'form.placeholders.enterEmail': 'Enter your email address',
  'form.placeholders.enterPassword': 'Enter your password',
  'form.placeholders.confirmPassword': 'Confirm your password',
  'form.placeholders.enterPhone': 'Enter your phone number',
  'form.placeholders.selectCountry': 'Select your country',
  'form.placeholders.enterCity': 'Enter your city',
  'form.placeholders.enterAddress': 'Enter your address',
  'form.placeholders.enterPostalCode': 'Enter postal code',
  'form.errors.required': 'This field is required',
  'form.errors.email': 'Please enter a valid email address',
  'form.errors.minLength': 'Minimum length is {{min}} characters',
  'form.errors.maxLength': 'Maximum length is {{max}} characters',
  'form.errors.passwordMismatch': 'Passwords do not match',
  'form.errors.invalidPhone': 'Please enter a valid phone number',
  'form.text.welcomeMessage': 'Welcome to our registration form',
  'form.text.personalInfo': 'Please provide your personal information',
  'form.text.accountDetails': 'Set up your account details',
  'form.text.addressInfo': 'Tell us about your location',
  'form.text.preferences': 'Set your preferences',
  'form.text.reviewInfo': 'Please review your information before submitting',
  'form.text.thankYou': 'Thank you for registering with us!',
} as const;

/**
 * Mock TranslationService interface
 */
export abstract class TranslationService {
  abstract translate(key: string, params?: Record<string, any>): string;
  abstract translate$(key: string, params?: Record<string, any>): Observable<string>;
  abstract selectTranslate(key: string, params?: Record<string, any>): Observable<string>;
}

/**
 * Mock implementation of TranslationService for testing purposes
 */
@Injectable()
export class MockTranslationService implements TranslationService {
  translate(key: string, params?: Record<string, any>): string {
    let translation = MOCK_TRANSLATIONS[key as keyof typeof MOCK_TRANSLATIONS] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value)) as any;
      });
    }

    return translation;
  }

  translate$(key: string, params?: Record<string, any>): Observable<string> {
    return of(this.translate(key, params));
  }

  selectTranslate(key: string, params?: Record<string, any>): Observable<string> {
    return this.translate$(key, params);
  }
}

/**
 * Provider function for mock Translation service
 */
export function provideMockTranslation() {
  return {
    provide: TranslationService,
    useClass: MockTranslationService,
  };
}
