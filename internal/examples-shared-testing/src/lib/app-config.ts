/**
 * App-to-port mapping for example applications.
 * This is the single source of truth for port configuration.
 */
export const APP_PORTS = {
  'sandbox-examples': 4210,
} as const;

export type ExampleApp = keyof typeof APP_PORTS;
