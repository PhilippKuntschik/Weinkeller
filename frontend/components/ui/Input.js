import React, { forwardRef, useState } from 'react';
import './Input.css';

/**
 * Reusable Input component
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, number, email, etc.)
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether the input is required
 * @param {string} props.error - Error message
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.value - Input value
 * @param {React.ReactNode} props.icon - Icon to display inside the input
 * @param {boolean} props.floatingLabel - Whether to use floating label style
 * @param {number} props.maxLength - Maximum length of input
 * @param {boolean} props.showCounter - Whether to show character counter
 */
const Input = forwardRef(({
  label,
  type = 'text',
  id,
  name,
  placeholder = ' ',
  required = false,
  error,
  onChange,
  value,
  icon,
  floatingLabel = false,
  maxLength,
  showCounter = false,
  className = '',
  ...rest
}, ref) => {
  const [charCount, setCharCount] = useState(value?.length || 0);
  
  const handleChange = (e) => {
    if (showCounter) {
      setCharCount(e.target.value.length);
    }
    if (onChange) {
      onChange(e);
    }
  };
  
  const isTextarea = type === 'textarea';
  
  const inputClasses = [
    'input',
    error ? 'input--error' : '',
    icon ? 'input-with-icon' : '',
    className
  ].filter(Boolean).join(' ');
  
  const containerClasses = [
    'input-container',
    floatingLabel ? 'input-floating-label' : '',
    showCounter ? 'input-with-counter' : ''
  ].filter(Boolean).join(' ');
  
  const renderInput = () => {
    if (isTextarea) {
      return (
        <textarea
          ref={ref}
          id={id}
          name={name}
          placeholder={placeholder}
          required={required}
          onChange={handleChange}
          value={value}
          className={`${inputClasses} input-textarea`}
          maxLength={maxLength}
          {...rest}
        />
      );
    }
    
    return (
      <input
        ref={ref}
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        onChange={handleChange}
        value={value}
        className={inputClasses}
        maxLength={maxLength}
        {...rest}
      />
    );
  };
  
  return (
    <div className={containerClasses}>
      {renderInput()}
      
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      {icon && <div className="input-icon">{icon}</div>}
      
      {error && <p className="input-error-message">{error}</p>}
      
      {showCounter && maxLength && (
        <div className="input-counter">
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  );
});

/**
 * Input Group component for combining input with buttons or other elements
 */
export const InputGroup = ({ children, className = '', ...rest }) => {
  return (
    <div className={`input-group ${className}`} {...rest}>
      {children}
    </div>
  );
};

/**
 * Input Group Append component for adding elements to the right of an input
 */
export const InputGroupAppend = ({ children, ...rest }) => {
  return (
    <div className="input-group-append" {...rest}>
      {children}
    </div>
  );
};

// Display name for debugging
Input.displayName = 'Input';

export default Input;
