# Frontend Views

This directory contains all the page-level components (views) for the Weinkeller application. Each view represents a distinct page or screen in the application.

## Views Overview

The views in this application represent the different pages that users can navigate to. Each view is responsible for:

1. Fetching and managing data from the backend services
2. Handling user interactions and form submissions
3. Composing UI components to create the page layout
4. Managing page-specific state

## Available Views

### Wine Management

- **AllWines.js**: Displays a list of all wines in the collection with filtering and sorting options
- **AddWine.js**: Form for adding a new wine to the collection
- **WineAnalytics.js**: Displays analytics and statistics about the wine collection

### Producer Management

- **AllProducers.js**: Displays a list of all wine producers with filtering and sorting options
- **AddProducer.js**: Form for adding a new wine producer

### Inventory Management

- **InventoryOverview.js**: Displays an overview of the current wine inventory
- **AddToInventory.js**: Form for adding wine to the inventory
- **ConsumeWine.js**: Form for recording wine consumption

### Assessment Management

- **AllAssessments.js**: Displays a list of all wine assessments
- **AssessmentForm.js**: Form for adding or editing a wine assessment

### Data Management

- **ImportExport.js**: Interface for importing and exporting data

## Routing

The views are connected to routes in the main `App.js` file. The routing structure follows a logical organization based on the application's features.

## View Structure

Each view follows a similar structure:

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ContentCard } from '../components/common';
import { Button } from '../components/ui';
import { wineService } from '../services';
import '../styles/allWines.css';

function AllWines() {
  // State management
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  // Data fetching
  useEffect(() => {
    const fetchWines = async () => {
      try {
        setLoading(true);
        const data = await wineService.getAllWines();
        setWines(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWines();
  }, []);
  
  // Event handlers
  const handleAddWine = () => {
    navigate('/wines/add');
  };
  
  // Render
  return (
    <div className="page">
      <PageHeader 
        title="All Wines" 
        actions={<Button onClick={handleAddWine}>Add Wine</Button>}
      />
      
      <ContentCard>
        {/* Page content */}
      </ContentCard>
    </div>
  );
}

export default AllWines;
```

## Data Flow

The typical data flow in a view is:

1. **Data Fetching**: Use `useEffect` to fetch data from services when the component mounts
2. **State Management**: Store fetched data and UI state in React state
3. **User Interaction**: Handle user interactions with event handlers
4. **Data Submission**: Submit user input to services and handle responses
5. **Navigation**: Use the `useNavigate` hook to navigate between views

## Form Handling

Many views contain forms for data entry. The typical form handling pattern is:

1. **Form State**: Use `useState` to manage form state
2. **Change Handlers**: Create handlers for input changes
3. **Validation**: Validate form data before submission
4. **Submission**: Submit form data to services
5. **Feedback**: Provide feedback on submission success or failure

Example:

```jsx
function AddWine() {
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    // Other fields...
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await wineService.createWine(formData);
      navigate('/wines');
    } catch (err) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Styling

Each view has its own CSS file in the `styles` directory with the same name as the view (e.g., `AllWines.js` uses `styles/allWines.css`).

## Best Practices

1. **Separation of Concerns**: Keep data fetching, state management, and rendering logic separate
2. **Error Handling**: Always handle errors from service calls
3. **Loading States**: Show loading indicators during data fetching
4. **Responsive Design**: Ensure views work well on all screen sizes
5. **Component Composition**: Compose views from reusable components
6. **Form Validation**: Validate form data before submission
7. **Navigation**: Use React Router for navigation between views
8. **State Management**: Keep state as local as possible
