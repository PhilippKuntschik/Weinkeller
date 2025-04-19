import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './EmptyState.css';

/**
 * EmptyState component for displaying empty state messages
 * @param {Object} props - Component props
 * @param {string} props.message - The message to display
 * @param {string} props.actionText - Text for the action button
 * @param {string} props.actionLink - Link for the action button
 * @param {Function} props.actionOnClick - Click handler for the action button
 * @param {React.ReactNode} props.icon - Optional icon to display
 * @param {string} props.className - Additional CSS classes
 */
const EmptyState = ({ 
  message, 
  actionText, 
  actionLink, 
  actionOnClick,
  icon,
  className = '' 
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      
      <p className="empty-state-message">{message}</p>
      
      {actionText && (actionLink || actionOnClick) && (
        <div className="empty-state-action">
          {actionLink ? (
            <Link to={actionLink} className="button button-primary">
              {actionText}
            </Link>
          ) : (
            <button 
              className="button button-primary" 
              onClick={actionOnClick}
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  actionText: PropTypes.string,
  actionLink: PropTypes.string,
  actionOnClick: PropTypes.func,
  icon: PropTypes.node,
  className: PropTypes.string
};

export default EmptyState;
