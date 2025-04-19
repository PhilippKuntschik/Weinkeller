# Button Component

The Button component is a versatile UI element used for actions and form submissions. It supports various styles, sizes, and states to accommodate different use cases.

## Import

```jsx
import { Button, ButtonGroup } from '../components/ui';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'primary'` | The visual style of the button. Options: `'primary'`, `'secondary'`, `'danger'`, `'success'`, `'warning'`, `'info'`, `'gold'`, `'outline'`, `'text'` |
| `size` | `string` | `'medium'` | The size of the button. Options: `'small'`, `'medium'`, `'large'` |
| `type` | `string` | `'button'` | The HTML button type. Options: `'button'`, `'submit'`, `'reset'` |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `fullWidth` | `boolean` | `false` | Whether the button should take up the full width of its container |
| `onClick` | `function` | - | Function to call when the button is clicked |
| `className` | `string` | - | Additional CSS classes to apply to the button |
| `children` | `node` | - | The content of the button |
| `icon` | `node` | - | Icon to display before the button text |
| `iconRight` | `node` | - | Icon to display after the button text |

## Variants

The Button component supports several variants to convey different meanings and importance levels:

### Primary

The primary button is used for the main action on a page or in a form.

```jsx
<Button variant="primary">Primary Button</Button>
```

### Secondary

The secondary button is used for secondary actions.

```jsx
<Button variant="secondary">Secondary Button</Button>
```

### Danger

The danger button is used for destructive actions like delete or remove.

```jsx
<Button variant="danger">Delete</Button>
```

### Success

The success button is used for positive actions like save or confirm.

```jsx
<Button variant="success">Save</Button>
```

### Warning

The warning button is used for actions that require caution.

```jsx
<Button variant="warning">Warning</Button>
```

### Info

The info button is used for informational actions.

```jsx
<Button variant="info">Info</Button>
```

### Gold

The gold button is used for special or premium actions.

```jsx
<Button variant="gold">Premium</Button>
```

### Outline

The outline button is used for less prominent actions.

```jsx
<Button variant="outline">Outline</Button>
```

### Text

The text button is used for the least prominent actions, often in tight spaces.

```jsx
<Button variant="text">Text Button</Button>
```

## Sizes

The Button component supports three sizes:

### Small

```jsx
<Button size="small">Small Button</Button>
```

### Medium (Default)

```jsx
<Button size="medium">Medium Button</Button>
```

### Large

```jsx
<Button size="large">Large Button</Button>
```

## States

### Disabled

```jsx
<Button disabled>Disabled Button</Button>
```

### Full Width

```jsx
<Button fullWidth>Full Width Button</Button>
```

## With Icons

### Icon Before Text

```jsx
<Button icon={<Icon name="plus" />}>Add Item</Button>
```

### Icon After Text

```jsx
<Button iconRight={<Icon name="arrow-right" />}>Next</Button>
```

### Icon Only

```jsx
<Button aria-label="Add item">
  <Icon name="plus" />
</Button>
```

## Button Group

The ButtonGroup component is used to group related buttons together.

```jsx
<ButtonGroup>
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</ButtonGroup>
```

## Usage Guidelines

- Use the primary variant for the main action on a page or in a form
- Use the secondary variant for secondary actions
- Use the danger variant for destructive actions
- Use the success variant for positive actions
- Use the warning variant for actions that require caution
- Use the info variant for informational actions
- Use the gold variant for special or premium actions
- Use the outline variant for less prominent actions
- Use the text variant for the least prominent actions
- Use the small size for buttons in tight spaces or in tables
- Use the medium size for most buttons
- Use the large size for prominent buttons or call-to-action buttons
- Use the disabled state for buttons that are not currently available
- Use the full width state for buttons that should take up the full width of their container
- Use icons to enhance the meaning of buttons, but make sure they are recognizable and consistent

## Accessibility

- Always provide a descriptive text for buttons
- If a button only contains an icon, use the `aria-label` attribute to provide a text alternative
- Ensure sufficient color contrast between the button text and background
- Make sure buttons are keyboard accessible
- Use the `disabled` attribute for buttons that are not currently available, but consider using a tooltip to explain why
