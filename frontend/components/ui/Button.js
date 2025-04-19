import React from 'react';
import './Button.css';

/**
 * Button component
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, danger, gold, outline, text)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.fullWidth - Whether the button should take up the full width
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left side of the button
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right side of the button
 * @param {string} props.className - Additional CSS classes
 */
function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  type = 'button',
  disabled = false,
  onClick,
  children,
  leftIcon,
  rightIcon,
  className = '',
  ...rest
}) {
  const classNames = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? 'button--full-width' : '',
    className
  ].filter(Boolean).join(' ');

  // Handle ripple effect on click
  const handleClick = (e) => {
    if (disabled) return;
    
    // Create ripple effect
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    // Remove existing ripples
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }
    
    button.appendChild(circle);
    
    // Call the provided onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={classNames}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      {...rest}
    >
      {leftIcon && <span className="button-icon">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="button-icon button-icon-right">{rightIcon}</span>}
    </button>
  );
}

/**
 * Button Group component for grouping related buttons
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button components
 * @param {string} props.className - Additional CSS classes
 */
export function ButtonGroup({ children, className = '', ...rest }) {
  const classNames = [
    'button-group',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} {...rest}>
      {children}
    </div>
  );
}

export default Button;
