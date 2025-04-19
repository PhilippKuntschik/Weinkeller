# Weinkeller Design System

This design system documentation provides guidelines and examples for using the UI components in the Weinkeller application. The design system is built to ensure consistency across the application and improve developer experience.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
   - [Basic UI Components](#basic-ui-components)
   - [Common Components](#common-components)
6. [Usage Guidelines](#usage-guidelines)

## Design Principles

The Weinkeller design system is built on the following principles:

- **Consistency**: Use consistent patterns and components across the application
- **Simplicity**: Keep the UI simple and intuitive
- **Accessibility**: Ensure the UI is accessible to all users
- **Responsiveness**: Design for all screen sizes
- **Reusability**: Create reusable components to reduce duplication

## Color System

The color system is based on a wine-themed palette with primary, accent, and neutral colors. All colors are defined as CSS variables in `variables.css`.

### Primary Colors

- `--color-primary` (#8c1c2c): Medium red wine, used for primary actions and links
- `--color-primary-dark` (#5e0b15): Deep burgundy, used for hover states and headings
- `--color-primary-light` (#b52c3a): Lighter red wine, used for highlights and accents

### Accent Colors

- `--color-accent` (#d4af37): Gold accent, used for highlights and special elements
- `--color-accent-secondary` (#b68d58): Cork brown, used for secondary accents
- `--color-accent-tertiary` (#6b2f68): Purple grape, used for tertiary accents

### Neutral Colors

- `--color-background-dark` (#2c1518): Dark background
- `--color-background-light` (#f8f4f3): Light background
- `--color-text` (#1a1a1a): Text color
- `--color-text-light` (#f8f4f3): Light text color
- `--color-text-muted` (#718096): Muted text color
- `--color-border` (rgba(0, 0, 0, 0.1)): Border color

### UI Colors

- `--color-success` (#4a7c59): Green success, used for success messages and actions
- `--color-error` (#c53030): Red error, used for error messages and destructive actions
- `--color-warning` (#e2a864): Orange warning, used for warning messages
- `--color-info` (#4a6da7): Blue info, used for informational messages

## Typography

The typography system uses a combination of serif and sans-serif fonts to create a sophisticated and readable experience.

### Font Families

- `--font-primary`: 'Montserrat', sans-serif - Used for body text and UI elements
- `--font-heading`: 'Playfair Display', serif - Used for headings and titles

### Font Sizes

- `--text-xs`: 0.75rem (12px) - Used for small text, captions, and labels
- `--text-sm`: 0.875rem (14px) - Used for body text and UI elements
- `--text-md`: 1rem (16px) - Used for body text and UI elements
- `--text-lg`: 1.125rem (18px) - Used for larger body text and subheadings
- `--text-xl`: 1.25rem (20px) - Used for subheadings and card titles
- `--text-2xl`: 1.5rem (24px) - Used for headings
- `--text-3xl`: 1.875rem (30px) - Used for page titles
- `--text-4xl`: 2.25rem (36px) - Used for large headings

## Spacing

The spacing system uses a consistent scale to create a harmonious layout.

- `--space-xs`: 0.25rem (4px) - Used for small gaps and padding
- `--space-sm`: 0.5rem (8px) - Used for small gaps and padding
- `--space-md`: 1rem (16px) - Used for medium gaps and padding
- `--space-lg`: 1.5rem (24px) - Used for large gaps and padding
- `--space-xl`: 2rem (32px) - Used for extra large gaps and padding
- `--space-2xl`: 3rem (48px) - Used for very large gaps and padding

## Components

### Basic UI Components

These are the foundational UI components used throughout the application.

- [Button](./components/button.md) - Used for actions and form submissions
- [Input](./components/input.md) - Used for text input
- [Select](./components/select.md) - Used for selecting from a list of options
- [Form](./components/form.md) - Used for form layouts and validation
- [LoadingSpinner](./components/loading-spinner.md) - Used to indicate loading states
- [TagsInput](./components/tags-input.md) - Used for inputting and managing tags

### Common Components

These are higher-level components built on top of the basic UI components.

- [PageHeader](./components/page-header.md) - Used for page headers with titles and actions
- [ContentCard](./components/content-card.md) - Used for displaying content in a card format
- [FormSection](./components/form-section.md) - Used for grouping form fields with consistent styling
- [EmptyState](./components/empty-state.md) - Used for displaying empty state messages
- [DataTable](./components/data-table.md) - Used for displaying tabular data with sorting
- [ActionButtons](./components/action-buttons.md) - Used for displaying action buttons with consistent styling
- [FilterBar](./components/filter-bar.md) - Used for filtering data with consistent styling

## Usage Guidelines

### When to Use Each Component

- **Button**: Use for actions that users can take, such as submitting a form or navigating to a new page
- **Input**: Use for collecting text input from users
- **Select**: Use for selecting from a list of options
- **Form**: Use for collecting and validating user input
- **LoadingSpinner**: Use to indicate loading states
- **TagsInput**: Use for inputting and managing tags
- **PageHeader**: Use for page headers with titles and actions
- **ContentCard**: Use for displaying content in a card format
- **FormSection**: Use for grouping form fields with consistent styling
- **EmptyState**: Use for displaying empty state messages
- **DataTable**: Use for displaying tabular data with sorting
- **ActionButtons**: Use for displaying action buttons with consistent styling
- **FilterBar**: Use for filtering data with consistent styling

### Component Composition

Components can be composed together to create more complex UIs. For example:

```jsx
<div className="page">
  <PageHeader title="Add Wine" />
  
  <ContentCard>
    <form onSubmit={handleSubmit} className="form">
      <FormSection title="Basic Information">
        {/* Form fields */}
      </FormSection>
      
      <FormSection title="Wine Details">
        {/* Form fields */}
      </FormSection>
      
      <div className="form-actions">
        <ActionButtons
          actions={[
            {
              label: 'Cancel',
              variant: 'secondary',
              onClick: handleCancel
            },
            {
              label: 'Save',
              variant: 'primary',
              type: 'submit'
            }
          ]}
        />
      </div>
    </form>
  </ContentCard>
</div>
```

### Responsive Design

All components are designed to be responsive and work well on all screen sizes. Use the responsive utility classes in `global.css` to adjust layouts for different screen sizes.

### Accessibility

All components are designed with accessibility in mind. Make sure to:

- Use proper ARIA attributes
- Ensure sufficient color contrast
- Provide text alternatives for non-text content
- Make sure all interactive elements are keyboard accessible
