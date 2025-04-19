import React, { forwardRef, useState, useEffect, useRef } from 'react';
import './Select.css';

/**
 * Select component
 * @param {Object} props - Component props
 * @param {string} props.label - Select label
 * @param {string} props.id - Select ID
 * @param {string} props.name - Select name
 * @param {Array} props.options - Select options
 * @param {string} props.placeholder - Select placeholder
 * @param {boolean} props.required - Whether the select is required
 * @param {string} props.error - Error message
 * @param {Function} props.onChange - Change handler
 * @param {string|Array} props.value - Select value (string for single, array for multiple)
 * @param {boolean} props.multiple - Whether multiple options can be selected
 * @param {boolean} props.searchable - Whether the select should be searchable
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {string} props.className - Additional CSS classes
 */
const Select = forwardRef(({
  label,
  id,
  name,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  onChange,
  value,
  multiple = false,
  searchable = false,
  disabled = false,
  className = '',
  ...rest
}, ref) => {
  // If using the custom select with search or multiple selection
  if (searchable || multiple) {
    return (
      <CustomSelect
        label={label}
        id={id}
        name={name}
        options={options}
        placeholder={placeholder}
        required={required}
        error={error}
        onChange={onChange}
        value={value}
        multiple={multiple}
        disabled={disabled}
        className={className}
        ref={ref}
        {...rest}
      />
    );
  }
  
  // Standard select element
  return (
    <div className="select-container">
      {label && (
        <label htmlFor={id} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        name={name}
        onChange={onChange}
        value={value || ''}
        className={`select ${error ? 'select--error' : ''} ${className}`}
        required={required}
        disabled={disabled}
        {...rest}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((option) => {
          // If this is a group with nested options
          if (option.options) {
            return (
              <optgroup key={option.label} label={option.label}>
                {option.options.map(nestedOption => (
                  <option key={nestedOption.value} value={nestedOption.value}>
                    {nestedOption.label}
                  </option>
                ))}
              </optgroup>
            );
          }
          
          // Regular option (not a group)
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      {error && <p className="select-error-message">{error}</p>}
    </div>
  );
});

/**
 * Custom Select component with search and multiple selection support
 */
const CustomSelect = forwardRef(({
  label,
  id,
  name,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  onChange,
  value,
  multiple = false,
  disabled = false,
  className = '',
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState(multiple ? [] : null);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Initialize selected options from value prop
  useEffect(() => {
    if (multiple && Array.isArray(value)) {
      setSelectedOptions(value);
    } else if (!multiple && value) {
      // Find the option in the flat or nested structure
      let foundOption = null;
      
      // Search through all options and nested options
      for (const option of options) {
        if (option.options) {
          // Search in nested options
          const nestedOption = option.options.find(opt => opt.value === value);
          if (nestedOption) {
            foundOption = nestedOption;
            break;
          }
        } else if (option.value === value) {
          // Direct match in top-level options
          foundOption = option;
          break;
        }
      }
      
      setSelectedOptions(foundOption || null);
    }
  }, [value, options, multiple]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);
  
  // Filter options based on search term
  const filteredOptions = options.map(option => {
    // If this is a group with nested options
    if (option.options) {
      // Check if the group label matches the search term
      const groupLabelMatches = option.label.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter the nested options
      const filteredNestedOptions = option.options.filter(nestedOption => 
        nestedOption.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Include the group if either the group label matches or there are matching nested options
      if (groupLabelMatches || filteredNestedOptions.length > 0) {
        // If the group label matches, include all nested options
        return {
          ...option,
          options: groupLabelMatches ? option.options : filteredNestedOptions
        };
      }
      return null;
    }
    
    // Regular option (not a group)
    return option.label.toLowerCase().includes(searchTerm.toLowerCase()) ? option : null;
  }).filter(Boolean); // Remove null entries
  
  // Handle option selection
  const handleOptionSelect = (option) => {
    if (disabled) return;
    
    let newValue;
    
    if (multiple) {
      // For multiple select, toggle the selected option
      const isSelected = selectedOptions.some(opt => opt.value === option.value);
      
      if (isSelected) {
        newValue = selectedOptions.filter(opt => opt.value !== option.value);
      } else {
        newValue = [...selectedOptions, option];
      }
      
      setSelectedOptions(newValue);
      
      // Don't close dropdown for multiple select
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else {
      // For single select, set the selected option and close dropdown
      newValue = option;
      setSelectedOptions(option);
      setIsOpen(false);
    }
    
    // Call onChange with the new value
    if (onChange) {
      const event = {
        target: {
          name,
          value: multiple ? newValue.map(opt => opt.value) : newValue.value
        }
      };
      onChange(event);
    }
  };
  
  // Handle removing a tag in multiple select
  const handleRemoveTag = (optionValue, e) => {
    e.stopPropagation();
    
    if (disabled) return;
    
    const newValue = selectedOptions.filter(opt => opt.value !== optionValue);
    setSelectedOptions(newValue);
    
    // Call onChange with the new value
    if (onChange) {
      const event = {
        target: {
          name,
          value: newValue.map(opt => opt.value)
        }
      };
      onChange(event);
    }
  };
  
  // Get display value for the select
  const getDisplayValue = () => {
    if (multiple) {
      return selectedOptions.length > 0 
        ? `${selectedOptions.length} selected` 
        : placeholder;
    } else {
      return selectedOptions ? selectedOptions.label : placeholder;
    }
  };
  
  // Check if an option is selected
  const isOptionSelected = (option) => {
    if (multiple) {
      return selectedOptions.some(opt => opt.value === option.value);
    } else {
      return selectedOptions && selectedOptions.value === option.value;
    }
  };
  
  return (
    <div className="select-container" ref={selectRef}>
      {label && (
        <label htmlFor={id} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      
      <div 
        className={`custom-select ${isOpen ? 'open' : ''} ${error ? 'select--error' : ''} ${className}`}
        ref={ref}
      >
        <div 
          className="custom-select-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={disabled ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
        >
          <span className={selectedOptions ? 'custom-select-value' : 'custom-select-placeholder'}>
            {getDisplayValue()}
          </span>
          <span className="custom-select-arrow">▼</span>
        </div>
        
        {multiple && selectedOptions.length > 0 && (
          <div className="select-tags">
            {selectedOptions.map(option => (
              <span key={option.value} className="select-tag">
                {option.label}
                <span 
                  className="select-tag-remove"
                  onClick={(e) => handleRemoveTag(option.value, e)}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        )}
        
        {isOpen && (
          <div className="custom-select-options">
            <div className="custom-select-search">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => {
                // If this is a group with nested options
                if (option.options) {
                  return (
                    <div key={option.label} className="custom-select-option-group">
                      <div className="custom-select-option-group-label">{option.label}</div>
                      {option.options.map(nestedOption => (
                        <div
                          key={nestedOption.value}
                          className={`custom-select-option custom-select-option-nested ${isOptionSelected(nestedOption) ? 'selected' : ''}`}
                          onClick={() => handleOptionSelect(nestedOption)}
                        >
                          {nestedOption.label}
                        </div>
                      ))}
                    </div>
                  );
                }
                
                // Regular option (not a group)
                return (
                  <div
                    key={option.value}
                    className={`custom-select-option ${isOptionSelected(option) ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.label}
                  </div>
                );
              })
            ) : (
              <div className="custom-select-option">No options found</div>
            )}
          </div>
        )}
      </div>
      
      {error && <p className="select-error-message">{error}</p>}
    </div>
  );
});

// Display names for debugging
Select.displayName = 'Select';
CustomSelect.displayName = 'CustomSelect';

export default Select;
