// src/components/AdminDashboard/components/UI/Toast.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "relative flex items-center p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transform transition-all duration-300 ease-out min-w-[350px] max-w-md";
    
    const visibilityStyles = isVisible && !isExiting 
      ? "translate-x-0 opacity-100 scale-100" 
      : "translate-x-full opacity-0 scale-95";

    switch (toast.type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-gradient-to-r from-emerald-500/90 to-green-500/90 border-emerald-300/50 text-white`;
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-gradient-to-r from-red-500/90 to-pink-500/90 border-red-300/50 text-white`;
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-300/50 text-white`;
      case 'info':
      default:
        return `${baseStyles} ${visibilityStyles} bg-gradient-to-r from-blue-500/90 to-indigo-500/90 border-blue-300/50 text-white`;
    }
  };

  const getIcon = () => {
    const iconStyles = "w-6 h-6 flex-shrink-0";
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={iconStyles} />;
      case 'error':
        return <XCircle className={iconStyles} />;
      case 'warning':
        return <AlertCircle className={iconStyles} />;
      case 'info':
      default:
        return <Info className={iconStyles} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white/80 rounded-full animate-[shrink_5s_linear_forwards]"
          style={{
            animation: toast.duration > 0 ? `shrink ${toast.duration}ms linear forwards` : 'none'
          }}
        />
      </div>

      {/* Content */}
      <div className="flex items-center space-x-3 flex-1">
        {getIcon()}
        <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Decorative elements */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-75" />
    </div>
  );
};

// Add the shrink animation to global styles
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;
document.head.appendChild(style);

export default ToastProvider;