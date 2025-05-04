import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
  dot = false,
}) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {dot && (
        <span className={`-ml-0.5 mr-1.5 h-2 w-2 rounded-full ${variant === 'primary' ? 'bg-primary-600' : 
          variant === 'secondary' ? 'bg-gray-600' : 
          variant === 'success' ? 'bg-green-600' : 
          variant === 'danger' ? 'bg-red-600' : 
          variant === 'warning' ? 'bg-yellow-600' : 
          'bg-blue-600'}`} 
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
