/** Base interface for native HTML attributes that can be passed to form field elements. */
export interface FieldMeta {
  /** Allows any data-* attribute */
  [key: `data-${string}`]: string | undefined;

  /** Allows any aria-* attribute */
  [key: `aria-${string}`]: string | boolean | undefined;

  /** Allows additional custom attributes as escape hatch */
  [key: string]: string | number | boolean | undefined;
}
