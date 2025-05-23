import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  userType: string;
  [key: string]: any; // For other properties
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isStaff: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAccess: (requiredUserType: string) => boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isCustomer: false,
  isStaff: false,
  login: () => {},
  logout: () => {},
  checkAccess: () => false
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const isCustomer = isAuthenticated && user?.userType === 'customer';
  const isStaff = isAuthenticated && user?.userType === 'staff';

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Login function
  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check if the user has access to a specific user type's resources
  const checkAccess = (requiredUserType: string): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.userType === requiredUserType;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isCustomer,
      isStaff,
      login,
      logout,
      checkAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
