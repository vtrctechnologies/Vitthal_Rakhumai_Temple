import React from 'react';

export const Input = ({ label, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="base-label">{label}</label>}
      <input className={`base-input ${className}`} {...props} />
    </div>
  );
};

export const Textarea = ({ label, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="base-label">{label}</label>}
      <textarea className={`base-textarea ${className}`} {...props} />
    </div>
  );
};
