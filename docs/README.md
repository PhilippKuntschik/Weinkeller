# Weinkeller Design System Documentation

This directory contains the documentation for the Weinkeller design system. The design system provides a set of reusable components, styles, and guidelines to ensure consistency across the application.

## Getting Started

Start by reading the [design-system.md](./design-system.md) file, which provides an overview of the design system, including design principles, color system, typography, spacing, and component usage guidelines.

## Directory Structure

```
docs/
├── README.md                # This file
├── design-system.md         # Overview of the design system
└── components/              # Documentation for individual components
    ├── button.md            # Button component documentation
    ├── page-header.md       # PageHeader component documentation
    └── ...                  # Other component documentation
```

## Component Documentation

Each component has its own documentation file in the `components/` directory. The documentation includes:

- Component description
- Import statement
- Props
- Usage examples
- Styling information
- Responsive behavior
- Usage guidelines
- Accessibility considerations
- Examples in context

## Using the Design System

To use the design system in your code:

1. Import the components you need from the appropriate location:
   ```jsx
   // For basic UI components
   import { Button, Input, Select } from '../components/ui';
   
   // For common components
   import { PageHeader, ContentCard, FormSection } from '../components/common';
   ```

2. Use the components according to the guidelines in the documentation:
   ```jsx
   <div className="page">
     <PageHeader title="Add Wine" />
     
     <ContentCard>
       <form onSubmit={handleSubmit}>
         <FormSection title="Basic Information">
           <div className="form-row">
             <div className="form-col">
               <Input
                 label="Wine Name"
                 name="name"
                 value={formData.name}
                 onChange={handleChange}
                 required
               />
             </div>
           </div>
         </FormSection>
         
         <div className="form-actions">
           <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
           <Button variant="primary" type="submit">Save</Button>
         </div>
       </form>
     </ContentCard>
   </div>
   ```

## Contributing to the Design System

When adding new components or modifying existing ones, please follow these guidelines:

1. **Consistency**: Ensure that new components follow the same patterns and styles as existing components.
2. **Documentation**: Update or create documentation for any components you add or modify.
3. **Accessibility**: Ensure that all components are accessible.
4. **Responsiveness**: Ensure that all components work well on all screen sizes.
5. **Testing**: Test components across different browsers and devices.

### Adding a New Component

1. Create the component in the appropriate directory (`components/ui/` for basic UI components, `components/common/` for common components).
2. Add the component to the appropriate index.js file.
3. Create a documentation file in the `docs/components/` directory.
4. Update the design-system.md file to include the new component.

### Modifying an Existing Component

1. Make the necessary changes to the component.
2. Update the documentation to reflect the changes.
3. If the changes affect other components, update their documentation as well.

## Design Principles

Remember to follow these design principles when working with the design system:

- **Consistency**: Use consistent patterns and components across the application
- **Simplicity**: Keep the UI simple and intuitive
- **Accessibility**: Ensure the UI is accessible to all users
- **Responsiveness**: Design for all screen sizes
- **Reusability**: Create reusable components to reduce duplication

## Questions and Support

If you have questions about the design system or need help using it, please contact the design system team.
