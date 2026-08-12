import { describe, it, expect } from 'vitest';
import {
  toLabel,
  toEnumLabel,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toFormConfigName,
  toFormFileName,
  toInterfaceName,
} from './naming.js';

describe('toLabel', () => {
  it('should convert camelCase to label', () => {
    expect(toLabel('firstName')).toBe('First Name');
  });

  it('should convert snake_case to label', () => {
    expect(toLabel('pet_name')).toBe('Pet Name');
  });

  it('should convert kebab-case to label', () => {
    expect(toLabel('is-active')).toBe('Is Active');
  });

  it('should handle single word', () => {
    expect(toLabel('name')).toBe('Name');
  });
});

describe('toEnumLabel', () => {
  it('should convert snake_case to label', () => {
    expect(toEnumLabel('in_progress')).toBe('In Progress');
  });

  it('should convert SCREAMING_SNAKE_CASE to label', () => {
    expect(toEnumLabel('PENDING_REVIEW')).toBe('Pending Review');
  });

  it('should convert camelCase to label', () => {
    expect(toEnumLabel('myVariant')).toBe('My Variant');
  });

  it('should handle simple lowercase word', () => {
    expect(toEnumLabel('active')).toBe('Active');
  });

  it('should handle single uppercase word', () => {
    expect(toEnumLabel('ACTIVE')).toBe('Active');
  });

  it('should handle kebab-case', () => {
    expect(toEnumLabel('not-started')).toBe('Not Started');
  });

  it('should preserve 2-letter ISO codes', () => {
    expect(toEnumLabel('US')).toBe('US');
    expect(toEnumLabel('UK')).toBe('UK');
    expect(toEnumLabel('EU')).toBe('EU');
  });

  it('should preserve 3-letter ISO codes', () => {
    expect(toEnumLabel('USA')).toBe('USA');
    expect(toEnumLabel('GBR')).toBe('GBR');
  });

  it('should still humanize SCREAMING_SNAKE_CASE with separators', () => {
    expect(toEnumLabel('PENDING_REVIEW')).toBe('Pending Review');
  });

  it('should still humanize 4+ char all-caps without separator', () => {
    expect(toEnumLabel('ACTIVE')).toBe('Active');
  });

  it('should still humanize 3 chars with separator', () => {
    expect(toEnumLabel('A_B')).toBe('A B');
  });

  it('should uppercase known acronyms like sms, url, api', () => {
    expect(toEnumLabel('sms')).toBe('SMS');
    expect(toEnumLabel('url')).toBe('URL');
    expect(toEnumLabel('api')).toBe('API');
    expect(toEnumLabel('json')).toBe('JSON');
    expect(toEnumLabel('html')).toBe('HTML');
    expect(toEnumLabel('pdf')).toBe('PDF');
  });

  it('should uppercase acronyms within compound labels', () => {
    expect(toEnumLabel('api_key')).toBe('API Key');
    expect(toEnumLabel('json_format')).toBe('JSON Format');
    expect(toEnumLabel('use_ssl')).toBe('Use SSL');
  });

  it('should not uppercase non-acronym words', () => {
    expect(toEnumLabel('email')).toBe('Email');
    expect(toEnumLabel('phone')).toBe('Phone');
    expect(toEnumLabel('active')).toBe('Active');
  });
});

describe('toPascalCase', () => {
  it('should convert space-separated to PascalCase', () => {
    expect(toPascalCase('create pet')).toBe('CreatePet');
  });

  it('should convert path-like string', () => {
    expect(toPascalCase('POST:/pets')).toBe('PostPets');
  });

  it('should handle single word', () => {
    expect(toPascalCase('pet')).toBe('Pet');
  });

  it('should handle camelCase input', () => {
    expect(toPascalCase('createPet')).toBe('CreatePet');
  });

  it('should handle already PascalCase input', () => {
    expect(toPascalCase('CreatePet')).toBe('CreatePet');
  });
});

describe('toCamelCase', () => {
  it('should convert to camelCase', () => {
    expect(toCamelCase('create pet')).toBe('createPet');
  });

  it('should handle single word', () => {
    expect(toCamelCase('pet')).toBe('pet');
  });
});

