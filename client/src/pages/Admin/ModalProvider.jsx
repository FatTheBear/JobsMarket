import React, { createContext, useState, useCallback } from 'react';
import './Modal.css';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  // Alert modal (chỉ có OK)
  const showAlert = useCallback((message, type = 'info') => {
    return new Promise((resolve) => {
      setModal({
        type: 'alert',
        alertType: type, // 'success' | 'error' | 'info' | 'warning'
        message,
        onConfirm: () => {
          setModal(null);
          resolve(true);
        },
      });
    });
  }, []);

  // Confirm modal (có OK + Cancel)
  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setModal({
        type: 'confirm',
        message,
        onConfirm: () => {
          setModal(null);
          resolve(true);
        },
        onCancel: () => {
          setModal(null);
          resolve(false);
        },
      });
    });
  }, []);

  const iconMap = {
    success: (
      <div className="modal-icon modal-icon--success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    error: (
      <div className="modal-icon modal-icon--error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
    warning: (
      <div className="modal-icon modal-icon--warning">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
    ),
    info: (
      <div className="modal-icon modal-icon--info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    confirm: (
      <div className="modal-icon modal-icon--confirm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
  };

  const titleMap = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    confirm: 'Confirm',
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {modal && (
        <div className="modal-overlay" onClick={modal.type === 'alert' ? modal.onConfirm : modal.onCancel}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {/* Icon */}
            {modal.type === 'confirm' ? iconMap.confirm : iconMap[modal.alertType || 'info']}

            {/* Title */}
            <h3 className="modal-title">
              {modal.type === 'confirm' ? titleMap.confirm : titleMap[modal.alertType || 'info']}
            </h3>

            {/* Message */}
            <p className="modal-message">{modal.message}</p>

            {/* Buttons */}
            <div className="modal-actions">
              {modal.type === 'confirm' && (
                <button className="modal-btn modal-btn--cancel" onClick={modal.onCancel}>
                  Hủy
                </button>
              )}
              <button className="modal-btn modal-btn--confirm" onClick={modal.onConfirm}>
                {modal.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};