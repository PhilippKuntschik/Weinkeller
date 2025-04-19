# Frontend Styles

This directory contains all the CSS files for styling the Weinkeller application. The styling approach uses standard CSS with a structured organization to ensure consistency and maintainability.

## Styling Architecture

The application uses a combination of:

1. **Global Styles**: Base styles that apply to the entire application
2. **Component-Specific Styles**: Styles that are scoped to specific components
3. **View-Specific Styles**: Styles that are specific to individual views/pages
4. **CSS Variables**: For consistent theming and easy customization

## Directory Structure

```
styles/
├── global.css         # Global styles and CSS reset
├── variables.css      # CSS variables for colors, spacing, etc.
├── navbar.css         # Navigation bar styles
├── footer.css         # Footer styles
├── forms.css          # Common form styles
├── allWines.css       # Styles for the AllWines view
├── assessments.css    # Styles for the Assessments view
├── importExport.css   # Styles for the ImportExport view
├── inventoryOverview.css # Styles for the InventoryOverview view
├── producers.css      # Styles for the Producers view
└── wineAnalytics.css  # Styles for the WineAnalytics view
```

## CSS Variables

The `variables.css` file defines global CSS variables for consistent theming:

```css
:root {
  /* Colors */
  --primary-color: #8e2de2;
  --secondary-color: #4a00e0;
  --text-color: #333333;
  --background-color: #f8f9fa;
  --border-color: #e1e1e1;
  --error-color: #dc3545;
  --success-color: #28a745;
  --warning-color: #ffc107;
  
  /* Typography */
  --font-family: 'Roboto', sans-serif;
  --font-size-small: 0.875rem;
  --font-size-normal: 1rem;
  --font-size-large: 1.25rem;
  --font-size-xlarge: 1.5rem;
  --font-size-xxlarge: 2rem;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-xxl: 3rem;
  
  /* Border Radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

## Global Styles

The `global.css` file contains base styles that apply to the entire application:

- CSS reset
- Typography defaults
- Common utility classes
- Layout primitives

## Component-Specific Styles

Component-specific styles are located in the same directory as the component they style. For example:

- `components/ui/Button.css` styles the Button component
- `components/common/PageHeader.css` styles the PageHeader component

## View-Specific Styles

View-specific styles are located in this directory and are named to match their corresponding view:

- `allWines.css` styles the AllWines view
- `inventoryOverview.css` styles the InventoryOverview view

## Naming Conventions

The CSS follows these naming conventions:

- **Classes**: Use kebab-case (e.g., `.data-table`)
- **Component Wrappers**: Named after the component (e.g., `.page-header`)
- **Variants**: Use modifiers with double hyphens (e.g., `.button--primary`)
- **States**: Use state indicators (e.g., `.button--disabled`)

## Responsive Design

The application uses a mobile-first approach to responsive design:

```css
/* Base styles (mobile) */
.container {
  padding: var(--spacing-md);
}

/* Tablet and above */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
}

/* Desktop and above */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-xl);
  }
}
```

## Common Patterns

### Layout

```css
.page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

@media (min-width: 768px) {
  .form-row {
    flex-direction: row;
  }
}
```

### Cards

```css
.card {
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}
```

### Buttons

```css
.button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-normal);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.button:hover {
  background-color: var(--secondary-color);
}

.button--secondary {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}
```

## Best Practices

1. **Use CSS Variables**: For consistent theming and easy customization
2. **Mobile-First Approach**: Start with mobile styles and add media queries for larger screens
3. **Component Scoping**: Keep styles scoped to their components
4. **Avoid Deep Nesting**: Keep CSS selectors simple and flat
5. **Consistent Naming**: Follow the established naming conventions
6. **Reuse Common Patterns**: Use established patterns for common UI elements
7. **Minimize Specificity Issues**: Avoid using `!important` and overly specific selectors
8. **Document Complex Styles**: Add comments to explain complex or non-obvious styles
