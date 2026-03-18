import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="base-modal-overlay" onClick={onClose}>
      <div className="base-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="base-modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        {title && <h2 className="text-2xl font-display font-bold text-[#5D0000] mb-6">{title}</h2>}
        <div className="base-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
