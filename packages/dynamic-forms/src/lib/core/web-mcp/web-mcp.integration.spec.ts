import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { delay } from '@ng-forge/utils';
import { FIELD_REGISTRY, FieldTypeDefinition, FormConfig } from '@ng-forge/dynamic-forms/internal';
import { checkboxFieldMapper, optionsFieldMapper, valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { DynamicForm } from '../../dynamic-form.component';
import { BUILT_IN_FIELDS } from '../../providers/built-in-fields';
import { WEB_MCP_ENABLED } from '../../providers/features/web-mcp/web-mcp.token';

/** Shape of the tool descriptors Angular hands to the model context. */
interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execute: (args: unknown, client: unknown) => unknown;
}

const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
    scope: ['text-input', 'numeric'],
  },
  {
    name: 'checkbox',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-checkbox.harness').then((m) => m.default),
    mapper: checkboxFieldMapper,
    scope: 'boolean',
  },
  {
    name: 'select',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-select.harness').then((m) => m.default),
    mapper: optionsFieldMapper as FieldTypeDefinition['mapper'],
    scope: 'single-select',
  },
];

describe('WebMCP integration', () => {
  let registered: RegisteredTool[];
  let originalModelContext: unknown;

  const toolNamed = (name: string) => {
    const tool = registered.find((candidate) => candidate.name === name);
    if (!tool) throw new Error(`No tool registered as "${name}". Registered: ${registered.map((t) => t.name).join(', ') || '(none)'}`);
    return tool;
  };

  const mount = async (config: FormConfig, providers: unknown[] = []) => {
    TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [
        { provide: WEB_MCP_ENABLED, useValue: true },
        {
          provide: FIELD_REGISTRY,
          useFactory: () => {
            const registry = new Map<string, FieldTypeDefinition>();
            BUILT_IN_FIELDS.forEach((fieldType) => registry.set(fieldType.name, fieldType));
            TEST_FIELD_TYPES.forEach((fieldType) => registry.set(fieldType.name, fieldType));
            return registry;
          },
        },
        ...(providers as never[]),
      ],
    });

    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', config);
    fixture.detectChanges();
    TestBed.flushEffects();

    // The registrar is dynamically imported, so registration lands a tick later.
    await delay(10);
    fixture.detectChanges();
    TestBed.flushEffects();

    return fixture;
  };

  beforeEach(() => {
    registered = [];
    originalModelContext = (document as unknown as Record<string, unknown>)['modelContext'];

    // `document.modelContext` is the current surface; `navigator.modelContext`
    // is deprecated as of Chrome 150. Vitest runs in real Chromium, so stubbing
    // one method is the whole browser-side contract Angular uses.
    (document as unknown as Record<string, unknown>)['modelContext'] = {
      registerTool: (tool: RegisteredTool) => {
        registered.push(tool);
      },
    };
  });

  afterEach(() => {
    (document as unknown as Record<string, unknown>)['modelContext'] = originalModelContext;
    TestBed.resetTestingModule();
  });

  describe('registration', () => {
    it('registers nothing when the config does not opt in', async () => {
      await mount({ fields: [{ key: 'name', type: 'input', label: 'Name' }] } as unknown as FormConfig);

      expect(registered).toHaveLength(0);
    });

    it('registers nothing when the feature is not provided', async () => {
      await mount(
        {
          options: { webMcp: { name: 'profile', description: 'Profile form.' } },
          fields: [{ key: 'name', type: 'input', label: 'Name' }],
        } as unknown as FormConfig,
        [{ provide: WEB_MCP_ENABLED, useValue: false }],
      );

      expect(registered).toHaveLength(0);
    });

    it('registers only a fill tool by default', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      expect(registered.map((tool) => tool.name)).toEqual(['fill_profile']);
    });

    it('registers a submit tool only when the form allows it', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      expect(registered.map((tool) => tool.name)).toEqual(['fill_profile', 'submit_profile']);
    });

    it('flags returned form values as untrusted content', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      expect(toolNamed('fill_profile').annotations).toEqual({ untrustedContentHint: true });
      expect(toolNamed('submit_profile').annotations).toEqual({ untrustedContentHint: true });
    });

    it('builds the tool schema from the config, with labels and enums', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'name', type: 'input', label: 'Full name', validators: [{ type: 'required' }] },
          {
            key: 'status',
            type: 'select',
            label: 'Status',
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Live', value: 'live' },
            ],
          },
        ],
      } as unknown as FormConfig);

      expect(toolNamed('fill_profile').inputSchema).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Full name' },
          status: { type: 'string', title: 'Status', enum: ['draft', 'live'] },
        },
        required: ['name'],
        additionalProperties: false,
      });
    });
  });

  describe('fill', () => {
    it('reports current state without changing anything when called empty', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name', value: 'Ada' }],
      } as unknown as FormConfig);

      const result = (await toolNamed('fill_profile').execute({}, {})) as string;

      expect(result).toContain('No changes made.');
      expect(result).toContain('"name": "Ada"');
      expect(fixture.componentInstance.formValue()).toEqual({ name: 'Ada' });
    });

    it('applies values to the live form', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      const result = (await toolNamed('fill_profile').execute({ name: 'Ada' }, {})) as string;

      expect(result).toContain('Values applied.');
      expect(fixture.componentInstance.formValue()).toEqual({ name: 'Ada' });
    });

    it('leaves untouched fields alone when given a partial patch', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'first', type: 'input', label: 'First', value: 'Ada' },
          { key: 'last', type: 'input', label: 'Last', value: 'Lovelace' },
        ],
      } as unknown as FormConfig);

      await toolNamed('fill_profile').execute({ last: 'Byron' }, {});

      expect(fixture.componentInstance.formValue()).toEqual({ first: 'Ada', last: 'Byron' });
    });

    it('reports live validation errors', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        defaultValidationMessages: { required: 'This field is required' },
        fields: [{ key: 'name', type: 'input', label: 'Name', validators: [{ type: 'required' }] }],
      } as unknown as FormConfig);

      const result = (await toolNamed('fill_profile').execute({}, {})) as string;

      expect(result).toContain('Required right now: name');
      expect(result).toContain('name: This field is required');
    });

    it('evaluates cross-field validators against the values it just applied', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        defaultValidationMessages: { mismatch: 'passwords must match' },
        fields: [
          { key: 'password', type: 'input', label: 'Password', value: 'aaa' },
          {
            key: 'confirm',
            type: 'input',
            label: 'Confirm',
            value: 'aaa',
            validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'mismatch' }],
          },
        ],
      } as unknown as FormConfig);

      // A consistent change must stay valid. Evaluating against anything other
      // than the live form reports a false mismatch here.
      const result = (await toolNamed('fill_profile').execute({ password: 'bbb', confirm: 'bbb' }, {})) as string;

      expect(result).toContain('No validation errors.');
    });

    it('reports a hidden field as not applicable', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'kind', type: 'input', label: 'Kind', value: 'basic' },
          {
            key: 'detail',
            type: 'input',
            label: 'Detail',
            logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'kind', operator: 'equals', value: 'basic' } }],
          },
        ],
      } as unknown as FormConfig);

      const result = (await toolNamed('fill_profile').execute({}, {})) as string;

      expect(result).toContain('Not currently applicable (do not send these): detail');
    });

    it('re-derives applicability from the values it applied', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [
          { key: 'kind', type: 'input', label: 'Kind', value: 'basic' },
          {
            key: 'detail',
            type: 'input',
            label: 'Detail',
            logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'kind', operator: 'equals', value: 'basic' } }],
          },
        ],
      } as unknown as FormConfig);

      const result = (await toolNamed('fill_profile').execute({ kind: 'advanced' }, {})) as string;

      expect(result).not.toContain('Not currently applicable');
    });

    it('never submits', async () => {
      const action = vi.fn();
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      await toolNamed('fill_profile').execute({ name: 'Ada' }, {});
      await delay(10);

      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('refuses invalid values and says the form was still changed', async () => {
      const action = vi.fn();
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        defaultValidationMessages: { required: 'This field is required' },
        fields: [
          { key: 'name', type: 'input', label: 'Name', validators: [{ type: 'required' }] },
          { key: 'nickname', type: 'input', label: 'Nickname' },
        ],
      } as unknown as FormConfig);

      const result = (await toolNamed('submit_profile').execute({ nickname: 'Ada' }, {})) as string;

      expect(result).toContain('Not submitted: validation failed.');
      expect(result).toContain('were applied to the form and are still there');
      expect(action).not.toHaveBeenCalled();
    });

    it('applies values and runs the configured submission action', async () => {
      const action = vi.fn();
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', label: 'Name', validators: [{ type: 'required' }] }],
      } as unknown as FormConfig);

      const result = (await toolNamed('submit_profile').execute({ name: 'Ada' }, {})) as string;
      await delay(10);
      fixture.detectChanges();

      expect(result).toBe('Form submitted successfully.');
      expect(fixture.componentInstance.formValue()).toEqual({ name: 'Ada' });
      expect(action).toHaveBeenCalledOnce();
    });

    it('submits values staged by an earlier fill call', async () => {
      const action = vi.fn();
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.', allowSubmit: true } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', label: 'Name', validators: [{ type: 'required' }] }],
      } as unknown as FormConfig);

      await toolNamed('fill_profile').execute({ name: 'Ada' }, {});
      const result = (await toolNamed('submit_profile').execute({}, {})) as string;
      await delay(10);

      expect(result).toBe('Form submitted successfully.');
      expect(action).toHaveBeenCalledOnce();
    });
  });
});
