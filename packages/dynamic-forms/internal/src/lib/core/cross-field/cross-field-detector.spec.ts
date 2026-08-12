import { describe, expect, it } from 'vitest';
import { extractExpressionDependencies, extractStringDependencies, isCrossFieldExpression } from './cross-field-detector';

describe('cross-field-detector', () => {
  describe('extractStringDependencies', () => {
    it('should extract dot-notation dependencies', () => {
      expect(extractStringDependencies('formValue.firstName + formValue.lastName')).toEqual(['firstName', 'lastName']);
    });

    it('should extract nested paths as root and full path', () => {
      expect(extractStringDependencies('formValue.person.age')).toEqual(['person', 'person.age']);
    });

    it('should extract bracket-notation dependencies', () => {
      expect(extractStringDependencies(`formValue['firstName'] + formValue["lastName"]`)).toEqual(['firstName', 'lastName']);
    });

    it('should extract dependencies whose keys contain non-ASCII letters', () => {
      expect(extractStringDependencies('!!formValue.bestellgröße')).toEqual(['bestellgröße']);
    });

    it('should extract non-ASCII dependencies from bracket notation', () => {
      expect(extractStringDependencies(`formValue['bestellgröße']`)).toEqual(['bestellgröße']);
      expect(extractStringDependencies(`formValue["bestellgröße"]`)).toEqual(['bestellgröße']);
    });

    it('should extract nested non-ASCII paths as root and full path', () => {
      expect(extractStringDependencies('formValue.lieferung.bestellgröße')).toEqual(['lieferung', 'lieferung.bestellgröße']);
    });

    it.each([
      ['Romanian', 'țaraDeȘedere'],
      ['Romanian (cedilla variants)', 'ştiinţă'],
      ['French', 'adresseÉlectronique'],
      ['French (ligature)', 'cœurBattant'],
      ['German', 'überprüfungsgröße'],
      ['Spanish', 'añoDeNacimiento'],
      ['Portuguese', 'endereçoIrmão'],
      ['Polish', 'nazwiskoŻółć'],
      ['Czech', 'příjmeníŘeka'],
      ['Hungarian', 'születésiDátum'],
      ['Turkish', 'kimlikNumarası'],
      ['Nordic', 'blåbærFødt'],
      ['Greek', 'διεύθυνση'],
      ['Cyrillic', 'фамилия'],
      ['Vietnamese', 'điệnThoại'],
      ['Hebrew', 'כתובת'],
      ['Arabic', 'العنوان'],
      ['CJK', '住所'],
    ])('should extract a key with %s characters, composed and decomposed', (_language, key) => {
      expect(extractStringDependencies(`formValue.${key}`)).toEqual([key]);
      expect(extractStringDependencies(`formValue["${key}"]`)).toEqual([key]);

      const decomposed = key.normalize('NFD');
      expect(extractStringDependencies(`formValue.${decomposed}`)).toEqual([decomposed]);
    });
  });

  describe('extractExpressionDependencies', () => {
    it('should extract dependencies from a javascript condition with non-ASCII keys', () => {
      const deps = extractExpressionDependencies({
        type: 'javascript',
        expression: '!!formValue.bestellgröße && externalData.isAuthenticated',
      });

      expect(deps).toEqual(['bestellgröße']);
    });
  });

  describe('isCrossFieldExpression', () => {
    it('should detect formValue access with non-ASCII keys', () => {
      expect(
        isCrossFieldExpression({
          type: 'javascript',
          expression: '!!formValue.bestellgröße',
        }),
      ).toBe(true);
    });
  });
});
