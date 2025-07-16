// src/components/AdminDashboard/components/UI/ConfirmationModal.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          button: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
          accent: 'from-red-500/20 to-red-600/20'
        };
      case 'info':
        return {
          icon: 'text-blue-500',
          button: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
          accent: 'from-blue-500/20 to-blue-600/20'
        };
      case 'warning':
      default:
        return {
          icon: 'text-amber-500',
          button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
          accent: 'from-amber-500/20 to-amber-600/20'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${styles.accent} flex items-center justify-center`}>
            <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2.5 ${styles.button} text-white rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105`}
          >
            {confirmText}
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-75" />
      </div>
    </div>
  );
};

export default ConfirmationModal;