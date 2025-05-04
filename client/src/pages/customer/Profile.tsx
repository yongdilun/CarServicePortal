import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CustomerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not a customer
  React.useEffect(() => {
    if (!user) {
      navigate('/login/customer');
    } else if (user.userType !== 'customer') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.userType !== 'customer') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const customer = user;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Username</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Address</p>
                <p className="font-medium">{customer.address}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <Link
              to="/customer/dashboard"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-center"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/customer/profile/edit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
          <div className="space-y-3">
            <Link
              to="/customer/change-password"
              className="block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-center"
            >
              Change Password
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded text-center"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
