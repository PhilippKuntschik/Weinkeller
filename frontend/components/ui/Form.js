import React from 'react';
import { useForm } from 'react-hook-form';
import Button from './Button';
import './Form.css';

/**
 * Reusable Form component with react-hook-form integration
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Object} props.defaultValues - Default form values
 * @param {Object} props.validationRules - Form validation rules
 * @param {React.ReactNode} props.children - Form content (inputs, selects, etc.)
 * @param {string} props.submitText - Text for the submit button
 * @param {boolean} props.loading - Whether the form is in a loading state
 */
function Form({
  onSubmit,
  defaultValues = {},
  validationRules = {},
  children,
  submitText = 'Submit',
  loading = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues,
  });

  // Function to handle form submission
  const submitHandler = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Clone children and pass register, errors, and control props
  const formChildren = React.Children.map(children, (child) => {
    // Skip if child is not a valid element
    if (!React.isValidElement(child)) return child;

    // Get validation rules for this field
    const fieldName = child.props.name;
    const fieldRules = validationRules[fieldName] || {};

    // Clone the child with additional props
    return React.cloneElement(child, {
      ...child.props,
      register: register,
      error: errors[fieldName]?.message,
      control: control,
      ...register(fieldName, fieldRules),
    });
  });

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="form">
      {formChildren}
      <div className="form-actions">
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
        >
          {loading ? 'Loading...' : submitText}
        </Button>
      </div>
    </form>
  );
}

export default Form;
