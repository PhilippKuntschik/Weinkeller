import React from 'react';
import PropTypes from 'prop-types';
import './ContentCard.css';

/**
 * ContentCard component for displaying content in a card format
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.actions - Optional actions (buttons, links, etc.)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.noPadding - Whether to remove padding from the card content
 * @param {string} props.variant - Card variant (default, primary, secondary, etc.)
 */
const ContentCard = ({ 
  title, 
  children, 
  actions, 
  className = '', 
  noPadding = false,
  variant = 'default'
}) => {
  return (
    <div className={`content-card content-card-${variant} ${className}`}>
      {title && (
        <div className="content-card-header">
          <h2 className="content-card-title">{title}</h2>
        </div>
      )}
      
      <div className={`content-card-body ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
      
      {actions && (
        <div className="content-card-footer">
          {actions}
        </div>
      )}
    </div>
  );
};

ContentCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  className: PropTypes.string,
  noPadding: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'outline'])
};

export default ContentCard;
