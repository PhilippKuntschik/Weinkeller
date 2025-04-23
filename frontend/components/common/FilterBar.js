import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Select } from '../ui';
import './FilterBar.css';

/**
 * FilterBar component for filtering data
 * @param {Object} props - Component props
 * @param {Array} props.filters - Array of filter definitions
 * @param {Object} props.filterValues - Current filter values
 * @param {Function} props.onChange - Change handler for filter values
 * @param {Function} props.onClear - Handler for clearing all filters
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.collapsible - Whether the filter bar can be collapsed
 * @param {boolean} props.defaultCollapsed - Whether the filter bar is collapsed by default
 */
const FilterBar = ({ 
  filters = [], 
  filterValues = {}, 
  onChange,
  onClear,
  className = '',
  collapsible = false,
  defaultCollapsed = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (!filters || filters.length === 0) {
    return null;
  }

  const handleFilterChange = (filterId, value) => {
    if (onChange) {
      onChange({
        ...filterValues,
        [filterId]: value
      });
    }
  };

  const handleClearFilters = () => {
    if (onClear) {
      onClear();
    }
  };

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Render filter input based on type
  const renderFilterInput = (filter) => {
    const value = filterValues[filter.id] !== undefined ? filterValues[filter.id] : filter.defaultValue || '';
    
    switch (filter.type) {
      case 'select':
        return (
          <Select
            id={`filter-${filter.id}`}
            name={filter.id}
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            options={filter.options}
            placeholder={filter.placeholder || 'Select...'}
            disabled={filter.disabled}
            className="filter-select"
          />
        );
        
      case 'multi-select':
        return (
          <Select
            id={`filter-${filter.id}`}
            name={filter.id}
            value={Array.isArray(value) ? value : []}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            options={filter.options}
            placeholder={filter.placeholder || 'Select...'}
            multiple={true}
            disabled={filter.disabled}
            className="filter-select"
          />
        );
        
      case 'checkbox':
        return (
          <input
            id={`filter-${filter.id}`}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
            className="filter-checkbox"
            disabled={filter.disabled}
          />
        );
        
      case 'radio':
        return (
          <div className="filter-radio-group">
            {filter.options.map((option) => (
              <label key={option.value} className="filter-radio-label">
                <input
                  type="radio"
                  name={`filter-${filter.id}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleFilterChange(filter.id, option.value)}
                  className="filter-radio"
                  disabled={filter.disabled}
                />
                {option.label}
              </label>
            ))}
          </div>
        );
        
      case 'range':
        return (
          <div className="filter-range">
            <input
              id={`filter-${filter.id}-min`}
              type="number"
              value={value.min || filter.min || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, min: e.target.value })}
              className="filter-range-input"
              min={filter.min}
              max={filter.max}
              placeholder={filter.minPlaceholder || 'Min'}
              disabled={filter.disabled}
            />
            <span className="filter-range-separator">-</span>
            <input
              id={`filter-${filter.id}-max`}
              type="number"
              value={value.max || filter.max || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, max: e.target.value })}
              className="filter-range-input"
              min={filter.min}
              max={filter.max}
              placeholder={filter.maxPlaceholder || 'Max'}
              disabled={filter.disabled}
            />
          </div>
        );
        
      case 'text':
      default:
        return (
          <input
            id={`filter-${filter.id}`}
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-input"
            placeholder={filter.placeholder}
            disabled={filter.disabled}
          />
        );
    }
  };

  return (
    <div className={`filter-bar ${className} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="filter-bar-header">
        <h3 className="filter-bar-title">Filters</h3>
        
        <div className="filter-bar-actions">
          <button 
            type="button" 
            className="filter-bar-clear" 
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
          
          {collapsible && (
            <button 
              type="button" 
              className="filter-bar-toggle" 
              onClick={toggleCollapse}
            >
              {isCollapsed ? 'Show Filters' : 'Hide Filters'}
            </button>
          )}
        </div>
      </div>
      
      <div className="filter-bar-content">
        <div className="filter-grid">
          {filters.map((filter) => (
            <div key={filter.id} className={`filter-item ${filter.fullWidth ? 'filter-item-full' : ''}`}>
              <label htmlFor={`filter-${filter.id}`} className="filter-label">
                {filter.label}
              </label>
              {renderFilterInput(filter)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'select', 'multi-select', 'checkbox', 'radio', 'range']),
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).isRequired,
          label: PropTypes.string.isRequired
        })
      ),
      defaultValue: PropTypes.any,
      placeholder: PropTypes.string,
      min: PropTypes.number,
      max: PropTypes.number,
      minPlaceholder: PropTypes.string,
      maxPlaceholder: PropTypes.string,
      disabled: PropTypes.bool,
      fullWidth: PropTypes.bool
    })
  ).isRequired,
  filterValues: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  className: PropTypes.string,
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool
};

export default FilterBar;
