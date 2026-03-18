import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  rounded = false,
  ...props 
}) => {
  const variantClass = `base-button-${variant}`;
  const roundedClass = rounded ? 'base-button-rounded' : '';
  
  return (
    <button 
      className={`base-button ${variantClass} ${roundedClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
