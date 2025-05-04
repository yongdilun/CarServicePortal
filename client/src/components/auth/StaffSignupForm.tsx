import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';

const StaffSignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    staffName: '',
    staffRole: '',
    staffPhone: '',
    staffPassword: '',
    confirmPassword: '',
    outletId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loadingOutlets, setLoadingOutlets] = useState(false);
  const navigate = useNavigate();

  // Fetch outlets when component mounts
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        setLoadingOutlets(true);
        const response = await axios.get('/api/public/outlets');
        setOutlets(response.data);
      } catch (err: any) {
        console.error('Error fetching outlets:', err);
        setError('Failed to load service outlets. Please try again later.');
      } finally {
        setLoadingOutlets(false);
      }
    };

    fetchOutlets();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.staffPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    // Validate outlet selection
    if (!formData.outletId) {
      setError('Please select a service outlet');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register/staff', {
        staffName: formData.staffName,
        staffRole: formData.staffRole,
        staffPhone: formData.staffPhone,
        staffPassword: formData.staffPassword,
        outletId: parseInt(formData.outletId)
      });

      // Registration successful, redirect to login
      navigate('/login/staff');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Staff Registration</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="staffName">
            Username
          </label>
          <input
            id="staffName"
            name="staffName"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.staffName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="staffRole">
            Role
          </label>
          <select
            id="staffRole"
            name="staffRole"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.staffRole}
            onChange={handleChange}
            required
          >
            <option value="">Select a role</option>
            <option value="Mechanic">Mechanic</option>
            <option value="Service Advisor">Service Advisor</option>
            <option value="Manager">Manager</option>
            <option value="Receptionist">Receptionist</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="staffPhone">
            Phone Number
          </label>
          <input
            id="staffPhone"
            name="staffPhone"
            type="tel"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.staffPhone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="outletId">
            Service Outlet
          </label>
          <select
            id="outletId"
            name="outletId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.outletId}
            onChange={handleChange}
            required
            disabled={loadingOutlets}
          >
            <option value="">Select a service outlet</option>
            {outlets.map(outlet => (
              <option key={outlet.outletId} value={outlet.outletId}>
                {outlet.outletName} - {outlet.outletCity}, {outlet.outletState}
              </option>
            ))}
          </select>
          {loadingOutlets && (
            <p className="text-sm text-gray-500 mt-1">Loading outlets...</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="staffPassword">
            Password
          </label>
          <input
            id="staffPassword"
            name="staffPassword"
            type="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.staffPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p>Already have an account? <Link to="/login/staff" className="text-blue-500 hover:text-blue-700">Login</Link></p>
      </div>
    </div>
  );
};

export default StaffSignupForm;
