import React from 'react';
import StaffSignupForm from '../../components/auth/StaffSignupForm';

const StaffSignup: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Staff Registration</h1>
        <StaffSignupForm />
      </div>
    </div>
  );
};

export default StaffSignup;
