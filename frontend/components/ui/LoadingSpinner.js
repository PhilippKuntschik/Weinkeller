import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading spinner component
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (small, medium, large)
 * @param {string} props.color - Spinner color
 */
function LoadingSpinner({ size = 'medium', color = 'primary' }) {
  const classNames = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${color}`,
  ].join(' ');

  return (
    <div className={classNames}>
      <div className="loading-spinner__circle"></div>
    </div>
  );
}

export default LoadingSpinner;
