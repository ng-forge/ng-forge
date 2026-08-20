/**
 * Terminal presentation for the CLI.
 *
 * The primary consumer of this tool is an agent, not a person, and that decides
 * every choice here:
 *
 * - **stdout stays clean.** Progress goes to stderr, so anything capturing the
 *   report gets the report and nothing else. A spinner interleaved into stdout
 *   would corrupt exactly the output the skill tells agents to read.
 * - **Colour only on a TTY.** `styleText` consults the stream, `NO_COLOR` and
 *   `FORCE_COLOR` itself, so piping to a file or running in CI yields plain
 *   text without a flag.
 * - **No new dependencies.** The published package declares four, and a spinner
 *   is not worth a fifth.
 */

import { styleText } from 'node:util';

type Style = Parameters<typeof styleText>[0];

/**
 * Whether to colour, decided here rather than left to the default.
 *
 * `styleText`'s stream detection honours `FORCE_COLOR`, which test runners and
 * some CI images set, so relying on it means an agent capturing stdout can still
 * receive escape codes. The decision is explicit and `NO_COLOR` wins outright.
 *
 * Read per call, not at module load, so a caller can change it and see the
 * change — and so a test can prove the guarantee rather than assume it.
 *
 * https://no-color.org
 */
export function colourEnabled(): boolean {
  if (process.env['NO_COLOR']) return false;

  const force = process.env['FORCE_COLOR'];
  if (force !== undefined) return force !== '0';

  return Boolean(process.stdout.isTTY);
}

/** Style for a human, plain for everything else. */
function paint(style: Style, text: string): string {
  if (!colourEnabled()) return text;

  try {
    return styleText(style, text);
  } catch {
    // styleText validates its format names; never let presentation break output.
    return text;
  }
}

export const ok = (text: string) => paint(['green', 'bold'], text);
export const bad = (text: string) => paint(['red', 'bold'], text);
export const warn = (text: string) => paint('yellow', text);
export const dim = (text: string) => paint('dim', text);
export const bold = (text: string) => paint('bold', text);
export const cyan = (text: string) => paint('cyan', text);

/**
 * Marks, chosen to read the same without colour.
 *
 * Functions rather than constants: a constant is painted once at module load,
 * which freezes the colour decision before a caller can change it and made
 * `NO_COLOR` set after import have no effect.
 */
export const markOk = () => ok('✔');
export const markFail = () => bad('✖');

export interface Spinner {
  /** Replace the label without restarting the animation. */
  update(label: string): void;
  /** Stop and erase. Safe to call when never started. */
  stop(): void;
}

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const FRAME_MS = 80;

/**
 * A spinner on stderr, or nothing at all.
 *
 * Returns an inert handle when stderr is not a TTY, so callers need no branch
 * and a redirected run emits no control characters. Validation of a large glob
 * is slow enough that silence reads as a hang.
 */
export function startSpinner(label: string): Spinner {
  // Also silent when colour is off: a caller that asked for plain output did not
  // ask for control characters on another stream either.
  if (!process.stderr.isTTY || !colourEnabled()) {
    return { update: () => undefined, stop: () => undefined };
  }

  let current = label;
  let frame = 0;

  const render = () => {
    const glyph = paint('cyan', FRAMES[frame % FRAMES.length]);
    process.stderr.write(`\r[2K${glyph} ${current}`);
    frame++;
  };

  render();
  const timer = setInterval(render, FRAME_MS);
  // Never hold the process open for an animation.
  timer.unref?.();

  return {
    update(next: string) {
      current = next;
    },
    stop() {
      clearInterval(timer);
      process.stderr.write('\r[2K');
    },
  };
}

/** `3 files` / `1 file`, so counts read naturally. */
export function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/** A rule the width of the terminal, for separating report sections. */
export function rule(): string {
  const width = Math.min(process.stdout.columns ?? 60, 72);
  return dim('─'.repeat(width));
}
