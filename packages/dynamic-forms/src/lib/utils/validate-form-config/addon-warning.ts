/** Reason an addon was dropped during validation. */
export type AddonWarning =
  | { type: 'unknown-field-type'; fieldKey: string; fieldType: string }
  | { type: 'field-type-no-addon-support'; fieldKey: string; fieldType: string }
  | { type: 'unknown-slot'; fieldKey: string; fieldType: string; slot: string; allowedSlots: readonly string[] }
  | { type: 'unknown-kind'; fieldKey: string; kind: string; registeredKinds: readonly string[] }
  | { type: 'kind-not-allowed'; fieldKey: string; fieldType: string; kind: string; allowedKinds: readonly string[] }
  | { type: 'shape-violation'; fieldKey: string; kind: string; reason: string }
  | { type: 'code-only-kind-in-json'; fieldKey: string; kind: string }
  | { type: 'code-only-action-in-json'; fieldKey: string; reason: string };

/**
 * Stable structural fingerprint for an `AddonWarning`, used by the
 * FormStateManager dedup cache. Includes every distinguishing field
 * (`type`, `fieldKey`, `kind`/`slot`/`reason` as relevant) so warnings
 * for different fields or different kinds never collapse to one log
 * line — independent of the human-readable format which may change.
 */
export function addonWarningKey(w: AddonWarning): string {
  switch (w.type) {
    case 'unknown-field-type':
      return `${w.type}|${w.fieldKey}|${w.fieldType}`;
    case 'field-type-no-addon-support':
      return `${w.type}|${w.fieldKey}|${w.fieldType}`;
    case 'unknown-slot':
      return `${w.type}|${w.fieldKey}|${w.fieldType}|${w.slot}`;
    case 'unknown-kind':
      return `${w.type}|${w.fieldKey}|${w.kind}`;
    case 'kind-not-allowed':
      return `${w.type}|${w.fieldKey}|${w.fieldType}|${w.kind}`;
    case 'shape-violation':
      return `${w.type}|${w.fieldKey}|${w.kind}|${w.reason}`;
    case 'code-only-kind-in-json':
      return `${w.type}|${w.fieldKey}|${w.kind}`;
    case 'code-only-action-in-json':
      return `${w.type}|${w.fieldKey}|${w.reason}`;
  }
}

/** Render an `AddonWarning` to a developer-friendly message. */
export function formatAddonWarning(w: AddonWarning): string {
  switch (w.type) {
    case 'unknown-field-type':
      return `Field '${w.fieldKey}': unknown field type '${w.fieldType}'. Addons dropped.`;
    case 'field-type-no-addon-support':
      return (
        `Field '${w.fieldKey}' (type: '${w.fieldType}'): this field type does not declare addon support. Addons dropped. ` +
        `If this is incorrect, add 'addons: { slots: [...] }' to the field type registration.`
      );
    case 'unknown-slot':
      return (
        `Field '${w.fieldKey}' (type: '${w.fieldType}'): slot '${w.slot}' is not supported. ` +
        `Allowed: ${w.allowedSlots.join(', ')}. Addon dropped.`
      );
    case 'unknown-kind':
      return (
        `Field '${w.fieldKey}': addon kind '${w.kind}' is not registered. ` +
        `Did you forget withCustomAddon({ kind: '${w.kind}', ... })? ` +
        `Currently registered: ${w.registeredKinds.join(', ') || '(none)'}. Addon dropped.`
      );
    case 'kind-not-allowed':
      return (
        `Field '${w.fieldKey}' (type: '${w.fieldType}'): addon kind '${w.kind}' is not in the allowed list. ` +
        `Allowed: ${w.allowedKinds.join(', ')}. Addon dropped.`
      );
    case 'shape-violation':
      return `Field '${w.fieldKey}': addon kind '${w.kind}' shape invalid: ${w.reason}. Addon dropped.`;
    case 'code-only-kind-in-json':
      return `Field '${w.fieldKey}': addon kind '${w.kind}' is code-only and cannot be used with JSON-derived configs. Addon dropped.`;
    case 'code-only-action-in-json':
      return `Field '${w.fieldKey}': ${w.reason}. Use 'preset' or 'actionRef' instead. Addon dropped.`;
  }
}
