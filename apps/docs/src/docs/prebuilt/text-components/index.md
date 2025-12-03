Display static or dynamic text content in forms. Text fields are **display-only** - they don't collect user input or contribute to form values.

## Basic Text

Display a paragraph of text:

```typescript
{
  key: 'instructions',
  type: 'text',
  label: 'Please review the terms and conditions before proceeding.',
}
```

## HTML Element Types

Render text as different HTML elements:

```typescript
{
  key: 'pageTitle',
  type: 'text',
  label: 'User Registration',
  props: {
    elementType: 'h1',  // Options: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span'
  },
}
```

**Options**: `'p'` | `'h1'` | `'h2'` | `'h3'` | `'h4'` | `'h5'` | `'h6'` | `'span'`

## With i18n

Text fields support dynamic content via Observables and Signals:

```typescript
{
  key: 'formInstructions',
  type: 'text',
  label: translationService.translate('form.instructions'),  // Observable<string>
  props: {
    elementType: 'p',
  },
}
```

## Styling with CSS Variables

Customize appearance using CSS custom properties:

```css
/* Global text styling */
:root {
  --df-text-font-size: 1rem;
  --df-text-font-family: inherit;
  --df-text-font-weight: normal;
  --df-text-color: inherit;
  --df-text-line-height: 1.5;
  --df-text-text-align: inherit;
  --df-text-letter-spacing: normal;
  --df-text-text-decoration: none;
  --df-text-text-transform: none;
  --df-text-margin: 0;
  --df-text-padding: 0;
}

/* Element-specific styling */
:root {
  --df-text-h1-font-size: 2rem;
  --df-text-h1-font-weight: bold;
  --df-text-h1-margin: 0;

  --df-text-h2-font-size: 1.75rem;
  --df-text-h2-font-weight: bold;
  --df-text-h2-margin: 0;

  --df-text-h3-font-size: 1.5rem;
  --df-text-h3-font-weight: bold;
  --df-text-h3-margin: 0;

  --df-text-h4-font-size: 1.25rem;
  --df-text-h4-font-weight: bold;
  --df-text-h4-margin: 0;

  --df-text-h5-font-size: 1.125rem;
  --df-text-h5-font-weight: bold;
  --df-text-h5-margin: 0;

  --df-text-h6-font-size: 1rem;
  --df-text-h6-font-weight: bold;
  --df-text-h6-margin: 0;

  --df-text-p-font-size: 1rem;
  --df-text-p-margin: 0;

  --df-text-span-display: inline;
}
```

## CSS Classes

Text fields use these classes for styling:

- `.df-text` - Applied to all text fields
- `.df-text-{elementType}` - Element-specific class (e.g., `.df-text-h1`, `.df-text-p`)

## Custom Classes

Add custom classes via the `className` property:

```typescript
{
  key: 'notice',
  type: 'text',
  label: 'Important Notice',
  className: 'my-custom-class highlight-text',
  props: {
    elementType: 'h2',
  },
}
```

## Use Cases

- Form instructions and help text
- Section headings
- Legal disclaimers
- Status messages
- Informational content between form fields
