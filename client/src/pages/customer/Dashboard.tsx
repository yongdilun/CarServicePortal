import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  userType: string;
}

const CustomerDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Please log in to view your dashboard.</p>
          <Link to="/login/customer" className="text-blue-500 hover:underline">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 animate-fade-in">Customer Dashboard</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6 transition-all duration-300 hover:shadow-lg animate-fade-in-up">
        <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Welcome, {user.name}!</h2>
        <p className="text-gray-600 mb-2">Email: {user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] animate-fade-in-up animation-delay-300">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2 text-blue-500 animate-pulse-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-semibold">My Vehicles</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage your vehicles for service appointments.</p>
          <div className="flex space-x-4">
            <Link
              to="/customer/vehicles"
              className="enhanced-blue-btn px-4 py-2 rounded transition-all duration-300"
            >
              View Vehicles
            </Link>
            <Link
              to="/customer/vehicles/add"
              className="enhanced-green-btn px-4 py-2 rounded transition-all duration-300"
            >
              Add Vehicle
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] animate-fade-in-up animation-delay-600">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2 text-blue-500 animate-pulse-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Services</h3>
          </div>
          <p className="text-gray-600 mb-4">Browse available services for your vehicles.</p>
          <div className="flex space-x-4">
            <Link
              to="/customer/services"
              className="enhanced-blue-btn px-4 py-2 rounded transition-all duration-300"
            >
              View Services
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] animate-fade-in-up animation-delay-900">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2 text-blue-500 animate-pulse-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold">My Appointments</h3>
          </div>
          <p className="text-gray-600 mb-4">View and manage your service appointments.</p>
          <div className="flex space-x-4">
            <Link
              to="/customer/appointments"
              className="enhanced-blue-btn px-4 py-2 rounded transition-all duration-300"
            >
              View Appointments
            </Link>
            <Link
              to="/customer/appointments/book"
              className="enhanced-green-btn px-4 py-2 rounded transition-all duration-300"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
