import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../../api/staffApi';

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = ['All', 'Maintenance', 'Repair', 'Inspection', 'Replacement'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);

      // Import the staffApi dynamically to avoid circular dependencies
      const { getAllServices } = await import('../../api/staffApi');

      const data = await getAllServices();
      setServices(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load services. ' + (err.response?.data?.error || err.message));
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        // Import the staffApi dynamically to avoid circular dependencies
        const { deleteService } = await import('../../api/staffApi');

        await deleteService(serviceId);
        // Remove the deleted service from the state
        setServices(services.filter(service => service.serviceId !== serviceId));
      } catch (err: any) {
        setError('Failed to delete service. ' + (err.response?.data?.error || err.message));
        console.error('Error deleting service:', err);
      }
    }
  };

  // Make sure we handle both serviceCategory and serviceDesc fields
  const filteredServices = selectedCategory === '' || selectedCategory === 'All'
    ? services
    : services.filter(service =>
        service.serviceCategory === selectedCategory ||
        (service.serviceDesc && service.serviceDesc.includes(selectedCategory))
      );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Management</h1>
        <Link
          to="/staff/services/add"
          className="enhanced-green-btn px-4 py-2 rounded flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Service
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
              className={`px-4 py-2 rounded-full ${
                (category === 'All' && selectedCategory === '') || selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-center">
          <p className="text-gray-600 mb-4">
            No services found in this category.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Service Type</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => (
                <tr key={service.serviceId} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{service.serviceId}</td>
                  <td className="py-3 px-4">{service.serviceType}</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {service.serviceCategory || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{service.serviceDesc || service.serviceDescription || 'No description'}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/staff/services/${service.serviceId}/edit`}
                        className="enhanced-blue-btn px-3 py-1 rounded text-sm flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteService(service.serviceId)}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:text-white px-3 py-1 rounded text-sm flex items-center transition-all duration-300 shadow hover:shadow-md hover:translate-y-[-1px] hover:text-shadow"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <Link
          to="/staff/dashboard"
          className="text-blue-600 hover:text-blue-800 flex items-center transition-all duration-300 hover:translate-x-[-2px] w-fit"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ServiceManagement;
