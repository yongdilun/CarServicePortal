import React from 'react';
import StaffLoginForm from '../../components/auth/StaffLoginForm';

const StaffLogin: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Staff Login</h1>
        <StaffLoginForm />
      </div>
    </div>
  );
};

export default StaffLogin;
