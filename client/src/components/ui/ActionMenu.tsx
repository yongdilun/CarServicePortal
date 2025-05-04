import React, { useState, useRef, useEffect } from 'react';

export interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: ActionItem[];
  label?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  label = 'Actions',
  icon,
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Simple toggle function
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Button size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs h-7',
    md: 'px-3 py-1.5 text-sm h-9',
    lg: 'px-4 py-2 text-base h-11',
  };

  // Button variant classes
  const variantClasses = {
    primary: 'enhanced-blue-btn text-white hover:text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 hover:text-gray-800',
    outline: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-700',
  };

  // Action color classes
  const actionColorClasses = {
    blue: 'text-blue-600 hover:bg-blue-50',
    green: 'text-green-600 hover:bg-green-50',
    red: 'text-red-600 hover:bg-red-50',
    yellow: 'text-yellow-600 hover:bg-yellow-50',
    purple: 'text-purple-600 hover:bg-purple-50',
    gray: 'text-gray-600 hover:bg-gray-50',
  };

  // Fixed button width based on size
  const buttonWidths = {
    sm: 'w-24 min-w-[6rem]',
    md: 'w-28 min-w-[7rem]',
    lg: 'w-32 min-w-[8rem]',
  };

  return (
    <div className={`inline-block ${className}`} ref={menuRef}>
      {/* Use a popover approach instead of absolute positioning */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          className={`${buttonWidths[size]} inline-flex items-center justify-between rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${sizeClasses[size]} ${variantClasses[variant]}`}
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center">
            {icon && <span className="mr-1.5">{icon}</span>}
            <span className="truncate">{label}</span>
          </span>
          <svg className="ml-1 h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu with overlay for better visibility */}
        {isOpen && (
          <>
            {/* Semi-transparent overlay to make dropdown more visible */}
            <div
              className="fixed inset-0 bg-black bg-opacity-10 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown menu */}
            <div
              className="fixed z-50 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 w-48 animate-fade-in"
            style={{
              // Position the dropdown near the button
              top: buttonRef.current ? (() => {
                const rect = buttonRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const menuHeight = 150; // Approximate height of dropdown menu

                // If there's not enough space below, position above
                if (spaceBelow < menuHeight) {
                  // Position above the button
                  return Math.max(
                    rect.top + window.scrollY - menuHeight,
                    window.scrollY + 10
                  );
                }

                // Otherwise position below the button
                return rect.bottom + window.scrollY + 5;
              })() : 0,
              left: buttonRef.current ? (() => {
                const rect = buttonRef.current.getBoundingClientRect();
                const menuWidth = 192; // 48rem = 192px
                const spaceRight = window.innerWidth - rect.left;

                // If there's not enough space to the right, position to the left
                if (spaceRight < menuWidth) {
                  return Math.max(
                    rect.right + window.scrollX - menuWidth,
                    window.scrollX + 10
                  );
                }

                // Otherwise position aligned with the button's left edge
                return rect.left + window.scrollX;
              })() : 0,
            }}
            role="menu"
            aria-orientation="vertical"
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                  action.disabled
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : action.color
                      ? actionColorClasses[action.color]
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="menuitem"
                disabled={action.disabled}
              >
                {action.icon && <span className="mr-2 flex-shrink-0">{action.icon}</span>}
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionMenu;
