import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ActionButtons.css';

/**
 * ActionButtons component for displaying a group of action buttons
 * @param {Object} props - Component props
 * @param {Array} props.actions - Array of action objects
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Button size (small, medium, large)
 * @param {string} props.alignment - Button alignment (left, center, right)
 */
const ActionButtons = ({ 
  actions = [], 
  className = '', 
  size = 'medium',
  alignment = 'right'
}) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className={`action-buttons action-buttons-${alignment} ${className}`}>
      {actions.map((action, index) => {
        const buttonClass = `action-button action-button-${action.variant || 'primary'} action-button-${size}`;
        
        // Render link button if href or to is provided
        if (action.href) {
          return (
            <a 
              key={index}
              href={action.href}
              className={buttonClass}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              title={action.title}
              onClick={action.onClick}
            >
              {action.icon && <span className="action-button-icon">{action.icon}</span>}
              {action.label}
            </a>
          );
        } else if (action.to) {
          return (
            <Link 
              key={index}
              to={action.to}
              className={buttonClass}
              title={action.title}
              onClick={action.onClick}
            >
              {action.icon && <span className="action-button-icon">{action.icon}</span>}
              {action.label}
            </Link>
          );
        }
        
        // Render regular button
        return (
          <button 
            key={index}
            className={buttonClass}
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.title}
            type={action.type || 'button'}
          >
            {action.icon && <span className="action-button-icon">{action.icon}</span>}
            {action.label}
          </button>
        );
      })}
    </div>
  );
};

ActionButtons.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'text']),
      disabled: PropTypes.bool,
      href: PropTypes.string,
      to: PropTypes.string,
      external: PropTypes.bool,
      icon: PropTypes.node,
      title: PropTypes.string,
      type: PropTypes.string
    })
  ).isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  alignment: PropTypes.oneOf(['left', 'center', 'right'])
};

export default ActionButtons;
