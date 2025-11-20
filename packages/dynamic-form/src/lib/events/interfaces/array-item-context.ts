/**
 * Context object for array item operations (add/remove)
 * Provides the necessary information to resolve tokens in array item event arguments
 */
export interface ArrayItemContext {
  /** The key of the field */
  key: string;
  /** Array index for the item */
  index?: number;
  /** Parent array field key */
  arrayKey?: string;
  /** Form value for token resolution */
  formValue?: unknown;
}
