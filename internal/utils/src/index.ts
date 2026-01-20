// Type utilities
export { type RequiredKeys, type OptionalKeys } from './lib/types/type-test-utils';

// Async utilities
export { delay } from './lib/async/delay';

// Object utilities
export { isEqual } from './lib/object/is-equal';

// Signal utilities
export {
  isSignal,
  isWritableSignal,
  isSignalArray,
  isSignalRecord,
  isWritableSignalArray,
  isWritableSignalRecord,
} from './lib/signal/signal-utils';

// Field type guards
export {
  CONTAINER_FIELD_TYPES,
  isContainerField,
  isLeafField,
  hasChildFields,
  hasChildFieldsRecord,
} from './lib/type-guards/field-type-guards';

// i18n testing utilities
export {
  FakeTranslationService,
  createTestTranslationService,
  DEFAULT_TEST_TRANSLATIONS,
  SPANISH_TEST_TRANSLATIONS,
} from './lib/i18n/fake-translation.service';
