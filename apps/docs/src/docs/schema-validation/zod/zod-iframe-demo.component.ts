import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'zod-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="zod-schema-validation" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZodIframeDemoComponent {
  code = `import { z } from 'zod';
import { standardSchema } from '@ng-forge/dynamic-forms/schema';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords must match', path: ['confirmPassword'] }
);

const config = {
  schema: standardSchema(passwordSchema),
  fields: [
    { key: 'password', type: 'input', label: 'Password',
      required: true, props: { type: 'password' } },
    { key: 'confirmPassword', type: 'input', label: 'Confirm Password',
      required: true, props: { type: 'password' } },
    { key: 'submit', type: 'submit', label: 'Register' },
  ],
};`;
}
