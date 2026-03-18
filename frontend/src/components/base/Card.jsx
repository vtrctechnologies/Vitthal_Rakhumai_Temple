import React from 'react';

const Card = ({ children, className = '', interactive = false, ...props }) => {
  const interactiveClass = interactive ? 'base-card-interactive' : '';
  
  return (
    <div 
      className={`base-card ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
