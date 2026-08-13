import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { delay } from '@ng-forge/utils';
import { FIELD_REGISTRY, FieldTypeDefinition, FormConfig } from '@ng-forge/dynamic-forms/internal';
import { checkboxFieldMapper, optionsFieldMapper, valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { DynamicForm } from '../../dynamic-form.component';
import { BUILT_IN_FIELDS } from '../../providers/built-in-fields';
import { WEB_MCP_ENABLED, WEB_MCP_SETTINGS } from '../../providers/features/web-mcp/web-mcp.token';

/** Shape of the tool descriptors Angular hands to `navigator.modelContext`. */
interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
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
        { provide: WEB_MCP_SETTINGS, useValue: { allowAsyncValidation: false } },
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
    originalModelContext = (navigator as unknown as Record<string, unknown>)['modelContext'];

    // Vitest runs in real Chromium, so `navigator` is real; stubbing one method
    // is the whole browser-side contract `declareExperimentalWebMcpTool` uses.
    (navigator as unknown as Record<string, unknown>)['modelContext'] = {
      registerTool: (tool: RegisteredTool) => {
        registered.push(tool);
      },
    };
  });

  afterEach(() => {
    (navigator as unknown as Record<string, unknown>)['modelContext'] = originalModelContext;
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

    it('registers an inspect and a submit tool for an opted-in form', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      expect(registered.map((tool) => tool.name)).toEqual(['profile_inspect', 'profile_submit']);
    });

    it('builds the submit tool schema from the config, with labels and enums', async () => {
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

      expect(toolNamed('profile_submit').inputSchema).toEqual({
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

  describe('inspect', () => {
    it('reports current values with no arguments', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name', value: 'Ada' }],
      } as unknown as FormConfig);

      const result = (await toolNamed('profile_inspect').execute({}, {})) as string;

      expect(result).toContain('"name": "Ada"');
      expect(result).toContain('No validation errors.');
    });

    it('reports a required field that is currently empty', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name', validators: [{ type: 'required' }] }],
      } as unknown as FormConfig);

      const result = (await toolNamed('profile_inspect').execute({}, {})) as string;

      expect(result).toContain('Required right now: name');
      expect(result).toContain('Validation errors:');
    });

    it('dry-runs proposed values without touching the live form', async () => {
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name', validators: [{ type: 'required' }] }],
      } as unknown as FormConfig);

      const result = (await toolNamed('profile_inspect').execute({ values: { name: 'Ada' } }, {})) as string;

      expect(result).toContain('"name": "Ada"');
      expect(result).toContain('No validation errors.');

      // The live form must be untouched by a dry run.
      expect(fixture.componentInstance.formValue()).toEqual({ name: '' });
    });

    it('notes that async validation was skipped', async () => {
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        fields: [{ key: 'name', type: 'input', label: 'Name' }],
      } as unknown as FormConfig);

      const result = (await toolNamed('profile_inspect').execute({ values: { name: 'Ada' } }, {})) as string;

      expect(result).toContain('Server-side checks (async and HTTP validators) run on submit.');
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

      const result = (await toolNamed('profile_inspect').execute({}, {})) as string;

      expect(result).toContain('Not currently applicable (do not send these): detail');
    });
  });

  describe('submit', () => {
    it('refuses to submit invalid values and returns the errors', async () => {
      const action = vi.fn();
      await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', label: 'Name', validators: [{ type: 'required' }] }],
      } as unknown as FormConfig);

      const result = (await toolNamed('profile_submit').execute({ name: '' }, {})) as string;

      expect(result).toContain('Form was not submitted because validation failed');
      expect(action).not.toHaveBeenCalled();
    });

    it('applies values and runs the configured submission action', async () => {
      const action = vi.fn();
      const fixture = await mount({
        options: { webMcp: { name: 'profile', description: 'Profile form.' } },
        submission: { action },
        fields: [{ key: 'name', type: 'input', label: 'Name', validators: [{ type: 'required' }] }],
      } as unknown as FormConfig);

      const result = (await toolNamed('profile_submit').execute({ name: 'Ada' }, {})) as string;
      await delay(10);
      fixture.detectChanges();

      expect(result).toBe('Form submitted successfully.');
      expect(fixture.componentInstance.formValue()).toEqual({ name: 'Ada' });
      expect(action).toHaveBeenCalledOnce();
    });
  });
});
