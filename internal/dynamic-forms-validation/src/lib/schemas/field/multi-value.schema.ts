import { z } from 'zod';

/** A slider value, as `SliderValue` types it: one number, a range (`number[]`) or dual knobs. */
export const SliderValueSchema = z
  .union([z.number(), z.array(z.number()), z.object({ lower: z.number(), upper: z.number() })])
  .nullable()
  .optional();

/** A datepicker value: an ISO string, or an array of them for multiple and range selection. */
export const DatepickerValueSchema = z
  .union([z.string(), z.array(z.string())])
  .nullable()
  .optional();
