/**
 * Reason an addon was dropped during validation.
 *
 * Each variant carries its own context fields so log messages can be both
 * actionable (registered kinds enumerated, fix suggestion present) and
 * machine-readable (admin UIs surfacing per-error guidance).
 */
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
 * Render an `AddonWarning` to a developer-friendly message.
 *
 * Returns the bare message — the `[Dynamic Forms]` prefix is added by the
 * library's logger (`ConsoleLogger`) and by `DynamicFormError`. Pass the
 * result of this function directly into `logger.warn(...)` to get the
 * standard prefixed line; use `logAddonWarnings()` for direct
 * `console.warn` output (which prefixes manually).
 *
 * Messages are designed to be actionable: they enumerate the relevant set
 * (registered kinds, allowed slots) and suggest a likely fix.
 */
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
