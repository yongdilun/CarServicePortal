import React from 'react';
import { ServiceType } from '../../api/serviceApi';
import { Vehicle } from '../../api/vehicleApi';
import { ServiceOutlet, TimeSlot, AppointmentFormData } from '../../api/appointmentApi';

interface AppointmentConfirmationProps {
  formData: AppointmentFormData;
  selectedService: ServiceType | null;
  selectedVehicle: Vehicle | null;
  selectedOutlet: ServiceOutlet | null;
  selectedTimeSlot: TimeSlot | null;
  selectedDate: string;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  formData,
  selectedService,
  selectedVehicle,
  selectedOutlet,
  selectedTimeSlot,
  selectedDate,
  onConfirm,
  onBack,
  loading
}) => {
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate estimated cost based on service type
  // In a real app, this would come from the backend
  const estimatedCost = selectedService ? 89.99 : 0;
  const estimatedDuration = selectedService ? 60 : 0; // minutes

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Confirm Your Appointment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Service Details</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-2">
              <span className="font-medium">Service:</span> {selectedService?.serviceType || 'N/A'}
            </p>
            <p className="mb-2">
              <span className="font-medium">Category:</span> {selectedService?.serviceCategory || 'N/A'}
            </p>
            <p className="mb-2">
              <span className="font-medium">Description:</span> {selectedService?.serviceDesc || 'N/A'}
            </p>
            <p className="mb-2">
              <span className="font-medium">Estimated Cost:</span> ${estimatedCost.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Estimated Duration:</span> {estimatedDuration} minutes
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Vehicle Information</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-2">
              <span className="font-medium">Vehicle:</span> {selectedVehicle ? `${selectedVehicle.vehYear} ${selectedVehicle.vehBrand} ${selectedVehicle.vehModel}` : 'N/A'}
            </p>
            <p className="mb-2">
              <span className="font-medium">Plate Number:</span> {selectedVehicle?.vehPlateno || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Type:</span> {selectedVehicle?.vehType || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Appointment Time</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-2">
              <span className="font-medium">Date:</span> {formatDate(selectedDate)}
            </p>
            <p>
              <span className="font-medium">Time:</span> {formatTime(selectedTimeSlot?.timeClocktime)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Service Location</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-2">
              <span className="font-medium">Location:</span> {selectedOutlet?.outletName || 'N/A'}
            </p>
            <p className="mb-2">
              <span className="font-medium">Address:</span> {selectedOutlet?.outletAddress || 'N/A'}
            </p>
            <p>
              <span className="font-medium">City:</span> {selectedOutlet?.outletCity || 'N/A'}, {selectedOutlet?.outletState || 'N/A'} {selectedOutlet?.outletPostalCode || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 hover:text-gray-800 font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-all duration-300 shadow hover:shadow-md"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className={`enhanced-blue-btn relative font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline min-w-[180px] transition-all duration-300 ${
            loading ? 'pointer-events-none opacity-90' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </div>
          ) : (
            <span>Confirm Booking</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
