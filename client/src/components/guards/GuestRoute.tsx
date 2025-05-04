import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * A route guard that only allows access to non-authenticated users
 * If a user is already authenticated, they will be redirected to their dashboard
 */
const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // If authenticated, redirect to the appropriate dashboard
  if (isAuthenticated && user) {
    console.log(`Authenticated user accessing guest route, redirecting to ${user.userType} dashboard`);
    return <Navigate to={`/${user.userType}/dashboard`} replace />;
  }

  // If not authenticated, render the children
  return <>{children}</>;
};

export default GuestRoute;
