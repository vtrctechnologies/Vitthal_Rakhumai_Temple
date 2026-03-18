import React from 'react';

const Badge = ({ children, variant = 'gold', className = '', ...props }) => {
  const variantClass = variant === 'gold' ? 'base-badge-gold' : 'base-badge-maroon';
  
  return (
    <span 
      className={`base-badge ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
