import React from "react";

export default function SimpleModal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Aviso">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__card">
        {children}
      </div>
    </div>
  );
}
