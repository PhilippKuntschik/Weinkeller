# PageHeader Component

The PageHeader component is used to create consistent page headers across the application. It provides a standardized way to display page titles, optional subtitles, and action buttons.

## Import

```jsx
import { PageHeader } from '../components/common';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | The title of the page (required) |
| `subtitle` | `string` | - | Optional subtitle to display below the title |
| `actions` | `node` | - | Optional actions to display on the right side of the header |
| `backLink` | `string` | - | Optional URL for a back button |
| `backText` | `string` | `'Back'` | Text for the back button (used with backLink) |
| `className` | `string` | - | Additional CSS classes to apply to the header |

## Basic Usage

### Simple Page Header

```jsx
<PageHeader title="All Wines" />
```

### With Subtitle

```jsx
<PageHeader 
  title="All Wines" 
  subtitle="Browse and manage your wine collection" 
/>
```

### With Actions

```jsx
<PageHeader 
  title="All Wines" 
  actions={
    <Button variant="primary">Add Wine</Button>
  }
/>
```

### With Back Link

```jsx
<PageHeader 
  title="Wine Details" 
  backLink="/all-wines"
  backText="Back to All Wines"
/>
```

### Complete Example

```jsx
<PageHeader 
  title="Wine Details" 
  subtitle="View and edit wine information"
  backLink="/all-wines"
  backText="Back to All Wines"
  actions={
    <div className="flex">
      <Button variant="secondary" className="mr-2">Delete</Button>
      <Button variant="primary">Edit</Button>
    </div>
  }
/>
```

## Styling

The PageHeader component uses the following CSS classes:

- `.page-header`: The main container for the header
- `.page-header-content`: Container for the title and subtitle
- `.page-title`: Styles for the page title
- `.page-subtitle`: Styles for the page subtitle
- `.page-header-actions`: Container for the action buttons
- `.page-header-back`: Container for the back button

You can customize the appearance of the PageHeader by overriding these classes in your CSS or by passing a custom className prop.

## Responsive Behavior

The PageHeader component is designed to be responsive:

- On larger screens, the title and actions are displayed side by side
- On smaller screens (below 768px), the actions are displayed below the title
- The title and subtitle will wrap if they are too long for the available space

## Usage Guidelines

- Use the PageHeader component at the top of every page to provide consistent navigation and context
- Keep page titles concise and descriptive
- Use subtitles to provide additional context when necessary
- Place the most important actions in the actions area
- Limit the number of actions to avoid overwhelming the user
- Use the backLink prop for nested pages to provide easy navigation back to the parent page
- Ensure action buttons follow the Button component guidelines for consistency

## Accessibility

- The page title is rendered as an `<h1>` element for proper document structure
- The subtitle is rendered as a `<p>` element with appropriate styling
- The back button includes an arrow icon to visually indicate its purpose
- Action buttons should have descriptive labels
- Ensure sufficient color contrast between the header elements and the background

## Examples in Context

### In a List View

```jsx
<div className="page">
  <PageHeader 
    title="All Wines" 
    actions={
      <Button 
        variant="primary"
        icon={<PlusIcon />}
        onClick={() => navigate('/add-wine')}
      >
        Add Wine
      </Button>
    }
  />
  
  <ContentCard>
    <DataTable 
      columns={columns}
      data={wines}
      // ...
    />
  </ContentCard>
</div>
```

### In a Detail View

```jsx
<div className="page">
  <PageHeader 
    title={wine.name} 
    subtitle={`${wine.producer} · ${wine.year}`}
    backLink="/all-wines"
    backText="Back to All Wines"
    actions={
      <div className="flex">
        <Button 
          variant="secondary" 
          className="mr-2"
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button 
          variant="primary"
          onClick={handleEdit}
        >
          Edit
        </Button>
      </div>
    }
  />
  
  <ContentCard>
    {/* Wine details */}
  </ContentCard>
</div>
```

### In a Form View

```jsx
<div className="page">
  <PageHeader 
    title="Add Wine" 
    backLink="/all-wines"
  />
  
  <ContentCard>
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  </ContentCard>
</div>
