import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addService } from '../../api/serviceApi';

interface ServiceFormData {
  serviceType: string;
  serviceDesc: string;
  serviceCategory: string;
}

const AddService: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceType: '',
    serviceDesc: '',
    serviceCategory: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Maintenance', 'Repair', 'Inspection', 'Replacement'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      await addService(formData);
      
      navigate('/staff/services');
    } catch (err: any) {
      setError('Failed to add service. ' + (err.response?.data?.error || err.message));
      console.error('Error adding service:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add Service</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceType">
              Service Type*
            </label>
            <input
              id="serviceType"
              name="serviceType"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.serviceType}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceCategory">
              Category*
            </label>
            <select
              id="serviceCategory"
              name="serviceCategory"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.serviceCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceDesc">
              Description*
            </label>
            <textarea
              id="serviceDesc"
              name="serviceDesc"
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.serviceDesc}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Link 
              to="/staff/services" 
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8">
        <Link 
          to="/staff/services" 
          className="text-blue-500 hover:underline"
        >
          &larr; Back to Services
        </Link>
      </div>
    </div>
  );
};

export default AddService;
