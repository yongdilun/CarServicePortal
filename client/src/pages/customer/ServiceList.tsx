import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllServices, ServiceType } from '../../api/serviceApi';

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = ['All', 'Maintenance', 'Repair', 'Inspection', 'Replacement'];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
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

    fetchServices();
  }, []);

  const filteredServices = selectedCategory === '' || selectedCategory === 'All'
    ? services
    : services.filter(service => service.serviceCategory === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Services</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredServices.map(service => (
            <div key={service.serviceId} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{service.serviceType}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {service.serviceCategory}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{service.serviceDesc}</p>
                <div className="mt-4">
                  <Link
                    to={`/customer/appointments/book?serviceId=${service.serviceId}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm inline-block"
                  >
                    Book Appointment
                  </Link>
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

export default ServiceList;
