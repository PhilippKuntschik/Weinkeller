import React from 'react';
import PropTypes from 'prop-types';
import './PageHeader.css';

/**
 * PageHeader component for consistent page headers across the application
 * @param {Object} props - Component props
 * @param {string} props.title - The page title
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.ReactNode} props.actions - Optional actions (buttons, links, etc.)
 * @param {string} props.className - Additional CSS classes
 */
const PageHeader = ({ title, subtitle, actions, className = '' }) => {
  return (
    <div className={`page-header ${className}`}>
      <div className="page-header-content">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  className: PropTypes.string
};

export default PageHeader;
