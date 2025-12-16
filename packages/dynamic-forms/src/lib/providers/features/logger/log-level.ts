/**
 * Log levels for the dynamic forms logger.
 * Each level includes all levels above it (more severe).
 *
 * - Off: No logging
 * - Error: Only errors
 * - Warn: Errors + warnings
 * - Info: Errors + warnings + info
 * - Debug: All messages including debug
 */
export enum LogLevel {
  /** Disable all logging */
  Off = 0,
  /** Only log errors */
  Error = 1,
  /** Log errors and warnings */
  Warn = 2,
  /** Log errors, warnings, and info messages */
  Info = 3,
  /** Log all messages including debug */
  Debug = 4,
}
