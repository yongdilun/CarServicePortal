import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      // Redirect to role selection if not logged in
      navigate('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Redirect to role-specific dashboard
      if (parsedUser.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (parsedUser.role === 'LECTURER') {
        navigate('/lecturer/dashboard');
      } else if (parsedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error parsing user data', error);
      localStorage.removeItem('user');
      navigate('/');
    }
  }, [navigate]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Dashboard</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <p className="text-center text-gray-700">
            Redirecting to your role-specific dashboard...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
