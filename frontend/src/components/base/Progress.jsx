import React from 'react';

const Progress = ({ value = 0, className = '' }) => {
  return (
    <div className={`base-progress ${className}`}>
      <div 
        className="base-progress-value" 
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default Progress;
