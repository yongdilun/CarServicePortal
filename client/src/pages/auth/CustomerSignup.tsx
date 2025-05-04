import React from 'react';
import CustomerSignupForm from '../../components/auth/CustomerSignupForm';

const CustomerSignup: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Customer Registration</h1>
        <CustomerSignupForm />
      </div>
    </div>
  );
};

export default CustomerSignup;
