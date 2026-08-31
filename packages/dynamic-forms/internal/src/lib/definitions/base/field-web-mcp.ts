/**
 * Per-field WebMCP exposure policy.
 *
 * WebMCP tools are callable by any agent that reaches the page, so what a field
 * lets an agent read and write is a security decision, not a formatting one.
 * Sensible defaults are derived from the field itself (see below); this
 * overrides them where the author knows better.
 *
 * Defaults, applied when a key is left unset:
 *
 * | Field | `readable` | `writable` |
 * | --- | --- | --- |
 * | `type: 'hidden'` | `false` | `false` |
 * | `props.type === 'password'` | `false` | `true` |
 * | `readonly: true`, or a `derivation` | `true` | `false` |
 * | anything else | `true` | `true` |
 *
 * @experimental
 */
export interface FieldWebMcpOptions {
  /**
   * Whether an agent may read this field's value back in a tool response.
   *
   * A field that is not readable is still reported by name, so the agent knows
   * it exists and whether it currently holds a value — only the value itself is
   * withheld.
   */
  readable?: boolean;

  /** Whether an agent may write this field. A write to a non-writable field is rejected. */
  writable?: boolean;
}

/**
 * A field's WebMCP exposure policy. `false` is shorthand for hiding the field
 * from agents entirely (`{ readable: false, writable: false }`).
 *
 * @experimental
 */
export type FieldWebMcpConfig = FieldWebMcpOptions | false;
