export interface FieldWithValidation {
  readonly required?: boolean;
  readonly email?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly patternRule?: string | RegExp;
  readonly validation?: Record<string, unknown>;
}
