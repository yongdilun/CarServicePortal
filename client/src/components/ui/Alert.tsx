import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant: 'success' | 'danger' | 'warning' | 'info';
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant,
  className = '',
  dismissible = false,
  onDismiss,
  icon,
}) => {
  const variantClasses = {
    success: 'bg-green-50 border-green-500 text-green-800',
    danger: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-500',
    danger: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`p-4 border-l-4 rounded-md ${variantClasses[variant]} ${className}`} role="alert">
      <div className="flex">
        {icon && (
          <div className={`flex-shrink-0 mr-3 ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 ${
              variant === 'success' ? 'text-green-500 hover:bg-green-100' :
              variant === 'danger' ? 'text-red-500 hover:bg-red-100' :
              variant === 'warning' ? 'text-yellow-500 hover:bg-yellow-100' :
              'text-blue-500 hover:bg-blue-100'
            } focus:outline-none`}
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
