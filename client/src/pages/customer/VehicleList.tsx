import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface Vehicle {
  vehId: number;
  vehPlateno: string;
  vehModel: string;
  vehBrand: string;
  vehType: string;
  vehYear: number;
}

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        // If user is authenticated, fetch their vehicles, otherwise fetch all vehicles
        const url = user ? `/api/customer/vehicles?custId=${user.id}` : '/api/customer/vehicles';
        const response = await axios.get(url);
        setVehicles(response.data);
        setError('');
      } catch (err: any) {
        setError('Failed to load vehicles. ' + (err.response?.data?.error || err.message));
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [user]);

  const handleDeleteVehicle = async (vehId: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`/api/customer/vehicles/${vehId}`);
        // Remove the deleted vehicle from the state
        setVehicles(vehicles.filter(vehicle => vehicle.vehId !== vehId));
      } catch (err: any) {
        setError('Failed to delete vehicle. ' + (err.response?.data?.error || err.message));
        console.error('Error deleting vehicle:', err);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Vehicles</h1>
        <Link
          to="/customer/vehicles/add"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Vehicle
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-center">
          <p className="text-gray-600 mb-4">
            You don't have any vehicles registered yet.
          </p>
          <Link
            to="/customer/vehicles/add"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Your First Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {vehicles.map(vehicle => (
            <div key={vehicle.vehId} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{vehicle.vehBrand} {vehicle.vehModel}</h2>
                <div className="text-gray-600 mb-4">
                  <p><span className="font-medium">Plate No:</span> {vehicle.vehPlateno}</p>
                  <p><span className="font-medium">Type:</span> {vehicle.vehType}</p>
                  <p><span className="font-medium">Year:</span> {vehicle.vehYear}</p>
                </div>
                <div className="flex justify-between mt-4">
                  <Link
                    to={`/customer/vehicles/${vehicle.vehId}/edit`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.vehId)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link
          to="/customer/dashboard"
          className="text-blue-500 hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default VehicleList;
