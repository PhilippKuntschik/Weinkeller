# Frontend Components

This directory contains all the reusable UI components used throughout the Weinkeller application. The components are organized into a hierarchical structure to promote reusability and maintainability.

## Component Organization

The components are organized into the following structure:

```
components/
├── common/           # Application-specific components
│   ├── ActionButtons.js
│   ├── ContentCard.js
│   ├── DataTable.js
│   ├── EmptyState.js
│   ├── FilterBar.js
│   ├── FormSection.js
│   ├── PageHeader.js
│   └── index.js
├── ui/               # Basic UI components
│   ├── Button.js
│   ├── Form.js
│   ├── Input.js
│   ├── LoadingSpinner.js
│   ├── Select.js
│   └── index.js
├── LanguageSwitcher.js  # Language selection component
└── TagsInput.js      # Tag input component
```

## Component Categories

### UI Components (`/ui`)

These are the most basic building blocks of the UI. They are highly reusable and have minimal dependencies.

- **Button**: Standard button component with different variants (primary, secondary, text)
- **Input**: Text input component with validation support
- **Select**: Dropdown select component
- **Form**: Form container with validation handling
- **LoadingSpinner**: Loading indicator

### Common Components (`/common`)

These components are specific to the Weinkeller application but are used across multiple views.

- **PageHeader**: Consistent header for all pages
- **ContentCard**: Card container for content sections
- **DataTable**: Reusable table component with sorting and pagination
- **FilterBar**: Filter controls for lists
- **FormSection**: Section container for form fields
- **ActionButtons**: Standard action buttons (edit, delete, etc.)
- **EmptyState**: Empty state display for lists

### Standalone Components

- **LanguageSwitcher**: Component for switching between supported languages
- **TagsInput**: Component for entering and managing tags

## Usage Guidelines

### Importing Components

```javascript
// Import UI components
import { Button, Input, Select } from '../components/ui';

// Import common components
import { PageHeader, ContentCard, DataTable } from '../components/common';

// Import standalone components
import LanguageSwitcher from '../components/LanguageSwitcher';
import TagsInput from '../components/TagsInput';
```

### Component Props

All components accept a standard set of props:

- `className`: Additional CSS classes
- `style`: Inline styles
- `children`: Child elements (where applicable)

Component-specific props are documented in the component files.

### Example Usage

```jsx
import { PageHeader } from '../components/common';
import { Button, Input } from '../components/ui';
import TagsInput from '../components/TagsInput';

function AddWine() {
  // Component logic...
  
  return (
    <div className="page">
      <PageHeader title="Add Wine" />
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Input
            label="Wine Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-row">
          <TagsInput
            label="Grape Varieties"
            tags={formData.grapes}
            onChange={handleGrapeChange}
            suggestions={grapeSuggestions}
          />
        </div>
        
        <div className="form-actions">
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button variant="primary" type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}
```

## Styling

Each component has its own CSS file with the same name as the component. For example, `Button.js` has a corresponding `Button.css` file.

The CSS follows these conventions:
- Component wrapper has a class name matching the component name (e.g., `.button`)
- Variants use modifier classes (e.g., `.button--primary`)
- States use state classes (e.g., `.button--disabled`)

## Best Practices

1. **Component Composition**: Compose complex components from simpler ones
2. **Prop Validation**: Use PropTypes to validate component props
3. **Default Props**: Provide sensible defaults for optional props
4. **Controlled Components**: Use controlled components for form elements
5. **Accessibility**: Ensure all components are accessible
6. **Responsive Design**: Design components to work on all screen sizes
7. **Performance**: Optimize components for performance (e.g., using React.memo for pure components)
