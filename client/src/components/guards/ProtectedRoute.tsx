import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  userType: 'customer' | 'staff';
  children: React.ReactNode;
}

/**
 * A route guard that only allows access to authenticated users with the specified user type
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ userType, children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log(`Not authenticated, redirecting to ${userType} login`);
    // Redirect to the appropriate login page based on the required user type
    return <Navigate to={`/login/${userType}`} state={{ from: location }} replace />;
  }

  // If authenticated but wrong user type, redirect to appropriate dashboard
  if (user.userType !== userType) {
    console.log(`User type mismatch: expected ${userType}, got ${user.userType}`);
    // If they're logged in as a different user type, redirect to their dashboard
    return <Navigate to={`/${user.userType}/dashboard`} replace />;
  }

  // If authenticated and correct user type, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
