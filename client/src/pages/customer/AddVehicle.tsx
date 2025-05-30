import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface VehicleFormData {
  vehPlateno: string;
  vehModel: string;
  vehBrand: string;
  vehType: string;
  vehYear: number;
}

const AddVehicle: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VehicleFormData>({
    vehPlateno: '',
    vehModel: '',
    vehBrand: '',
    vehType: '',
    vehYear: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'vehYear' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // If user is authenticated, include their ID, otherwise let the backend handle it
      const vehicleData = user ? { ...formData, custId: user.id } : formData;

      await axios.post('/api/customer/vehicles', vehicleData);

      navigate('/customer/vehicles');
    } catch (err: any) {
      setError('Failed to add vehicle. ' + (err.response?.data?.error || err.message));
      console.error('Error adding vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add Vehicle</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehPlateno">
              License Plate Number*
            </label>
            <input
              id="vehPlateno"
              name="vehPlateno"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.vehPlateno}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehBrand">
              Brand*
            </label>
            <input
              id="vehBrand"
              name="vehBrand"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.vehBrand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehModel">
              Model*
            </label>
            <input
              id="vehModel"
              name="vehModel"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.vehModel}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehType">
              Type*
            </label>
            <select
              id="vehType"
              name="vehType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.vehType}
              onChange={handleChange}
              required
            >
              <option value="">Select a type</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Coupe">Coupe</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Convertible">Convertible</option>
              <option value="Wagon">Wagon</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehYear">
              Year*
            </label>
            <input
              id="vehYear"
              name="vehYear"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.vehYear}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/customer/vehicles"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <Link
          to="/customer/vehicles"
          className="text-blue-500 hover:underline"
        >
          &larr; Back to Vehicles
        </Link>
      </div>
    </div>
  );
};

export default AddVehicle;
