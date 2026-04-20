import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`toast show border-0 shadow-lg mb-2 fade-in rounded-4 bg-secondary-subtle`}
            role="alert" 
            aria-live="assertive" 
            aria-atomic="true"
          >
            <div className="toast-body d-flex align-items-center gap-2 p-3">
               <div className={`p-1 rounded-circle bg-${toast.type} bg-opacity-25`}></div>
               <span className="small fw-semibold">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .toast-container {
          pointer-events: none;
        }
        .toast {
          pointer-events: auto;
          min-width: 200px;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
