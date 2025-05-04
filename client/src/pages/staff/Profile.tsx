import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StaffProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not a staff member
  React.useEffect(() => {
    if (!user) {
      navigate('/login/staff');
    } else if (user.userType !== 'staff') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.userType !== 'staff') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  const staff = user;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Staff Profile</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Staff Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Username</p>
                <p className="font-medium">{staff.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Role</p>
                <p className="font-medium">{staff.role}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="font-medium">{staff.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Staff ID</p>
                <p className="font-medium">{staff.id}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <Link
              to="/staff/dashboard"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-center"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/staff/profile/edit"
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
          <div className="space-y-3">
            <Link
              to="/staff/change-password"
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

export default StaffProfile;