describe('toKebabCase', () => {
  it('should convert PascalCase to kebab-case', () => {
    expect(toKebabCase('CreatePet')).toBe('create-pet');
  });

  it('should handle already-kebab strings', () => {
    expect(toKebabCase('create-pet')).toBe('create-pet');
  });
});

describe('toFormConfigName', () => {
  it('should generate name from operationId', () => {
    expect(toFormConfigName('POST', '/pets', 'createPet')).toBe('createPetFormConfig');
  });

  it('should generate name from method+path when no operationId', () => {
    const result = toFormConfigName('POST', '/pets');
    expect(result).toBe('postPetsFormConfig');
  });

  it('should handle path parameters', () => {
    const result = toFormConfigName('GET', '/pets/{id}');
    expect(result).toBe('getPetsByIdFormConfig');
  });
});

describe('toFormFileName', () => {
  it('should generate filename from operationId', () => {
    expect(toFormFileName('POST', '/pets', 'createPet')).toBe('create-pet.form.ts');
  });

  it('should generate filename from method+path', () => {
    expect(toFormFileName('POST', '/pets')).toBe('post-pets.form.ts');
  });
});

describe('toInterfaceName', () => {
  it('should generate interface name from operationId', () => {
    expect(toInterfaceName('POST', '/pets', 'createPet')).toBe('CreatePetFormValue');
  });

  it('should generate interface name from method+path', () => {
    expect(toInterfaceName('POST', '/pets')).toBe('PostPetsFormValue');
  });
});

describe('non-ASCII names', () => {
  describe('toPascalCase', () => {
    it('should preserve letters with diacritics', () => {
      expect(toPascalCase('größe')).toBe('Größe');
      expect(toPascalCase('țară')).toBe('Țară');
      expect(toPascalCase('élève')).toBe('Élève');
      expect(toPascalCase('διεύθυνση')).toBe('Διεύθυνση');
    });

    it('should keep names that differ only by diacritic distinct', () => {
      expect(toPascalCase('größe')).not.toBe(toPascalCase('grüße'));
    });

    it('should split camelCase boundaries at non-ASCII uppercase letters', () => {
      expect(toPascalCase('straßeÜberweg')).toBe('StraßeÜberweg');
      expect(toPascalCase('adresseÉlectronique')).toBe('AdresseÉlectronique');
    });

    it('should still separate words at non-letter characters', () => {
      expect(toPascalCase('POST:/größen')).toBe('PostGrößen');
    });
  });

  describe('toCamelCase', () => {
    it('should preserve letters with diacritics', () => {
      expect(toCamelCase('Bestellgröße')).toBe('bestellgröße');
      expect(toCamelCase('Țară de ședere')).toBe('țarăDeȘedere');
    });
  });

  describe('toKebabCase', () => {
    it('should preserve letters with diacritics', () => {
      expect(toKebabCase('Größe')).toBe('größe');
      expect(toKebabCase('BestellGröße')).toBe('bestell-größe');
    });

    it('should keep names that differ only by diacritic distinct', () => {
      expect(toKebabCase('Größe')).not.toBe(toKebabCase('Grüße'));
    });
  });

  describe('toLabel', () => {
    it('should capitalize words starting with a non-ASCII letter', () => {
      expect(toLabel('nom_élève')).toBe('Nom Élève');
      expect(toLabel('țara_de_ședere')).toBe('Țara De Ședere');
    });
  });

  describe('toEnumLabel', () => {
    it('should humanize SCREAMING_SNAKE_CASE containing non-ASCII letters', () => {
      expect(toEnumLabel('ÉLÈVE_ACTIF')).toBe('Élève Actif');
    });

    it('should still uppercase known acronyms alongside accented words', () => {
      expect(toEnumLabel('élève_sms')).toBe('Élève SMS');
    });
  });

  describe('generated names', () => {
    it('should build config, file and interface names from a non-ASCII operationId', () => {
      expect(toFormConfigName('POST', '/größen', 'createGröße')).toBe('createGrößeFormConfig');
      expect(toFormFileName('POST', '/größen', 'createGröße')).toBe('create-größe.form.ts');
      expect(toInterfaceName('POST', '/größen', 'createGröße')).toBe('CreateGrößeFormValue');
    });
  });
});
