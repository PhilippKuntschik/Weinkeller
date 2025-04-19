import React from 'react';
import PropTypes from 'prop-types';
import './FormSection.css';

/**
 * FormSection component for grouping form fields with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Section content (form fields)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.description - Optional section description
 * @param {boolean} props.collapsible - Whether the section can be collapsed
 * @param {boolean} props.defaultCollapsed - Whether the section is collapsed by default
 * @param {boolean} props.showTitle - Whether to display the section title
 */
const FormSection = ({ 
  title, 
  children, 
  className = '', 
  description,
  collapsible = false,
  defaultCollapsed = false,
  showTitle = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`form-section ${className} ${isCollapsed ? 'collapsed' : ''}`}>
      {showTitle && title && (
        <h3 className="form-section-title">{title}</h3>
      )}
      
      {description && (
        <p className="form-section-description">{description}</p>
      )}
      
      <div className="form-section-content">
        {children}
      </div>
    </div>
  );
};

FormSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  description: PropTypes.string,
  collapsible: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  showTitle: PropTypes.bool
};

export default FormSection;
