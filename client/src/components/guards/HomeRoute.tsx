import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HomeRouteProps {
  children: React.ReactNode;
}

/**
 * A route guard specifically for the home page
 * If a user is already authenticated, they will be redirected to their dashboard
 */
const HomeRoute: React.FC<HomeRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // If authenticated, redirect to the appropriate dashboard
  if (isAuthenticated && user) {
    console.log(`Authenticated user accessing home, redirecting to ${user.userType} dashboard`);
    return <Navigate to={`/${user.userType}/dashboard`} replace />;
  }

  // If not authenticated, render the children
  return <>{children}</>;
};

export default HomeRoute;
